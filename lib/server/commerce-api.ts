import { calculateQuote } from "../commerce/pricing";
import { decryptBytes, decryptJson, hmacSha256, ipEvidence, parseCookies, randomToken, secureCookie, sha256, timingSafeEqual } from "../commerce/security";
import type { ClientLegalData, Locale, MarketCode } from "../commerce/types";
import { parseSelection } from "../commerce/validation";
import { acceptContract, startCheckout } from "./acceptance";
import { beginAdminLogin, completeAdminMfa, logoutAdmin, renewAdminCsrf, requireAdmin, ADMIN_COOKIE } from "./admin-auth";
import { addDeploymentStatus, adminCatalog, adminDashboard, createContractVersion, createPriceVersion, publishContractVersion, publishPriceVersion, saveAddon, savePlan, setCatalogItemStatus, setPlanAddons, updateLegalEntity, updateMarket, auditAdmin } from "./admin-data";
import { loadCatalog } from "./catalog";
import { buildContractBundle, generateContractPdf, renderContractHtml } from "./documents";
import type { TimzyEnv, TimzyExecutionContext } from "./env";
import { apiError, jsonResponse, readJson, safeError } from "./http";
import { processOrderNotifications, type SendSystemEmail } from "./notifications";
import { authenticateDraft, clientData, createDraft, DRAFT_COOKIE, publicOrder, quoteForOrder, saveDraft, saveSelectionDraft, type DraftContext } from "./orders";
import { processProvisioning } from "./provisioning";
import { brandLogoForOrder, storeBrandLogo } from "./order-assets";
import { runRetention } from "./retention";
import { handleStripeTestWebhook, handleStripeWebhook } from "./webhooks";
import { acceptSecondSigner, confirmCompany, createSecondSignerInvite, manualVerificationDecision, secondSignerDocumentContext, secondSignerSummary, sendEmailVerificationCode, storePowerOfAttorney, verificationForOrder, verifyCompany, verifyEmailCode } from "./company-verification";

const CSRF_COOKIE = "timzy_contract_csrf";

function localCookie(request: Request) { return new URL(request.url).protocol === "http:"; }
function setCookie(headers: Headers, cookie: string) { headers.append("set-cookie", cookie); }

async function publicCsrf(request: Request) {
  const token = randomToken(); const headers = new Headers();
  setCookie(headers, secureCookie(CSRF_COOKIE, token, { maxAge: 2 * 60 * 60, secure: !localCookie(request) }));
  return { token, headers };
}

function requirePublicCsrf(request: Request) {
  const cookie = parseCookies(request)[CSRF_COOKIE]; const header = request.headers.get("x-csrf-token");
  if (!cookie || !header || !timingSafeEqual(cookie, header) || request.headers.get("sec-fetch-site") === "cross-site") throw new Error("CSRF_FAILED");
  const origin = request.headers.get("origin"); if (origin && origin !== new URL(request.url).origin) throw new Error("CSRF_FAILED");
}

async function rateLimit(env: TimzyEnv, request: Request, scope: string, limit: number, windowMs: number) {
  if (!env.SESSION_SECRET) throw new Error("SESSION_SECRET is not configured");
  const key = `${scope}:${await ipEvidence(request, env.SESSION_SECRET)}`; const now = Date.now();
  const current = await env.DB.prepare("SELECT * FROM rate_limits WHERE key=?").bind(key).first<{ count: number; window_started_at: number; blocked_until: number | null }>();
  if (current?.blocked_until && current.blocked_until > now) throw new Error("RATE_LIMITED");
  const reset = !current || now - current.window_started_at >= windowMs; const count = reset ? 1 : current.count + 1; const blockedUntil = count > limit ? now + windowMs : null;
  await env.DB.prepare(`INSERT INTO rate_limits (key, window_started_at, count, blocked_until) VALUES (?, ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET window_started_at=excluded.window_started_at, count=excluded.count, blocked_until=excluded.blocked_until, updated_at=CURRENT_TIMESTAMP`)
    .bind(key, reset ? now : current?.window_started_at ?? now, count, blockedUntil).run();
  if (blockedUntil) throw new Error("RATE_LIMITED");
}

async function draftOrUnauthorized(env: TimzyEnv, request: Request): Promise<DraftContext> {
  const draft = await authenticateDraft(env.DB, request); if (!draft) throw new Error("DRAFT_UNAUTHORIZED"); return draft;
}

function marketLocale(url: URL): { market: MarketCode; language: Locale } {
  const market = url.searchParams.get("market") as MarketCode; const language = url.searchParams.get("language") as Locale;
  if (!['PL', 'UK', 'INTERNATIONAL'].includes(market) || !['pl', 'en', 'es'].includes(language)) throw new Error("Invalid catalogue scope"); return { market, language };
}

async function previewDocument(env: TimzyEnv, request: Request, format: string, requestedKind: string | null) {
  const context = await draftOrUnauthorized(env, request); const { quote, catalog } = await quoteForOrder(env.DB, context.order); const client = await clientData(env, context.order);
  if (!client) throw new Error("Company data is incomplete");
  const bundle = await buildContractBundle(env.DB, { orderId: context.order.id, orderNumber: context.order.order_number, quote, catalog, client, generatedAt: context.order.updated_at });
  if (requestedKind) { if (!["AGREEMENT","TERMS","DPA","PRIVACY"].includes(requestedKind)) throw new Error("Unknown document type"); bundle.documents = bundle.documents.filter((document) => document.kind === requestedKind); if (bundle.documents.length !== 1) throw new Error("Document version is unavailable"); }
  if (format === "pdf") {
    const pdf = await generateContractPdf(bundle, env.ASSETS); return new Response(pdf as BodyInit, { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="Timzy-${context.order.order_number}${requestedKind ? `-${requestedKind}` : ""}.pdf"`, "cache-control": "no-store" } });
  }
  return new Response(renderContractHtml(bundle), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } });
}

async function finalDocument(env: TimzyEnv, request: Request, documentId: string) {
  if (!env.SESSION_SECRET) throw new Error("SESSION_SECRET is not configured");
  const url = new URL(request.url); const orderId = url.searchParams.get("order") ?? ""; const email = url.searchParams.get("email") ?? "";
  let actorType: "ADMIN" | "CUSTOMER" = "CUSTOMER"; let actorId = email;
  let authorised = false;
  try { const admin = await requireAdmin(env, request); authorised = true; actorType = "ADMIN"; actorId = admin.id; } catch { /* customer signed link is checked below */ }
  if (!authorised) {
    const draft = await authenticateDraft(env.DB, request);
    if (draft?.order.id === orderId && ["PAID", "PROVISIONING", "ACTIVE"].includes(draft.order.status)) { authorised = true; actorId = await sha256(draft.token); }
  }
  if (!authorised) {
    const expires = Number(url.searchParams.get("expires")); const token = url.searchParams.get("token") ?? "";
    if (!env.SESSION_SECRET || !orderId || !email || !Number.isFinite(expires) || expires < Date.now() / 1000) throw new Error("DOCUMENT_UNAUTHORIZED");
    const expected = await hmacSha256(`${orderId}.${documentId}.${email}.${expires}`, env.SESSION_SECRET); if (!timingSafeEqual(expected, token)) throw new Error("DOCUMENT_UNAUTHORIZED");
    const order = await env.DB.prepare("SELECT client_data_encrypted FROM orders WHERE id=?").bind(orderId).first<{ client_data_encrypted: string | null }>();
    if (!order?.client_data_encrypted || !env.DATA_ENCRYPTION_KEY) throw new Error("DOCUMENT_UNAUTHORIZED");
    const client = await decryptJson<ClientLegalData>(order.client_data_encrypted, env.DATA_ENCRYPTION_KEY); if (client.businessEmail !== email.toLowerCase()) throw new Error("DOCUMENT_UNAUTHORIZED");
  }
  const document = await env.DB.prepare("SELECT * FROM contract_documents WHERE id=? AND order_id=?").bind(documentId, orderId).first<{ id: string; r2_key: string; encryption_iv: string; plaintext_hash: string }>();
  if (!document || !env.DATA_ENCRYPTION_KEY) throw new Error("Document not found"); const object = await env.DOCUMENTS.get(document.r2_key); if (!object) throw new Error("Document object not found");
  const plaintext = await decryptBytes(new Uint8Array(await object.arrayBuffer()), document.encryption_iv, env.DATA_ENCRYPTION_KEY); if (await sha256(plaintext) !== document.plaintext_hash) throw new Error("Document integrity check failed");
  await env.DB.prepare("INSERT INTO document_access_logs (id, document_id, actor_type, actor_id, ip_evidence) VALUES (?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), document.id, actorType, actorId, await ipEvidence(request, env.SESSION_SECRET)).run();
  return new Response(plaintext as BodyInit, { headers: { "content-type": "application/pdf", "content-disposition": "attachment; filename=Timzy-contract.pdf", "cache-control": "private, no-store", "x-content-type-options": "nosniff" } });
}

async function adminOrderDetail(env: TimzyEnv, id: string) {
  const [order, items, acceptances, documents, deployments, notifications, jobs, audit, verification, verificationHistory, verificationDocuments, signers, orderAssets] = await Promise.all([
    env.DB.prepare("SELECT id, order_number, status, verification_status, company_verification_id, market_code, language, currency, contract_term, registration_country, billing_country, monthly_net_minor, one_time_net_minor, activation_fee_minor, estimated_tax_minor, final_tax_minor, final_total_minor, due_today_minor, deployment_days, stripe_customer_id, stripe_checkout_session_id, stripe_subscription_id, stripe_invoice_id, stripe_payment_intent_id, paid_at, created_at, updated_at FROM orders WHERE id=?").bind(id).first(),
    env.DB.prepare("SELECT * FROM order_items WHERE order_id=? ORDER BY created_at").bind(id).all(), env.DB.prepare("SELECT * FROM contract_acceptances WHERE order_id=? ORDER BY revision DESC").bind(id).all(),
    env.DB.prepare("SELECT id,kind,content_type,plaintext_hash,byte_length,retention_until,created_at FROM contract_documents WHERE order_id=? ORDER BY created_at DESC").bind(id).all(),
    env.DB.prepare("SELECT * FROM deployment_statuses WHERE order_id=? ORDER BY created_at DESC").bind(id).all(), env.DB.prepare("SELECT * FROM email_notifications WHERE order_id=? ORDER BY created_at DESC").bind(id).all(),
    env.DB.prepare("SELECT * FROM provisioning_jobs WHERE order_id=?").bind(id).first(), env.DB.prepare("SELECT * FROM audit_logs WHERE entity_id=? ORDER BY created_at DESC LIMIT 100").bind(id).all(),
    env.DB.prepare("SELECT id,market_code,adapter,entity_type,registry_country,registry_name,registration_number,tax_number,regon,legal_name,registered_address,postal_code,city,entity_type_name,registry_status,representation_method,company_result,representative_result,email_result,overall_status,reason_code,reason_detail,verification_source,source_retrieved_at,raw_snapshot_hash,risk_flags_json,client_confirmed_at,verified_at,manual_reviewed_by_admin_id,manual_review_reason,created_at,updated_at FROM company_verifications WHERE order_id=?").bind(id).first(),
    env.DB.prepare("SELECT * FROM verification_status_history WHERE verification_id=(SELECT id FROM company_verifications WHERE order_id=?) ORDER BY created_at DESC").bind(id).all(),
    env.DB.prepare("SELECT id,kind,file_name,content_type,plaintext_hash,byte_length,status,retention_until,reviewed_by_admin_id,review_reason,created_at FROM verification_documents WHERE order_id=? ORDER BY created_at DESC").bind(id).all(),
    env.DB.prepare("SELECT id,signer_role,name,position,authority_basis,email_hash,email_verified_at,document_hash,accepted_at,status,created_at,updated_at FROM verification_signers WHERE order_id=? ORDER BY signer_role").bind(id).all(),
    env.DB.prepare("SELECT id,kind,file_name,content_type,plaintext_hash,byte_length,retention_until,created_at,updated_at FROM order_assets WHERE order_id=? ORDER BY kind").bind(id).all(),
  ]);
  if (!order) throw new Error("Order not found"); return { order, items: items.results, acceptances: acceptances.results, documents: documents.results, deployments: deployments.results, notifications: notifications.results, provisioning: jobs, audit: audit.results,
    verification, verificationHistory: verificationHistory.results, verificationDocuments: verificationDocuments.results, signers: signers.results, orderAssets: orderAssets.results };
}

export async function handleCommerceRequest(request: Request, env: TimzyEnv, ctx: TimzyExecutionContext, sendEmail: SendSystemEmail): Promise<Response | null> {
  const url = new URL(request.url); const path = url.pathname.replace(/\/+$/, "") || "/";
  if (!path.startsWith("/api/commerce") && !path.startsWith("/api/company-verification") && !path.startsWith("/api/admin") && !path.startsWith("/api/stripe")) return null;
  try {
    if (request.method === "POST" && path === "/api/stripe/webhook/pl") return handleStripeWebhook(env, request, "PL", ctx, sendEmail);
    if (request.method === "POST" && path === "/api/stripe/webhook/international") return handleStripeWebhook(env, request, "INTERNATIONAL", ctx, sendEmail);
    if (request.method === "POST" && path === "/api/stripe/webhook/test") return handleStripeTestWebhook(env, request, ctx, sendEmail);

    if (request.method === "GET" && path === "/api/commerce/bootstrap") {
      await rateLimit(env, request, "commerce-bootstrap", 60, 60_000); const csrf = await publicCsrf(request); let draft = await authenticateDraft(env.DB, request);
      if (!draft) draft = await createDraft(env.DB); const headers = csrf.headers;
      setCookie(headers, secureCookie(DRAFT_COOKIE, `${draft.order.id}.${draft.token}`, { maxAge: 30 * 24 * 60 * 60, secure: !localCookie(request) }));
      return jsonResponse({ ok: true, csrfToken: csrf.token, order: publicOrder(draft.order) }, 200, headers);
    }
    if (request.method === "GET" && path === "/api/commerce/catalog") { const scope = marketLocale(url); return jsonResponse({ ok: true, catalog: await loadCatalog(env.DB, scope.market, scope.language) }); }
    if (request.method === "GET" && path === "/api/commerce/draft") { const draft = await draftOrUnauthorized(env, request); return jsonResponse({ ok: true, order: publicOrder(draft.order), selection: JSON.parse(draft.order.selection_json), client: await clientData(env, draft.order), verification: await verificationForOrder(env.DB, draft.order.id), brandLogo: await brandLogoForOrder(env.DB, draft.order.id) }); }
    if (request.method === "GET" && path === "/api/company-verification") { const draft = await draftOrUnauthorized(env, request); return jsonResponse({ ok: true, verification: await verificationForOrder(env.DB, draft.order.id) }); }
    if (request.method === "GET" && path === "/api/company-verification/second-signer") { await rateLimit(env, request, "second-signer-view", 30, 10 * 60_000); return jsonResponse({ ok: true, summary: await secondSignerSummary(env, url.searchParams.get("token")) }); }
    if (request.method === "GET" && path === "/api/company-verification/second-signer/document") {
      await rateLimit(env, request, "second-signer-document", 30, 10 * 60_000); const signer = await secondSignerDocumentContext(env, url.searchParams.get("token")); const { quote, catalog } = await quoteForOrder(env.DB, signer.order);
      const bundle = await buildContractBundle(env.DB, { orderId: signer.order.id, orderNumber: signer.order.order_number, quote, catalog, client: signer.client, generatedAt: signer.order.updated_at });
      if (url.searchParams.get("format") === "pdf") { const pdf = await generateContractPdf(bundle, env.ASSETS); return new Response(pdf as BodyInit, { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="Timzy-${signer.order.order_number}.pdf"`, "cache-control": "private, no-store" } }); }
      return new Response(renderContractHtml(bundle), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "private, no-store", "x-robots-tag": "noindex, nofollow" } });
    }
    if (request.method === "POST" && path === "/api/company-verification/second-signer/accept") { await rateLimit(env, request, "second-signer-accept", 10, 10 * 60_000); return jsonResponse({ ok: true, ...(await acceptSecondSigner(env, request, await readJson(request, 12_000))) }); }
    if (request.method === "POST" && path === "/api/company-verification/lookup") {
      requirePublicCsrf(request); await rateLimit(env, request, "company-registry", 12, 10 * 60_000); const draft = await draftOrUnauthorized(env, request);
      return jsonResponse({ ok: true, verification: await verifyCompany(env, draft, await readJson(request, 16_000)) });
    }
    if (request.method === "POST" && path === "/api/company-verification/confirm") {
      requirePublicCsrf(request); await rateLimit(env, request, "company-confirm", 12, 10 * 60_000); const draft = await draftOrUnauthorized(env, request);
      return jsonResponse({ ok: true, verification: await confirmCompany(env, draft, await readJson(request, 16_000)) });
    }
    if (request.method === "POST" && path === "/api/company-verification/email/send") {
      requirePublicCsrf(request); await rateLimit(env, request, "company-email-send", 5, 10 * 60_000); const draft = await draftOrUnauthorized(env, request);
      return jsonResponse({ ok: true, ...(await sendEmailVerificationCode(env, draft.order, sendEmail)) });
    }
    if (request.method === "POST" && path === "/api/company-verification/email/verify") {
      requirePublicCsrf(request); await rateLimit(env, request, "company-email-verify", 10, 10 * 60_000); const draft = await draftOrUnauthorized(env, request); const payload = await readJson(request, 4_000) as Record<string, unknown>;
      return jsonResponse({ ok: true, verification: await verifyEmailCode(env, draft.order, payload.code) });
    }
    if (request.method === "POST" && path === "/api/company-verification/second-signer/invite") {
      requirePublicCsrf(request); await rateLimit(env, request, "second-signer-invite", 4, 60 * 60_000); const draft = await draftOrUnauthorized(env, request);
      return jsonResponse({ ok: true, ...(await createSecondSignerInvite(env, draft.order, await readJson(request, 12_000), sendEmail, env.APP_BASE_URL ?? url.origin)) });
    }
    if (request.method === "POST" && path === "/api/company-verification/power-of-attorney") {
      requirePublicCsrf(request); await rateLimit(env, request, "power-of-attorney-upload", 4, 60 * 60_000); const draft = await draftOrUnauthorized(env, request);
      const contentType = (request.headers.get("content-type") ?? "").split(";")[0].toLowerCase(); const fileName = decodeURIComponent(request.headers.get("x-file-name") ?? "power-of-attorney");
      return jsonResponse({ ok: true, document: await storePowerOfAttorney(env, draft.order, new Uint8Array(await request.arrayBuffer()), fileName, contentType), verification: await verificationForOrder(env.DB, draft.order.id) });
    }
    if (request.method === "POST" && path === "/api/commerce/brand-logo") {
      requirePublicCsrf(request); await rateLimit(env, request, "brand-logo-upload", 8, 60 * 60_000); const draft = await draftOrUnauthorized(env, request);
      const declaredLength = Number(request.headers.get("content-length") ?? 0); if (declaredLength > 5 * 1024 * 1024) throw new Error("Logo must not exceed 5 MB");
      const contentType = (request.headers.get("content-type") ?? "").split(";")[0].toLowerCase(); const fileName = decodeURIComponent(request.headers.get("x-file-name") ?? "brand-logo");
      const brandLogo = await storeBrandLogo(env, draft.order, new Uint8Array(await request.arrayBuffer()), fileName, contentType);
      return jsonResponse({ ok: true, brandLogo, verification: await verificationForOrder(env.DB, draft.order.id) });
    }
    if (request.method === "POST" && path === "/api/commerce/draft") {
      requirePublicCsrf(request); await rateLimit(env, request, "commerce-draft", 30, 60_000); const draft = await draftOrUnauthorized(env, request); const payload = await readJson(request) as Record<string, unknown>;
      const result = await saveDraft(env, draft, payload.selection, payload.client); return jsonResponse({ ok: true, order: publicOrder(result.order), quote: result.quote, catalog: result.catalog, acceptanceInvalidated: result.acceptanceInvalidated, verification: await verificationForOrder(env.DB, draft.order.id) });
    }
    if (request.method === "POST" && path === "/api/commerce/selection") {
      requirePublicCsrf(request); await rateLimit(env, request, "commerce-selection", 60, 60_000); const draft = await draftOrUnauthorized(env, request); const payload = await readJson(request) as Record<string, unknown>;
      const order = await saveSelectionDraft(env, draft, payload.selection); return jsonResponse({ ok: true, order: publicOrder(order) });
    }
    if (request.method === "POST" && path === "/api/commerce/quote") {
      requirePublicCsrf(request); await rateLimit(env, request, "commerce-quote", 60, 60_000); const payload = await readJson(request) as Record<string, unknown>; const selection = parseSelection(payload.selection);
      const catalog = await loadCatalog(env.DB, selection.market, selection.language); return jsonResponse({ ok: true, quote: await calculateQuote(catalog, selection), catalog });
    }
    if (request.method === "GET" && path === "/api/commerce/document-preview") return previewDocument(env, request, url.searchParams.get("format") ?? "html", url.searchParams.get("kind"));
    if (request.method === "POST" && path === "/api/commerce/accept") {
      requirePublicCsrf(request); await rateLimit(env, request, "commerce-accept", 10, 60_000); const draft = await draftOrUnauthorized(env, request); const payload = await readJson(request) as Record<string, unknown>;
      const result = await acceptContract(env, request, draft, payload.acceptance); return jsonResponse({ ok: true, order: publicOrder(result.order), documentHash: result.documentHash });
    }
    if (request.method === "POST" && path === "/api/commerce/checkout") {
      requirePublicCsrf(request); await rateLimit(env, request, "commerce-checkout", 6, 60_000); const draft = await draftOrUnauthorized(env, request); const result = await startCheckout(env, draft); return jsonResponse({ ok: true, checkoutUrl: result.url, order: publicOrder(result.order) });
    }
    if (request.method === "GET" && path === "/api/commerce/status") { const draft = await draftOrUnauthorized(env, request); return jsonResponse({ ok: true, order: publicOrder(draft.order) }); }
    if (request.method === "GET" && path === "/api/commerce/documents") {
      const draft = await draftOrUnauthorized(env, request); if (!["PAID", "PROVISIONING", "ACTIVE"].includes(draft.order.status)) throw new Error("Documents are available after confirmed payment");
      const documents = await env.DB.prepare("SELECT id,kind,plaintext_hash,byte_length,created_at FROM contract_documents WHERE order_id=? ORDER BY created_at DESC").bind(draft.order.id).all<Record<string, unknown>>();
      return jsonResponse({ ok: true, documents: documents.results.map((document) => ({ ...document, downloadUrl: `/api/commerce/documents/${String(document.id)}?order=${draft.order.id}` })) });
    }
    const documentMatch = path.match(/^\/api\/commerce\/documents\/([^/]+)$/); if (request.method === "GET" && documentMatch) return finalDocument(env, request, documentMatch[1]);

    if (request.method === "POST" && path === "/api/admin/login") {
      requirePublicCsrf(request); await rateLimit(env, request, "admin-login", 8, 15 * 60_000); const payload = await readJson(request, 8_000) as Record<string, unknown>;
      const result = await beginAdminLogin(env, request, payload.email, payload.password); const headers = new Headers();
      setCookie(headers, secureCookie(ADMIN_COOKIE, result.token, { maxAge: result.mfaRequired ? 5 * 60 : 8 * 60 * 60, secure: !localCookie(request) }));
      return jsonResponse({ ok: true, mfaRequired: result.mfaRequired, admin: result.admin, csrfToken: result.csrfToken }, 200, headers);
    }
    if (request.method === "POST" && path === "/api/admin/mfa") {
      requirePublicCsrf(request); await rateLimit(env, request, "admin-mfa", 8, 15 * 60_000); const payload = await readJson(request, 4_000) as Record<string, unknown>; const admin = await completeAdminMfa(env, request, payload.code);
      return jsonResponse({ ok: true, admin: { id: admin.id, email: admin.email, displayName: admin.displayName, role: admin.role }, csrfToken: admin.csrfToken });
    }
    if (request.method === "GET" && path === "/api/admin/session") { const result = await renewAdminCsrf(env, request); return jsonResponse({ ok: true, admin: result.principal, csrfToken: result.csrfToken }); }
    if (request.method === "POST" && path === "/api/admin/logout") { const admin = await requireAdmin(env, request, { csrf: true }); await logoutAdmin(env, request); const headers = new Headers(); setCookie(headers, secureCookie(ADMIN_COOKIE, "", { maxAge: 0, secure: !localCookie(request) })); await auditAdmin(env, admin, "ADMIN_LOGOUT", "AdminSession", admin.sessionId, null, null); return jsonResponse({ ok: true }, 200, headers); }

    if (path.startsWith("/api/admin")) {
      const mutating = !["GET", "HEAD"].includes(request.method); const admin = await requireAdmin(env, request, { csrf: mutating });
      if (request.method === "GET" && path === "/api/admin/dashboard") return jsonResponse({ ok: true, dashboard: await adminDashboard(env) });
      if (request.method === "GET" && path === "/api/admin/catalog") return jsonResponse({ ok: true, catalog: await adminCatalog(env) });
      if (request.method === "POST" && path === "/api/admin/plans") return jsonResponse({ ok: true, plan: await savePlan(env, admin, await readJson(request)) });
      if (request.method === "POST" && path === "/api/admin/addons") return jsonResponse({ ok: true, addon: await saveAddon(env, admin, await readJson(request)) });
      const catalogueStatus = path.match(/^\/api\/admin\/(plans|addons)\/([^/]+)\/status$/); if (request.method === "POST" && catalogueStatus) { const payload = await readJson(request) as Record<string, unknown>; return jsonResponse({ ok: true, item: await setCatalogItemStatus(env, admin, catalogueStatus[1] === "plans" ? "plan" : "addon", catalogueStatus[2], payload.status) }); }
      const planAddons = path.match(/^\/api\/admin\/plans\/([^/]+)\/addons$/); if (request.method === "POST" && planAddons) return jsonResponse({ ok: true, mappings: await setPlanAddons(env, admin, planAddons[1], await readJson(request)) });
      if (request.method === "POST" && path === "/api/admin/prices") return jsonResponse({ ok: true, price: await createPriceVersion(env, admin, await readJson(request)) });
      const priceMatch = path.match(/^\/api\/admin\/prices\/(plan|addon)\/([^/]+)\/publish$/); if (request.method === "POST" && priceMatch) return jsonResponse({ ok: true, price: await publishPriceVersion(env, admin, priceMatch[2], priceMatch[1] as "plan" | "addon") });
      if (request.method === "POST" && path === "/api/admin/contracts") return jsonResponse({ ok: true, version: await createContractVersion(env, admin, await readJson(request)) });
      const contractMatch = path.match(/^\/api\/admin\/contracts\/([^/]+)\/publish$/); if (request.method === "POST" && contractMatch) { const payload = await readJson(request) as Record<string, unknown>; return jsonResponse({ ok: true, version: await publishContractVersion(env, admin, contractMatch[1], payload.legalApprovalReference) }); }
      if (request.method === "POST" && path === "/api/admin/markets") return jsonResponse({ ok: true, market: await updateMarket(env, admin, await readJson(request)) });
      if (request.method === "POST" && path === "/api/admin/legal-entities") return jsonResponse({ ok: true, legalEntity: await updateLegalEntity(env, admin, await readJson(request)) });
      const orderMatch = path.match(/^\/api\/admin\/orders\/([^/]+)$/); if (request.method === "GET" && orderMatch) return jsonResponse({ ok: true, detail: await adminOrderDetail(env, orderMatch[1]) });
      const verificationDocument = path.match(/^\/api\/admin\/verification-documents\/([^/]+)$/); if (request.method === "GET" && verificationDocument) {
        const document = await env.DB.prepare("SELECT * FROM verification_documents WHERE id=?").bind(verificationDocument[1]).first<{ id: string; order_id: string; file_name: string; content_type: string; r2_key: string; encryption_iv: string; plaintext_hash: string }>();
        if (!document || !env.DATA_ENCRYPTION_KEY) throw new Error("Verification document not found"); const object = await env.DOCUMENTS.get(document.r2_key); if (!object) throw new Error("Verification document object not found");
        const plaintext = await decryptBytes(new Uint8Array(await object.arrayBuffer()), document.encryption_iv, env.DATA_ENCRYPTION_KEY); if (await sha256(plaintext) !== document.plaintext_hash) throw new Error("Verification document integrity check failed");
        await auditAdmin(env, admin, "VERIFICATION_DOCUMENT_DOWNLOADED", "Order", document.order_id, null, { documentId: document.id, plaintextHash: document.plaintext_hash });
        return new Response(plaintext as BodyInit, { headers: { "content-type": document.content_type, "content-disposition": `attachment; filename="${document.file_name.replace(/[\r\n"]/g, "_")}"`, "cache-control": "private, no-store", "x-content-type-options": "nosniff" } });
      }
      const orderAsset = path.match(/^\/api\/admin\/order-assets\/([^/]+)$/); if (request.method === "GET" && orderAsset) {
        const asset = await env.DB.prepare("SELECT * FROM order_assets WHERE id=?").bind(orderAsset[1]).first<{ id: string; order_id: string; file_name: string; content_type: string; r2_key: string; encryption_iv: string; plaintext_hash: string }>();
        if (!asset || !env.DATA_ENCRYPTION_KEY) throw new Error("Order asset not found"); const object = await env.DOCUMENTS.get(asset.r2_key); if (!object) throw new Error("Order asset object not found");
        const plaintext = await decryptBytes(new Uint8Array(await object.arrayBuffer()), asset.encryption_iv, env.DATA_ENCRYPTION_KEY); if (await sha256(plaintext) !== asset.plaintext_hash) throw new Error("Order asset integrity check failed");
        await auditAdmin(env, admin, "ORDER_ASSET_DOWNLOADED", "Order", asset.order_id, null, { assetId: asset.id, plaintextHash: asset.plaintext_hash });
        return new Response(plaintext as BodyInit, { headers: { "content-type": asset.content_type, "content-disposition": `attachment; filename="${asset.file_name.replace(/[\r\n"]/g, "_")}"`, "cache-control": "private, no-store", "x-content-type-options": "nosniff" } });
      }
      const verificationDecision = path.match(/^\/api\/admin\/orders\/([^/]+)\/verification-decision$/); if (request.method === "POST" && verificationDecision) {
        const before = await verificationForOrder(env.DB, verificationDecision[1]); const verification = await manualVerificationDecision(env, admin.id, verificationDecision[1], await readJson(request));
        await auditAdmin(env, admin, "COMPANY_VERIFICATION_DECIDED", "Order", verificationDecision[1], before, verification); return jsonResponse({ ok: true, verification });
      }
      const retryProvisioning = path.match(/^\/api\/admin\/orders\/([^/]+)\/retry-provisioning$/); if (request.method === "POST" && retryProvisioning) { const retried = await env.DB.prepare("UPDATE provisioning_jobs SET status='QUEUED', next_attempt_at=NULL, safe_error=NULL WHERE order_id=? AND status IN ('FAILED','WAITING_CONFIGURATION')").bind(retryProvisioning[1]).run(); if ((retried.meta.changes ?? 0) === 0) throw new Error("Provisioning is not eligible for retry"); ctx.waitUntil(processProvisioning(env, retryProvisioning[1])); await auditAdmin(env, admin, "PROVISIONING_RETRIED", "Order", retryProvisioning[1], null, null); return jsonResponse({ ok: true }); }
      const retryEmail = path.match(/^\/api\/admin\/orders\/([^/]+)\/resend-notifications$/); if (request.method === "POST" && retryEmail) { await env.DB.prepare("UPDATE email_notifications SET status='QUEUED', next_attempt_at=NULL WHERE order_id=?").bind(retryEmail[1]).run(); ctx.waitUntil(processOrderNotifications(env, retryEmail[1], sendEmail)); await auditAdmin(env, admin, "NOTIFICATIONS_RETRIED", "Order", retryEmail[1], null, null); return jsonResponse({ ok: true }); }
      const deploymentStatus = path.match(/^\/api\/admin\/orders\/([^/]+)\/deployment-status$/); if (request.method === "POST" && deploymentStatus) return jsonResponse({ ok: true, deployment: await addDeploymentStatus(env, admin, deploymentStatus[1], await readJson(request)) });
      if (request.method === "GET" && path === "/api/admin/orders-export.csv") {
        const rows = await env.DB.prepare("SELECT order_number,status,market_code,language,currency,contract_term,monthly_net_minor,one_time_net_minor,paid_at,created_at FROM orders ORDER BY created_at DESC").all<Record<string, unknown>>();
        const columns = ["order_number","status","market_code","language","currency","contract_term","monthly_net_minor","one_time_net_minor","paid_at","created_at"];
        const csv = [columns.join(","), ...rows.results.map((row) => columns.map((column) => `"${String(row[column] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
        return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=timzy-orders.csv", "cache-control": "no-store" } });
      }
      if (request.method === "POST" && path === "/api/admin/retention/run") { const superAdmin = await requireAdmin(env, request, { role: "SUPER_ADMIN", csrf: true }); return jsonResponse({ ok: true, result: await runRetention(env, superAdmin) }); }
    }
    return apiError(404, "NOT_FOUND", "Route not found");
  } catch (error) {
    const message = safeError(error); let status = 400; let code = "REQUEST_FAILED";
    if (message === "ADMIN_UNAUTHORIZED" || message === "DRAFT_UNAUTHORIZED" || message === "DOCUMENT_UNAUTHORIZED") { status = 401; code = message; }
    else if (message === "ADMIN_FORBIDDEN") { status = 403; code = message; }
    else if (message === "CSRF_FAILED") { status = 403; code = message; }
    else if (message === "RATE_LIMITED") { status = 429; code = message; }
    else if (message.includes("not configured") || message.includes("blocked")) { status = 503; code = "CONFIGURATION_REQUIRED"; }
    console.error("Commerce request failed", code, message);
    return apiError(status, code, status === 401 && path.startsWith("/api/admin") ? "Authentication required" : message);
  }
}
