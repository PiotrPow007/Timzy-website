import type { Metadata } from "next";
import { LandingPage, landingCopy } from "../LandingPage";

export const metadata: Metadata = {
  title: "Więcej rezerwacji, mniej obsługi — pod Twoją marką",
  description:
    "Uruchom aplikację do rezerwacji dla sportu, golfa, tenisa, myjni i detailingu. Grafiki, powiadomienia i kontakt z klientem pod Twoją marką.",
  alternates: {
    canonical: "/pl/",
    languages: { "en-GB": "/", pl: "/pl/", es: "/es/" },
  },
};

export default function PolishHome() {
  return <LandingPage copy={landingCopy.pl} locale="pl" />;
}
