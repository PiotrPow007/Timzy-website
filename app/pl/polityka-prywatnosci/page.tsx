import type { Metadata } from "next";
import { PrivacyPolicy } from "../../PrivacyPolicy";

export const metadata: Metadata = { title: "Polityka prywatności i cookies", description: "Informacje o przetwarzaniu danych, Google Analytics i cookies na stronie Timzy.", alternates: { canonical: "/pl/polityka-prywatnosci/", languages: { "en-GB": "/privacy-policy/", "pl-PL": "/pl/polityka-prywatnosci/", "es-ES": "/es/politica-privacidad/", "x-default": "/privacy-policy/" } } };
export default function Page() { return <PrivacyPolicy locale="pl" />; }
