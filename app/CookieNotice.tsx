"use client";

import { useEffect, useState } from "react";
import { type AnalyticsConsent } from "./Analytics";
import { CONSENT_KEY } from "./GoogleTagManager";

const notices = {
  en: { title: "Your privacy choices", text: "Necessary technologies keep the website and form secure. Google Tag Manager loads with analytics and advertising consent denied so it can apply your choice. Analytics remains off until you accept and an analytics tag is configured.", accept: "Accept analytics", reject: "Necessary only", link: "Privacy and cookies", settings: "Cookie settings", href: "/privacy-policy/" },
  pl: { title: "Twoje ustawienia prywatności", text: "Niezbędne technologie zapewniają bezpieczeństwo strony i formularza. Google Tag Manager uruchamia się z odmową zgody na analitykę i reklamę, aby zastosować Twój wybór. Analityka pozostaje wyłączona do czasu akceptacji i skonfigurowania odpowiedniego tagu.", accept: "Akceptuję analitykę", reject: "Tylko niezbędne", link: "Prywatność i cookies", settings: "Ustawienia cookies", href: "/pl/polityka-prywatnosci/" },
  es: { title: "Tus opciones de privacidad", text: "Las tecnologías necesarias protegen el sitio y el formulario. Google Tag Manager se carga con el consentimiento analítico y publicitario denegado para aplicar tu elección. La analítica permanece desactivada hasta que aceptes y se configure una etiqueta analítica.", accept: "Aceptar analítica", reject: "Solo necesarias", link: "Privacidad y cookies", settings: "Configurar cookies", href: "/es/politica-privacidad/" },
};

export function CookieNotice() {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [locale, setLocale] = useState<keyof typeof notices>("en");
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const path = window.location.pathname;
      setLocale(path.startsWith("/pl") ? "pl" : path.startsWith("/es") ? "es" : "en");
      setVisible(window.localStorage.getItem(CONSENT_KEY) === null);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);
  const t = notices[locale];
  function choose(consent: AnalyticsConsent) {
    window.localStorage.setItem(CONSENT_KEY, consent);
    window.dispatchEvent(new CustomEvent("timzy-consent", { detail: consent }));
    setVisible(false);
    if (consent === "rejected") {
      document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0]?.trim();
        if (name?.startsWith("_ga") || name === "_gid" || name === "_gat") {
          document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
          document.cookie = `${name}=; Max-Age=0; path=/; domain=.timzy.app; SameSite=Lax`;
        }
      });
    }
  }
  if (!ready) return null;
  if (!visible) return <button className="cookie-settings" type="button" onClick={() => setVisible(true)}>{t.settings}</button>;
  return <div className="cookie-notice" role="dialog" aria-modal="false" aria-labelledby="cookie-title" aria-describedby="cookie-description"><strong id="cookie-title">{t.title}</strong><p id="cookie-description">{t.text}</p><div><a href={t.href}>{t.link}</a><button className="cookie-reject" type="button" onClick={() => choose("rejected")}>{t.reject}</button><button type="button" onClick={() => choose("accepted")}>{t.accept}</button></div></div>;
}
