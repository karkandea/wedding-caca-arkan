"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (start: number, end: number, amount: number) => start + (end - start) * amount;
const easeInOutCubic = (value: number) => {
  const t = clamp(value);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const easeOutCubic = (value: number) => 1 - Math.pow(1 - clamp(value), 3);

// ─── Cloud parallax configuration ────────────────────────────────────────────
// Camera starts at (0, 10.2, 10) and dives toward (0, 3.3, 4.65) between
// scroll 40%→80%. During scroll 0→70% these clouds drift toward positive Z
// and "pass" the camera, giving a fly-through feel.
//
// baseZ is the starting Z position. The Y values trace the camera's
// look-down ray (roughly Y ≈ z) so each cloud sits near screen-center at its
// starting depth. `speed` is a parallax multiplier — clouds closer to the
// camera (higher baseZ) move faster in world space than distant ones,
// which makes near clouds sweep past dramatically while far clouds linger.
interface CloudConfig {
  x: number;
  y: number;
  baseZ: number;
  width: number;
  height: number;
  opacity: number;
  speed: number;
  rotation: number;
}

const CLOUD_CONFIGS: CloudConfig[] = [
  // ─── Far backdrop (behind & around the book) — Z: -12 → -6 ────────────────
  { x:  4.5, y: -3.5, baseZ: -11.5, width: 8.5, height: 4.5, opacity: 0.58, speed: 0.42, rotation:  0.04 },
  { x: -5.0, y:  1.0, baseZ: -10.0, width: 9.0, height: 4.8, opacity: 0.55, speed: 0.45, rotation: -0.06 },
  { x:  2.5, y: -6.0, baseZ:  -9.0, width: 7.5, height: 4.0, opacity: 0.50, speed: 0.48, rotation:  0.07 },
  { x: -3.8, y: -2.0, baseZ:  -8.0, width: 8.0, height: 4.2, opacity: 0.55, speed: 0.50, rotation: -0.04 },
  { x:  6.0, y:  2.5, baseZ:  -7.0, width: 7.0, height: 3.8, opacity: 0.50, speed: 0.53, rotation:  0.05 },
  { x: -1.5, y: -8.0, baseZ:  -6.5, width: 7.2, height: 3.6, opacity: 0.52, speed: 0.55, rotation: -0.05 },
  // ─── Around the book (mid distance) — Z: -5 → 1 ─────────────────────────
  { x:  3.5, y:  3.5, baseZ:  -5.0, width: 6.5, height: 3.4, opacity: 0.60, speed: 0.60, rotation:  0.06 },
  { x: -4.0, y: -3.5, baseZ:  -4.0, width: 6.8, height: 3.5, opacity: 0.58, speed: 0.63, rotation: -0.03 },
  { x:  4.2, y: -5.5, baseZ:  -3.0, width: 6.2, height: 3.3, opacity: 0.62, speed: 0.66, rotation:  0.05 },
  { x: -2.5, y:  2.0, baseZ:  -2.0, width: 6.0, height: 3.2, opacity: 0.64, speed: 0.70, rotation: -0.07 },
  { x:  1.5, y: -4.0, baseZ:  -1.0, width: 5.8, height: 3.0, opacity: 0.66, speed: 0.74, rotation:  0.04 },
  { x: -3.2, y:  0.5, baseZ:   0.0, width: 5.5, height: 2.9, opacity: 0.68, speed: 0.78, rotation: -0.06 },
  { x:  3.0, y:  1.8, baseZ:   1.0, width: 5.2, height: 2.8, opacity: 0.70, speed: 0.82, rotation:  0.05 },
  // ─── Mid-air (between book and camera) — Z: 2 → 5 ───────────────────────
  { x: -1.8, y: -1.5, baseZ:   2.0, width: 5.0, height: 2.7, opacity: 0.72, speed: 0.86, rotation: -0.04 },
  { x:  2.5, y:  3.5, baseZ:   2.8, width: 4.8, height: 2.6, opacity: 0.74, speed: 0.90, rotation:  0.06 },
  { x: -2.8, y:  4.5, baseZ:   3.6, width: 4.6, height: 2.5, opacity: 0.76, speed: 0.94, rotation: -0.05 },
  { x:  1.4, y:  1.0, baseZ:   4.2, width: 4.5, height: 2.4, opacity: 0.78, speed: 0.98, rotation:  0.04 },
  { x: -1.0, y:  6.0, baseZ:   4.8, width: 4.4, height: 2.4, opacity: 0.80, speed: 1.02, rotation: -0.07 },
  // ─── Near camera (fly-by, get blurred & sweep past) — Z: 5 → 8.5 ────────
  { x:  2.2, y:  4.5, baseZ:   5.4, width: 4.2, height: 2.3, opacity: 0.82, speed: 1.07, rotation:  0.05 },
  { x: -2.4, y:  6.5, baseZ:   6.0, width: 4.0, height: 2.2, opacity: 0.84, speed: 1.12, rotation: -0.06 },
  { x:  1.0, y:  7.5, baseZ:   6.6, width: 3.8, height: 2.1, opacity: 0.86, speed: 1.18, rotation:  0.04 },
  { x: -1.5, y:  5.5, baseZ:   7.2, width: 3.6, height: 2.0, opacity: 0.87, speed: 1.24, rotation:  0.07 },
  { x:  2.6, y:  8.5, baseZ:   7.8, width: 3.4, height: 1.9, opacity: 0.88, speed: 1.30, rotation: -0.05 },
  { x: -0.5, y:  9.0, baseZ:   8.4, width: 3.2, height: 1.8, opacity: 0.90, speed: 1.36, rotation:  0.06 },
];
const CLOUD_TRAVEL = 10; // base forward distance, scaled by per-cloud speed
const CLOUD_BLUR_PX = 28; // canvas blur radius used to generate the DOF texture
const DOF_FAR = 4.0; // beyond this dist (camera-ahead), cloud is fully sharp
const DOF_NEAR = 0.3; // closer than this, cloud is fully blurred

// ─── Balloon configuration (placeholders — swap with your GLB asset) ─────────
// Helium-ish balloon: egg-shaped envelope + small knot + slightly curved
// string. Distributed across the same Z range as the clouds so the camera
// flies THROUGH balloons and clouds together. Each balloon has its own
// phase so the natural sway/tilt/spin never syncs up across the group.
interface BalloonConfig {
  x: number;
  y: number;
  baseZ: number;
  scale: number;
  color: string;
  speed: number;
  phase: number;
}

const BALLOON_CONFIGS: BalloonConfig[] = [
  // Far backdrop
  { x:  3.0, y:  1.5, baseZ: -9.0, scale: 0.55, color: "#d8a37e", speed: 0.44, phase: 0.3 },
  { x: -3.5, y: -1.0, baseZ: -7.5, scale: 0.60, color: "#a8b8d8", speed: 0.48, phase: 1.7 },
  { x:  4.5, y: -3.0, baseZ: -6.0, scale: 0.65, color: "#c9aab5", speed: 0.52, phase: 2.9 },
  // Around the book
  { x: -2.5, y:  3.0, baseZ: -4.5, scale: 0.70, color: "#e8c98a", speed: 0.60, phase: 4.1 },
  { x:  3.8, y: -1.5, baseZ: -3.0, scale: 0.75, color: "#a8c9b0", speed: 0.66, phase: 5.3 },
  { x: -3.0, y:  4.0, baseZ: -1.8, scale: 0.70, color: "#d4a8b8", speed: 0.72, phase: 0.8 },
  { x:  1.0, y: -2.5, baseZ:  0.0, scale: 0.80, color: "#c8b8d8", speed: 0.78, phase: 2.0 },
  { x: -3.5, y:  1.0, baseZ:  1.2, scale: 0.78, color: "#f0d8a8", speed: 0.84, phase: 3.4 },
  // Mid-air
  { x:  3.2, y:  5.0, baseZ:  2.5, scale: 0.85, color: "#c8a8c0", speed: 0.90, phase: 4.6 },
  { x: -1.5, y:  0.8, baseZ:  3.5, scale: 0.90, color: "#b8c8e0", speed: 0.96, phase: 5.9 },
  { x:  2.5, y:  3.5, baseZ:  4.4, scale: 0.85, color: "#e0a8a8", speed: 1.02, phase: 1.2 },
  // Near camera
  { x: -2.5, y:  5.5, baseZ:  5.6, scale: 0.95, color: "#d8c8a0", speed: 1.10, phase: 2.5 },
  { x:  1.8, y:  7.5, baseZ:  6.4, scale: 1.00, color: "#a8d0c8", speed: 1.20, phase: 3.7 },
  { x: -1.8, y:  6.0, baseZ:  7.2, scale: 1.05, color: "#e0b8c8", speed: 1.30, phase: 5.0 },
];

export default function BookSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const scene = new THREE.Scene();

    // ─── Deep blue sky skydome ─────────────────────────────────────────────
    // Sky-blue but on the dark side: midnight indigo at zenith → royal
    // blue → soft sky-blue at the horizon. Mapped equirectangularly so
    // the gradient sweeps as the camera tilts.
    const skyCanvas = document.createElement("canvas");
    skyCanvas.width = 32;
    skyCanvas.height = 1024;
    const skyCtx = skyCanvas.getContext("2d")!;
    const skyGrad = skyCtx.createLinearGradient(0, 0, 0, 1024);
    skyGrad.addColorStop(0.0, "#0a1432");
    skyGrad.addColorStop(0.22, "#152a55");
    skyGrad.addColorStop(0.45, "#1f4078");
    skyGrad.addColorStop(0.65, "#2e5598");
    skyGrad.addColorStop(0.85, "#4870ad");
    skyGrad.addColorStop(1.0, "#1f4078"); // wrap back so sphere bottom blends
    skyCtx.fillStyle = skyGrad;
    skyCtx.fillRect(0, 0, 32, 1024);
    const skyTexture = new THREE.CanvasTexture(skyCanvas);
    skyTexture.colorSpace = THREE.SRGBColorSpace;
    skyTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = skyTexture;
    // Fog tinted to match the horizon haze so distant clouds dissolve into
    // the sky rather than into a flat color. Pushed further out (16→70) so
    // we keep more depth visible at the start of the scroll.
    scene.fog = new THREE.Fog(0x2e5598, 16, 70);

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 9, 9);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    canvas.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment()).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.36;
    pmrem.dispose();

    scene.add(new THREE.AmbientLight("#f8efe2", 0.18));

    const keyLight = new THREE.DirectionalLight("#fff0d8", 2.1);
    keyLight.position.set(4.5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight("#8fb7ff", 0.75);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(6, 96),
      new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.34 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.92;
    floor.receiveShadow = true;
    scene.add(floor);

    const bookRoot = new THREE.Group();
    bookRoot.position.y = -0.35;
    scene.add(bookRoot);

    // ─── Cloud parallax setup ────────────────────────────────────────────────
    // Two textures are derived from /cloud.png at runtime: a sharp copy
    // (used when the cloud is far ahead) and a heavily-blurred copy (used
    // as the cloud approaches the camera). Each cloud is rendered as TWO
    // stacked billboard planes whose opacities crossfade based on the
    // cloud's distance to the camera — a sprite-cheap approximation of a
    // depth-of-field bokeh. Disposed in the cleanup block.
    const cloudGroup = new THREE.Group();
    scene.add(cloudGroup);

    const sharpTexture = new THREE.Texture();
    sharpTexture.colorSpace = THREE.SRGBColorSpace;
    const blurTexture = new THREE.Texture();
    blurTexture.colorSpace = THREE.SRGBColorSpace;

    const cloudImg = new Image();
    cloudImg.crossOrigin = "anonymous";
    cloudImg.onload = () => {
      const TEX_W = 1024;
      const TEX_H = Math.round((cloudImg.naturalHeight * TEX_W) / cloudImg.naturalWidth);

      const sharpCanvas = document.createElement("canvas");
      sharpCanvas.width = TEX_W;
      sharpCanvas.height = TEX_H;
      sharpCanvas.getContext("2d")!.drawImage(cloudImg, 0, 0, TEX_W, TEX_H);
      sharpTexture.image = sharpCanvas;
      sharpTexture.needsUpdate = true;

      const blurCanvas = document.createElement("canvas");
      blurCanvas.width = TEX_W;
      blurCanvas.height = TEX_H;
      const bctx = blurCanvas.getContext("2d")!;
      bctx.filter = `blur(${CLOUD_BLUR_PX}px)`;
      bctx.drawImage(cloudImg, 0, 0, TEX_W, TEX_H);
      blurTexture.image = blurCanvas;
      blurTexture.needsUpdate = true;
    };
    cloudImg.src = "/cloud.png";

    type CloudInstance = {
      sharpMesh: THREE.Mesh;
      blurMesh: THREE.Mesh;
      sharpMat: THREE.MeshBasicMaterial;
      blurMat: THREE.MeshBasicMaterial;
      config: CloudConfig;
      bobPhase: number;
    };

    const clouds: CloudInstance[] = CLOUD_CONFIGS.map((config, index) => {
      const geometry = new THREE.PlaneGeometry(config.width, config.height);
      const sharpMat = new THREE.MeshBasicMaterial({
        map: sharpTexture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: true,
      });
      const blurMat = new THREE.MeshBasicMaterial({
        map: blurTexture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: true,
      });
      const sharpMesh = new THREE.Mesh(geometry, sharpMat);
      const blurMesh = new THREE.Mesh(geometry, blurMat);
      sharpMesh.position.set(config.x, config.y, config.baseZ);
      blurMesh.position.set(config.x, config.y, config.baseZ);
      sharpMesh.renderOrder = 10 + index * 2;
      blurMesh.renderOrder = 11 + index * 2;
      cloudGroup.add(sharpMesh);
      cloudGroup.add(blurMesh);
      return { sharpMesh, blurMesh, sharpMat, blurMat, config, bobPhase: index * 1.7 };
    });

    // ─── Balloon placeholders ───────────────────────────────────────────────────
    // Stand-in helium balloons (sphere envelope + knot + curved string).
    // Swap createBalloon() with a GLB load — just keep the per-balloon root
    // Group so the existing animation transforms still apply.
    const balloonGroup = new THREE.Group();
    scene.add(balloonGroup);

    type BalloonInstance = {
      group: THREE.Group;
      config: BalloonConfig;
      materials: THREE.Material[];
    };

    const createBalloon = (config: BalloonConfig): BalloonInstance => {
      const g = new THREE.Group();
      const s = config.scale;

      const envelopeMat = new THREE.MeshStandardMaterial({
        color: config.color,
        roughness: 0.55,
        metalness: 0.04,
        transparent: true,
        opacity: 1,
      });
      envelopeMat.userData.baseOpacity = 1;
      const envelope = new THREE.Mesh(new THREE.SphereGeometry(s, 24, 18), envelopeMat);
      envelope.scale.set(0.95, 1.18, 0.95); // gentle teardrop
      g.add(envelope);

      const knotMat = new THREE.MeshStandardMaterial({
        color: config.color,
        roughness: 0.6,
        metalness: 0.04,
        transparent: true,
        opacity: 1,
      });
      knotMat.userData.baseOpacity = 1;
      const knot = new THREE.Mesh(
        new THREE.ConeGeometry(s * 0.13, s * 0.2, 10),
        knotMat
      );
      knot.position.y = -s * 1.22;
      knot.rotation.x = Math.PI;
      g.add(knot);

      // Curved string (a few segments so it drapes a bit instead of being
      // perfectly straight). Replace with whatever your GLB ships with.
      const stringPts: THREE.Vector3[] = [];
      const stringLen = s * 3.2;
      for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const y = -s * 1.32 - stringLen * t;
        const x = Math.sin(t * Math.PI) * s * 0.07;
        stringPts.push(new THREE.Vector3(x, y, 0));
      }
      const stringGeom = new THREE.BufferGeometry().setFromPoints(stringPts);
      const stringMat = new THREE.LineBasicMaterial({
        color: 0xeae2d4,
        transparent: true,
        opacity: 0.45,
      });
      stringMat.userData.baseOpacity = 0.45;
      const stringLine = new THREE.Line(stringGeom, stringMat);
      g.add(stringLine);

      g.position.set(config.x, config.y, config.baseZ);
      balloonGroup.add(g);

      return { group: g, config, materials: [envelopeMat, knotMat, stringMat] };
    };

    const balloons: BalloonInstance[] = BALLOON_CONFIGS.map(createBalloon);

    let mixer: THREE.AnimationMixer | null = null;
    let action: THREE.AnimationAction | null = null;
    let bookModel: THREE.Group | null = null;
    let frameId = 0;
    let scrollFrameId = 0;
    let currentCamera = {
      x: 0,
      y: 9,
      z: 9,
      fov: 36,
      targetX: 0,
      targetY: 0,
      targetZ: 0,
    };

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.load("/adventure_book_FINAL.glb", (gltf) => {
      const book = gltf.scene;
      book.traverse((node) => {
        if (!(node instanceof THREE.Mesh)) return;
        node.castShadow = true;
        node.receiveShadow = true;
        if (Array.isArray(node.material)) {
          node.material.forEach((material) => {
            material.side = THREE.FrontSide;
          });
        } else {
          node.material.side = THREE.FrontSide;
        }
      });

      book.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(book);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = maxDim > 0 ? 3.2 / maxDim : 1;
      book.position.sub(center);
      book.scale.setScalar(scale);
      book.rotation.set(-0.08, -0.28, 0);
      bookModel = book;
      bookRoot.add(book);

      mixer = new THREE.AnimationMixer(book);
      const clip =
        THREE.AnimationClip.findByName(gltf.animations, "BookCover_HingeAction") ??
        gltf.animations[0];

      if (clip) {
        const correctedClip = new THREE.AnimationClip(
          `${clip.name}_OpenUp`,
          clip.duration,
          clip.tracks.map((track) => {
            const correctedTrack = track.clone();
            if (correctedTrack.name === "BookCover_Hinge.quaternion") {
              for (let index = 0; index < correctedTrack.values.length; index += 4) {
                correctedTrack.values[index + 2] *= -1;
              }
            }
            return correctedTrack;
          })
        );

        action = mixer.clipAction(correctedClip);
        action.play();
        action.paused = true;
        action.time = 0;
        mixer.update(0);
      }
    });

    const updateScrollProgress = () => {
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      progressRef.current = clamp(total > 0 ? -rect.top / total : 0);
    };

    const resize = () => {
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };

    const onScroll = () => {
      if (scrollFrameId) return;
      scrollFrameId = window.requestAnimationFrame(() => {
        scrollFrameId = 0;
        updateScrollProgress();
      });
    };

    const animate = () => {
      const progress = progressRef.current;
      const zoomProgress = easeInOutCubic((progress - 0.4) / 0.4);
      const openProgress = easeInOutCubic((progress - 0.8) / 0.2);
      const pageViewProgress = easeInOutCubic((progress - 0.8) / 0.2);
      const mobile = window.innerWidth < 768;
      const angledCamera = {
        x: lerp(0, 0.18, zoomProgress),
        y: lerp(mobile ? 10.5 : 10.2, mobile ? 3.9 : 3.3, zoomProgress),
        z: lerp(mobile ? 10.8 : 10, mobile ? 5.4 : 4.65, zoomProgress),
        fov: lerp(mobile ? 42 : 38, mobile ? 31 : 28, zoomProgress),
        targetX: 0,
        targetY: lerp(-0.15, -0.28, zoomProgress),
        targetZ: 0,
      };

      const target = {
        x: lerp(angledCamera.x, 0, pageViewProgress),
        y: lerp(angledCamera.y, mobile ? 4.9 : 4.65, pageViewProgress),
        z: lerp(angledCamera.z, mobile ? 0.74 : 0.56, pageViewProgress),
        fov: lerp(angledCamera.fov, mobile ? 34 : 30, pageViewProgress),
        targetX: lerp(angledCamera.targetX, 0, pageViewProgress),
        targetY: lerp(angledCamera.targetY, -0.42, pageViewProgress),
        targetZ: lerp(angledCamera.targetZ, mobile ? 0.08 : 0.04, pageViewProgress),
      };

      currentCamera = {
        x: lerp(currentCamera.x, target.x, 0.08),
        y: lerp(currentCamera.y, target.y, 0.08),
        z: lerp(currentCamera.z, target.z, 0.08),
        fov: lerp(currentCamera.fov, target.fov, 0.08),
        targetX: lerp(currentCamera.targetX, target.targetX, 0.08),
        targetY: lerp(currentCamera.targetY, target.targetY, 0.08),
        targetZ: lerp(currentCamera.targetZ, target.targetZ, 0.08),
      };

      camera.position.set(currentCamera.x, currentCamera.y, currentCamera.z);
      camera.fov = currentCamera.fov;
      camera.lookAt(currentCamera.targetX, currentCamera.targetY, currentCamera.targetZ);
      camera.updateProjectionMatrix();

      // ─── Cloud parallax (active during scroll 0 → 70%) ─────────────────────
      // Linear `cloudProgress` so velocity stays predictable across scroll.
      // For every cloud:
      //   1. Drift forward in Z by  speed × CLOUD_TRAVEL × progress.
      //   2. Gentle X/Y bob so nothing feels frozen.
      //   3. Billboard both stacked planes to face the camera.
      //   4. Crossfade sharp ↔ blur based on `distAhead` — far = sharp,
      //      near = fully blurred. The blurred plane scales up as the
      //      cloud approaches the camera, mimicking bokeh enlargement.
      //   5. Soft pass-through fade so clouds dissolve instead of popping
      //      when they cross behind the camera.
      const cloudProgress = clamp(progress / 0.7);
      const time = performance.now() * 0.0003;
      const cameraZ = currentCamera.z;

      for (const cloud of clouds) {
        const { sharpMesh, blurMesh, sharpMat, blurMat, config, bobPhase } = cloud;
        const z = config.baseZ + cloudProgress * config.speed * CLOUD_TRAVEL;
        const bobX = config.x + Math.sin(time * 0.6 + bobPhase) * 0.06;
        const bobY = config.y + Math.sin(time + bobPhase) * 0.08;

        sharpMesh.position.set(bobX, bobY, z);
        blurMesh.position.set(bobX, bobY, z);

        sharpMesh.quaternion.copy(camera.quaternion);
        blurMesh.quaternion.copy(camera.quaternion);
        sharpMesh.rotation.z += config.rotation;
        blurMesh.rotation.z += config.rotation;

        const distAhead = cameraZ - z; // >0 = cloud is in front of camera

        // DOF mix: 0 = fully sharp, 1 = fully blurred. Eased so the swap
        // through the transition zone feels gradual rather than linear.
        const rawMix = clamp((DOF_FAR - distAhead) / (DOF_FAR - DOF_NEAR));
        const blurMix = easeInOutCubic(rawMix);

        // Pass-through envelope — full alpha through the approach, then a
        // soft fade as the cloud crosses 1.5 → -1.5 units past the camera.
        let envelope = 1;
        if (distAhead < 1.5) envelope = clamp((distAhead + 1.5) / 3);
        if (distAhead < -1.5) envelope = 0;

        // Clear all clouds out by the time the book opens (scroll 72 → 82%).
        let endFade = 1;
        if (progress > 0.72) endFade = clamp((0.82 - progress) / 0.1);

        const baseAlpha = config.opacity * envelope * endFade;
        const sharpAlpha = baseAlpha * (1 - blurMix);
        // Blurred plane is boosted slightly because the blur spreads the
        // texture's energy and would otherwise look anemic at full mix.
        const blurAlpha = Math.min(1, baseAlpha * blurMix * 1.35);

        sharpMat.opacity = sharpAlpha;
        blurMat.opacity = blurAlpha;
        sharpMesh.visible = sharpAlpha > 0.005;
        blurMesh.visible = blurAlpha > 0.005;

        // Bokeh-style enlargement when the cloud is nearly on top of us.
        const closeness = clamp((1.8 - distAhead) / 3);
        const blurScale = 1 + closeness * 0.7;
        blurMesh.scale.setScalar(blurScale);
      }

      // ─── Balloon animation ──────────────────────────────────────────────────
      // Each balloon drifts forward with the same parallax model as the
      // clouds AND gets its own gentle sway/tilt/spin so it reads as a
      // real floating helium balloon instead of a static prop. The sway
      // is multi-axis (X, Y, Z) at slightly different frequencies, the
      // envelope tilts side-to-side, and the whole balloon slowly rotates
      // around its vertical axis.
      const balloonTime = performance.now() * 0.001;
      for (const balloon of balloons) {
        const { group, config, materials } = balloon;
        const z = config.baseZ + cloudProgress * config.speed * CLOUD_TRAVEL;
        const swayX = Math.sin(balloonTime * 0.45 + config.phase) * 0.22;
        const swayY = Math.sin(balloonTime * 0.7 + config.phase * 1.3) * 0.16;
        const swayZ = Math.cos(balloonTime * 0.32 + config.phase) * 0.08;
        group.position.set(config.x + swayX, config.y + swayY, z + swayZ);
        group.rotation.z = Math.sin(balloonTime * 0.5 + config.phase) * 0.1;
        group.rotation.x = Math.cos(balloonTime * 0.45 + config.phase * 1.2) * 0.07;
        group.rotation.y = balloonTime * 0.15 + config.phase;

        // Pass-through fade. Balloons don't get a blur pass — instead they
        // fade out a touch earlier than the clouds so the camera never
        // clips through hard geometry.
        const distAheadB = cameraZ - z;
        let bAlpha = 1;
        if (distAheadB < 2.0) bAlpha = clamp((distAheadB + 1.0) / 3.0);
        if (distAheadB < -1.0) bAlpha = 0;
        if (progress > 0.72) bAlpha *= clamp((0.82 - progress) / 0.1);

        for (const mat of materials) {
          const base = (mat.userData?.baseOpacity as number | undefined) ?? 1;
          (mat as THREE.MeshStandardMaterial | THREE.LineBasicMaterial).opacity =
            bAlpha * base;
        }
        group.visible = bAlpha > 0.01;
      }

      const angledRotationY =
        lerp(-0.12, 0.06, zoomProgress) + Math.sin(performance.now() * 0.00045) * 0.018;
      bookRoot.rotation.y = lerp(angledRotationY, 0, pageViewProgress);
      bookRoot.rotation.x = lerp(lerp(0.03, -0.05, zoomProgress), 0.02, pageViewProgress);
      bookRoot.scale.setScalar(
        lerp(lerp(0.55, mobile ? 1.08 : 1.18, zoomProgress), mobile ? 1.28 : 1.34, pageViewProgress)
      );
      if (bookModel) {
        bookModel.rotation.set(
          lerp(-0.08, 0, pageViewProgress),
          lerp(-0.28, 0, pageViewProgress),
          0
        );
      }

      if (action && mixer) {
        action.time = openProgress * action.getClip().duration;
        mixer.update(0);
      }

      if (overlayRef.current) {
        const overlayProgress = easeOutCubic((progress - 0.92) / 0.08);
        overlayRef.current.style.opacity = `${overlayProgress}`;
        overlayRef.current.style.transform = `translate3d(-50%, calc(-50% + ${lerp(24, 0, overlayProgress)}px), 0)`;
        overlayRef.current.style.pointerEvents = overlayProgress > 0.9 ? "auto" : "none";
      }

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    resize();
    updateScrollProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      if (frameId) window.cancelAnimationFrame(frameId);
      if (scrollFrameId) window.cancelAnimationFrame(scrollFrameId);
      mixer?.stopAllAction();
      clouds.forEach((cloud) => {
        cloud.sharpMesh.geometry.dispose();
        cloud.sharpMat.dispose();
        cloud.blurMat.dispose();
      });
      sharpTexture.dispose();
      blurTexture.dispose();
      skyTexture.dispose();
      balloons.forEach((b) => {
        b.group.traverse((node) => {
          if (node instanceof THREE.Mesh || node instanceof THREE.Line) {
            node.geometry.dispose();
          }
        });
        b.materials.forEach((mat) => mat.dispose());
      });
      envTexture.dispose();
      floor.geometry.dispose();
      dracoLoader.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[600vh] overflow-visible bg-[#0a1432]"
      aria-label="Adventure book"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          ref={canvasRef}
          className="absolute inset-0"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_64%,rgba(232,238,255,0.08),transparent_34%),linear-gradient(180deg,rgba(10,20,50,0.0)_0%,rgba(10,20,50,0.18)_62%,rgba(10,20,50,0.78)_100%)]" />
        <div
          ref={overlayRef}
          className="absolute left-1/2 top-[56%] z-10 flex w-[min(500px,calc(100%-72px))] flex-col items-center text-center opacity-0 max-sm:top-[54%] max-sm:w-[min(340px,calc(100%-56px))]"
          style={{ pointerEvents: "none" }}
        >
          <h2
            className="m-0 text-[clamp(30px,5.4vw,62px)] leading-[0.94] text-[#F8EFE2] drop-shadow-[0_14px_32px_rgba(0,0,0,0.42)] max-sm:text-[clamp(24px,9vw,38px)]"
            style={{ fontFamily: "var(--font-cyrene), Georgia, serif", fontWeight: 500 }}
          >
            Masih ada cerita lain yang menanti
          </h2>
          <button
            type="button"
            className="mt-5 rounded-full border border-[#F8EFE2]/45 bg-[#F8EFE2] px-7 py-3 text-[13px] font-medium uppercase tracking-[0.28em] text-[#2B241D] shadow-[0_18px_45px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:bg-white active:translate-y-0 max-sm:mt-4 max-sm:px-6 max-sm:py-2.5 max-sm:text-[11px]"
          >
            Buka
          </button>
        </div>
      </div>
    </section>
  );
}
