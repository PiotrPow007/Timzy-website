import type { Metadata } from "next";
import { LandingPage, landingCopy } from "../LandingPage";

export const metadata: Metadata = {
  title: "Tu propia app de reservas con tu marca",
  description:
    "Lanza una app de reservas con el logo y los colores de tu negocio. Reservas, avisos, fidelización, tienda y gestión de clientes en un solo lugar.",
  alternates: {
    canonical: "/es/",
    languages: { "en-GB": "/", pl: "/pl/", es: "/es/" },
  },
};

export default function SpanishHome() {
  return <LandingPage copy={landingCopy.es} locale="es" />;
}
