import type { Metadata } from "next";
import { LandingPage, landingCopy } from "../LandingPage";

export const metadata: Metadata = {
  title: "Una app de reservas con tu marca",
  description:
    "Reservas, agendas, pagos, fidelización y ventas en una app separada para iOS y Android, sin ofertas competidoras ni comisión Timzy por reserva.",
  alternates: {
    canonical: "/es/",
    languages: { "en-GB": "/", pl: "/pl/", es: "/es/" },
  },
};

export default function SpanishHome() {
  return <LandingPage copy={landingCopy.es} locale="es" />;
}
