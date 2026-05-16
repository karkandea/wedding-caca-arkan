"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

type PreloaderScreenProps = {
  images: string[];
  onComplete: () => void;
};

const PHOTO_DATA = [
  { rotate: -12, x: -26, y: 16, exit: { x: 0, rotate: -18 } },
  { rotate: 8, x: 22, y: -20, exit: { x: -120, rotate: -5 } },
  { rotate: -5, x: -16, y: 24, exit: { x: 100, rotate: 12 } },
  { rotate: 11, x: 24, y: -10, exit: { x: -80, rotate: -20 } },
  { rotate: -8, x: -22, y: 12, exit: { x: 60, rotate: 15 } },
] as const;

const STAGGER_DELAY_MS = 450;
const ENTRANCE_DURATION_MS = 550;
const HOLD_DURATION_MS = 1000;
const EXIT_STAGGER_MS = 70;
const EXIT_BASE_DURATION_MS = 750;
const EXIT_DURATION_STEP_MS = 50;
const EXIT_MAX_DURATION_MS =
  EXIT_BASE_DURATION_MS + (PHOTO_DATA.length - 1) * EXIT_DURATION_STEP_MS;
const ENTRANCE_EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];
const EXIT_EASE: [number, number, number, number] = [0.55, 0, 1, 0.45];

export default function PreloaderScreen({
  images,
  onComplete,
}: PreloaderScreenProps) {
  const visiblePhotos = images.slice(0, PHOTO_DATA.length);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (visiblePhotos.length === 0) {
      onComplete();
      return;
    }

    const lastPhotoDelay = (visiblePhotos.length - 1) * STAGGER_DELAY_MS;
    const exitStart = lastPhotoDelay + ENTRANCE_DURATION_MS + HOLD_DURATION_MS;
    const timer = window.setTimeout(() => setIsExiting(true), exitStart);

    return () => window.clearTimeout(timer);
  }, [onComplete, visiblePhotos.length]);

  useEffect(() => {
    if (!isExiting) {
      return;
    }

    const lastExitDelay = (visiblePhotos.length - 1) * EXIT_STAGGER_MS;
    const totalExitDuration = lastExitDelay + EXIT_MAX_DURATION_MS;
    const timer = window.setTimeout(onComplete, totalExitDuration);

    return () => window.clearTimeout(timer);
  }, [isExiting, onComplete, visiblePhotos.length]);

  return (
    <motion.div
      className="fixed inset-0 z-[999] pointer-events-none"
      style={{ background: "transparent" }}
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div className="relative h-72 w-72 sm:h-80 sm:w-80">
        {visiblePhotos.map((src, index) => {
          const photo = PHOTO_DATA[index];

          return (
            <motion.div
              key={`${src}-${index}`}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white shadow-[0_18px_40px_rgba(80,40,28,0.18)]"
              style={{
                zIndex: index + 1,
                padding: 7,
              }}
              initial={{ opacity: 0, scale: 0.15, rotate: 0, x: photo.x, y: photo.y }}
              animate={
                isExiting
                  ? {
                      x: photo.x + photo.exit.x,
                      y: "110vh",
                      rotate: photo.exit.rotate,
                      scale: 1,
                    }
                  : {
                      opacity: 1,
                      scale: 1,
                      rotate: photo.rotate,
                      x: photo.x,
                      y: photo.y,
                    }
              }
              transition={
                isExiting
                  ? {
                      delay: (index * EXIT_STAGGER_MS) / 1000,
                      duration:
                        (EXIT_BASE_DURATION_MS + index * EXIT_DURATION_STEP_MS) / 1000,
                      ease: EXIT_EASE,
                    }
                  : {
                      delay: (index * STAGGER_DELAY_MS) / 1000,
                      duration: ENTRANCE_DURATION_MS / 1000,
                      ease: ENTRANCE_EASE,
                    }
              }
            >
              <div
                className="overflow-hidden"
                style={{ width: "clamp(180px, 15.5vw, 224px)", aspectRatio: "3 / 4" }}
              >
                <Image
                  src={src}
                  alt=""
                  width={448}
                  height={598}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
      </div>
    </motion.div>
  );
}
