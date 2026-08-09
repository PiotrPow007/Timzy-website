import { IndustryLandingPage } from "../IndustryLandingPage";
import { getIndustryMetadata } from "../industryMetadata";

export const metadata = getIndustryMetadata("en", "car-wash-detailing");
export default function CarWashDetailingPage() { return <IndustryLandingPage locale="en" industry="car-wash-detailing" />; }
