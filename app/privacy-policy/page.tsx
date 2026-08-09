import type { Metadata } from "next";
import { PrivacyPolicy } from "../PrivacyPolicy";

export const metadata: Metadata = { title: "Privacy and cookies", description: "Privacy and cookies information for the Timzy website." };
export default function Page() { return <PrivacyPolicy locale="en" />; }
