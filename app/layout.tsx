import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const SITE_TITLE = "Wedding of Salsa & Arkan";
const SITE_DESCRIPTION = "Kami mengundang Anda untuk hadir di hari istimewa kami - 21 Juni 2026, Padang";
const SITE_URL = "https://wedding.dualangka.com/";
const PREVIEW_IMAGE = "/image.png";
const FAVICON_IMAGE = "/image%20copy.png";

const cyrene = localFont({
  src: "../public/assets/cyrene-regular.woff2",
  variable: "--font-cyrene",
  display: "optional",
  preload: false,
  fallback: ["Georgia", "Times New Roman", "serif"],
  adjustFontFallback: "Times New Roman",
});

const dinAlternate = localFont({
  src: "../public/assets/din-alternate-bold.woff2",
  variable: "--font-din-alternate",
  display: "optional",
  fallback: ["Arial", "Helvetica", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wedding.dualangka.com"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_TITLE,
    images: [
      {
        url: PREVIEW_IMAGE,
        alt: SITE_TITLE,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [PREVIEW_IMAGE],
  },
  icons: {
    icon: [{ url: FAVICON_IMAGE, type: "image/png" }],
    shortcut: [FAVICON_IMAGE],
    apple: [{ url: FAVICON_IMAGE, type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cyrene.variable} ${dinAlternate.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
