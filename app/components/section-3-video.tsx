"use client";

import Image from "next/image";
import { type CSSProperties, type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { assetPath } from "../lib/asset-path";
import { ShimmerImage } from "./shimmer-image";

type StoryPhoto = {
  src: string;
  caption: string;
  rotate: number;
};

type MoodObject = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind:
    | "card"
    | "polaroid"
    | "branch"
    | "vase"
    | "ringbox"
    | "ring"
    | "citrus"
    | "ribbon"
    | "bottle"
    | "petals"
    | "framedPhoto"
    | "ringBoxImage"
    | "ringImage"
    | "flowerImage"
    | "paperScrollImage"
    | "dryLemonImage"
    | "dryLemon2Image"
    | "whiteFlowerImage"
    | "coinImage"
    | "upBookImage";
  rotate: number;
  anim: number;
  dur: number;
  delay: number;
  z: number;
  tone?: "cream" | "green" | "dark";
  hideOnMobile?: boolean;
  src?: string;
  photoIndex?: number;
};

type GalleryTweaks = {
  warmth: number;
  contrast: number;
  blur: number;
  bgLift: number;
  assetScale: number;
};

const GALLERY_TWEAKS: GalleryTweaks = {
  warmth: 32,
  contrast: 8,
  blur: 2,
  bgLift: 90,
  assetScale: 1,
};

const GALLERY_STICKY_DELAY = 0.35;
const PHOTOS: StoryPhoto[] = [
  { src: assetPath("/bg gallery/photo 1.webp"), caption: "the easy yes", rotate: 3 },
  { src: assetPath("/bg gallery/photo 2.webp"), caption: "our city corner", rotate: -1 },
  { src: assetPath("/bg gallery/photo 3.webp"), caption: "coffee, always", rotate: 2 },
  { src: assetPath("/bg gallery/photo 4.webp"), caption: "the night we met", rotate: -3 },
];

const HERO_MOOD_PHOTOS = [
  assetPath("/hero/photo lain 1.webp"),
  assetPath("/hero/photo lain 2.webp"),
  assetPath("/hero/photo web 1.webp"),
  assetPath("/hero/photo web 2.webp"),
  assetPath("/hero/photo-center.webp"),
  assetPath("/hero/photo-kedua.webp"),
  assetPath("/hero/photo lain 1.webp"),
  assetPath("/hero/photo lain 2.webp"),
] as const;

const MOOD_OBJECTS: MoodObject[] = [
  { id: "photo-tl", x: 13, y: 7, w: 150, h: 202, kind: "framedPhoto", photoIndex: 0, rotate: -8, anim: 1, dur: 10, delay: 0, z: 4 },
  { id: "paper-scroll-tcl", x: 78, y: 28, w: 255, h: 220, kind: "paperScrollImage", rotate: 11, anim: 2, dur: 11, delay: 1.2, z: 6 },
  { id: "dry-lemon-tcr", x: 54, y: 2, w: 150, h: 120, kind: "dryLemonImage", rotate: -3, anim: 4, dur: 10, delay: 2, z: 4 },
  { id: "up-book-rm", x: 20, y: 0, w: 300, h: 225, kind: "upBookImage", rotate: -13, anim: 5, dur: 12, delay: 0.8, z: 4 },
  { id: "photo-tc", x: 40, y: 7, w: 140, h: 108, kind: "framedPhoto", photoIndex: 5, rotate: 12, anim: 3, dur: 8, delay: 0.5, z: 5 },
  { id: "photo-lm", x: 15, y: 34, w: 132, h: 178, kind: "framedPhoto", photoIndex: 2, rotate: -11, anim: 7, dur: 11, delay: 1.8, z: 5 },
  { id: "euca-lm", x: 16, y: 46, w: 220, h: 110, kind: "branch", rotate: -8, anim: 2, dur: 13, delay: 3, z: 3, hideOnMobile: true },
  { id: "photo-lb", x: 14, y: 56, w: 150, h: 118, kind: "framedPhoto", photoIndex: 6, rotate: 0, anim: 8, dur: 10, delay: 4, z: 4 },
  { id: "ringbox-lb", x: 5, y: 68, w: 260, h: 205, kind: "ringBoxImage", rotate: 8, anim: 9, dur: 9, delay: 0.4, z: 5 },
  { id: "ring-llm", x: 28, y: 62, w: 96, h: 76, kind: "ringImage", rotate: -15, anim: 10, dur: 8, delay: 2.6, z: 6 },
  { id: "dry-lemon-2-blc", x: 27, y: 79, w: 135, h: 108, kind: "dryLemon2Image", rotate: -6, anim: 11, dur: 12, delay: 1, z: 4 },
  { id: "white-flower-bc", x: 44, y: 82, w: 190, h: 150, kind: "whiteFlowerImage", rotate: 3, anim: 12, dur: 10, delay: 3.5, z: 3 },
  { id: "flower-bcr", x: 62, y: 68, w: 180, h: 180, kind: "flowerImage", rotate: -8, anim: 1, dur: 8, delay: 1.4, z: 5 },
  { id: "coin-rm", x: 84, y: 18, w: 260, h: 260, kind: "coinImage", rotate: -6, anim: 3, dur: 9, delay: 0.6, z: 4 },
  { id: "photo-tr", x: 70, y: 8, w: 148, h: 198, kind: "framedPhoto", photoIndex: 1, rotate: 7, anim: 5, dur: 12, delay: 0.8, z: 3 },
  { id: "photo-rm", x: 72, y: 48, w: 150, h: 205, kind: "framedPhoto", photoIndex: 3, rotate: 12, anim: 7, dur: 12, delay: 4.5, z: 5 },
  { id: "photo-br", x: 67, y: 72, w: 138, h: 182, kind: "framedPhoto", photoIndex: 4, rotate: -10, anim: 11, dur: 11, delay: 3.2, z: 3 },
  { id: "rolls-br", x: 87, y: 74, w: 150, h: 200, kind: "ribbon", rotate: -10, anim: 11, dur: 11, delay: 3.2, z: 3 },
  { id: "photo-edge-br", x: 75, y: 82, w: 116, h: 170, kind: "framedPhoto", photoIndex: 7, rotate: 6, anim: 4, dur: 9, delay: 2.2, z: 5 },
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function ease(value: number) {
  const t = clamp(value);
  return 1 - Math.pow(1 - t, 3);
}

function easeInOut(value: number) {
  const t = clamp(value);
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function rand(seed: number, mul = 1) {
  const x = Math.sin(seed * mul) * 43758.5453;
  return x - Math.floor(x);
}

function scrollProfile(object: MoodObject, index: number) {
  const seed = index * 17 + object.anim * 7 + object.z * 11 + object.dur;
  const depth = (object.z - 2) / 4;
  const baseY = -(50 + depth * 70);
  const flip = rand(seed, 1.3) > 0.85 ? -1 : 1;
  const variance = (rand(seed, 2.7) - 0.5) * 50;
  const sy = (baseY + variance) * flip;
  const sx = (rand(seed, 3.1) - 0.5) * (16 + depth * 22);
  const sr = (rand(seed, 4.3) - 0.5) * 4;

  return {
    sx: Number(sx.toFixed(2)),
    sy: Number(sy.toFixed(2)),
    sr: Number(sr.toFixed(2)),
  };
}

function MoodObjectGraphic({ object }: { object: MoodObject }) {
  if (object.kind === "framedPhoto") {
    const photoSrc = HERO_MOOD_PHOTOS[object.photoIndex ?? 0] ?? HERO_MOOD_PHOTOS[0];

    return (
      <div className="gallery-mood-framed-photo">
        <div className="gallery-mood-framed-photo__image">
          <Image src={photoSrc} alt="" fill sizes="180px" className="object-cover" />
        </div>
        <span />
      </div>
    );
  }

  if (object.kind === "ringBoxImage") {
    return (
      <div className="gallery-mood-ringbox-image">
        <Image src={assetPath("/bg gallery/box ring.webp")} alt="" fill sizes="220px" className="object-contain" />
      </div>
    );
  }

  if (object.kind === "ringImage") {
    return (
      <div className="gallery-mood-ring-image">
        <Image src={assetPath("/bg gallery/ring.webp")} alt="" fill sizes="140px" className="object-contain" />
      </div>
    );
  }

  if (object.kind === "flowerImage") {
    return (
      <div className="gallery-mood-flower-image">
        <Image src={assetPath("/bg gallery/bunga.webp")} alt="" fill sizes="140px" className="object-contain" />
      </div>
    );
  }

  if (object.kind === "paperScrollImage") {
    return (
      <div className="gallery-mood-paper-scroll-image">
        <Image src={assetPath("/bg gallery/paper scroll.webp")} alt="" fill sizes="180px" className="object-contain" />
      </div>
    );
  }

  if (object.kind === "dryLemonImage") {
    return (
      <div className="gallery-mood-dry-lemon-image">
        <Image src={assetPath("/bg gallery/dry lemon.webp")} alt="" fill sizes="160px" className="object-contain" />
      </div>
    );
  }

  if (object.kind === "dryLemon2Image") {
    return (
      <div className="gallery-mood-dry-lemon-2-image">
        <Image src={assetPath("/bg gallery/dry lemon 2.webp")} alt="" fill sizes="190px" className="object-contain" />
      </div>
    );
  }

  if (object.kind === "whiteFlowerImage") {
    return (
      <div className="gallery-mood-white-flower-image">
        <Image src={assetPath("/bg gallery/white flower.webp")} alt="" fill sizes="190px" className="object-contain" />
      </div>
    );
  }

  if (object.kind === "coinImage") {
    return (
      <div className="gallery-mood-coin-image">
        <Image src={assetPath("/bg gallery/coin.webp")} alt="" fill sizes="140px" className="object-contain" />
      </div>
    );
  }

  if (object.kind === "upBookImage") {
    return (
      <div className="gallery-mood-up-book-image">
        <Image src={assetPath("/bg gallery/Up Book.webp")} alt="" fill sizes="180px" className="object-contain" />
      </div>
    );
  }

  if (object.kind === "polaroid") {
    return (
      <div className="gallery-mood-polaroid">
        <span />
      </div>
    );
  }

  if (object.kind === "branch") {
    return (
      <div className="gallery-mood-branch">
        <i />
        <i />
        <i />
        <i />
      </div>
    );
  }

  if (object.kind === "vase") {
    return (
      <div className="gallery-mood-vase">
        <span />
        <span />
        <i />
      </div>
    );
  }

  if (object.kind === "ringbox") {
    return (
      <div className="gallery-mood-ringbox">
        <span />
        <i />
      </div>
    );
  }

  if (object.kind === "ring") {
    return <div className="gallery-mood-ring" />;
  }

  if (object.kind === "citrus") {
    return <div className="gallery-mood-citrus" />;
  }

  if (object.kind === "ribbon") {
    return (
      <div className="gallery-mood-ribbon">
        <span />
      </div>
    );
  }

  if (object.kind === "bottle") {
    return (
      <div className="gallery-mood-bottle">
        <span />
      </div>
    );
  }

  if (object.kind === "petals") {
    return (
      <div className="gallery-mood-petals">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    );
  }

  return <div className={`gallery-mood-card gallery-mood-card--${object.tone ?? "paper"}`} />;
}

function GalleryMoodboardBackground({ layerRef }: { layerRef: RefObject<HTMLDivElement | null> }) {
  const bgLightness = 0.94 - (GALLERY_TWEAKS.contrast / 100) * 0.25;
  const bgChroma = 0.005 + (GALLERY_TWEAKS.warmth / 100) * 0.008;
  const bgHue = 70 + (GALLERY_TWEAKS.warmth / 100) * 20;

  return (
    <div
      className="gallery-mood-bg"
      aria-hidden="true"
      style={
        {
          "--gallery-bg": `oklch(${bgLightness} ${bgChroma} ${bgHue})`,
          "--gallery-overlay": `rgba(120, 110, 90, ${GALLERY_TWEAKS.contrast / 200})`,
          "--gallery-blur": `${GALLERY_TWEAKS.blur}px`,
          "--gallery-asset-scale": GALLERY_TWEAKS.assetScale,
        } as CSSProperties
      }
    >
      <video
        className="gallery-mood-video"
        src={assetPath("/bg gallery/looping-video-v1.mp4")}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
      />
      <div className="gallery-mood-vignette" />
      <style>
        {`
          .gallery-mood-bg {
            position: absolute;
            inset: 0;
            overflow: hidden;
            isolation: isolate;
            background:
              linear-gradient(
                to bottom,
                #F7F1E7 0%,
                rgba(247,241,231,0.88) 18%,
                var(--gallery-bg, oklch(0.92 0.008 76)) 54%
              ),
              var(--gallery-bg, oklch(0.92 0.008 76));
          }

          .gallery-mood-bg::before {
            content: none;
            position: absolute;
            inset: 0;
            z-index: 8;
            pointer-events: none;
            background-image: radial-gradient(rgba(255,240,210,0.06) 1px, transparent 1.5px);
            background-size: 18px 18px;
            opacity: 0.9;
          }

          .gallery-mood-video {
            position: absolute;
            inset: 0;
            z-index: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center center;
            pointer-events: none;
            opacity: 1;
            filter: blur(3px);
            transform: scale(1.02);
          }

          .gallery-mood-wash {
            position: absolute;
            inset: 0;
            z-index: 1;
            background:
              radial-gradient(ellipse 70% 60% at 50% 55%,
                oklch(0.98 0.005 80 / 0.65) 0%,
                oklch(0.85 0.01 80 / 0) 60%);
          }

          .gallery-mood-layer {
            position: absolute;
            inset: 0;
            z-index: 2;
            --p: 0;
            transform: translateZ(0);
            filter: blur(var(--gallery-blur, 0px));
            backface-visibility: hidden;
          }

          .gallery-mood-object {
            position: absolute;
            pointer-events: none;
            transform-origin: center;
            transform:
              translate3d(
                calc(var(--sx, 0) * var(--p, 0) * 1px),
                calc(var(--sy, 0) * var(--p, 0) * 1px),
                0
              )
              rotate(calc(var(--sr, 0) * var(--p, 0) * 1deg));
            will-change: transform;
          }

          .gallery-mood-inner {
            width: 100%;
            height: 100%;
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;
            transform-origin: center;
            border-radius: 4px;
            box-shadow: 0 10px 18px rgba(4, 8, 22, 0.36), 0 2px 4px rgba(4, 8, 22, 0.22);
            will-change: transform;
          }

          .gallery-mood-object--ringBoxImage .gallery-mood-inner,
          .gallery-mood-object--ringImage .gallery-mood-inner,
          .gallery-mood-object--flowerImage .gallery-mood-inner,
          .gallery-mood-object--paperScrollImage .gallery-mood-inner,
          .gallery-mood-object--dryLemonImage .gallery-mood-inner,
          .gallery-mood-object--dryLemon2Image .gallery-mood-inner,
          .gallery-mood-object--whiteFlowerImage .gallery-mood-inner,
          .gallery-mood-object--coinImage .gallery-mood-inner,
          .gallery-mood-object--upBookImage .gallery-mood-inner {
            width: calc(100% * var(--gallery-asset-scale, 1));
            height: calc(100% * var(--gallery-asset-scale, 1));
            background: transparent;
            box-shadow: none;
            border-radius: 0;
          }

          .gallery-mood-flower-image,
          .gallery-mood-paper-scroll-image,
          .gallery-mood-dry-lemon-image,
          .gallery-mood-dry-lemon-2-image,
          .gallery-mood-white-flower-image,
          .gallery-mood-coin-image,
          .gallery-mood-up-book-image {
            position: relative;
            width: 100%;
            height: 100%;
          }

          .gallery-mood-card {
            width: 100%;
            height: 100%;
            border-radius: 4px;
            border: 1px solid rgba(20, 12, 0, 0.14);
            background:
              repeating-linear-gradient(35deg, rgba(216, 200, 174, 0.45) 0 1px, transparent 1px 8px),
              #ece2d2;
          }

          .gallery-mood-card--cream,
          .gallery-mood-ribbon {
            background:
              repeating-linear-gradient(35deg, rgba(224, 210, 179, 0.55) 0 1px, transparent 1px 8px),
              #f3ead9;
          }

          .gallery-mood-card--green {
            background:
              repeating-linear-gradient(35deg, rgba(169, 177, 148, 0.55) 0 1px, transparent 1px 8px),
              #c8cdb2;
          }

          .gallery-mood-card--dark {
            background:
              repeating-linear-gradient(35deg, rgba(62, 56, 43, 0.7) 0 1px, transparent 1px 8px),
              #2a261f;
          }

          .gallery-mood-polaroid {
            width: 100%;
            height: 100%;
            padding: 8px 8px 26px;
            background: #f5efe2;
          }

          .gallery-mood-polaroid span {
            display: block;
            width: 100%;
            height: 100%;
            background:
              repeating-linear-gradient(35deg, rgba(216, 200, 174, 0.45) 0 1px, transparent 1px 8px),
              #ece2d2;
          }

          .gallery-mood-framed-photo {
            width: 100%;
            height: 100%;
            padding: 10px 10px 32px;
            position: relative;
            background: #fbf7ee;
            border: 1px solid rgba(43, 36, 29, 0.08);
            box-shadow:
              inset 0 0 0 1px rgba(255, 255, 255, 0.42),
              0 10px 22px rgba(20, 12, 0, 0.18);
          }

          .gallery-mood-framed-photo__image {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            border-radius: 2px;
          }

          .gallery-mood-framed-photo span {
            position: absolute;
            left: 50%;
            bottom: 11px;
            width: 44%;
            height: 1px;
            transform: translateX(-50%);
            background: rgba(43, 36, 29, 0.18);
          }

          .gallery-mood-ringbox-image,
          .gallery-mood-ring-image {
            position: relative;
            width: 100%;
            height: 100%;
            background: transparent;
          }

          .gallery-mood-branch {
            position: relative;
            width: 100%;
            height: 100%;
          }

          .gallery-mood-branch::before {
            content: "";
            position: absolute;
            left: 8%;
            right: 8%;
            top: 50%;
            height: 2px;
            background: rgba(122, 107, 74, 0.8);
          }

          .gallery-mood-branch i {
            position: absolute;
            top: 42%;
            width: 24%;
            height: 18%;
            border-radius: 50%;
            background: #c8cdb2;
            opacity: 0.8;
          }

          .gallery-mood-branch i:nth-child(1) { left: 18%; transform: rotate(-18deg); }
          .gallery-mood-branch i:nth-child(2) { left: 35%; transform: rotate(18deg); top: 50%; }
          .gallery-mood-branch i:nth-child(3) { left: 54%; transform: rotate(-14deg); }
          .gallery-mood-branch i:nth-child(4) { left: 68%; transform: rotate(20deg); top: 51%; }

          .gallery-mood-vase {
            position: relative;
            width: 100%;
            height: 100%;
          }

          .gallery-mood-vase span {
            position: absolute;
            top: 8%;
            width: 38%;
            height: 28%;
            border-radius: 50%;
            background: #c8cdb2;
            opacity: 0.78;
          }

          .gallery-mood-vase span:nth-child(1) { left: 20%; transform: rotate(-24deg); }
          .gallery-mood-vase span:nth-child(2) { right: 18%; top: 18%; transform: rotate(18deg); }

          .gallery-mood-vase i {
            position: absolute;
            left: 23%;
            right: 23%;
            bottom: 3%;
            height: 50%;
            border-radius: 44% 44% 16% 16%;
            background: #f3ead9;
            border: 1px solid rgba(20, 12, 0, 0.14);
          }

          .gallery-mood-ringbox {
            position: relative;
            width: 100%;
            height: 100%;
          }

          .gallery-mood-ringbox::before,
          .gallery-mood-ringbox::after {
            content: "";
            position: absolute;
            left: 8%;
            right: 8%;
            background: #3a2e22;
          }

          .gallery-mood-ringbox::before { top: 4%; height: 35%; }
          .gallery-mood-ringbox::after { bottom: 5%; height: 52%; }

          .gallery-mood-ringbox span {
            position: absolute;
            left: 18%;
            right: 18%;
            bottom: 11%;
            height: 38%;
            z-index: 2;
            background: rgba(241, 230, 204, 0.78);
          }

          .gallery-mood-ringbox i,
          .gallery-mood-ring {
            position: absolute;
            left: 50%;
            top: 62%;
            width: 28%;
            height: 28%;
            border: 4px solid #c9b083;
            border-radius: 50%;
            transform: translate(-50%, -50%) rotate(-12deg) scaleY(0.55);
            z-index: 3;
          }

          .gallery-mood-ring {
            position: relative;
            left: auto;
            top: auto;
            width: 100%;
            height: 100%;
            transform: rotate(-12deg) scaleY(0.46);
          }

          .gallery-mood-ring::before {
            content: "";
            position: absolute;
            left: 48%;
            top: 18%;
            width: 10%;
            height: 14%;
            border-radius: 50%;
            background: #f1e2bd;
          }

          .gallery-mood-citrus {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background:
              repeating-conic-gradient(from 0deg, rgba(184, 136, 74, 0.55) 0deg 2deg, transparent 2deg 45deg),
              radial-gradient(circle, #f0d39a 0 58%, #e2b87a 60% 100%);
            opacity: 0.78;
          }

          .gallery-mood-ribbon {
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 5px;
            border: 1px solid rgba(20, 12, 0, 0.14);
          }

          .gallery-mood-ribbon span {
            position: absolute;
            left: 42%;
            top: 0;
            width: 16%;
            height: 100%;
            background: rgba(184, 158, 110, 0.65);
          }

          .gallery-mood-bottle {
            position: relative;
            width: 100%;
            height: 100%;
          }

          .gallery-mood-bottle::before {
            content: "";
            position: absolute;
            left: 39%;
            top: 0;
            width: 22%;
            height: 22%;
            background: #c9b890;
          }

          .gallery-mood-bottle span {
            position: absolute;
            left: 20%;
            right: 20%;
            bottom: 4%;
            height: 70%;
            border-radius: 8px;
            background: rgba(216, 200, 168, 0.55);
            border: 1px solid rgba(20, 12, 0, 0.16);
          }

          .gallery-mood-petals {
            position: relative;
            width: 100%;
            height: 100%;
          }

          .gallery-mood-petals span {
            position: absolute;
            width: 22%;
            height: 14%;
            border-radius: 50%;
            background: #d9b8a3;
            opacity: 0.72;
          }

          .gallery-mood-petals span:nth-child(1) { left: 18%; top: 36%; transform: rotate(20deg); }
          .gallery-mood-petals span:nth-child(2) { left: 48%; top: 24%; transform: rotate(-15deg); }
          .gallery-mood-petals span:nth-child(3) { left: 72%; top: 50%; transform: rotate(40deg); }
          .gallery-mood-petals span:nth-child(4) { left: 32%; top: 68%; transform: rotate(-30deg); }
          .gallery-mood-petals span:nth-child(5) { left: 58%; top: 72%; transform: rotate(10deg); }

          .gallery-mood-overlay {
            position: absolute;
            inset: 0;
            z-index: 6;
            pointer-events: none;
            background: var(--gallery-overlay, rgba(120, 110, 90, 0.04));
          }

          .gallery-mood-vignette {
            position: absolute;
            inset: 0;
            z-index: 7;
            pointer-events: none;
            background: radial-gradient(ellipse 100% 75% at 50% 50%, rgba(60,45,25,0) 40%, rgba(60,45,25,0.14) 85%, rgba(60,45,25,0.22) 100%);
          }

          .gallery-mood-grain {
            position: absolute;
            inset: 0;
            z-index: 8;
            pointer-events: none;
            opacity: 0.35;
            background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
          }

          @keyframes gallery-breathe1 { 0%,100% { transform: translateY(0) rotate(var(--rot, 0deg)); } 50% { transform: translateY(-10px) rotate(calc(var(--rot, 0deg) + 0.6deg)); } }
          @keyframes gallery-breathe2 { 0%,100% { transform: translateY(0) rotate(var(--rot, 0deg)); } 50% { transform: translateY(8px) rotate(calc(var(--rot, 0deg) - 0.8deg)); } }
          @keyframes gallery-breathe3 { 0%,100% { transform: translateY(2px) rotate(var(--rot, 0deg)); } 50% { transform: translateY(-12px) rotate(calc(var(--rot, 0deg) + 1.2deg)); } }
          @keyframes gallery-breathe4 { 0%,100% { transform: translateY(-4px) rotate(var(--rot, 0deg)); } 50% { transform: translateY(6px) rotate(calc(var(--rot, 0deg) + 0.4deg)); } }
          @keyframes gallery-breathe5 { 0%,100% { transform: translateY(0) rotate(var(--rot, 0deg)); } 50% { transform: translateY(-14px) rotate(calc(var(--rot, 0deg) - 1deg)); } }
          @keyframes gallery-breathe6 { 0%,100% { transform: translateY(6px) rotate(var(--rot, 0deg)); } 50% { transform: translateY(-6px) rotate(calc(var(--rot, 0deg) + 0.8deg)); } }
          @keyframes gallery-breathe7 { 0%,100% { transform: translateY(0) rotate(var(--rot, 0deg)); } 50% { transform: translateY(-7px) rotate(calc(var(--rot, 0deg) + 1.6deg)); } }
          @keyframes gallery-breathe8 { 0%,100% { transform: translateY(0) rotate(var(--rot, 0deg)); } 50% { transform: translateY(9px) rotate(calc(var(--rot, 0deg) - 0.5deg)); } }
          @keyframes gallery-breathe9 { 0%,100% { transform: translateY(-3px) rotate(var(--rot, 0deg)); } 50% { transform: translateY(11px) rotate(calc(var(--rot, 0deg) + 1deg)); } }
          @keyframes gallery-breathe10 { 0%,100% { transform: translateY(0) rotate(var(--rot, 0deg)); } 50% { transform: translateY(-9px) rotate(calc(var(--rot, 0deg) - 1.4deg)); } }
          @keyframes gallery-breathe11 { 0%,100% { transform: translateY(4px) rotate(var(--rot, 0deg)); } 50% { transform: translateY(-8px) rotate(calc(var(--rot, 0deg) + 0.7deg)); } }
          @keyframes gallery-breathe12 { 0%,100% { transform: translateY(0) rotate(var(--rot, 0deg)); } 50% { transform: translateY(-13px) rotate(calc(var(--rot, 0deg) - 0.9deg)); } }

          .gallery-mood-object--1 .gallery-mood-inner { animation-name: gallery-breathe1; }
          .gallery-mood-object--2 .gallery-mood-inner { animation-name: gallery-breathe2; }
          .gallery-mood-object--3 .gallery-mood-inner { animation-name: gallery-breathe3; }
          .gallery-mood-object--4 .gallery-mood-inner { animation-name: gallery-breathe4; }
          .gallery-mood-object--5 .gallery-mood-inner { animation-name: gallery-breathe5; }
          .gallery-mood-object--6 .gallery-mood-inner { animation-name: gallery-breathe6; }
          .gallery-mood-object--7 .gallery-mood-inner { animation-name: gallery-breathe7; }
          .gallery-mood-object--8 .gallery-mood-inner { animation-name: gallery-breathe8; }
          .gallery-mood-object--9 .gallery-mood-inner { animation-name: gallery-breathe9; }
          .gallery-mood-object--10 .gallery-mood-inner { animation-name: gallery-breathe10; }
          .gallery-mood-object--11 .gallery-mood-inner { animation-name: gallery-breathe11; }
          .gallery-mood-object--12 .gallery-mood-inner { animation-name: gallery-breathe12; }

          @media (max-width: 760px) {
            .gallery-mood-layer {
              transform: translateX(-24px);
            }

            .gallery-mood-video {
              object-position: left center;
            }

            .gallery-mood-object--hide-mobile {
              display: none;
            }

            .gallery-mood-inner {
              width: 72%;
              height: 72%;
              transform-origin: center;
            }

            .gallery-mood-object--ringBoxImage .gallery-mood-inner,
            .gallery-mood-object--ringImage .gallery-mood-inner,
            .gallery-mood-object--flowerImage .gallery-mood-inner,
            .gallery-mood-object--paperScrollImage .gallery-mood-inner,
            .gallery-mood-object--dryLemonImage .gallery-mood-inner,
            .gallery-mood-object--dryLemon2Image .gallery-mood-inner,
            .gallery-mood-object--whiteFlowerImage .gallery-mood-inner,
            .gallery-mood-object--coinImage .gallery-mood-inner,
            .gallery-mood-object--upBookImage .gallery-mood-inner {
              width: calc(72% * var(--gallery-asset-scale, 1));
              height: calc(72% * var(--gallery-asset-scale, 1));
            }

          }

          @media (prefers-reduced-motion: reduce) {
            .gallery-mood-inner {
              animation: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}

function PolaroidStack({
  progress,
  photos,
  width,
  viewportHeight,
}: {
  progress: number;
  photos: StoryPhoto[];
  width: number;
  viewportHeight: number;
}) {
  const start = 0.04;
  const end = 0.95;
  const slotSize = (end - start) / photos.length;

  return (
    <div
      style={{
        position: "relative",
        width: width + 40,
        height: width * 1.82,
        pointerEvents: "none",
      }}
    >
      {photos.map((photo, index) => {
        const slotStart = lerp(start, end, index / photos.length);
        const slotEnd = lerp(start, end, (index + 0.85) / photos.length);
        const reveal = ease(clamp((progress - slotStart) / (slotEnd - slotStart)));
        const layerBack = clamp((progress - slotEnd) / slotSize, 0, photos.length);
        const finalY = index * (width * 0.18);
        const finalX = (index - (photos.length - 1) / 2) * 8;
        const translateY = lerp(viewportHeight + width, finalY, reveal) + layerBack * 18;
        const translateX = lerp((index % 2 === 0 ? -1 : 1) * 18, finalX, reveal);
        const scale = lerp(0.94, 1, reveal) - layerBack * 0.012;
        const rotate =
          lerp(photo.rotate * 1.6, photo.rotate, reveal) -
          layerBack * 0.22 * (index % 2 ? 1 : -1);
        const isActive = reveal > 0.02 && layerBack < 0.85;
        const blur = layerBack > 1.2 ? Math.min(1.2, (layerBack - 1.2) * 0.5) : 0;
        const shadow =
          reveal > 0
            ? `0 ${10 + reveal * 22}px ${20 + reveal * 30}px rgba(43,36,29,${
                0.08 + reveal * 0.12
              }), 0 1px 2px rgba(43,36,29,0.06)`
            : "0 0 0 rgba(0,0,0,0)";

        return (
          <div
            key={`${photo.caption}-${index}`}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width,
              height: width * 1.14,
              marginLeft: -width / 2,
              marginTop: -(width * 1.14) / 2,
              background: "#FBF7EE",
              borderRadius: 4,
              padding: "14px 14px 0",
              boxShadow: shadow,
              zIndex: isActive ? 1000 + index : 100 + index,
              opacity: 1,
              filter: blur ? `blur(${blur}px)` : "none",
              transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale}) rotate(${rotate}deg)`,
              transformOrigin: "50% 60%",
              willChange: "transform, opacity, filter",
              backfaceVisibility: "hidden",
              border: "1px solid rgba(43,36,29,0.06)",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "1 / 1",
                overflow: "hidden",
                borderRadius: 2,
              }}
            >
              <ShimmerImage src={photo.src} alt={photo.caption} fill sizes="320px" className="object-cover" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Section3Video() {
  const sectionRef = useRef<HTMLElement>(null);
  const moodLayerRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    sectionTop: 0,
    sectionHeight: 0,
    scrollY: 0,
    viewportHeight: 800,
    viewportWidth: 1280,
  });

  useEffect(() => {
    let frameId = 0;

    const updateOnScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      const sectionHeight = section.offsetHeight;
      const sectionScroll = window.scrollY - sectionTop;
      const stickyStart = window.innerHeight * GALLERY_STICKY_DELAY;
      const stickyRange = sectionHeight - window.innerHeight - stickyStart;
      const stickyProgress = clamp((sectionScroll - stickyStart) / stickyRange);
      moodLayerRef.current?.style.setProperty("--p", (easeInOut(stickyProgress) * (GALLERY_TWEAKS.bgLift / 90)).toFixed(4));

      setScrollState({
        sectionTop,
        sectionHeight,
        scrollY: window.scrollY,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
      });
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

  const photos = useMemo(() => PHOTOS, []);
  const sectionScroll = scrollState.scrollY - scrollState.sectionTop;
  const introHeight = scrollState.viewportHeight;
  const stickyStart = introHeight * GALLERY_STICKY_DELAY;
  const stickyRange = scrollState.sectionHeight - scrollState.viewportHeight - stickyStart;
  const stickyProgress = clamp((sectionScroll - stickyStart) / stickyRange);
  const introProgress = clamp(sectionScroll / (scrollState.viewportHeight * 0.95));
  const headingEnter = ease(clamp((introProgress - 0.2) / 0.7));
  const headingScale = lerp(1, 0.86, easeInOut(stickyProgress));
  const headingTop = lerp(18, 6, easeInOut(stickyProgress));
  const isMobile = scrollState.viewportWidth < 768;
  const polaroidWidth = isMobile ? 220 : 280;
  const activeDotIndex = Math.min(PHOTOS.length - 1, Math.max(0, Math.floor(stickyProgress * PHOTOS.length)));

  return (
    <section
      id="gallery-section"
      data-gallery-photo-count={PHOTOS.length}
      ref={sectionRef}
      style={{
        position: "relative",
        height: "calc(100vh + 500vh + 100vh)",
        width: "100%",
        overflow: "visible",
        backgroundColor: "#F7F1E7",
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
        <GalleryMoodboardBackground layerRef={moodLayerRef} />

        <div
          style={{
            position: "absolute",
            top: "32vh",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            opacity: clamp(1 - introProgress / 0.4),
            transform: `translateY(${-introProgress * 30}px)`,
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-din-alternate)",
              fontSize: 12,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.72)",
              textAlign: "center",
            }}
          >
            you are cordially invited
            <br />
            <span
              style={{
                fontFamily: "var(--font-cyrene)",
                fontStyle: "italic",
                textTransform: "none",
                letterSpacing: 0,
                fontSize: 20,
                color: "#ffffff",
                display: "inline-block",
                marginTop: 14,
              }}
            >
              to celebrate the story of...
            </span>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            paddingTop: isMobile ? `${Math.max(7, headingTop)}vh` : `${headingTop}vh`,
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-cyrene)",
              fontSize: isMobile ? "clamp(56px, 17vw, 96px)" : "clamp(72px, 11vw, 220px)",
              lineHeight: 0.88,
              color: "#ffffff",
              opacity: headingEnter,
              transform: `translateY(${lerp(40, 0, headingEnter)}px) scale(${headingScale})`,
              transformOrigin: "50% 0%",
              textAlign: "center",
              whiteSpace: "nowrap",
              textShadow: "0 18px 50px rgba(0,0,0,0.28)",
              willChange: "transform, opacity",
              backfaceVisibility: "hidden",
            }}
          >
            Us
          </h2>
        </div>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: isMobile ? "38%" : "47%",
            transform: "translate(-50%, -50%)",
            opacity: clamp((introProgress - 0.32) / 0.28),
            zIndex: 20,
          }}
        >
          <PolaroidStack
            progress={stickyProgress}
            photos={photos}
            width={polaroidWidth}
            viewportHeight={scrollState.viewportHeight}
          />
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 36,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 10,
            opacity: clamp((introProgress - 0.38) / 0.3),
            zIndex: 35,
          }}
        >
          {PHOTOS.map((_, index) => {
            const active = activeDotIndex === index;

            return (
              <div
                key={index}
                style={{
                  width: active ? 28 : 8,
                  height: 4,
                  borderRadius: 999,
                  background: active ? "#ffffff" : "rgba(255,255,255,0.34)",
                  transition: "width 0.3s ease, background 0.3s ease",
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
