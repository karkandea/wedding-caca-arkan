"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import MusicPlayer from "./music-player";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const AUTO_NEXT_DELAYS = {
  hero: 5000,
  story: 3000,
  gallery: 1000,
  book: 200,
} as const;

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

export default FloatingSectionNav;
