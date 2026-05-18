"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type BalloonTransitionProps = {
  onComplete: () => void;
};

type BalloonAnimation = {
  mesh: THREE.Mesh;
  startX: number;
  startY: number;
  startZ: number;
  currentY: number;
  currentZ: number;
  endY: number;
  endZ: number;
  startTime: number;
  duration: number;
  driftX: number;
  flySpeed: number;
  baseScale: number;
  endScale: number;
  opacityStart: number;
  opacityEnd: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmount: number;
  spin: THREE.Vector3;
  baseRotation: THREE.Euler;
};

const easeOutCubic = (value: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, value)), 3);
const easeInOutSine = (value: number) => {
  const t = Math.min(1, Math.max(0, value));
  return -(Math.cos(Math.PI * t) - 1) / 2;
};
const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const random = (min: number, max: number) => min + Math.random() * (max - min);

export default function BalloonTransition({ onComplete }: BalloonTransitionProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    let frameId = 0;
    let isDisposed = false;
    let startedAt = 0;
    let animations: BalloonAnimation[] = [];

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const finish = () => {
      if (isDisposed) return;
      onCompleteRef.current();
    };

    const animate = (time: number) => {
      if (isDisposed) return;

      if (!startedAt) startedAt = time;
      let exitedCount = 0;

      for (const balloon of animations) {
        const elapsed = time - startedAt - balloon.startTime;
        const progress = elapsed <= 0 ? 0 : easeOutCubic(elapsed / balloon.duration);
        const depthProgress = elapsed <= 0 ? 0 : easeInOutSine(elapsed / balloon.duration);
        const xProgress = Math.min(1, Math.max(0, elapsed / balloon.duration));
        const targetY = lerp(balloon.startY, balloon.endY, progress);
        const targetZ = lerp(balloon.startZ, balloon.endZ, depthProgress);
        const targetScale = lerp(balloon.baseScale, balloon.endScale, depthProgress);
        const opacityProgress = clamp((xProgress - balloon.opacityStart) / (balloon.opacityEnd - balloon.opacityStart), 0, 1);
        const opacity = lerp(1, 0, easeOutCubic(opacityProgress));
        const sway = Math.sin(time * 0.001 * balloon.swaySpeed + balloon.swayPhase) * balloon.swayAmount * (1 - opacityProgress * 0.6);

        balloon.currentY = lerp(balloon.currentY, targetY, balloon.flySpeed);
        balloon.currentZ = lerp(balloon.currentZ, targetZ, balloon.flySpeed);
        if (elapsed >= balloon.duration && balloon.endY - balloon.currentY < 0.08) {
          balloon.currentY = balloon.endY;
          balloon.currentZ = balloon.endZ;
        }

        balloon.mesh.position.y = balloon.currentY;
        balloon.mesh.position.x = balloon.startX + balloon.driftX * xProgress + sway;
        balloon.mesh.position.z = balloon.currentZ;
        balloon.mesh.scale.setScalar(targetScale);
        balloon.mesh.rotation.set(
          balloon.baseRotation.x + balloon.spin.x * xProgress + Math.sin(time * 0.0014 + balloon.swayPhase) * 0.06,
          balloon.baseRotation.y + balloon.spin.y * xProgress,
          balloon.baseRotation.z + balloon.spin.z * xProgress + Math.cos(time * 0.0012 + balloon.swayPhase) * 0.04,
        );
        const materials = Array.isArray(balloon.mesh.material) ? balloon.mesh.material : [balloon.mesh.material];
        materials.forEach((material) => {
          material.opacity = opacity;
        });

        if (balloon.currentY >= balloon.endY || opacity <= 0.02) {
          exitedCount += 1;
        }
      }

      renderer.render(scene, camera);

      if (animations.length > 0 && exitedCount === animations.length) {
        finish();
        return;
      }

      frameId = window.requestAnimationFrame(animate);
    };

    const loader = new GLTFLoader();
    loader.load(
      "/hero/balloons/baloon.glb",
      (gltf) => {
        if (isDisposed) return;

        const meshes: THREE.Mesh[] = [];
        const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.15, metalness: 0 });
        const whiteMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.15, metalness: 0 });

        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = Math.random() > 0.5 ? blackMat : whiteMat;
            meshes.push(child);
          }
        });

        if (meshes.length === 0) {
          finish();
          return;
        }

        const balloonGroup = new THREE.Group();
        const totalWidth = 5;
        const numCols = 18;
        const cloneTargets = meshes.flatMap((mesh) => {
          const cloneCount = Math.random() > 0.5 ? 4 : 3;
          return Array.from({ length: cloneCount }, () => mesh);
        });
        const sortedMeshes = cloneTargets.sort(() => Math.random() - 0.5);

        animations = sortedMeshes.map((sourceMesh, index) => {
          const mesh = sourceMesh.clone();
          mesh.geometry = sourceMesh.geometry;
          const sourceMaterials = Array.isArray(sourceMesh.material) ? sourceMesh.material : [sourceMesh.material];
          const materials = sourceMaterials.map((material) => {
            const cloned = material.clone();
            cloned.transparent = true;
            cloned.opacity = 1;
            cloned.depthWrite = false;
            return cloned;
          });
          mesh.material = Array.isArray(sourceMesh.material) ? materials : materials[0];

          const isNearCamera = index % 13 === 0 || index < 8;
          const baseScale = random(0.42, 1.05) * (isNearCamera ? random(1.35, 1.9) : 1);
          const col = index % numCols;
          const row = Math.floor(index / numCols);
          const gridX = ((col + 0.5) / numCols) * totalWidth - totalWidth / 2;
          const startX = isNearCamera ? random(-1.8, 1.8) : clamp(gridX + random(-0.3, 0.3), -2.5, 2.5);
          const startY = isNearCamera ? random(-9.5, -6) : random(-14, -8) - row * 0.18;
          const endY = isNearCamera ? random(12, 18) : random(23, 30);
          const startZ = isNearCamera ? random(-1.6, 0.8) : random(-3.2, 1.4);
          const endZ = isNearCamera ? random(5.4, 7.1) : random(2.4, 5.4);
          const endScale = baseScale * (isNearCamera ? random(3.8, 5.8) : random(1.55, 2.55));

          mesh.position.set(startX, startY, startZ);
          mesh.scale.setScalar(baseScale);
          mesh.rotation.set(random(-0.2, 0.2), random(-0.35, 0.35), random(-0.2, 0.2));
          mesh.frustumCulled = false;
          balloonGroup.add(mesh);

          return {
            mesh,
            startX,
            startY,
            startZ,
            currentY: startY,
            currentZ: startZ,
            endY,
            endZ,
            startTime: isNearCamera ? random(160, 820) : random(0, 1300),
            duration: isNearCamera ? random(2100, 2850) : random(1800, 2800),
            driftX: random(-0.72, 0.72),
            flySpeed: random(0.07, 0.13),
            baseScale,
            endScale,
            opacityStart: isNearCamera ? 0.68 : 0.8,
            opacityEnd: isNearCamera ? 0.98 : 1,
            swayPhase: random(0, Math.PI * 2),
            swaySpeed: random(0.7, 1.35),
            swayAmount: random(0.04, 0.16),
            spin: new THREE.Vector3(random(-0.18, 0.18), random(-0.3, 0.3), random(-0.18, 0.18)),
            baseRotation: mesh.rotation.clone(),
          };
        });

        scene.add(balloonGroup);
        frameId = window.requestAnimationFrame(animate);
      },
      undefined,
      () => {
        finish();
      },
    );

    window.addEventListener("resize", handleResize);

    return () => {
      isDisposed = true;
      window.removeEventListener("resize", handleResize);
      if (frameId) window.cancelAnimationFrame(frameId);
      const disposedGeometries = new Set<THREE.BufferGeometry>();
      const disposedMaterials = new Set<THREE.Material>();
      scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        if (!disposedGeometries.has(child.geometry)) {
          child.geometry.dispose();
          disposedGeometries.add(child.geometry);
        }

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
          if (disposedMaterials.has(material)) return;
          material.dispose();
          disposedMaterials.add(material);
        });
      });
      renderer.dispose();
      mount.replaceChildren();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
}
