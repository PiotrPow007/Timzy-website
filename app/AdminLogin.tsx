"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLanguageSwitch, useAdminI18n } from "./AdminI18n";

export function AdminLogin() {
  const { locale, setLocale, t } = useAdminI18n();
  const [csrf, setCsrf] = useState(""); const [stage, setStage] = useState<"password" | "mfa">("password"); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { void fetch("/api/commerce/bootstrap", { credentials: "same-origin" }).then((response) => response.json() as Promise<{ csrfToken?: string }>).then((payload) => setCsrf(payload.csrfToken ?? "")).catch(() => setError(t("securityUnavailable"))); }, [t]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); const data = new FormData(event.currentTarget);
    try {
      const response = await fetch(stage === "password" ? "/api/admin/login" : "/api/admin/mfa", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json", "x-csrf-token": csrf }, body: JSON.stringify(stage === "password" ? { email: data.get("email"), password: data.get("password") } : { code: data.get("code") }) });
      const payload = await response.json() as { ok?: boolean; mfaRequired?: boolean; message?: string }; if (!response.ok || !payload.ok) throw new Error(payload.message || t("authenticationFailed"));
      if (stage === "password" && payload.mfaRequired !== false) setStage("mfa"); else window.location.assign("/admin/");
    } catch (failure) { setError(failure instanceof Error ? failure.message : t("authenticationFailed")); } finally { setBusy(false); }
  }
  return <main className="admin-login-page"><Link href="/" className="admin-login-logo"><img src="/assets/timzy-logo-official-purple.png" width="307" height="158" alt="Timzy" /></Link><AdminLanguageSwitch locale={locale} setLocale={setLocale} /><form className="admin-login-card" onSubmit={submit}><p className="eyebrow">{t("secureAdministration")}</p><h1>{stage === "password" ? t("signIn") : t("verifyMfa")}</h1><p>{stage === "password" ? t("loginDescription") : t("mfaDescription")}</p>{error ? <div className="contract-error" role="alert">{error}</div> : null}{stage === "password" ? <><label><span>{t("businessEmail")}</span><input name="email" type="email" autoComplete="username" required /></label><label><span>{t("password")}</span><input name="password" type="password" autoComplete="current-password" minLength={12} required /></label></> : <label><span>{t("authenticatorCode")}</span><input name="code" inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" maxLength={6} required /></label>}<button className="button" disabled={!csrf || busy}>{busy ? t("verifying") : stage === "password" ? t("continue") : t("verifyAndOpen")}</button><Link href="/">← Timzy</Link></form></main>;
}
