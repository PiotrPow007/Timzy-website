import type { Metadata } from "next";
import { SecondSignerFlow } from "../SecondSignerFlow";

export const metadata: Metadata = { title: "Timzy · second signer", robots: { index: false, follow: false } };
export default function Page() { return <SecondSignerFlow />; }
