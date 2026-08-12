import type { Metadata, Viewport } from "next";
import { Analytics } from "./Analytics";
import { CookieNotice } from "./CookieNotice";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://timzy.app"),
  title: {
    default: "Timzy | A booking app under your brand",
    template: "%s | Timzy",
  },
  description:
    "Bookings, schedules, payments, loyalty and sales in a separate iOS and Android app under your brand.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Timzy",
    images: [{ url: "/og-sales.png", width: 1536, height: 1024, alt: "Timzy — more bookings and returning clients under your brand" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-sales.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f7fb",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}<Analytics /><CookieNotice /></body>
    </html>
  );
}
