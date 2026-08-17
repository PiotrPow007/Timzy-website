import type { Metadata } from "next";
import { AdminPanel } from "../AdminPanel";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Timzy administration", robots: { index: false, follow: false } };
export default function Page() { return <AdminPanel />; }
