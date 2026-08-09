import { IndustryLandingPage } from "../IndustryLandingPage";
import { getIndustryMetadata } from "../industryMetadata";

export const metadata = getIndustryMetadata("en", "sport");
export default function SportPage() { return <IndustryLandingPage locale="en" industry="sport" />; }
