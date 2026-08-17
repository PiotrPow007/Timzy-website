import type { Metadata } from "next";
import { AdminLogin } from "../../AdminLogin";
export const metadata: Metadata = { title: "Timzy administration sign in", robots: { index: false, follow: false } };
export default function Page() { return <AdminLogin />; }
