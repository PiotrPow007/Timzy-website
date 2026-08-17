import assert from "node:assert/strict";
import test from "node:test";
import type { ClientLegalData, CommerceQuote, MarketCatalog } from "../lib/commerce/types";
import { createCheckoutSession } from "../lib/server/stripe";
import type { TimzyEnv } from "../lib/server/env";

const market: MarketCatalog = {
  id: "market_pl", code: "PL", currency: "PLN", activationFeeOpenMinor: 35_900, activationFeeAnnualMinor: 0,
  activationStripeProductId: "prod_activation", activationStripePriceId: "price_activation", defaultDeploymentDays: 7, legalConfigurationComplete: true,
  seller: { code: "7SOFTWARE", legalName: "7Software sp. z o.o.", taxId: "5272813760", addressLine1: "Test", postalCode: "00-001", city: "Warszawa", countryCode: "PL" },
  technologyProvider: { code: "INNOVARE", legalName: "INNOVARE GROUP LTD", companyNumber: "12878269", addressLine1: "7 Bell Yard", postalCode: "WC2A 2JR", city: "London", countryCode: "GB" },
};

const client: ClientLegalData = {
  legalName: "Client sp. z o.o.", legalForm: "sp. z o.o.", registrationCountry: "PL", registeredAddress: "ul. Testowa 1", postalCode: "00-001", city: "Warszawa",
  billingAddressDifferent: false, billingCountry: "PL", taxId: "PL123", representativeName: "Jan Test", representativePosition: "Prezes", businessEmail: "jan@example.com",
  phone: "+48123456789", brandName: "Client", appName: "Client App", communicationLanguage: "pl", authorityConfirmed: true,
};

function quote(paymentType: "MONTHLY" | "ONE_TIME"): CommerceQuote {
  const amount = 10_000;
  return {
    market, language: "pl", currency: "PLN", contractTerm: "ANNUAL_12", lines: [{ itemType: paymentType === "MONTHLY" ? "PLAN" : "ADDON", catalogItemId: "item", priceVersionId: "price-v1", name: "Item", paymentType, quantity: 1, unitAmountMinor: amount, totalAmountMinor: amount, stripePriceId: "price_test_item", included: false }],
    monthlyNetMinor: paymentType === "MONTHLY" ? amount : 0, oneTimeNetMinor: paymentType === "ONE_TIME" ? amount : 0, activationFeeMinor: 0, estimatedTaxMinor: null,
    dueTodayNetMinor: amount, nextMonthlyNetMinor: paymentType === "MONTHLY" ? amount : 0, annualCommitmentNetMinor: paymentType === "MONTHLY" ? amount * 12 : null,
    deploymentDays: 7, fingerprint: `fingerprint-${paymentType}`,
  };
}

async function captureCheckout(commerceQuote: CommerceQuote) {
  const calls: Array<{ url: string; init: RequestInit; body: URLSearchParams }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input); const body = new URLSearchParams(String(init?.body ?? "")); calls.push({ url, init: init ?? {}, body });
    return Response.json(url.endsWith("/customers") ? { id: "cus_test" } : { id: "cs_test", url: "https://checkout.stripe.com/c/pay/test", customer: "cus_test", expires_at: 1_800_000_000 });
  }) as typeof fetch;
  try {
    const env = { STRIPE_PL_SECRET_KEY: "sk_test_local", APP_BASE_URL: "https://timzy.test" } as TimzyEnv;
    const result = await createCheckoutSession({ env, market: "PL", orderId: "order-1", orderNumber: "TZ-1", quote: commerceQuote, client, acceptanceRevision: 3 });
    return { calls, result };
  } finally { globalThis.fetch = originalFetch; }
}

test("subscription Checkout keeps recurring mode and server-calculated Price", async () => {
  const { calls, result } = await captureCheckout(quote("MONTHLY")); const checkout = calls[1];
  assert.equal(checkout.body.get("mode"), "subscription"); assert.equal(checkout.body.get("line_items[0][price]"), "price_test_item");
  assert.equal(checkout.body.get("subscription_data[metadata][order_id]"), "order-1"); assert.equal(result.customerId, "cus_test");
  assert.match(String((checkout.init.headers as Record<string, string>)["idempotency-key"]), /^checkout:PL:order-1:/);
});

test("one-time-only Checkout uses payment mode", async () => {
  const { calls } = await captureCheckout(quote("ONE_TIME")); const checkout = calls[1];
  assert.equal(checkout.body.get("mode"), "payment"); assert.equal(checkout.body.get("payment_intent_data[metadata][order_id]"), "order-1");
  assert.equal(checkout.body.has("subscription_data[metadata][order_id]"), false);
});

test("live Stripe keys are rejected before any Checkout request", async () => {
  const env = { STRIPE_PL_SECRET_KEY: "sk_live_forbidden", APP_BASE_URL: "https://timzy.test" } as TimzyEnv;
  await assert.rejects(() => createCheckoutSession({ env, market: "PL", orderId: "order-1", orderNumber: "TZ-1", quote: quote("MONTHLY"), client, acceptanceRevision: 1 }), /Live Stripe keys are blocked/);
});
