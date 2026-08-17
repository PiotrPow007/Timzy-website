import { calculateQuote } from "../commerce/pricing";
import { canonicalJson, decryptJson, encryptJson, parseCookies, randomToken, sha256 } from "../commerce/security";
import type { ClientLegalData, CommerceCatalog, CommerceQuote, OrderSelection } from "../commerce/types";
import { parseClientData, parseSelection } from "../commerce/validation";
import type { TimzyEnv } from "./env";
import { loadCatalog } from "./catalog";
import { assertClientMatchesVerification } from "./company-verification";

export const DRAFT_COOKIE = "timzy_contract_draft";

export type OrderRow = {
  id: string; order_number: string; public_token_hash: string; status: string; market_code: "PL" | "UK" | "INTERNATIONAL" | null; language: "pl" | "en" | "es" | null;
  currency: "PLN" | "GBP" | "EUR" | null; contract_term: "ANNUAL_12" | "OPEN_ENDED" | null; registration_country: string | null; billing_country: string | null;
  selection_json: string; client_data_encrypted: string | null; client_data_hash: string | null; immutable_snapshot_json: string | null; quote_fingerprint: string | null;
  monthly_net_minor: number | null; one_time_net_minor: number | null; activation_fee_minor: number | null; estimated_tax_minor: number | null;
  final_tax_minor: number | null; final_total_minor: number | null; due_today_minor: number | null; deployment_days: number | null; acceptance_revision: number; stripe_customer_id: string | null;
  stripe_checkout_session_id: string | null; stripe_subscription_id: string | null; stripe_invoice_id: string | null; stripe_payment_intent_id: string | null;
  paid_at: string | null; expires_at: string | null; created_at: string; updated_at: string;
  verification_status: string; company_verification_id: string | null;
};

export type DraftContext = { order: OrderRow; token: string };

function orderNumber() {
  const date = new Date();
  return `TZ-${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function createDraft(db: D1Database): Promise<DraftContext> {
  const id = crypto.randomUUID(); const token = randomToken(); const tokenHash = await sha256(token);
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60_000).toISOString();
  await db.prepare("INSERT INTO orders (id, order_number, public_token_hash, status, expires_at) VALUES (?, ?, ?, 'DRAFT', ?)").bind(id, orderNumber(), tokenHash, expires).run();
  const order = await db.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first<OrderRow>();
  if (!order) throw new Error("Could not create order draft");
  return { order, token };
}

export async function authenticateDraft(db: D1Database, request: Request): Promise<DraftContext | null> {
  const cookie = parseCookies(request)[DRAFT_COOKIE];
  if (!cookie) return null;
  const separator = cookie.indexOf(".");
  if (separator < 1) return null;
  const id = cookie.slice(0, separator); const token = cookie.slice(separator + 1);
  const order = await db.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first<OrderRow>();
  if (!order || order.public_token_hash !== await sha256(token) || (order.expires_at && order.expires_at < new Date().toISOString())) return null;
  return { order, token };
}

export async function clientData(env: TimzyEnv, order: OrderRow): Promise<ClientLegalData | null> {
  if (!order.client_data_encrypted || !env.DATA_ENCRYPTION_KEY) return null;
  return decryptJson<ClientLegalData>(order.client_data_encrypted, env.DATA_ENCRYPTION_KEY);
}

export async function quoteForOrder(db: D1Database, order: OrderRow): Promise<{ quote: CommerceQuote; catalog: CommerceCatalog; selection: OrderSelection }> {
  const selection = parseSelection(JSON.parse(order.selection_json));
  const catalog = await loadCatalog(db, selection.market, selection.language);
  return { selection, catalog, quote: await calculateQuote(catalog, selection) };
}

export async function saveDraft(env: TimzyEnv, context: DraftContext, rawSelection: unknown, rawClient: unknown): Promise<{ order: OrderRow; quote: CommerceQuote; catalog: CommerceCatalog; acceptanceInvalidated: boolean }> {
  if (!["DRAFT", "AWAITING_ACCEPTANCE", "PENDING_PAYMENT", "PAYMENT_FAILED"].includes(context.order.status)) throw new Error("This order can no longer be edited");
  if (!env.DATA_ENCRYPTION_KEY) throw new Error("DATA_ENCRYPTION_KEY is not configured");
  const selection = parseSelection(rawSelection); const client = parseClientData(rawClient);
  if (client.registrationCountry !== selection.registrationCountry || client.billingCountry !== selection.billingCountry || client.communicationLanguage !== selection.language) throw new Error("Company countries and communication language must match the confirmed selection");
  await assertClientMatchesVerification(env, context.order.id, client);
  const catalog = await loadCatalog(env.DB, selection.market, selection.language); const quote = await calculateQuote(catalog, selection);
  const encryptedClient = await encryptJson(client, env.DATA_ENCRYPTION_KEY); const clientHash = await sha256(canonicalJson(client));
  const previousFingerprint = context.order.quote_fingerprint; const acceptanceInvalidated = Boolean((previousFingerprint && previousFingerprint !== quote.fingerprint) || (context.order.client_data_hash && context.order.client_data_hash !== clientHash));
  const revision = context.order.acceptance_revision + (acceptanceInvalidated ? 1 : 0);
  const now = new Date().toISOString();
  const statements = [
    env.DB.prepare(`UPDATE orders SET status = 'AWAITING_ACCEPTANCE', market_code = ?, language = ?, currency = ?, contract_term = ?, registration_country = ?, billing_country = ?,
      selection_json = ?, client_data_encrypted = ?, client_data_hash = ?, quote_fingerprint = ?, monthly_net_minor = ?, one_time_net_minor = ?, activation_fee_minor = ?,
      estimated_tax_minor = NULL, due_today_minor = ?, deployment_days = ?, acceptance_revision = ?, updated_at = ?, stripe_checkout_session_id = NULL
      WHERE id = ?`).bind(selection.market, selection.language, quote.currency, selection.contractTerm, selection.registrationCountry, selection.billingCountry,
      canonicalJson(selection), encryptedClient, clientHash, quote.fingerprint, quote.monthlyNetMinor, quote.oneTimeNetMinor, quote.activationFeeMinor, quote.dueTodayNetMinor,
      quote.deploymentDays, revision, now, context.order.id),
  ];
  if (acceptanceInvalidated) {
    statements.push(env.DB.prepare("UPDATE contract_acceptances SET invalidated_at = ?, invalidation_reason = 'ORDER_CHANGED' WHERE order_id = ? AND invalidated_at IS NULL").bind(now, context.order.id));
    statements.push(env.DB.prepare("INSERT INTO order_changes (id, order_id, revision, changed_fields_json, previous_fingerprint, next_fingerprint) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), context.order.id, revision, canonicalJson({ selection: previousFingerprint !== quote.fingerprint, companyOrRepresentative: context.order.client_data_hash !== clientHash, priceOrDocumentScope: true }), previousFingerprint, quote.fingerprint));
    statements.push(env.DB.prepare("UPDATE verification_signers SET accepted_at=NULL,email_verified_at=NULL,document_hash=NULL,status='NEEDS_REINVITATION',updated_at=? WHERE order_id=? AND signer_role='SECONDARY' AND status='ACCEPTED'").bind(now, context.order.id));
    statements.push(env.DB.prepare("UPDATE second_signer_invites SET revoked_at=? WHERE signer_id IN (SELECT id FROM verification_signers WHERE order_id=? AND signer_role='SECONDARY') AND used_at IS NULL AND revoked_at IS NULL").bind(now, context.order.id));
    statements.push(env.DB.prepare("UPDATE company_verifications SET representative_result='SECOND_SIGNER_REQUIRED',overall_status='SECOND_SIGNER_REQUIRED',reason_code='ORDER_CHANGED_AFTER_SECOND_SIGNER_ACCEPTANCE',updated_at=? WHERE order_id=? AND EXISTS (SELECT 1 FROM verification_signers WHERE order_id=? AND signer_role='SECONDARY' AND status='NEEDS_REINVITATION')").bind(now, context.order.id, context.order.id));
    statements.push(env.DB.prepare("UPDATE orders SET verification_status='SECOND_SIGNER_REQUIRED' WHERE id=? AND EXISTS (SELECT 1 FROM verification_signers WHERE order_id=? AND signer_role='SECONDARY' AND status='NEEDS_REINVITATION')").bind(context.order.id, context.order.id));
  }
  await env.DB.batch(statements);
  const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(context.order.id).first<OrderRow>();
  if (!order) throw new Error("Order disappeared after update");
  return { order, quote, catalog, acceptanceInvalidated };
}

export async function saveSelectionDraft(env: TimzyEnv, context: DraftContext, rawSelection: unknown): Promise<OrderRow> {
  if (!["DRAFT", "AWAITING_ACCEPTANCE", "PENDING_PAYMENT", "PAYMENT_FAILED"].includes(context.order.status)) throw new Error("This order can no longer be edited");
  const selection = parseSelection(rawSelection); const previousSelection = JSON.parse(context.order.selection_json) as Partial<OrderSelection>; const catalog = await loadCatalog(env.DB, selection.market, selection.language); const now = new Date().toISOString();
  const changed = context.order.selection_json !== canonicalJson(selection); const invalidate = changed && ["AWAITING_ACCEPTANCE", "PENDING_PAYMENT", "PAYMENT_FAILED"].includes(context.order.status);
  const companyScopeChanged = previousSelection.market !== selection.market || previousSelection.registrationCountry !== selection.registrationCountry;
  const statements: D1PreparedStatement[] = [env.DB.prepare(`UPDATE orders SET status=?, market_code=?, language=?, currency=?, contract_term=?, registration_country=?, billing_country=?, selection_json=?,
    quote_fingerprint=CASE WHEN ? THEN NULL ELSE quote_fingerprint END, stripe_checkout_session_id=CASE WHEN ? THEN NULL ELSE stripe_checkout_session_id END,
    acceptance_revision=acceptance_revision+?, updated_at=? WHERE id=?`).bind(invalidate ? "DRAFT" : context.order.status, selection.market, selection.language, catalog.market.currency,
    selection.contractTerm, selection.registrationCountry, selection.billingCountry, canonicalJson(selection), invalidate ? 1 : 0, invalidate ? 1 : 0, invalidate ? 1 : 0, now, context.order.id)];
  if (invalidate) statements.push(env.DB.prepare("UPDATE contract_acceptances SET invalidated_at=?, invalidation_reason='SELECTION_CHANGED' WHERE order_id=? AND invalidated_at IS NULL").bind(now, context.order.id));
  if (invalidate && companyScopeChanged) {
    statements.push(env.DB.prepare("UPDATE company_verifications SET overall_status='NOT_STARTED',company_result='NOT_STARTED',representative_result='NOT_STARTED',email_result='NOT_STARTED',reason_code='MARKET_OR_SELECTION_CHANGED',client_confirmed_at=NULL,updated_at=? WHERE order_id=?").bind(now, context.order.id));
    statements.push(env.DB.prepare("UPDATE email_verification_challenges SET invalidated_at=? WHERE order_id=? AND consumed_at IS NULL AND invalidated_at IS NULL").bind(now, context.order.id));
    statements.push(env.DB.prepare("UPDATE orders SET verification_status='NOT_STARTED' WHERE id=?").bind(context.order.id));
  } else if (invalidate) {
    statements.push(env.DB.prepare("UPDATE verification_signers SET accepted_at=NULL,email_verified_at=NULL,document_hash=NULL,status='NEEDS_REINVITATION',updated_at=? WHERE order_id=? AND signer_role='SECONDARY'").bind(now, context.order.id));
    statements.push(env.DB.prepare("UPDATE second_signer_invites SET revoked_at=? WHERE signer_id IN (SELECT id FROM verification_signers WHERE order_id=? AND signer_role='SECONDARY') AND used_at IS NULL AND revoked_at IS NULL").bind(now, context.order.id));
    statements.push(env.DB.prepare("UPDATE company_verifications SET representative_result='SECOND_SIGNER_REQUIRED',overall_status='SECOND_SIGNER_REQUIRED',reason_code='ORDER_CHANGED_AFTER_SECOND_SIGNER_ACCEPTANCE',updated_at=? WHERE order_id=? AND EXISTS (SELECT 1 FROM verification_signers WHERE order_id=? AND signer_role='SECONDARY')").bind(now, context.order.id, context.order.id));
    statements.push(env.DB.prepare("UPDATE orders SET verification_status='SECOND_SIGNER_REQUIRED' WHERE id=? AND EXISTS (SELECT 1 FROM verification_signers WHERE order_id=? AND signer_role='SECONDARY')").bind(context.order.id, context.order.id));
  }
  await env.DB.batch(statements); const order = await env.DB.prepare("SELECT * FROM orders WHERE id=?").bind(context.order.id).first<OrderRow>(); if (!order) throw new Error("Order draft not found"); return order;
}

export async function freezeOrder(env: TimzyEnv, order: OrderRow, quote: CommerceQuote, catalog: CommerceCatalog, documentBundle: unknown, documentHash: string): Promise<void> {
  if (!env.DATA_ENCRYPTION_KEY) throw new Error("DATA_ENCRYPTION_KEY is not configured");
  const now = new Date().toISOString();
  const encryptedDocumentBundle = await encryptJson(documentBundle, env.DATA_ENCRYPTION_KEY);
  const snapshot = canonicalJson({ schemaVersion: 1, capturedAt: now, market: quote.market, language: quote.language, currency: quote.currency, contractTerm: quote.contractTerm,
    quote, documentVersions: catalog.documentVersions, documentHash, encryptedDocumentBundle });
  const snapshotHash = await sha256(snapshot);
  const verificationRetention = new Date(now); verificationRetention.setUTCFullYear(verificationRetention.getUTCFullYear() + 7);
  const statements: D1PreparedStatement[] = [
    env.DB.prepare("DELETE FROM order_items WHERE order_id = ?").bind(order.id),
    env.DB.prepare("DELETE FROM order_price_snapshots WHERE order_id = ?").bind(order.id),
    env.DB.prepare("INSERT INTO order_price_snapshots (id, order_id, snapshot_json, snapshot_hash) VALUES (?, ?, ?, ?)").bind(crypto.randomUUID(), order.id, snapshot, snapshotHash),
    env.DB.prepare("UPDATE orders SET immutable_snapshot_json = ?, status = 'PENDING_PAYMENT', updated_at = ? WHERE id = ?").bind(snapshot, now, order.id),
    env.DB.prepare("UPDATE verification_documents SET retention_until=? WHERE order_id=? AND status='APPROVED'").bind(verificationRetention.toISOString(), order.id),
  ];
  for (const line of quote.lines) statements.push(env.DB.prepare(`INSERT INTO order_items (id, order_id, item_type, catalog_item_id, price_version_id, payment_type, quantity, unit_amount_minor, total_amount_minor, stripe_price_id, snapshot_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(crypto.randomUUID(), order.id, line.itemType, line.catalogItemId, line.priceVersionId, line.paymentType, line.quantity,
    line.unitAmountMinor, line.totalAmountMinor, line.stripePriceId, canonicalJson(line)));
  await env.DB.batch(statements);
}

export function publicOrder(order: OrderRow) {
  return { id: order.id, orderNumber: order.order_number, status: order.status, market: order.market_code, language: order.language, currency: order.currency,
    contractTerm: order.contract_term, monthlyNetMinor: order.monthly_net_minor, oneTimeNetMinor: order.one_time_net_minor, activationFeeMinor: order.activation_fee_minor,
    estimatedTaxMinor: order.estimated_tax_minor, finalTaxMinor: order.final_tax_minor, finalTotalMinor: order.final_total_minor, dueTodayMinor: order.due_today_minor, deploymentDays: order.deployment_days, paidAt: order.paid_at,
    verificationStatus: order.verification_status, checkoutCreated: Boolean(order.stripe_checkout_session_id), updatedAt: order.updated_at };
}
