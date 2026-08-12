"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

type Locale = "en" | "pl" | "es";

type ContactCopy = {
  eyebrow: string;
  title: string;
  body: string;
  benefits: string[];
  name: string;
  company: string;
  email: string;
  phone: string;
  industry: string;
  industryPlaceholder: string;
  industries: Array<[string, string]>;
  message: string;
  messagePlaceholder: string;
  privacyStart: string;
  privacyLink: string;
  privacyEnd: string;
  captcha: string;
  refreshCaptcha: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
  captchaError: string;
  direct: string;
};

const copy: Record<Locale, ContactCopy> = {
  en: {
    eyebrow: "A DEMO FOR YOUR INDUSTRY",
    title: "See your booking journey under your brand.",
    body: "Tell us how your business works. We will show you the relevant Timzy modules and a booking journey shaped around your industry.",
    benefits: ["See the client and team journey", "Select the modules your business needs", "Get a clear next step and implementation scope"],
    name: "Name and surname",
    company: "Company / brand",
    email: "Business email",
    phone: "Phone (optional)",
    industry: "Industry",
    industryPlaceholder: "Choose your industry",
    industries: [["spa-beauty", "SPA, beauty or hair salon"], ["sport", "Sport club, golf or tennis"], ["car", "Car wash or detailing"], ["clinic", "Clinic or specialist practice"], ["expert", "Coach, trainer or consultant"], ["other", "Other service business"]],
    message: "What should Timzy help you improve? (optional)",
    messagePlaceholder: "For example: online bookings, deposits, calendars for 3 employees, vouchers… You can also leave this blank.",
    privacyStart: "I have read the ",
    privacyLink: "privacy information",
    privacyEnd: " and understand how Timzy will use my data to answer this enquiry.",
    captcha: "Security check",
    refreshCaptcha: "New question",
    submit: "See a demo for my industry",
    submitting: "Sending…",
    success: "Thank you. Your message has been sent to the Timzy team. We will reply by email.",
    error: "The message could not be sent. Please try again or email hello@timzy.app.",
    captchaError: "Please solve the new security question and try again.",
    direct: "Prefer email? Write directly to hello@timzy.app",
  },
  pl: {
    eyebrow: "DEMO DLA TWOJEJ BRANŻY",
    title: "Zobacz proces rezerwacji pod własną marką.",
    body: "Napisz krótko, jak działa Twoja firma. Pokażemy odpowiednie moduły Timzy i proces rezerwacji dopasowany do Twojej branży.",
    benefits: ["Zobaczysz proces klienta i zespołu", "Dobierzesz moduły do swojej firmy", "Poznasz jasny kolejny krok i zakres wdrożenia"],
    name: "Imię i nazwisko",
    company: "Firma / marka",
    email: "E-mail firmowy",
    phone: "Telefon (opcjonalnie)",
    industry: "Branża",
    industryPlaceholder: "Wybierz branżę",
    industries: [["spa-beauty", "SPA, beauty lub salon fryzjerski"], ["sport", "Klub sportowy, golf lub tenis"], ["car", "Myjnia lub detailing"], ["clinic", "Klinika lub gabinet specjalistyczny"], ["expert", "Trener, coach lub konsultant"], ["other", "Inna firma usługowa"]],
    message: "Co Timzy ma usprawnić w Twojej firmie? (opcjonalnie)",
    messagePlaceholder: "Np. rezerwacje online, zaliczki, grafiki 3 pracowników, vouchery… Możesz też zostawić to pole puste.",
    privacyStart: "Zapoznałem/am się z ",
    privacyLink: "informacją o przetwarzaniu danych",
    privacyEnd: " i rozumiem, jak Timzy wykorzysta moje dane, aby odpowiedzieć na zapytanie.",
    captcha: "Zabezpieczenie antyspamowe",
    refreshCaptcha: "Nowe pytanie",
    submit: "Zobacz demo dla swojej branży",
    submitting: "Wysyłanie…",
    success: "Dziękujemy. Wiadomość została wysłana do zespołu Timzy. Odpowiemy e-mailem.",
    error: "Nie udało się wysłać wiadomości. Spróbuj ponownie lub napisz na hello@timzy.app.",
    captchaError: "Rozwiąż nowe pytanie zabezpieczające i spróbuj ponownie.",
    direct: "Wolisz e-mail? Napisz bezpośrednio na hello@timzy.app",
  },
  es: {
    eyebrow: "DEMO PARA TU SECTOR",
    title: "Descubre el proceso de reserva con tu marca.",
    body: "Cuéntanos cómo funciona tu negocio. Te mostraremos los módulos y el proceso de reserva adecuados para tu sector.",
    benefits: ["Verás el recorrido del cliente y del equipo", "Elegirás los módulos adecuados", "Conocerás el siguiente paso y el alcance de implantación"],
    name: "Nombre y apellidos",
    company: "Empresa / marca",
    email: "Email profesional",
    phone: "Teléfono (opcional)",
    industry: "Sector",
    industryPlaceholder: "Elige tu sector",
    industries: [["spa-beauty", "SPA, beauty o peluquería"], ["sport", "Club deportivo, golf o tenis"], ["car", "Lavado o detailing"], ["clinic", "Clínica o consulta profesional"], ["expert", "Entrenador, coach o consultor"], ["other", "Otro negocio de servicios"]],
    message: "¿Qué debería mejorar Timzy en tu negocio? (opcional)",
    messagePlaceholder: "Por ejemplo: reservas online, depósitos, agendas para 3 empleados, vales… También puedes dejarlo en blanco.",
    privacyStart: "He leído la ",
    privacyLink: "información de privacidad",
    privacyEnd: " y entiendo cómo Timzy usará mis datos para responder a esta consulta.",
    captcha: "Comprobación de seguridad",
    refreshCaptcha: "Nueva pregunta",
    submit: "Ver demo para mi sector",
    submitting: "Enviando…",
    success: "Gracias. El mensaje se ha enviado al equipo de Timzy. Te responderemos por email.",
    error: "No se pudo enviar el mensaje. Inténtalo de nuevo o escribe a hello@timzy.app.",
    captchaError: "Resuelve la nueva pregunta de seguridad e inténtalo de nuevo.",
    direct: "¿Prefieres email? Escribe directamente a hello@timzy.app",
  },
};

const privacyPaths: Record<Locale, string> = {
  en: "/privacy-policy/",
  pl: "/pl/polityka-prywatnosci/",
  es: "/es/politica-privacidad/",
};

type Challenge = { question: string; token: string };

export function ContactSection({ locale, initialIndustry = "" }: { locale: Locale; initialIndustry?: string }) {
  const t = copy[locale];
  const startedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error" | "captcha">("idle");

  const loadChallenge = useCallback(async () => {
    try {
      const response = await fetch("/api/contact-challenge", { cache: "no-store" });
      if (!response.ok) throw new Error("challenge");
      setChallenge((await response.json()) as Challenge);
    } catch {
      setChallenge(null);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    startedAt.current = Date.now();
    const timeout = window.setTimeout(() => { void loadChallenge(); }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadChallenge]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challenge || status === "sending") return;
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"), company: form.get("company"), email: form.get("email"), phone: form.get("phone"),
          industry: form.get("industry"), message: form.get("message"), privacyAccepted: form.get("privacy") === "on",
          website: form.get("website"), captchaAnswer: form.get("captcha"), captchaToken: challenge.token,
          startedAt: startedAt.current, locale,
        }),
      });
      const result = (await response.json()) as { ok?: boolean; code?: string };
      if (!response.ok || !result.ok) {
        setStatus(result.code === "captcha" ? "captcha" : "error");
        await loadChallenge();
        return;
      }
      formRef.current?.reset();
      startedAt.current = Date.now();
      setStatus("success");
      await loadChallenge();
    } catch {
      setStatus("error");
      await loadChallenge();
    }
  }

  return <section className="contact-section" id="kontakt">
    <div className="contact-copy">
      <p className="eyebrow">{t.eyebrow}</p>
      <h2>{t.title}</h2>
      <p>{t.body}</p>
      <ul>{t.benefits.map((benefit) => <li key={benefit}><span>✓</span>{benefit}</li>)}</ul>
      <a href="mailto:hello@timzy.app">{t.direct}</a>
    </div>
    <form className="contact-form" ref={formRef} onSubmit={submit}>
      <div className="contact-form-grid">
        <label><span>{t.name} *</span><input name="name" autoComplete="name" maxLength={100} required /></label>
        <label><span>{t.company} *</span><input name="company" autoComplete="organization" maxLength={140} required /></label>
        <label><span>{t.email} *</span><input name="email" type="email" autoComplete="email" maxLength={180} required /></label>
        <label><span>{t.phone}</span><input name="phone" type="tel" autoComplete="tel" maxLength={40} /></label>
      </div>
      <label><span>{t.industry} *</span><select name="industry" defaultValue={initialIndustry} required><option value="" disabled>{t.industryPlaceholder}</option>{t.industries.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      <label><span>{t.message}</span><textarea name="message" rows={4} maxLength={2500} placeholder={t.messagePlaceholder} /></label>
      <div className="captcha-row">
        <label><span>{t.captcha}: {challenge?.question ?? "…"} *</span><input name="captcha" inputMode="numeric" autoComplete="off" pattern="[0-9]+" maxLength={3} required disabled={!challenge} /></label>
        <button type="button" className="captcha-refresh" onClick={() => void loadChallenge()}>{t.refreshCaptcha}</button>
      </div>
      <label className="privacy-check"><input name="privacy" type="checkbox" required /><span>{t.privacyStart}<a href={privacyPaths[locale]} target="_blank" rel="noreferrer">{t.privacyLink}</a>{t.privacyEnd} *</span></label>
      <div className="form-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <button className="button contact-submit" type="submit" disabled={!challenge || status === "sending"}>{status === "sending" ? t.submitting : t.submit}<span aria-hidden="true">→</span></button>
      <p className={`form-status form-status--${status}`} aria-live="polite">{status === "success" ? t.success : status === "captcha" ? t.captchaError : status === "error" ? t.error : ""}</p>
    </form>
  </section>;
}
