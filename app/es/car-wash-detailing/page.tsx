import { IndustryLandingPage } from "../../IndustryLandingPage";
import { getIndustryMetadata } from "../../industryMetadata";

export const metadata = getIndustryMetadata("es", "car-wash-detailing");
export default function SpanishCarWashDetailingPage() { return <IndustryLandingPage locale="es" industry="car-wash-detailing" />; }
