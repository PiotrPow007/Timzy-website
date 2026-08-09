import { IndustryLandingPage } from "../../IndustryLandingPage";
import { getIndustryMetadata } from "../../industryMetadata";

export const metadata = getIndustryMetadata("es", "sport");
export default function SpanishSportPage() { return <IndustryLandingPage locale="es" industry="sport" />; }
