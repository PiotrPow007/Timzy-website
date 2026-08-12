import type { Metadata } from "next";
import { PrivacyPolicy } from "../../PrivacyPolicy";

export const metadata: Metadata = { title: "Privacidad y cookies", description: "Información sobre privacidad, Google Analytics y cookies en Timzy.", alternates: { canonical: "/es/politica-privacidad/", languages: { "en-GB": "/privacy-policy/", "pl-PL": "/pl/polityka-prywatnosci/", "es-ES": "/es/politica-privacidad/", "x-default": "/privacy-policy/" } } };
export default function Page() { return <PrivacyPolicy locale="es" />; }
