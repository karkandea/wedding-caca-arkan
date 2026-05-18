"use client";

type Chapter = {
  eyebrow: string;
  title: string;
  body: string;
  side: "left" | "right";
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

export function getChapterActivity(progress: number, index: number) {
  const ranges = [
    [0, 0.45],
    [0.4, 0.78],
    [0.72, 1.05],
  ];
  const [start, end] = ranges[index];
  const mid = (start + end) / 2;
  const half = (end - start) / 2;
  const distance = Math.abs(progress - mid) / half;

  return clamp(1 - distance * distance * 1.1);
}

export function ChapterText({ chapter, activity }: { chapter: Chapter; activity: number }) {
  const opacity = lerp(0.16, 1, activity);
  const blur = lerp(2, 0, activity);
  const translateY = lerp(chapter.side === "left" ? -8 : 8, 0, activity);

  return (
    <div
      className="hidden lg:block"
      style={{
        position: "absolute",
        top: "50%",
        [chapter.side]: "5vw",
        width: "min(360px, 28vw)",
        textAlign: chapter.side === "left" ? "right" : "left",
        transform: `translate3d(0, calc(-50% + ${translateY}px), 0)`,
        filter: `blur(${blur}px)`,
        opacity,
        pointerEvents: "none",
        willChange: "transform, opacity, filter",
        backfaceVisibility: "hidden",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-din-alternate)",
          fontSize: 12,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.72)",
          marginBottom: 14,
        }}
      >
        - {chapter.eyebrow}
      </div>
      <div
        style={{
          fontFamily: "var(--font-cyrene)",
          fontWeight: 500,
          fontSize: 36,
          lineHeight: 1.05,
          color: "#ffffff",
          marginBottom: 18,
          fontStyle: "italic",
          textShadow: "0 8px 24px rgba(0,0,0,0.22)",
        }}
      >
        {chapter.title}.
      </div>
      <div
        style={{
          fontFamily: "var(--font-din-alternate)",
          fontSize: 15,
          lineHeight: 1.65,
          color: "rgba(255,255,255,0.78)",
          fontWeight: 400,
        }}
      >
        {chapter.body}
      </div>
    </div>
  );
}

export function MobileChapter({
  chapters,
  activities,
  opacity,
}: {
  chapters: Chapter[];
  activities: number[];
  opacity: number;
}) {
  let activeIndex = 0;
  let maxActivity = -1;

  activities.forEach((activity, index) => {
    if (activity > maxActivity) {
      maxActivity = activity;
      activeIndex = index;
    }
  });

  const chapter = chapters[activeIndex];

  return (
    <div
      className="lg:hidden"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: "8vh",
        padding: "0 28px",
        opacity,
        pointerEvents: "none",
        zIndex: 30,
      }}
    >
      <div
        key={activeIndex}
        style={{
          textAlign: "center",
          animation: "mobile-chapter-fade 0.45s ease",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-din-alternate)",
            fontSize: 11,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.72)",
            marginBottom: 10,
          }}
        >
          - {chapter.eyebrow}
        </div>
        <div
          style={{
            fontFamily: "var(--font-cyrene)",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: 28,
            lineHeight: 1.1,
            color: "#ffffff",
            marginBottom: 12,
            textShadow: "0 8px 24px rgba(0,0,0,0.22)",
          }}
        >
          {chapter.title}.
        </div>
        <div
          style={{
            fontFamily: "var(--font-din-alternate)",
            fontSize: 13.5,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.78)",
            maxWidth: 360,
            margin: "0 auto",
          }}
        >
          {chapter.body}
        </div>
      </div>
      <style>
        {`@keyframes mobile-chapter-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}
      </style>
    </div>
  );
}
