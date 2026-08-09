import type { Metadata } from "next";
import { PrivacyPolicy } from "../../PrivacyPolicy";

export const metadata: Metadata = { title: "Polityka prywatności i cookies", description: "Informacje o przetwarzaniu danych i cookies na stronie Timzy." };
export default function Page() { return <PrivacyPolicy locale="pl" />; }
