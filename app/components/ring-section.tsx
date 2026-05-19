"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (v: number) => 1 - Math.pow(1 - clamp(v), 3);

export default function RingSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  // Current (lerped) ring transform state
  const ring1Ref = useRef({ rotX: 0, rotZ: 0, posX: 0, posZ: 0 });
  const ring2Ref = useRef({ rotY: 0, rotX: 0, posX: 0, posZ: 0 });

  useEffect(() => {
    const section = document.getElementById("ring-section");
    const container = containerRef.current;
    if (!section || !container) return;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020d1a);

    const camera = new THREE.PerspectiveCamera(
      38,
      window.innerWidth / Math.max(window.innerHeight, 1),
      0.1,
      100
    );
    camera.position.set(0, 0, 11);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
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

    // Ambient — very low
    scene.add(new THREE.AmbientLight("#ffffff", 0.07));

    // Single cinematic key light dari kanan atas
    const keyLight = new THREE.DirectionalLight("#fff4e6", 1.65);
    keyLight.position.set(4.5, 5.5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    scene.add(keyLight);

    // Warm subtle fill dari kiri bawah
    const fillLight = new THREE.PointLight("#d9a56f", 0.42, 18);
    fillLight.position.set(-3.5, -2.2, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight("#8fb7ff", 0.45);
    rimLight.position.set(-3, 2.5, -2);
    scene.add(rimLight);

    // ── Material — silver chrome, metallic ────────────────────────────────────
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

    // ── Geometry — per brief sizes ────────────────────────────────────────────
    // Ring 1 (ARKAN - men's, slightly bigger): radius 0.58, tube 0.065
    const geo1 = new THREE.TorusGeometry(0.58, 0.065, 64, 128);
    const mesh1 = new THREE.Mesh(geo1, ring1Mat);
    mesh1.castShadow = true;
    mesh1.receiveShadow = true;

    // Ring 2 (SALSA - women's, slightly smaller): radius 0.5, tube 0.055
    const geo2 = new THREE.TorusGeometry(0.5, 0.055, 64, 128);
    const mesh2 = new THREE.Mesh(geo2, ring2Mat);
    mesh2.castShadow = true;
    mesh2.receiveShadow = true;

    // Pivot groups so rotation origin is ring center
    const pivot1 = new THREE.Group();
    const pivot2 = new THREE.Group();
    pivot1.add(mesh1);
    pivot2.add(mesh2);

    // Initial offset — saling bersinggungan
    pivot1.position.set(0.12, 0.08, 0.08);
    pivot2.position.set(-0.08, -0.06, -0.04);

    scene.add(pivot1);
    scene.add(pivot2);

    // ── Load GLB — apply silver to all meshes ─────────────────────────────────
    // We still load the GLB but use procedural torus as primary geometry
    // (GLB engraved text chars will be added as children of pivot1/2)
    const loader = new GLTFLoader();
    loader.load(
      "/3d/ring/cincin.glb",
      (gltf) => {
        const arkanNodes: THREE.Mesh[] = [];
        const salsaNodes: THREE.Mesh[] = [];

        gltf.scene.traverse((node) => {
          if (!(node instanceof THREE.Mesh)) return;
          const n = node.name.toUpperCase();
          if (n.includes("ARKAN")) arkanNodes.push(node);
          else if (n.includes("SALSA")) salsaNodes.push(node);
        });

        // Helper: fit mesh group into a pivot, centered
        const attachToRing = (
          nodes: THREE.Mesh[],
          pivot: THREE.Group,
          mat: THREE.MeshStandardMaterial,
          targetSize: number
        ) => {
          if (!nodes.length) return;
          const group = new THREE.Group();
          nodes.forEach((m) => {
            m.material = mat;
            group.add(m);
          });
          group.updateMatrixWorld(true);
          const box = new THREE.Box3().setFromObject(group);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = maxDim > 0 ? targetSize / maxDim : 1;
          group.position.sub(center.multiplyScalar(scale));
          group.scale.setScalar(scale);
          pivot.add(group);
        };

        attachToRing(arkanNodes, pivot1, ring1Mat, 1.15);
        attachToRing(salsaNodes, pivot2, ring2Mat, 1.0);

        // Hide procedural torus once GLB loads (GLB has the engraved names)
        mesh1.visible = false;
        mesh2.visible = false;
      },
      undefined,
      () => {
        // GLB failed — keep procedural torus, still looks great
        console.log("Using procedural torus geometry");
      }
    );

    // ── Scroll progress ───────────────────────────────────────────────────────
    const updateScrollProgress = () => {
      const scrolled = window.scrollY - section.offsetTop;
      const total = section.offsetHeight - window.innerHeight;
      progressRef.current = clamp(total > 0 ? scrolled / total : 0);

      const p = progressRef.current;
      const introIn  = easeOutCubic(p / 0.15);
      const introOut = easeOutCubic((p - 0.15) / 0.1);

      if (introRef.current) {
        introRef.current.style.opacity = `${clamp(introIn - introOut)}`;
        introRef.current.style.transform = `translate3d(-50%, ${lerp(28, -16, introOut)}px, 0) scale(${lerp(0.96, 1, introIn)})`;
      }

    };

    // ── Resize ────────────────────────────────────────────────────────────────
    const resize = () => {
      const w = container.clientWidth  || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(h, 1);
      camera.position.z = w < 640 ? 12.5 : 11;
      camera.updateProjectionMatrix();
    };

    // ── Animation loop ────────────────────────────────────────────────────────
    let frameId = 0;
    let scrollFrameId = 0;
    const startTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const p   = progressRef.current;
      const t   = (now - startTime) / 1000; // seconds

      // Scroll-driven TARGET values — per brief
      const target1 = {
        rotX: Math.PI * 1.5 * p,
        rotZ: Math.PI * 0.4 * p,
        posX: lerp(0.12,  0.38, p),
        posZ: lerp(0.08,  0.30, p),
      };
      const target2 = {
        rotY: Math.PI * 2   * p,
        rotX: -Math.PI * 0.6 * p,
        posX: lerp(-0.08, -0.32, p),
        posZ: lerp(-0.04, -0.22, p),
      };

      // Lerp factor 0.08 = GSAP scrub:1.2 equivalent — lags behind scroll
      const lf = 0.08;
      const r1 = ring1Ref.current;
      const r2 = ring2Ref.current;

      r1.rotX = lerp(r1.rotX, target1.rotX, lf);
      r1.rotZ = lerp(r1.rotZ, target1.rotZ, lf);
      r1.posX = lerp(r1.posX, target1.posX, lf);
      r1.posZ = lerp(r1.posZ, target1.posZ, lf);

      r2.rotY = lerp(r2.rotY, target2.rotY, lf);
      r2.rotX = lerp(r2.rotX, target2.rotX, lf);
      r2.posX = lerp(r2.posX, target2.posX, lf);
      r2.posZ = lerp(r2.posZ, target2.posZ, lf);

      // Idle float — overridden by scroll (sin dampened by scroll progress)
      const idleDamp = 1 - clamp(p / 0.1); // fades out after 10% scroll
      const floatY = Math.sin(t * 0.6) * 0.04 * idleDamp;

      // Apply to pivots
      pivot1.rotation.set(r1.rotX, 0, r1.rotZ);
      pivot1.position.set(r1.posX, 0.08 + floatY, r1.posZ);

      pivot2.rotation.set(r2.rotX, r2.rotY, 0);
      pivot2.position.set(r2.posX, -0.06 - floatY, r2.posZ);

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    const onScroll = () => {
      if (scrollFrameId) return;
      scrollFrameId = window.requestAnimationFrame(() => {
        scrollFrameId = 0;
        updateScrollProgress();
      });
    };

    resize();
    updateScrollProgress();
    animate();
    window.setTimeout(resize, 100);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frameId);
      if (scrollFrameId) window.cancelAnimationFrame(scrollFrameId);
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
    <section
      id="ring-section"
      style={{
        position: "relative",
        height: "500vh",
        width: "100%",
        background: "#020d1a",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100svh",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <div
          ref={containerRef}
          aria-label="3D wedding rings — ARKAN & SALSA"
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        />

        {/* ARKAN label — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: "12%",
            left: "6vw",
            zIndex: 5,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <p style={{
            margin: 0,
            color: "rgba(255,255,255,0.35)",
            fontFamily: "var(--font-din-alternate), sans-serif",
            fontSize: "clamp(10px, 1vw, 12px)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}>
            Him
          </p>
          <p style={{
            margin: 0,
            color: "#F8EFE2",
            fontFamily: "var(--font-cyrene), Georgia, serif",
            fontSize: "clamp(42px, 7vw, 96px)",
            lineHeight: 0.88,
            letterSpacing: "-0.03em",
            textShadow: "0 0 60px rgba(212,165,116,0.5), 0 2px 40px rgba(0,0,0,0.8)",
          }}>
            Arkan
          </p>
        </div>

        {/* SALSA label — bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: "12%",
            right: "6vw",
            zIndex: 5,
            textAlign: "right",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <p style={{
            margin: 0,
            color: "rgba(255,255,255,0.35)",
            fontFamily: "var(--font-din-alternate), sans-serif",
            fontSize: "clamp(10px, 1vw, 12px)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}>
            Her
          </p>
          <p style={{
            margin: 0,
            color: "#F8EFE2",
            fontFamily: "var(--font-cyrene), Georgia, serif",
            fontSize: "clamp(42px, 7vw, 96px)",
            lineHeight: 0.88,
            letterSpacing: "-0.03em",
            textShadow: "0 0 60px rgba(212,165,116,0.5), 0 2px 40px rgba(0,0,0,0.8)",
          }}>
            Salsa
          </p>
        </div>

        {/* Ampersand center decoration */}
        <div
          style={{
            position: "absolute",
            bottom: "12%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 5,
            pointerEvents: "none",
            userSelect: "none",
            color: "rgba(248,239,226,0.18)",
            fontFamily: "var(--font-cyrene), Georgia, serif",
            fontSize: "clamp(36px, 5vw, 72px)",
            lineHeight: 1,
          }}
        >
          &amp;
        </div>

        <div
          ref={introRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "11%",
            width: "min(760px, calc(100vw - 44px))",
            zIndex: 3,
            opacity: 0,
            transform: "translate3d(-50%, 28px, 0) scale(0.96)",
            color: "#F8EFE2",
            fontFamily: "var(--font-cyrene), Georgia, serif",
            fontSize: "clamp(34px, 6vw, 82px)",
            lineHeight: 0.92,
            letterSpacing: "-0.035em",
            textAlign: "center",
            textShadow: "0 20px 58px rgba(0,0,0,0.34)",
            willChange: "transform, opacity",
            pointerEvents: "none",
          }}
        >
          Seven years of laughter, adventures, and quiet moments. Here&apos;s
          our story.
        </div>

      </div>
    </section>
  );
}
