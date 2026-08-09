import { IndustryLandingPage } from "../../IndustryLandingPage";
import { getIndustryMetadata } from "../../industryMetadata";

export const metadata = getIndustryMetadata("es", "tennis");
export default function SpanishTennisPage() { return <IndustryLandingPage locale="es" industry="tennis" />; }
