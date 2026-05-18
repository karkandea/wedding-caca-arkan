"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import MusicPlayer from "./music-player";

const COUPLE = "Salsa & Arkan";

const SIDE_PHOTOS = [
  {
    id: "top-left",
    src: "/hero/photo%20lain%201.png",
    edge: "left",
    offset: "-2%",
    top: "4%",
    width: "30%",
    height: "44%",
    appearAt: 0.3,
  },
  {
    id: "bottom-left",
    src: "/hero/photo%20web%201.png",
    edge: "left",
    offset: "8%",
    top: "55%",
    width: "22%",
    height: "30%",
    appearAt: 0.5,
  },
  {
    id: "top-right",
    src: "/hero/photo%20lain%202.png",
    edge: "right",
    offset: "-1%",
    top: "32%",
    width: "26%",
    height: "32%",
    appearAt: 0.4,
  },
  {
    id: "bottom-right",
    src: "/hero/photo%20web%202.png",
    edge: "right",
    offset: "-2%",
    top: "65%",
    width: "23%",
    height: "33%",
    appearAt: 0.6,
  },
] as const;

const PARALLAX_BALLOONS = [
  {
    id: "above-3",
    src: "/hero/baloon above 3.png",
    zIndex: 2,
    desktop: { left: "56%", top: "22%", width: "5.5%", dirX: 0.32, dirY: -0.95, endScale: 3, drift: 80 },
    mobile: { left: "58%", top: "27%", width: "10%", dirX: 0.46, dirY: -0.89, endScale: 2.8, drift: 80 },
  },
  {
    id: "above-1",
    src: "/hero/baloon above 1.png",
    zIndex: 3,
    desktop: { left: "36%", top: "17%", width: "5.5%", dirX: -0.32, dirY: -0.95, endScale: 3, drift: 80 },
    mobile: { left: "33%", top: "22%", width: "10%", dirX: -0.36, dirY: -0.93, endScale: 2.8, drift: 80 },
  },
  {
    id: "above-2",
    src: "/hero/baloon above 2.png",
    zIndex: 4,
    desktop: { left: "47%", top: "15%", width: "5.5%", dirX: -0.08, dirY: -1, endScale: 2.8, drift: 75 },
    mobile: { left: "47%", top: "19%", width: "10%", dirX: -0.05, dirY: -1, endScale: 2.6, drift: 75 },
  },
  {
    id: "right-behind",
    src: "/hero/baloon right behind.png",
    zIndex: 5,
    desktop: { left: "58%", top: "55%", width: "37%", dirX: 0.95, dirY: 0.05, endScale: 1.14, drift: 4 },
    mobile: { left: "56%", top: "60%", width: "42%", dirX: 0.95, dirY: 0.05, endScale: 1.14, drift: 5 },
  },
  {
    id: "left-small-1",
    src: "/hero/baloon left small 1.png",
    zIndex: 7,
    desktop: { left: "19%", top: "40%", width: "7%", dirX: -0.86, dirY: -0.5, endScale: 3.8, drift: 92 },
    mobile: { left: "12%", top: "47%", width: "12%", dirX: -0.93, dirY: -0.37, endScale: 3.6, drift: 90 },
  },
  {
    id: "left-small-2",
    src: "/hero/baloon left small 2.png",
    zIndex: 8,
    desktop: { left: "26%", top: "32%", width: "6%", dirX: -0.68, dirY: -0.74, endScale: 3.6, drift: 88 },
    mobile: { left: "21%", top: "40%", width: "11%", dirX: -0.62, dirY: -0.78, endScale: 3.4, drift: 85 },
  },
  {
    id: "close-above",
    src: "/hero/baloon close above.png",
    zIndex: 9,
    desktop: { left: "3%", top: "65%", width: "26%", dirX: -0.89, dirY: 0.46, endScale: 4.5, drift: 85 },
    mobile: { left: "-4%", top: "70%", width: "32%", dirX: -0.93, dirY: 0.38, endScale: 4.2, drift: 80 },
  },
  {
    id: "big-left",
    src: "/hero/baloon big left.png",
    zIndex: 10,
    desktop: { left: "24%", top: "56%", width: "23%", dirX: -0.83, dirY: 0.55, endScale: 5.2, drift: 88 },
    mobile: { left: "28%", top: "60%", width: "22%", dirX: -0.78, dirY: 0.62, endScale: 4.5, drift: 85 },
  },
] as const;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;
const easeOut = (progress: number) => 1 - Math.pow(1 - clamp(progress), 3);
const easeInOut = (progress: number) => {
  const t = clamp(progress);
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

function lerpCss(from: string, to: string, progress: number) {
  const fromMatch = from.match(/^(-?[\d.]+)(.*)$/);
  const toMatch = to.match(/^(-?[\d.]+)(.*)$/);

  if (!fromMatch || !toMatch || fromMatch[2] !== toMatch[2]) {
    return progress < 1 ? from : to;
  }

  return `${lerp(Number(fromMatch[1]), Number(toMatch[1]), progress)}${fromMatch[2]}`;
}

export default function NewHeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [fontScale, setFontScale] = useState(() => {
    if (typeof window === "undefined") return 1;
    const savedScale = Number(window.localStorage.getItem("wedding-font-scale"));
    return Number.isFinite(savedScale) && savedScale >= 0.85 && savedScale <= 1.25 ? savedScale : 1;
  });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let frameId = 0;

    const updateDeviceMode = () => {
      setIsMobile(window.innerWidth < 720);
    };

    const updateProgress = () => {
      updateDeviceMode();
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const nextProgress = total > 0 ? clamp(-rect.top / total) : 0;
      setProgress(nextProgress);
    };

    const scheduleUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateProgress();
      });
    };

    updateProgress();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--wedding-font-scale", String(fontScale));
    window.localStorage.setItem("wedding-font-scale", String(fontScale));
    window.dispatchEvent(new Event("wedding-font-scale-change"));
  }, [fontScale]);

  const eased = easeInOut(progress);
  const heroStyle = isMobile
    ? {
        left: `${lerp(0, 24, eased)}px`,
        top: `${lerp(0, 110, eased)}px`,
        width: `calc(100% - ${lerp(0, 48, eased)}px)`,
        height: `${lerp(100, 46, eased)}svh`,
        borderRadius: `${lerp(0, 22, eased)}px`,
      }
    : {
        left: lerpCss("0%", "31%", eased),
        top: lerpCss("0%", "10%", eased),
        width: lerpCss("100%", "38%", eased),
        height: lerpCss("100%", "85%", eased),
        borderRadius: `${lerp(0, 28, eased)}px`,
      };

  const nameOpacity = clamp(1 - progress * 1.5);
  const nameScale = lerp(1, 0.78, easeOut(progress));
  const chromeOpacity = clamp(1 - progress / 0.22);

  return (
    <section
      ref={sectionRef}
      className="relative h-[300vh] w-full bg-[#F7F1E7]"
      id="new-hero-section"
    >
      <HeroNav fontScale={fontScale} onFontScaleChange={setFontScale} />
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <div
          className="absolute overflow-hidden shadow-[0_20px_50px_rgba(43,36,29,0.18)]"
          style={{
            ...heroStyle,
            willChange: "left, top, width, height, border-radius",
            backfaceVisibility: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: isMobile ? "auto" : 0,
              left: isMobile ? "50%" : undefined,
              top: isMobile ? "50%" : undefined,
              width: "100%",
              height: isMobile ? "100svh" : "100%",
              overflow: "hidden",
              transform: isMobile ? "translate3d(-50%, -50%, 0)" : undefined,
            }}
          >
            <HeroParallaxScene progress={progress} isMobile={isMobile} />
          </div>

          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-center"
            style={{
              opacity: nameOpacity,
              transform: `scale(${nameScale})`,
              willChange: "transform, opacity",
              backfaceVisibility: "hidden",
            }}
          >
            <h1
              className="m-0 whitespace-nowrap text-white drop-shadow-[0_2px_32px_rgba(0,0,0,0.22)]"
              style={{
                fontFamily: "serif",
                fontStyle: "italic",
                fontWeight: 500,
                fontSize: isMobile ? "clamp(54px, 16vw, 88px)" : "clamp(80px, 13vw, 220px)",
                lineHeight: 0.95,
                letterSpacing: "-0.01em",
              }}
            >
              {COUPLE}
            </h1>
          </div>

          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 px-6 pb-7 sm:px-9"
            style={{ opacity: chromeOpacity }}
          >
            <div className="mb-3.5 h-px bg-white/55" />
            <div
              className="flex items-center justify-between text-[11px] uppercase tracking-[0.32em] text-white/90"
              style={{ fontFamily: "var(--font-din-alternate)" }}
            >
              <span className="text-lg">↓</span>
              <span>scroll to explore</span>
            </div>
          </div>
        </div>

        {!isMobile &&
          SIDE_PHOTOS.map((photo) => {
            const photoProgress = easeOut((progress - photo.appearAt) / (1 - photo.appearAt));
            const direction = photo.edge === "left" ? -110 : 110;
            const position = photo.edge === "left" ? { left: photo.offset } : { right: photo.offset };

            return (
              <div
                key={photo.id}
                className="absolute overflow-hidden rounded-3xl shadow-[0_12px_32px_rgba(43,36,29,0.16)]"
                style={{
                  ...position,
                  top: photo.top,
                  width: photo.width,
                  height: photo.height,
                  opacity: photoProgress,
                  transform: `translate3d(${lerp(direction, 0, photoProgress)}%, 0, 0) scale(${lerp(
                    0.94,
                    1,
                    photoProgress,
                  )})`,
                  willChange: "transform, opacity",
                  backfaceVisibility: "hidden",
                }}
              >
                <Image src={photo.src} alt="" fill sizes="30vw" className="object-cover" />
              </div>
            );
          })}

        {isMobile &&
          [
            { src: "/hero/photo-center.png", appearAt: 0.45, top: "64svh", label: "The Wedding of", labelType: "kicker" },
            { src: "/hero/photo-kedua.png", appearAt: 0.65, top: "82svh", label: COUPLE, labelType: "name" },
          ].map((photo, index) => {
            const photoProgress = easeOut((progress - photo.appearAt) / 0.35);

            return (
              <div
                key={`${photo.src}-${index}`}
                className="absolute left-6 right-6 h-[16svh] overflow-hidden rounded-[18px] shadow-[0_12px_32px_rgba(43,36,29,0.16)]"
                style={{
                  top: photo.top,
                  opacity: photoProgress,
                  transform: `translate3d(0, ${lerp(20, 0, photoProgress)}px, 0) scale(${lerp(
                    0.96,
                    1,
                    photoProgress,
                  )}) rotate(${index === 0 ? "-1deg" : "1deg"})`,
                  willChange: "transform, opacity",
                  backfaceVisibility: "hidden",
                }}
              >
                <Image src={photo.src} alt="" fill sizes="calc(100vw - 48px)" className="object-cover" />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center">
                  <span
                    className="text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.38)]"
                    style={{
                      fontFamily: photo.labelType === "name" ? "serif" : "var(--font-din-alternate)",
                      fontStyle: photo.labelType === "name" ? "italic" : "normal",
                      fontWeight: photo.labelType === "name" ? 500 : 400,
                      fontSize: photo.labelType === "name" ? "clamp(28px, 8.5vw, 42px)" : "clamp(13px, 4vw, 18px)",
                      lineHeight: photo.labelType === "name" ? 0.95 : 1,
                      letterSpacing: photo.labelType === "name" ? "-0.01em" : "0.24em",
                      textTransform: photo.labelType === "name" ? "none" : "uppercase",
                    }}
                  >
                    {photo.label}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}

function HeroNav({
  fontScale,
  onFontScaleChange,
}: {
  fontScale: number;
  onFontScaleChange: (scale: number) => void;
}) {
  const changeFontScale = (direction: -1 | 1) => {
    onFontScaleChange(clamp(Number((fontScale + direction * 0.08).toFixed(2)), 0.85, 1.25));
  };

  const scrollSection = (direction: -1 | 1) => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section"));
    if (!sections.length) return;

    const currentY = window.scrollY + window.innerHeight * 0.35;
    const currentIndex = sections.reduce((activeIndex, section, index) => {
      return section.offsetTop <= currentY ? index : activeIndex;
    }, 0);

    const storySection = document.getElementById("our-story");
    if (storySection) {
      const storyTop = storySection.offsetTop;
      const storyBottom = storyTop + storySection.offsetHeight;
      const isInsideStory = currentY >= storyTop && currentY < storyBottom;

      if (isInsideStory) {
        const storyCards = Array.from(storySection.querySelectorAll<HTMLElement>("[data-story-card]"));
        const storyCardIndex = storyCards.reduce((activeIndex, card, index) => {
          return card.offsetTop + storyTop <= currentY ? index : activeIndex;
        }, -1);
        const nextStoryIndex = storyCardIndex + direction;

        if (nextStoryIndex >= 0 && nextStoryIndex < storyCards.length) {
          window.scrollTo({
            top: storyTop + storyCards[nextStoryIndex].offsetTop - window.innerHeight * 0.16,
            behavior: "smooth",
          });
          return;
        }
      }
    }

    const gallerySection = document.getElementById("gallery-section");
    if (gallerySection) {
      const galleryTop = gallerySection.offsetTop;
      const galleryBottom = galleryTop + gallerySection.offsetHeight;
      const isInsideGallery = currentY >= galleryTop && currentY < galleryBottom;

      if (isInsideGallery) {
        const photoCount = Number(gallerySection.dataset.galleryPhotoCount) || 4;
        const stickyStart = window.innerHeight * 0.35;
        const stickyRange = gallerySection.offsetHeight - window.innerHeight - stickyStart;
        const sectionScroll = window.scrollY - galleryTop;
        const galleryProgress = stickyRange > 0 ? clamp((sectionScroll - stickyStart) / stickyRange) : 0;
        const revealStart = 0.04;
        const revealEnd = 0.95;
        const slotSize = (revealEnd - revealStart) / photoCount;
        const activePhotoIndex =
          galleryProgress < revealStart ? -1 : clamp(Math.floor((galleryProgress - revealStart) / slotSize), 0, photoCount - 1);
        const nextPhotoIndex = activePhotoIndex + direction;

        if (nextPhotoIndex >= 0 && nextPhotoIndex < photoCount) {
          const targetProgress = revealStart + slotSize * (nextPhotoIndex + 0.55);
          window.scrollTo({
            top: galleryTop + stickyStart + targetProgress * stickyRange,
            behavior: "smooth",
          });
          return;
        }
      }
    }

    const nextIndex = clamp(currentIndex + direction, 0, sections.length - 1);

    window.scrollTo({
      top: sections[nextIndex].offsetTop,
      behavior: "smooth",
    });
  };

  return (
    <nav className="fixed bottom-4 left-1/2 z-[900] flex w-[min(720px,calc(100%-32px))] -translate-x-1/2 items-center justify-between rounded-full border border-[#2B241D]/[0.06] bg-[#FFFCF5]/85 py-2 pl-3 pr-2 shadow-[0_6px_20px_rgba(43,36,29,0.10)] backdrop-blur-[14px] sm:bottom-6 sm:pl-[22px]">
      <MusicPlayer variant="nav" />
      <div className="flex items-center gap-2 sm:gap-5">
        {["Travel Logistics", "Registry", "FAQ"].map((label) => (
          <a key={label} className="hidden cursor-pointer text-[13px] text-[#2B241D] no-underline md:inline">
            {label}
          </a>
        ))}
        <div className="flex items-center gap-1 rounded-full bg-[#2B241D]/[0.06] p-1" aria-label="Font size controls">
          <button
            type="button"
            onClick={() => changeFontScale(-1)}
            className="h-8 rounded-full border-0 bg-transparent px-3 text-[12px] font-bold text-[#2B241D] transition hover:bg-white/70 disabled:opacity-35"
            disabled={fontScale <= 0.85}
            aria-label="Kecilkan font"
          >
            A-
          </button>
          <button
            type="button"
            onClick={() => changeFontScale(1)}
            className="h-8 rounded-full border-0 bg-transparent px-3 text-[12px] font-bold text-[#2B241D] transition hover:bg-white/70 disabled:opacity-35"
            disabled={fontScale >= 1.25}
            aria-label="Besarkan font"
          >
            A+
          </button>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-[#2B241D] p-1" aria-label="Section navigation">
          <button
            type="button"
            onClick={() => scrollSection(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border-0 bg-transparent text-[#F7F1E7] transition hover:bg-white/15 active:scale-95"
            aria-label="Section sebelumnya"
          >
            <ChevronLeft size={18} strokeWidth={2.4} />
          </button>
          <button
            type="button"
            onClick={() => scrollSection(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border-0 bg-[#F7F1E7] text-[#2B241D] transition hover:bg-white active:scale-95"
            aria-label="Section berikutnya"
          >
            <ChevronRight size={18} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </nav>
  );
}

function HeroParallaxScene({ progress, isMobile }: { progress: number; isMobile: boolean }) {
  const eased = Math.pow(clamp(progress), 1.4);
  const coupleScale = 1 + progress * 0.14;
  const baseScale = 1;
  const blurScaleFloor = 1.4;
  const blurPerScale = 4;
  const isTinyMobile = isMobile && typeof window !== "undefined" && window.innerWidth <= 380;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#E8E8E6]">
      <div
        className="absolute overflow-visible"
        style={
          isMobile
            ? {
                left: "50%",
                top: "50%",
                width: "100%",
                maxWidth: "640px",
                maxHeight: isTinyMobile ? "72vh" : "78vh",
                aspectRatio: "1 / 1.07",
                transform: "translate(-50%, -50%)",
              }
            : {
                inset: 0,
              }
        }
      >
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${(baseScale * coupleScale).toFixed(4)})`,
          transformOrigin: "50% 100%",
          willChange: "transform",
        }}
      >
        <Image
          src="/hero/couple with bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{
            objectPosition: isMobile ? "50% 80%" : "center bottom",
            zIndex: 1,
          }}
        />
      </div>

      {PARALLAX_BALLOONS.slice(0, 4).map((balloon) => (
        <ParallaxBalloon key={balloon.id} balloon={balloon} progress={eased} isMobile={isMobile} blurScaleFloor={blurScaleFloor} blurPerScale={blurPerScale} />
      ))}

      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${(baseScale * coupleScale).toFixed(4)})`,
          transformOrigin: "50% 100%",
          willChange: "transform",
          zIndex: 6,
        }}
      >
        <Image
          src="/hero/couple without bg.png"
          alt={COUPLE}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{
            objectPosition: isMobile ? "50% 80%" : "center bottom",
          }}
        />
      </div>

      {PARALLAX_BALLOONS.slice(4).map((balloon) => (
        <ParallaxBalloon key={balloon.id} balloon={balloon} progress={eased} isMobile={isMobile} blurScaleFloor={blurScaleFloor} blurPerScale={blurPerScale} />
      ))}
      </div>
    </div>
  );
}

function ParallaxBalloon({
  balloon,
  progress,
  isMobile,
  blurScaleFloor,
  blurPerScale,
}: {
  balloon: (typeof PARALLAX_BALLOONS)[number];
  progress: number;
  isMobile: boolean;
  blurScaleFloor: number;
  blurPerScale: number;
}) {
  const cfg: {
    left: string;
    top: string;
    width: string;
    dirX: number;
    dirY: number;
    endScale: number;
    drift: number;
  } = isMobile ? { ...balloon.mobile } : { ...balloon.desktop };
  if (isMobile && typeof window !== "undefined" && window.innerWidth <= 380) {
    if (balloon.id === "big-left") {
      cfg.left = "30%";
      cfg.top = "62%";
      cfg.width = "20%";
      cfg.endScale = 4;
    }
    if (balloon.id === "close-above") {
      cfg.left = "-2%";
      cfg.top = "72%";
      cfg.width = "30%";
      cfg.endScale = 3.8;
    }
    if (balloon.id === "right-behind") {
      cfg.width = "40%";
    }
  }
  const driftBase = isMobile ? 7.8 : 7.2;
  const x = cfg.dirX * progress * cfg.drift * driftBase;
  const y = cfg.dirY * progress * cfg.drift * driftBase;
  const scale = 1 + progress * (cfg.endScale - 1);
  const blur = Math.max(0, scale - blurScaleFloor) * blurPerScale;

  return (
    <Image
      src={balloon.src}
      alt=""
      width={420}
      height={420}
      sizes={cfg.width}
      className="pointer-events-none absolute h-auto select-none"
      style={{
        left: cfg.left,
        top: cfg.top,
        width: cfg.width,
        zIndex: balloon.zIndex,
        transform: `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`,
        transformOrigin: balloon.id === "right-behind" ? "50% 100%" : "50% 50%",
        filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none",
        willChange: "transform, filter",
        backfaceVisibility: "hidden",
      }}
    />
  );
}
