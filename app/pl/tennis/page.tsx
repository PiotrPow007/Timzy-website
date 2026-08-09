import { IndustryLandingPage } from "../../IndustryLandingPage";
import { getIndustryMetadata } from "../../industryMetadata";

export const metadata = getIndustryMetadata("pl", "tennis");
export default function PolishTennisPage() { return <IndustryLandingPage locale="pl" industry="tennis" />; }
