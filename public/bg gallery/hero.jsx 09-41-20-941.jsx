// hero.jsx — Moodboard hero with polaroid scroll stack.
//
// Performance approach:
//   • One scroll listener, one rAF, ZERO React re-renders during scroll.
//   • Scroll handler writes CSS variables directly on a few root nodes
//     (bg layer + each polaroid). All animation reads those vars.
//   • All transforms use translate3d so the compositor handles them on the GPU.
//   • No per-object `filter: drop-shadow` (use box-shadow on rectangles instead).
//   • Single blur on the bg layer — promoted to its own compositor layer once.

const { useEffect, useRef } = React;

// ─────────────────────────────────────────────────────────────────────────────
// Placeholder graphics (same set as before — feel free to swap to <img>)
// ─────────────────────────────────────────────────────────────────────────────

function StripeDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <defs>
        <pattern id="ph-stripe" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(35)">
          <rect width="8" height="8" fill="#ece2d2" />
          <line x1="0" y1="0" x2="0" y2="8" stroke="#d8c8ae" strokeWidth="1" opacity=".55" />
        </pattern>
        <pattern id="ph-stripe-green" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(35)">
          <rect width="8" height="8" fill="#c8cdb2" />
          <line x1="0" y1="0" x2="0" y2="8" stroke="#a9b194" strokeWidth="1" opacity=".55" />
        </pattern>
        <pattern id="ph-stripe-dark" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(35)">
          <rect width="8" height="8" fill="#2a261f" />
          <line x1="0" y1="0" x2="0" y2="8" stroke="#3b362c" strokeWidth="1" opacity=".7" />
        </pattern>
        <pattern id="ph-stripe-cream" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(35)">
          <rect width="8" height="8" fill="#f3ead9" />
          <line x1="0" y1="0" x2="0" y2="8" stroke="#e0d2b3" strokeWidth="1" opacity=".55" />
        </pattern>
      </defs>
    </svg>
  );
}

function PHCard({ w, h, fill = 'ph-stripe', radius = 2, label, rotate = 0 }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <g transform={`rotate(${rotate} ${w / 2} ${h / 2})`}>
        <rect x="2" y="2" width={w - 4} height={h - 4} rx={radius} fill={`url(#${fill})`} />
        <rect x="2" y="2" width={w - 4} height={h - 4} rx={radius} fill="none" stroke="rgba(0,0,0,.15)" strokeWidth=".5" />
        <text x={w / 2} y={h / 2 + 4} textAnchor="middle" fontFamily="ui-monospace, monospace"
              fontSize={Math.min(w, h) > 120 ? 11 : 9} fill="rgba(30,25,15,.55)" letterSpacing=".04em">
          {label}
        </text>
      </g>
    </svg>
  );
}
function PHPolaroid({ w, h, label }) {
  const b = 8;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <rect x="0" y="0" width={w} height={h} fill="#f5efe2" />
      <rect x={b} y={b} width={w - b * 2} height={h - b * 2 - 18} fill="url(#ph-stripe)" />
      <text x={w / 2} y={h - 8} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="9"
            fill="rgba(30,25,15,.55)" letterSpacing=".04em">{label}</text>
    </svg>
  );
}
function PHBranch({ w, h, label, leafy = true }) {
  const sy = h / 2; const leaves = [];
  if (leafy) for (let i = 0; i < 6; i++) {
    const x = (w / 7) * (i + 0.7); const s = i % 2 === 0 ? -1 : 1;
    leaves.push(<ellipse key={i} cx={x} cy={sy + s * 6} rx="14" ry="6" fill="url(#ph-stripe-green)" opacity=".85" transform={`rotate(${s * 18} ${x} ${sy})`} />);
  }
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {leaves}
      <line x1="6" y1={sy} x2={w - 6} y2={sy} stroke="#7a6b4a" strokeWidth="1.5" opacity=".8" />
    </svg>
  );
}
function PHVase({ w, h }) {
  const vt = h * 0.55;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <ellipse cx={w * 0.3} cy={vt - 30} rx="22" ry="14" fill="url(#ph-stripe-green)" opacity=".75" transform={`rotate(-25 ${w * 0.3} ${vt - 30})`} />
      <ellipse cx={w * 0.6} cy={vt - 50} rx="26" ry="14" fill="url(#ph-stripe-green)" opacity=".7" transform={`rotate(20 ${w * 0.6} ${vt - 50})`} />
      <ellipse cx={w * 0.45} cy={vt - 70} rx="20" ry="12" fill="url(#ph-stripe-green)" opacity=".8" transform={`rotate(-5 ${w * 0.45} ${vt - 70})`} />
      <path d={`M ${w * 0.25} ${vt} Q ${w * 0.15} ${h - 20} ${w * 0.3} ${h - 6} L ${w * 0.7} ${h - 6} Q ${w * 0.85} ${h - 20} ${w * 0.75} ${vt} Z`} fill="url(#ph-stripe-cream)" stroke="rgba(0,0,0,.15)" strokeWidth=".5" />
    </svg>
  );
}
function PHRingBox({ w, h }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <rect x={w * 0.1} y="4" width={w * 0.8} height={h * 0.35} fill="#5a4a3a" />
      <rect x={w * 0.12} y="6" width={w * 0.76} height={h * 0.3} fill="#e9dec5" opacity=".6" />
      <rect x="4" y={h * 0.4} width={w - 8} height={h * 0.55} fill="#3a2e22" />
      <rect x="10" y={h * 0.45} width={w - 20} height={h * 0.45} fill="#f1e6cc" opacity=".75" />
      <circle cx={w / 2} cy={h * 0.66} r="8" fill="none" stroke="#c9b083" strokeWidth="2.5" />
      <circle cx={w / 2} cy={h * 0.58} r="2" fill="#e8d5a8" />
    </svg>
  );
}
function PHRing({ w, h }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <ellipse cx={w / 2} cy={h / 2} rx={w * 0.35} ry={h * 0.18} fill="none" stroke="#c9b083" strokeWidth="3.5" />
      <circle cx={w / 2} cy={h / 2 - h * 0.15} r="3.5" fill="#f1e2bd" stroke="#c9b083" strokeWidth=".5" />
    </svg>
  );
}
function PHCitrus({ w, h }) {
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 4;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <circle cx={cx} cy={cy} r={r} fill="#e2b87a" opacity=".75" />
      <circle cx={cx} cy={cy} r={r - 4} fill="#f0d39a" opacity=".6" />
      {[0,1,2,3,4,5,6,7].map(i => { const a = (i/8)*Math.PI*2; return <line key={i} x1={cx} y1={cy} x2={cx+Math.cos(a)*(r-5)} y2={cy+Math.sin(a)*(r-5)} stroke="#b8884a" strokeWidth=".8" opacity=".6"/>; })}
    </svg>
  );
}
function PHBottle({ w, h }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <rect x={w*0.4} y="2" width={w*0.2} height={h*0.15} fill="#c9b890"/>
      <rect x={w*0.35} y={h*0.17} width={w*0.3} height={h*0.08} fill="#8a7c5e"/>
      <rect x={w*0.2} y={h*0.25} width={w*0.6} height={h*0.7} fill="#d8c8a8" opacity=".55" stroke="rgba(0,0,0,.2)" strokeWidth=".5" rx="4"/>
      <rect x={w*0.3} y={h*0.6} width={w*0.4} height={h*0.18} fill="#f3ead9" opacity=".5" rx="1"/>
    </svg>
  );
}
function PHHeel({ w, h }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={`M ${w*0.1} ${h*0.55} Q ${w*0.15} ${h*0.3} ${w*0.5} ${h*0.35} Q ${w*0.85} ${h*0.4} ${w*0.9} ${h*0.55} L ${w*0.85} ${h*0.62} L ${w*0.5} ${h*0.58} Q ${w*0.25} ${h*0.6} ${w*0.12} ${h*0.62} Z`} fill="#f5efe2" stroke="rgba(0,0,0,.18)" strokeWidth=".5"/>
      <line x1={w*0.78} y1={h*0.62} x2={w*0.72} y2={h*0.92} stroke="#d8c8a8" strokeWidth="3"/>
    </svg>
  );
}
function PHPetals({ w, h }) {
  const ps = [[0.2,0.4,14,8,20],[0.5,0.3,16,9,-15],[0.75,0.55,13,7,40],[0.35,0.7,15,8,-30],[0.62,0.75,12,7,10]];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {ps.map(([px,py,rx,ry,r],i) => <ellipse key={i} cx={px*w} cy={py*h} rx={rx} ry={ry} fill="#d9b8a3" opacity=".7" transform={`rotate(${r} ${px*w} ${py*h})`}/>)}
    </svg>
  );
}
function PHRibbon({ w, h }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <rect x="6" y={h*0.2} width={w-12} height={h*0.6} fill="url(#ph-stripe-cream)" rx="3"/>
      <rect x={w*0.42} y="2" width={w*0.16} height={h-4} fill="#b89e6e" opacity=".65"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Object layout (same data as before)
// ─────────────────────────────────────────────────────────────────────────────

const OBJECTS = [
  { id:'inv-tl',       x: 6, y: 4,  w:220, h:260, kind:'card',     label:'INVITATION',  rotate:-8, anim:1,  dur:9,  delay:0,    z:3 },
  { id:'card-tcl',     x:24, y: 3,  w:160, h:110, kind:'card',     label:'CARD',        rotate: 4, anim:2,  dur:11, delay:1.2,  z:4 },
  { id:'flower-tc',    x:40, y: 6,  w:120, h: 90, kind:'branch',   label:'DRIED FLOWER',rotate:12, anim:3,  dur:8,  delay:0.5,  z:5, leafy:false, hideOnMobile:true },
  { id:'card-tcr',     x:54, y: 2,  w:180, h:120, kind:'card-g',   label:'GREEN CARD',  rotate:-3, anim:4,  dur:10, delay:2.0,  z:4 },
  { id:'card-tr',      x:76, y: 4,  w:200, h:180, kind:'card-c',   label:'BEIGE CARD',  rotate: 6, anim:5,  dur:12, delay:0.8,  z:3 },
  { id:'vase-l',       x: 2, y:32,  w:180, h:280, kind:'vase',     label:'VASE',        rotate: 0, anim:6,  dur:11, delay:2.4,  z:2 },
  { id:'polaroid-lu',  x:12, y:22,  w:130, h:150, kind:'polaroid', label:'POLAROID',    rotate:-10,anim:7,  dur:9,  delay:1.8,  z:5 },
  { id:'euca-lm',      x:16, y:46,  w:220, h:110, kind:'branch',   label:'EUCALYPTUS',  rotate:-8, anim:2,  dur:13, delay:3.0,  z:3, leafy:true,  hideOnMobile:true },
  { id:'petals-lm',    x: 4, y:56,  w:150, h:110, kind:'petals',   label:'PETALS',      rotate: 0, anim:8,  dur:10, delay:4.0,  z:4, hideOnMobile:true },
  { id:'ringbox-lb',   x: 6, y:70,  w:170, h:130, kind:'ringbox',  label:'RING BOX',    rotate: 8, anim:9,  dur:9,  delay:0.4,  z:5 },
  { id:'ring-llm',     x:22, y:66,  w: 90, h: 70, kind:'ring',     label:'RING',        rotate:-15,anim:10, dur:8,  delay:2.6,  z:6, hideOnMobile:true },
  { id:'blank-blc',    x:26, y:78,  w:180, h:150, kind:'card',     label:'BLANK CARD',  rotate:-6, anim:11, dur:12, delay:1.0,  z:4 },
  { id:'black-bc',     x:44, y:82,  w:200, h:140, kind:'card-d',   label:'BLACK ENVL',  rotate: 3, anim:12, dur:10, delay:3.5,  z:3 },
  { id:'citrus-bcr',   x:64, y:70,  w: 90, h: 90, kind:'citrus',   label:'CITRUS',      rotate: 0, anim:1,  dur:8,  delay:1.4,  z:5, hideOnMobile:true },
  { id:'menu-rum',     x:76, y:28,  w:170, h:230, kind:'card-c',   label:'MENU STACK',  rotate: 7, anim:5,  dur:11, delay:2.8,  z:3 },
  { id:'ribbon-rm',    x:88, y:22,  w:130, h:200, kind:'ribbon',   label:'RIBBON',      rotate:-6, anim:3,  dur:9,  delay:0.6,  z:4 },
  { id:'paper-roll',   x:74, y:18,  w:300, h:300, kind:'video',    label:'VIDEO',       rotate:-4, anim:5,  dur:11, delay:1.2,  z:6, src:'assets/paper-roll.mp4' },
  { id:'polaroid-rml', x:84, y:50,  w:130, h:160, kind:'polaroid', label:'POLAROID',    rotate:12, anim:7,  dur:12, delay:4.5,  z:5 },
  { id:'heel-rlm',     x:78, y:68,  w:170, h:130, kind:'heel',     label:'HEEL',        rotate: 4, anim:9,  dur:10, delay:1.6,  z:4, hideOnMobile:true },
  { id:'rolls-br',     x:86, y:74,  w:150, h:200, kind:'ribbon',   label:'ROLLS',       rotate:-10,anim:11, dur:11, delay:3.2,  z:3 },
  { id:'bottle-br',    x:90, y:84,  w:110, h:170, kind:'bottle',   label:'BOTTLE',      rotate: 6, anim:4,  dur:9,  delay:2.2,  z:5, hideOnMobile:true },
  { id:'branch-fr',    x:96, y:40,  w: 60, h:320, kind:'branch',   label:'BRANCH',      rotate:78, anim:8,  dur:13, delay:5.0,  z:2, leafy:false, hideOnMobile:true },
];

function renderObject(o, chromaProps) {
  const c = { w: o.w, h: o.h, label: o.label };
  switch (o.kind) {
    case 'card':     return <PHCard {...c} fill="ph-stripe" />;
    case 'card-c':   return <PHCard {...c} fill="ph-stripe-cream" />;
    case 'card-g':   return <PHCard {...c} fill="ph-stripe-green" />;
    case 'card-d':   return <PHCard {...c} fill="ph-stripe-dark" />;
    case 'polaroid': return <PHPolaroid {...c} />;
    case 'branch':   return <PHBranch {...c} leafy={o.leafy !== false} />;
    case 'vase':     return <PHVase {...c} />;
    case 'ringbox':  return <PHRingBox {...c} />;
    case 'ring':     return <PHRing {...c} />;
    case 'citrus':   return <PHCitrus {...c} />;
    case 'ribbon':   return <PHRibbon {...c} />;
    case 'bottle':   return <PHBottle {...c} />;
    case 'heel':     return <PHHeel {...c} />;
    case 'petals':   return <PHPetals {...c} />;
    case 'video':    return <ChromaVideo src={o.src} {...chromaProps} width={o.w} height={o.h} />;
    default:         return <PHCard {...c} />;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Polaroid stack data
// ─────────────────────────────────────────────────────────────────────────────

const PHOTOS = [
  { caption: 'the easy yes',    rotate:  3 },
  { caption: 'our city corner', rotate: -2 },
  { caption: 'coffee, always',  rotate:  2 },
  { caption: 'the night we met',rotate: -3 },
];

// SVG placeholder behind a polaroid — same striped look so it reads as "missing photo"
function PolaroidPlaceholder({ tone = 0 }) {
  const tones = ['#ece2d2', '#e6dcc8', '#e0d2b3', '#d8c8ae'];
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="100" height="100" fill={tones[tone % tones.length]} />
      <g opacity=".35" stroke="#a48a5d" strokeWidth=".4">
        {Array.from({ length: 28 }).map((_, i) => <line key={i} x1="-20" y1={i * 4} x2="120" y2={i * 4 - 50} />)}
      </g>
      <text x="50" y="52" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="6"
            fill="rgba(30,25,15,.55)" letterSpacing=".1em">PHOTO PLACEHOLDER</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────────────────

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "bgTone": "light",
  "warmth": 32,
  "darkness": 8,
  "blur": 1.2,
  "grain": true,
  "vignette": true,
  "speed": 1,
  "stageHeight": 360,
  "bgLift": 90,
  "showHeading": true,
  "chromaColor": "#6cc35f",
  "chromaSim": 0.13,
  "chromaSmooth": 0.08,
  "chromaSpill": 0.6
}/*EDITMODE-END*/;

function clamp(v, a = 0, b = 1) { return v < a ? a : v > b ? b : v; }
function easeOutCubic(t) { return 1 - Math.pow(1 - clamp(t), 3); }
function easeInOut(t) { t = clamp(t); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

// Deterministic pseudo-random from object identity, so each object gets a
// stable, unique scroll profile. We use this to derive per-object x/y/rotate
// travel — that's what makes the motion feel like a living moodboard instead
// of one block translating together.
function rand(seed, mul = 1) {
  const x = Math.sin(seed * mul) * 43758.5453;
  return x - Math.floor(x);
}
function scrollProfile(o, i) {
  const seed = i * 17 + o.anim * 7 + o.z * 11 + o.dur;
  const depth = (o.z - 2) / 4;                       // 0..1 (0 = far, 1 = near)
  // Vertical travel — foreground objects travel more than background.
  // Most objects drift UP (negative). A few tip downward for variety.
  const baseY = -(50 + depth * 70);                  // -50..-120
  const flip = rand(seed, 1.3) > 0.85 ? -1 : 1;      // ~15% flip direction
  const variance = (rand(seed, 2.7) - 0.5) * 50;     // ±25 px
  const sy = (baseY + variance) * flip;
  // Slight horizontal drift, smaller for background
  const sx = (rand(seed, 3.1) - 0.5) * (16 + depth * 22);
  // Tiny extra rotate on top of breathing
  const sr = (rand(seed, 4.3) - 0.5) * 4;            // ±2 deg
  // Per-object easing curve power — some respond faster, some slower
  return { sx: +sx.toFixed(2), sy: +sy.toFixed(2), sr: +sr.toFixed(2) };
}

function Hero() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const stackRef = useRef(null);
  const headingRef = useRef(null);
  const introRef = useRef(null);

  // ── Scroll loop — ZERO React re-renders ────────────────────────────────
  // We read scrollY once per frame (rAF-batched), then poke transforms
  // and CSS vars directly onto the DOM nodes. Polaroid stack uses the same
  // loop so everything stays perfectly in sync.
  useEffect(() => {
    const stage = stageRef.current;
    const layer = layerRef.current;
    const stack = stackRef.current;
    const heading = headingRef.current;
    const intro = introRef.current;
    if (!stage || !layer || !stack) return;

    const polaroids = Array.from(stack.querySelectorAll('.polaroid'));
    const N = polaroids.length;
    let raf = 0;

    // Bg lift intensity — scales every per-object travel value uniformly.
    const liftScale = t.bgLift / 90;   // 90 is the design-default

    const update = () => {
      const rect = stage.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = clamp(-rect.top / Math.max(total, 1));

      // Cinematic eased progress. The layer reads --p and each object's
      // calc()s use it with their own --sx/--sy/--sr. ONE DOM write covers
      // every object — perfectly cheap regardless of object count.
      const ep = easeInOut(p) * liftScale;
      layer.style.setProperty('--p', ep.toFixed(4));

      // Intro/heading fade
      if (intro)   intro.style.opacity   = `${clamp(1 - p * 6)}`;
      if (heading) {
        const headingP = easeInOut(clamp(p / 0.25));
        const hs = 1 - headingP * 0.14;          // scale down
        const hy = headingP * -16;               // drift up a touch
        const ho = 1 - clamp((p - 0.92) / 0.08) * 0.8;
        heading.style.transform = `translate3d(0, ${hy.toFixed(2)}px, 0) scale(${hs.toFixed(3)})`;
        heading.style.opacity = `${ho.toFixed(3)}`;
      }

      // Polaroid stack — each polaroid has a "reveal" window then drifts back
      // as the next one comes in. All transforms via translate3d.
      const start = 0.18;
      const end   = 0.92;
      const span  = end - start;
      const vh    = window.innerHeight;
      polaroids.forEach((el, i) => {
        const slotStart = start + span * (i / N);
        const slotMid   = start + span * ((i + 0.65) / N);
        const slotEnd   = start + span * ((i + 1) / N);

        const reveal = easeOutCubic((p - slotStart) / Math.max(slotMid - slotStart, 1e-4));
        const pushBack = clamp((p - slotMid) / Math.max(slotEnd - slotMid, 1e-4));

        // travels from below the viewport to centre, then drifts up a little
        // and tilts/blurs while next one comes in.
        const fromY = vh * 0.55;
        const baseY = -i * 6;                         // small stack offset
        const driftY = -pushBack * 18 - reveal * 0; // (kept simple)
        const ty = fromY * (1 - reveal) + baseY + driftY;
        const tx = (i % 2 === 0 ? -1 : 1) * 14 * (1 - reveal) + (i - (N - 1) / 2) * 6;
        const rot = (PHOTOS[i].rotate * 1.4) * (1 - reveal) + PHOTOS[i].rotate - pushBack * 1.2 * (i % 2 ? 1 : -1);
        const scale = 0.94 + reveal * 0.06 - pushBack * 0.015;
        const op = clamp(reveal * 1.4) * (1 - pushBack * 0.15);

        el.style.opacity = op.toFixed(3);
        el.style.zIndex = String(100 + i + (pushBack < 0.9 ? 1000 : 0));
        el.style.transform =
          `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) ` +
          `rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      });
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; update(); });
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [t.bgLift]);

  // Background color — light or dark mode
  const isLight = t.bgTone === 'light';
  const bgL = isLight
    ? 0.94 - (t.darkness / 100) * 0.25                    // 0.94 → 0.69
    : 0.32 - (t.darkness / 100) * 0.18;
  const bgC = isLight ? 0.005 + (t.warmth / 100) * 0.008 : 0.06 + (t.warmth / 100) * 0.02;
  const bgH = isLight ? 70 + (t.warmth / 100) * 20 : 250 + (t.warmth / 100) * 8;
  const bg = `oklch(${bgL} ${bgC} ${bgH})`;

  // Overlay tone follows the bg — light overlay on light bg, dark on dark.
  const overlayColor = isLight
    ? `rgba(120,110,90,${t.darkness / 200})`           // subtle warm darken
    : `rgba(6,10,28,${t.darkness / 100})`;
  // Text colour follows the bg
  const fg = isLight ? '#2a2620' : '#f6efe1';

  const chromaProps = {
    keyColor: t.chromaColor,
    similarity: t.chromaSim,
    smoothness: t.chromaSmooth,
    spill: t.chromaSpill,
  };

  return (
    <React.Fragment>
      <div className="scroll-stage" ref={stageRef} style={{ height: `${t.stageHeight}vh` }}>
        <section className={`hero hero--${t.bgTone}`} style={{ background: bg, color: fg }}>
          <StripeDefs />

          <div className="hero__wash" />

          {/* Bg layer — root var only (`--p`). Each child computes its own
              motion from its own --sx/--sy/--sr constants. */}
          <div className="hero__layer" ref={layerRef} style={{ filter: `blur(${t.blur}px)` }}>
            {OBJECTS.map((o, i) => {
              const prof = scrollProfile(o, i);
              return (
                <div
                  key={o.id}
                  className={`obj-parallax ${o.hideOnMobile ? 'obj--hide-mobile' : ''}`}
                  style={{
                    left: `${o.x}%`,
                    top: `${o.y}%`,
                    width: o.w,
                    height: o.h,
                    zIndex: o.z,
                    ['--sx']: prof.sx,
                    ['--sy']: prof.sy,
                    ['--sr']: prof.sr,
                  }}
                >
                  <div
                    className={`obj obj--anim${o.anim}`}
                    style={{
                      ['--rot']: `${o.rotate}deg`,
                      animationDuration: `${o.dur / t.speed}s`,
                      animationDelay: `${-o.delay}s`,
                    }}
                  >
                    <div className="obj__inner">{renderObject(o, chromaProps)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hero__overlay" style={{ background: overlayColor }} />
          {t.vignette && <div className="hero__vignette" />}
          {t.grain && <div className="hero__grain" />}

          {/* Intro text */}
          {t.showHeading && (
            <div className="intro" ref={introRef}>
              <span className="intro__eyebrow">you are cordially invited</span>
              <span className="intro__sub">to celebrate the story of…</span>
            </div>
          )}

          {/* Big heading */}
          {t.showHeading && (
            <h1 className="heading" ref={headingRef}>Gallery</h1>
          )}

          {/* Polaroid stack — fixed at center, scroll drives transforms */}
          <div className="stack" ref={stackRef}>
            {PHOTOS.map((p, i) => (
              <article key={i} className="polaroid" style={{ zIndex: 100 + i }}>
                <div className="polaroid__photo">
                  <PolaroidPlaceholder tone={i} />
                </div>
                <div className="polaroid__caption">{p.caption}</div>
              </article>
            ))}
          </div>

          {/* Progress dots */}
          <div className="dots">
            {PHOTOS.map((_, i) => <span key={i} className="dot" data-i={i} />)}
          </div>

          {/* Footer links */}
          <footer className="hero__foot">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms &amp; Conditions</a>
          </footer>

          {/* Tweaks */}
          <TweaksPanel title="Tweaks">
            <TweakSection label="Atmosphere" />
            <TweakRadio  label="Tone"     value={t.bgTone} options={['light','dark']} onChange={v => setTweak('bgTone', v)} />
            <TweakSlider label="Warmth"   value={t.warmth}   min={0} max={100} unit="%" onChange={v => setTweak('warmth', v)} />
            <TweakSlider label="Contrast" value={t.darkness} min={0} max={70}  unit="%" onChange={v => setTweak('darkness', v)} />
            <TweakSlider label="Blur"     value={t.blur}     min={0} max={4}   step={0.1} unit="px" onChange={v => setTweak('blur', v)} />
            <TweakToggle label="Vignette" value={t.vignette} onChange={v => setTweak('vignette', v)} />
            <TweakToggle label="Grain"    value={t.grain}    onChange={v => setTweak('grain', v)} />

            <TweakSection label="Motion" />
            <TweakSlider label="Breathe speed" value={t.speed}       min={0.3} max={2.5} step={0.1} unit="×" onChange={v => setTweak('speed', v)} />
            <TweakSlider label="BG lift"       value={t.bgLift}      min={0}   max={200} step={5}  unit="px" onChange={v => setTweak('bgLift', v)} />
            <TweakSlider label="Scroll length" value={t.stageHeight} min={200} max={600} step={20} unit="vh" onChange={v => setTweak('stageHeight', v)} />

            <TweakSection label="Chroma key" />
            <TweakColor  label="Key color"  value={t.chromaColor} options={['#6cc35f', '#3ba943', '#1c8c2c', '#00ff00', '#00b8ff']} onChange={v => setTweak('chromaColor', v)} />
            <TweakSlider label="Similarity" value={t.chromaSim}    min={0} max={1} step={0.01} onChange={v => setTweak('chromaSim', v)} />
            <TweakSlider label="Smoothness" value={t.chromaSmooth} min={0} max={0.5} step={0.005} onChange={v => setTweak('chromaSmooth', v)} />
            <TweakSlider label="Spill fix"  value={t.chromaSpill}  min={0} max={1} step={0.01} onChange={v => setTweak('chromaSpill', v)} />

            <TweakSection label="Content" />
            <TweakToggle label="Show heading" value={t.showHeading} onChange={v => setTweak('showHeading', v)} />
          </TweaksPanel>
        </section>
      </div>

      <section className="after">
        <div className="after__inner">
          <span className="after__eyebrow">REFERENCE · NEXT SECTION</span>
          <h2>The story continues here.</h2>
          <p>This is a reference for the sticky polaroid-stack hero. Above: <code>position:&nbsp;sticky</code> for the scroll-stage height, with the polaroid stack and the background driven by the same scroll loop. The background does a slow inverted-parallax lift (scroll down → bg up, scroll up → bg down).</p>
        </div>
      </section>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Hero />);
