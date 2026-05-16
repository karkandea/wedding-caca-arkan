"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// ─── Asset paths ───────────────────────────────────────────────────────────────
const HERO_DIR = "/hero";

// ─── Balloon config ────────────────────────────────────────────────────────────
// position: % from left/top of container
// scrollY: [from, to] — how much it moves vertically on scroll (in vh units)
// scrollX: [from, to] — horizontal drift
// scale:   [from, to] — scale change on scroll
// z-index is determined by order (higher index = more foreground)
const BALLOONS = [
  // ── BEHIND COUPLE (rendered before couple without bg) ──
  {
    id: "right-behind",
    src: `${HERO_DIR}/baloon right behind.png`,
    left: "58%", top: "38%",
    width: "22%",
    scrollY: [0, -60],   // moves up slower (far layer)
    scrollX: [0, 8],
    scale: [1, 1.05],
    zIndex: 2,
  },

  // ── FOREGROUND BALLOONS (rendered after couple without bg) ──
  {
    id: "above-1",
    src: `${HERO_DIR}/baloon above 1.png`,
    left: "38%", top: "5%",
    width: "11%",
    scrollY: [0, -180],  // moves up fast (close layer)
    scrollX: [0, -10],
    scale: [1, 1.15],
    zIndex: 6,
  },
  {
    id: "above-2",
    src: `${HERO_DIR}/baloon above 2.png`,
    left: "54%", top: "2%",
    width: "10%",
    scrollY: [0, -200],
    scrollX: [0, 12],
    scale: [1, 1.12],
    zIndex: 6,
  },
  {
    id: "above-3",
    src: `${HERO_DIR}/baloon above 3.png`,
    left: "68%", top: "8%",
    width: "9%",
    scrollY: [0, -160],
    scrollX: [0, 18],
    scale: [1, 1.1],
    zIndex: 6,
  },
  {
    id: "left-small-1",
    src: `${HERO_DIR}/baloon left small 1.png`,
    left: "22%", top: "40%",
    width: "8%",
    scrollY: [0, -120],
    scrollX: [0, -15],
    scale: [1, 1.08],
    zIndex: 6,
  },
  {
    id: "left-small-2",
    src: `${HERO_DIR}/baloon left small 2.png`,
    left: "28%", top: "22%",
    width: "9%",
    scrollY: [0, -150],
    scrollX: [0, -20],
    scale: [1, 1.1],
    zIndex: 6,
  },
  {
    id: "big-left",
    src: `${HERO_DIR}/baloon big left.png`,
    left: "30%", top: "52%",
    width: "18%",
    scrollY: [0, -80],   // big = close = moves more
    scrollX: [0, -25],
    scale: [1, 1.18],
    zIndex: 7,
  },
  {
    id: "close-above",
    src: `${HERO_DIR}/baloon close above.png`,
    left: "14%", top: "60%",
    width: "14%",
    scrollY: [0, -100],
    scrollX: [0, -30],
    scale: [1, 1.2],
    zIndex: 7,
  },
] as const;

export default function CobaCobaPage() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Title fades out early
  const titleOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const titleScale   = useTransform(scrollYProgress, [0, 0.25], [1, 0.82]);
  const titleY       = useTransform(scrollYProgress, [0, 0.25], [0, -40]);

  // Chrome (scroll indicator) fades out very early
  const chromeOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <main style={{ background: "#F5EFE6" }}>
      <section
        ref={sectionRef}
        style={{
          position: "relative",
          height: "300vh",
          width: "100%",
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

          {/* ── Layer 1: couple WITH bg (background + shadow) ─────────────────── */}
          <div style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
          }}>
            <Image
              src={`${HERO_DIR}/couple with bg.png`}
              alt="Salsa & Arkan"
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          </div>

          {/* ── Layer 2: balloon right behind (behind couple without bg) ─────── */}
          <BalloonLayer
            key="right-behind"
            config={BALLOONS[0]}
            scrollYProgress={scrollYProgress}
            zIndex={2}
          />

          {/* ── Layer 3: couple WITHOUT bg (couple only, no shadow) ──────────── */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 3,
              y: useTransform(scrollYProgress, [0, 1], [0, -30]),
            }}
          >
            <Image
              src={`${HERO_DIR}/couple without bg.png`}
              alt=""
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          </motion.div>

          {/* ── Layer 4+: foreground balloons ───────────────────────────────── */}
          {BALLOONS.slice(1).map((b) => (
            <BalloonLayer
              key={b.id}
              config={b}
              scrollYProgress={scrollYProgress}
              zIndex={b.zIndex}
            />
          ))}

          {/* ── Title overlay ────────────────────────────────────────────────── */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              opacity: titleOpacity,
              scale: titleScale,
              y: titleY,
            }}
          >
            <h1
              style={{
                margin: 0,
                color: "#ffffff",
                fontFamily: "serif",
                fontStyle: "italic",
                fontWeight: 500,
                fontSize: "clamp(52px, 13vw, 200px)",
                lineHeight: 0.95,
                letterSpacing: "-0.01em",
                textAlign: "center",
                whiteSpace: "nowrap",
                textShadow: "0 2px 40px rgba(0,0,0,0.18)",
              }}
            >
              Salsa &amp; Arkan
            </h1>
          </motion.div>

          {/* ── Scroll chrome ────────────────────────────────────────────────── */}
          <motion.div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "0 24px 28px",
              zIndex: 11,
              opacity: chromeOpacity,
              pointerEvents: "none",
            }}
          >
            <div style={{
              height: "1px",
              background: "rgba(255,255,255,0.55)",
              marginBottom: "14px",
            }} />
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.32em",
              color: "rgba(255,255,255,0.9)",
              fontFamily: "var(--font-din-alternate, sans-serif)",
            }}>
              <span style={{ fontSize: "18px" }}>↓</span>
              <span>scroll to explore</span>
            </div>
          </motion.div>

        </div>
      </section>
      <ImageSequenceSection />
    </main>
  );
}

function ImageSequenceSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = document.getElementById("sequence-section");
    if (!canvas || !section) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let isMounted = true;
    let currentFrame = -1;

    const frameSrc = (index: number) => {
      const frameNumber = String(index + 1).padStart(3, "0");
      return `/scroll/ezgif-frame-${frameNumber}.jpg`;
    };

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame(currentFrame < 0 ? 0 : currentFrame);
    };

    const drawFrame = (frameIndex: number) => {
      const image = imagesRef.current[frameIndex];
      if (!image?.complete) return;

      currentFrame = frameIndex;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const x = (width - drawWidth) / 2;
      const y = (height - drawHeight) / 2;

      context.clearRect(0, 0, width, height);
      context.drawImage(image, x, y, drawWidth, drawHeight);
    };

    const updateFromScroll = () => {
      const scrolled = window.scrollY - section.offsetTop;
      const total = section.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrolled / total));
      const frameIndex = Math.min(Math.floor(progress * 183), 182);
      drawFrame(frameIndex);
    };

    const onScroll = () => {
      if (frameRef.current) return;

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = 0;
        updateFromScroll();
      });
    };

    const preloadImages = async () => {
      const images = await Promise.all(
        Array.from({ length: 183 }, (_, index) => {
          const image = new window.Image();
          image.src = frameSrc(index);
          return image.decode().catch(() => undefined).then(() => image);
        }),
      );

      if (!isMounted) return;
      imagesRef.current = images;
      resizeCanvas();
      updateFromScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", resizeCanvas);
    };

    preloadImages();

    return () => {
      isMounted = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resizeCanvas);
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <section
      id="sequence-section"
      style={{
        position: "relative",
        height: "300vh",
        width: "100%",
        background: "#000",
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
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    </section>
  );
}

// ─── BalloonLayer component ────────────────────────────────────────────────────
function BalloonLayer({
  config,
  scrollYProgress,
  zIndex,
}: {
  config: (typeof BALLOONS)[number];
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  zIndex: number;
}) {
  const y     = useTransform(scrollYProgress, [0, 1], config.scrollY.map(v => `${v}px`) as [string, string]);
  const x     = useTransform(scrollYProgress, [0, 1], config.scrollX.map(v => `${v}px`) as [string, string]);
  const scale = useTransform(scrollYProgress, [0, 1], config.scale as unknown as number[]);

  return (
    <motion.div
      style={{
        position: "absolute",
        left: config.left,
        top: config.top,
        width: config.width,
        zIndex,
        y,
        x,
        scale,
        transformOrigin: "center center",
        willChange: "transform",
      }}
    >
      <Image
        src={config.src}
        alt=""
        width={400}
        height={400}
        sizes="20vw"
        style={{
          width: "100%",
          height: "auto",
          objectFit: "contain",
        }}
      />
    </motion.div>
  );
}
