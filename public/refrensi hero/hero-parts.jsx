/* global React */
const { useMemo } = React;

const COUPLE = "Salsa & Arkan";

/* Photo placeholder — realistic-feeling gradient with subtle scene */
function HeroPhoto({ tone = "mountain", label, radius = 28, dim = 0 }) {
  const palettes = {
    mountain: { sky: "oklch(0.78 0.06 230)", mid: "oklch(0.6 0.07 145)", ground: "oklch(0.42 0.06 130)" },
    sunset:   { sky: "oklch(0.72 0.12 50)",  mid: "oklch(0.55 0.15 35)",  ground: "oklch(0.32 0.07 30)" },
    bw:       { sky: "oklch(0.78 0 0)",       mid: "oklch(0.42 0 0)",      ground: "oklch(0.22 0 0)" },
    cliff:    { sky: "oklch(0.74 0.05 215)", mid: "oklch(0.48 0.05 200)", ground: "oklch(0.34 0.04 210)" },
    forest:   { sky: "oklch(0.78 0.08 140)", mid: "oklch(0.5 0.08 145)",  ground: "oklch(0.28 0.05 140)" },
    rocks:    { sky: "oklch(0.72 0.04 60)",  mid: "oklch(0.5 0.06 55)",   ground: "oklch(0.34 0.07 45)" },
  };
  const p = palettes[tone] || palettes.mountain;
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      borderRadius: radius,
      overflow: "hidden",
      background: `linear-gradient(180deg, ${p.sky} 0%, ${p.mid} 55%, ${p.ground} 100%)`,
      boxShadow: "0 12px 32px rgba(43,36,29,0.10), 0 1px 2px rgba(43,36,29,0.06)",
    }}>
      {/* mountain silhouette */}
      <svg viewBox="0 0 200 120" preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.85 }}>
        <polygon points="0,90 30,55 55,75 80,30 110,65 140,40 170,70 200,55 200,120 0,120" fill="rgba(255,255,255,0.18)" />
        <polygon points="0,100 25,75 60,85 90,55 120,80 150,60 180,80 200,72 200,120 0,120" fill="rgba(0,0,0,0.18)" />
      </svg>
      {/* couple silhouette */}
      <div style={{
        position: "absolute",
        bottom: "15%",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 10,
        alignItems: "flex-end",
      }}>
        <div style={{ width: 14, height: 38, background: "rgba(40,30,22,0.5)", borderRadius: "40% 40% 20% 20%" }} />
        <div style={{ width: 14, height: 42, background: "rgba(60,40,30,0.5)", borderRadius: "40% 40% 20% 20%" }} />
      </div>
      {/* film grain */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)",
        backgroundSize: "3px 3px, 5px 5px",
        mixBlendMode: "overlay",
      }} />
      {/* dim overlay */}
      {dim > 0 && (
        <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${dim})` }} />
      )}
      {/* tiny tone label, helps explain to dev which slot is which */}
      {label && (
        <div style={{
          position: "absolute",
          top: 10,
          left: 12,
          fontFamily: "var(--sans)",
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.85)",
          mixBlendMode: "difference",
          opacity: 0.7,
          fontWeight: 500,
        }}>{label}</div>
      )}
    </div>
  );
}

/* floating pill nav */
function HeroNav({ width = 720 }) {
  return (
    <div style={{
      position: "absolute",
      top: 18,
      left: "50%",
      transform: "translateX(-50%)",
      width: `min(${width}px, calc(100% - 32px))`,
      background: "rgba(255, 252, 245, 0.85)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      border: "1px solid rgba(43,36,29,0.06)",
      borderRadius: 999,
      padding: "8px 8px 8px 22px",
      boxShadow: "0 6px 20px rgba(43,36,29,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 10,
    }}>
      <span style={{ fontFamily: "var(--serif-display)", fontSize: 18 }}>S&amp;A</span>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <span style={navItem}>Travel Logistics</span>
        <span style={navItem}>Registry</span>
        <span style={navItem}>FAQ</span>
        <button style={{
          background: "var(--ink)",
          color: "var(--cream)",
          border: 0,
          borderRadius: 999,
          padding: "8px 16px",
          fontFamily: "var(--sans)",
          fontSize: 12.5,
          fontWeight: 500,
          cursor: "pointer",
        }}>Submit RSVP</button>
      </div>
    </div>
  );
}
const navItem = { fontFamily: "var(--sans)", fontSize: 12.5, color: "var(--ink)" };

/* couple name script */
function CoupleName({ scale = 1, opacity = 1, color = "rgba(255,255,255,0.96)" }) {
  return (
    <div style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: `translate(-50%, -50%) scale(${scale})`,
      opacity,
      pointerEvents: "none",
      textAlign: "center",
      width: "92%",
      transition: "opacity 0.3s ease",
    }}>
      <h1 style={{
        margin: 0,
        fontFamily: "var(--serif)",
        fontStyle: "italic",
        fontWeight: 500,
        fontSize: "clamp(64px, 13vw, 200px)",
        lineHeight: 0.95,
        letterSpacing: "-0.01em",
        color,
        textShadow: "0 2px 30px rgba(0,0,0,0.18)",
        whiteSpace: "nowrap",
      }}>{COUPLE}</h1>
    </div>
  );
}

/* scroll affordances at bottom of hero */
function HeroChrome({ opacity = 1 }) {
  return (
    <div style={{
      position: "absolute",
      left: 0, right: 0, bottom: 0,
      padding: "0 36px 28px",
      opacity,
      pointerEvents: "none",
      transition: "opacity 0.3s ease",
    }}>
      <div style={{
        height: 1,
        background: "rgba(255,255,255,0.5)",
        marginBottom: 14,
      }} />
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "rgba(255,255,255,0.85)",
        fontFamily: "var(--sans)",
        fontSize: 11,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
      }}>
        <span style={{ fontSize: 18 }}>↓</span>
        <span>scroll to explore</span>
      </div>
    </div>
  );
}

/* annotation note for keyframes */
function Annotation({ children, scrollPct }) {
  return (
    <div style={{
      position: "absolute",
      top: -52,
      left: 0,
      right: 0,
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontFamily: "var(--sans)",
      fontSize: 11,
      color: "var(--ink-soft)",
      letterSpacing: "0.04em",
    }}>
      {scrollPct != null && (
        <div style={{
          background: "var(--ink)",
          color: "var(--cream)",
          padding: "3px 8px",
          borderRadius: 999,
          fontSize: 10.5,
          fontWeight: 500,
          letterSpacing: "0.08em",
        }}>scroll {scrollPct}%</div>
      )}
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

Object.assign(window, { HeroPhoto, HeroNav, CoupleName, HeroChrome, Annotation, COUPLE });
