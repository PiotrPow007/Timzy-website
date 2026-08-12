import type { Metadata } from "next";
import { LandingPage, landingCopy } from "./LandingPage";

export const metadata: Metadata = {
  title: "A booking app under your brand",
  description:
    "Bookings, schedules, payments, loyalty and sales in a separate iOS and Android app under your brand, with no competing offers and no Timzy commission per booking.",
  alternates: {
    canonical: "/",
    languages: { "en-GB": "/", pl: "/pl/", es: "/es/" },
  },
};

export default function Home() {
  return <LandingPage copy={landingCopy.en} locale="en" />;
}
