"use client";

import { useEffect } from "react";
import { CONSENT_KEY } from "./GoogleTagManager";

const ATTRIBUTION_KEY = "timzy-attribution-v1";
export type AnalyticsConsent = "accepted" | "rejected";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown> | IArguments>;
    gtag?: (...args: unknown[]) => void;
  }
}

function hasAnalyticsConsent() {
  try {
    return window.localStorage.getItem(CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

export function analyticsContext() {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  const locale = path.startsWith("/pl") ? "pl" : path.startsWith("/es") ? "es" : "en";
  const industry = path.includes("car-wash-detailing") ? "automotive" : path.includes("beauty-spa") ? "beauty" : path.includes("golf") ? "golf" : path.includes("tennis") ? "tennis" : path.includes("sport") ? "sport" : "platform";
  let attribution = {
    acquisition_source: params.get("utm_source") || (document.referrer ? "referral" : "direct"),
    acquisition_medium: params.get("utm_medium") || "",
    acquisition_campaign: params.get("utm_campaign") || "",
    acquisition_referrer: document.referrer || "",
  };
  try {
    const stored = window.sessionStorage.getItem(ATTRIBUTION_KEY);
    if (stored) attribution = { ...attribution, ...JSON.parse(stored) };
    else window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch { /* Attribution still works for this page when session storage is unavailable. */ }
  return {
    page_locale: locale,
    page_industry: industry,
    page_path: path,
    ...attribution,
  };
}

export function trackEvent(event: string, details: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...analyticsContext(), ...details });
}

function updateConsentMode(consent: AnalyticsConsent) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("consent", "update", {
    analytics_storage: consent === "accepted" ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

export function Analytics() {
  useEffect(() => {
    let storedConsent: string | null = null;
    try { storedConsent = window.localStorage.getItem(CONSENT_KEY); } catch { /* Denied defaults remain in force. */ }
    if (storedConsent === "accepted" || storedConsent === "rejected") updateConsentMode(storedConsent);
    const onConsent = (event: Event) => {
      const detail = (event as CustomEvent<AnalyticsConsent>).detail;
      updateConsentMode(detail);
    };
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      if (href.startsWith("mailto:")) trackEvent("contact_email_click", { link_url: href });
      else if (href.startsWith("tel:")) trackEvent("contact_phone_click", { link_url: href });
      else if (href.includes("wa.me")) trackEvent("contact_whatsapp_click", { link_url: href });
      else if (href === "#kontakt" || href.endsWith("#kontakt")) trackEvent("demo_cta_click", { link_text: anchor.textContent?.trim() || "" });
    };
    window.addEventListener("timzy-consent", onConsent);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("timzy-consent", onConsent);
      document.removeEventListener("click", onClick);
    };
  }, []);
  return null;
}
