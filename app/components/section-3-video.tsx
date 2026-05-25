"use client";

import { type CSSProperties, type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { assetPath } from "../lib/asset-path";
import { ShimmerImage } from "./shimmer-image";

type StoryPhoto = {
  src: string;
  caption: string;
  rotate: number;
};

type GalleryTweaks = {
  warmth: number;
  contrast: number;
  blur: number;
  bgLift: number;
  assetScale: number;
};

const GALLERY_TWEAKS: GalleryTweaks = {
  warmth: 32,
  contrast: 8,
  blur: 2,
  bgLift: 90,
  assetScale: 1,
};

const GALLERY_STICKY_DELAY = 0.35;
const PHOTOS: StoryPhoto[] = [
  { src: assetPath("/bg gallery/photo 1.webp"), caption: "the easy yes", rotate: 3 },
  { src: assetPath("/bg gallery/photo 2.webp"), caption: "our city corner", rotate: -1 },
  { src: assetPath("/bg gallery/photo 3.webp"), caption: "coffee, always", rotate: 2 },
  { src: assetPath("/bg gallery/photo 4.webp"), caption: "the night we met", rotate: -3 },
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

function GalleryMoodboardBackground({ layerRef }: { layerRef: RefObject<HTMLDivElement | null> }) {
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const bgLightness = 0.94 - (GALLERY_TWEAKS.contrast / 100) * 0.25;
  const bgChroma = 0.005 + (GALLERY_TWEAKS.warmth / 100) * 0.008;
  const bgHue = 70 + (GALLERY_TWEAKS.warmth / 100) * 20;

  useEffect(() => {
    const node = layerRef.current;
    if (!node || shouldLoadVideo) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldLoadVideo(true);
        observer.disconnect();
      },
      { root: null, rootMargin: "1200px 0px", threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [layerRef, shouldLoadVideo]);

  return (
    <div
      ref={layerRef}
      className="gallery-mood-bg"
      aria-hidden="true"
      style={
        {
          "--gallery-bg": `oklch(${bgLightness} ${bgChroma} ${bgHue})`,
          "--gallery-overlay": `rgba(120, 110, 90, ${GALLERY_TWEAKS.contrast / 200})`,
          "--gallery-blur": `${GALLERY_TWEAKS.blur}px`,
          "--gallery-asset-scale": GALLERY_TWEAKS.assetScale,
        } as CSSProperties
      }
    >
      {!videoReady && <div className="gallery-video-skeleton" />}
      <video
        className="gallery-mood-video"
        src={shouldLoadVideo ? assetPath("/bg gallery/looping-video-v1.mp4") : undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        onCanPlay={() => setVideoReady(true)}
      />
      <div className="gallery-mood-vignette" />
      <style>
        {`
          .gallery-mood-bg {
            position: absolute;
            inset: 0;
            overflow: hidden;
            isolation: isolate;
            background:
              linear-gradient(
                to bottom,
                #F7F1E7 0%,
                rgba(247,241,231,0.88) 18%,
                var(--gallery-bg, oklch(0.92 0.008 76)) 54%
              ),
              var(--gallery-bg, oklch(0.92 0.008 76));
          }

          .gallery-video-skeleton {
            position: absolute;
            inset: 0;
            z-index: 0;
            overflow: hidden;
            background:
              radial-gradient(circle at 32% 28%, rgba(255,252,245,0.5), transparent 24%),
              radial-gradient(circle at 68% 64%, rgba(166,107,53,0.18), transparent 28%),
              linear-gradient(115deg, rgba(232,222,202,0.78) 0%, rgba(247,241,231,0.98) 42%, rgba(211,194,163,0.72) 100%);
          }

          .gallery-video-skeleton::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(105deg, transparent 32%, rgba(255,255,255,0.42) 46%, transparent 60%);
            transform: translateX(-100%);
            animation: gallery-video-shimmer 1.35s linear infinite;
          }

          .gallery-mood-bg::before {
            content: none;
            position: absolute;
            inset: 0;
            z-index: 8;
            pointer-events: none;
            background-image: radial-gradient(rgba(255,240,210,0.06) 1px, transparent 1.5px);
            background-size: 18px 18px;
            opacity: 0.9;
          }

          .gallery-mood-video {
            position: absolute;
            inset: 0;
            z-index: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center center;
            pointer-events: none;
            opacity: 1;
            filter: blur(3px);
            transform: scale(1.02);
          }

          @keyframes gallery-video-shimmer {
            to {
              transform: translateX(100%);
            }
          }

          .gallery-mood-vignette {
            position: absolute;
            inset: 0;
            z-index: 7;
            pointer-events: none;
            background: radial-gradient(ellipse 100% 75% at 50% 50%, rgba(60,45,25,0) 40%, rgba(60,45,25,0.14) 85%, rgba(60,45,25,0.22) 100%);
          }

          @media (max-width: 760px) {
            .gallery-mood-video {
              object-position: left center;
            }
          }
        `}
      </style>
    </div>
  );
}

function PolaroidStack({
  progress,
  photos,
  width,
  viewportHeight,
}: {
  progress: number;
  photos: StoryPhoto[];
  width: number;
  viewportHeight: number;
}) {
  const start = 0.04;
  const end = 0.95;
  const slotSize = (end - start) / photos.length;

  return (
    <div
      style={{
        position: "relative",
        width: width + 40,
        height: width * 1.82,
        pointerEvents: "none",
      }}
    >
      {photos.map((photo, index) => {
        const slotStart = lerp(start, end, index / photos.length);
        const slotEnd = lerp(start, end, (index + 0.85) / photos.length);
        const reveal = ease(clamp((progress - slotStart) / (slotEnd - slotStart)));
        const layerBack = clamp((progress - slotEnd) / slotSize, 0, photos.length);
        const finalY = index * (width * 0.18);
        const finalX = (index - (photos.length - 1) / 2) * 8;
        const translateY = lerp(viewportHeight + width, finalY, reveal) + layerBack * 18;
        const translateX = lerp((index % 2 === 0 ? -1 : 1) * 18, finalX, reveal);
        const scale = lerp(0.94, 1, reveal) - layerBack * 0.012;
        const rotate =
          lerp(photo.rotate * 1.6, photo.rotate, reveal) -
          layerBack * 0.22 * (index % 2 ? 1 : -1);
        const isActive = reveal > 0.02 && layerBack < 0.85;
        const blur = layerBack > 1.2 ? Math.min(1.2, (layerBack - 1.2) * 0.5) : 0;
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
              zIndex: isActive ? 1000 + index : 100 + index,
              opacity: 1,
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
              <ShimmerImage src={photo.src} alt={photo.caption} fill sizes="320px" className="object-cover" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Section3Video() {
  const sectionRef = useRef<HTMLElement>(null);
  const moodLayerRef = useRef<HTMLDivElement>(null);
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
      const sectionTop = window.scrollY + rect.top;
      const sectionHeight = section.offsetHeight;
      const sectionScroll = window.scrollY - sectionTop;
      const stickyStart = window.innerHeight * GALLERY_STICKY_DELAY;
      const stickyRange = sectionHeight - window.innerHeight - stickyStart;
      const stickyProgress = clamp((sectionScroll - stickyStart) / stickyRange);
      moodLayerRef.current?.style.setProperty("--p", (easeInOut(stickyProgress) * (GALLERY_TWEAKS.bgLift / 90)).toFixed(4));

      setScrollState({
        sectionTop,
        sectionHeight,
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
  const stickyStart = introHeight * GALLERY_STICKY_DELAY;
  const stickyRange = scrollState.sectionHeight - scrollState.viewportHeight - stickyStart;
  const stickyProgress = clamp((sectionScroll - stickyStart) / stickyRange);
  const introProgress = clamp(sectionScroll / (scrollState.viewportHeight * 0.95));
  const headingEnter = ease(clamp((introProgress - 0.2) / 0.7));
  const headingScale = lerp(1, 0.86, easeInOut(stickyProgress));
  const headingTop = lerp(18, 6, easeInOut(stickyProgress));
  const isMobile = scrollState.viewportWidth < 768;
  const polaroidWidth = isMobile ? 220 : 280;
  const activeDotIndex = Math.min(PHOTOS.length - 1, Math.max(0, Math.floor(stickyProgress * PHOTOS.length)));

  return (
    <section
      id="gallery-section"
      data-gallery-photo-count={PHOTOS.length}
      ref={sectionRef}
      style={{
        position: "relative",
        height: "calc(100vh + 500vh + 100vh)",
        width: "100%",
        overflow: "visible",
        backgroundColor: "#F7F1E7",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100svh",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <GalleryMoodboardBackground layerRef={moodLayerRef} />

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
            Us
          </h2>
        </div>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: isMobile ? "38%" : "47%",
            transform: "translate(-50%, -50%)",
            opacity: clamp((introProgress - 0.32) / 0.28),
            zIndex: 20,
          }}
        >
          <PolaroidStack
            progress={stickyProgress}
            photos={photos}
            width={polaroidWidth}
            viewportHeight={scrollState.viewportHeight}
          />
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 36,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 10,
            opacity: clamp((introProgress - 0.38) / 0.3),
            zIndex: 35,
          }}
        >
          {PHOTOS.map((_, index) => {
            const active = activeDotIndex === index;

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
