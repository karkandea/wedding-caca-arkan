"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type StoryCard = {
  side: "left" | "right";
  tilt: string;
  stamp: string;
  caption: string;
  chapter: string;
  date: string;
  title: ReactNode;
  body: string;
  place: string;
  image: string;
};

const TORN_PAPER = "/our%20story%20refrensi/assets/torn-paper.png";
const SKY = "/sky%20our%20story.png";

const STORY_CARDS: StoryCard[] = [
  {
    side: "left",
    tilt: "-2.2deg",
    stamp: "01 · Where it began",
    caption: "first hello",
    chapter: "i. The Meeting",
    date: "Chapter One",
    title: (
      <>
        A simple hello that became <em>everything</em>.
      </>
    ),
    body:
      "Some stories begin loudly. Ours began softly, in the kind of moment that felt ordinary until we kept remembering it.",
    place: "Salsa & Arkan",
    image: "/hero/photo-left.jpeg",
  },
  {
    side: "right",
    tilt: "1.8deg",
    stamp: "02 · First date",
    caption: "a long conversation",
    chapter: "ii. The First Date",
    date: "Chapter Two",
    title: (
      <>
        Time moved slowly, then all at <em>once</em>.
      </>
    ),
    body:
      "Dinner turned into another plan, another walk, another reason to stay a little longer. We were already choosing each other in small ways.",
    place: "The beginning",
    image: "/hero/photo-right.jpeg",
  },
  {
    side: "left",
    tilt: "-1.4deg",
    stamp: "03 · The journey",
    caption: "growing together",
    chapter: "iii. Our Adventure",
    date: "Chapter Three",
    title: (
      <>
        We learned the shape of <em>home</em>.
      </>
    ),
    body:
      "Through ordinary days and milestone nights, love became less about grand gestures and more about showing up with patience, laughter, and care.",
    place: "Everyday love",
    image: "/hero/photo-center.png",
  },
  {
    side: "right",
    tilt: "2.4deg",
    stamp: "04 · Today",
    caption: "the next chapter",
    chapter: "iv. Forever",
    date: "Chapter Four",
    title: (
      <>
        And now, the best part is <em>ahead</em>.
      </>
    ),
    body:
      "This celebration is not just where the story lands. It is where a new chapter begins, surrounded by everyone who helped us get here.",
    place: "Save the date",
    image: "/hero/photo-kedua.png",
  },
];

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export default function OurStorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const trackPathRef = useRef<SVGPathElement>(null);
  const progressPathRef = useRef<SVGPathElement>(null);
  const maskPathRef = useRef<SVGPathElement>(null);
  const ringCanvasRef = useRef<HTMLDivElement>(null);
  const ringProgressRef = useRef(0);
  const ring1StateRef = useRef({ rotX: 0, rotZ: 0, posX: 0, posZ: 0 });
  const ring2StateRef = useRef({ rotY: 0, rotX: 0, posX: 0, posZ: 0 });

  useEffect(() => {
    const section = sectionRef.current;
    const cardsWrap = cardsRef.current;
    const rail = railRef.current;
    const svg = svgRef.current;
    const trackPath = trackPathRef.current;
    const progressPath = progressPathRef.current;
    const maskPath = maskPathRef.current;
    if (!section || !cardsWrap || !rail || !svg || !trackPath || !progressPath || !maskPath) return;

    let frameId = 0;
    let pathLength = 1;
    const cards = Array.from(cardsWrap.querySelectorAll<HTMLElement>("[data-story-card]"));
    const dots = Array.from(section.querySelectorAll<HTMLElement>("[data-story-dot]"));

    const setVisible = (card: HTMLElement, visible: boolean) => {
      card.classList.toggle("is-visible", visible);
      const index = Number(card.dataset.idx);
      dots[index]?.classList.toggle("on", visible);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setVisible(entry.target as HTMLElement, entry.isIntersecting));
      },
      { root: null, rootMargin: "-18% 0px -18% 0px", threshold: 0 },
    );

    cards.forEach((card) => observer.observe(card));

    const updateScroll = () => {
      frameId = 0;
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const start = viewportHeight * 0.6;
      const end = -rect.height + viewportHeight * 0.4;
      const progress = clamp((rect.top - start) / (end - start));

      ringProgressRef.current = progress;
      maskPath.style.strokeDashoffset = (pathLength * (1 - progress)).toFixed(2);
    };

    const scheduleScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateScroll);
    };

    const buildPath = () => {
      const wrapRect = cardsWrap.getBoundingClientRect();
      const width = wrapRect.width;
      const height = cardsWrap.scrollHeight;
      const isNarrow = width < 820;

      rail.style.top = `${cardsWrap.offsetTop}px`;
      rail.style.width = `${width}px`;
      rail.style.height = `${height}px`;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.setAttribute("width", String(width));
      svg.setAttribute("height", String(height));

      const anchors = [{ x: width * 0.5, y: 0 }];
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const y = rect.top - wrapRect.top + rect.height * 0.5;
        const amplitude = isNarrow ? 0.62 : 0.72;
        const x = card.classList.contains("left")
          ? width * (0.5 + (amplitude - 0.5))
          : width * (0.5 - (amplitude - 0.5));
        anchors.push({ x, y });
      });
      anchors.push({ x: width * 0.5, y: height });

      let path = `M ${anchors[0].x.toFixed(1)} ${anchors[0].y.toFixed(1)}`;
      for (let index = 1; index < anchors.length; index += 1) {
        const previous = anchors[index - 1];
        const current = anchors[index];
        const midY = (previous.y + current.y) / 2;
        path += ` C ${previous.x.toFixed(1)} ${midY.toFixed(1)}, ${current.x.toFixed(1)} ${midY.toFixed(
          1,
        )}, ${current.x.toFixed(1)} ${current.y.toFixed(1)}`;
      }

      trackPath.setAttribute("d", path);
      progressPath.setAttribute("d", path);
      maskPath.setAttribute("d", path);
      pathLength = maskPath.getTotalLength();
      maskPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
      updateScroll();
    };

    const resizeObserver = new ResizeObserver(buildPath);
    resizeObserver.observe(cardsWrap);
    window.addEventListener("scroll", scheduleScroll, { passive: true });
    window.addEventListener("resize", buildPath);
    window.requestAnimationFrame(() => window.requestAnimationFrame(buildPath));

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", scheduleScroll);
      window.removeEventListener("resize", buildPath);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    const container = ringCanvasRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 11);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment()).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.28;
    pmremGenerator.dispose();

    scene.add(new THREE.AmbientLight("#ffffff", 0.07));

    const keyLight = new THREE.DirectionalLight("#fff4e6", 1.65);
    keyLight.position.set(4.5, 5.5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight("#d9a56f", 0.42, 18);
    fillLight.position.set(-3.5, -2.2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight("#8fb7ff", 0.45);
    rimLight.position.set(-3, 2.5, -2);
    scene.add(rimLight);

    const ring1Mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#c8c8c8"),
      metalness: 0.85,
      roughness: 0.2,
      envMapIntensity: 1.8,
    });

    const ring2Mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#c8c8c8"),
      metalness: 0.85,
      roughness: 0.2,
      envMapIntensity: 1.8,
    });

    const geo1 = new THREE.TorusGeometry(0.58, 0.065, 64, 128);
    const geo2 = new THREE.TorusGeometry(0.5, 0.055, 64, 128);
    const mesh1 = new THREE.Mesh(geo1, ring1Mat);
    const mesh2 = new THREE.Mesh(geo2, ring2Mat);
    const pivot1 = new THREE.Group();
    const pivot2 = new THREE.Group();

    pivot1.add(mesh1);
    pivot2.add(mesh2);
    pivot1.position.set(0.12, 0.08, 0.08);
    pivot2.position.set(-0.08, -0.06, -0.04);
    scene.add(pivot1, pivot2);

    const attachToRing = (
      nodes: THREE.Mesh[],
      pivot: THREE.Group,
      material: THREE.MeshStandardMaterial,
      targetSize: number,
    ) => {
      if (!nodes.length) return;

      const group = new THREE.Group();
      nodes.forEach((mesh) => {
        mesh.material = material;
        group.add(mesh);
      });

      group.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(group);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDimension = Math.max(size.x, size.y, size.z);
      const scale = maxDimension > 0 ? targetSize / maxDimension : 1;

      group.position.sub(center.multiplyScalar(scale));
      group.scale.setScalar(scale);
      pivot.add(group);
    };

    const loader = new GLTFLoader();
    loader.load(
      "/3d/ring/wedding_rings.glb",
      (gltf) => {
        const arkanNodes: THREE.Mesh[] = [];
        const salsaNodes: THREE.Mesh[] = [];

        gltf.scene.traverse((node) => {
          if (!(node instanceof THREE.Mesh)) return;
          const name = node.name.toUpperCase();
          if (name.includes("ARKAN")) arkanNodes.push(node);
          else if (name.includes("SALSA")) salsaNodes.push(node);
        });

        attachToRing(arkanNodes, pivot1, ring1Mat, 1.15);
        attachToRing(salsaNodes, pivot2, ring2Mat, 1);
        mesh1.visible = false;
        mesh2.visible = false;
      },
      undefined,
      () => {
        mesh1.visible = true;
        mesh2.visible = true;
      },
    );

    const resize = () => {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.position.z = width < 640 ? 12.5 : 11;
      camera.updateProjectionMatrix();
    };

    let frameId = 0;
    const startTime = performance.now();
    const animate = () => {
      const progress = ringProgressRef.current;
      const time = (performance.now() - startTime) / 1000;

      const target1 = {
        rotX: Math.PI * 4.2 * progress + time * 0.42,
        rotZ: Math.PI * 1.4 * progress + time * 0.22,
        posX: 0.12 + 0.1 * Math.sin(time * 0.75),
        posZ: 0.08 + 0.28 * progress,
      };
      const target2 = {
        rotY: Math.PI * 5.2 * progress + time * 0.52,
        rotX: -Math.PI * 2.1 * progress + time * 0.24,
        posX: -0.08 - 0.1 * Math.sin(time * 0.75),
        posZ: -0.04 - 0.24 * progress,
      };

      const lerpFactor = 0.11;
      const ring1 = ring1StateRef.current;
      const ring2 = ring2StateRef.current;

      ring1.rotX += (target1.rotX - ring1.rotX) * lerpFactor;
      ring1.rotZ += (target1.rotZ - ring1.rotZ) * lerpFactor;
      ring1.posX += (target1.posX - ring1.posX) * lerpFactor;
      ring1.posZ += (target1.posZ - ring1.posZ) * lerpFactor;

      ring2.rotY += (target2.rotY - ring2.rotY) * lerpFactor;
      ring2.rotX += (target2.rotX - ring2.rotX) * lerpFactor;
      ring2.posX += (target2.posX - ring2.posX) * lerpFactor;
      ring2.posZ += (target2.posZ - ring2.posZ) * lerpFactor;

      const idleDamp = 1 - clamp(progress / 0.1);
      const floatY = Math.sin(time * 0.6) * 0.04 * idleDamp;

      pivot1.rotation.set(ring1.rotX, 0, ring1.rotZ);
      pivot1.position.set(ring1.posX, 0.08 + floatY, ring1.posZ);

      pivot2.rotation.set(ring2.rotX, ring2.rotY, 0);
      pivot2.position.set(ring2.posX, -0.06 - floatY, ring2.posZ);

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    resize();
    window.setTimeout(resize, 100);
    window.addEventListener("resize", resize);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(frameId);
      geo1.dispose();
      geo2.dispose();
      envTexture.dispose();
      ring1Mat.dispose();
      ring2Mat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <section ref={sectionRef} id="our-story" className="our-story-section">
      <div className="story-sky" aria-hidden="true" />

      <div className="ring-stage" aria-hidden="true">
        <div ref={ringCanvasRef} className="story-ring-canvas" />
      </div>

      <header className="story-head">
        <div className="eyebrow">Chapter One</div>
        <h2>
          Our <em>Story</em>
        </h2>
        <p>Seven years of laughter, adventures, and quiet moments — written one chapter at a time.</p>
      </header>

      <div ref={railRef} className="rail" aria-hidden="true">
        <svg ref={svgRef} preserveAspectRatio="none">
          <defs>
            <mask id="ourStoryRailReveal" maskUnits="userSpaceOnUse">
              <rect x="0" y="0" width="100%" height="100%" fill="black" />
              <path ref={maskPathRef} className="rail-mask-path" d="" />
            </mask>
          </defs>
          <path ref={trackPathRef} className="rail-track" d="" />
          <path ref={progressPathRef} className="rail-progress" d="" mask="url(#ourStoryRailReveal)" />
        </svg>
      </div>

      <div ref={cardsRef} className="cards">
        {STORY_CARDS.map((card, index) => (
          <article
            key={card.stamp}
            data-story-card
            data-idx={index}
            className={`card ${card.side}`}
            style={{ "--tilt": card.tilt } as CSSProperties}
          >
            <div className="slot-img">
              <figure className="paper">
                <img src={card.image} alt="" />
              </figure>
              <div className="stamp">{card.stamp}</div>
              <div className="caption">{card.caption}</div>
            </div>
            <div className="node" />
            <div className="slot-text">
              <div className="chapter">{card.chapter}</div>
              <div className="date">{card.date}</div>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              <div className="place">{card.place}</div>
            </div>
          </article>
        ))}
      </div>

      <div className="closer">
        <div className="glyph">&amp;</div>
        <p>&ldquo;To love is to recognize yourself in another — and decide, every day, to stay.&rdquo;</p>
        <div className="sign">— Salsa &amp; Arkan</div>
      </div>

      <div className="progress" aria-hidden="true">
        {STORY_CARDS.map((card, index) => (
          <span key={card.stamp} data-story-dot data-idx={index} />
        ))}
      </div>

      <style>
        {`
          .our-story-section {
            --story-sky: #0c4dbe;
            --story-ink: #ffffff;
            --story-ink-dim: rgba(255,255,255,0.82);
            --story-ink-mute: rgba(255,255,255,0.62);
            --story-paper: #fdfaf3;
            --story-gold: #ffffff;
            --story-gold-soft: rgba(255,255,255,0.72);
            position: relative;
            isolation: isolate;
            overflow: visible;
            padding: 12vh 0 18vh;
            background-color: var(--story-sky);
            color: var(--story-ink);
          }

          .story-sky {
            position: absolute;
            inset: 0;
            z-index: -2;
            background-image:
              linear-gradient(rgba(12,39,82,0.18), rgba(12,39,82,0.24)),
              radial-gradient(ellipse at 50% 110%, rgba(253,250,243,0.28) 0%, rgba(253,250,243,0) 55%),
              radial-gradient(ellipse at 50% 0%, rgba(12,39,82,0.16) 0%, rgba(12,39,82,0) 50%),
              url("${SKY}");
            background-size: cover;
            background-position: center top;
            background-repeat: no-repeat;
          }

          .ring-stage {
            position: sticky;
            top: 0;
            z-index: 0;
            display: grid;
            place-items: center;
            width: 100%;
            height: 100svh;
            margin-bottom: -100svh;
            overflow: hidden;
            pointer-events: none;
          }

          .story-ring-canvas {
            width: min(720px, 86vw);
            height: min(720px, 82svh);
            opacity: 0.9;
            filter: drop-shadow(0 28px 42px rgba(12,39,82,0.28));
          }

          .story-head {
            position: relative;
            z-index: 2;
            text-align: center;
            margin: 0 auto 10vh;
            padding: 0 24px;
          }

          .story-head .eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 18px;
            font-family: var(--font-din-alternate);
            color: var(--story-gold);
            letter-spacing: 0.5em;
            text-transform: uppercase;
            font-size: 12px;
          }

          .story-head .eyebrow::before,
          .story-head .eyebrow::after {
            content: "";
            width: 36px;
            height: 1px;
            background: var(--story-gold-soft);
          }

          .story-head h2 {
            margin: 0;
            font-family: var(--font-cyrene);
            font-weight: 300;
            font-style: italic;
            font-size: clamp(52px, 7.6vw, 116px);
            line-height: 0.95;
            letter-spacing: -0.02em;
            color: var(--story-ink);
          }

          .story-head h2 em {
            font-style: normal;
            color: var(--story-gold);
          }

          .story-head p {
            max-width: 520px;
            margin: 20px auto 0;
            color: var(--story-ink-dim);
            font-size: 16px;
            line-height: 1.7;
            font-style: italic;
            font-family: var(--font-cyrene);
          }

          .rail {
            position: absolute;
            left: 0;
            z-index: 1;
            overflow: visible;
            pointer-events: none;
          }

          .rail svg {
            display: block;
            width: 100%;
            height: 100%;
            overflow: visible;
          }

          .rail path {
            fill: none;
            stroke-width: 2.2;
            stroke-linecap: round;
            stroke-dasharray: 2 11;
          }

          .rail-track {
            stroke: rgba(255,255,255,0.28);
          }

          .rail-progress {
            stroke: var(--story-gold);
            filter: drop-shadow(0 0 4px rgba(184,137,63,0.6)) drop-shadow(0 1px 1px rgba(253,250,243,0.55));
          }

          .rail-mask-path {
            fill: none;
            stroke: #fff;
            stroke-width: 18;
            stroke-linecap: round;
          }

          .cards {
            position: relative;
            z-index: 2;
            max-width: 1180px;
            margin: 0 auto;
            padding: 0 32px;
          }

          .card {
            position: relative;
            display: grid;
            grid-template-columns: 1fr 100px 1fr;
            align-items: center;
            gap: 28px;
            margin: 14vh 0;
          }

          .card:first-child {
            margin-top: 6vh;
          }

          .card:last-child {
            margin-bottom: 0;
          }

          .node {
            display: none;
          }

          .slot-img {
            position: relative;
            padding: 14px 8px;
          }

          .paper {
            position: relative;
            width: 100%;
            aspect-ratio: 5 / 4;
            margin: 0;
            overflow: visible;
            filter: drop-shadow(0 22px 28px rgba(0,0,0,0.55)) drop-shadow(0 0 1px rgba(0,0,0,0.5));
            transform: rotate(var(--tilt, 0deg));
            transition: transform 0.8s cubic-bezier(.2,.7,.2,1);
          }

          .paper::before {
            content: "";
            position: absolute;
            inset: -3px;
            background: radial-gradient(120% 90% at 30% 20%, #fdfaf3 0%, #efe7d6 60%, #d8ccb3 100%);
            -webkit-mask: url("${TORN_PAPER}") center / 100% 100% no-repeat;
            mask: url("${TORN_PAPER}") center / 100% 100% no-repeat;
          }

          .paper img {
            position: absolute;
            inset: 6px;
            display: block;
            width: calc(100% - 12px);
            height: calc(100% - 12px);
            object-fit: cover;
            filter: saturate(0.92) contrast(1.02);
            -webkit-mask: url("${TORN_PAPER}") center / 100% 100% no-repeat;
            mask: url("${TORN_PAPER}") center / 100% 100% no-repeat;
          }

          .paper::after {
            content: "";
            position: absolute;
            inset: 6px;
            pointer-events: none;
            background:
              radial-gradient(120% 80% at 50% 0%, rgba(255,247,228,0.18), rgba(255,247,228,0) 60%),
              radial-gradient(120% 80% at 50% 100%, rgba(20,10,0,0.18), rgba(0,0,0,0) 60%);
            mix-blend-mode: overlay;
            -webkit-mask: url("${TORN_PAPER}") center / 100% 100% no-repeat;
            mask: url("${TORN_PAPER}") center / 100% 100% no-repeat;
          }

          .stamp {
            position: absolute;
            top: 4px;
            left: 0;
            z-index: 2;
            padding: 6px 10px 5px;
            border: 1px solid rgba(184,137,63,0.55);
            border-radius: 1px;
            background: rgba(255,255,255,0.18);
            color: var(--story-paper);
            font-family: var(--font-din-alternate);
            font-size: 10px;
            letter-spacing: 0.32em;
            text-transform: uppercase;
            backdrop-filter: blur(2px);
          }

          .caption {
            position: absolute;
            left: 50%;
            bottom: -8px;
            z-index: 2;
            transform: translateX(-50%) rotate(var(--tilt, 0deg));
            color: rgba(255,255,255,0.7);
            font-family: var(--font-din-alternate);
            font-size: 10px;
            letter-spacing: 0.32em;
            text-transform: uppercase;
            white-space: nowrap;
          }

          .card.right .stamp {
            right: 0;
            left: auto;
          }

          .slot-text {
            position: relative;
          }

          .chapter {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
            color: var(--story-gold);
            font-family: var(--font-din-alternate);
            letter-spacing: 0.4em;
            text-transform: uppercase;
            font-size: 11px;
          }

          .slot-text h3 {
            margin: 0 0 14px;
            font-family: var(--font-cyrene);
            font-weight: 400;
            font-size: clamp(28px, 3.4vw, 44px);
            line-height: 1.05;
            letter-spacing: -0.01em;
            color: var(--story-ink);
          }

          .slot-text h3 em {
            font-style: italic;
            color: var(--story-gold);
          }

          .date {
            margin-bottom: 14px;
            color: var(--story-ink-mute);
            font-family: var(--font-din-alternate);
            font-size: 13px;
            letter-spacing: 0.28em;
            text-transform: uppercase;
          }

          .slot-text p {
            max-width: 44ch;
            margin: 0;
            color: var(--story-ink-dim);
            font-family: var(--font-cyrene);
            font-size: 17px;
            font-weight: 300;
            line-height: 1.75;
          }

          .place {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            margin-top: 18px;
            color: var(--story-ink-mute);
            font-family: var(--font-din-alternate);
            font-size: 12px;
            letter-spacing: 0.28em;
            text-transform: uppercase;
          }

          .place::before {
            content: "";
            width: 22px;
            height: 1px;
            background: var(--story-gold-soft);
          }

          .card.left .slot-img { grid-column: 1; padding-right: 30px; }
          .card.left .slot-text { grid-column: 3; padding-left: 30px; text-align: left; }
          .card.right .slot-img { grid-column: 3; padding-left: 30px; }
          .card.right .slot-text { grid-column: 1; padding-right: 30px; text-align: right; }
          .card.right .chapter { justify-content: flex-end; }
          .card.right .slot-text p { margin-left: auto; }
          .card.right .place::before { display: none; }
          .card.right .place::after { content: ""; width: 22px; height: 1px; background: var(--story-gold-soft); }

          .slot-img,
          .slot-text {
            opacity: 0;
            transform: translate3d(0, 40px, 0);
            transition: opacity 0.9s cubic-bezier(.2,.7,.2,1), transform 0.9s cubic-bezier(.2,.7,.2,1);
            will-change: transform, opacity;
          }

          .card.left .slot-img { transform: translate3d(-60px, 30px, 0); }
          .card.left .slot-text { transform: translate3d(60px, 30px, 0); }
          .card.right .slot-img { transform: translate3d(60px, 30px, 0); }
          .card.right .slot-text { transform: translate3d(-60px, 30px, 0); }

          .card.is-visible .slot-img,
          .card.is-visible .slot-text {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }

          .card.is-visible .slot-text {
            transition-delay: 0.12s;
          }

          .closer {
            position: relative;
            z-index: 2;
            padding: 18vh 24px 4vh;
            color: var(--story-ink-dim);
            text-align: center;
          }

          .glyph {
            color: var(--story-gold);
            font-family: var(--font-cyrene);
            font-style: italic;
            font-size: 64px;
            line-height: 1;
          }

          .closer p {
            max-width: 480px;
            margin: 18px auto 0;
            font-family: var(--font-cyrene);
            font-style: italic;
            line-height: 1.7;
          }

          .sign {
            margin-top: 24px;
            color: var(--story-ink-mute);
            font-family: var(--font-din-alternate);
            font-size: 11px;
            letter-spacing: 0.5em;
            text-transform: uppercase;
          }

          .progress {
            position: fixed;
            top: 50%;
            right: 24px;
            z-index: 30;
            display: flex;
            flex-direction: column;
            gap: 10px;
            transform: translateY(-50%);
            pointer-events: none;
          }

          .progress span {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: rgba(255,255,255,0.26);
            transition: background 0.4s, transform 0.4s;
          }

          .progress span.on {
            background: var(--story-gold);
            transform: scale(1.4);
          }

          @media (prefers-reduced-motion: reduce) {
            .ring-wrap,
            .slot-img,
            .slot-text,
            .paper {
              transition: none;
              animation: none;
            }
          }

          @media (max-width: 820px) {
            .our-story-section { padding-top: 10vh; }
            .cards { padding: 0 16px; }
            .card {
              grid-template-columns: 1fr 24px 1fr;
              gap: 10px;
              margin: 11vh 0;
            }
            .card.left .slot-img { padding-right: 6px; }
            .card.left .slot-text { padding-left: 6px; }
            .card.right .slot-img { padding-left: 6px; }
            .card.right .slot-text { padding-right: 6px; }
            .slot-img { padding: 10px 4px; }
            .paper { aspect-ratio: 4 / 5; }
            .stamp {
              top: 0;
              padding: 4px 6px 3px;
              font-size: 8px;
              letter-spacing: 0.22em;
            }
            .caption {
              bottom: -4px;
              font-size: 8px;
              letter-spacing: 0.22em;
            }
            .chapter {
              gap: 6px;
              margin-bottom: 6px;
              font-size: 9px;
              letter-spacing: 0.28em;
              flex-wrap: wrap;
            }
            .slot-text h3 {
              margin-bottom: 8px;
              font-size: clamp(17px, 5.2vw, 22px);
              line-height: 1.12;
            }
            .date {
              margin-bottom: 8px;
              font-size: 9px;
              letter-spacing: 0.22em;
            }
            .slot-text p {
              max-width: none;
              font-size: 12px;
              line-height: 1.55;
            }
            .place {
              gap: 6px;
              margin-top: 10px;
              font-size: 9px;
              letter-spacing: 0.22em;
            }
            .place::before,
            .card.right .place::after { width: 12px; }
            .progress { display: none; }
          }

          @media (max-width: 420px) {
            .cards { padding: 0 12px; }
            .card {
              grid-template-columns: 1fr 16px 1fr;
              gap: 6px;
              margin: 9vh 0;
            }
            .slot-text h3 { font-size: 16px; }
            .slot-text p { font-size: 11px; line-height: 1.5; }
            .chapter,
            .date,
            .place { font-size: 8.5px; }
          }
        `}
      </style>
    </section>
  );
}
