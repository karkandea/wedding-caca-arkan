"use client";

import { useEffect, useRef, useState } from "react";

const TRACK_SRC = "/Married Life.mp3";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasStartedRef = useRef(false);
  const retryTimersRef = useRef<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.58;
    audio.currentTime = 0;
    audio.autoplay = true;
    audio.load();

    const syncState = () => setIsPlaying(!audio.paused);
    const playFromStart = async () => {
      try {
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
      retryTimersRef.current = [0, 250, 700, 1400, 2400].map((delay) =>
        window.setTimeout(() => {
          void playFromStart();
        }, delay),
      );
    };

    void playFromStart();
    queuePlayAttempts();

    const unlockAudio = () => {
      if (!audio.paused) return;
      void playFromStart();
    };

    const playAfterLoading = () => {
      queuePlayAttempts();
    };

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

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    audio.pause();
    setIsPlaying(false);
  };

  return (
    <>
      <audio ref={audioRef} src={TRACK_SRC} preload="auto" autoPlay loop playsInline />
      <button
        type="button"
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pause music" : "Play music"}
        aria-pressed={isPlaying}
        className="fixed bottom-4 right-4 z-[2147483000] flex h-14 w-14 items-center justify-center rounded-full border border-white/55 bg-[#161412]/70 shadow-[0_12px_34px_rgba(0,0,0,0.22)] backdrop-blur-md transition hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
      >
        <span
          className="relative block h-10 w-10 rounded-full border border-white/35 bg-[radial-gradient(circle_at_50%_50%,#f7f1e7_0_9%,#1f1c1a_10%_18%,#eee8dc_19%_22%,#111_23%_42%,#2d2925_43%_47%,#0f0e0d_48%_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] sm:h-12 sm:w-12"
          style={{
            animation: isPlaying ? "music-disc-spin 4s linear infinite" : "none",
          }}
        >
          <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F7F1E7] shadow-[0_0_0_3px_rgba(255,255,255,0.12)]" />
          <span
            className="absolute inset-[7px] rounded-full border border-white/10"
            style={{
              background:
                "repeating-radial-gradient(circle at center, transparent 0 3px, rgba(255,255,255,0.09) 4px 5px)",
            }}
          />
        </span>
        <span className="absolute bottom-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#F7F1E7] text-[9px] font-bold leading-none text-[#161412] shadow-[0_2px_8px_rgba(0,0,0,0.22)]">
          {isPlaying ? "II" : "▶"}
        </span>
      </button>
      <style>
        {`@keyframes music-disc-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }`}
      </style>
    </>
  );
}
