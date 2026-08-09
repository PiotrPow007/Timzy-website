import type { Metadata } from "next";
import { PrivacyPolicy } from "../../PrivacyPolicy";

export const metadata: Metadata = { title: "Privacidad y cookies", description: "Información de privacidad y cookies del sitio Timzy." };
export default function Page() { return <PrivacyPolicy locale="es" />; }
