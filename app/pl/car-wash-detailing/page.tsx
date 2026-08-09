import { IndustryLandingPage } from "../../IndustryLandingPage";
import { getIndustryMetadata } from "../../industryMetadata";

export const metadata = getIndustryMetadata("pl", "car-wash-detailing");
export default function PolishCarWashDetailingPage() { return <IndustryLandingPage locale="pl" industry="car-wash-detailing" />; }
