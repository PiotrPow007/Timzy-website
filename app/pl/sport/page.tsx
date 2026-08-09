import { IndustryLandingPage } from "../../IndustryLandingPage";
import { getIndustryMetadata } from "../../industryMetadata";

export const metadata = getIndustryMetadata("pl", "sport");
export default function PolishSportPage() { return <IndustryLandingPage locale="pl" industry="sport" />; }
