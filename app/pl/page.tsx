import type { Metadata } from "next";
import { LandingPage, landingCopy } from "../LandingPage";

export const metadata: Metadata = {
  title: "Aplikacja rezerwacyjna pod Twoją marką",
  description:
    "Rezerwacje 24/7, grafiki, płatności, lojalność i sklep w osobnej aplikacji iOS i Android. Bez konkurencji obok oferty i bez prowizji Timzy od rezerwacji.",
  alternates: {
    canonical: "/pl/",
    languages: { "en-GB": "/", pl: "/pl/", es: "/es/" },
  },
};

export default function PolishHome() {
  return <LandingPage copy={landingCopy.pl} locale="pl" />;
}
