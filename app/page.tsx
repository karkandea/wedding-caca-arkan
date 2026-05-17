"use client";

import ImageSequenceSection from "./components/image-sequence-section";
import BookSection from "./components/book-section";
import LoadingScreen from "./components/loading-screen";
import OurStorySection from "./components/our-story-section";
import Section3Video from "./components/section-3-video";

export default function Home() {
  return (
    <>
      <LoadingScreen />
      <main className="flex flex-1 flex-col">
        <ImageSequenceSection />
        <OurStorySection />
        <Section3Video />
        <BookSection />
      </main>
    </>
  );
}
