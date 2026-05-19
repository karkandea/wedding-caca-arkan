"use client";

import dynamic from "next/dynamic";
import { type ReactNode, useEffect, useRef, useState } from "react";
import ImageSequenceSection from "./image-sequence-section";
import LoadingScreen from "./loading-screen";

const OurStorySection = dynamic(() => import("./our-story-section"), { ssr: false });
const Section3Video = dynamic(() => import("./section-3-video"), { ssr: false });
const BookSection = dynamic(() => import("./book-section"), { ssr: false });

type WeddingPageProps = {
  guestName?: string;
};

function DeferredSection({
  children,
  placeholder,
  minHeight,
  background,
}: {
  children: ReactNode;
  placeholder: ReactNode;
  minHeight: string;
  background: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || shouldMount) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldMount(true);
        observer.disconnect();
      },
      { root: null, rootMargin: "1600px 0px", threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldMount]);

  return (
    <div ref={ref} style={{ minHeight, background }}>
      {shouldMount ? children : placeholder}
    </div>
  );
}

export default function WeddingPage({ guestName }: WeddingPageProps) {
  return (
    <>
      <LoadingScreen />
      <main className="flex flex-1 flex-col">
        <ImageSequenceSection />
        <DeferredSection
          minHeight="460vh"
          background="#0c4dbe"
          placeholder={<section id="our-story" aria-hidden="true" style={{ minHeight: "460vh", background: "#0c4dbe" }} />}
        >
          <OurStorySection />
        </DeferredSection>
        <DeferredSection
          minHeight="700vh"
          background="#F7F1E7"
          placeholder={
            <section
              id="gallery-section"
              aria-hidden="true"
              style={{ minHeight: "700vh", background: "#F7F1E7" }}
            />
          }
        >
          <Section3Video />
        </DeferredSection>
        <DeferredSection
          minHeight="600vh"
          background="#0a1432"
          placeholder={<section aria-hidden="true" style={{ minHeight: "600vh", background: "#0a1432" }} />}
        >
          <BookSection guestName={guestName} />
        </DeferredSection>
      </main>
    </>
  );
}
