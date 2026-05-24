"use client";

import { useEffect, useRef } from "react";

/**
 * useHeroScene — sparse ambient Three.js particles for the hero banner.
 * 300–400 particles, dark-purple/near-black, opacity 0.2–0.35, slow upward drift.
 * Fully self-contained cleanup on unmount.
 */
export function useHeroScene(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Skip on low-concurrency devices
    const cores = navigator.hardwareConcurrency ?? 4;
    const count = cores < 4 ? 150 : 350;

    let disposed = false;

    (async () => {
      try {
        const THREE = await import("three");
        if (disposed || !canvas) return;

        const w = canvas.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(w, h);
        renderer.setClearColor(0x000000, 0);

        // Sparse particles — dark purple and near-black
        const positions = new Float32Array(count * 3);
        const opacities = new Float32Array(count);
        type Vel = { y: number; x: number };
        const velocities: Vel[] = [];

        for (let i = 0; i < count; i++) {
          positions[i * 3]     = (Math.random() - 0.5) * 20;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
          opacities[i] = 0.2 + Math.random() * 0.15; // 0.2–0.35
          velocities.push({
            y: 0.002 + Math.random() * 0.004, // slow upward
            x: (Math.random() - 0.5) * 0.001,
          });
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        // Alternate dark-purple and near-black
        const mat = new THREE.PointsMaterial({
          color: 0x4a1a6e,
          size: 0.06,
          transparent: true,
          opacity: 0.28,
          sizeAttenuation: true,
        });

        const points = new THREE.Points(geo, mat);
        scene.add(points);

        function animate() {
          if (disposed) return;
          rafRef.current = requestAnimationFrame(animate);

          for (let i = 0; i < count; i++) {
            positions[i * 3]     += velocities[i].x;
            positions[i * 3 + 1] += velocities[i].y;
            // Reset when drifted off top
            if (positions[i * 3 + 1] > 7) {
              positions[i * 3 + 1] = -7;
              positions[i * 3]     = (Math.random() - 0.5) * 20;
            }
          }
          geo.attributes.position.needsUpdate = true;
          renderer.render(scene, camera);
        }
        animate();

        function onResize() {
          if (disposed || !canvas) return;
          const nw = canvas.clientWidth;
          const nh = canvas.clientHeight;
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        }
        window.addEventListener("resize", onResize);

        (canvas as HTMLCanvasElement & { _heroCleanup?: () => void })._heroCleanup = () => {
          window.removeEventListener("resize", onResize);
          renderer.dispose();
          scene.clear();
          geo.dispose();
          mat.dispose();
        };
      } catch {
        // WebGL unavailable — hero renders without particles
      }
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafRef.current);
      const c = canvas as HTMLCanvasElement & { _heroCleanup?: () => void };
      c._heroCleanup?.();
    };
  }, [canvasRef]);
}
