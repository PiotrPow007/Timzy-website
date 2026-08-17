import type { TimzyEnv } from "./env";
import type { AdminPrincipal } from "./admin-auth";
import { auditAdmin } from "./admin-data";

export async function runRetention(env: TimzyEnv, admin: AdminPrincipal) {
  const now = new Date().toISOString(); const draftCutoff = new Date(Date.now() - 30 * 24 * 60 * 60_000).toISOString();
  const expiredDocuments = await env.DB.prepare("SELECT id,r2_key FROM contract_documents WHERE retention_until < ?").bind(now).all<{ id: string; r2_key: string }>();
  const expiredVerificationDocuments = await env.DB.prepare(`SELECT id,r2_key FROM verification_documents WHERE retention_until < ? OR order_id IN
    (SELECT id FROM orders WHERE status IN ('DRAFT','AWAITING_ACCEPTANCE') AND updated_at < ?)`)
    .bind(now, draftCutoff).all<{ id: string; r2_key: string }>();
  for (const document of expiredDocuments.results) await env.DOCUMENTS.delete(document.r2_key);
  for (const document of expiredVerificationDocuments.results) await env.DOCUMENTS.delete(document.r2_key);
  const results = await env.DB.batch([
    env.DB.prepare("DELETE FROM document_access_logs WHERE document_id IN (SELECT id FROM contract_documents WHERE retention_until < ?)").bind(now),
    env.DB.prepare("DELETE FROM contract_documents WHERE retention_until < ?").bind(now),
    env.DB.prepare("DELETE FROM verification_documents WHERE retention_until < ? OR order_id IN (SELECT id FROM orders WHERE status IN ('DRAFT','AWAITING_ACCEPTANCE') AND updated_at < ?)").bind(now, draftCutoff),
    env.DB.prepare("DELETE FROM email_verification_challenges WHERE expires_at < ? OR order_id IN (SELECT id FROM orders WHERE status IN ('DRAFT','AWAITING_ACCEPTANCE') AND updated_at < ?)").bind(now, draftCutoff),
    env.DB.prepare("DELETE FROM second_signer_invites WHERE expires_at < ? OR signer_id IN (SELECT id FROM verification_signers WHERE order_id IN (SELECT id FROM orders WHERE status IN ('DRAFT','AWAITING_ACCEPTANCE') AND updated_at < ?))").bind(now, draftCutoff),
    env.DB.prepare("DELETE FROM verification_signers WHERE order_id IN (SELECT id FROM orders WHERE status IN ('DRAFT','AWAITING_ACCEPTANCE') AND updated_at < ?)").bind(draftCutoff),
    env.DB.prepare("DELETE FROM verification_status_history WHERE verification_id IN (SELECT id FROM company_verifications WHERE order_id IN (SELECT id FROM orders WHERE status IN ('DRAFT','AWAITING_ACCEPTANCE') AND updated_at < ?))").bind(draftCutoff),
    env.DB.prepare("DELETE FROM company_verifications WHERE order_id IN (SELECT id FROM orders WHERE status IN ('DRAFT','AWAITING_ACCEPTANCE') AND updated_at < ?)").bind(draftCutoff),
    env.DB.prepare("DELETE FROM registry_verification_cache WHERE expires_at < ?").bind(now),
    env.DB.prepare(`UPDATE orders SET status='EXPIRED', client_data_encrypted=NULL, client_data_hash=NULL, selection_json='{}', company_verification_id=NULL, verification_status='NOT_STARTED', updated_at=?
      WHERE status IN ('DRAFT','AWAITING_ACCEPTANCE') AND updated_at < ?`).bind(now, draftCutoff),
    env.DB.prepare("DELETE FROM login_attempts WHERE created_at < ?").bind(new Date(Date.now() - 180 * 24 * 60 * 60_000).toISOString()),
    env.DB.prepare("DELETE FROM rate_limits WHERE updated_at < ?").bind(new Date(Date.now() - 2 * 24 * 60 * 60_000).toISOString()),
    env.DB.prepare("DELETE FROM admin_sessions WHERE expires_at < ?").bind(new Date(Date.now() - 30 * 24 * 60 * 60_000).toISOString()),
  ]);
  const summary = { documentsDeleted: expiredDocuments.results.length, verificationDocumentsDeleted: expiredVerificationDocuments.results.length, databaseChanges: results.reduce((total, result) => total + (result.meta.changes ?? 0), 0), executedAt: now };
  await auditAdmin(env, admin, "RETENTION_EXECUTED", "RetentionPolicy", "default", null, summary); return summary;
}
