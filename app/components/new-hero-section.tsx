"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const COUPLE = "Salsa & Arkan";

const SIDE_PHOTOS = [
  {
    id: "top-left",
    src: "/hero/photo-center.png",
    edge: "left",
    offset: "-2%",
    top: "4%",
    width: "30%",
    height: "44%",
    appearAt: 0.3,
  },
  {
    id: "bottom-left",
    src: "/hero/photo-center.png",
    edge: "left",
    offset: "8%",
    top: "55%",
    width: "22%",
    height: "30%",
    appearAt: 0.5,
  },
  {
    id: "top-right",
    src: "/hero/photo-center.png",
    edge: "right",
    offset: "-1%",
    top: "32%",
    width: "26%",
    height: "32%",
    appearAt: 0.4,
  },
  {
    id: "bottom-right",
    src: "/hero/photo-center.png",
    edge: "right",
    offset: "-2%",
    top: "65%",
    width: "23%",
    height: "33%",
    appearAt: 0.6,
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
  const frameRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => {
      const section = sectionRef.current;
      if (!section) return;

      const scrolled = window.scrollY - section.offsetTop;
      const total = section.offsetHeight - window.innerHeight;
      const nextProgress = clamp(total > 0 ? scrolled / total : 0);

      setProgress(nextProgress);
      setIsMobile(window.innerWidth < 720);
    };

    const onScroll = () => {
      if (frameRef.current) return;

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = 0;
        update();
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

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
      className="relative h-[600vh] w-full bg-[#F5EFE6]"
      id="new-hero-section"
    >
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
              width: isMobile ? "100vw" : "100%",
              height: isMobile ? "100svh" : "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              transform: isMobile ? "translate3d(-50%, -50%, 0)" : undefined,
            }}
          >
            <Image
              src="/hero/photo-center.png"
              alt={COUPLE}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{
                transform: `translate(${isMobile ? "4vw" : "3%"}, ${isMobile ? "14svh" : "13%"}) scale(${isMobile ? 1.12 : 1.08})`,
                transformOrigin: "center center",
                zIndex: 0,
              }}
            />
            <HeroImageSequence
              progress={progress}
              style={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                height: "100%",
                transform: `translate(${isMobile ? "4vw" : "3%"}, ${isMobile ? "14svh" : "13%"}) scale(${isMobile ? 1.12 : 1.08})`,
                transformOrigin: "center center",
              }}
            />
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
            { src: "/hero/photo-center.png", appearAt: 0.45, top: "64svh" },
            { src: "/hero/photo-kedua.png", appearAt: 0.65, top: "82svh" },
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
              </div>
            );
          })}
      </div>
    </section>
  );
}

function HeroImageSequence({
  progress,
  style,
}: {
  progress: number;
  style?: CSSProperties;
}) {
  const TOTAL_FRAMES = 183;
  const CRITICAL_FRAMES = 11;
  const PRELOAD_RADIUS = 10;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderLoopRef = useRef(0);
  const imagesRef = useRef<Array<HTMLImageElement | undefined>>([]);
  const loadedFramesRef = useRef(new Set<number>());
  const failedFramesRef = useRef(new Set<number>());
  const loadingFramesRef = useRef(new Set<number>());
  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(0);
  const lastDrawnFrameRef = useRef(-1);
  const isMountedRef = useRef(false);
  const isMobileRef = useRef(false);

  const normalizeFrameForDevice = (frameIndex: number) => {
    const clampedFrame = Math.min(Math.max(frameIndex, 0), TOTAL_FRAMES - 1);
    return isMobileRef.current ? clampedFrame - (clampedFrame % 2) : clampedFrame;
  };

  const frameSrc = (index: number) => {
    const frameNumber = String(index + 1).padStart(3, "0");
    return `/scroll/ezgif-frame-${frameNumber}.jpg`;
  };

  const loadFrame = (index: number) => {
    const frameIndex = normalizeFrameForDevice(index);
    if (
      imagesRef.current[frameIndex] ||
      loadedFramesRef.current.has(frameIndex) ||
      loadingFramesRef.current.has(frameIndex) ||
      failedFramesRef.current.has(frameIndex)
    ) {
      return;
    }

    loadingFramesRef.current.add(frameIndex);

    const image = new window.Image();
    imagesRef.current[frameIndex] = image;

    image.onload = () => {
      void (async () => {
        try {
          if (typeof image.decode === "function") {
            await image.decode();
          }
        } catch {
          // Decode can reject on some browsers even after load; naturalWidth decides usability.
        }

        loadingFramesRef.current.delete(frameIndex);
        if (!isMountedRef.current || image.naturalWidth === 0) {
          failedFramesRef.current.add(frameIndex);
          return;
        }

        loadedFramesRef.current.add(frameIndex);
        if (frameIndex === targetFrameRef.current || lastDrawnFrameRef.current < 0) {
          drawFrame(currentFrameRef.current);
        }
      })();
    };

    image.onerror = () => {
      loadingFramesRef.current.delete(frameIndex);
      failedFramesRef.current.add(frameIndex);
      if (isMountedRef.current && frameIndex === targetFrameRef.current) {
        drawFrame(frameIndex);
      }
    };

    image.src = frameSrc(frameIndex);
  };

  const preloadAroundFrame = (frameIndex: number) => {
    const targetFrame = normalizeFrameForDevice(frameIndex);
    const start = Math.max(0, targetFrame - PRELOAD_RADIUS);
    const end = Math.min(TOTAL_FRAMES - 1, targetFrame + PRELOAD_RADIUS);

    loadFrame(targetFrame);
    for (let index = start; index <= end; index += isMobileRef.current ? 2 : 1) {
      loadFrame(index);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    isMobileRef.current = window.innerWidth < 768;

    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width || window.innerWidth;
      const height = rect.height || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const context = canvas.getContext("2d", { willReadFrequently: false });
      if (!context) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame(lastDrawnFrameRef.current < 0 ? targetFrameRef.current : lastDrawnFrameRef.current);
    };

    const updateDeviceMode = () => {
      isMobileRef.current = window.innerWidth < 768;
    };

    targetFrameRef.current = normalizeFrameForDevice(Math.floor(clamp(progress) * TOTAL_FRAMES));
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(resize);
    });
    window.setTimeout(resize, 100);
    Array.from({ length: CRITICAL_FRAMES }, (_, index) => index).forEach(loadFrame);
    preloadAroundFrame(targetFrameRef.current);

    const renderLoop = () => {
      if (!isMountedRef.current) return;

      const currentFrame = currentFrameRef.current;
      const targetFrame = targetFrameRef.current;

      if (currentFrame !== targetFrame) {
        const direction = targetFrame > currentFrame ? 1 : -1;
        const step = isMobileRef.current ? 2 : 1;
        currentFrameRef.current = normalizeFrameForDevice(currentFrame + direction * step);
        preloadAroundFrame(currentFrameRef.current);
        drawFrame(currentFrameRef.current);
      } else if (lastDrawnFrameRef.current < 0) {
        drawFrame(currentFrame);
      }

      renderLoopRef.current = window.requestAnimationFrame(renderLoop);
    };

    renderLoopRef.current = window.requestAnimationFrame(renderLoop);
    window.addEventListener("resize", resize);
    window.addEventListener("resize", updateDeviceMode);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", updateDeviceMode);
      if (renderLoopRef.current) {
        window.cancelAnimationFrame(renderLoopRef.current);
      }
    };
  }, []);

  const resolveLoadedFrame = (frameIndex: number) => {
    if (loadedFramesRef.current.has(frameIndex)) return frameIndex;

    for (let offset = 1; offset < TOTAL_FRAMES; offset += 1) {
      const previous = frameIndex - offset;
      const next = frameIndex + offset;

      if (previous >= 0 && loadedFramesRef.current.has(previous)) return previous;
      if (next < TOTAL_FRAMES && loadedFramesRef.current.has(next)) return next;
    }

    return -1;
  };

  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    const resolvedFrame = resolveLoadedFrame(frameIndex);
    const image = resolvedFrame >= 0 ? imagesRef.current[resolvedFrame] : undefined;
    if (!canvas || !image?.complete || image.naturalWidth === 0) return;

    const context = canvas.getContext("2d", { willReadFrequently: false });
    if (!context) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;

    context.clearRect(0, 0, width, height);
    context.drawImage(image, x, y, drawWidth, drawHeight);
    lastDrawnFrameRef.current = resolvedFrame;
  };

  useEffect(() => {
    const frameIndex = normalizeFrameForDevice(Math.floor(clamp(progress) * TOTAL_FRAMES));
    targetFrameRef.current = frameIndex;
    preloadAroundFrame(frameIndex);
  }, [progress]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        ...style,
      }}
    />
  );
}
