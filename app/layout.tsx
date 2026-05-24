import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const cyrene = localFont({
  src: "../public/assets/cyrene-regular.woff2",
  variable: "--font-cyrene",
  display: "swap",
});

const dinAlternate = localFont({
  src: "../public/assets/din-alternate-bold.woff2",
  variable: "--font-din-alternate",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wedding Caca Arka",
  description: "Wedding site with a polaroid-style animated preloader.",
  icons: {
    icon: [{ url: "/salsaarkan/favicon.webp", type: "image/webp" }],
    shortcut: ["/salsaarkan/favicon.webp"],
    apple: [{ url: "/salsaarkan/favicon.webp", type: "image/webp" }],
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
      <head>
        <link
          rel="preload"
          href="/salsaarkan/hero/couple with bg.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/salsaarkan/hero/couple without bg.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
