"use client";

import { DotLottieReact, type DotLottie } from "@lottiefiles/dotlottie-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useRef } from "react";

const LOTTIE_SRC = "https://lottie.host/d3568993-adf7-4d52-8d68-68f89109ddca/7G6qXj8Vtn.lottie";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

export default function CobaCobaPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const dotLottieRef = useRef<DotLottie | null>(null);
  const cleanupDotLottieRef = useRef<(() => void) | null>(null);
  const progressRef = useRef(0);

  const updateFrameFromProgress = useCallback((progress: number) => {
    progressRef.current = clamp(progress);

    const dotLottie = dotLottieRef.current;
    if (!dotLottie?.isLoaded) return;

    const lastFrame = Math.max((dotLottie.totalFrames || 1) - 1, 0);
    dotLottie.setFrame(progressRef.current * lastFrame);
  }, []);

  const handleDotLottieRef = useCallback(
    (dotLottie: DotLottie | null) => {
      cleanupDotLottieRef.current?.();
      cleanupDotLottieRef.current = null;
      dotLottieRef.current = dotLottie;

      if (!dotLottie) return;

      const syncFrame = () => updateFrameFromProgress(progressRef.current);
      dotLottie.addEventListener("ready", syncFrame);
      dotLottie.addEventListener("load", syncFrame);
      const frameId = window.requestAnimationFrame(syncFrame);

      cleanupDotLottieRef.current = () => {
        window.cancelAnimationFrame(frameId);
        dotLottie.removeEventListener("ready", syncFrame);
        dotLottie.removeEventListener("load", syncFrame);
      };
    },
    [updateFrameFromProgress],
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        updateFrameFromProgress(self.progress);
      },
    });

    updateFrameFromProgress(trigger.progress);

    return () => {
      trigger.kill();
      cleanupDotLottieRef.current?.();
      cleanupDotLottieRef.current = null;
    };
  }, [updateFrameFromProgress]);

  return (
    <main style={{ background: "#F5EFE6" }}>
      <section
        ref={sectionRef}
        style={{
          position: "relative",
          height: "500vh",
          width: "100%",
          background: "#F5EFE6",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <DotLottieReact
            dotLottieRefCallback={handleDotLottieRef}
            src={LOTTIE_SRC}
            autoplay={false}
            loop={false}
            useFrameInterpolation
            layout={{ fit: "cover", align: [0.5, 0.5] }}
            renderConfig={{
              devicePixelRatio: typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, 2),
            }}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </section>
    </main>
  );
}
