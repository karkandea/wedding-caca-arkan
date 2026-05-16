/* global React, ReactDOM, DesignCanvas, DCSection, DCArtboard, HeroPhoto, HeroNav, CoupleName, HeroChrome, Annotation */
const { useMemo } = React;

const FRAME_W = 1280;
const FRAME_H = 720;

/* The 5 side photos that appear during scroll, with their FINAL positions
 * (relative to a 1280x720 frame) — used to interpolate from off-screen entry. */
const SIDE_PHOTOS = [
  { id: "tl", tone: "sunset",  label: "left top",     fx: 80,    fy: 130, fw: 320, fh: 220, rot: -2,  enterFrom: "left",  appearAt: 0.35 },
  { id: "bl", tone: "bw",      label: "left bottom",  fx: 165,   fy: 410, fw: 290, fh: 200, rot:  2,  enterFrom: "left",  appearAt: 0.55 },
  { id: "tr", tone: "cliff",   label: "right top",    fx: 880,   fy: 230, fw: 300, fh: 200, rot:  2,  enterFrom: "right", appearAt: 0.45 },
  { id: "br", tone: "rocks",   label: "right bottom", fx: 920,   fy: 470, fw: 280, fh: 220, rot: -3,  enterFrom: "right", appearAt: 0.65 },
];

/* For the hero (main) photo, define INITIAL fullbleed state and FINAL collage state */
const HERO_INITIAL = { x: 0,   y: 0,   w: 1280, h: 720, radius: 0  };
const HERO_FINAL   = { x: 380, y: 90,  w: 540,  h: 540, radius: 32 };

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => 1 - Math.pow(1 - clamp(t), 3);
const easeInOut = (t) => { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

/* Compute a side photo's transform at scroll progress p (0..1) */
function sidePhotoStyle(ph, p) {
  const t = clamp((p - ph.appearAt) / (1 - ph.appearAt));
  const e = ease(t);
  const offX = ph.enterFrom === "left" ? -ph.fw - 60 : FRAME_W + 60;
  const x = lerp(offX, ph.fx, e);
  const y = ph.fy + lerp(20, 0, e);
  const sc = lerp(0.94, 1, e);
  const op = e;
  const rot = lerp(ph.rot * 1.6, ph.rot, e);
  return {
    position: "absolute",
    left: x,
    top: y,
    width: ph.fw,
    height: ph.fh,
    opacity: op,
    transform: `scale(${sc}) rotate(${rot}deg)`,
    transformOrigin: "50% 50%",
  };
}

/* Compute the hero photo style at scroll progress p */
function heroPhotoStyle(p) {
  const e = easeInOut(p);
  return {
    position: "absolute",
    left: lerp(HERO_INITIAL.x, HERO_FINAL.x, e),
    top: lerp(HERO_INITIAL.y, HERO_FINAL.y, e),
    width: lerp(HERO_INITIAL.w, HERO_FINAL.w, e),
    height: lerp(HERO_INITIAL.h, HERO_FINAL.h, e),
    borderRadius: lerp(HERO_INITIAL.radius, HERO_FINAL.radius, e),
  };
}

/* The fixed cream "stage" in which the keyframe is rendered. */
function HeroFrame({ progress, showChrome = true, showNav = true }) {
  const heroStyle = heroPhotoStyle(progress);
  const nameOpacity = clamp(1 - progress * 1.6);
  const nameScale = lerp(1, 0.78, ease(progress));
  // hero radius — note borderRadius lives on the wrapper so HeroPhoto fills via inset:0
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      background: "var(--cream-warm)",
      overflow: "hidden",
    }}>
      {/* Hero (main) photo */}
      <div style={{ ...heroStyle, position: "absolute", overflow: "hidden", borderRadius: heroStyle.borderRadius }}>
        <HeroPhoto tone="mountain" radius={heroStyle.borderRadius} />
        {/* couple name lives over the hero image so it scales with it */}
        <CoupleName scale={nameScale} opacity={nameOpacity} />
        {/* chrome (scroll line + arrow) only visible early */}
        {showChrome && progress < 0.3 && <HeroChrome opacity={1 - progress / 0.3} />}
      </div>

      {/* Side photos */}
      {SIDE_PHOTOS.map((ph) => {
        const s = sidePhotoStyle(ph, progress);
        if (s.opacity <= 0.001) return null;
        return (
          <div key={ph.id} style={{ ...s, overflow: "hidden", borderRadius: 24 }}>
            <HeroPhoto tone={ph.tone} radius={24} label={ph.label} />
          </div>
        );
      })}

      {/* Nav floats over everything */}
      {showNav && <HeroNav />}
    </div>
  );
}

/* Each artboard wraps a HeroFrame at a specific progress with annotation above. */
function Frame({ progress, note }) {
  return (
    <div style={{
      position: "relative",
      width: FRAME_W,
      height: FRAME_H + 60,
      background: "var(--cream-warm)",
    }}>
      {note && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 60,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: "var(--sans)",
          fontSize: 12.5,
          color: "var(--ink-soft)",
          borderBottom: "1px dashed rgba(43,36,29,0.12)",
        }}>
          <div style={{
            background: "var(--ink)",
            color: "var(--cream)",
            padding: "4px 10px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.08em",
            flexShrink: 0,
          }}>scroll {Math.round(progress * 100)}%</div>
          <div>{note}</div>
        </div>
      )}
      <div style={{
        position: "absolute",
        top: 60, left: 0,
        width: FRAME_W,
        height: FRAME_H,
        overflow: "hidden",
      }}>
        <HeroFrame progress={progress} />
      </div>
    </div>
  );
}

/* Mobile frame variants (vertical collage) */
const MFRAME_W = 390;
const MFRAME_H = 780;

function MobileFrame({ progress }) {
  const e = easeInOut(progress);
  // hero photo: full bleed -> top center collage piece
  const hStyle = {
    position: "absolute",
    left: lerp(0, 24, e),
    top: lerp(0, 110, e),
    width: lerp(MFRAME_W, MFRAME_W - 48, e),
    height: lerp(MFRAME_H, 360, e),
    borderRadius: lerp(0, 22, e),
    overflow: "hidden",
  };
  const nameOp = clamp(1 - progress * 1.7);
  const nameSc = lerp(1, 0.75, e);

  // 2 stacked photos below
  const stackPhotos = [
    { tone: "sunset", appear: 0.45, top: 490, h: 130 },
    { tone: "bw",     appear: 0.65, top: 630, h: 130 },
  ];

  return (
    <div style={{
      position: "relative",
      width: MFRAME_W,
      height: MFRAME_H,
      background: "var(--cream-warm)",
      overflow: "hidden",
    }}>
      <div style={hStyle}>
        <HeroPhoto tone="mountain" radius={hStyle.borderRadius} />
        <div style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) scale(${nameSc})`,
          opacity: nameOp,
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: "clamp(36px, 14vw, 72px)",
          color: "rgba(255,255,255,0.96)",
          textShadow: "0 2px 22px rgba(0,0,0,0.22)",
          whiteSpace: "nowrap",
        }}>Salsa &amp; Arkan</div>
      </div>

      {stackPhotos.map((p, i) => {
        const t = clamp((progress - p.appear) / (1 - p.appear));
        const ee = ease(t);
        if (ee <= 0.01) return null;
        return (
          <div key={i} style={{
            position: "absolute",
            left: 24,
            right: 24,
            top: p.top + lerp(20, 0, ee),
            height: p.h,
            borderRadius: 18,
            overflow: "hidden",
            opacity: ee,
            transform: `scale(${lerp(0.96, 1, ee)})`,
          }}>
            <HeroPhoto tone={p.tone} radius={18} />
          </div>
        );
      })}

      {/* mini nav */}
      <div style={{
        position: "absolute",
        top: 14,
        left: 14, right: 14,
        background: "rgba(255,252,245,0.85)",
        backdropFilter: "blur(12px)",
        borderRadius: 999,
        padding: "6px 6px 6px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 5,
        boxShadow: "0 4px 14px rgba(43,36,29,0.08)",
      }}>
        <span style={{ fontFamily: "var(--serif-display)", fontSize: 14 }}>S&amp;A</span>
        <button style={{
          background: "var(--ink)",
          color: "var(--cream)",
          border: 0,
          borderRadius: 999,
          padding: "6px 12px",
          fontSize: 11,
          fontWeight: 500,
        }}>RSVP</button>
      </div>
    </div>
  );
}

/* App: design canvas with sections */
const FRAMES = [
  { id: "f1", label: "01 · Hero Initial",       p: 0.0,  note: "Full-bleed hero. Name dominant. Nav + scroll affordance visible." },
  { id: "f2", label: "02 · Sticky Start",       p: 0.18, note: "Sticky activates. Hero starts gentle scale-down. Name softens slightly." },
  { id: "f3", label: "03 · First Left Photo",   p: 0.4,  note: "Sunset photo enters from the left. Hero recedes ~25%." },
  { id: "f4", label: "04 · Both Sides Active",  p: 0.55, note: "Right cliff photo enters. Left b&w photo follows. Name fading hard." },
  { id: "f5", label: "05 · Transition",         p: 0.78, note: "All four side photos in motion toward final spots. Name almost gone." },
  { id: "f6", label: "06 · Final Collage",      p: 1.0,  note: "Editorial layout settled. Hero is centerpiece, 4 photos around it." },
];

const M_FRAMES = [
  { id: "m1", label: "M-01 · Hero", p: 0.0 },
  { id: "m2", label: "M-02 · Scaling", p: 0.35 },
  { id: "m3", label: "M-03 · 1st Stack", p: 0.55 },
  { id: "m4", label: "M-04 · Final", p: 1.0 },
];

function App() {
  return (
    <DesignCanvas>
      <DCSection id="desktop" title="Salsa & Arkan — Hero" subtitle="Scroll-reveal photo collage · 6 desktop keyframes">
        {FRAMES.map((f) => (
          <DCArtboard key={f.id} id={f.id} label={f.label} width={FRAME_W} height={FRAME_H + 60}>
            <Frame progress={f.p} note={f.note} />
          </DCArtboard>
        ))}
      </DCSection>

      <DCSection id="mobile" title="Mobile" subtitle="Vertical collage — simpler reveal, photos stack below the hero">
        {M_FRAMES.map((f) => (
          <DCArtboard key={f.id} id={f.id} label={f.label} width={MFRAME_W} height={MFRAME_H}>
            <MobileFrame progress={f.p} />
          </DCArtboard>
        ))}
      </DCSection>

      <DCSection id="motion" title="Motion notes" subtitle="What animates between frames">
        <DCArtboard id="notes" label="Animation choreography" width={760} height={520}>
          <div style={{
            padding: 36,
            fontFamily: "var(--sans)",
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--ink)",
            background: "var(--cream-warm)",
            height: "100%",
          }}>
            <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontWeight: 500, fontSize: 30, marginBottom: 18, lineHeight: 1.1 }}>
              choreography
            </div>
            {[
              ["Hero photo", "Full-bleed (1280×720, radius 0) → centerpiece (540×540, radius 32). easeInOut. Anchors the layout throughout."],
              ["Couple name", "opacity 1 → 0 by ~60% scroll. scale 1 → 0.78 to feel like it's settling back as the photos take focus."],
              ["Left top (sunset)", "Enters from left at 35%. translateX off-screen → 80px. fade + scale 0.94 → 1, rotate −3° → −2°."],
              ["Left bottom (b&w)", "Enters from left at 55%, slightly lower. Same ease, rotate +3° → +2°."],
              ["Right top (cliff)", "Enters from right at 45%. Smaller photo, sits offset toward upper right."],
              ["Right bottom (rocks)", "Enters from right at 65%. Largest right-side photo, anchors the bottom of the collage."],
              ["Nav", "Stays floating; never animates. Pill background fades from glass on photo to opaque on cream."],
              ["Mobile", "Vertical: hero scales to top card, two more photos stack below. No left/right entry — fade + slight Y."],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 150, flexShrink: 0, fontWeight: 600, color: "var(--ink)" }}>{k}</div>
                <div style={{ color: "var(--ink-soft)" }}>{v}</div>
              </div>
            ))}
          </div>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
