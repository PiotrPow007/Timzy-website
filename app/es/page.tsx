import type { Metadata } from "next";
import { LandingPage, landingCopy } from "../LandingPage";

export const metadata: Metadata = {
  title: "Una app de reservas con tu marca",
  description:
    "Reservas, agendas, pagos, fidelización y ventas en una app separada para iOS y Android, sin ofertas competidoras ni comisión Timzy por reserva.",
  alternates: {
    canonical: "/es/",
    languages: { "en-GB": "/", "pl-PL": "/pl/", "es-ES": "/es/", "x-default": "/" },
  },
  openGraph: { url: "/es/", title: "App y sistema de reservas online con tu marca | Timzy", description: "Reservas online, fidelización y ventas en una app iOS y Android independiente con la marca de tu negocio." },
};

export default function SpanishHome() {
  return <LandingPage copy={landingCopy.es} locale="es" />;
}
