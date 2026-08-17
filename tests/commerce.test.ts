import assert from "node:assert/strict";
import test from "node:test";
import { calculateQuote, quoteHasStripePrices, quoteRequiresSubscription } from "../lib/commerce/pricing";
import { parseSelection } from "../lib/commerce/validation";
import type { CommerceCatalog, Locale, MarketCode, OrderSelection } from "../lib/commerce/types";

function catalog(market: MarketCode, language: Locale, options: { included?: boolean; planPrice?: number; addonPrice?: number } = {}): CommerceCatalog {
  const currency = market === "PL" ? "PLN" : "EUR";
  return {
    market: {
      id: `market-${market}`, code: market, currency, activationFeeOpenMinor: market === "PL" ? 39_900 : 9_900, activationFeeAnnualMinor: 0,
      activationStripeProductId: "prod_activation", activationStripePriceId: "price_activation", defaultDeploymentDays: 7, legalConfigurationComplete: true,
      seller: market === "PL" ? { code: "7SOFTWARE", legalName: "7Software sp. z o.o.", taxId: "5272813760", registryNumber: "0000687703", regon: "367876297", addressLine1: "al. Jana Pawła II 27", postalCode: "00-000", city: "Warszawa", countryCode: "PL" }
        : { code: "INNOVARE", legalName: "INNOVARE GROUP LTD", companyNumber: "12878269", addressLine1: "7 Bell Yard", postalCode: "WC2A 2JR", city: "London", countryCode: "GB" },
      technologyProvider: { code: "INNOVARE", legalName: "INNOVARE GROUP LTD", companyNumber: "12878269", addressLine1: "7 Bell Yard", postalCode: "WC2A 2JR", city: "London", countryCode: "GB" },
    },
    language,
    plans: [{ id: "plan-core", internalKey: "core", name: `${language}-Core`, description: "Core", benefits: [], includedFeatures: [], includedAddonIds: options.included ? ["addon-shop"] : [], recommended: true, displayOrder: 1, deploymentDays: 7,
      prices: [{ id: `plan-price-${market}`, amountMinor: options.planPrice ?? 10_000, currency, paymentType: "MONTHLY", version: 1, stripePriceId: "price_plan", stripeProductId: "prod_plan", effectiveFrom: "2026-01-01" }] }],
    addons: [
      { id: "addon-shop", internalKey: "shop", name: `${language}-Shop`, description: "Shop", paymentType: "MONTHLY", standalone: false, minQuantity: 1, maxQuantity: 2, deploymentDaysImpact: 2, displayOrder: 1, compatiblePlanIds: ["plan-core"], prices: [{ id: `addon-monthly-${market}`, amountMinor: options.addonPrice ?? 2_000, currency, paymentType: "MONTHLY", version: 1, stripePriceId: "price_addon_monthly", stripeProductId: "prod_addon_monthly", effectiveFrom: "2026-01-01" }] },
      { id: "addon-brand", internalKey: "brand", name: `${language}-Branding`, description: "Branding", paymentType: "ONE_TIME", standalone: true, minQuantity: 1, maxQuantity: 5, deploymentDaysImpact: 1, displayOrder: 2, compatiblePlanIds: [], prices: [{ id: `addon-once-${market}`, amountMinor: 5_000, currency, paymentType: "ONE_TIME", version: 1, stripePriceId: "price_addon_once", stripeProductId: "prod_addon_once", effectiveFrom: "2026-01-01" }] },
    ],
    documentVersions: { AGREEMENT: { id: "a", version: 1, contentHash: "a" }, TERMS: { id: "t", version: 1, contentHash: "t" }, DPA: { id: "d", version: 1, contentHash: "d" }, PRIVACY: { id: "p", version: 1, contentHash: "p" } },
    checkoutReady: true, blockers: [],
  };
}

function selection(market: MarketCode, language: Locale, term: "ANNUAL_12" | "OPEN_ENDED" = "ANNUAL_12"): OrderSelection {
  return { market, language, contractTerm: term, registrationCountry: market === "PL" ? "PL" : "ES", billingCountry: market === "PL" ? "PL" : "ES", planId: "plan-core", addons: [] };
}

for (const [market, seller, currency] of [["PL", "7Software sp. z o.o.", "PLN"], ["INTERNATIONAL", "INNOVARE GROUP LTD", "EUR"]] as const) {
  for (const language of ["pl", "en", "es"] as const) {
    test(`${market} + ${language} keeps seller and currency independent from language`, async () => {
      const quote = await calculateQuote(catalog(market, language), selection(market, language));
      assert.equal(quote.market.seller.legalName, seller); assert.equal(quote.currency, currency); assert.equal(quote.language, language);
    });
  }
}

test("12-month agreement has no activation fee", async () => { const quote = await calculateQuote(catalog("PL", "pl"), selection("PL", "pl")); assert.equal(quote.activationFeeMinor, 0); assert.equal(quote.dueTodayNetMinor, 10_000); assert.equal(quote.annualCommitmentNetMinor, 120_000); });
test("open-ended Polish agreement charges configurable 399 PLN activation", async () => { const quote = await calculateQuote(catalog("PL", "pl"), selection("PL", "pl", "OPEN_ENDED")); assert.equal(quote.activationFeeMinor, 39_900); assert.equal(quote.dueTodayNetMinor, 49_900); });
test("open-ended international agreement charges configurable 99 EUR activation", async () => { const quote = await calculateQuote(catalog("INTERNATIONAL", "en"), selection("INTERNATIONAL", "en", "OPEN_ENDED")); assert.equal(quote.activationFeeMinor, 9_900); assert.equal(quote.dueTodayNetMinor, 19_900); });
test("included add-on is displayed but never charged twice", async () => { const chosen = selection("PL", "pl"); chosen.addons = [{ addonId: "addon-shop", quantity: 1 }]; const quote = await calculateQuote(catalog("PL", "pl", { included: true }), chosen); const addOn = quote.lines.find((line) => line.catalogItemId === "addon-shop"); assert.equal(addOn?.included, true); assert.equal(addOn?.totalAmountMinor, 0); assert.equal(quote.monthlyNetMinor, 10_000); });
test("included add-on is present even when the browser does not submit it", async () => { const quote = await calculateQuote(catalog("PL", "pl", { included: true }), selection("PL", "pl")); const addOn = quote.lines.find((line) => line.catalogItemId === "addon-shop"); assert.equal(addOn?.included, true); assert.equal(addOn?.totalAmountMinor, 0); });
test("monthly add-on increases the recurring amount", async () => { const chosen = selection("PL", "pl"); chosen.addons = [{ addonId: "addon-shop", quantity: 2 }]; const quote = await calculateQuote(catalog("PL", "pl"), chosen); assert.equal(quote.monthlyNetMinor, 14_000); assert.equal(quote.deploymentDays, 11); });
test("one-time add-on is charged today but not on later invoices", async () => { const chosen = selection("INTERNATIONAL", "es"); chosen.addons = [{ addonId: "addon-brand", quantity: 2 }]; const quote = await calculateQuote(catalog("INTERNATIONAL", "es"), chosen); assert.equal(quote.oneTimeNetMinor, 10_000); assert.equal(quote.dueTodayNetMinor, 20_000); assert.equal(quote.nextMonthlyNetMinor, 10_000); });
test("language changes do not change price", async () => { const values = await Promise.all((["pl","en","es"] as const).map((language) => calculateQuote(catalog("INTERNATIONAL", language), selection("INTERNATIONAL", language)))); assert.deepEqual(values.map((quote) => quote.monthlyNetMinor), [10_000,10_000,10_000]); });
test("browser-supplied amount is discarded by parser and backend catalogue wins", async () => { const parsed = parseSelection({ ...selection("PL", "pl"), monthlyNetMinor: 1, price: 1 }); assert.equal("price" in parsed, false); const quote = await calculateQuote(catalog("PL", "pl"), parsed); assert.equal(quote.monthlyNetMinor, 10_000); });
test("billing-country mismatch blocks a quote before payment", async () => { const wrong = selection("PL", "en"); wrong.billingCountry = "DE"; await assert.rejects(() => calculateQuote(catalog("PL", "en"), wrong), /different market/); });
test("changing a published price changes the acceptance fingerprint", async () => { const first = await calculateQuote(catalog("PL", "pl", { planPrice: 10_000 }), selection("PL", "pl")); const second = await calculateQuote(catalog("PL", "pl", { planPrice: 11_000 }), selection("PL", "pl")); assert.notEqual(first.fingerprint, second.fingerprint); });
test("subscription mode is selected when any monthly item exists", async () => { const quote = await calculateQuote(catalog("PL", "pl"), selection("PL", "pl")); assert.equal(quoteRequiresSubscription(quote), true); });
test("all chargeable lines require Stripe Price IDs", async () => { const quote = await calculateQuote(catalog("PL", "pl"), selection("PL", "pl", "OPEN_ENDED")); assert.equal(quoteHasStripePrices(quote), true); quote.lines[0].stripePriceId = null; assert.equal(quoteHasStripePrices(quote), false); });
test("invalid add-on quantity is rejected", async () => { const chosen = selection("PL", "pl"); chosen.addons = [{ addonId: "addon-shop", quantity: 99 }]; await assert.rejects(() => calculateQuote(catalog("PL", "pl"), chosen), /Invalid quantity/); });
test("duplicate add-ons are rejected", async () => { const chosen = selection("PL", "pl"); chosen.addons = [{ addonId: "addon-shop", quantity: 1 }, { addonId: "addon-shop", quantity: 1 }]; await assert.rejects(() => calculateQuote(catalog("PL", "pl"), chosen), /only be selected once/); });
test("standalone one-time add-on can be purchased without a plan", async () => { const chosen = selection("INTERNATIONAL", "en"); chosen.planId = null; chosen.addons = [{ addonId: "addon-brand", quantity: 1 }]; const quote = await calculateQuote(catalog("INTERNATIONAL", "en"), chosen); assert.equal(quoteRequiresSubscription(quote), false); assert.equal(quote.oneTimeNetMinor, 5_000); });
test("non-standalone add-on is rejected without a plan", async () => { const chosen = selection("INTERNATIONAL", "en"); chosen.planId = null; chosen.addons = [{ addonId: "addon-shop", quantity: 1 }]; await assert.rejects(() => calculateQuote(catalog("INTERNATIONAL", "en"), chosen), /requires a plan/); });
