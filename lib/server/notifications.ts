import { decryptJson, hmacSha256 } from "../commerce/security";
import type { ClientLegalData, CommerceQuote } from "../commerce/types";
import type { TimzyEnv } from "./env";
import type { OrderRow } from "./orders";

export type SendSystemEmail = (message: { to: string; subject: string; text: string }) => Promise<string>;
type Snapshot = { quote: CommerceQuote; encryptedDocumentBundle: string };

export async function signedDocumentLink(env: TimzyEnv, orderId: string, documentId: string, email: string, expires: number): Promise<string> {
  if (!env.SESSION_SECRET) throw new Error("SESSION_SECRET is not configured");
  const token = await hmacSha256(`${orderId}.${documentId}.${email}.${expires}`, env.SESSION_SECRET);
  const base = (env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}/api/commerce/documents/${encodeURIComponent(documentId)}?order=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}&expires=${expires}&token=${encodeURIComponent(token)}`;
}

async function emailBody(env: TimzyEnv, order: OrderRow, type: "CUSTOMER_CONTRACT" | "TEAM_NEW_CONTRACT", documentId: string) {
  if (!env.DATA_ENCRYPTION_KEY || !order.client_data_encrypted || !order.immutable_snapshot_json) throw new Error("Order archive is incomplete");
  const client = await decryptJson<ClientLegalData>(order.client_data_encrypted, env.DATA_ENCRYPTION_KEY);
  const snapshot = JSON.parse(order.immutable_snapshot_json) as Snapshot; const quote = snapshot.quote;
  const expires = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const documentLink = await signedDocumentLink(env, order.id, documentId, client.businessEmail, expires);
  const money = (minor: number) => `${(minor / 100).toFixed(2)} ${quote.currency}`;
  const implementation = quote.language === "pl" ? "Standardowe wdrożenie podstawowej wersji trwa około 7 dni roboczych po płatności oraz otrzymaniu kompletu prawidłowych danych, materiałów i akceptacji. Termin może zależeć od zakresu i zewnętrznej weryfikacji Google lub Apple."
    : quote.language === "es" ? "La implementación estándar de la versión básica tarda aproximadamente 7 días laborables desde el pago y la recepción de todos los datos, materiales y aprobaciones correctos. El plazo puede depender del alcance y de la revisión externa de Google o Apple."
      : "Standard implementation of the basic version takes approximately 7 business days after payment and receipt of complete, correct data, materials and approvals. Timing may depend on scope and external Google or Apple review.";
  if (type === "CUSTOMER_CONTRACT") return {
    subject: `Timzy · ${order.order_number} · contract confirmation`,
    text: [`Confirmation of the Timzy agreement`, "", `Order: ${order.order_number}`, `Seller: ${quote.market.seller.legalName}`, `Client: ${client.legalName}`,
      `Contract language: ${quote.language}`, `Market and currency: ${quote.market.code} · ${quote.currency}`, `Monthly net: ${money(quote.monthlyNetMinor)}`,
      `One-time net: ${money(quote.oneTimeNetMinor)}`, "", implementation, "", `Download the immutable accepted PDF: ${documentLink}`,
      "The link expires after 7 days. The document remains available through authorised support and the secured administration system."].join("\n"),
  };
  const adminLink = `${(env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "")}/admin/orders/${order.id}/`;
  return {
    subject: `Nowa umowa Timzy · ${order.order_number} · ${client.legalName}`,
    text: ["Nowa opłacona umowa Timzy", "", `Numer zamówienia: ${order.order_number}`, `Data płatności: ${order.paid_at ?? "brak"}`, "Status płatności: PAID",
      `Nazwa prawna: ${client.legalName}`, `Marka: ${client.brandName}`, `Kraj: ${client.billingCountry}`, `Rynek: ${quote.market.code}`, `Język: ${quote.language}`,
      `Waluta: ${quote.currency}`, `Reprezentant: ${client.representativeName}`, `Stanowisko: ${client.representativePosition}`, `E-mail: ${client.businessEmail}`,
      `Telefon: ${client.phone}`, `Adres rozliczeniowy: ${client.billingAddressDifferent ? `${client.billingAddress}, ${client.billingPostalCode} ${client.billingCity}` : `${client.registeredAddress}, ${client.postalCode} ${client.city}`}`,
      `NIP / VAT ID: ${client.taxId}`, `Numer rejestrowy: ${client.companyNumber || "nie podano"}`, `Wariant: ${quote.contractTerm}`,
      `Pozycje: ${quote.lines.map((line) => `${line.name} × ${line.quantity}`).join(", ")}`, `Jednorazowo netto: ${money(quote.oneTimeNetMinor)}`,
      `Miesięcznie netto: ${money(quote.monthlyNetMinor)}`, `Przewidywany czas wdrożenia: około ${quote.deploymentDays} dni roboczych, bez gwarancji terminu`,
      `Podatek wg Stripe: ${order.final_tax_minor === null ? "brak danych" : money(order.final_tax_minor)}`, `Pierwsza płatność brutto wg Stripe: ${order.final_total_minor === null ? "brak danych" : money(order.final_total_minor)}`,
      `Stripe Customer ID: ${order.stripe_customer_id ?? "brak"}`, `Stripe Checkout Session ID: ${order.stripe_checkout_session_id ?? "brak"}`, "", `Bezpieczny panel: ${adminLink}`].join("\n"),
  };
}

export async function queueOrderNotifications(env: TimzyEnv, order: OrderRow, client: ClientLegalData) {
  const team = env.NEW_CONTRACT_NOTIFICATION_EMAIL ?? "hello@timzy.app";
  await env.DB.batch([
    env.DB.prepare(`INSERT OR IGNORE INTO email_notifications (id, order_id, notification_type, recipient, status, idempotency_key)
      VALUES (?, ?, 'CUSTOMER_CONTRACT', ?, 'QUEUED', ?)`).bind(crypto.randomUUID(), order.id, client.businessEmail, `customer-contract:${order.id}`),
    env.DB.prepare(`INSERT OR IGNORE INTO email_notifications (id, order_id, notification_type, recipient, status, idempotency_key)
      VALUES (?, ?, 'TEAM_NEW_CONTRACT', ?, 'QUEUED', ?)`).bind(crypto.randomUUID(), order.id, team, `team-contract:${order.id}`),
  ]);
}

export async function processOrderNotifications(env: TimzyEnv, orderId: string, send: SendSystemEmail) {
  const order = await env.DB.prepare("SELECT * FROM orders WHERE id=?").bind(orderId).first<OrderRow>();
  const document = await env.DB.prepare("SELECT id FROM contract_documents WHERE order_id=? AND kind='BUNDLE' ORDER BY created_at DESC LIMIT 1").bind(orderId).first<{ id: string }>();
  if (!order || !document) throw new Error("Paid order document is unavailable");
  const pending = await env.DB.prepare("SELECT * FROM email_notifications WHERE order_id=? AND status IN ('QUEUED','FAILED') AND (next_attempt_at IS NULL OR next_attempt_at <= ?) ORDER BY created_at")
    .bind(orderId, new Date().toISOString()).all<{ id: string; notification_type: "CUSTOMER_CONTRACT" | "TEAM_NEW_CONTRACT"; recipient: string; attempt_count: number }>();
  for (const notification of pending.results) {
    const now = new Date().toISOString(); const claimed = await env.DB.prepare("UPDATE email_notifications SET status='SENDING', last_attempt_at=?, attempt_count=attempt_count+1, updated_at=? WHERE id=? AND status IN ('QUEUED','FAILED')").bind(now, now, notification.id).run();
    if ((claimed.meta.changes ?? 0) === 0) continue;
    try {
      const body = await emailBody(env, order, notification.notification_type, document.id); const messageId = await send({ to: notification.recipient, ...body });
      await env.DB.prepare("UPDATE email_notifications SET status='SENT', message_id=?, safe_error=NULL, next_attempt_at=NULL, updated_at=? WHERE id=?").bind(messageId, new Date().toISOString(), notification.id).run();
    } catch (error) {
      const attempts = notification.attempt_count + 1; const delayMinutes = Math.min(24 * 60, 2 ** Math.min(attempts, 10));
      await env.DB.prepare("UPDATE email_notifications SET status='FAILED', safe_error=?, next_attempt_at=?, updated_at=? WHERE id=?")
        .bind((error instanceof Error ? error.message : "Delivery failed").slice(0, 300), new Date(Date.now() + delayMinutes * 60_000).toISOString(), new Date().toISOString(), notification.id).run();
    }
  }
}
