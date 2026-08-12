import type { Metadata } from "next";
import { LandingPage, landingCopy } from "../LandingPage";

export const metadata: Metadata = {
  title: "Aplikacja do rezerwacji pod Twoją marką",
  description:
    "Rezerwacje 24/7, grafiki, płatności, lojalność i sklep w osobnej aplikacji iOS i Android. Bez konkurencji obok oferty i bez prowizji Timzy od rezerwacji.",
  alternates: {
    canonical: "/pl/",
    languages: { "en-GB": "/", "pl-PL": "/pl/", "es-ES": "/es/", "x-default": "/" },
  },
  openGraph: { url: "/pl/", title: "Aplikacja do rezerwacji pod Twoją marką | Timzy", description: "System rezerwacji online i osobna aplikacja mobilna dla Twojej firmy. Bez katalogu konkurencji i bez prowizji Timzy od rezerwacji." },
};

export default function PolishHome() {
  return <LandingPage copy={landingCopy.pl} locale="pl" />;
}
