import { canonicalJson, decryptJson, ipEvidence, sha256 } from "../commerce/security";
import { quoteHasStripePrices } from "../commerce/pricing";
import type { ContractTerm } from "../commerce/types";
import type { TimzyEnv } from "./env";
import { buildContractBundle, contractBundleHash } from "./documents";
import { clientData, freezeOrder, quoteForOrder, type DraftContext, type OrderRow } from "./orders";
import { createCheckoutSession } from "./stripe";
import { signingScopeHash, verificationAllowsPayment } from "./company-verification";

export type AcceptanceInput = {
  companyData: boolean;
  agreementAndTerms: boolean;
  dataProcessing: boolean;
  authority: boolean;
  annualCommitment?: boolean;
  recurringPayment: boolean;
  timezone?: string;
};

function validAcceptance(value: unknown, term: ContractTerm): AcceptanceInput {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const parsed = { companyData: input.companyData === true, agreementAndTerms: input.agreementAndTerms === true, dataProcessing: input.dataProcessing === true, authority: input.authority === true,
    annualCommitment: input.annualCommitment === true, recurringPayment: input.recurringPayment === true, timezone: typeof input.timezone === "string" ? input.timezone.slice(0, 80) : "UTC" };
  if (!parsed.companyData || !parsed.agreementAndTerms || !parsed.dataProcessing || !parsed.authority || !parsed.recurringPayment || (term === "ANNUAL_12" && !parsed.annualCommitment)) {
    throw new Error("All required statements must be accepted separately");
  }
  return parsed;
}

function statementTexts(language: "pl" | "en" | "es", term: ContractTerm) {
  const base = {
    pl: ["Potwierdzam, że podane dane firmy są prawidłowe.", "Potwierdzam, że jestem uprawniony do zawarcia umowy w imieniu wskazanej firmy.", "Przeczytałem i akceptuję Umowę oraz Regulamin.", "Akceptuję umowę powierzenia przetwarzania danych.", "Akceptuję zasady cyklicznych płatności."],
    en: ["I confirm that the company details are correct.", "I confirm that I am authorised to enter into the agreement for the stated company.", "I have read and accept the Agreement and Terms.", "I accept the Data Processing Agreement.", "I accept the recurring payment terms."],
    es: ["Confirmo que los datos de la empresa son correctos.", "Confirmo que estoy autorizado para celebrar el contrato en nombre de la empresa indicada.", "He leído y acepto el Contrato y las Condiciones.", "Acepto el acuerdo de tratamiento de datos.", "Acepto las condiciones de pagos recurrentes."],
  }[language];
  if (term === "ANNUAL_12") base.push({ pl: "Potwierdzam minimalny 12-miesięczny okres obowiązywania umowy oraz obowiązek miesięcznych płatności.", en: "I confirm the minimum 12-month term and the obligation to make monthly payments.", es: "Confirmo el plazo mínimo de 12 meses y la obligación de realizar pagos mensuales." }[language]);
  return base;
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
  const verification = await env.DB.prepare("SELECT id,overall_status,raw_snapshot_hash,verification_source,source_retrieved_at,email_result FROM company_verifications WHERE order_id=?").bind(context.order.id)
    .first<{ id: string; overall_status: string; raw_snapshot_hash: string | null; verification_source: string | null; source_retrieved_at: string | null; email_result: string }>();
  if (!verification || !verificationAllowsPayment(verification.overall_status) || verification.email_result !== "VERIFIED" || !verification.raw_snapshot_hash) throw new Error("Company, representation and business email verification must be completed before acceptance");
  const signerRows = await env.DB.prepare("SELECT signer_role,name,position,email_encrypted,accepted_at,document_hash,status FROM verification_signers WHERE order_id=? ORDER BY signer_role").bind(context.order.id)
    .all<{ signer_role: string; name: string; position: string; email_encrypted: string; accepted_at: string | null; document_hash: string | null; status: string }>();
  const secondary = signerRows.results.find((signer) => signer.signer_role === "SECONDARY");
  if (secondary && (secondary.status !== "ACCEPTED" || !secondary.accepted_at || secondary.document_hash !== await signingScopeHash(env.DB, context.order))) throw new Error("The required second signer must accept the current document version before the agreement can be concluded");
  const now = new Date().toISOString(); const statements = statementTexts(catalog.language, context.order.contract_term);
  const acceptedSigners = [{ name: client.representativeName, position: client.representativePosition, email: client.businessEmail, acceptedAt: now }];
  if (secondary?.accepted_at && env.DATA_ENCRYPTION_KEY) acceptedSigners.push({ name: secondary.name, position: secondary.position, email: await decryptJson<string>(secondary.email_encrypted, env.DATA_ENCRYPTION_KEY), acceptedAt: secondary.accepted_at });
  const bundle = await buildContractBundle(env.DB, { orderId: context.order.id, orderNumber: context.order.order_number, quote, catalog, client, generatedAt: now,
    acceptanceEvidence: { acceptedByName: client.representativeName, acceptedByPosition: client.representativePosition, authorityBasis: client.representativeAuthorityBasis,
      confirmedEmail: client.businessEmail, acceptedAt: now, timezone: acceptance.timezone || "UTC", verificationSource: verification.verification_source ?? "UNKNOWN",
      verificationSnapshotHash: verification.raw_snapshot_hash, verificationRetrievedAt: verification.source_retrieved_at, statements, method: "Clickwrap + one-time code sent to the confirmed business email", signers: acceptedSigners } });
  const documentHash = await contractBundleHash(bundle); const revision = context.order.acceptance_revision + 1; const requestIp = await ipEvidence(request, env.SESSION_SECRET); const userAgent = (request.headers.get("user-agent") ?? "unknown").slice(0, 500);
  await env.DB.prepare(`INSERT INTO contract_acceptances (id, order_id, revision, accepted_by_name, accepted_by_position, accepted_by_email, authority_confirmed,
    recurring_payment_confirmed, annual_commitment_confirmed, all_documents_confirmed, ip_evidence, user_agent, session_id_hash, language, document_versions_json,
    document_hash, quote_fingerprint, company_data_confirmed, statements_json, timezone, verification_snapshot_hash, email_verification_method, accepted_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, 1, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, 'ONE_TIME_CODE', ?)`)
    .bind(crypto.randomUUID(), context.order.id, revision, client.representativeName, client.representativePosition, client.businessEmail,
      acceptance.annualCommitment ? 1 : 0, requestIp,
      userAgent, await sha256(context.token), catalog.language,
      canonicalJson(catalog.documentVersions), documentHash, quote.fingerprint, canonicalJson(statements), acceptance.timezone || "UTC", verification.raw_snapshot_hash, now).run();
  await env.DB.prepare("UPDATE verification_signers SET accepted_at=?,document_hash=?,ip_evidence=?,user_agent=?,statements_json=?,timezone=?,status='ACCEPTED',updated_at=? WHERE order_id=? AND signer_role='PRIMARY'")
    .bind(now, documentHash, requestIp, userAgent, canonicalJson(statements), acceptance.timezone || "UTC", now, context.order.id).run();
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
  const verification = await env.DB.prepare("SELECT overall_status,email_result FROM company_verifications WHERE order_id=?").bind(context.order.id).first<{ overall_status: string; email_result: string }>();
  if (!verification || !verificationAllowsPayment(verification.overall_status) || verification.email_result !== "VERIFIED") throw new Error("Checkout is blocked until company, representation and email verification are complete");
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
