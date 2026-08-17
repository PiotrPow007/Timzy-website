import type { Metadata } from "next";
import { ContractSuccess } from "../../ContractSuccess";
export const metadata: Metadata = { title: "Timzy payment confirmation", robots: { index: false, follow: false } };
export default function Page() { return <ContractSuccess />; }
