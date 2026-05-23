"use client";

import { useEffect, useRef } from "react";

export default function CherryBlossoms() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let THREE: typeof import("three") | null = null;
    let renderer: import("three").WebGLRenderer | null = null;

    async function init() {
      try {
        THREE = await import("three");
        if (!canvas || !THREE) return;

        const dpr = Math.min(window.devicePixelRatio, 2);
        const count = Math.floor(
          dpr > 1 ? 80 : 150
        );

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;

        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
        renderer.setPixelRatio(dpr);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);

        // Petals
        const petals: {
          mesh: import("three").Mesh;
          vx: number; vy: number; vz: number;
          rx: number; ry: number; rz: number;
        }[] = [];

        const colors = [0xffb7c5, 0xff8fa3, 0xffc0cb, 0xffaabb, 0xf48fb1];

        for (let i = 0; i < count; i++) {
          const geo = new THREE.PlaneGeometry(0.35, 0.25);
          const mat = new THREE.MeshBasicMaterial({
            color: colors[i % colors.length],
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.55 + Math.random() * 0.35,
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 40 + 20,
            (Math.random() - 0.5) * 20
          );
          mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          );
          scene.add(mesh);
          petals.push({
            mesh,
            vx: (Math.random() - 0.5) * 0.04,
            vy: -(0.04 + Math.random() * 0.06),
            vz: (Math.random() - 0.5) * 0.02,
            rx: (Math.random() - 0.5) * 0.015,
            ry: (Math.random() - 0.5) * 0.015,
            rz: (Math.random() - 0.5) * 0.01,
          });
        }

        function animate() {
          rafRef.current = requestAnimationFrame(animate);
          for (const p of petals) {
            p.mesh.position.x += p.vx;
            p.mesh.position.y += p.vy;
            p.mesh.position.z += p.vz;
            p.mesh.rotation.x += p.rx;
            p.mesh.rotation.y += p.ry;
            p.mesh.rotation.z += p.rz;
            // Reset when off screen
            if (p.mesh.position.y < -22) {
              p.mesh.position.y = 22;
              p.mesh.position.x = (Math.random() - 0.5) * 60;
            }
          }
          renderer!.render(scene, camera);
        }
        animate();

        function onResize() {
          if (!renderer || !THREE) return;
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
      } catch {
        // Three.js failed — canvas stays hidden, gradient bg shows
      }
    }

    const cleanup = init();

    return () => {
      cancelAnimationFrame(rafRef.current);
      renderer?.dispose();
      cleanup?.then((fn) => fn?.());
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ willChange: "transform", zIndex: 0 }}
    />
  );
}
