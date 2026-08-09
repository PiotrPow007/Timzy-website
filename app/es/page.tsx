import type { Metadata } from "next";
import { LandingPage, landingCopy } from "../LandingPage";

export const metadata: Metadata = {
  title: "Más reservas, menos gestión — con tu marca",
  description:
    "Lanza una app de reservas para deporte, golf, tenis, lavado y detailing. Agendas, avisos y relación con el cliente bajo tu marca.",
  alternates: {
    canonical: "/es/",
    languages: { "en-GB": "/", pl: "/pl/", es: "/es/" },
  },
};

export default function SpanishHome() {
  return <LandingPage copy={landingCopy.es} locale="es" />;
}
