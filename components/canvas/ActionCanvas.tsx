"use client";

import { useEffect, useRef } from "react";

export default function ActionCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;
    console.log("ActionCanvas ref found", canvasRef.current);

    const canvas = canvasRef.current;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) return;

    let disposed = false;

    (async () => {
      console.log("ActionCanvas Three.js starting");
      const THREE = await import("three");
      if (disposed || !canvas) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const cores = navigator.hardwareConcurrency ?? 4;
      const sparkCount = cores < 4 ? 75 : 150;

      // ── Scene ──────────────────────────────────────────────────
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050200);
      scene.fog = new THREE.FogExp2(0x050200, 0.015);

      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(0, 0, 6);

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      console.log("ActionCanvas renderer created", renderer);

      // ── Lighting ──────────────────────────────────────────────
      const ambient = new THREE.AmbientLight(0x110800, 0.4);
      scene.add(ambient);

      const pointLight = new THREE.PointLight(0xff4500, 2.0);
      pointLight.position.set(0, 0, 3);
      scene.add(pointLight);

      const dirLight = new THREE.DirectionalLight(0xff8c00, 0.6);
      dirLight.position.set(-3, 4, 2);
      scene.add(dirLight);

      // ── Sparks (Points) ───────────────────────────────────────
      const positions = new Float32Array(sparkCount * 3);
      const opacities = new Float32Array(sparkCount);
      const sizes = new Float32Array(sparkCount);

      type Velocity = { x: number; y: number; z: number };
      const velocities: Velocity[] = [];

      function initSpark(i: number) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.05 + Math.random() * 0.15;
        velocities[i] = {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed + 0.02,
          z: (Math.random() - 0.5) * speed,
        };
        positions[i * 3]     = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;
        opacities[i] = 1.0;
        sizes[i] = 0.06 + Math.random() * 0.04;
      }

      for (let i = 0; i < sparkCount; i++) {
        // Stagger initial positions so they don't all burst at once
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.05 + Math.random() * 0.15;
        velocities.push({
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed + 0.02,
          z: (Math.random() - 0.5) * speed,
        });
        const spread = Math.random() * 3;
        positions[i * 3]     = Math.cos(angle) * spread;
        positions[i * 3 + 1] = Math.sin(angle) * spread;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
        opacities[i] = Math.random();
        sizes[i] = 0.06 + Math.random() * 0.04;
      }

      const sparkGeo = new THREE.BufferGeometry();
      sparkGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      sparkGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

      const sparkMat = new THREE.PointsMaterial({
        color: 0xff6b35,
        size: 0.08,
        transparent: true,
        sizeAttenuation: true,
        opacity: 0.9,
      });

      const sparks = new THREE.Points(sparkGeo, sparkMat);
      scene.add(sparks);

      // ── Shockwaves ────────────────────────────────────────────
      type Ring = {
        mesh: import("three").Mesh;
        mat: import("three").MeshBasicMaterial;
        scale: number;
        opacity: number;
        delay: number;
      };

      const rings: Ring[] = [];
      for (let i = 0; i < 3; i++) {
        const ringGeo = new THREE.RingGeometry(0.1, 0.15, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xff6b35,
          transparent: true,
          opacity: 1.0,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(ringGeo, ringMat);
        scene.add(mesh);
        rings.push({ mesh, mat: ringMat, scale: 0.1 + i * 0.3, opacity: 1.0 - i * 0.3, delay: i * 0.6 });
      }

      // ── Camera shake ──────────────────────────────────────────
      let shakeIntensity = 0;
      let shakeTimer = 0;

      // ── Animation ─────────────────────────────────────────────
      let time = 0;

      function animate() {
        if (disposed) return;
        rafRef.current = requestAnimationFrame(animate);
        time += 0.016;
        shakeTimer += 0.016;

        // Trigger shake every 4s
        if (shakeTimer > 4) {
          shakeTimer = 0;
          shakeIntensity = 0.1;
        }

        // Camera shake with decay
        if (shakeIntensity > 0.001) {
          camera.position.x += (Math.random() - 0.5) * shakeIntensity;
          camera.position.y += (Math.random() - 0.5) * shakeIntensity;
          shakeIntensity *= 0.85;
        } else {
          camera.position.x += (0 - camera.position.x) * 0.05;
          camera.position.y += (0 - camera.position.y) * 0.05;
        }

        // Point light pulse
        pointLight.intensity = 1.5 + Math.sin(time * 3) * 0.5;

        // Update sparks
        for (let i = 0; i < sparkCount; i++) {
          positions[i * 3]     += velocities[i].x;
          positions[i * 3 + 1] += velocities[i].y - 0.002;
          positions[i * 3 + 2] += velocities[i].z;
          opacities[i] -= 0.015;

          if (opacities[i] < 0) {
            initSpark(i);
          }
        }
        sparkGeo.attributes.position.needsUpdate = true;

        // Update shockwaves
        for (const ring of rings) {
          ring.scale += 0.04;
          ring.opacity -= 0.015;
          ring.mesh.scale.x = ring.scale;
          ring.mesh.scale.y = ring.scale;
          ring.mat.opacity = Math.max(0, ring.opacity);

          if (ring.opacity < 0) {
            ring.scale = 0.1;
            ring.opacity = 1.0;
          }
        }

        renderer.render(scene, camera);
      }

      animate();

      function onResize() {
        if (disposed) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      window.addEventListener("resize", onResize);

      (canvas as HTMLCanvasElement & { _cleanup?: () => void })._cleanup = () => {
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        scene.clear();
      };
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafRef.current);
      const c = canvas as HTMLCanvasElement & { _cleanup?: () => void };
      c._cleanup?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        willChange: "transform",
      }}
    />
  );
}
