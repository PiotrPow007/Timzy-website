import type { Metadata } from "next";
import { LandingPage, landingCopy } from "./LandingPage";

export const metadata: Metadata = {
  title: "More bookings, less admin — under your brand",
  description:
    "Launch a branded booking app for sport clubs, golf, tennis, car wash and detailing. Online bookings, calendars, reminders and customer communication in one place.",
  alternates: {
    canonical: "/",
    languages: { "en-GB": "/", pl: "/pl/", es: "/es/" },
  },
};

export default function Home() {
  return <LandingPage copy={landingCopy.en} locale="en" />;
}
