"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { memo, type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { assetPath } from "../lib/asset-path";
import MusicPlayer from "./music-player";
import { ShimmerImage } from "./shimmer-image";

const COUPLE = "Salsa & Arkan";

const SIDE_PHOTOS = [
  {
    id: "top-left",
    src: assetPath("/hero/photo lain 1.webp"),
    edge: "left",
    offset: "-2%",
    top: "4%",
    width: "30%",
    height: "44%",
    appearAt: 0.3,
  },
  {
    id: "bottom-left",
    src: assetPath("/hero/photo web 1.webp"),
    edge: "left",
    offset: "8%",
    top: "55%",
    width: "22%",
    height: "30%",
    appearAt: 0.5,
  },
  {
    id: "top-right",
    src: assetPath("/hero/photo lain 2.webp"),
    edge: "right",
    offset: "-1%",
    top: "32%",
    width: "26%",
    height: "32%",
    appearAt: 0.4,
  },
  {
    id: "bottom-right",
    src: assetPath("/hero/photo web 2.webp"),
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
    src: assetPath("/hero/baloon above 3.webp"),
    zIndex: 2,
    desktop: { left: "56%", top: "22%", width: "5.5%", dirX: 0.32, dirY: -0.95, endScale: 3, drift: 80 },
    mobile: { left: "58%", top: "27%", width: "10%", dirX: 0.46, dirY: -0.89, endScale: 2.8, drift: 80 },
  },
  {
    id: "above-1",
    src: assetPath("/hero/baloon above 1.webp"),
    zIndex: 3,
    desktop: { left: "36%", top: "17%", width: "5.5%", dirX: -0.32, dirY: -0.95, endScale: 3, drift: 80 },
    mobile: { left: "33%", top: "22%", width: "10%", dirX: -0.36, dirY: -0.93, endScale: 2.8, drift: 80 },
  },
  {
    id: "above-2",
    src: assetPath("/hero/baloon above 2.webp"),
    zIndex: 4,
    desktop: { left: "47%", top: "15%", width: "5.5%", dirX: -0.08, dirY: -1, endScale: 2.8, drift: 75 },
    mobile: { left: "47%", top: "19%", width: "10%", dirX: -0.05, dirY: -1, endScale: 2.6, drift: 75 },
  },
  {
    id: "right-behind",
    src: assetPath("/hero/baloon right behind.webp"),
    zIndex: 5,
    desktop: { left: "58%", top: "55%", width: "37%", dirX: 0.95, dirY: 0.05, endScale: 1.14, drift: 4 },
    mobile: { left: "56%", top: "60%", width: "42%", dirX: 0.95, dirY: 0.05, endScale: 1.14, drift: 5 },
  },
  {
    id: "left-small-1",
    src: assetPath("/hero/baloon left small 1.webp"),
    zIndex: 7,
    desktop: { left: "19%", top: "40%", width: "7%", dirX: -0.86, dirY: -0.5, endScale: 3.8, drift: 92 },
    mobile: { left: "12%", top: "47%", width: "12%", dirX: -0.93, dirY: -0.37, endScale: 3.6, drift: 90 },
  },
  {
    id: "left-small-2",
    src: assetPath("/hero/baloon left small 2.webp"),
    zIndex: 8,
    desktop: { left: "26%", top: "32%", width: "6%", dirX: -0.68, dirY: -0.74, endScale: 3.6, drift: 88 },
    mobile: { left: "21%", top: "40%", width: "11%", dirX: -0.62, dirY: -0.78, endScale: 3.4, drift: 85 },
  },
  {
    id: "close-above",
    src: assetPath("/hero/baloon close above.webp"),
    zIndex: 9,
    desktop: { left: "3%", top: "65%", width: "26%", dirX: -0.89, dirY: 0.46, endScale: 4.5, drift: 85 },
    mobile: { left: "-4%", top: "70%", width: "32%", dirX: -0.93, dirY: 0.38, endScale: 4.2, drift: 80 },
  },
  {
    id: "big-left",
    src: assetPath("/hero/baloon big left.webp"),
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

type ParallaxConfig = {
  left: string;
  top: string;
  width: string;
  dirX: number;
  dirY: number;
  endScale: number;
  drift: number;
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
  const progressRef = useRef(0);

  // Refs for direct DOM manipulation
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const sceneViewportRef = useRef<HTMLDivElement>(null);
  const nameOverlayRef = useRef<HTMLDivElement>(null);
  const chromeOverlayRef = useRef<HTMLDivElement>(null);
  const radarIndicatorRef = useRef<HTMLDivElement>(null);
  const sidePhotosRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobilePhotosRefs = useRef<(HTMLDivElement | null)[]>([]);
  const coupleLayersRefs = useRef<(HTMLDivElement | null)[]>([]);
  const balloonRefs = useRef<(HTMLImageElement | null)[]>([]);

  const setCoupleLayerRef = useCallback((index: number, element: HTMLDivElement | null) => {
    coupleLayersRefs.current[index] = element;
  }, []);

  const setBalloonRef = useCallback((index: number, element: HTMLImageElement | null) => {
    balloonRefs.current[index] = element;
  }, []);

  const updateParallaxScene = useCallback((progress: number, mobile: boolean, isTinyMobile: boolean) => {
    const eased = Math.pow(clamp(progress), 1.4);
    const coupleScale = 1 + progress * 0.14;

    // Update couple layers
    coupleLayersRefs.current.forEach((layer) => {
      if (layer) {
        layer.style.transform = `scale(${coupleScale.toFixed(4)})`;
      }
    });

    // Update balloons
    const blurScaleFloor = 1.4;
    const blurPerScale = 4;

    PARALLAX_BALLOONS.forEach((balloon, index) => {
      const balloonRef = balloonRefs.current[index];
      if (!balloonRef) return;

      const cfg: ParallaxConfig = mobile ? { ...balloon.mobile } : { ...balloon.desktop };

      if (isTinyMobile) {
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

      const driftBase = mobile ? 7.8 : 7.2;
      const x = cfg.dirX * eased * cfg.drift * driftBase;
      const y = cfg.dirY * eased * cfg.drift * driftBase;
      const scale = 1 + eased * (cfg.endScale - 1);
      const blur = Math.max(0, scale - blurScaleFloor) * blurPerScale;

      balloonRef.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
      balloonRef.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
    });
  }, []);

  const updateHeroStyles = useCallback(
    (progress: number, mobile: boolean, isTinyMobile: boolean) => {
      const eased = easeInOut(progress);

      // Direct DOM updates avoid React re-rendering during scroll.
      if (heroContainerRef.current) {
        if (mobile) {
          heroContainerRef.current.style.left = `${lerp(0, 24, eased)}px`;
          heroContainerRef.current.style.top = `${lerp(0, 110, eased)}px`;
          heroContainerRef.current.style.width = `calc(100% - ${lerp(0, 48, eased)}px)`;
          heroContainerRef.current.style.height = `${lerp(100, 46, eased)}svh`;
          heroContainerRef.current.style.borderRadius = `${lerp(0, 22, eased)}px`;
        } else {
          heroContainerRef.current.style.left = lerpCss("0%", "31%", eased);
          heroContainerRef.current.style.top = lerpCss("0%", "10%", eased);
          heroContainerRef.current.style.width = lerpCss("100%", "38%", eased);
          heroContainerRef.current.style.height = lerpCss("100%", "85%", eased);
          heroContainerRef.current.style.borderRadius = `${lerp(0, 28, eased)}px`;
        }
      }

      if (sceneViewportRef.current) {
        if (mobile) {
          sceneViewportRef.current.style.inset = "auto";
          sceneViewportRef.current.style.left = "50%";
          sceneViewportRef.current.style.top = "50%";
          sceneViewportRef.current.style.height = "100svh";
          sceneViewportRef.current.style.transform = "translate3d(-50%, -50%, 0)";
        } else {
          sceneViewportRef.current.style.inset = "0";
          sceneViewportRef.current.style.left = "";
          sceneViewportRef.current.style.top = "";
          sceneViewportRef.current.style.height = "100%";
          sceneViewportRef.current.style.transform = "";
        }
      }

      if (nameOverlayRef.current) {
        const nameOpacity = clamp(1 - progress * 1.5);
        const nameScale = lerp(1, 0.78, easeOut(progress));
        nameOverlayRef.current.style.opacity = String(nameOpacity);
        nameOverlayRef.current.style.transform = `scale(${nameScale})`;
      }

      if (chromeOverlayRef.current) {
        const chromeOpacity = clamp(1 - progress / 0.22);
        chromeOverlayRef.current.style.opacity = String(chromeOpacity);
      }

      if (radarIndicatorRef.current) {
        const radarOpacity = clamp(1 - progress / 0.18);
        radarIndicatorRef.current.style.opacity = String(radarOpacity);
        radarIndicatorRef.current.style.transform = `translate3d(0, ${lerp(0, 12, 1 - radarOpacity)}px, 0)`;
      }

      if (!mobile && sidePhotosRefs.current.length > 0) {
        SIDE_PHOTOS.forEach((photo, index) => {
          const photoRef = sidePhotosRefs.current[index];
          if (photoRef) {
            const photoProgress = easeOut((progress - photo.appearAt) / (1 - photo.appearAt));
            const direction = photo.edge === "left" ? -110 : 110;
            photoRef.style.opacity = String(photoProgress);
            photoRef.style.transform = `translate3d(${lerp(direction, 0, photoProgress)}%, 0, 0) scale(${lerp(0.94, 1, photoProgress)})`;
          }
        });
      }

      if (mobile) {
        [0.45, 0.65].forEach((appearAt, index) => {
          const photoRef = mobilePhotosRefs.current[index];
          if (photoRef) {
            const photoProgress = easeOut((progress - appearAt) / 0.35);
            photoRef.style.opacity = String(photoProgress);
            photoRef.style.transform = `translate3d(0, ${lerp(20, 0, photoProgress)}px, 0) scale(${lerp(0.96, 1, photoProgress)}) rotate(${index === 0 ? "-1deg" : "1deg"})`;
          }
        });
      }

      updateParallaxScene(progress, mobile, isTinyMobile);
    },
    [updateParallaxScene],
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let frameId = 0;
    let currentIsMobile = window.innerWidth < 720;
    let currentIsTinyMobile = currentIsMobile && window.innerWidth <= 380;

    const updateDeviceMode = () => {
      const nextIsMobile = window.innerWidth < 720;
      currentIsMobile = nextIsMobile;
      currentIsTinyMobile = nextIsMobile && window.innerWidth <= 380;
    };

    const updateProgress = () => {
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const nextProgress = total > 0 ? clamp(-rect.top / total) : 0;
      progressRef.current = nextProgress;
      updateHeroStyles(nextProgress, currentIsMobile, currentIsTinyMobile);
    };

    const scheduleUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateProgress();
      });
    };

    const handleResize = () => {
      updateDeviceMode();
      scheduleUpdate();
    };

    updateDeviceMode();
    const rect = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    const initialProgress = total > 0 ? clamp(-rect.top / total) : 0;
    progressRef.current = initialProgress;
    updateHeroStyles(initialProgress, currentIsMobile, currentIsTinyMobile);

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", handleResize);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [updateHeroStyles]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[300vh] w-full bg-[#F7F1E7]"
      id="new-hero-section"
      style={{ contain: "layout" }}
    >
      <HeroNav />
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <div
          ref={heroContainerRef}
          className="absolute overflow-hidden shadow-[0_20px_50px_rgba(43,36,29,0.18)]"
          style={{
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            borderRadius: 0,
            willChange: "left, top, width, height, border-radius",
            backfaceVisibility: "hidden",
          }}
        >
          <div
            ref={sceneViewportRef}
            className="hero-scene-viewport"
            style={{
              position: "absolute",
              inset: "auto",
              left: "50%",
              top: "50%",
              width: "100%",
              height: "100svh",
              overflow: "hidden",
              transform: "translate3d(-50%, -50%, 0)",
            }}
          >
            <HeroParallaxScene
              setCoupleLayerRef={setCoupleLayerRef}
              setBalloonRef={setBalloonRef}
            />
          </div>

          <div
            ref={nameOverlayRef}
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-center"
            style={{
              willChange: "transform, opacity",
              backfaceVisibility: "hidden",
            }}
          >
            <h1
              className="m-0 whitespace-nowrap text-[clamp(80px,13vw,220px)] text-white drop-shadow-[0_2px_32px_rgba(0,0,0,0.22)] max-[719px]:text-[clamp(54px,16vw,88px)]"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
                fontWeight: 500,
                lineHeight: 0.95,
                letterSpacing: "-0.01em",
              }}
            >
              {COUPLE}
            </h1>
          </div>

          <div
            ref={chromeOverlayRef}
            className="pointer-events-none absolute bottom-0 left-0 right-0 px-6 pb-7 sm:px-9"
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

        {SIDE_PHOTOS.map((photo, index) => {
          const position = photo.edge === "left" ? { left: photo.offset } : { right: photo.offset };

          return (
            <div
              key={photo.id}
              ref={(el) => {
                sidePhotosRefs.current[index] = el;
              }}
              className="absolute overflow-hidden rounded-3xl shadow-[0_12px_32px_rgba(43,36,29,0.16)] max-[719px]:!hidden"
              style={{
                ...position,
                top: photo.top,
                width: photo.width,
                height: photo.height,
                opacity: 0,
                willChange: "transform, opacity",
                backfaceVisibility: "hidden",
              }}
            >
              <ShimmerImage src={photo.src} alt="" fill sizes="30vw" className="object-cover" />
            </div>
          );
        })}

        {[
          { src: assetPath("/hero/photo-center.webp"), appearAt: 0.45, top: "64svh", label: "The Wedding of", labelType: "kicker" },
          { src: assetPath("/hero/photo-kedua.webp"), appearAt: 0.65, top: "82svh", label: COUPLE, labelType: "name" },
        ].map((photo, index) => {
          return (
            <div
              key={`${photo.src}-${index}`}
              ref={(el) => {
                mobilePhotosRefs.current[index] = el;
              }}
              className="absolute left-6 right-6 hidden h-[16svh] overflow-hidden rounded-[18px] shadow-[0_12px_32px_rgba(43,36,29,0.16)] max-[719px]:block"
              style={{
                top: photo.top,
                opacity: 0,
                willChange: "transform, opacity",
                backfaceVisibility: "hidden",
              }}
            >
              <ShimmerImage src={photo.src} alt="" fill sizes="calc(100vw - 48px)" className="object-cover" />
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
        <ScrollRadarIndicator radarRef={radarIndicatorRef} />
      </div>
    </section>
  );
}

const ScrollRadarIndicator = memo(function ScrollRadarIndicator({ radarRef }: { radarRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={radarRef}
      className="pointer-events-none absolute bottom-[88px] left-0 right-0 z-[70] mx-auto flex w-fit flex-col items-center gap-2 text-[#2B241D] sm:bottom-[104px]"
      style={{
        opacity: 1,
        transform: "translate3d(0, 0, 0)",
        transition: "opacity 180ms ease",
      }}
      aria-hidden="true"
    >
      <div className="scroll-radar">
        <span />
        <span />
        <span />
        <div className="scroll-radar-arrows">
          <ChevronDown className="scroll-radar-arrow scroll-radar-arrow-top" size={20} strokeWidth={2.15} />
          <ChevronDown className="scroll-radar-arrow scroll-radar-arrow-middle" size={22} strokeWidth={2.35} />
          <ChevronDown className="scroll-radar-arrow scroll-radar-arrow-bottom" size={20} strokeWidth={2.15} />
        </div>
      </div>
      <p
        className="m-0 whitespace-nowrap bg-gradient-to-r from-[#2B241D] via-[#A66B35] to-[#2B241D] bg-clip-text text-[10px] font-semibold uppercase tracking-[0.28em] text-transparent drop-shadow-[0_1px_8px_rgba(255,252,245,0.82)] sm:text-[11px]"
        style={{ fontFamily: "var(--font-din-alternate)" }}
      >
        Scroll pelan
      </p>
    </div>
  );
});

const HeroNav = memo(function HeroNav() {
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [scrollHintResetKey, setScrollHintResetKey] = useState(0);

  useEffect(() => {
    let idleTimer = 0;

    const scheduleHint = () => {
      setShowScrollHint(false);
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        const nearBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 80;
        setShowScrollHint(!nearBottom);
      }, 3000);
    };

    scheduleHint();
    window.addEventListener("scroll", scheduleHint, { passive: true });

    return () => {
      window.clearTimeout(idleTimer);
      window.removeEventListener("scroll", scheduleHint);
    };
  }, [scrollHintResetKey]);

  const scrollSection = (direction: -1 | 1) => {
    setShowScrollHint(false);
    setScrollHintResetKey((key) => key + 1);
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section"));
    if (!sections.length) return;

    const currentY = window.scrollY + window.innerHeight * 0.35;
    const currentIndex = sections.reduce((activeIndex, section, index) => {
      return section.offsetTop <= currentY ? index : activeIndex;
    }, 0);

    const heroSection = document.getElementById("new-hero-section");
    if (heroSection) {
      const heroTop = heroSection.offsetTop;
      const heroEnd = heroTop + heroSection.offsetHeight - window.innerHeight;
      const isInsideHero = currentY >= heroTop && currentY < heroTop + heroSection.offsetHeight;

      if (isInsideHero && direction === 1 && window.scrollY < heroEnd - 8) {
        window.scrollTo({
          top: heroEnd,
          behavior: "smooth",
        });
        return;
      }
    }

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

    const bookSection = document.getElementById("book-section");
    if (bookSection) {
      const bookTop = bookSection.offsetTop;
      const bookEnd = bookTop + bookSection.offsetHeight - window.innerHeight;
      const bookBottom = bookTop + bookSection.offsetHeight;
      const isInsideBook = currentY >= bookTop && currentY < bookBottom;

      if (isInsideBook) {
        const bookRange = bookEnd - bookTop;
        const bookProgress = bookRange > 0 ? clamp((window.scrollY - bookTop) / bookRange) : 0;
        const nextBookProgress = clamp(bookProgress + direction * 0.18);

        if (nextBookProgress > 0 && nextBookProgress < 1) {
          window.scrollTo({
            top: bookTop + nextBookProgress * bookRange,
            behavior: "smooth",
          });
          return;
        }

        if (direction === 1 && window.scrollY < bookEnd - 8) {
          window.scrollTo({
            top: bookEnd,
            behavior: "smooth",
          });
          return;
        }

        if (direction === -1 && window.scrollY > bookTop + 8) {
          window.scrollTo({
            top: bookTop,
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
      <span
        className="hidden whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.16em] text-[#2B241D]/55 sm:block"
        style={{ fontFamily: "var(--font-din-alternate)" }}
      >
        Website by dualangka.com
      </span>
      <div className="flex items-center gap-2 sm:gap-5">
        <div className="flex items-center gap-1 rounded-full bg-[#2B241D] p-1" aria-label="Section navigation">
          <button
            type="button"
            onClick={() => scrollSection(-1)}
            className="flex h-8 items-center gap-1.5 rounded-full border-0 bg-transparent px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F7F1E7] transition hover:bg-white/15 active:scale-95 sm:px-3 sm:text-[11px]"
            aria-label="Section sebelumnya"
          >
            <ChevronUp size={16} strokeWidth={2.4} />
            <span>Naik</span>
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowScrollHint(false);
                setScrollHintResetKey((key) => key + 1);
              }}
              className={`absolute bottom-[calc(100%+12px)] right-0 w-[190px] rounded-[14px] border-0 bg-[#2B241D] px-3 py-2 text-center text-[11px] font-semibold leading-snug text-[#FFFCF5] shadow-[0_12px_28px_rgba(43,36,29,0.18)] transition duration-300 sm:w-[220px] sm:text-xs ${
                showScrollHint ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
              style={{ fontFamily: "var(--font-din-alternate)" }}
              aria-label="Tutup pengingat scroll"
            >
              Yuk lanjut, masih ada cerita berikutnya.
              <span className="ml-1 text-[#FFFCF5]/55" aria-hidden="true">
                Tap untuk tutup
              </span>
              <span className="absolute -bottom-1.5 right-7 h-3 w-3 rotate-45 bg-[#2B241D]" />
            </button>
            <button
              type="button"
              onClick={() => scrollSection(1)}
              className="relative flex h-8 items-center gap-1.5 overflow-visible rounded-full border-0 bg-[#F7F1E7] px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2B241D] transition hover:bg-white active:scale-95 sm:px-3 sm:text-[11px]"
              aria-label="Section berikutnya"
            >
              {showScrollHint && (
                <>
                  <span className="pointer-events-none absolute inset-0 rounded-full border border-[#F7F1E7]/70 animate-ping" />
                  <span className="pointer-events-none absolute -inset-0.5 rounded-full border border-[#F7F1E7]/35 animate-ping [animation-delay:450ms]" />
                </>
              )}
              <span>Lanjut</span>
              <ChevronDown size={16} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
});

const HeroParallaxScene = memo(function HeroParallaxScene({
  setCoupleLayerRef,
  setBalloonRef,
}: {
  setCoupleLayerRef: (index: number, element: HTMLDivElement | null) => void;
  setBalloonRef: (index: number, element: HTMLImageElement | null) => void;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#E8E8E6]">
      <div
        className="hero-scene-frame absolute overflow-visible"
        style={{
          left: "50%",
          top: "50%",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "78vh",
          aspectRatio: "1 / 1.07",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          ref={(el) => {
            setCoupleLayerRef(0, el);
          }}
          className="absolute inset-0"
          style={{
            transformOrigin: "50% 100%",
            willChange: "transform",
          }}
        >
          <ShimmerImage
            src={assetPath("/hero/couple with bg.webp")}
            alt=""
            fill
            loading="eager"
            sizes="100vw"
            className="object-cover object-[50%_80%] min-[720px]:object-bottom"
            showShimmer={false}
            style={{
              zIndex: 1,
            }}
          />
        </div>

        {PARALLAX_BALLOONS.slice(0, 4).map((balloon, index) => (
          <ParallaxBalloon
            key={balloon.id}
            balloon={balloon}
            balloonRef={(el) => {
              setBalloonRef(index, el);
            }}
          />
        ))}

        <div
          ref={(el) => {
            setCoupleLayerRef(1, el);
          }}
          className="absolute inset-0"
          style={{
            transformOrigin: "50% 100%",
            willChange: "transform",
            zIndex: 6,
          }}
        >
          <ShimmerImage
            src={assetPath("/hero/couple without bg.webp")}
            alt={COUPLE}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-[50%_80%] min-[720px]:object-bottom"
            showShimmer={false}
          />
        </div>

        {PARALLAX_BALLOONS.slice(4).map((balloon, index) => (
          <ParallaxBalloon
            key={balloon.id}
            balloon={balloon}
            balloonRef={(el) => {
              setBalloonRef(index + 4, el);
            }}
          />
        ))}
      </div>
    </div>
  );
});

const ParallaxBalloon = memo(function ParallaxBalloon({
  balloon,
  balloonRef,
}: {
  balloon: (typeof PARALLAX_BALLOONS)[number];
  balloonRef: (el: HTMLImageElement | null) => void;
}) {
  const cfg = balloon.desktop;
  const mobileCfg = balloon.mobile;

  return (
    <Image
      ref={balloonRef}
      src={balloon.src}
      alt=""
      width={420}
      height={420}
      sizes={`(max-width: 720px) ${cfg.width}, ${cfg.width}`}
      loading="lazy"
      quality={85}
      className="hero-balloon pointer-events-none absolute h-auto select-none"
      style={{
        left: cfg.left,
        top: cfg.top,
        width: cfg.width,
        "--mobile-left": mobileCfg.left,
        "--mobile-top": mobileCfg.top,
        "--mobile-width": mobileCfg.width,
        zIndex: balloon.zIndex,
        transformOrigin: balloon.id === "right-behind" ? "50% 100%" : "50% 50%",
        willChange: "transform, filter",
        backfaceVisibility: "hidden",
      } as CSSProperties}
    />
  );
});
