import type { Metadata } from "next";
import localFont from "next/font/local";
import MusicPlayer from "./components/music-player";
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
        <MusicPlayer />
      </body>
    </html>
  );
}
