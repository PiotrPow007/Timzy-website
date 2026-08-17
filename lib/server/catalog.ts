import type { AddonCatalogItem, CatalogPrice, CommerceCatalog, LegalEntitySnapshot, Locale, MarketCatalog, MarketCode, PlanCatalogItem } from "../commerce/types";

type MarketRow = {
  id: string; code: MarketCode; currency: "PLN" | "GBP" | "EUR"; activation_fee_open_minor: number; activation_fee_annual_minor: number; default_deployment_days: number;
  activation_stripe_product_id: string | null; activation_stripe_price_id: string | null;
  seller_code: string; seller_name: string; seller_company_number: string | null; seller_tax_id: string | null; seller_registry_number: string | null;
  seller_regon: string | null; seller_address: string; seller_postal_code: string | null; seller_city: string; seller_country: string;
  provider_code: string; provider_name: string; provider_company_number: string | null; provider_tax_id: string | null; provider_registry_number: string | null;
  provider_regon: string | null; provider_address: string; provider_postal_code: string | null; provider_city: string; provider_country: string;
};

type PlanRow = { id: string; internal_key: string; included_features_json: string; recommended: number; display_order: number; deployment_days: number; name: string; description: string; benefits_json: string };
type AddonRow = { id: string; internal_key: string; payment_type: "MONTHLY" | "ONE_TIME"; standalone: number; min_quantity: number; max_quantity: number; deployment_days_impact: number; display_order: number; name: string; description: string };
type PriceRow = { id: string; amount_minor: number; currency: "PLN" | "GBP" | "EUR"; payment_type: "MONTHLY" | "ONE_TIME"; version: number; stripe_price_id: string | null; stripe_product_id: string | null; effective_from: string };

function parseArray(value: string): string[] { try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []; } catch { return []; } }

function entity(row: MarketRow, prefix: "seller" | "provider"): LegalEntitySnapshot {
  return {
    code: row[`${prefix}_code`], legalName: row[`${prefix}_name`], companyNumber: row[`${prefix}_company_number`], taxId: row[`${prefix}_tax_id`],
    registryNumber: row[`${prefix}_registry_number`], regon: row[`${prefix}_regon`], addressLine1: row[`${prefix}_address`], postalCode: row[`${prefix}_postal_code`],
    city: row[`${prefix}_city`], countryCode: row[`${prefix}_country`],
  };
}

async function pricesFor(db: D1Database, table: "plan_prices" | "addon_prices", foreignKey: "plan_id" | "addon_id", itemId: string, marketId: string): Promise<CatalogPrice[]> {
  const result = await db.prepare(`SELECT p.id, p.amount_minor, p.currency, p.payment_type, p.version, p.stripe_price_id, p.stripe_product_id, p.effective_from
    FROM ${table} p WHERE p.${foreignKey} = ? AND p.market_id = ? AND p.status = 'ACTIVE' AND p.effective_from <= ? AND p.archived_at IS NULL
    ORDER BY p.payment_type, p.version DESC`).bind(itemId, marketId, new Date().toISOString()).all<PriceRow>();
  const byType = new Map<string, CatalogPrice>();
  for (const price of result.results) if (!byType.has(price.payment_type)) byType.set(price.payment_type, {
    id: price.id, amountMinor: price.amount_minor, currency: price.currency, paymentType: price.payment_type, version: price.version,
    stripePriceId: price.stripe_price_id, stripeProductId: price.stripe_product_id, effectiveFrom: price.effective_from,
  });
  return [...byType.values()];
}

export async function loadCatalog(db: D1Database, marketCode: MarketCode, language: Locale): Promise<CommerceCatalog> {
  const row = await db.prepare(`SELECT m.id, m.code, m.currency, m.activation_fee_open_minor, m.activation_fee_annual_minor, m.activation_stripe_product_id, m.activation_stripe_price_id, m.default_deployment_days,
    s.code seller_code, s.legal_name seller_name, s.company_number seller_company_number, s.tax_id seller_tax_id, s.registry_number seller_registry_number,
    s.regon seller_regon, s.address_line_1 seller_address, s.postal_code seller_postal_code, s.city seller_city, s.country_code seller_country,
    t.code provider_code, t.legal_name provider_name, t.company_number provider_company_number, t.tax_id provider_tax_id, t.registry_number provider_registry_number,
    t.regon provider_regon, t.address_line_1 provider_address, t.postal_code provider_postal_code, t.city provider_city, t.country_code provider_country
    FROM markets m JOIN legal_entities s ON s.id = m.seller_id JOIN legal_entities t ON t.id = m.technology_provider_id
    WHERE m.code = ? AND m.status = 'ACTIVE'`).bind(marketCode).first<MarketRow>();
  if (!row) throw new Error("Market unavailable");
  const seller = entity(row, "seller");
  const technologyProvider = entity(row, "provider");
  const legalConfigurationComplete = Boolean(seller.addressLine1 && seller.city && seller.postalCode && seller.countryCode);
  const market: MarketCatalog = { id: row.id, code: row.code, currency: row.currency, activationFeeOpenMinor: row.activation_fee_open_minor, activationFeeAnnualMinor: row.activation_fee_annual_minor, defaultDeploymentDays: row.default_deployment_days,
    activationStripeProductId: row.activation_stripe_product_id, activationStripePriceId: row.activation_stripe_price_id, seller, technologyProvider, legalConfigurationComplete };

  const planRows = await db.prepare(`SELECT p.id, p.internal_key, p.included_features_json, p.recommended, p.display_order, p.deployment_days,
    tr.name, tr.description, tr.benefits_json FROM plans p JOIN plan_translations tr ON tr.plan_id = p.id AND tr.language = ?
    WHERE p.status = 'ACTIVE' ORDER BY p.display_order, p.id`).bind(language).all<PlanRow>();
  const plans: PlanCatalogItem[] = [];
  for (const plan of planRows.results) {
    const included = await db.prepare("SELECT addon_id FROM plan_included_addons WHERE plan_id = ?").bind(plan.id).all<{ addon_id: string }>();
    plans.push({ id: plan.id, internalKey: plan.internal_key, name: plan.name, description: plan.description, benefits: parseArray(plan.benefits_json),
      includedFeatures: parseArray(plan.included_features_json), includedAddonIds: included.results.map((item) => item.addon_id), recommended: Boolean(plan.recommended),
      displayOrder: plan.display_order, deploymentDays: plan.deployment_days, prices: await pricesFor(db, "plan_prices", "plan_id", plan.id, row.id) });
  }

  const addonRows = await db.prepare(`SELECT a.id, a.internal_key, a.payment_type, a.standalone, a.min_quantity, a.max_quantity, a.deployment_days_impact,
    a.display_order, tr.name, tr.description FROM addons a JOIN addon_translations tr ON tr.addon_id = a.id AND tr.language = ?
    WHERE a.status = 'ACTIVE' ORDER BY a.display_order, a.id`).bind(language).all<AddonRow>();
  const addons: AddonCatalogItem[] = [];
  for (const addon of addonRows.results) {
    const compatible = await db.prepare("SELECT plan_id FROM addon_compatible_plans WHERE addon_id = ?").bind(addon.id).all<{ plan_id: string }>();
    addons.push({ id: addon.id, internalKey: addon.internal_key, name: addon.name, description: addon.description, paymentType: addon.payment_type,
      standalone: Boolean(addon.standalone), minQuantity: addon.min_quantity, maxQuantity: addon.max_quantity, deploymentDaysImpact: addon.deployment_days_impact,
      displayOrder: addon.display_order, compatiblePlanIds: compatible.results.map((item) => item.plan_id), prices: await pricesFor(db, "addon_prices", "addon_id", addon.id, row.id) });
  }

  const legalMarketCode = marketCode === "UK" ? "INTERNATIONAL" : marketCode;
  const versions = await db.prepare(`SELECT ct.kind, cv.id, cv.version, cv.content_hash FROM contract_templates ct JOIN contract_versions cv ON cv.template_id = ct.id
    WHERE ct.market_code = ? AND ct.language = ? AND cv.status = 'ACTIVE' AND cv.effective_from <= ?
    AND cv.version = (SELECT MAX(v2.version) FROM contract_versions v2 WHERE v2.template_id = ct.id AND v2.status = 'ACTIVE' AND v2.effective_from <= ?)`)
    .bind(legalMarketCode, language, new Date().toISOString(), new Date().toISOString()).all<{ kind: "AGREEMENT" | "TERMS" | "DPA" | "PRIVACY"; id: string; version: number; content_hash: string }>();
  const documentVersions = versions.results.length === 4 ? Object.fromEntries(versions.results.map((version) => [version.kind, { id: version.id, version: version.version, contentHash: version.content_hash }])) as CommerceCatalog["documentVersions"] : null;
  const blockers: string[] = [];
  if (!legalConfigurationComplete) blockers.push("SELLER_LEGAL_DATA_INCOMPLETE");
  if (plans.length === 0 && !addons.some((addon) => addon.standalone)) blockers.push("NO_PUBLISHED_OFFER");
  if (!documentVersions) blockers.push("LEGAL_DOCUMENTS_NOT_PUBLISHED");
  if (plans.some((plan) => plan.prices.length === 0) || addons.some((addon) => addon.prices.length === 0)) blockers.push("CATALOG_PRICES_INCOMPLETE");
  return { market, language, plans, addons, documentVersions, checkoutReady: blockers.length === 0, blockers };
}
