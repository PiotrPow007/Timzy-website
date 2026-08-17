import { canonicalJson, sha256 } from "../commerce/security";
import type { Locale, MarketCode, PaymentType } from "../commerce/types";
import type { TimzyEnv } from "./env";
import type { AdminPrincipal } from "./admin-auth";
import { createStripeCatalogPrice } from "./stripe";

function string(value: unknown, max = 500): string { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function integer(value: unknown, min = 0, max = 100_000_000): number { const parsed = Number(value); if (!Number.isInteger(parsed) || parsed < min || parsed > max) throw new Error("Invalid numeric value"); return parsed; }
function list(value: unknown, max = 100): string[] { return Array.isArray(value) ? value.slice(0, max).map((item) => string(item, 300)).filter(Boolean) : []; }

export async function auditAdmin(env: TimzyEnv, admin: AdminPrincipal, action: string, entityType: string, entityId: string, before: unknown, after: unknown, metadata: unknown = {}) {
  await env.DB.prepare(`INSERT INTO audit_logs (id, actor_type, actor_id, action, entity_type, entity_id, before_hash, after_hash, metadata_json)
    VALUES (?, 'ADMIN', ?, ?, ?, ?, ?, ?, ?)`)
    .bind(crypto.randomUUID(), admin.id, action, entityType, entityId, before ? await sha256(canonicalJson(before)) : null, after ? await sha256(canonicalJson(after)) : null, canonicalJson(metadata)).run();
}

export async function adminDashboard(env: TimzyEnv) {
  const [orders, revenue, notifications, jobs, recentOrders] = await Promise.all([
    env.DB.prepare("SELECT status, COUNT(*) count FROM orders GROUP BY status ORDER BY status").all<{ status: string; count: number }>(),
    env.DB.prepare("SELECT currency, COALESCE(SUM(monthly_net_minor),0) monthly, COALESCE(SUM(one_time_net_minor),0) one_time FROM orders WHERE status IN ('PAID','PROVISIONING','ACTIVE') GROUP BY currency").all(),
    env.DB.prepare("SELECT status, COUNT(*) count FROM email_notifications GROUP BY status").all(),
    env.DB.prepare("SELECT status, COUNT(*) count FROM provisioning_jobs GROUP BY status").all(),
    env.DB.prepare("SELECT id, order_number, status, market_code, language, currency, monthly_net_minor, one_time_net_minor, paid_at, created_at FROM orders ORDER BY created_at DESC LIMIT 50").all(),
  ]);
  return { orderCounts: orders.results, revenue: revenue.results, notificationCounts: notifications.results, provisioningCounts: jobs.results, recentOrders: recentOrders.results };
}

export async function adminCatalog(env: TimzyEnv) {
  const [markets, entities, plans, planTranslations, planPrices, addons, addonTranslations, addonPrices, includedAddons, compatiblePlans, templates, versions] = await Promise.all([
    env.DB.prepare("SELECT * FROM markets ORDER BY code").all(), env.DB.prepare("SELECT * FROM legal_entities ORDER BY code").all(),
    env.DB.prepare("SELECT * FROM plans ORDER BY display_order, internal_key").all(), env.DB.prepare("SELECT * FROM plan_translations ORDER BY plan_id, language").all(),
    env.DB.prepare("SELECT * FROM plan_prices ORDER BY plan_id, market_id, payment_type, version DESC").all(), env.DB.prepare("SELECT * FROM addons ORDER BY display_order, internal_key").all(),
    env.DB.prepare("SELECT * FROM addon_translations ORDER BY addon_id, language").all(), env.DB.prepare("SELECT * FROM addon_prices ORDER BY addon_id, market_id, version DESC").all(),
    env.DB.prepare("SELECT * FROM plan_included_addons ORDER BY plan_id, addon_id").all(), env.DB.prepare("SELECT * FROM addon_compatible_plans ORDER BY plan_id, addon_id").all(),
    env.DB.prepare("SELECT * FROM contract_templates ORDER BY market_code, language, kind").all(), env.DB.prepare("SELECT * FROM contract_versions ORDER BY template_id, version DESC").all(),
  ]);
  return { markets: markets.results, legalEntities: entities.results, plans: plans.results, planTranslations: planTranslations.results, planPrices: planPrices.results,
    addons: addons.results, addonTranslations: addonTranslations.results, addonPrices: addonPrices.results, includedAddons: includedAddons.results,
    compatiblePlans: compatiblePlans.results, contractTemplates: templates.results, contractVersions: versions.results };
}

export async function savePlan(env: TimzyEnv, admin: AdminPrincipal, raw: unknown) {
  const input = raw && typeof raw === "object" ? raw as Record<string, unknown> : {}; const id = string(input.id, 80) || crypto.randomUUID();
  const before = await env.DB.prepare("SELECT * FROM plans WHERE id = ?").bind(id).first(); const key = string(input.internalKey, 100);
  if (!key) throw new Error("Plan internal key is required");
  const status = string(input.status, 20); if (!["DRAFT", "ACTIVE", "ARCHIVED"].includes(status)) throw new Error("Invalid plan status");
  const translations = input.translations && typeof input.translations === "object" ? input.translations as Record<string, unknown> : {};
  for (const locale of ["pl", "en", "es"] as const) {
    const translation = translations[locale] && typeof translations[locale] === "object" ? translations[locale] as Record<string, unknown> : {};
    if (!string(translation.name, 160) || !string(translation.description, 1000)) throw new Error(`Plan ${locale} translation is required`);
  }
  const statements: D1PreparedStatement[] = [env.DB.prepare(`INSERT INTO plans (id, internal_key, included_features_json, recommended, display_order, deployment_days, status)
    VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET internal_key=excluded.internal_key, included_features_json=excluded.included_features_json,
    recommended=excluded.recommended, display_order=excluded.display_order, deployment_days=excluded.deployment_days, status=excluded.status, updated_at=CURRENT_TIMESTAMP`)
    .bind(id, key, canonicalJson(list(input.includedFeatures)), input.recommended === true ? 1 : 0, integer(input.displayOrder, 0, 10_000), integer(input.deploymentDays, 1, 365), status)];
  for (const locale of ["pl", "en", "es"] as const) {
    const translation = translations[locale] as Record<string, unknown>;
    statements.push(env.DB.prepare(`INSERT INTO plan_translations (plan_id, language, name, description, benefits_json) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(plan_id, language) DO UPDATE SET name=excluded.name, description=excluded.description, benefits_json=excluded.benefits_json`)
      .bind(id, locale, string(translation.name, 160), string(translation.description, 1000), canonicalJson(list(translation.benefits))));
  }
  await env.DB.batch(statements); const after = await env.DB.prepare("SELECT * FROM plans WHERE id = ?").bind(id).first();
  await auditAdmin(env, admin, before ? "PLAN_UPDATED" : "PLAN_CREATED", "Plan", id, before, after); return after;
}

export async function saveAddon(env: TimzyEnv, admin: AdminPrincipal, raw: unknown) {
  const input = raw && typeof raw === "object" ? raw as Record<string, unknown> : {}; const id = string(input.id, 80) || crypto.randomUUID();
  const before = await env.DB.prepare("SELECT * FROM addons WHERE id = ?").bind(id).first(); const key = string(input.internalKey, 100);
  const paymentType = string(input.paymentType, 20) as PaymentType; const status = string(input.status, 20);
  if (!key || !["MONTHLY", "ONE_TIME"].includes(paymentType) || !["DRAFT", "ACTIVE", "ARCHIVED"].includes(status)) throw new Error("Invalid add-on configuration");
  const translations = input.translations && typeof input.translations === "object" ? input.translations as Record<string, unknown> : {};
  const statements: D1PreparedStatement[] = [env.DB.prepare(`INSERT INTO addons (id, internal_key, payment_type, standalone, min_quantity, max_quantity, deployment_days_impact, display_order, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET internal_key=excluded.internal_key, payment_type=excluded.payment_type, standalone=excluded.standalone,
    min_quantity=excluded.min_quantity, max_quantity=excluded.max_quantity, deployment_days_impact=excluded.deployment_days_impact, display_order=excluded.display_order, status=excluded.status, updated_at=CURRENT_TIMESTAMP`)
    .bind(id, key, paymentType, input.standalone === true ? 1 : 0, integer(input.minQuantity, 1, 1000), integer(input.maxQuantity, 1, 1000), integer(input.deploymentDaysImpact, 0, 365), integer(input.displayOrder, 0, 10_000), status)];
  for (const locale of ["pl", "en", "es"] as const) {
    const translation = translations[locale] && typeof translations[locale] === "object" ? translations[locale] as Record<string, unknown> : {};
    const name = string(translation.name, 160); const description = string(translation.description, 1000); if (!name || !description) throw new Error(`Add-on ${locale} translation is required`);
    statements.push(env.DB.prepare(`INSERT INTO addon_translations (addon_id, language, name, description) VALUES (?, ?, ?, ?)
      ON CONFLICT(addon_id, language) DO UPDATE SET name=excluded.name, description=excluded.description`).bind(id, locale, name, description));
  }
  await env.DB.batch(statements); const after = await env.DB.prepare("SELECT * FROM addons WHERE id = ?").bind(id).first();
  await auditAdmin(env, admin, before ? "ADDON_UPDATED" : "ADDON_CREATED", "Addon", id, before, after); return after;
}

export async function setCatalogItemStatus(env: TimzyEnv, admin: AdminPrincipal, kind: "plan" | "addon", id: string, rawStatus: unknown) {
  const status = string(rawStatus, 20); if (!["DRAFT", "ACTIVE", "ARCHIVED"].includes(status)) throw new Error("Invalid catalogue status");
  const table = kind === "plan" ? "plans" : "addons"; const priceTable = kind === "plan" ? "plan_prices" : "addon_prices";
  const foreignKey = kind === "plan" ? "plan_id" : "addon_id"; const translationTable = kind === "plan" ? "plan_translations" : "addon_translations";
  const before = await env.DB.prepare(`SELECT * FROM ${table} WHERE id=?`).bind(id).first<Record<string, unknown>>(); if (!before) throw new Error("Catalogue item not found");
  if (status === "ACTIVE") {
    const translations = await env.DB.prepare(`SELECT COUNT(DISTINCT language) count FROM ${translationTable} WHERE ${foreignKey}=?`).bind(id).first<{ count: number }>();
    if (translations?.count !== 3) throw new Error("PL, EN and ES translations are required before activation");
    const activeMarkets = await env.DB.prepare("SELECT id FROM markets WHERE status='ACTIVE'").all<{ id: string }>();
    for (const market of activeMarkets.results) {
      const price = await env.DB.prepare(`SELECT id FROM ${priceTable} WHERE ${foreignKey}=? AND market_id=? AND status='ACTIVE' AND amount_minor>0 AND stripe_product_id IS NOT NULL AND stripe_price_id IS NOT NULL${kind === "plan" ? " AND payment_type='MONTHLY'" : ""} LIMIT 1`).bind(id, market.id).first();
      if (!price) throw new Error("Every active market needs a published Stripe-backed price before activation");
    }
  }
  await env.DB.prepare(`UPDATE ${table} SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(status, id).run();
  const after = await env.DB.prepare(`SELECT * FROM ${table} WHERE id=?`).bind(id).first();
  await auditAdmin(env, admin, `${kind.toUpperCase()}_STATUS_CHANGED`, kind === "plan" ? "Plan" : "Addon", id, before, after); return after;
}

export async function setPlanAddons(env: TimzyEnv, admin: AdminPrincipal, planId: string, raw: unknown) {
  const input = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const includedAddonIds = [...new Set(list(input.includedAddonIds, 200))];
  const compatibleAddonIds = [...new Set([...includedAddonIds, ...list(input.compatibleAddonIds, 200)])];
  const plan = await env.DB.prepare("SELECT id FROM plans WHERE id=?").bind(planId).first(); if (!plan) throw new Error("Plan not found");
  if (compatibleAddonIds.length) {
    const placeholders = compatibleAddonIds.map(() => "?").join(",");
    const found = await env.DB.prepare(`SELECT COUNT(*) count FROM addons WHERE id IN (${placeholders})`).bind(...compatibleAddonIds).first<{ count: number }>();
    if (found?.count !== compatibleAddonIds.length) throw new Error("At least one add-on does not exist");
  }
  const before = {
    included: (await env.DB.prepare("SELECT addon_id FROM plan_included_addons WHERE plan_id=? ORDER BY addon_id").bind(planId).all()).results,
    compatible: (await env.DB.prepare("SELECT addon_id FROM addon_compatible_plans WHERE plan_id=? ORDER BY addon_id").bind(planId).all()).results,
  };
  const statements: D1PreparedStatement[] = [
    env.DB.prepare("DELETE FROM plan_included_addons WHERE plan_id=?").bind(planId),
    env.DB.prepare("DELETE FROM addon_compatible_plans WHERE plan_id=?").bind(planId),
    ...includedAddonIds.map((addonId) => env.DB.prepare("INSERT INTO plan_included_addons (plan_id, addon_id) VALUES (?, ?)").bind(planId, addonId)),
    ...compatibleAddonIds.map((addonId) => env.DB.prepare("INSERT INTO addon_compatible_plans (addon_id, plan_id) VALUES (?, ?)").bind(addonId, planId)),
  ];
  await env.DB.batch(statements);
  const after = { includedAddonIds, compatibleAddonIds }; await auditAdmin(env, admin, "PLAN_ADDONS_CHANGED", "Plan", planId, before, after); return after;
}

export async function addDeploymentStatus(env: TimzyEnv, admin: AdminPrincipal, orderId: string, raw: unknown) {
  const input = raw && typeof raw === "object" ? raw as Record<string, unknown> : {}; const status = string(input.status, 60);
  const allowed = new Set(["AWAITING_PAYMENT", "AWAITING_CLIENT_DATA", "CLIENT_DATA_COMPLETE", "IMPLEMENTATION_STARTED", "CONFIGURATION", "TESTING", "AWAITING_CLIENT_APPROVAL", "SUBMITTED_GOOGLE_PLAY", "SUBMITTED_APPLE_APP_STORE", "AWAITING_STORE_DECISION", "PUBLISHED", "IMPLEMENTATION_COMPLETED", "IMPLEMENTATION_PAUSED"]);
  if (!allowed.has(status)) throw new Error("Invalid deployment status");
  const order = await env.DB.prepare("SELECT id FROM orders WHERE id=?").bind(orderId).first(); if (!order) throw new Error("Order not found");
  const id = crypto.randomUUID();
  await env.DB.prepare(`INSERT INTO deployment_statuses (id, order_id, status, expected_start_date, expected_ready_date, google_play_status, apple_app_store_status, note, changed_by_admin_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, orderId, status, string(input.expectedStartDate, 10) || null, string(input.expectedReadyDate, 10) || null,
      string(input.googlePlayStatus, 80) || null, string(input.appleAppStoreStatus, 80) || null, string(input.note, 1000) || null, admin.id).run();
  const after = await env.DB.prepare("SELECT * FROM deployment_statuses WHERE id=?").bind(id).first(); await auditAdmin(env, admin, "DEPLOYMENT_STATUS_ADDED", "Order", orderId, null, after); return after;
}

export async function createPriceVersion(env: TimzyEnv, admin: AdminPrincipal, raw: unknown) {
  const input = raw && typeof raw === "object" ? raw as Record<string, unknown> : {}; const rawKind = string(input.kind, 10);
  if (rawKind !== "plan" && rawKind !== "addon") throw new Error("Invalid price kind");
  const kind: "plan" | "addon" = rawKind;
  const table = kind === "plan" ? "plan_prices" : "addon_prices"; const foreignKey = kind === "plan" ? "plan_id" : "addon_id";
  const itemId = string(input.itemId, 80); const marketId = string(input.marketId, 80); const paymentType = kind === "plan" ? string(input.paymentType, 20) as PaymentType : null;
  if (!itemId || !marketId || (kind === "plan" && !["MONTHLY", "ONE_TIME"].includes(paymentType ?? ""))) throw new Error("Price scope is incomplete");
  const previous = await env.DB.prepare(`SELECT MAX(version) version FROM ${table} WHERE ${foreignKey} = ? AND market_id = ?${kind === "plan" ? " AND payment_type = ?" : ""}`)
    .bind(...(kind === "plan" ? [itemId, marketId, paymentType] : [itemId, marketId])).first<{ version: number | null }>();
  const market = await env.DB.prepare("SELECT code,currency FROM markets WHERE id = ?").bind(marketId).first<{ code: MarketCode; currency: string }>(); if (!market) throw new Error("Market not found");
  const id = crypto.randomUUID(); const version = (previous?.version ?? 0) + 1; const effectiveFrom = string(input.effectiveFrom, 40) || new Date().toISOString();
  const item = kind === "plan"
    ? await env.DB.prepare("SELECT p.internal_key,t.name,NULL payment_type FROM plans p LEFT JOIN plan_translations t ON t.plan_id=p.id AND t.language='en' WHERE p.id=?").bind(itemId).first<{ internal_key: string; name: string | null; payment_type: null }>()
    : await env.DB.prepare("SELECT a.internal_key,t.name,a.payment_type FROM addons a LEFT JOIN addon_translations t ON t.addon_id=a.id AND t.language='en' WHERE a.id=?").bind(itemId).first<{ internal_key: string; name: string | null; payment_type: PaymentType }>();
  if (!item) throw new Error("Catalogue item not found");
  const stripePaymentType: PaymentType | null = kind === "plan" ? paymentType : item.payment_type;
  if (!stripePaymentType || !["MONTHLY", "ONE_TIME"].includes(stripePaymentType)) throw new Error("Invalid catalogue payment type");
  const amountMinor = integer(input.amountMinor, 1); let stripeProductId = string(input.stripeProductId, 100); let stripePriceId = string(input.stripePriceId, 100);
  if (Boolean(stripeProductId) !== Boolean(stripePriceId)) throw new Error("Provide both Stripe Product and Price IDs, or leave both empty for automatic test creation");
  if (!stripeProductId && !stripePriceId) {
    const stripe = await createStripeCatalogPrice({ env, market: market.code, itemId, itemKind: kind, name: `Timzy · ${item.name ?? item.internal_key}`, currency: market.currency,
      paymentType: stripePaymentType, amountMinor, version });
    stripeProductId = stripe.productId; stripePriceId = stripe.priceId;
  }
  if (kind === "plan") await env.DB.prepare(`INSERT INTO plan_prices (id, plan_id, market_id, currency, payment_type, amount_minor, stripe_product_id, stripe_price_id, version, effective_from, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT')`).bind(id, itemId, marketId, market.currency, paymentType, amountMinor, stripeProductId, stripePriceId, version, effectiveFrom).run();
  else await env.DB.prepare(`INSERT INTO addon_prices (id, addon_id, market_id, currency, amount_minor, stripe_product_id, stripe_price_id, version, effective_from, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT')`).bind(id, itemId, marketId, market.currency, amountMinor, stripeProductId, stripePriceId, version, effectiveFrom).run();
  const after = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first(); await auditAdmin(env, admin, "PRICE_VERSION_CREATED", "Price", id, null, after, { kind }); return after;
}

export async function publishPriceVersion(env: TimzyEnv, admin: AdminPrincipal, id: string, kind: "plan" | "addon") {
  const table = kind === "plan" ? "plan_prices" : "addon_prices"; const foreignKey = kind === "plan" ? "plan_id" : "addon_id";
  const price = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first<Record<string, unknown>>();
  if (!price || !price.stripe_product_id || !price.stripe_price_id || Number(price.amount_minor) <= 0) throw new Error("A positive price and Stripe Product/Price IDs are required");
  const now = new Date().toISOString(); const binds = kind === "plan" ? [now, price[foreignKey], price.market_id, price.payment_type, id] : [now, price[foreignKey], price.market_id, id];
  await env.DB.batch([
    env.DB.prepare(`UPDATE ${table} SET status='ARCHIVED', archived_at=? WHERE ${foreignKey}=? AND market_id=? ${kind === "plan" ? "AND payment_type=?" : ""} AND status='ACTIVE' AND id<>?`).bind(...binds),
    env.DB.prepare(`UPDATE ${table} SET status='ACTIVE', archived_at=NULL WHERE id=?`).bind(id),
  ]);
  const after = await env.DB.prepare(`SELECT * FROM ${table} WHERE id=?`).bind(id).first(); await auditAdmin(env, admin, "PRICE_VERSION_PUBLISHED", "Price", id, price, after, { kind }); return after;
}

export async function createContractVersion(env: TimzyEnv, admin: AdminPrincipal, raw: unknown) {
  const input = raw && typeof raw === "object" ? raw as Record<string, unknown> : {}; const kind = string(input.kind, 20); const market = string(input.market, 20) as MarketCode; const language = string(input.language, 2) as Locale;
  if (!["AGREEMENT", "TERMS", "DPA", "PRIVACY"].includes(kind) || !["PL", "INTERNATIONAL"].includes(market) || !["pl", "en", "es"].includes(language)) throw new Error("Invalid document scope");
  const template = await env.DB.prepare("SELECT id FROM contract_templates WHERE kind=? AND market_code=? AND language=?").bind(kind, market, language).first<{ id: string }>();
  if (!template) throw new Error("Document template is unavailable");
  const previous = await env.DB.prepare("SELECT MAX(version) version FROM contract_versions WHERE template_id=?").bind(template.id).first<{ version: number | null }>();
  const title = string(input.title, 240); const sections = list(input.sections, 200); if (!title || sections.length === 0) throw new Error("Document content is incomplete");
  const contentJson = canonicalJson({ title, sections }); const id = crypto.randomUUID();
  await env.DB.prepare(`INSERT INTO contract_versions (id, template_id, version, content_json, content_hash, effective_from, status)
    VALUES (?, ?, ?, ?, ?, ?, 'DRAFT')`).bind(id, template.id, (previous?.version ?? 0) + 1, contentJson, await sha256(contentJson), string(input.effectiveFrom, 40) || new Date().toISOString()).run();
  const after = await env.DB.prepare("SELECT * FROM contract_versions WHERE id=?").bind(id).first(); await auditAdmin(env, admin, "CONTRACT_VERSION_CREATED", "ContractVersion", id, null, after); return after;
}

export async function publishContractVersion(env: TimzyEnv, admin: AdminPrincipal, id: string, legalApprovalReference: unknown) {
  const approval = string(legalApprovalReference, 240); if (!approval) throw new Error("A legal approval reference is required before publication");
  const version = await env.DB.prepare("SELECT * FROM contract_versions WHERE id=?").bind(id).first<Record<string, unknown>>(); if (!version) throw new Error("Document version not found");
  await env.DB.batch([
    env.DB.prepare("UPDATE contract_versions SET status='ARCHIVED' WHERE template_id=? AND status='ACTIVE' AND id<>?").bind(version.template_id, id),
    env.DB.prepare("UPDATE contract_versions SET status='ACTIVE', legal_approval_reference=?, published_by_admin_id=? WHERE id=?").bind(approval, admin.id, id),
  ]);
  const after = await env.DB.prepare("SELECT * FROM contract_versions WHERE id=?").bind(id).first(); await auditAdmin(env, admin, "CONTRACT_VERSION_PUBLISHED", "ContractVersion", id, version, after); return after;
}

export async function updateMarket(env: TimzyEnv, admin: AdminPrincipal, raw: unknown) {
  const input = raw && typeof raw === "object" ? raw as Record<string, unknown> : {}; const id = string(input.id, 80);
  const before = await env.DB.prepare("SELECT * FROM markets WHERE id=?").bind(id).first<Record<string, unknown>>(); if (!before) throw new Error("Market not found");
  const currency = string(input.currency, 3) || String(before.currency); const status = string(input.status, 20) || String(before.status);
  const sellerId = string(input.sellerId, 80) || String(before.seller_id); const technologyProviderId = string(input.technologyProviderId, 80) || String(before.technology_provider_id);
  if (!["PLN", "GBP", "EUR"].includes(currency) || !["DRAFT", "ACTIVE", "ARCHIVED"].includes(status)) throw new Error("Invalid market configuration");
  if ((before.code === "PL" && currency !== "PLN") || (before.code === "UK" && currency !== "GBP") || (before.code === "INTERNATIONAL" && currency !== "EUR")) throw new Error("Currency does not match the fixed market");
  const entities = await env.DB.prepare("SELECT id,postal_code,address_line_1,city,country_code FROM legal_entities WHERE id IN (?,?)").bind(sellerId, technologyProviderId).all<Record<string, unknown>>();
  if (entities.results.length < (sellerId === technologyProviderId ? 1 : 2)) throw new Error("Seller or technology provider does not exist");
  const seller = entities.results.find((entity) => entity.id === sellerId); if (status === "ACTIVE" && (!seller?.postal_code || !seller.address_line_1 || !seller.city || !seller.country_code)) throw new Error("Complete seller legal address is required before market activation");
  if (currency !== before.currency) { const used = await env.DB.prepare("SELECT COUNT(*) count FROM plan_prices WHERE market_id=? AND status='ACTIVE'").bind(id).first<{ count: number }>(); if ((used?.count ?? 0) > 0) throw new Error("Archive active prices before changing market currency"); }
  const billingCountries = [...new Set(list(input.billingCountries, 300).map((country) => country.toUpperCase()))];
  if (billingCountries.length === 0 || billingCountries.some((country) => !/^[A-Z]{2}$/.test(country))) throw new Error("Valid billing country codes are required");
  if ((before.code === "PL" && (billingCountries.length !== 1 || billingCountries[0] !== "PL")) ||
      (before.code === "UK" && (billingCountries.length !== 1 || billingCountries[0] !== "GB")) ||
      (before.code === "INTERNATIONAL" && (billingCountries.includes("PL") || billingCountries.includes("GB")))) throw new Error("Billing countries do not match the fixed market boundary");
  await env.DB.prepare(`UPDATE markets SET currency=?, seller_id=?, technology_provider_id=?, activation_fee_open_minor=?, activation_fee_annual_minor=?, activation_stripe_product_id=?, activation_stripe_price_id=?, default_deployment_days=?, billing_countries_json=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
    .bind(currency, sellerId, technologyProviderId, integer(input.activationFeeOpenMinor), integer(input.activationFeeAnnualMinor), string(input.activationStripeProductId, 100) || null,
      string(input.activationStripePriceId, 100) || null, integer(input.defaultDeploymentDays, 1, 365), canonicalJson(billingCountries), status, id).run();
  const after = await env.DB.prepare("SELECT * FROM markets WHERE id=?").bind(id).first(); await auditAdmin(env, admin, "MARKET_UPDATED", "Market", id, before, after); return after;
}

export async function updateLegalEntity(env: TimzyEnv, admin: AdminPrincipal, raw: unknown) {
  const input = raw && typeof raw === "object" ? raw as Record<string, unknown> : {}; const id = string(input.id, 80);
  const before = await env.DB.prepare("SELECT * FROM legal_entities WHERE id=?").bind(id).first<Record<string, unknown>>(); if (!before) throw new Error("Legal entity not found");
  const legalName = string(input.legalName, 200); const address = string(input.addressLine1, 240); const city = string(input.city, 120); const countryCode = string(input.countryCode, 2).toUpperCase(); const status = string(input.status, 20);
  if (!legalName || !address || !city || !/^[A-Z]{2}$/.test(countryCode) || !["DRAFT", "ACTIVE", "ARCHIVED"].includes(status)) throw new Error("Legal entity data is incomplete");
  if (status === "ACTIVE" && !string(input.postalCode, 24)) throw new Error("Postal code is required before activation");
  await env.DB.prepare(`UPDATE legal_entities SET legal_name=?,company_number=?,tax_id=?,registry_number=?,regon=?,address_line_1=?,postal_code=?,city=?,country_code=?,technology_provider=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
    .bind(legalName, string(input.companyNumber, 80) || null, string(input.taxId, 80) || null, string(input.registryNumber, 80) || null, string(input.regon, 80) || null,
      address, string(input.postalCode, 24) || null, city, countryCode, input.technologyProvider === true ? 1 : 0, status, id).run();
  const after = await env.DB.prepare("SELECT * FROM legal_entities WHERE id=?").bind(id).first(); await auditAdmin(env, admin, "LEGAL_ENTITY_UPDATED", "LegalEntity", id, before, after); return after;
}
