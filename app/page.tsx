import type { Metadata } from "next";
import { LandingPage, landingCopy } from "./LandingPage";

export const metadata: Metadata = {
  title: "Your own booking app, under your brand",
  description:
    "Launch a branded booking app for your service business. Online bookings, reminders, loyalty, shop, payments and customer management in one place.",
  alternates: {
    canonical: "/",
    languages: { "en-GB": "/", pl: "/pl/", es: "/es/" },
  },
};

export default function Home() {
  return <LandingPage copy={landingCopy.en} locale="en" />;
}
