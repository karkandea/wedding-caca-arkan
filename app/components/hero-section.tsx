"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";

type HeroPhoto = { src: string; position: "left" | "center" | "right" };
type HeroSectionProps = {
  accentColor: string;
  coupleNames: string;
  heroReady: boolean;
  photos: HeroPhoto[];
};

export default function HeroSection({ accentColor, coupleNames, heroReady, photos }: HeroSectionProps) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let frameId = 0;

    const updateOnScroll = () => {
      const nav = navRef.current;
      if (!nav) return;

      const progress = Math.max(0, Math.min(1, window.scrollY / window.innerHeight));
      const navProgress = Math.max(0, Math.min(1, (progress - 0.05) / 0.25));

      const width = 100 - 56 * navProgress;
      const top = 18 * navProgress;
      const radius = 999 * navProgress;
      const blur = 14 * navProgress;
      const backgroundOpacity = 0.78 * navProgress;
      const borderOpacity = 0.06 + 0.2 * navProgress;

      nav.style.width = `${width}%`;
      nav.style.top = `${top}px`;
      nav.style.left = "50%";
      nav.style.transform = "translate3d(-50%, 0, 0)";
      nav.style.borderRadius = `${radius}px`;
      nav.style.background = `rgba(255,255,255,${backgroundOpacity})`;
      nav.style.backdropFilter = navProgress > 0 ? `blur(${blur}px)` : "none";
      nav.style.setProperty("-webkit-backdrop-filter", navProgress > 0 ? `blur(${blur}px)` : "none");
      nav.style.borderColor = `rgba(43,36,29,${borderOpacity})`;
      nav.style.boxShadow =
        navProgress > 0
          ? "0 6px 24px rgba(43,36,29,0.07), 0 1px 2px rgba(43,36,29,0.04)"
          : "none";
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

  return (
    <section
      style={{
        width: "100vw",
        height: "100svh",
        position: "relative",
        overflow: "hidden",
        background: "#7DD4F5",
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100svh" }}>
        {/* Text overlay - upper right */}
        <div
          style={{
            position: "absolute",
            right: "8%",
            top: "15%",
            zIndex: 30,
            color: "white",
            textAlign: "right",
          }}
        >
          <p style={{ fontFamily: "cursive", fontSize: "18px", marginBottom: "8px" }}>
            we have been dating for
          </p>
          <h2
            style={{
              fontFamily: "serif",
              fontWeight: "bold",
              fontSize: "clamp(64px, 10vw, 120px)",
              lineHeight: 1,
              marginBottom: "16px",
              transform: "rotate(-3deg)",
            }}
          >
            7 years
          </h2>
          <hr
            style={{
              width: "200px",
              border: "none",
              borderTop: "1px solid white",
              marginLeft: "auto",
              marginBottom: "16px",
            }}
          />
          <h3
            style={{
              fontFamily: "serif",
              fontStyle: "italic",
              fontSize: "clamp(28px, 4vw, 52px)",
              marginBottom: "8px",
            }}
          >
            Salsa & Arkan
          </h3>
          <p
            style={{
              fontWeight: 300,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontSize: "14px",
              opacity: 0.8,
            }}
          >
            June 18, 2026
          </p>
        </div>

        {/* Scroll indicator - bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: "28%",
            right: "5%",
            zIndex: 30,
            color: "white",
            opacity: 0.6,
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          scroll to explore ↓
        </div>
      </div>

      {/* Navbar */}
      <nav
        ref={navRef}
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translate3d(-50%, 0, 0)",
          borderColor: "rgba(43,36,29,0.06)",
          zIndex: 50,
          justifyContent: "space-between",
        }}
        className="flex w-full items-center gap-2 border px-4 py-2 sm:px-6"
      >
        <div className="relative h-11 w-11 overflow-hidden rounded-full bg-white/80 shadow-md">
          <Image src="/logo.png" alt="Logo" fill sizes="44px" className="object-cover" />
        </div>
        <div className="flex items-center gap-4 sm:gap-7">
          {["The Day", "Travel", "Registry", "FAQ"].map((label) => (
            <a
              key={label}
              className="hidden text-[13.5px] text-[#2B241D] no-underline md:inline"
              style={{ fontFamily: "var(--font-din-alternate)" }}
            >
              {label}
            </a>
          ))}
          <button
            className="rounded-full border-0 bg-[#2B241D] px-4 py-2 text-[12.5px] font-medium text-[#F5EDE1] sm:px-[18px] sm:py-2.5 sm:text-[13.5px]"
            style={{ fontFamily: "var(--font-din-alternate)" }}
          >
            <span className="sm:hidden">RSVP</span>
            <span className="hidden sm:inline">Submit RSVP</span>
          </button>
        </div>
      </nav>
    </section>
  );
}
