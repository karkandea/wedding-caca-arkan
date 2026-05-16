"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
} from "react";
import type { AnimationItem } from "lottie-web";

export type LottiePlayerHandle = {
  playFromStart: () => void;
  goToAndStop: (frame: number) => void;
  getDuration: (inFrames?: boolean) => number;
};

type LottiePlayerProps = {
  animationData?: unknown;
  path?: string;
  renderer?: "svg" | "canvas" | "html";
  autoplay?: boolean;
  loop?: boolean;
  preserveAspectRatio?: string;
  className?: string;
  style?: CSSProperties;
  onComplete?: () => void;
};

const LottiePlayer = forwardRef<LottiePlayerHandle, LottiePlayerProps>(function LottiePlayer(
  {
    animationData,
    path,
    renderer = "canvas",
    autoplay = true,
    loop = false,
    preserveAspectRatio = "xMidYMid meet",
    className,
    style,
    onComplete,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem | null>(null);
  const pendingPlayRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useImperativeHandle(ref, () => ({
    playFromStart: () => {
      const animation = animationRef.current;
      if (!animation) {
        pendingPlayRef.current = true;
        return;
      }

      animation.goToAndPlay(0, true);
    },
    goToAndStop: (frame: number) => {
      animationRef.current?.goToAndStop(frame, true);
    },
    getDuration: (inFrames = false) => animationRef.current?.getDuration(inFrames) ?? 0,
  }));

  useEffect(() => {
    let isMounted = true;
    let animation: AnimationItem | null = null;

    import("lottie-web").then((module) => {
      if (!isMounted || !containerRef.current) return;

      animation = module.default.loadAnimation({
        container: containerRef.current,
        renderer,
        loop,
        autoplay,
        ...(path ? { path } : { animationData }),
        rendererSettings: {
          preserveAspectRatio,
        },
      });

      animationRef.current = animation;
      animation.addEventListener("complete", () => onCompleteRef.current?.());

      if (!autoplay) {
        animation.goToAndStop(0, true);
      }

      if (pendingPlayRef.current) {
        pendingPlayRef.current = false;
        animation.goToAndPlay(0, true);
      }
    });

    return () => {
      isMounted = false;
      if (animation) {
        animation.destroy();
      }
      animationRef.current = null;
    };
  }, [animationData, autoplay, loop, path, preserveAspectRatio, renderer]);

  return <div ref={containerRef} className={className} style={style} />;
});

export default LottiePlayer;
