"use client";

import { useEffect } from "react";

export const GTM_ID = "GTM-MVQN5NX8";
export const CONSENT_KEY = "timzy-cookie-consent-v2";
const ATTRIBUTION_KEY = "timzy-attribution-v1";
export type AnalyticsConsent = "accepted" | "rejected";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown> | IArguments>;
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

export function enableAnalytics() {
  if (typeof window === "undefined" || document.getElementById("timzy-gtm")) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    "gtm.start": Date.now(),
    event: "gtm.js",
    ...analyticsContext(),
  });
  const script = document.createElement("script");
  script.id = "timzy-gtm";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);
}

export function Analytics() {
  useEffect(() => {
    if (hasAnalyticsConsent()) enableAnalytics();
    const onConsent = (event: Event) => {
      const detail = (event as CustomEvent<AnalyticsConsent>).detail;
      if (detail === "accepted") enableAnalytics();
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
