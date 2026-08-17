import type { Metadata } from "next";
import { ContractFlow } from "../ContractFlow";
export const metadata: Metadata = { title: "Configure Timzy and enter into the agreement", robots: { index: false, follow: false } };
export default function Page() { return <ContractFlow initialLocale="en" />; }
