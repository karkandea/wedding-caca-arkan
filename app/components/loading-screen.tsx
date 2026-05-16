"use client";

import { useEffect, useRef, useState } from "react";
import BalloonTransition from "./balloon-transition";

const HERO_ASSETS = ["/hero/photo-left.jpeg", "/hero/photo-right.jpeg", "/hero/photo-center.png"];
const BALLOON_ASSET = "/hero/balloons/baloon.glb";

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
  const [isRevealing, setIsRevealing] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [canRunBalloonTransition, setCanRunBalloonTransition] = useState(false);
  const hasFinishedRef = useRef(false);
  const canRunBalloonTransitionRef = useRef(false);
  const isMobileRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let loaded = 0;
    let totalAssets = 1;
    const startedAt = performance.now();

    const updateTransitionMode = () => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      isMobileRef.current = isMobile;
      canRunBalloonTransitionRef.current = true;
      setCanRunBalloonTransition(true);
    };

    const finishLoading = () => {
      if (!isMounted || hasFinishedRef.current) return;
      hasFinishedRef.current = true;
      const minimumVisibleMs = isMobileRef.current ? 1200 : 700;
      const remainingVisibleMs = Math.max(0, minimumVisibleMs - (performance.now() - startedAt));

      window.setTimeout(() => {
        if (!isMounted) return;
        setIsDone(true);
        window.dispatchEvent(new CustomEvent("wedding-loading-complete"));
        window.setTimeout(() => {
          if (isMounted) setIsRevealing(true);
          if (!canRunBalloonTransitionRef.current) {
            window.setTimeout(() => {
              if (isMounted) setIsHidden(true);
            }, 520);
          }
        }, canRunBalloonTransitionRef.current ? 1150 : 180);
      }, remainingVisibleMs);
    };

    const preloadCriticalAssets = async () => {
      const assets = [...HERO_ASSETS, BALLOON_ASSET];
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
    };

    const safetyTimer = window.setTimeout(() => {
      if (!isMounted || loaded / totalAssets >= 0.5) return;
      finishLoading();
    }, 5000);

    updateTransitionMode();
    window.addEventListener("resize", updateTransitionMode);
    preloadCriticalAssets();

    return () => {
      isMounted = false;
      window.removeEventListener("resize", updateTransitionMode);
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
        pointerEvents: isDone ? "none" : "auto",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background:
            "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.42), rgba(245,239,230,0.96) 48%, #F5EFE6 78%)",
          opacity: isRevealing ? 0 : 1,
          transition: "opacity 500ms ease",
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
      {isDone && canRunBalloonTransition && <BalloonTransition onComplete={() => setIsHidden(true)} />}
    </div>
  );
}
