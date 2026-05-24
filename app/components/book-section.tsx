"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { assetPath } from "../lib/asset-path";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (start: number, end: number, amount: number) => start + (end - start) * amount;
const easeInOutCubic = (value: number) => {
  const t = clamp(value);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const easeOutCubic = (value: number) => 1 - Math.pow(1 - clamp(value), 3);

type CloudConfig = {
  x: number;
  y: number;
  baseZ: number;
  width: number;
  height: number;
  opacity: number;
  speed: number;
  rotation: number;
};

const CLOUD_CONFIGS: CloudConfig[] = [
  { x: 4.5, y: -3.5, baseZ: -11.5, width: 8.5, height: 4.5, opacity: 0.58, speed: 0.42, rotation: 0.04 },
  { x: -5, y: 1, baseZ: -10, width: 9, height: 4.8, opacity: 0.55, speed: 0.45, rotation: -0.06 },
  { x: 2.5, y: -6, baseZ: -9, width: 7.5, height: 4, opacity: 0.5, speed: 0.48, rotation: 0.07 },
  { x: -3.8, y: -2, baseZ: -8, width: 8, height: 4.2, opacity: 0.55, speed: 0.5, rotation: -0.04 },
  { x: 6, y: 2.5, baseZ: -7, width: 7, height: 3.8, opacity: 0.5, speed: 0.53, rotation: 0.05 },
  { x: -1.5, y: -8, baseZ: -6.5, width: 7.2, height: 3.6, opacity: 0.52, speed: 0.55, rotation: -0.05 },
  { x: 3.5, y: 3.5, baseZ: -5, width: 6.5, height: 3.4, opacity: 0.6, speed: 0.6, rotation: 0.06 },
  { x: -4, y: -3.5, baseZ: -4, width: 6.8, height: 3.5, opacity: 0.58, speed: 0.63, rotation: -0.03 },
  { x: 4.2, y: -5.5, baseZ: -3, width: 6.2, height: 3.3, opacity: 0.62, speed: 0.66, rotation: 0.05 },
  { x: -2.5, y: 2, baseZ: -2, width: 6, height: 3.2, opacity: 0.64, speed: 0.7, rotation: -0.07 },
  { x: 1.5, y: -4, baseZ: -1, width: 5.8, height: 3, opacity: 0.66, speed: 0.74, rotation: 0.04 },
  { x: -3.2, y: 0.5, baseZ: 0, width: 5.5, height: 2.9, opacity: 0.68, speed: 0.78, rotation: -0.06 },
  { x: 3, y: 1.8, baseZ: 1, width: 5.2, height: 2.8, opacity: 0.7, speed: 0.82, rotation: 0.05 },
  { x: -1.8, y: -1.5, baseZ: 2, width: 5, height: 2.7, opacity: 0.72, speed: 0.86, rotation: -0.04 },
  { x: 2.5, y: 3.5, baseZ: 2.8, width: 4.8, height: 2.6, opacity: 0.74, speed: 0.9, rotation: 0.06 },
  { x: -2.8, y: 4.5, baseZ: 3.6, width: 4.6, height: 2.5, opacity: 0.76, speed: 0.94, rotation: -0.05 },
  { x: 1.4, y: 1, baseZ: 4.2, width: 4.5, height: 2.4, opacity: 0.78, speed: 0.98, rotation: 0.04 },
  { x: -1, y: 6, baseZ: 4.8, width: 4.4, height: 2.4, opacity: 0.8, speed: 1.02, rotation: -0.07 },
  { x: 2.2, y: 4.5, baseZ: 5.4, width: 4.2, height: 2.3, opacity: 0.82, speed: 1.07, rotation: 0.05 },
  { x: -2.4, y: 6.5, baseZ: 6, width: 4, height: 2.2, opacity: 0.84, speed: 1.12, rotation: -0.06 },
  { x: 1, y: 7.5, baseZ: 6.6, width: 3.8, height: 2.1, opacity: 0.86, speed: 1.18, rotation: 0.04 },
  { x: -1.5, y: 5.5, baseZ: 7.2, width: 3.6, height: 2, opacity: 0.87, speed: 1.24, rotation: 0.07 },
  { x: 2.6, y: 8.5, baseZ: 7.8, width: 3.4, height: 1.9, opacity: 0.88, speed: 1.3, rotation: -0.05 },
  { x: -0.5, y: 9, baseZ: 8.4, width: 3.2, height: 1.8, opacity: 0.9, speed: 1.36, rotation: 0.06 },
];

const CLOUD_TRAVEL = 10;
const CLOUD_BLUR_PX = 28;
const DOF_FAR = 4;
const DOF_NEAR = 0.3;

type BalloonConfig = {
  x: number;
  y: number;
  baseZ: number;
  scale: number;
  speed: number;
  phase: number;
};

const BALLOON_CONFIGS: BalloonConfig[] = [
  { x: 3, y: 1.5, baseZ: -9, scale: 0.55, speed: 0.44, phase: 0.3 },
  { x: -3.5, y: -1, baseZ: -7.5, scale: 0.6, speed: 0.48, phase: 1.7 },
  { x: 4.5, y: -3, baseZ: -6, scale: 0.65, speed: 0.52, phase: 2.9 },
  { x: -2.5, y: 3, baseZ: -4.5, scale: 0.7, speed: 0.6, phase: 4.1 },
  { x: 3.8, y: -1.5, baseZ: -3, scale: 0.75, speed: 0.66, phase: 5.3 },
  { x: -3, y: 4, baseZ: -1.8, scale: 0.7, speed: 0.72, phase: 0.8 },
  { x: 1, y: -2.5, baseZ: 0, scale: 0.8, speed: 0.78, phase: 2 },
  { x: -3.5, y: 1, baseZ: 1.2, scale: 0.78, speed: 0.84, phase: 3.4 },
  { x: 3.2, y: 5, baseZ: 2.5, scale: 0.85, speed: 0.9, phase: 4.6 },
  { x: -1.5, y: 0.8, baseZ: 3.5, scale: 0.9, speed: 0.96, phase: 5.9 },
  { x: 2.5, y: 3.5, baseZ: 4.4, scale: 0.85, speed: 1.02, phase: 1.2 },
  { x: -2.5, y: 5.5, baseZ: 5.6, scale: 0.95, speed: 1.1, phase: 2.5 },
  { x: 1.8, y: 7.5, baseZ: 6.4, scale: 1, speed: 1.2, phase: 3.7 },
  { x: -1.8, y: 6, baseZ: 7.2, scale: 1.05, speed: 1.3, phase: 5 },
];

const BALLOON_COLORS = [
  0xe63946,
  0x2f80ed,
  0x27ae60,
  0xf2c94c,
  0xeb5757,
  0xf2994a,
  0x9b51e0,
  0x56ccf2,
  0xff7eb6,
  0x6fcf97,
];

type BookSectionProps = {
  guestName?: string;
};

export default function BookSection({ guestName = "Novan & Partner" }: BookSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const scene = new THREE.Scene();

    const skyCanvas = document.createElement("canvas");
    skyCanvas.width = 32;
    skyCanvas.height = 1024;
    const skyCtx = skyCanvas.getContext("2d");
    if (skyCtx) {
      const skyGrad = skyCtx.createLinearGradient(0, 0, 0, 1024);
      skyGrad.addColorStop(0, "#0a1432");
      skyGrad.addColorStop(0.22, "#152a55");
      skyGrad.addColorStop(0.45, "#1f4078");
      skyGrad.addColorStop(0.65, "#2e5598");
      skyGrad.addColorStop(0.85, "#4870ad");
      skyGrad.addColorStop(1, "#1f4078");
      skyCtx.fillStyle = skyGrad;
      skyCtx.fillRect(0, 0, 32, 1024);
    }
    const skyTexture = new THREE.CanvasTexture(skyCanvas);
    skyTexture.colorSpace = THREE.SRGBColorSpace;
    skyTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = skyTexture;
    scene.fog = new THREE.Fog(0x2e5598, 16, 70);

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 9, 9);
    camera.lookAt(0, 0, 0);

    const isMobileDevice = window.innerWidth < 768;
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobileDevice, alpha: false });
    // Lower pixel ratio on mobile for better performance
    const targetPixelRatio = isMobileDevice ? 1 : Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(targetPixelRatio);
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

    const cloudGroup = new THREE.Group();
    scene.add(cloudGroup);

    const sharpTexture = new THREE.Texture();
    sharpTexture.colorSpace = THREE.SRGBColorSpace;
    const blurTexture = new THREE.Texture();
    blurTexture.colorSpace = THREE.SRGBColorSpace;

    const cloudImg = new Image();
    cloudImg.crossOrigin = "anonymous";
    cloudImg.onload = () => {
      const textureWidth = 1024;
      const textureHeight = Math.round((cloudImg.naturalHeight * textureWidth) / cloudImg.naturalWidth);

      const sharpCanvas = document.createElement("canvas");
      sharpCanvas.width = textureWidth;
      sharpCanvas.height = textureHeight;
      sharpCanvas.getContext("2d")?.drawImage(cloudImg, 0, 0, textureWidth, textureHeight);
      sharpTexture.image = sharpCanvas;
      sharpTexture.needsUpdate = true;

      const blurCanvas = document.createElement("canvas");
      blurCanvas.width = textureWidth;
      blurCanvas.height = textureHeight;
      const blurCtx = blurCanvas.getContext("2d");
      if (blurCtx) {
        blurCtx.filter = `blur(${CLOUD_BLUR_PX}px)`;
        blurCtx.drawImage(cloudImg, 0, 0, textureWidth, textureHeight);
      }
      blurTexture.image = blurCanvas;
      blurTexture.needsUpdate = true;
    };
    cloudImg.src = assetPath("/cloud.webp");

    type CloudInstance = {
      sharpMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
      blurMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
      sharpMat: THREE.MeshBasicMaterial;
      blurMat: THREE.MeshBasicMaterial;
      config: CloudConfig;
      bobPhase: number;
    };

    const clouds: CloudInstance[] = CLOUD_CONFIGS.map((config, index) => {
      const sharpGeometry = new THREE.PlaneGeometry(config.width, config.height);
      const blurGeometry = new THREE.PlaneGeometry(config.width, config.height);
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
      const sharpMesh = new THREE.Mesh(sharpGeometry, sharpMat);
      const blurMesh = new THREE.Mesh(blurGeometry, blurMat);
      sharpMesh.position.set(config.x, config.y, config.baseZ);
      blurMesh.position.set(config.x, config.y, config.baseZ);
      sharpMesh.renderOrder = 10 + index * 2;
      blurMesh.renderOrder = 11 + index * 2;
      cloudGroup.add(sharpMesh);
      cloudGroup.add(blurMesh);

      return { sharpMesh, blurMesh, sharpMat, blurMat, config, bobPhase: index * 1.7 };
    });

    const balloonGroup = new THREE.Group();
    scene.add(balloonGroup);

    type BalloonInstance = {
      group: THREE.Group;
      config: BalloonConfig;
      materials: THREE.Material[];
    };

    const balloons: BalloonInstance[] = [];

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
    dracoLoader.setDecoderPath(assetPath("/draco/"));

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    let modelsLoaded = false;
    const loadModels = () => {
      if (modelsLoaded) return;
      modelsLoaded = true;

      loader.load(assetPath("/baloon.glb"), (gltf) => {
        const source = gltf.scene;
        source.updateMatrixWorld(true);
        const sourceBox = new THREE.Box3().setFromObject(source);
        const sourceSize = sourceBox.getSize(new THREE.Vector3());
        const maxSourceDim = Math.max(sourceSize.x, sourceSize.y, sourceSize.z);
        const normalizeScale = maxSourceDim > 0 ? 1.2 / maxSourceDim : 1;

        BALLOON_CONFIGS.forEach((config, index) => {
          const group = source.clone(true);
          const materials: THREE.Material[] = [];
          const tintMat = new THREE.MeshStandardMaterial({
            color: BALLOON_COLORS[index % BALLOON_COLORS.length],
            roughness: 0.28,
            metalness: 0,
            transparent: true,
            opacity: 1,
          });
          tintMat.userData.baseOpacity = 1;

          group.traverse((node) => {
            if (!(node instanceof THREE.Mesh)) return;
            node.material = tintMat;
            node.castShadow = false;
            node.receiveShadow = false;
            node.frustumCulled = false;
          });

          const stringPoints: THREE.Vector3[] = [];
          for (let pointIndex = 0; pointIndex <= 12; pointIndex += 1) {
            const t = pointIndex / 12;
            stringPoints.push(new THREE.Vector3(Math.sin(t * Math.PI) * 0.08, -0.65 - t * 2.8, 0));
          }
          const stringGeometry = new THREE.BufferGeometry().setFromPoints(stringPoints);
          const stringMat = new THREE.LineBasicMaterial({
            color: 0xf8efe2,
            transparent: true,
            opacity: 0.42,
          });
          stringMat.userData.baseOpacity = 0.42;
          const stringLine = new THREE.Line(stringGeometry, stringMat);
          group.add(stringLine);

          materials.push(tintMat, stringMat);
          group.position.set(config.x, config.y, config.baseZ);
          group.scale.setScalar(normalizeScale * config.scale);
          group.rotation.set(0.08 * Math.sin(config.phase), config.phase, 0.08 * Math.cos(config.phase));
          balloonGroup.add(group);
          balloons.push({ group, config, materials });
        });
      });

      loader.load(assetPath("/my wedding book copy 2.glb"), (gltf) => {
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
    };

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

        const distAhead = cameraZ - z;
        const blurMix = easeInOutCubic((DOF_FAR - distAhead) / (DOF_FAR - DOF_NEAR));
        let envelope = 1;
        if (distAhead < 1.5) envelope = clamp((distAhead + 1.5) / 3);
        if (distAhead < -1.5) envelope = 0;

        const endFade = progress > 0.72 ? clamp((0.82 - progress) / 0.1) : 1;
        const baseAlpha = config.opacity * envelope * endFade;
        const sharpAlpha = baseAlpha * (1 - blurMix);
        const blurAlpha = Math.min(1, baseAlpha * blurMix * 1.35);

        sharpMat.opacity = sharpAlpha;
        blurMat.opacity = blurAlpha;
        sharpMesh.visible = sharpAlpha > 0.005;
        blurMesh.visible = blurAlpha > 0.005;
        blurMesh.scale.setScalar(1 + clamp((1.8 - distAhead) / 3) * 0.7);
      }

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

        const distAhead = cameraZ - z;
        let alpha = 1;
        if (distAhead < 2) alpha = clamp((distAhead + 1) / 3);
        if (distAhead < -1) alpha = 0;
        if (progress > 0.72) alpha *= clamp((0.82 - progress) / 0.1);

        for (const material of materials) {
          const baseOpacity = (material.userData?.baseOpacity as number | undefined) ?? 1;
          material.opacity = alpha * baseOpacity;
        }
        group.visible = alpha > 0.01;
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
      frameId = isSceneVisible ? window.requestAnimationFrame(animate) : 0;
    };

    let isSceneVisible = false;
    const startAnimation = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(animate);
    };
    const stopAnimation = () => {
      if (!frameId) return;
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const loadObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        loadModels();
        loadObserver.disconnect();
      },
      { root: null, rootMargin: "900px 0px", threshold: 0 },
    );
    loadObserver.observe(section);

    const renderObserver = new IntersectionObserver(
      ([entry]) => {
        isSceneVisible = Boolean(entry?.isIntersecting);
        if (isSceneVisible) {
          resize();
          updateScrollProgress();
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { root: null, rootMargin: "0px", threshold: 0 },
    );
    renderObserver.observe(section);

    resize();
    updateScrollProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      loadObserver.disconnect();
      renderObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      if (frameId) window.cancelAnimationFrame(frameId);
      if (scrollFrameId) window.cancelAnimationFrame(scrollFrameId);
      mixer?.stopAllAction();
      clouds.forEach((cloud) => {
        cloud.sharpMesh.geometry.dispose();
        cloud.blurMesh.geometry.dispose();
        cloud.sharpMat.dispose();
        cloud.blurMat.dispose();
      });
      sharpTexture.dispose();
      blurTexture.dispose();
      skyTexture.dispose();
      balloons.forEach((balloon) => {
        balloon.group.traverse((node) => {
          if (node instanceof THREE.Mesh || node instanceof THREE.Line) {
            node.geometry.dispose();
          }
        });
        balloon.materials.forEach((material) => material.dispose());
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
      id="book-section"
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_64%,rgba(232,238,255,0.08),transparent_34%),linear-gradient(180deg,rgba(10,20,50,0)_0%,rgba(10,20,50,0.18)_62%,rgba(10,20,50,0.78)_100%)]" />
        <div
          ref={overlayRef}
          className="absolute left-1/2 top-[50%] z-10 flex w-[min(500px,calc(100%-72px))] flex-col items-center text-center opacity-0 max-sm:top-[48%] max-sm:w-[min(340px,calc(100%-56px))]"
          style={{ pointerEvents: "none" }}
        >
          <div className="text-[#F8EFE2] drop-shadow-[0_14px_32px_rgba(0,0,0,0.42)]">
            <div
              className="text-[clamp(22px,3.4vw,42px)] leading-[1.25] tracking-[0.18em] max-sm:text-[clamp(18px,6vw,28px)]"
              style={{ fontFamily: "var(--font-cyrene), Georgia, serif", fontWeight: 400 }}
            >
              Kepada Yth.
              <br />
              Bapak/Ibu/Saudara/i
            </div>
            <h2
              className="m-0 mt-7 text-[clamp(22px,3.8vw,46px)] font-semibold uppercase leading-none tracking-[0.16em] max-sm:mt-5 max-sm:text-[clamp(19px,6vw,28px)]"
              style={{ fontFamily: "var(--font-din-alternate), sans-serif" }}
            >
              {guestName}
            </h2>
            <p
              className="m-0 mt-8 text-[clamp(14px,2.2vw,24px)] leading-[1.35] max-sm:mt-5 max-sm:text-[clamp(12px,3.6vw,16px)]"
              style={{ fontFamily: "var(--font-cyrene), Georgia, serif", fontWeight: 400 }}
            >
              *Mohon maaf apabila terdapat kesalahan dalam penulisan nama / gelar
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              window.location.assign("https://minang.dualangka.com/");
            }}
            className="mt-5 rounded-full border border-[#F8EFE2]/45 bg-[#F8EFE2] px-7 py-3 text-[13px] font-medium uppercase tracking-[0.28em] text-[#2B241D] shadow-[0_18px_45px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:bg-white active:translate-y-0 max-sm:mt-4 max-sm:px-6 max-sm:py-2.5 max-sm:text-[11px]"
          >
            Buka Undangan
          </button>
        </div>
      </div>
    </section>
  );
}
