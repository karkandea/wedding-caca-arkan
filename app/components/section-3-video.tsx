"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type Chapter = {
  eyebrow: string;
  title: string;
  body: string;
  side: "left" | "right";
};

type StoryPhoto = {
  src: string;
  caption: string;
  rotate: number;
};

const CHAPTERS: Chapter[] = [
  {
    eyebrow: "chapter one",
    title: "how we met",
    body:
      "We met at a friend's birthday in Bandung, became fast friends, and eventually realized the best parts of every week were the parts we spent together.",
    side: "left",
  },
  {
    eyebrow: "chapter two",
    title: "falling in love",
    body:
      "Jakarta became our home base for late dinners, weekend walks, shared routines, and all of the small moments that made life feel bigger.",
    side: "right",
  },
  {
    eyebrow: "chapter three",
    title: "the next step",
    body:
      "A trip, a question, a very easy yes, and suddenly the future we had been imagining became something we could invite everyone into.",
    side: "left",
  },
];

const PHOTOS: StoryPhoto[] = [
  { src: "/hero/photo-left.jpeg", caption: "the night we met", rotate: -3 },
  { src: "/hero/photo-right.jpeg", caption: "coffee, always", rotate: 2 },
  { src: "/hero/photo-center.png", caption: "our city corner", rotate: -1 },
  { src: "/hero/photo-left.jpeg", caption: "the easy yes", rotate: 3 },
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function ease(value: number) {
  const t = clamp(value);
  return 1 - Math.pow(1 - t, 3);
}

function easeInOut(value: number) {
  const t = clamp(value);
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function getChapterActivity(progress: number, index: number) {
  const ranges = [
    [0, 0.45],
    [0.4, 0.78],
    [0.72, 1.05],
  ];
  const [start, end] = ranges[index];
  const mid = (start + end) / 2;
  const half = (end - start) / 2;
  const distance = Math.abs(progress - mid) / half;

  return clamp(1 - distance * distance * 1.1);
}

function ChapterText({ chapter, activity }: { chapter: Chapter; activity: number }) {
  const opacity = lerp(0.16, 1, activity);
  const blur = lerp(2, 0, activity);
  const translateY = lerp(chapter.side === "left" ? -8 : 8, 0, activity);

  return (
    <div
      className="hidden lg:block"
      style={{
        position: "absolute",
        top: "50%",
        [chapter.side]: "5vw",
        width: "min(360px, 28vw)",
        textAlign: chapter.side === "left" ? "right" : "left",
        transform: `translate3d(0, calc(-50% + ${translateY}px), 0)`,
        filter: `blur(${blur}px)`,
        opacity,
        pointerEvents: "none",
        willChange: "transform, opacity, filter",
        backfaceVisibility: "hidden",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-din-alternate)",
          fontSize: 12,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.72)",
          marginBottom: 14,
        }}
      >
        - {chapter.eyebrow}
      </div>
      <div
        style={{
          fontFamily: "var(--font-cyrene)",
          fontWeight: 500,
          fontSize: 36,
          lineHeight: 1.05,
          color: "#ffffff",
          marginBottom: 18,
          fontStyle: "italic",
          textShadow: "0 8px 24px rgba(0,0,0,0.22)",
        }}
      >
        {chapter.title}.
      </div>
      <div
        style={{
          fontFamily: "var(--font-din-alternate)",
          fontSize: 15,
          lineHeight: 1.65,
          color: "rgba(255,255,255,0.78)",
          fontWeight: 400,
        }}
      >
        {chapter.body}
      </div>
    </div>
  );
}

function MobileChapter({
  chapters,
  activities,
  opacity,
}: {
  chapters: Chapter[];
  activities: number[];
  opacity: number;
}) {
  let activeIndex = 0;
  let maxActivity = -1;

  activities.forEach((activity, index) => {
    if (activity > maxActivity) {
      maxActivity = activity;
      activeIndex = index;
    }
  });

  const chapter = chapters[activeIndex];

  return (
    <div
      className="lg:hidden"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: "8vh",
        padding: "0 28px",
        opacity,
        pointerEvents: "none",
        zIndex: 30,
      }}
    >
      <div
        key={activeIndex}
        style={{
          textAlign: "center",
          animation: "mobile-chapter-fade 0.45s ease",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-din-alternate)",
            fontSize: 11,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.72)",
            marginBottom: 10,
          }}
        >
          - {chapter.eyebrow}
        </div>
        <div
          style={{
            fontFamily: "var(--font-cyrene)",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: 28,
            lineHeight: 1.1,
            color: "#ffffff",
            marginBottom: 12,
            textShadow: "0 8px 24px rgba(0,0,0,0.22)",
          }}
        >
          {chapter.title}.
        </div>
        <div
          style={{
            fontFamily: "var(--font-din-alternate)",
            fontSize: 13.5,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.78)",
            maxWidth: 360,
            margin: "0 auto",
          }}
        >
          {chapter.body}
        </div>
      </div>
      <style>
        {`@keyframes mobile-chapter-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}
      </style>
    </div>
  );
}

function PolaroidStack({
  progress,
  photos,
  width,
}: {
  progress: number;
  photos: StoryPhoto[];
  width: number;
}) {
  const start = 0.18;
  const end = 0.95;
  const slotSize = (end - start) / photos.length;

  return (
    <div
      style={{
        position: "relative",
        width: width + 40,
        height: width * 1.36,
        pointerEvents: "none",
      }}
    >
      {photos.map((photo, index) => {
        const slotStart = lerp(start, end, index / photos.length);
        const slotEnd = lerp(start, end, (index + 0.85) / photos.length);
        const reveal = ease(clamp((progress - slotStart) / (slotEnd - slotStart)));
        const layerBack = clamp((progress - slotEnd) / slotSize, 0, photos.length);
        const translateY = lerp(88, 0, reveal) - layerBack * 6;
        const translateX =
          (index % 2 === 0 ? -1 : 1) * (10 - reveal * 10) +
          layerBack * (index % 2 ? 4 : -4);
        const scale = lerp(0.94, 1, reveal) - layerBack * 0.025;
        const rotate =
          lerp(photo.rotate * 1.6, photo.rotate, reveal) -
          layerBack * 0.6 * (index % 2 ? 1 : -1);
        const opacity = clamp(reveal - layerBack * 0.08);
        const blur = layerBack > 0.3 ? Math.min(2.4, layerBack * 1.2) : 0;
        const shadow =
          reveal > 0
            ? `0 ${10 + reveal * 22}px ${20 + reveal * 30}px rgba(43,36,29,${
                0.08 + reveal * 0.12
              }), 0 1px 2px rgba(43,36,29,0.06)`
            : "0 0 0 rgba(0,0,0,0)";

        return (
          <div
            key={`${photo.caption}-${index}`}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width,
              height: width * 1.14,
              marginLeft: -width / 2,
              marginTop: -(width * 1.14) / 2,
              background: "#FBF7EE",
              borderRadius: 4,
              padding: "14px 14px 0",
              boxShadow: shadow,
              zIndex: 100 + index,
              opacity,
              filter: blur ? `blur(${blur}px)` : "none",
              transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale}) rotate(${rotate}deg)`,
              transformOrigin: "50% 60%",
              willChange: "transform, opacity, filter",
              backfaceVisibility: "hidden",
              border: "1px solid rgba(43,36,29,0.06)",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "1 / 1",
                overflow: "hidden",
                borderRadius: 2,
              }}
            >
              <Image src={photo.src} alt={photo.caption} fill sizes="320px" className="object-cover" />
            </div>
            <div
              style={{
                fontFamily: "var(--font-cyrene)",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 18,
                color: "#2B241D",
                textAlign: "center",
                padding: "16px 8px 14px",
              }}
            >
              {photo.caption}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Section3Video() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollState, setScrollState] = useState({
    sectionTop: 0,
    sectionHeight: 0,
    scrollY: 0,
    viewportHeight: 800,
    viewportWidth: 1280,
  });

  useEffect(() => {
    let frameId = 0;

    const updateOnScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      setScrollState({
        sectionTop: window.scrollY + rect.top,
        sectionHeight: section.offsetHeight,
        scrollY: window.scrollY,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
      });
    };

    const onScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateOnScroll();
      });
    };

    updateOnScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  const photos = useMemo(() => PHOTOS, []);
  const sectionScroll = scrollState.scrollY - scrollState.sectionTop;
  const introHeight = scrollState.viewportHeight;
  const stickyStart = introHeight;
  const stickyRange = scrollState.sectionHeight - scrollState.viewportHeight - stickyStart;
  const stickyProgress = clamp((sectionScroll - stickyStart) / stickyRange);
  const introProgress = clamp(sectionScroll / (scrollState.viewportHeight * 0.95));
  const headingEnter = ease(clamp((introProgress - 0.2) / 0.7));
  const headingScale = lerp(1, 0.86, easeInOut(stickyProgress));
  const headingTop = lerp(18, 6, easeInOut(stickyProgress));
  const isMobile = scrollState.viewportWidth < 768;
  const polaroidWidth = isMobile ? 220 : 280;
  const introReveal = clamp((introProgress - 0.5) / 0.5);
  const chapterActivities = CHAPTERS.map((_, index) => getChapterActivity(stickyProgress, index));

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        height: "calc(100vh + 500vh + 100vh)",
        width: "100%",
        overflow: "visible",
      }}
    >
      <div
        style={{
          height: "32vh",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: 24,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-din-alternate)",
            fontSize: 11,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.76)",
            opacity: clamp(1 - sectionScroll / 220),
            display: "flex",
            alignItems: "center",
            gap: 12,
            textShadow: "0 8px 24px rgba(0,0,0,0.25)",
          }}
        >
          <span style={{ display: "inline-block", width: 24, height: 1, background: "currentColor" }} />
          scroll to begin
          <span style={{ display: "inline-block", width: 24, height: 1, background: "currentColor" }} />
        </div>
      </div>

      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100svh",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <video
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-[3px]"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/wallpaper.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#2B241D]/20" />

        <div
          style={{
            position: "absolute",
            top: "32vh",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            opacity: clamp(1 - introProgress / 0.4),
            transform: `translateY(${-introProgress * 30}px)`,
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-din-alternate)",
              fontSize: 12,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.72)",
              textAlign: "center",
            }}
          >
            you are cordially invited
            <br />
            <span
              style={{
                fontFamily: "var(--font-cyrene)",
                fontStyle: "italic",
                textTransform: "none",
                letterSpacing: 0,
                fontSize: 20,
                color: "#ffffff",
                display: "inline-block",
                marginTop: 14,
              }}
            >
              to celebrate the story of...
            </span>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            paddingTop: isMobile ? `${Math.max(7, headingTop)}vh` : `${headingTop}vh`,
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-cyrene)",
              fontSize: isMobile ? "clamp(56px, 17vw, 96px)" : "clamp(72px, 11vw, 220px)",
              lineHeight: 0.88,
              color: "#ffffff",
              opacity: headingEnter,
              transform: `translateY(${lerp(40, 0, headingEnter)}px) scale(${headingScale})`,
              transformOrigin: "50% 0%",
              textAlign: "center",
              whiteSpace: "nowrap",
              textShadow: "0 18px 50px rgba(0,0,0,0.28)",
              willChange: "transform, opacity",
              backfaceVisibility: "hidden",
            }}
          >
            our story
          </h2>
        </div>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: isMobile ? "44%" : "55%",
            transform: "translate(-50%, -50%)",
            opacity: clamp((introProgress - 0.55) / 0.4),
            zIndex: 20,
          }}
        >
          <PolaroidStack progress={stickyProgress} photos={photos} width={polaroidWidth} />
        </div>

        {CHAPTERS.map((chapter, index) => (
          <ChapterText
            key={chapter.eyebrow}
            chapter={chapter}
            activity={chapterActivities[index]}
          />
        ))}

        <MobileChapter chapters={CHAPTERS} activities={chapterActivities} opacity={introReveal} />

        <div
          style={{
            position: "absolute",
            bottom: 36,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 10,
            opacity: clamp((introProgress - 0.6) / 0.4),
            zIndex: 35,
          }}
        >
          {CHAPTERS.map((_, index) => {
            const active = chapterActivities[index] > 0.5;

            return (
              <div
                key={index}
                style={{
                  width: active ? 28 : 8,
                  height: 4,
                  borderRadius: 999,
                  background: active ? "#ffffff" : "rgba(255,255,255,0.34)",
                  transition: "width 0.3s ease, background 0.3s ease",
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
