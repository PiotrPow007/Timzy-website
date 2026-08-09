"use client";

import { useEffect, useState } from "react";

const notices = {
  en: { text: "We use only technologies necessary for security, form operation and remembering your settings. We do not currently use advertising or analytics cookies.", button: "OK, understood", link: "Privacy and cookies", href: "/privacy-policy/" },
  pl: { text: "Używamy wyłącznie technologii niezbędnych do bezpieczeństwa, działania formularza i zapamiętania ustawień. Obecnie nie używamy cookies reklamowych ani analitycznych.", button: "OK, rozumiem", link: "Prywatność i cookies", href: "/pl/polityka-prywatnosci/" },
  es: { text: "Usamos únicamente tecnologías necesarias para la seguridad, el formulario y tus ajustes. Actualmente no usamos cookies publicitarias ni analíticas.", button: "OK, entendido", link: "Privacidad y cookies", href: "/es/politica-privacidad/" },
};

export function CookieNotice() {
  const [visible, setVisible] = useState(false);
  const [locale, setLocale] = useState<keyof typeof notices>("en");
  useEffect(() => {
    const path = window.location.pathname;
    setLocale(path.startsWith("/pl") ? "pl" : path.startsWith("/es") ? "es" : "en");
    setVisible(window.localStorage.getItem("timzy-cookie-notice-v1") !== "seen");
  }, []);
  if (!visible) return null;
  const t = notices[locale];
  return <aside className="cookie-notice" role="dialog" aria-label={t.link} aria-live="polite"><p>{t.text}</p><div><a href={t.href}>{t.link}</a><button type="button" onClick={() => { window.localStorage.setItem("timzy-cookie-notice-v1", "seen"); setVisible(false); }}>{t.button}</button></div></aside>;
}
