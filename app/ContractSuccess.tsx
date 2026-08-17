"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { trackEvent } from "./Analytics";

type Order = { orderNumber: string; status: string; language?: "pl" | "en" | "es"; paidAt?: string; deploymentDays?: number };
type DocumentView = { id: string; kind: string; plaintext_hash: string; downloadUrl: string };

const copy = {
  pl: { paid: "Płatność potwierdzona", failed: "Płatność nie powiodła się", pending: "Potwierdzamy płatność", paidText: "Webhook Stripe potwierdził płatność. Niezmienny dokument został zarchiwizowany, a wdrożenie przekazane do realizacji.", pendingText: "Status tej strony nie aktywuje usługi. System oczekuje na autorytatywne potwierdzenie webhooka Stripe.", implementation: "Status wdrożenia", timing: "Standardowy podstawowy zakres trwa około {days} dni roboczych po otrzymaniu kompletu materiałów. Termin nie jest gwarantowany.", documents: "Zaakceptowane dokumenty", download: "Pobierz PDF", back: "Wróć do Timzy" },
  en: { paid: "Payment confirmed", failed: "Payment failed", pending: "We are confirming the payment", paidText: "The Stripe webhook confirmed the payment. The immutable document has been archived and onboarding has been queued.", pendingText: "This page does not activate the service. The system is waiting for the authoritative Stripe webhook.", implementation: "Implementation status", timing: "The standard basic scope takes approximately {days} business days after complete materials are received. This is not a guaranteed deadline.", documents: "Accepted documents", download: "Download PDF", back: "Back to Timzy" },
  es: { paid: "Pago confirmado", failed: "El pago ha fallado", pending: "Estamos confirmando el pago", paidText: "El webhook de Stripe ha confirmado el pago. El documento inmutable se ha archivado y la implementación se ha puesto en cola.", pendingText: "Esta página no activa el servicio. El sistema espera la confirmación autoritativa del webhook de Stripe.", implementation: "Estado de implementación", timing: "El alcance básico estándar tarda aproximadamente {days} días laborables tras recibir todos los materiales. El plazo no está garantizado.", documents: "Documentos aceptados", download: "Descargar PDF", back: "Volver a Timzy" },
};

export function ContractSuccess() {
  const [order, setOrder] = useState<Order | null>(null); const [documents, setDocuments] = useState<DocumentView[]>([]); const [error, setError] = useState(""); const tracked = useRef("");
  useEffect(() => {
    let cancelled = false; let timeout = 0;
    const poll = async () => {
      try {
        const response = await fetch("/api/commerce/status", { credentials: "same-origin", cache: "no-store" }); const payload = await response.json() as { ok: boolean; order?: Order; message?: string };
        if (!response.ok || !payload.ok || !payload.order) throw new Error(payload.message || "Order status is unavailable");
        if (!cancelled) setOrder(payload.order);
        if (["PAID","PROVISIONING","ACTIVE"].includes(payload.order.status) && tracked.current !== "paid") { trackEvent("purchase_completed", { order_status: payload.order.status }); tracked.current = "paid"; const documentResponse = await fetch("/api/commerce/documents", { credentials: "same-origin", cache: "no-store" }); if (documentResponse.ok) { const documentPayload = await documentResponse.json() as { documents?: DocumentView[] }; setDocuments(documentPayload.documents ?? []); } }
        if (payload.order.status === "PAYMENT_FAILED" && tracked.current !== "failed") { trackEvent("payment_failed", { order_status: payload.order.status }); tracked.current = "failed"; }
        if (!cancelled && ["PENDING_PAYMENT","DRAFT","AWAITING_ACCEPTANCE"].includes(payload.order.status)) timeout = window.setTimeout(poll, 2500);
      } catch (failure) { if (!cancelled) setError(failure instanceof Error ? failure.message : "Status unavailable"); }
    };
    void poll(); return () => { cancelled = true; window.clearTimeout(timeout); };
  }, []);
  const paid = order && ["PAID","PROVISIONING","ACTIVE"].includes(order.status);
  const locale = order?.language ?? "en"; const t = copy[locale];
  return <main className="contract-success" lang={locale}><Link href={locale === "pl" ? "/pl/" : locale === "es" ? "/es/" : "/"}><img src="/assets/timzy-logo-official-purple.png" width="307" height="158" alt="Timzy" /></Link><div className={paid ? "success-mark is-paid" : "success-mark"}>{paid ? "✓" : "…"}</div><p className="eyebrow">{order?.orderNumber ?? "TIMZY"}</p><h1>{paid ? t.paid : order?.status === "PAYMENT_FAILED" ? t.failed : t.pending}</h1><p>{paid ? t.paidText : t.pendingText}</p>{order?.status === "PROVISIONING" || order?.status === "ACTIVE" ? <p>{t.implementation}: <b>{order.status}</b>. {t.timing.replace("{days}", String(order.deploymentDays ?? 7))}</p> : null}{documents.length ? <section className="success-documents"><h2>{t.documents}</h2>{documents.map((document) => <a key={document.id} href={document.downloadUrl}>{document.kind} · {t.download}</a>)}</section> : null}{error ? <div className="contract-error" role="alert">{error}</div> : null}<Link className="button" href={locale === "pl" ? "/pl/" : locale === "es" ? "/es/" : "/"}>{t.back}</Link></main>;
}
