"use client";

import dynamic from "next/dynamic";
import { memo, type ReactNode, useEffect, useRef, useState } from "react";

const OurStorySection = dynamic(() => import("./our-story-section"), {
  ssr: false,
  loading: () => <div style={{ minHeight: "460vh", background: "#F7F1E7" }} />,
});
const Section3Video = dynamic(() => import("./section-3-video"), {
  ssr: false,
  loading: () => <div style={{ minHeight: "700vh", background: "#F7F1E7" }} />,
});
const BookSection = dynamic(() => import("./book-section"), {
  ssr: false,
  loading: () => <div style={{ minHeight: "600vh", background: "#0a1432" }} />,
});

const DeferredSection = memo(function DeferredSection({
  children,
  placeholder,
  minHeight,
  background,
  rootMargin = "400px 0px",
}: {
  children: ReactNode;
  placeholder: ReactNode;
  minHeight: string;
  background: string;
  rootMargin?: string;
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
      { root: null, rootMargin, threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, shouldMount]);

  return (
    <div ref={ref} style={{ minHeight, background }}>
      {shouldMount ? children : placeholder}
    </div>
  );
});

export default function DeferredWeddingSections({ guestName }: { guestName?: string }) {
  return (
    <>
      <DeferredSection
        minHeight="460vh"
        background="#F7F1E7"
        placeholder={
          <section
            id="our-story"
            aria-hidden="true"
            style={{
              minHeight: "460vh",
              backgroundColor: "#F7F1E7",
            }}
          />
        }
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
        rootMargin="0px 0px"
        placeholder={
          <section id="book-section" aria-hidden="true" className="relative min-h-[600vh] bg-[#0a1432]">
            <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
              <div className="book-load-skeleton" />
            </div>
          </section>
        }
      >
        <BookSection guestName={guestName} />
      </DeferredSection>
    </>
  );
}
