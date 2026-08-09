import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Timzy | More bookings, less admin — under your brand",
    template: "%s | Timzy",
  },
  description:
    "Branded booking apps for sport clubs, golf, tennis, car wash, detailing and service businesses.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Timzy",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "Timzy — more bookings, less admin, under your brand" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f7fb",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
