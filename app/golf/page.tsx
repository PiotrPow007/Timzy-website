import { IndustryLandingPage } from "../IndustryLandingPage";
import { getIndustryMetadata } from "../industryMetadata";

export const metadata = getIndustryMetadata("en", "golf");
export default function GolfPage() { return <IndustryLandingPage locale="en" industry="golf" />; }
