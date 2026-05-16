"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type CloudSectionProps = {
  line1: string;
  line2: string;
  cloudImages?: string[];
  bgColor?: string;
};

type Message = {
  id: number;
  sender: "me" | "them";
  text: string;
};

const MESSAGES: Message[] = [
  { id: 1, sender: "them", text: "Hi, remember the first time we met?" },
  { id: 2, sender: "me", text: "Of course. You were late. 20 minutes." },
  { id: 3, sender: "them", text: "I was nervous okay 😭" },
  { id: 4, sender: "me", text: "Worth it though 🤍" },
  { id: 5, sender: "them", text: "Every single day" },
  { id: 6, sender: "me", text: "Every single day 🤍" },
];

const CLOUD_BLOB_STYLE: React.CSSProperties = {
  borderRadius: "50% 60% 50% 70% / 60% 50% 70% 50%",
  background: "rgba(255,255,255,0.85)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
};

const CLOUDS = [
  {
    key: "cloud-1",
    style: { top: "5%", left: "3%", width: "clamp(160px, 22vw, 320px)" },
    drift: 20,
    duration: 7,
    delay: 0,
  },
  {
    key: "cloud-2",
    style: { top: "15%", right: "5%", width: "clamp(120px, 16vw, 220px)" },
    drift: -25,
    duration: 9,
    delay: 1.5,
  },
  {
    key: "cloud-3",
    style: { top: "30%", left: "8%", width: "clamp(190px, 26vw, 380px)" },
    drift: 15,
    duration: 6,
    delay: 0.8,
  },
  {
    key: "cloud-4",
    style: { top: "45%", right: "10%", width: "clamp(140px, 18vw, 260px)" },
    drift: -20,
    duration: 10,
    delay: 2,
  },
  {
    key: "cloud-5",
    style: { top: "60%", left: "5%", width: "clamp(110px, 14vw, 200px)" },
    drift: 18,
    duration: 8,
    delay: 0.3,
  },
  {
    key: "cloud-6",
    style: { top: "75%", right: "3%", width: "clamp(170px, 20vw, 300px)" },
    drift: -15,
    duration: 7,
    delay: 1,
  },
] as const;

function CloudVisual({
  src,
  alt,
  style,
}: {
  src?: string;
  alt: string;
  style: React.CSSProperties;
}) {
  if (src) {
    return (
      <div className="relative aspect-[2/1] overflow-visible" style={style}>
        <Image src={src} alt={alt} fill className="object-contain" />
      </div>
    );
  }

  return <div className="aspect-[2/1]" style={{ ...style, ...CLOUD_BLOB_STYLE }} />;
}

function ChatBubble({
  message,
  index,
  visibleCount,
}: {
  message: Message;
  index: number;
  visibleCount: number;
}) {
  const visible = index < visibleCount;
  const isMe = message.sender === "me";
  const chars = message.text.split("");

  return (
    <AnimatePresence mode="popLayout">
      {visible && (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ type: "spring", stiffness: 400, damping: 20, mass: 0.8 }}
          style={{
            display: "flex",
            flexDirection: isMe ? "row-reverse" : "row",
            alignItems: "flex-end",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              backgroundColor: isMe ? "#2C3E6B" : "#C4A882",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 12,
              fontWeight: 600,
              flexShrink: 0,
              fontFamily: '"Fragment Mono", "Courier New", monospace',
            }}
          >
            {isMe ? "SA" : "AR"}
          </div>

          <div
            style={{
              backgroundColor: isMe ? "#2C3E6B" : "#ffffff",
              color: isMe ? "#ffffff" : "#1a1a1a",
              padding: "12px 16px",
              borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              maxWidth: "280px",
              fontSize: "15px",
              lineHeight: 1.5,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              perspective: "400px",
            }}
          >
            {chars.map((char, charIndex) => (
              <motion.span
                key={`${message.id}-${charIndex}`}
                initial={{ opacity: 0, rotateY: 90, x: -20 }}
                animate={visible ? { opacity: 1, rotateY: 0, x: 0 } : {}}
                transition={{
                  delay: charIndex * 0.03,
                  duration: 0.4,
                  ease: [0.65, 0, 0.35, 1],
                }}
                style={{ display: "inline-block", transformOrigin: "left center" }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function CloudSection({
  line1: _line1,
  line2: _line2,
  cloudImages,
  bgColor = "#FDFBF7",
}: CloudSectionProps) {
  void _line1;
  void _line2;

  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const { top, height } = el.getBoundingClientRect();
      const scrolled = -top;
      const total = height - window.innerHeight;
      const progress = Math.max(0, Math.min(1, total > 0 ? scrolled / total : 0));
      const count = Math.floor(progress * MESSAGES.length) + 1;
      setVisibleCount(Math.min(count, MESSAGES.length));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const repeatedCloudImages = useMemo(
    () => cloudImages?.length ? cloudImages : undefined,
    [cloudImages],
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-visible"
      style={{ height: `${MESSAGES.length * 120}vh`, backgroundColor: bgColor }}
    >
      {CLOUDS.map((cloud, index) => (
        <motion.div
          key={cloud.key}
          className="absolute z-0"
          style={cloud.style}
          animate={{ x: [0, cloud.drift, 0, -cloud.drift, 0] }}
          transition={{
            duration: cloud.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: cloud.delay,
          }}
        >
          <CloudVisual
            src={repeatedCloudImages?.[index % repeatedCloudImages.length]}
            alt={`Decorative cloud ${index + 1}`}
            style={{ width: "100%" }}
          />
        </motion.div>
      ))}

      <div
        className="sticky top-0 z-10 flex h-screen items-center justify-center pointer-events-none"
      >
        <div
          style={{
            position: "absolute",
            top: "12%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "280px",
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <DotLottieReact src="/plane.lottie" loop autoplay />
        </div>

        <div className="relative z-[1] w-full max-w-[480px] px-6">
          <div style={{ pointerEvents: "auto" }}>
            {MESSAGES.map((message, index) => (
              <ChatBubble
                key={message.id}
                message={message}
                index={index}
                visibleCount={visibleCount}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
