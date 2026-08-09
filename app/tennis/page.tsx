import { IndustryLandingPage } from "../IndustryLandingPage";
import { getIndustryMetadata } from "../industryMetadata";

export const metadata = getIndustryMetadata("en", "tennis");
export default function TennisPage() { return <IndustryLandingPage locale="en" industry="tennis" />; }
