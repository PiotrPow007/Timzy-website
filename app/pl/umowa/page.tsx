import type { Metadata } from "next";
import { ContractFlow } from "../../ContractFlow";
export const metadata: Metadata = { title: "Konfigurator i umowa Timzy", robots: { index: false, follow: false } };
export default function Page() { return <ContractFlow initialLocale="pl" />; }
