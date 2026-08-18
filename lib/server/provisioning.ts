import { canonicalJson, decryptJson, hmacSha256 } from "../commerce/security";
import type { ClientLegalData } from "../commerce/types";
import type { TimzyEnv } from "./env";
import type { OrderRow } from "./orders";

export async function queueProvisioning(env: TimzyEnv, order: OrderRow) {
  const status = env.PROVISIONING_WEBHOOK_URL && env.PROVISIONING_WEBHOOK_SECRET ? "QUEUED" : "WAITING_CONFIGURATION";
  await env.DB.batch([
    env.DB.prepare(`INSERT OR IGNORE INTO provisioning_jobs (id, order_id, idempotency_key, status) VALUES (?, ?, ?, ?)`)
      .bind(crypto.randomUUID(), order.id, `provision:${order.id}`, status),
    env.DB.prepare(`INSERT INTO deployment_statuses (id, order_id, status, expected_start_date, expected_ready_date, note)
      SELECT ?, ?, 'AWAITING_CLIENT_DATA', ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM deployment_statuses WHERE order_id=? AND status='AWAITING_CLIENT_DATA')`)
      .bind(crypto.randomUUID(), order.id, new Date().toISOString().slice(0, 10), new Date(Date.now() + (order.deployment_days ?? 7) * 86_400_000).toISOString().slice(0, 10), "Payment confirmed; awaiting complete onboarding materials.", order.id),
  ]);
}

export async function processProvisioning(env: TimzyEnv, orderId: string) {
  const job = await env.DB.prepare("SELECT * FROM provisioning_jobs WHERE order_id=?").bind(orderId).first<{ id: string; status: string; attempt_count: number; idempotency_key: string }>();
  if (!job || ["SUCCEEDED", "RUNNING"].includes(job.status)) return;
  if (!env.PROVISIONING_WEBHOOK_URL || !env.PROVISIONING_WEBHOOK_SECRET || !env.DATA_ENCRYPTION_KEY) {
    await env.DB.prepare("UPDATE provisioning_jobs SET status='WAITING_CONFIGURATION', safe_error='Provisioning endpoint is not configured', updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(job?.id).run(); return;
  }
  const order = await env.DB.prepare("SELECT * FROM orders WHERE id=? AND status IN ('PAID','PROVISIONING')").bind(orderId).first<OrderRow>();
  if (!order?.client_data_encrypted || !order.immutable_snapshot_json) throw new Error("Paid order snapshot is unavailable");
  const client = await decryptJson<ClientLegalData>(order.client_data_encrypted, env.DATA_ENCRYPTION_KEY); const snapshot = JSON.parse(order.immutable_snapshot_json) as { quote: unknown };
  const brandAssets = await env.DB.prepare("SELECT id,kind,file_name,content_type,plaintext_hash,byte_length FROM order_assets WHERE order_id=? ORDER BY kind").bind(order.id).all<Record<string, unknown>>();
  const payload = canonicalJson({ schemaVersion: 2, orderId: order.id, orderNumber: order.order_number, sellerMarket: order.market_code, language: order.language,
    legalTenantData: client, brandAssets: brandAssets.results, acceptedOffer: snapshot.quote, paidAt: order.paid_at });
  const now = new Date().toISOString();
  const claimed = await env.DB.prepare("UPDATE provisioning_jobs SET status='RUNNING', attempt_count=attempt_count+1, updated_at=? WHERE id=? AND status IN ('QUEUED','FAILED')").bind(now, job.id).run();
  if ((claimed.meta.changes ?? 0) === 0) return;
  await env.DB.prepare("UPDATE orders SET status='PROVISIONING', updated_at=? WHERE id=? AND status='PAID'").bind(now, order.id).run();
  try {
    const response = await fetch(env.PROVISIONING_WEBHOOK_URL, { method: "POST", headers: { "content-type": "application/json", "x-timzy-signature": await hmacSha256(payload, env.PROVISIONING_WEBHOOK_SECRET), "idempotency-key": job.idempotency_key }, body: payload });
    if (!response.ok) throw new Error(`Provisioning returned HTTP ${response.status}`);
    const result = await response.json() as { tenantId?: string; status?: string };
    if (!result.tenantId) throw new Error("Provisioning response has no tenant ID");
    await env.DB.batch([
      env.DB.prepare("UPDATE provisioning_jobs SET status='SUCCEEDED', external_tenant_id=?, safe_error=NULL, updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(result.tenantId, job.id),
      env.DB.prepare("UPDATE orders SET status='ACTIVE', updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(order.id),
      env.DB.prepare("INSERT INTO deployment_statuses (id, order_id, status, note) VALUES (?, ?, 'IMPLEMENTATION_STARTED', ?)").bind(crypto.randomUUID(), order.id, `Tenant ${result.tenantId} created idempotently.`),
    ]);
  } catch (error) {
    const attempts = job.attempt_count + 1; const next = new Date(Date.now() + Math.min(24 * 60, 2 ** Math.min(attempts, 10)) * 60_000).toISOString();
    await env.DB.prepare("UPDATE provisioning_jobs SET status='FAILED', safe_error=?, next_attempt_at=?, updated_at=CURRENT_TIMESTAMP WHERE id=?")
      .bind((error instanceof Error ? error.message : "Provisioning failed").slice(0, 300), next, job.id).run();
  }
}
