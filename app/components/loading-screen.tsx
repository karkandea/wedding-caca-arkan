"use client";

import { useEffect, useRef, useState } from "react";

const CRITICAL_FRAME_COUNT = 31;
const TOTAL_FRAME_COUNT = 183;
const HERO_PHOTOS = ["/hero/photo-left.jpeg", "/hero/photo-right.jpeg", "/hero/photo-center.png"];

function frameSrc(index: number) {
  const frameNumber = String(index + 1).padStart(3, "0");
  return `/scroll/ezgif-frame-${frameNumber}.jpg`;
}

async function preloadAsset(src: string) {
  try {
    await fetch(src, { cache: "force-cache" });
  } catch {
    // Failed preloads should not trap visitors on the loading screen.
  }
}

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let loaded = 0;
    let totalAssets = 1;

    const finishLoading = () => {
      if (!isMounted || hasFinishedRef.current) return;
      hasFinishedRef.current = true;
      setIsDone(true);
      window.setTimeout(() => {
        if (isMounted) setIsHidden(true);
      }, 650);
    };

    const preloadCriticalAssets = async () => {
      const assets = [
        ...Array.from({ length: CRITICAL_FRAME_COUNT }, (_, index) => frameSrc(index)),
        ...HERO_PHOTOS,
      ];
      totalAssets = assets.length;

      await Promise.all(
        assets.map(async (src) => {
          await preloadAsset(src);
          loaded += 1;
          if (isMounted) setProgress(loaded / assets.length);
        }),
      );

      if (!isMounted) return;
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
      finishLoading();

      // Continue warming the remaining sequence after the site is visible.
      Array.from({ length: TOTAL_FRAME_COUNT - CRITICAL_FRAME_COUNT }, (_, index) => {
        window.setTimeout(() => {
          if (!isMounted) return;
          preloadAsset(frameSrc(index + CRITICAL_FRAME_COUNT));
        }, index * 25);
      });
    };

    const safetyTimer = window.setTimeout(() => {
      if (!isMounted || loaded / totalAssets >= 0.5) return;
      finishLoading();
    }, 5000);

    preloadCriticalAssets();

    return () => {
      isMounted = false;
      window.clearTimeout(safetyTimer);
    };
  }, []);

  if (isHidden) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        background:
          "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.42), rgba(245,239,230,0.96) 48%, #F5EFE6 78%)",
        opacity: isDone ? 0 : 1,
        transition: "opacity 650ms ease",
        pointerEvents: isDone ? "none" : "auto",
      }}
    >
      <div
        style={{
          fontFamily: "serif",
          fontStyle: "italic",
          fontSize: "clamp(52px, 13vw, 132px)",
          lineHeight: 0.9,
          color: "#2B241D",
          letterSpacing: "-0.04em",
          animation: "wedding-loading-float 1400ms ease-in-out infinite alternate",
        }}
      >
        Salsa &amp; Arkan
      </div>
      <div
        style={{
          width: "min(280px, 64vw)",
          height: 3,
          overflow: "hidden",
          borderRadius: 999,
          background: "rgba(43,36,29,0.14)",
        }}
      >
        <div
          style={{
            width: `${Math.round(progress * 100)}%`,
            height: "100%",
            borderRadius: 999,
            background: "#2B241D",
            transition: "width 220ms ease",
          }}
        />
      </div>
      <div
        style={{
          fontFamily: "var(--font-din-alternate), sans-serif",
          fontSize: 11,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "rgba(43,36,29,0.62)",
        }}
      >
        loading {Math.round(progress * 100)}%
      </div>
      <style>
        {`@keyframes wedding-loading-float {
          from { transform: translateY(8px) scale(0.98); opacity: 0.72; }
          to { transform: translateY(-4px) scale(1); opacity: 1; }
        }`}
      </style>
    </div>
  );
}
