"use client";

import { useEffect, useRef } from "react";

const BALLOONS = [
  {
    name: "above-3",
    className: "b-above-3 l-far-white-3",
    speed: 0.42,
    src: "/hero/baloon above 3.png",
  },
  {
    name: "above-1",
    className: "b-above-1 l-far-white-1",
    speed: 0.52,
    src: "/hero/baloon above 1.png",
  },
  {
    name: "above-2",
    className: "b-above-2 l-far-white-2",
    speed: 0.48,
    src: "/hero/baloon above 2.png",
  },
  {
    name: "right-behind",
    className: "b-right-behind l-right-behind",
    speed: 0.62,
    src: "/hero/baloon right behind.png",
  },
  {
    name: "left-small-1",
    className: "b-left-small-1 l-left-small-1",
    speed: 0.72,
    src: "/hero/baloon left small 1.png",
  },
  {
    name: "left-small-2",
    className: "b-left-small-2 l-left-small-2",
    speed: 0.8,
    src: "/hero/baloon left small 2.png",
  },
  {
    name: "close-above",
    className: "b-close-above l-close-above",
    speed: 0.95,
    src: "/hero/baloon close above.png",
  },
  {
    name: "big-left",
    className: "b-big-left l-big-left",
    speed: 1.55,
    src: "/hero/baloon big left.png",
  },
] as const;

export function CobaCoba2Hero({ showAfter = true }: { showAfter?: boolean }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const balloonRefs = useRef<Array<HTMLImageElement | null>>([]);

  useEffect(() => {
    const heroScroll = heroRef.current;
    const titleEl = titleRef.current;
    if (!heroScroll || !titleEl) return;

    const coupleEls = Array.from(heroScroll.querySelectorAll<HTMLElement>(".l-couple, .l-bg"));
    let layers: Array<{ el: HTMLImageElement; dirX: number; dirY: number; endScale: number; drift: number }> = [];

    const readLayers = () => {
      layers = balloonRefs.current.flatMap((el) => {
        if (!el) return [];

        const styles = window.getComputedStyle(el);

        return [
          {
            el,
            dirX: Number.parseFloat(styles.getPropertyValue("--dir-x")) || 0,
            dirY: Number.parseFloat(styles.getPropertyValue("--dir-y")) || 0,
            endScale: Number.parseFloat(styles.getPropertyValue("--end-scale")) || 1,
            drift: Number.parseFloat(styles.getPropertyValue("--drift")) || 0,
          },
        ];
      });
    };

    readLayers();

    const easePow = 1.4;
    const titleFadeEnd = 0.32;
    const titleScaleEnd = 1.12;
    const blurScaleFloor = 1.4;
    const blurPerScale = 4;
    const coupleEndScale = 1.06;
    let scheduled = false;
    const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

    const update = () => {
      scheduled = false;

      const rect = heroScroll.getBoundingClientRect();
      const stickyHeight = window.innerHeight;
      const total = heroScroll.offsetHeight - stickyHeight;
      const progress = total > 0 ? clamp01(-rect.top / total) : 0;
      const eased = Math.pow(progress, easePow);

      for (const { el, dirX, dirY, endScale, drift } of layers) {
        const x = (dirX * eased * drift * stickyHeight) / 100;
        const y = (dirY * eased * drift * stickyHeight) / 100;
        const scale = 1 + eased * (endScale - 1);
        const blur = Math.max(0, scale - blurScaleFloor) * blurPerScale;

        el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
        el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none";
      }

      const coupleScale = 1 + progress * (coupleEndScale - 1);
      for (const coupleEl of coupleEls) {
        coupleEl.style.transformOrigin = "50% 100%";
        coupleEl.style.transform = `scale(${coupleScale.toFixed(4)})`;
      }

      const titleProgress = Math.min(1, progress / titleFadeEnd);
      const titleScale = 1 + titleProgress * (titleScaleEnd - 1);
      titleEl.style.opacity = (1 - titleProgress).toFixed(3);
      titleEl.style.transform = `scale(${titleScale.toFixed(3)})`;
      titleEl.style.transformOrigin = "50% 40%";

      if (scrollHintRef.current) {
        scrollHintRef.current.style.opacity = Math.max(0, 1 - progress * 6).toFixed(3);
      }
    };

    const scheduleUpdate = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", readLayers);
    window.addEventListener("resize", scheduleUpdate);
    update();

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", readLayers);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  return (
    <div className="cobacoba2-page">
      <div className="hero-scroll" ref={heroRef}>
        <div className="hero-sticky">
          <div className="stage">
            <div className="layer fill l-bg">
              <img src="/hero/couple with bg.png" alt="" />
            </div>

            {BALLOONS.slice(0, 4).map((balloon, index) => (
              <img
                key={balloon.name}
                ref={(el) => {
                  balloonRefs.current[index] = el;
                }}
                className={`layer balloon ${balloon.className}`}
                data-name={balloon.name}
                data-speed={balloon.speed}
                src={balloon.src}
                alt=""
              />
            ))}

            <div className="layer fill l-couple">
              <img src="/hero/couple without bg.png" alt="Salsa and Arkan" />
            </div>

            {BALLOONS.slice(4).map((balloon, offsetIndex) => {
              const index = offsetIndex + 4;

              return (
                <img
                  key={balloon.name}
                  ref={(el) => {
                    balloonRefs.current[index] = el;
                  }}
                  className={`layer balloon ${balloon.className}`}
                  data-name={balloon.name}
                  data-speed={balloon.speed}
                  src={balloon.src}
                  alt=""
                />
              );
            })}

            <div className="layer l-title title" ref={titleRef}>
              <div className="title-inner">
                <p className="eyebrow">Eleven · Eight · Twenty-Six</p>
                <h1 className="names">
                  Salsa<span className="amp">&amp;</span>Arkan
                </h1>
                <p className="date">Are getting married</p>
              </div>
            </div>

            <div className="scroll-hint" ref={scrollHintRef}>
              <span>Scroll</span>
              <span className="line" />
            </div>
          </div>
        </div>
      </div>

      {showAfter && (
      <section className="after">
        <div className="rule">
          <span>Our story</span>
        </div>
        <h2>A small celebration of a very long yes.</h2>
        <p>
          We met on a humid Tuesday in 2022, ducked under the same awning, and ended up sharing a single black
          umbrella from a stranger. Four years later, we&apos;d like you in the room when we say it out loud.
        </p>
        <p>The day will be intimate and unhurried - long lunch, quiet vows, music after sundown.</p>

        <div className="meta">
          <div>
            <div className="label">When</div>
            <div className="value">
              August 11, 2026
              <br />
              at 16:00
            </div>
          </div>
          <div>
            <div className="label">Where</div>
            <div className="value">
              Sapta Cikidang
              <br />
              West Java
            </div>
          </div>
          <div>
            <div className="label">Dress</div>
            <div className="value">
              Soft monochrome.
              <br />
              White, grey, ivory.
            </div>
          </div>
        </div>
      </section>
      )}

      <style jsx global>{`
        .cobacoba2-page {
          --bg: #e8e8e6;
          --ink: #161412;
          --soft: #6c6863;
          --line: rgba(22, 20, 18, 0.14);
          --title: #1a1815;
          margin: 0;
          overflow-x: hidden;
          background: var(--bg);
          color: var(--ink);
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        .cobacoba2-page * {
          box-sizing: border-box;
        }

        .cobacoba2-page .hero-scroll {
          position: relative;
          height: 280vh;
        }

        .cobacoba2-page .hero-sticky {
          position: sticky;
          top: 0;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: var(--bg);
        }

        .cobacoba2-page .stage {
          position: absolute;
          inset: 0;
        }

        .cobacoba2-page .layer {
          position: absolute;
          pointer-events: none;
          user-select: none;
          will-change: transform, opacity;
          backface-visibility: hidden;
          transform: translate3d(0, 0, 0);
        }

        .cobacoba2-page .layer.fill {
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .cobacoba2-page .layer.fill img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center bottom;
          display: block;
        }

        .cobacoba2-page .balloon {
          height: auto;
          transform-origin: 50% 50%;
        }

        .cobacoba2-page .balloon img,
        .cobacoba2-page img.balloon {
          display: block;
        }

        .cobacoba2-page .b-above-3 {
          left: 56%;
          top: 22%;
          width: 5.5%;
          --dir-x: 0.27;
          --dir-y: -0.96;
          --end-scale: 1.9;
          --drift: 55;
        }

        .cobacoba2-page .b-above-1 {
          left: 36%;
          top: 17%;
          width: 5.5%;
          --dir-x: -0.28;
          --dir-y: -0.96;
          --end-scale: 1.8;
          --drift: 50;
        }

        .cobacoba2-page .b-above-2 {
          left: 47%;
          top: 15%;
          width: 5.5%;
          --dir-x: 0;
          --dir-y: -1;
          --end-scale: 1.7;
          --drift: 50;
        }

        .cobacoba2-page .b-right-behind {
          left: 58%;
          top: 55%;
          width: 37%;
          --dir-x: 0.95;
          --dir-y: 0.05;
          --end-scale: 1.05;
          --drift: 4;
          transform-origin: 50% 100%;
        }

        .cobacoba2-page .b-left-small-1 {
          left: 19%;
          top: 40%;
          width: 7%;
          --dir-x: -0.91;
          --dir-y: -0.42;
          --end-scale: 3;
          --drift: 75;
        }

        .cobacoba2-page .b-left-small-2 {
          left: 26%;
          top: 32%;
          width: 6%;
          --dir-x: -0.69;
          --dir-y: -0.72;
          --end-scale: 2.7;
          --drift: 70;
        }

        .cobacoba2-page .b-close-above {
          left: 3%;
          top: 65%;
          width: 26%;
          --dir-x: -0.89;
          --dir-y: 0.46;
          --end-scale: 4.5;
          --drift: 85;
        }

        .cobacoba2-page .b-big-left {
          left: 24%;
          top: 56%;
          width: 23%;
          --dir-x: -0.83;
          --dir-y: 0.55;
          --end-scale: 5.2;
          --drift: 88;
        }

        .cobacoba2-page .l-bg {
          z-index: 1;
        }

        .cobacoba2-page .l-far-white-3 {
          z-index: 2;
        }

        .cobacoba2-page .l-far-white-1 {
          z-index: 3;
        }

        .cobacoba2-page .l-far-white-2 {
          z-index: 4;
        }

        .cobacoba2-page .l-right-behind {
          z-index: 5;
        }

        .cobacoba2-page .l-couple {
          z-index: 6;
        }

        .cobacoba2-page .l-left-small-1 {
          z-index: 7;
        }

        .cobacoba2-page .l-left-small-2 {
          z-index: 8;
        }

        .cobacoba2-page .l-close-above {
          z-index: 9;
        }

        .cobacoba2-page .l-big-left {
          z-index: 10;
        }

        .cobacoba2-page .l-title {
          z-index: 11;
        }

        .cobacoba2-page .title {
          position: absolute;
          inset: 0;
          text-align: center;
          color: var(--title);
          pointer-events: none;
          will-change: opacity, transform;
          mix-blend-mode: multiply;
        }

        .cobacoba2-page .title-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 13vh;
        }

        .cobacoba2-page .title .names {
          font-family: "Cormorant Garamond", "Times New Roman", serif;
          font-weight: 300;
          font-style: italic;
          font-size: clamp(56px, 10vw, 180px);
          line-height: 0.95;
          letter-spacing: -0.01em;
          margin: 0;
        }

        .cobacoba2-page .title .names .amp {
          font-weight: 400;
          font-style: italic;
          margin: 0 0.06em;
          opacity: 0.85;
        }

        .cobacoba2-page .title .eyebrow,
        .cobacoba2-page .title .date {
          font-family: Inter, sans-serif;
          font-weight: 400;
          font-size: clamp(11px, 1vw, 13px);
          letter-spacing: 0.42em;
          text-transform: uppercase;
          color: var(--soft);
        }

        .cobacoba2-page .title .eyebrow {
          margin: 0 0 22px;
        }

        .cobacoba2-page .title .date {
          margin: 26px 0 0;
        }

        .cobacoba2-page .scroll-hint {
          position: absolute;
          z-index: 12;
          bottom: 4vh;
          left: 50%;
          transform: translateX(-50%);
          color: var(--soft);
          font-family: Inter, sans-serif;
          font-size: 11px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          will-change: opacity;
        }

        .cobacoba2-page .scroll-hint .line {
          width: 1px;
          height: 36px;
          background: currentColor;
          opacity: 0.6;
          animation: cobacoba2-drip 2.4s ease-in-out infinite;
          transform-origin: top;
        }

        @keyframes cobacoba2-drip {
          0% {
            transform: scaleY(0);
            opacity: 0;
          }
          35% {
            transform: scaleY(1);
            opacity: 0.7;
          }
          70% {
            transform: scaleY(1);
            opacity: 0.7;
          }
          100% {
            transform: scaleY(0) translateY(36px);
            opacity: 0;
          }
        }

        .cobacoba2-page .after {
          position: relative;
          background: var(--bg);
          padding: 14vh 8vw 18vh;
          border-top: 1px solid var(--line);
        }

        .cobacoba2-page .after .rule {
          display: flex;
          align-items: center;
          gap: 16px;
          color: var(--soft);
          font-size: 11px;
          letter-spacing: 0.36em;
          text-transform: uppercase;
          margin-bottom: 64px;
        }

        .cobacoba2-page .after .rule::before,
        .cobacoba2-page .after .rule::after {
          content: "";
          height: 1px;
          background: var(--line);
          flex: 1;
        }

        .cobacoba2-page .after h2 {
          font-family: "Cormorant Garamond", serif;
          font-weight: 300;
          font-style: italic;
          font-size: clamp(40px, 5.5vw, 88px);
          line-height: 1.05;
          letter-spacing: -0.005em;
          margin: 0 0 36px;
          color: var(--ink);
          max-width: 14ch;
        }

        .cobacoba2-page .after p {
          max-width: 56ch;
          color: var(--soft);
          line-height: 1.7;
          font-size: 16px;
          margin: 0 0 18px;
        }

        .cobacoba2-page .after .meta {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 48px;
          margin-top: 96px;
          padding-top: 36px;
          border-top: 1px solid var(--line);
        }

        .cobacoba2-page .after .meta .label {
          font-size: 11px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--soft);
          margin-bottom: 12px;
        }

        .cobacoba2-page .after .meta .value {
          font-family: "Cormorant Garamond", serif;
          font-style: italic;
          font-weight: 400;
          font-size: clamp(20px, 2.4vw, 32px);
          color: var(--ink);
          line-height: 1.2;
        }

        @media (max-aspect-ratio: 4/5) {
          .cobacoba2-page .l-bg img,
          .cobacoba2-page .l-couple img {
            object-position: 50% 95%;
            transform: scale(1.18);
            transform-origin: 50% 100%;
          }

          .cobacoba2-page .b-above-1 {
            left: 22%;
            top: 10%;
            width: 12%;
            --dir-x: -0.4;
            --dir-y: -0.92;
            --end-scale: 1.8;
            --drift: 55;
          }

          .cobacoba2-page .b-above-2 {
            left: 44%;
            top: 7%;
            width: 12%;
            --dir-x: 0.05;
            --dir-y: -1;
            --end-scale: 1.7;
            --drift: 55;
          }

          .cobacoba2-page .b-above-3 {
            left: 66%;
            top: 13%;
            width: 12%;
            --dir-x: 0.5;
            --dir-y: -0.87;
            --end-scale: 1.9;
            --drift: 60;
          }

          .cobacoba2-page .b-left-small-1 {
            left: 6%;
            top: 38%;
            width: 16%;
            --dir-x: -0.9;
            --dir-y: -0.43;
            --end-scale: 2.8;
            --drift: 75;
          }

          .cobacoba2-page .b-left-small-2 {
            left: 18%;
            top: 25%;
            width: 14%;
            --dir-x: -0.55;
            --dir-y: -0.83;
            --end-scale: 2.5;
            --drift: 70;
          }

          .cobacoba2-page .b-right-behind {
            left: 40%;
            top: 50%;
            width: 60%;
            --dir-x: 0.95;
            --dir-y: 0.05;
            --end-scale: 1.05;
            --drift: 5;
          }

          .cobacoba2-page .b-close-above {
            left: -8%;
            top: 70%;
            width: 52%;
            --dir-x: -0.92;
            --dir-y: 0.4;
            --end-scale: 4.2;
            --drift: 80;
          }

          .cobacoba2-page .b-big-left {
            left: 18%;
            top: 52%;
            width: 42%;
            --dir-x: -0.85;
            --dir-y: 0.55;
            --end-scale: 4.5;
            --drift: 85;
          }

          .cobacoba2-page .hero-scroll {
            height: 220vh;
          }

          .cobacoba2-page .title-inner {
            padding-top: 9vh;
          }

          .cobacoba2-page .title .names {
            font-size: clamp(48px, 16vw, 96px);
          }

          .cobacoba2-page .title .eyebrow,
          .cobacoba2-page .title .date {
            font-size: 10px;
            letter-spacing: 0.34em;
          }

          .cobacoba2-page .title .date {
            margin-top: 18px;
          }

          .cobacoba2-page .title .eyebrow {
            margin-bottom: 14px;
          }

          .cobacoba2-page .scroll-hint {
            bottom: 3vh;
            font-size: 10px;
            letter-spacing: 0.28em;
          }

          .cobacoba2-page .scroll-hint .line {
            height: 26px;
          }

          .cobacoba2-page .after {
            padding: 10vh 7vw 14vh;
          }

          .cobacoba2-page .after h2 {
            font-size: clamp(34px, 9vw, 56px);
            max-width: 18ch;
          }

          .cobacoba2-page .after p {
            font-size: 15px;
          }

          .cobacoba2-page .after .meta {
            grid-template-columns: 1fr;
            gap: 28px;
            margin-top: 64px;
          }

          .cobacoba2-page .after .meta .value {
            font-size: clamp(22px, 6vw, 28px);
          }
        }

        @media (max-width: 380px) {
          .cobacoba2-page .b-big-left {
            left: 20%;
            top: 56%;
            width: 40%;
            --end-scale: 4;
          }

          .cobacoba2-page .b-close-above {
            left: -10%;
            top: 72%;
            width: 50%;
            --end-scale: 3.8;
          }

          .cobacoba2-page .b-right-behind {
            left: 42%;
            top: 52%;
            width: 58%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cobacoba2-page .hero-scroll {
            height: 100vh;
          }
        }
      `}</style>
    </div>
  );
}

export default function CobaCoba2Page() {
  return <CobaCoba2Hero />;
}
