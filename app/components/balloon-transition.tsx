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
  currentY: number;
  endY: number;
  startTime: number;
  duration: number;
  driftX: number;
  flySpeed: number;
  spin: THREE.Vector3;
  baseRotation: THREE.Euler;
};

const easeOutCubic = (value: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, value)), 3);
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
        const xProgress = Math.min(1, Math.max(0, elapsed / balloon.duration));
        const targetY = lerp(balloon.startY, balloon.endY, progress);

        balloon.currentY = lerp(balloon.currentY, targetY, balloon.flySpeed);
        if (elapsed >= balloon.duration && balloon.endY - balloon.currentY < 0.08) {
          balloon.currentY = balloon.endY;
        }

        balloon.mesh.position.y = balloon.currentY;
        balloon.mesh.position.x = balloon.startX + balloon.driftX * xProgress;
        balloon.mesh.rotation.set(
          balloon.baseRotation.x + balloon.spin.x * xProgress,
          balloon.baseRotation.y + balloon.spin.y * xProgress,
          balloon.baseRotation.z + balloon.spin.z * xProgress,
        );

        if (balloon.currentY >= balloon.endY) {
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
          mesh.material = sourceMesh.material;

          const scale = random(0.4, 1.2);
          const col = index % numCols;
          const row = Math.floor(index / numCols);
          const gridX = ((col + 0.5) / numCols) * totalWidth - totalWidth / 2;
          const startX = clamp(gridX + random(-0.3, 0.3), -2.5, 2.5);
          const startY = random(-14, -8) - row * 0.18;
          const endY = random(25, 31);
          const z = random(-2, 2);

          mesh.position.set(startX, startY, z);
          mesh.scale.setScalar(scale);
          mesh.rotation.set(random(-0.2, 0.2), random(-0.35, 0.35), random(-0.2, 0.2));
          mesh.frustumCulled = false;
          balloonGroup.add(mesh);

          return {
            mesh,
            startX,
            startY,
            currentY: startY,
            endY,
            startTime: random(0, 1200),
            duration: random(1500, 2200),
            driftX: random(-0.55, 0.55),
            flySpeed: random(0.06, 0.11),
            spin: new THREE.Vector3(random(-0.25, 0.25), random(-0.45, 0.45), random(-0.25, 0.25)),
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
