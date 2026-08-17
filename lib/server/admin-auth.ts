import { decryptJson, encryptJson, ipEvidence, parseCookies, passwordHash, randomToken, sha256, verifyPassword, verifyTotp } from "../commerce/security";
import type { TimzyEnv } from "./env";

export const ADMIN_COOKIE = "timzy_admin_session";
const GENERIC_LOGIN_ERROR = "Invalid credentials or verification code";

type AdminRow = {
  id: string; email: string; display_name: string; role: "ADMIN" | "SUPER_ADMIN"; password_salt: string; password_hash: string; password_iterations: number;
  totp_secret_encrypted: string; mfa_enabled: number; session_version: number; failed_login_count: number; locked_until: string | null; status: "ACTIVE" | "DISABLED";
};
type SessionRow = {
  id: string; admin_user_id: string; token_hash: string; csrf_hash: string; state: "MFA_PENDING" | "ACTIVE" | "REVOKED"; session_version: number;
  ip_evidence: string; user_agent_hash: string; expires_at: string; last_seen_at: string; email: string; display_name: string; role: "ADMIN" | "SUPER_ADMIN";
  user_session_version: number; user_status: "ACTIVE" | "DISABLED";
};

export type AdminPrincipal = { id: string; email: string; displayName: string; role: "ADMIN" | "SUPER_ADMIN"; sessionId: string; csrfToken?: string };

export function adminMfaRequired(env: Pick<TimzyEnv, "APP_ENV" | "ADMIN_MFA_REQUIRED">): boolean {
  if ((env.APP_ENV ?? "").trim().toLowerCase() === "production") return true;
  return (env.ADMIN_MFA_REQUIRED ?? "true").trim().toLowerCase() !== "false";
}

async function recordAttempt(env: TimzyEnv, request: Request, email: string, succeeded: boolean, reason: string) {
  const secret = env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  await env.DB.prepare("INSERT INTO login_attempts (id, email_hash, ip_evidence, succeeded, reason) VALUES (?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), await sha256(email), await ipEvidence(request, secret), succeeded ? 1 : 0, reason).run();
}

function normalizeEmail(value: unknown): string { return typeof value === "string" ? value.trim().toLowerCase().slice(0, 180) : ""; }

export async function beginAdminLogin(env: TimzyEnv, request: Request, rawEmail: unknown, rawPassword: unknown): Promise<{
  token: string; expiresAt: string; mfaRequired: boolean; csrfToken?: string;
  admin?: { id: string; email: string; displayName: string; role: "ADMIN" | "SUPER_ADMIN" };
}> {
  if (!env.SESSION_SECRET || !env.DATA_ENCRYPTION_KEY) throw new Error("Admin security secrets are not configured");
  const email = normalizeEmail(rawEmail); const password = typeof rawPassword === "string" ? rawPassword.slice(0, 1024) : "";
  const evidence = await ipEvidence(request, env.SESSION_SECRET); const recent = await env.DB.prepare("SELECT COUNT(*) count FROM login_attempts WHERE ip_evidence = ? AND created_at > ?")
    .bind(evidence, new Date(Date.now() - 15 * 60_000).toISOString()).first<{ count: number }>();
  if ((recent?.count ?? 0) >= 25) { await recordAttempt(env, request, email, false, "IP_RATE_LIMIT"); throw new Error(GENERIC_LOGIN_ERROR); }
  const user = email ? await env.DB.prepare("SELECT * FROM admin_users WHERE email = ?").bind(email).first<AdminRow>() : null;
  const dummySalt = "Q0RGeFh1aUxreWc5T3V1VnJqRw";
  const validPassword = user ? await verifyPassword(password, user.password_salt, user.password_iterations, user.password_hash) : Boolean(await passwordHash(password, dummySalt, 120_000)) && false;
  const locked = Boolean(user?.locked_until && user.locked_until > new Date().toISOString());
  const mfaRequired = adminMfaRequired(env);
  if (!user || !validPassword || locked || user.status !== "ACTIVE" || (mfaRequired && !user.mfa_enabled)) {
    if (user) {
      const failures = user.failed_login_count + 1; const lockUntil = failures >= 5 ? new Date(Date.now() + 15 * 60_000).toISOString() : null;
      await env.DB.prepare("UPDATE admin_users SET failed_login_count = ?, locked_until = COALESCE(?, locked_until), updated_at = ? WHERE id = ?")
        .bind(failures, lockUntil, new Date().toISOString(), user.id).run();
    }
    await recordAttempt(env, request, email, false, locked ? "LOCKED" : "PASSWORD_FAILED"); throw new Error(GENERIC_LOGIN_ERROR);
  }
  const token = randomToken(); const csrf = randomToken(); const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + (mfaRequired ? 5 * 60_000 : 8 * 60 * 60_000)).toISOString();
  const state = mfaRequired ? "MFA_PENDING" : "ACTIVE"; const sessionId = crypto.randomUUID();
  await env.DB.prepare(`INSERT INTO admin_sessions (id, admin_user_id, token_hash, csrf_hash, state, session_version, ip_evidence, user_agent_hash, expires_at, last_seen_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(sessionId, user.id, await sha256(token), await sha256(csrf), state, user.session_version, evidence, await sha256(request.headers.get("user-agent") ?? "unknown"), expiresAt, now).run();
  if (!mfaRequired) await env.DB.prepare("UPDATE admin_users SET failed_login_count=0, locked_until=NULL, last_login_at=?, updated_at=? WHERE id=?").bind(now, now, user.id).run();
  await recordAttempt(env, request, email, true, mfaRequired ? "PASSWORD_ACCEPTED_MFA_PENDING" : "PASSWORD_ACCEPTED_LOCAL");
  return {
    token, expiresAt, mfaRequired, csrfToken: mfaRequired ? undefined : csrf,
    admin: mfaRequired ? undefined : { id: user.id, email: user.email, displayName: user.display_name, role: user.role },
  };
}

async function sessionFromRequest(env: TimzyEnv, request: Request): Promise<SessionRow | null> {
  const token = parseCookies(request)[ADMIN_COOKIE];
  if (!token) return null;
  return env.DB.prepare(`SELECT s.*, u.email, u.display_name, u.role, u.session_version user_session_version, u.status user_status
    FROM admin_sessions s JOIN admin_users u ON u.id = s.admin_user_id WHERE s.token_hash = ?`).bind(await sha256(token)).first<SessionRow>();
}

export async function completeAdminMfa(env: TimzyEnv, request: Request, rawCode: unknown): Promise<AdminPrincipal> {
  if (!env.DATA_ENCRYPTION_KEY) throw new Error("DATA_ENCRYPTION_KEY is not configured");
  const session = await sessionFromRequest(env, request); const code = typeof rawCode === "string" ? rawCode.trim() : "";
  if (!session || session.state !== "MFA_PENDING" || session.expires_at < new Date().toISOString() || session.user_status !== "ACTIVE" || session.session_version !== session.user_session_version) throw new Error(GENERIC_LOGIN_ERROR);
  const user = await env.DB.prepare("SELECT * FROM admin_users WHERE id = ?").bind(session.admin_user_id).first<AdminRow>();
  if (!user) throw new Error(GENERIC_LOGIN_ERROR);
  const secret = await decryptJson<string>(user.totp_secret_encrypted, env.DATA_ENCRYPTION_KEY);
  if (!await verifyTotp(secret, code)) {
    await recordAttempt(env, request, user.email, false, "MFA_FAILED");
    await env.DB.prepare("UPDATE admin_users SET failed_login_count = failed_login_count + 1, locked_until = CASE WHEN failed_login_count + 1 >= 5 THEN ? ELSE locked_until END, updated_at = ? WHERE id = ?")
      .bind(new Date(Date.now() + 15 * 60_000).toISOString(), new Date().toISOString(), user.id).run();
    throw new Error(GENERIC_LOGIN_ERROR);
  }
  const csrf = randomToken(); const now = new Date().toISOString(); const expiresAt = new Date(Date.now() + 8 * 60 * 60_000).toISOString();
  await env.DB.batch([
    env.DB.prepare("UPDATE admin_sessions SET state = 'ACTIVE', csrf_hash = ?, expires_at = ?, last_seen_at = ? WHERE id = ?").bind(await sha256(csrf), expiresAt, now, session.id),
    env.DB.prepare("UPDATE admin_users SET failed_login_count = 0, locked_until = NULL, last_login_at = ?, updated_at = ? WHERE id = ?").bind(now, now, user.id),
  ]);
  await recordAttempt(env, request, user.email, true, "MFA_ACCEPTED");
  return { id: user.id, email: user.email, displayName: user.display_name, role: user.role, sessionId: session.id, csrfToken: csrf };
}

export async function requireAdmin(env: TimzyEnv, request: Request, options: { role?: "ADMIN" | "SUPER_ADMIN"; csrf?: boolean } = {}): Promise<AdminPrincipal> {
  if (!env.SESSION_SECRET) throw new Error("SESSION_SECRET is not configured");
  const session = await sessionFromRequest(env, request); const now = new Date().toISOString();
  if (!session || session.state !== "ACTIVE" || session.expires_at < now || session.user_status !== "ACTIVE" || session.session_version !== session.user_session_version) throw new Error("ADMIN_UNAUTHORIZED");
  if (options.role === "SUPER_ADMIN" && session.role !== "SUPER_ADMIN") throw new Error("ADMIN_FORBIDDEN");
  if (session.user_agent_hash !== await sha256(request.headers.get("user-agent") ?? "unknown")) throw new Error("ADMIN_UNAUTHORIZED");
  if (session.ip_evidence !== await ipEvidence(request, env.SESSION_SECRET)) throw new Error("ADMIN_UNAUTHORIZED");
  if (options.csrf) {
    const token = request.headers.get("x-csrf-token") ?? "";
    if (!token || session.csrf_hash !== await sha256(token)) throw new Error("CSRF_FAILED");
  }
  await env.DB.prepare("UPDATE admin_sessions SET last_seen_at = ? WHERE id = ?").bind(now, session.id).run();
  return { id: session.admin_user_id, email: session.email, displayName: session.display_name, role: session.role, sessionId: session.id };
}

export async function logoutAdmin(env: TimzyEnv, request: Request) {
  const session = await sessionFromRequest(env, request);
  if (session) await env.DB.prepare("UPDATE admin_sessions SET state = 'REVOKED' WHERE id = ?").bind(session.id).run();
}

export async function renewAdminCsrf(env: TimzyEnv, request: Request): Promise<{ principal: AdminPrincipal; csrfToken: string }> {
  const principal = await requireAdmin(env, request);
  const csrfToken = randomToken();
  await env.DB.prepare("UPDATE admin_sessions SET csrf_hash=? WHERE id=?").bind(await sha256(csrfToken), principal.sessionId).run();
  return { principal, csrfToken };
}

export async function encryptTotpSecret(secret: string, encryptionKey: string): Promise<string> { return encryptJson(secret, encryptionKey); }
