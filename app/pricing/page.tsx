import { SeoSalesPage, salesMetadata } from "../SeoSalesPage";
export const metadata = salesMetadata("en", "pricing");
export default function Page() { return <SeoSalesPage locale="en" kind="pricing" />; }
