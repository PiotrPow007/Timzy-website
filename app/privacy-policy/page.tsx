import type { Metadata } from "next";
import { PrivacyPolicy } from "../PrivacyPolicy";

export const metadata: Metadata = { title: "Privacy and cookies", description: "Privacy, Google Analytics consent and cookies information for Timzy.", alternates: { canonical: "/privacy-policy/", languages: { "en-GB": "/privacy-policy/", "pl-PL": "/pl/polityka-prywatnosci/", "es-ES": "/es/politica-privacidad/", "x-default": "/privacy-policy/" } } };
export default function Page() { return <PrivacyPolicy locale="en" />; }
