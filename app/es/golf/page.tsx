import { IndustryLandingPage } from "../../IndustryLandingPage";
import { getIndustryMetadata } from "../../industryMetadata";

export const metadata = getIndustryMetadata("es", "golf");
export default function SpanishGolfPage() { return <IndustryLandingPage locale="es" industry="golf" />; }
