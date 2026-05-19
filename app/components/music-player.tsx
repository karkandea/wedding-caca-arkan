"use client";

import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { assetPath } from "../lib/asset-path";

const TRACK_SRC = assetPath("/Grandma's Home.mp3");

type MusicPlayerProps = {
  variant?: "floating" | "nav";
};

export default function MusicPlayer({ variant = "floating" }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const discRef = useRef<HTMLSpanElement>(null);
  const hasStartedRef = useRef(false);
  const isManuallyPausedRef = useRef(false);
  const retryTimersRef = useRef<number[]>([]);
  const rotationRef = useRef(0);
  const sourceAttachedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const isNav = variant === "nav";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const syncState = () => setIsPlaying(!audio.paused);
    const attachSource = () => {
      if (sourceAttachedRef.current) return;
      sourceAttachedRef.current = true;
      audio.src = TRACK_SRC;
      audio.load();
    };
    const playFromStart = async () => {
      if (isManuallyPausedRef.current) return;

      try {
        attachSource();
        if (!hasStartedRef.current) {
          audio.currentTime = 0;
          hasStartedRef.current = true;
        }
        await audio.play();
        syncState();
      } catch {
        syncState();
      }
    };

    const queuePlayAttempts = () => {
      retryTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      if (isManuallyPausedRef.current) return;

      retryTimersRef.current = [0, 250, 700, 1400, 2400].map((delay) =>
        window.setTimeout(() => {
          void playFromStart();
        }, delay),
      );
    };

    const unlockAudio = () => {
      if (isManuallyPausedRef.current) return;
      if (!audio.paused) return;
      void playFromStart();
    };

    const playAfterLoading = () => {
      queuePlayAttempts();
    };

    audio.volume = 0.58;
    audio.autoplay = true;

    window.addEventListener("pointerdown", unlockAudio, { passive: true });
    window.addEventListener("touchstart", unlockAudio, { passive: true });
    window.addEventListener("click", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    window.addEventListener("wheel", unlockAudio, { passive: true });
    window.addEventListener("scroll", unlockAudio, { passive: true });
    window.addEventListener("wedding-loading-complete", playAfterLoading);
    audio.addEventListener("canplaythrough", playAfterLoading, { once: true });
    audio.addEventListener("play", syncState);
    audio.addEventListener("pause", syncState);

    return () => {
      retryTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("wheel", unlockAudio);
      window.removeEventListener("scroll", unlockAudio);
      window.removeEventListener("wedding-loading-complete", playAfterLoading);
      audio.removeEventListener("canplaythrough", playAfterLoading);
      audio.removeEventListener("play", syncState);
      audio.removeEventListener("pause", syncState);
    };
  }, []);

  useEffect(() => {
    const disc = discRef.current;
    if (!disc) return;

    let frameId = 0;
    let lastTimestamp = 0;
    const degreesPerMs = 360 / 4000;

    const tick = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      rotationRef.current = (rotationRef.current + delta * degreesPerMs) % 360;
      disc.style.transform = `rotate(${rotationRef.current.toFixed(2)}deg)`;
      frameId = window.requestAnimationFrame(tick);
    };

    disc.style.transform = `rotate(${rotationRef.current.toFixed(2)}deg)`;
    if (isPlaying) {
      frameId = window.requestAnimationFrame(tick);
    }

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [isPlaying]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      isManuallyPausedRef.current = false;
      try {
        if (!sourceAttachedRef.current) {
          sourceAttachedRef.current = true;
          audio.src = TRACK_SRC;
          audio.load();
        }
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    isManuallyPausedRef.current = true;
    retryTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    audio.pause();
    setIsPlaying(false);
  };

  return (
    <>
      <audio ref={audioRef} preload="none" autoPlay loop playsInline />
      <button
        type="button"
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pause music" : "Play music"}
        aria-pressed={isPlaying}
        className={
          isNav
            ? "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2B241D]/10 bg-[#FFFCF5]/90 shadow-[0_6px_18px_rgba(43,36,29,0.16)] transition hover:scale-105 active:scale-95"
            : "fixed bottom-4 right-4 z-[2147483000] flex h-14 w-14 items-center justify-center rounded-full border border-white/55 bg-[#161412]/70 shadow-[0_12px_34px_rgba(0,0,0,0.22)] backdrop-blur-md transition hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
        }
      >
        <span
          ref={discRef}
          className={`relative block overflow-hidden rounded-full border ${
            isNav
              ? "h-8 w-8 border-[#2B241D]/10 shadow-[0_2px_8px_rgba(43,36,29,0.12)]"
              : "h-10 w-10 border-white/35 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] sm:h-12 sm:w-12"
          }`}
        >
          {isNav ? (
            <Image src={assetPath("/logo new 1.webp")} alt="" fill sizes="32px" className="object-cover" />
          ) : (
            <>
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#f7f1e7_0_9%,#1f1c1a_10%_18%,#eee8dc_19%_22%,#111_23%_42%,#2d2925_43%_47%,#0f0e0d_48%_100%)]" />
              <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F7F1E7] shadow-[0_0_0_3px_rgba(255,255,255,0.12)]" />
              <span
                className="absolute inset-[7px] rounded-full border border-white/10"
                style={{
                  background:
                    "repeating-radial-gradient(circle at center, transparent 0 3px, rgba(255,255,255,0.09) 4px 5px)",
                }}
              />
            </>
          )}
        </span>
        <span
          className={`absolute flex items-center justify-center rounded-full bg-[#F7F1E7] font-bold leading-none text-[#161412] shadow-[0_2px_8px_rgba(0,0,0,0.22)] ${
            isNav ? "bottom-0 right-0 h-4 w-4" : "bottom-1.5 right-1.5 h-5 w-5"
          }`}
        >
          {isPlaying ? <Pause size={isNav ? 9 : 11} strokeWidth={3} /> : <Play size={isNav ? 9 : 11} strokeWidth={3} fill="currentColor" />}
        </span>
      </button>
    </>
  );
}
