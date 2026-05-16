"use client";

import HeroSection from "./components/hero-section";
import LoadingScreen from "./components/loading-screen";
import NewHeroSection from "./components/new-hero-section";
import { usePreloaderReady } from "./components/preloader-shell";
import RingSection from "./components/ring-section";
import Section3Video from "./components/section-3-video";

export default function Home() {
  const heroReady = usePreloaderReady();

  return (
    <>
      <LoadingScreen />
      <main className="flex flex-1 flex-col">
        <NewHeroSection />
        <HeroSection
          accentColor="#326392"
          coupleNames="Salsa & Arkan"
          heroReady={heroReady}
          photos={[
            { src: "/hero/photo-center.png", position: "left" },
            { src: "/hero/photo-center.png", position: "center" },
            { src: "/hero/photo-center.png", position: "right" },
          ]}
        />
        <Section3Video />
        <RingSection />
      </main>
    </>
  );
}
