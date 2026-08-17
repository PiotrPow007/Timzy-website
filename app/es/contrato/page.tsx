import type { Metadata } from "next";
import { ContractFlow } from "../../ContractFlow";
export const metadata: Metadata = { title: "Configurador y contrato Timzy", robots: { index: false, follow: false } };
export default function Page() { return <ContractFlow initialLocale="es" />; }
