import type { Metadata } from "next";
import { AdminOrderDetail } from "../../../AdminOrderDetail";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Timzy order", robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AdminOrderDetail orderId={id} />; }
