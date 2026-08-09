import { IndustryLandingPage } from "../../IndustryLandingPage";
import { getIndustryMetadata } from "../../industryMetadata";

export const metadata = getIndustryMetadata("pl", "golf");
export default function PolishGolfPage() { return <IndustryLandingPage locale="pl" industry="golf" />; }
