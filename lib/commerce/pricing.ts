import type { AddonCatalogItem, CommerceCatalog, CommerceQuote, OrderSelection, QuoteLine } from "./types";
import { canonicalJson, sha256 } from "./security";

export class QuoteError extends Error {
  constructor(public readonly code: string, message: string) { super(message); }
}

function currentPrice(prices: CommerceCatalog["plans"][number]["prices"], paymentType?: "MONTHLY" | "ONE_TIME") {
  const eligible = prices.filter((price) => !paymentType || price.paymentType === paymentType).sort((left, right) => right.version - left.version);
  return eligible[0] ?? null;
}

function assertQuantity(addon: AddonCatalogItem, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < addon.minQuantity || quantity > addon.maxQuantity) {
    throw new QuoteError("INVALID_QUANTITY", `Invalid quantity for ${addon.internalKey}`);
  }
}

export async function calculateQuote(catalog: CommerceCatalog, selection: OrderSelection): Promise<CommerceQuote> {
  if (selection.market !== catalog.market.code || selection.language !== catalog.language) throw new QuoteError("CATALOG_MISMATCH", "Catalog scope does not match selection");
  const expectedMarket = selection.billingCountry.toUpperCase() === "PL" ? "PL" : "INTERNATIONAL";
  if (expectedMarket !== selection.market) throw new QuoteError("MARKET_COUNTRY_MISMATCH", "Billing country requires a different market");
  if (!catalog.market.legalConfigurationComplete) throw new QuoteError("LEGAL_CONFIGURATION_INCOMPLETE", "Seller legal data is incomplete");

  const plan = selection.planId ? catalog.plans.find((item) => item.id === selection.planId) : null;
  if (selection.planId && !plan) throw new QuoteError("INVALID_PLAN", "Selected plan is unavailable");
  const lines: QuoteLine[] = [];
  if (plan) {
    const price = currentPrice(plan.prices, "MONTHLY");
    if (!price) throw new QuoteError("PLAN_PRICE_UNAVAILABLE", "The selected plan has no active monthly price");
    lines.push({ itemType: "PLAN", catalogItemId: plan.id, priceVersionId: price.id, name: plan.name, paymentType: "MONTHLY", quantity: 1, unitAmountMinor: price.amountMinor, totalAmountMinor: price.amountMinor, stripePriceId: price.stripePriceId, included: false });
    const oneTime = currentPrice(plan.prices, "ONE_TIME");
    if (oneTime) lines.push({ itemType: "PLAN", catalogItemId: plan.id, priceVersionId: oneTime.id, name: `${plan.name} · setup`, paymentType: "ONE_TIME", quantity: 1, unitAmountMinor: oneTime.amountMinor, totalAmountMinor: oneTime.amountMinor, stripePriceId: oneTime.stripePriceId, included: false });
  }

  const selectedAddonIds = new Set<string>();
  const chosenAddons = [...selection.addons];
  for (const includedAddonId of plan?.includedAddonIds ?? []) {
    if (!chosenAddons.some((chosen) => chosen.addonId === includedAddonId)) {
      const includedAddon = catalog.addons.find((addon) => addon.id === includedAddonId);
      if (!includedAddon) throw new QuoteError("INVALID_INCLUDED_ADDON", "The plan contains an unavailable add-on");
      chosenAddons.push({ addonId: includedAddonId, quantity: includedAddon.minQuantity });
    }
  }
  let addonDeploymentDays = 0;
  for (const chosen of chosenAddons) {
    if (selectedAddonIds.has(chosen.addonId)) throw new QuoteError("DUPLICATE_ADDON", "An add-on can only be selected once");
    selectedAddonIds.add(chosen.addonId);
    const addon = catalog.addons.find((item) => item.id === chosen.addonId);
    if (!addon) throw new QuoteError("INVALID_ADDON", "Selected add-on is unavailable");
    assertQuantity(addon, chosen.quantity);
    if (!plan && !addon.standalone) throw new QuoteError("PLAN_REQUIRED", "This add-on requires a plan");
    if (plan && addon.compatiblePlanIds.length > 0 && !addon.compatiblePlanIds.includes(plan.id)) throw new QuoteError("INCOMPATIBLE_ADDON", "This add-on is not compatible with the selected plan");
    const included = Boolean(plan?.includedAddonIds.includes(addon.id));
    if (included) {
      lines.push({ itemType: "ADDON", catalogItemId: addon.id, priceVersionId: null, name: addon.name, paymentType: addon.paymentType, quantity: chosen.quantity, unitAmountMinor: 0, totalAmountMinor: 0, stripePriceId: null, included: true });
      continue;
    }
    const price = currentPrice(addon.prices, addon.paymentType);
    if (!price) throw new QuoteError("ADDON_PRICE_UNAVAILABLE", "The selected add-on has no active price");
    lines.push({ itemType: "ADDON", catalogItemId: addon.id, priceVersionId: price.id, name: addon.name, paymentType: addon.paymentType, quantity: chosen.quantity, unitAmountMinor: price.amountMinor, totalAmountMinor: price.amountMinor * chosen.quantity, stripePriceId: price.stripePriceId, included: false });
    addonDeploymentDays += addon.deploymentDaysImpact * chosen.quantity;
  }
  if (!plan && lines.every((line) => line.included)) throw new QuoteError("EMPTY_ORDER", "Select a plan or a standalone add-on");

  const activationFeeMinor = selection.contractTerm === "ANNUAL_12" ? catalog.market.activationFeeAnnualMinor : catalog.market.activationFeeOpenMinor;
  if (activationFeeMinor > 0) lines.push({ itemType: "ACTIVATION", catalogItemId: null, priceVersionId: null, name: "Activation fee", paymentType: "ONE_TIME", quantity: 1, unitAmountMinor: activationFeeMinor, totalAmountMinor: activationFeeMinor, stripePriceId: catalog.market.activationStripePriceId, included: false });
  const monthlyNetMinor = lines.filter((line) => line.paymentType === "MONTHLY" && !line.included).reduce((total, line) => total + line.totalAmountMinor, 0);
  const oneTimeNetMinor = lines.filter((line) => line.paymentType === "ONE_TIME" && !line.included).reduce((total, line) => total + line.totalAmountMinor, 0);
  if (monthlyNetMinor === 0 && oneTimeNetMinor === 0) throw new QuoteError("EMPTY_ORDER", "Order total must be greater than zero");
  const unsigned = {
    market: catalog.market, language: selection.language, currency: catalog.market.currency, contractTerm: selection.contractTerm, lines,
    monthlyNetMinor, oneTimeNetMinor, activationFeeMinor, estimatedTaxMinor: null, dueTodayNetMinor: monthlyNetMinor + oneTimeNetMinor,
    nextMonthlyNetMinor: monthlyNetMinor, annualCommitmentNetMinor: selection.contractTerm === "ANNUAL_12" ? monthlyNetMinor * 12 + oneTimeNetMinor : null,
    deploymentDays: Math.max(1, (plan?.deploymentDays ?? catalog.market.defaultDeploymentDays) + addonDeploymentDays),
  };
  return { ...unsigned, fingerprint: await sha256(canonicalJson(unsigned)) };
}

export function quoteRequiresSubscription(quote: CommerceQuote): boolean {
  return quote.lines.some((line) => line.paymentType === "MONTHLY" && !line.included && line.totalAmountMinor > 0);
}

export function quoteHasStripePrices(quote: CommerceQuote): boolean {
  return quote.lines.filter((line) => !line.included).every((line) => Boolean(line.stripePriceId));
}
