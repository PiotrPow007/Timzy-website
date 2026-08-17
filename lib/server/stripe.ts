import type { ClientLegalData, CommerceQuote, MarketCode } from "../commerce/types";
import { quoteRequiresSubscription } from "../commerce/pricing";
import { hmacSha256, timingSafeEqual } from "../commerce/security";
import type { TimzyEnv } from "./env";

type StripeObject = Record<string, unknown> & { id: string };
export type StripeEvent = { id: string; type: string; created: number; data: { object: StripeObject } };

function stripeKey(env: TimzyEnv, market: MarketCode): string {
  const key = market === "PL" ? env.STRIPE_PL_SECRET_KEY : env.STRIPE_INTERNATIONAL_SECRET_KEY;
  if (!key) throw new Error(`Stripe test key is not configured for ${market}`);
  if (!key.startsWith("sk_test_")) throw new Error("Live Stripe keys are blocked in this local implementation");
  return key;
}

export function stripeWebhookSecret(env: TimzyEnv, market: MarketCode): string {
  const secret = market === "PL" ? env.STRIPE_PL_WEBHOOK_SECRET : env.STRIPE_INTERNATIONAL_WEBHOOK_SECRET;
  if (!secret?.startsWith("whsec_")) throw new Error(`Stripe webhook secret is not configured for ${market}`);
  return secret;
}

async function stripePost(env: TimzyEnv, market: MarketCode, path: string, body: URLSearchParams, idempotencyKey: string): Promise<StripeObject> {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: { authorization: `Bearer ${stripeKey(env, market)}`, "content-type": "application/x-www-form-urlencoded", "idempotency-key": idempotencyKey },
    body,
  });
  const payload = await response.json() as StripeObject & { error?: { message?: string; code?: string } };
  if (!response.ok) throw new Error(`Stripe request failed: ${payload.error?.code ?? "unknown"} ${payload.error?.message ?? ""}`.trim());
  return payload;
}

function customerAddress(data: ClientLegalData) {
  return data.billingAddressDifferent
    ? { line1: data.billingAddress ?? "", postal_code: data.billingPostalCode ?? "", city: data.billingCity ?? "", country: data.billingCountry }
    : { line1: data.registeredAddress, postal_code: data.postalCode, city: data.city, country: data.billingCountry };
}

async function createCustomer(env: TimzyEnv, market: MarketCode, orderId: string, data: ClientLegalData): Promise<StripeObject> {
  const params = new URLSearchParams();
  params.set("name", data.legalName);
  params.set("email", data.businessEmail);
  params.set("phone", data.phone);
  const address = customerAddress(data);
  Object.entries(address).forEach(([key, value]) => params.set(`address[${key}]`, value));
  params.set("tax[validate_location]", "immediately");
  params.set("metadata[order_id]", orderId);
  params.set("metadata[market]", market);
  return stripePost(env, market, "customers", params, `customer:${market}:${orderId}`);
}

export async function createCheckoutSession(input: {
  env: TimzyEnv; market: MarketCode; orderId: string; orderNumber: string; quote: CommerceQuote; client: ClientLegalData; acceptanceRevision: number;
}): Promise<{ id: string; url: string; customerId: string; expiresAt: string | null }> {
  const { env, market, orderId, orderNumber, quote, client, acceptanceRevision } = input;
  const customer = await createCustomer(env, market, orderId, client);
  const baseUrl = (env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const params = new URLSearchParams();
  params.set("mode", quoteRequiresSubscription(quote) ? "subscription" : "payment");
  params.set("customer", customer.id);
  params.set("client_reference_id", orderId);
  params.set("success_url", `${baseUrl}/contract/success/?order=${encodeURIComponent(orderId)}&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${baseUrl}/contract/?checkout=cancelled`);
  params.set("automatic_tax[enabled]", "true");
  params.set("billing_address_collection", "auto");
  params.set("customer_update[address]", "never");
  params.set("tax_id_collection[enabled]", "true");
  params.set("tax_id_collection[required]", "if_supported");
  params.set("locale", client.communicationLanguage === "pl" ? "pl" : client.communicationLanguage === "es" ? "es" : "en");
  params.set("metadata[order_id]", orderId);
  params.set("metadata[order_number]", orderNumber);
  params.set("metadata[market]", market);
  params.set("metadata[quote_fingerprint]", quote.fingerprint);
  params.set("metadata[acceptance_revision]", String(acceptanceRevision));
  quote.lines.filter((line) => !line.included && line.totalAmountMinor > 0).forEach((line, index) => {
    if (!line.stripePriceId) throw new Error(`Stripe Price is not configured for ${line.name}`);
    params.set(`line_items[${index}][price]`, line.stripePriceId);
    params.set(`line_items[${index}][quantity]`, String(line.quantity));
  });
  if (quoteRequiresSubscription(quote)) {
    params.set("subscription_data[metadata][order_id]", orderId);
    params.set("subscription_data[metadata][contract_term]", quote.contractTerm);
  } else {
    params.set("payment_intent_data[metadata][order_id]", orderId);
  }
  const session = await stripePost(env, market, "checkout/sessions", params, `checkout:${market}:${orderId}:${quote.fingerprint}:${acceptanceRevision}`);
  if (typeof session.url !== "string") throw new Error("Stripe Checkout did not return a redirect URL");
  return { id: session.id, url: session.url, customerId: customer.id, expiresAt: typeof session.expires_at === "number" ? new Date(session.expires_at * 1000).toISOString() : null };
}

function stripeHexToBase64Url(hex: string): string {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  let binary = ""; bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function verifyStripeEvent(rawBody: string, signatureHeader: string | null, secret: string, now = Date.now()): Promise<StripeEvent> {
  if (!signatureHeader) throw new Error("Missing Stripe-Signature header");
  const values = signatureHeader.split(",").map((part) => part.trim().split("=", 2));
  const timestamp = Number(values.find(([key]) => key === "t")?.[1]);
  const signatures = values.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!Number.isFinite(timestamp) || signatures.length === 0 || Math.abs(now / 1000 - timestamp) > 300) throw new Error("Stale or malformed Stripe signature");
  const expected = await hmacSha256(`${timestamp}.${rawBody}`, secret);
  if (!signatures.some((signature) => /^[a-f0-9]{64}$/i.test(signature) && timingSafeEqual(stripeHexToBase64Url(signature), expected))) throw new Error("Invalid Stripe signature");
  const event = JSON.parse(rawBody) as StripeEvent;
  if (!event.id || !event.type || !event.data?.object?.id) throw new Error("Invalid Stripe event payload");
  return event;
}

export const handledStripeEvents = new Set([
  "checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "invoice.paid", "invoice.payment_failed",
  "customer.subscription.updated", "customer.subscription.deleted", "checkout.session.expired",
]);
