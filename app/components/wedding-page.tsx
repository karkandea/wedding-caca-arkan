"use client";

import ImageSequenceSection from "./image-sequence-section";
import BookSection from "./book-section";
import LoadingScreen from "./loading-screen";
import OurStorySection from "./our-story-section";
import Section3Video from "./section-3-video";

type WeddingPageProps = {
  guestName?: string;
};

export default function WeddingPage({ guestName }: WeddingPageProps) {
  return (
    <>
      <LoadingScreen />
      <main className="flex flex-1 flex-col">
        <ImageSequenceSection />
        <OurStorySection />
        <Section3Video />
        <BookSection guestName={guestName} />
      </main>
    </>
  );
}
