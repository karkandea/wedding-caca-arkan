"use client";

import { Camera, ChevronDown, ChevronUp, Globe2, MessageSquareText, X } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useEffect, useState } from "react";
import { assetPath } from "../lib/asset-path";
import MusicPlayer from "./music-player";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const AUTO_NEXT_DELAYS = {
  hero: 5000,
  story: 3000,
  gallery: 1000,
  book: 200,
} as const;
const STORY_CARD_LANDING_OFFSET_PX = 220;

function getStoryCardTargetTop(storySection: HTMLElement, card: HTMLElement) {
  return storySection.offsetTop + card.offsetTop + STORY_CARD_LANDING_OFFSET_PX;
}

function getAutoNextDelay() {
  if (document.hidden) return null;
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 80) return null;

  const currentY = window.scrollY + window.innerHeight * 0.35;
  const heroSection = document.getElementById("new-hero-section");
  if (heroSection && currentY >= heroSection.offsetTop && currentY < heroSection.offsetTop + heroSection.offsetHeight) {
    return AUTO_NEXT_DELAYS.hero;
  }

  const storySection = document.getElementById("our-story");
  if (storySection && currentY >= storySection.offsetTop && currentY < storySection.offsetTop + storySection.offsetHeight) {
    return AUTO_NEXT_DELAYS.story;
  }

  const gallerySection = document.getElementById("gallery-section");
  if (gallerySection && currentY >= gallerySection.offsetTop && currentY < gallerySection.offsetTop + gallerySection.offsetHeight) {
    return AUTO_NEXT_DELAYS.gallery;
  }

  const bookSection = document.getElementById("book-section");
  if (bookSection && currentY >= bookSection.offsetTop && currentY < bookSection.offsetTop + bookSection.offsetHeight) {
    return AUTO_NEXT_DELAYS.book;
  }

  return AUTO_NEXT_DELAYS.hero;
}

function shouldDisableAutoNext() {
  const userAgent = window.navigator.userAgent;
  return (
    process.env.NODE_ENV !== "production" ||
    userAgent.includes("Lighthouse") ||
    userAgent.includes("Chrome-Lighthouse")
  );
}

const FloatingSectionNav = memo(function FloatingSectionNav() {
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [scrollHintResetKey, setScrollHintResetKey] = useState(0);
  const [isScrollHintDismissed, setIsScrollHintDismissed] = useState(false);

  useEffect(() => {
    if (isScrollHintDismissed) {
      setShowScrollHint(false);
      return;
    }

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
  }, [isScrollHintDismissed, scrollHintResetKey]);

  const dismissScrollHint = useCallback(() => {
    setIsScrollHintDismissed(true);
    setShowScrollHint(false);
    setScrollHintResetKey((key) => key + 1);
  }, []);

  const scrollSection = useCallback((direction: -1 | 1) => {
    setShowScrollHint(false);
    setScrollHintResetKey((key) => key + 1);
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section"));
    if (!sections.length) return;

    const currentY = window.scrollY + window.innerHeight * 0.35;
    const currentIndex = sections.reduce((activeIndex, section, index) => {
      return section.offsetTop <= currentY ? index : activeIndex;
    }, 0);

    const heroSection = document.getElementById("new-hero-section");
    const storySection = document.getElementById("our-story");
    if (heroSection) {
      const heroTop = heroSection.offsetTop;
      const heroEnd = heroTop + heroSection.offsetHeight - window.innerHeight;
      const isInsideHero = currentY >= heroTop && currentY < heroTop + heroSection.offsetHeight;

      if (isInsideHero && direction === 1 && window.scrollY < heroEnd - 8) {
        const firstStoryCard = storySection?.querySelector<HTMLElement>("[data-story-card]");
        window.scrollTo({
          top: firstStoryCard && storySection ? getStoryCardTargetTop(storySection, firstStoryCard) : heroEnd,
          behavior: "smooth",
        });
        return;
      }
    }

    if (storySection) {
      const storyTop = storySection.offsetTop;
      const storyBottom = storyTop + storySection.offsetHeight;
      const isInsideStory = currentY >= storyTop && currentY < storyBottom;

      if (isInsideStory) {
        const storyCards = Array.from(storySection.querySelectorAll<HTMLElement>("[data-story-card]"));
        const storyCardAnchorY = window.scrollY + Math.min(window.innerHeight * 0.1, 96);
        const storyCardIndex = storyCards.reduce((activeIndex, card, index) => {
          return storyTop + card.offsetTop <= storyCardAnchorY ? index : activeIndex;
        }, -1);
        const nextStoryIndex = storyCardIndex + direction;

        if (nextStoryIndex >= 0 && nextStoryIndex < storyCards.length) {
          window.scrollTo({
            top: getStoryCardTargetTop(storySection, storyCards[nextStoryIndex]),
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
        const stickyStart = window.innerWidth < 768 ? 0 : window.innerHeight * 0.35;
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
  }, []);

  useEffect(() => {
    if (shouldDisableAutoNext()) return;

    let autoNextTimer = 0;

    const scheduleAutoNext = () => {
      window.clearTimeout(autoNextTimer);
      const delay = getAutoNextDelay();
      if (delay === null) return;

      autoNextTimer = window.setTimeout(() => {
        scrollSection(1);
      }, delay);
    };

    scheduleAutoNext();
    window.addEventListener("scroll", scheduleAutoNext, { passive: true });
    window.addEventListener("resize", scheduleAutoNext);
    document.addEventListener("visibilitychange", scheduleAutoNext);

    return () => {
      window.clearTimeout(autoNextTimer);
      window.removeEventListener("scroll", scheduleAutoNext);
      window.removeEventListener("resize", scheduleAutoNext);
      document.removeEventListener("visibilitychange", scheduleAutoNext);
    };
  }, [scrollSection]);

  return (
    <nav className="fixed bottom-4 left-1/2 z-[900] flex h-[64px] w-[min(1180px,calc(100%-28px))] -translate-x-1/2 items-center justify-between gap-4 rounded-full border border-[#2B241D]/[0.07] bg-[#FFF8F5]/90 px-4 shadow-[0_12px_36px_rgba(43,36,29,0.12)] backdrop-blur-[16px] max-[380px]:gap-2 max-[380px]:px-2 sm:bottom-6 sm:h-[72px] sm:px-6">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4 md:flex-1 lg:flex-none">
        <MusicPlayer variant="nav" />
        <span
          className="hidden whitespace-nowrap text-[11px] font-medium tracking-[0.01em] text-[#6B5A55] sm:text-[12px] lg:inline"
          style={{ fontFamily: "var(--font-din-alternate)" }}
        >
          Buat undangan bersama
        </span>
        <span className="relative hidden h-8 w-[112px] shrink-0 lg:block lg:h-10 lg:w-[142px]" aria-label="DuaJiwa">
          <Image src={assetPath("/logo duajiwa.png")} alt="DuaJiwa" fill sizes="142px" className="object-contain" />
        </span>
        <span className="relative h-8 w-[92px] shrink-0 max-[380px]:w-[68px] lg:hidden" aria-label="DuaJiwa">
          <Image src={assetPath("/logo duajiwa.png")} alt="DuaJiwa" fill sizes="(max-width: 380px) 68px, 92px" className="object-contain" />
        </span>
      </div>

      <div className="hidden min-w-0 flex-1 items-center justify-center gap-4 text-[13px] font-semibold tracking-[0.03em] text-[#6B5A55] lg:flex xl:gap-5">
        <span className="h-5 w-px shrink-0 bg-[#6B5A55]/15" aria-hidden="true" />
        <a className="flex items-center gap-2 whitespace-nowrap transition hover:text-[#2B241D]" href="https://duajiwa.com" target="_blank" rel="noreferrer">
          <Globe2 size={16} strokeWidth={2.2} />
          duajiwa.com
        </a>
        <span className="h-5 w-px shrink-0 bg-[#6B5A55]/15" aria-hidden="true" />
        <a className="flex items-center gap-2 whitespace-nowrap transition hover:text-[#2B241D]" href="https://wa.me/6282220700245" target="_blank" rel="noreferrer">
          <MessageSquareText size={16} strokeWidth={2.2} />
          0822 2070 0245
        </a>
        <span className="h-5 w-px shrink-0 bg-[#6B5A55]/15" aria-hidden="true" />
        <a className="flex items-center gap-2 whitespace-nowrap transition hover:text-[#2B241D]" href="https://instagram.com/duajiwa.invitation" target="_blank" rel="noreferrer">
          <Camera size={16} strokeWidth={2.2} />
          duajiwa.invitation
        </a>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        <span className="hidden h-7 w-px shrink-0 bg-[#2B241D]/15 lg:block" aria-hidden="true" />
        <div className="flex items-center gap-2 sm:gap-3" aria-label="Section navigation">
          <button
            type="button"
            onClick={() => scrollSection(-1)}
            className="flex h-10 items-center gap-1.5 rounded-full border border-[#1C1C1C] bg-transparent px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1C1C1C] transition hover:bg-[#2B241D]/5 active:scale-95 sm:h-11 sm:px-5 sm:text-[12px]"
            aria-label="Section sebelumnya"
          >
            <ChevronUp className="sm:hidden" size={15} strokeWidth={2.4} />
            <span>Naik</span>
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={dismissScrollHint}
              className={`absolute bottom-[calc(100%+12px)] right-0 w-[202px] rounded-[14px] border-0 bg-[#2B241D] px-3 py-2 pr-8 text-left text-[11px] font-semibold leading-snug text-[#FFFCF5] shadow-[0_12px_28px_rgba(43,36,29,0.18)] transition duration-300 sm:w-[232px] sm:text-xs ${
                showScrollHint ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
              style={{ fontFamily: "var(--font-din-alternate)" }}
              aria-label="Tutup pengingat scroll"
            >
              <X className="absolute right-2.5 top-2.5 text-[#FFFCF5]/65" size={13} strokeWidth={2.4} aria-hidden="true" />
              Yuk lanjut, masih ada cerita berikutnya.
              <span className="ml-1 text-[#FFFCF5]/55" aria-hidden="true">
                Tap untuk tutup
              </span>
              <span className="absolute -bottom-1.5 right-7 h-3 w-3 rotate-45 bg-[#2B241D]" />
            </button>
            <button
              type="button"
              onClick={() => scrollSection(1)}
              className="relative flex h-10 items-center gap-1.5 overflow-visible rounded-full border-0 bg-[#161412] px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#FFF8F5] transition hover:bg-[#2B241D] active:scale-95 sm:h-11 sm:px-5 sm:text-[12px]"
              aria-label="Section berikutnya"
            >
              {showScrollHint && (
                <>
                  <span className="pointer-events-none absolute inset-0 rounded-full border border-[#161412]/35 animate-ping" />
                  <span className="pointer-events-none absolute -inset-0.5 rounded-full border border-[#161412]/20 animate-ping [animation-delay:450ms]" />
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

export default FloatingSectionNav;
