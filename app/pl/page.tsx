import type { Metadata } from "next";
import { LandingPage, landingCopy } from "../LandingPage";

export const metadata: Metadata = {
  title: "Własna aplikacja do rezerwacji pod Twoją marką",
  description:
    "Uruchom aplikację do rezerwacji z logo i kolorami Twojej firmy. Rezerwacje, powiadomienia, lojalność, sklep i zarządzanie klientami w jednym miejscu.",
  alternates: {
    canonical: "/pl/",
    languages: { "en-GB": "/", pl: "/pl/", es: "/es/" },
  },
};

export default function PolishHome() {
  return <LandingPage copy={landingCopy.pl} locale="pl" />;
}
