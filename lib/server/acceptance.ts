import { canonicalJson, ipEvidence, sha256 } from "../commerce/security";
import { quoteHasStripePrices } from "../commerce/pricing";
import type { ContractTerm } from "../commerce/types";
import type { TimzyEnv } from "./env";
import { buildContractBundle, contractBundleHash } from "./documents";
import { clientData, freezeOrder, quoteForOrder, type DraftContext, type OrderRow } from "./orders";
import { createCheckoutSession } from "./stripe";

export type AcceptanceInput = {
  agreementAndTerms: boolean;
  dataProcessing: boolean;
  authority: boolean;
  annualCommitment?: boolean;
  recurringPayment: boolean;
};

function validAcceptance(value: unknown, term: ContractTerm): AcceptanceInput {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const parsed = { agreementAndTerms: input.agreementAndTerms === true, dataProcessing: input.dataProcessing === true, authority: input.authority === true,
    annualCommitment: input.annualCommitment === true, recurringPayment: input.recurringPayment === true };
  if (!parsed.agreementAndTerms || !parsed.dataProcessing || !parsed.authority || !parsed.recurringPayment || (term === "ANNUAL_12" && !parsed.annualCommitment)) {
    throw new Error("All required statements must be accepted separately");
  }
  return parsed;
}

export async function acceptContract(env: TimzyEnv, request: Request, context: DraftContext, rawAcceptance: unknown): Promise<{ order: OrderRow; documentHash: string }> {
  if (!env.SESSION_SECRET) throw new Error("SESSION_SECRET is not configured");
  if (context.order.status !== "AWAITING_ACCEPTANCE") throw new Error("Order is not ready for acceptance");
  if (!context.order.contract_term) throw new Error("Contract term is missing");
  const acceptance = validAcceptance(rawAcceptance, context.order.contract_term);
  const { quote, catalog } = await quoteForOrder(env.DB, context.order);
  if (quote.fingerprint !== context.order.quote_fingerprint) {
    await env.DB.batch([
      env.DB.prepare("UPDATE orders SET status = 'AWAITING_ACCEPTANCE', quote_fingerprint = ?, acceptance_revision = acceptance_revision + 1, updated_at = ? WHERE id = ?").bind(quote.fingerprint, new Date().toISOString(), context.order.id),
      env.DB.prepare("UPDATE contract_acceptances SET invalidated_at = ?, invalidation_reason = 'CATALOG_CHANGED' WHERE order_id = ? AND invalidated_at IS NULL").bind(new Date().toISOString(), context.order.id),
    ]);
    throw new Error("The offer changed and must be reviewed again");
  }
  if (!catalog.checkoutReady) throw new Error(`Checkout is blocked: ${catalog.blockers.join(", ")}`);
  const client = await clientData(env, context.order);
  if (!client) throw new Error("Customer legal data is unavailable");
  const bundle = await buildContractBundle(env.DB, { orderId: context.order.id, orderNumber: context.order.order_number, quote, catalog, client, generatedAt: context.order.updated_at });
  const documentHash = await contractBundleHash(bundle); const now = new Date().toISOString(); const revision = context.order.acceptance_revision + 1;
  await env.DB.prepare(`INSERT INTO contract_acceptances (id, order_id, revision, accepted_by_name, accepted_by_position, accepted_by_email, authority_confirmed,
    recurring_payment_confirmed, annual_commitment_confirmed, all_documents_confirmed, ip_evidence, user_agent, session_id_hash, language, document_versions_json,
    document_hash, quote_fingerprint, accepted_at) VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(crypto.randomUUID(), context.order.id, revision, client.representativeName, client.representativePosition, client.businessEmail,
      acceptance.annualCommitment ? 1 : 0, await ipEvidence(request, env.SESSION_SECRET),
      (request.headers.get("user-agent") ?? "unknown").slice(0, 500), await sha256(context.token), catalog.language,
      canonicalJson(catalog.documentVersions), documentHash, quote.fingerprint, now).run();
  await env.DB.prepare("UPDATE orders SET acceptance_revision = ?, updated_at = ? WHERE id = ?").bind(revision, now, context.order.id).run();
  const updated = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(context.order.id).first<OrderRow>();
  if (!updated) throw new Error("Order disappeared during acceptance");
  await freezeOrder(env, updated, quote, catalog, bundle, documentHash);
  const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(context.order.id).first<OrderRow>();
  if (!order) throw new Error("Order disappeared after acceptance");
  return { order, documentHash };
}

export async function startCheckout(env: TimzyEnv, context: DraftContext): Promise<{ url: string; order: OrderRow }> {
  if (context.order.status !== "PENDING_PAYMENT") throw new Error("The contract must be accepted before Checkout is created");
  const activeAcceptance = await env.DB.prepare("SELECT revision, quote_fingerprint FROM contract_acceptances WHERE order_id = ? AND invalidated_at IS NULL ORDER BY revision DESC LIMIT 1")
    .bind(context.order.id).first<{ revision: number; quote_fingerprint: string }>();
  if (!activeAcceptance) throw new Error("Active contract acceptance is unavailable");
  const { quote } = await quoteForOrder(env.DB, context.order);
  if (quote.fingerprint !== activeAcceptance.quote_fingerprint || quote.fingerprint !== context.order.quote_fingerprint) {
    const now = new Date().toISOString();
    await env.DB.batch([
      env.DB.prepare("UPDATE contract_acceptances SET invalidated_at = ?, invalidation_reason = 'PRICE_CHANGED_BEFORE_CHECKOUT' WHERE order_id = ? AND invalidated_at IS NULL").bind(now, context.order.id),
      env.DB.prepare("UPDATE orders SET status = 'AWAITING_ACCEPTANCE', acceptance_revision = acceptance_revision + 1, quote_fingerprint = ?, updated_at = ? WHERE id = ?").bind(quote.fingerprint, now, context.order.id),
    ]);
    throw new Error("The price changed after acceptance. Review and accept the documents again");
  }
  if (!quoteHasStripePrices(quote)) throw new Error("Stripe Products and Prices are not fully configured");
  const client = await clientData(env, context.order);
  if (!client) throw new Error("Customer legal data is unavailable");
  const session = await createCheckoutSession({ env, market: quote.market.code, orderId: context.order.id, orderNumber: context.order.order_number, quote, client, acceptanceRevision: activeAcceptance.revision });
  const now = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare("UPDATE orders SET stripe_customer_id = ?, stripe_checkout_session_id = ?, expires_at = ?, updated_at = ? WHERE id = ?")
      .bind(session.customerId, session.id, session.expiresAt, now, context.order.id),
    env.DB.prepare("UPDATE contract_acceptances SET stripe_checkout_session_id = ? WHERE order_id = ? AND revision = ?").bind(session.id, context.order.id, activeAcceptance.revision),
  ]);
  const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(context.order.id).first<OrderRow>();
  if (!order) throw new Error("Order disappeared after Checkout creation");
  return { url: session.url, order };
}
