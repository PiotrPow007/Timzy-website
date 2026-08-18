import assert from "node:assert/strict";
import test from "node:test";
import type { ClientLegalData, CommerceQuote, MarketCatalog } from "../lib/commerce/types";
import { createCheckoutSession, createStripeCatalogPrice } from "../lib/server/stripe";
import type { TimzyEnv } from "../lib/server/env";

const market: MarketCatalog = {
  id: "market_pl", code: "PL", currency: "PLN", activationFeeOpenMinor: 39_900, activationFeeAnnualMinor: 0,
  activationStripeProductId: "prod_activation", activationStripePriceId: "price_activation", defaultDeploymentDays: 7, legalConfigurationComplete: true,
  seller: { code: "7SOFTWARE", legalName: "7Software sp. z o.o.", taxId: "5272813760", addressLine1: "Test", postalCode: "00-001", city: "Warszawa", countryCode: "PL" },
  technologyProvider: { code: "INNOVARE", legalName: "INNOVARE GROUP LTD", companyNumber: "12878269", addressLine1: "7 Bell Yard", postalCode: "WC2A 2JR", city: "London", countryCode: "GB" },
};

const client: ClientLegalData = {
  legalName: "Client sp. z o.o.", legalForm: "sp. z o.o.", registrationCountry: "PL", registeredAddress: "ul. Testowa 1", postalCode: "00-001", city: "Warszawa",
  billingAddressDifferent: false, billingCountry: "PL", taxId: "PL123", companyNumber: "0000123456", entityType: "PL_KRS", registryName: "Krajowy Rejestr Sądowy", representativeName: "Jan Test", representativePosition: "Prezes", representativeAuthorityBasis: "Samodzielna reprezentacja zgodnie z KRS", businessEmail: "jan@example.com",
  phone: "+48123456789", brandName: "Client", appName: "Client App", appContactEmail: "kontakt@example.com", communicationLanguage: "pl", authorityConfirmed: true, companyDataConfirmed: true,
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

test("catalogue price creation creates a reusable Product and a monthly Price", async () => {
  const calls: Array<{ url: string; init: RequestInit; body: URLSearchParams }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input); const body = new URLSearchParams(String(init?.body ?? "")); calls.push({ url, init: init ?? {}, body });
    return Response.json(url.endsWith("/products") ? { id: "prod_auto" } : { id: "price_auto" });
  }) as typeof fetch;
  try {
    const result = await createStripeCatalogPrice({
      env: { STRIPE_PL_SECRET_KEY: "sk_test_local" } as TimzyEnv,
      market: "PL", itemId: "plan-core", itemKind: "plan", name: "Timzy · Core", currency: "PLN", paymentType: "MONTHLY", amountMinor: 39_900, version: 2,
    });
    assert.deepEqual(result, { productId: "prod_auto", priceId: "price_auto" });
    assert.equal(calls[0].body.get("metadata[timzy_market]"), "PL");
    assert.equal(calls[1].body.get("product"), "prod_auto");
    assert.equal(calls[1].body.get("currency"), "pln");
    assert.equal(calls[1].body.get("unit_amount"), "39900");
    assert.equal(calls[1].body.get("recurring[interval]"), "month");
    assert.equal((calls[0].init.headers as Record<string, string>)["idempotency-key"], "timzy-product:PL:plan:plan-core");
  } finally { globalThis.fetch = originalFetch; }
});

test("one-time catalogue price does not add recurring parameters", async () => {
  const bodies: URLSearchParams[] = []; const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    bodies.push(new URLSearchParams(String(init?.body ?? "")));
    return Response.json(String(input).endsWith("/products") ? { id: "prod_once" } : { id: "price_once" });
  }) as typeof fetch;
  try {
    await createStripeCatalogPrice({ env: { STRIPE_INTERNATIONAL_SECRET_KEY: "sk_test_local" } as TimzyEnv, market: "INTERNATIONAL", itemId: "activation", itemKind: "activation", name: "Timzy · Activation", currency: "EUR", paymentType: "ONE_TIME", amountMinor: 9_900, version: 1 });
    assert.equal(bodies[1].has("recurring[interval]"), false);
  } finally { globalThis.fetch = originalFetch; }
});

test("UK catalogue creates a GBP Price on the international Stripe test account", async () => {
  const calls: Array<{ init: RequestInit; body: URLSearchParams }> = []; const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
    const body = new URLSearchParams(String(init?.body ?? "")); calls.push({ init: init ?? {}, body });
    return Response.json(calls.length === 1 ? { id: "prod_uk" } : { id: "price_uk" });
  }) as typeof fetch;
  try {
    await createStripeCatalogPrice({ env: { STRIPE_INTERNATIONAL_SECRET_KEY: "sk_test_international" } as TimzyEnv, market: "UK", itemId: "plan-core", itemKind: "plan", name: "Timzy · Basic", currency: "GBP", paymentType: "MONTHLY", amountMinor: 3_900, version: 1 });
    assert.equal((calls[0].init.headers as Record<string, string>).authorization, "Bearer sk_test_international");
    assert.equal(calls[1].body.get("currency"), "gbp");
    assert.equal(calls[1].body.get("recurring[interval]"), "month");
  } finally { globalThis.fetch = originalFetch; }
});
