import { decryptJson, sha256 } from "../commerce/security";
import type { ClientLegalData, MarketCode } from "../commerce/types";
import type { TimzyEnv, TimzyExecutionContext } from "./env";
import { archiveFinalPdf, generateContractPdf, type ContractBundle } from "./documents";
import { queueOrderNotifications, processOrderNotifications, type SendSystemEmail } from "./notifications";
import { marketForBillingCountry } from "../commerce/validation";
import type { OrderRow } from "./orders";
import { processProvisioning, queueProvisioning } from "./provisioning";
import { handledStripeEvents, stripeWebhookSecret, verifyStripeEvent, type StripeEvent } from "./stripe";

function objectString(object: Record<string, unknown>, key: string): string | null { return typeof object[key] === "string" ? object[key] as string : null; }
function nested(object: Record<string, unknown>, ...path: string[]): unknown { let value: unknown = object; for (const key of path) { if (!value || typeof value !== "object") return null; value = (value as Record<string, unknown>)[key]; } return value; }

export function stripePaymentTotals(object: Record<string, unknown>): { taxMinor: number | null; totalMinor: number | null } {
  const directTax = nested(object, "total_details", "amount_tax");
  const taxes = Array.isArray(object.total_taxes) ? object.total_taxes : [];
  const summedTax = taxes.reduce<number>((total, item) => total + (item && typeof item === "object" && typeof (item as Record<string, unknown>).amount === "number" ? Number((item as Record<string, unknown>).amount) : 0), 0);
  const taxMinor = typeof directTax === "number" ? directTax : taxes.length ? summedTax : null;
  const total = typeof object.amount_total === "number" ? object.amount_total : typeof object.total === "number" ? object.total : null;
  return { taxMinor, totalMinor: total };
}

async function findOrder(env: TimzyEnv, event: StripeEvent): Promise<OrderRow | null> {
  const object = event.data.object; const metadata = object.metadata && typeof object.metadata === "object" ? object.metadata as Record<string, unknown> : {};
  const nestedMetadata = nested(object, "parent", "subscription_details", "metadata");
  const orderId = objectString(metadata, "order_id") ?? (nestedMetadata && typeof nestedMetadata === "object" ? objectString(nestedMetadata as Record<string, unknown>, "order_id") : null);
  if (orderId) return env.DB.prepare("SELECT * FROM orders WHERE id=?").bind(orderId).first<OrderRow>();
  const id = object.id; const customer = typeof object.customer === "string" ? object.customer : null; const subscription = typeof object.subscription === "string" ? object.subscription : null;
  return env.DB.prepare(`SELECT * FROM orders WHERE stripe_checkout_session_id=? OR stripe_customer_id=? OR stripe_subscription_id=? OR stripe_invoice_id=? LIMIT 1`)
    .bind(id, customer ?? "", subscription ?? id, id).first<OrderRow>();
}

async function ensureFinalArchive(env: TimzyEnv, order: OrderRow): Promise<void> {
  const existing = await env.DB.prepare("SELECT id FROM contract_documents WHERE order_id=? AND kind='BUNDLE' LIMIT 1").bind(order.id).first();
  if (existing) return;
  if (!env.DATA_ENCRYPTION_KEY || !order.immutable_snapshot_json) throw new Error("Immutable order snapshot is unavailable");
  const snapshot = JSON.parse(order.immutable_snapshot_json) as { encryptedDocumentBundle: string };
  const bundle = await decryptJson<ContractBundle>(snapshot.encryptedDocumentBundle, env.DATA_ENCRYPTION_KEY);
  const pdf = await generateContractPdf(bundle, env.ASSETS); await archiveFinalPdf(env, env.DB, bundle, pdf);
}

async function markPaid(env: TimzyEnv, event: StripeEvent, order: OrderRow, market: MarketCode, ctx: TimzyExecutionContext, sendEmail: SendSystemEmail) {
  const object = event.data.object; const checkoutCountry = nested(object, "customer_details", "address", "country");
  if (event.type.startsWith("checkout.session") && typeof checkoutCountry === "string" && marketForBillingCountry(checkoutCountry) !== market) {
    await env.DB.prepare("UPDATE orders SET status='PAYMENT_FAILED', updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(order.id).run();
    throw new Error("Stripe billing country does not match the accepted market; manual payment review/refund is required");
  }
  const customerId = objectString(object, "customer") ?? order.stripe_customer_id;
  const subscriptionId = objectString(object, "subscription") ?? (event.type.startsWith("customer.subscription") ? object.id : order.stripe_subscription_id);
  const invoiceId = event.type.startsWith("invoice.") ? object.id : objectString(object, "invoice") ?? order.stripe_invoice_id;
  const paymentIntentId = objectString(object, "payment_intent") ?? order.stripe_payment_intent_id;
  const totals = stripePaymentTotals(object);
  await env.DB.prepare(`UPDATE orders SET status=CASE WHEN status IN ('ACTIVE','PROVISIONING') THEN status ELSE 'PAID' END, stripe_customer_id=COALESCE(?,stripe_customer_id),
    stripe_subscription_id=COALESCE(?,stripe_subscription_id), stripe_invoice_id=COALESCE(?,stripe_invoice_id), stripe_payment_intent_id=COALESCE(?,stripe_payment_intent_id),
    final_tax_minor=COALESCE(?,final_tax_minor), final_total_minor=COALESCE(?,final_total_minor), paid_at=COALESCE(paid_at,?), updated_at=? WHERE id=?`)
    .bind(customerId, subscriptionId, invoiceId, paymentIntentId, totals.taxMinor, totals.totalMinor, new Date().toISOString(), new Date().toISOString(), order.id).run();
  const paid = await env.DB.prepare("SELECT * FROM orders WHERE id=?").bind(order.id).first<OrderRow>();
  if (!paid || !paid.client_data_encrypted || !env.DATA_ENCRYPTION_KEY) throw new Error("Paid order data is unavailable");
  await ensureFinalArchive(env, paid); const client = await decryptJson<ClientLegalData>(paid.client_data_encrypted, env.DATA_ENCRYPTION_KEY);
  await Promise.all([queueOrderNotifications(env, paid, client), queueProvisioning(env, paid)]);
  ctx.waitUntil(processOrderNotifications(env, paid.id, sendEmail));
  ctx.waitUntil(processProvisioning(env, paid.id));
}

export function stripeEventReplayDecision(existing: { processingStatus: string; payloadHash: string } | null, payloadHash: string): "DUPLICATE" | "RETRY" {
  if (!existing || existing.payloadHash !== payloadHash) throw new Error("Stripe event ID was reused with a different payload");
  return existing.processingStatus === "FAILED" ? "RETRY" : "DUPLICATE";
}

async function processEvent(env: TimzyEnv, event: StripeEvent, market: MarketCode, ctx: TimzyExecutionContext, sendEmail: SendSystemEmail) {
  if (!handledStripeEvents.has(event.type)) return "IGNORED";
  const order = await findOrder(env, event); if (!order) throw new Error("Stripe event cannot be reconciled to an order");
  if (order.market_code !== market) throw new Error("Stripe account market does not match the accepted order market");
  const object = event.data.object;
  if (event.type === "checkout.session.completed") {
    if (objectString(object, "payment_status") === "paid") await markPaid(env, event, order, market, ctx, sendEmail);
  } else if (event.type === "checkout.session.async_payment_succeeded" || event.type === "invoice.paid") {
    await markPaid(env, event, order, market, ctx, sendEmail);
  } else if (event.type === "checkout.session.async_payment_failed" || event.type === "invoice.payment_failed") {
    await env.DB.prepare("UPDATE orders SET status='PAYMENT_FAILED', updated_at=CURRENT_TIMESTAMP WHERE id=? AND status NOT IN ('CANCELLED','EXPIRED')").bind(order.id).run();
  } else if (event.type === "customer.subscription.updated") {
    await env.DB.prepare("UPDATE orders SET stripe_subscription_id=?, updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(object.id, order.id).run();
  } else if (event.type === "customer.subscription.deleted") {
    await env.DB.prepare("UPDATE orders SET status='CANCELLED', stripe_subscription_id=?, updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(object.id, order.id).run();
  } else if (event.type === "checkout.session.expired") {
    await env.DB.prepare("UPDATE orders SET status='EXPIRED', updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='PENDING_PAYMENT'").bind(order.id).run();
  }
  return "PROCESSED";
}

async function persistAndProcessWebhook(env: TimzyEnv, rawBody: string, event: StripeEvent, market: MarketCode, ctx: TimzyExecutionContext, sendEmail: SendSystemEmail): Promise<Response> {
  const inserted = await env.DB.prepare(`INSERT OR IGNORE INTO stripe_events (id, market_code, event_type, object_id, payload_hash, processing_status)
    VALUES (?, ?, ?, ?, ?, 'RECEIVED')`).bind(event.id, market, event.type, event.data.object.id, await sha256(rawBody)).run();
  if ((inserted.meta.changes ?? 0) === 0) {
    const existing = await env.DB.prepare("SELECT processing_status, payload_hash FROM stripe_events WHERE id=?").bind(event.id).first<{ processing_status: string; payload_hash: string }>();
    const replay = stripeEventReplayDecision(existing ? { processingStatus: existing.processing_status, payloadHash: existing.payload_hash } : null, await sha256(rawBody));
    if (replay === "DUPLICATE") return Response.json({ received: true, duplicate: true }, { headers: { "cache-control": "no-store" } });
    const claimed = await env.DB.prepare("UPDATE stripe_events SET processing_status='RECEIVED', safe_error=NULL, processed_at=NULL WHERE id=? AND processing_status='FAILED'").bind(event.id).run();
    if ((claimed.meta.changes ?? 0) === 0) return Response.json({ received: true, duplicate: true }, { headers: { "cache-control": "no-store" } });
  }
  try {
    const status = await processEvent(env, event, market, ctx, sendEmail);
    await env.DB.prepare("UPDATE stripe_events SET processing_status=?, processed_at=? WHERE id=?").bind(status, new Date().toISOString(), event.id).run();
    return Response.json({ received: true }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    await env.DB.prepare("UPDATE stripe_events SET processing_status='FAILED', safe_error=?, processed_at=? WHERE id=?")
      .bind((error instanceof Error ? error.message : "Webhook processing failed").slice(0, 300), new Date().toISOString(), event.id).run();
    throw error;
  }
}

export async function handleStripeWebhook(env: TimzyEnv, request: Request, market: MarketCode, ctx: TimzyExecutionContext, sendEmail: SendSystemEmail): Promise<Response> {
  const rawBody = await request.text(); const event = await verifyStripeEvent(rawBody, request.headers.get("stripe-signature"), stripeWebhookSecret(env, market));
  return persistAndProcessWebhook(env, rawBody, event, market, ctx, sendEmail);
}

export async function handleStripeTestWebhook(env: TimzyEnv, request: Request, ctx: TimzyExecutionContext, sendEmail: SendSystemEmail): Promise<Response> {
  if (env.APP_ENV === "production") throw new Error("The shared Stripe test webhook is disabled in production");
  if (!env.STRIPE_TEST_WEBHOOK_SECRET?.startsWith("whsec_")) throw new Error("Stripe test webhook secret is not configured");
  const rawBody = await request.text(); const event = await verifyStripeEvent(rawBody, request.headers.get("stripe-signature"), env.STRIPE_TEST_WEBHOOK_SECRET);
  const order = await findOrder(env, event); const market = order?.market_code;
  if (market !== "PL" && market !== "INTERNATIONAL") throw new Error("Stripe test event cannot be reconciled to a market");
  return persistAndProcessWebhook(env, rawBody, event, market, ctx, sendEmail);
}
