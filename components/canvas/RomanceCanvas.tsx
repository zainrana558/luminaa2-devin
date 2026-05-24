"use client";

import { useEffect, useRef } from "react";

export default function RomanceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;
    console.log("RomanceCanvas ref found", canvasRef.current);

    const canvas = canvasRef.current;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) return;

    let disposed = false;

    (async () => {
      console.log("RomanceCanvas Three.js starting");
      const THREE = await import("three");
      if (disposed || !canvas) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const cores = navigator.hardwareConcurrency ?? 4;
      const heartCount = cores < 4 ? 30 : 60;
      const petalCount = cores < 4 ? 40 : 80;

      // ── Scene ──────────────────────────────────────────────────
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a0010);
      scene.fog = new THREE.Fog(0x2d0a1f, 10, 30);

      const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
      camera.position.set(0, 0, 6);

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      console.log("RomanceCanvas renderer created", renderer);

      // ── Lighting ──────────────────────────────────────────────
      const ambient = new THREE.AmbientLight(0xff69b4, 0.5);
      scene.add(ambient);

      const dirLight = new THREE.DirectionalLight(0xffc0cb, 0.6);
      dirLight.position.set(2, 5, 3);
      scene.add(dirLight);

      const pinkPoint = new THREE.PointLight(0xff1493, 1.0);
      pinkPoint.position.set(0, 0, 4);
      scene.add(pinkPoint);

      const goldPoint = new THREE.PointLight(0xffd700, 0.3);
      goldPoint.position.set(-3, 2, 0);
      scene.add(goldPoint);

      // ── Heart Shape ───────────────────────────────────────────
      const heartShape = new THREE.Shape();
      heartShape.moveTo(0, 0);
      heartShape.bezierCurveTo(0, 0.5, 0.5, 0.5, 0.5, 0);
      heartShape.bezierCurveTo(0.5, -0.5, 0, -0.8, 0, -1);
      heartShape.bezierCurveTo(0, -0.8, -0.5, -0.5, -0.5, 0);
      heartShape.bezierCurveTo(-0.5, 0.5, 0, 0.5, 0, 0);

      const heartGeo = new THREE.ShapeGeometry(heartShape);
      heartGeo.scale(0.15, 0.15, 0.15);

      const heartColors = [0xff6b9d, 0xff1493, 0xffd700, 0xff69b4];

      type Heart = {
        mesh: import("three").Mesh;
        mat: import("three").MeshStandardMaterial;
        posX: number;
        posY: number;
        velY: number;
        swayPhase: number;
        swayAmp: number;
        rotSpeed: number;
        opacityPhase: number;
      };

      const hearts: Heart[] = [];

      for (let i = 0; i < heartCount; i++) {
        const mat = new THREE.MeshStandardMaterial({
          color: heartColors[i % heartColors.length],
          transparent: true,
          opacity: 0.6 + Math.random() * 0.3,
        });
        const mesh = new THREE.Mesh(heartGeo, mat);
        const posX = (Math.random() - 0.5) * 12;
        const posY = (Math.random() - 0.5) * 10 - 2;
        mesh.position.set(posX, posY, (Math.random() - 0.5) * 4);
        mesh.rotation.z = (Math.random() - 0.5) * 0.4;
        scene.add(mesh);
        hearts.push({
          mesh, mat,
          posX, posY,
          velY: 0.008 + Math.random() * 0.012,
          swayPhase: Math.random() * Math.PI * 2,
          swayAmp: 0.008 + Math.random() * 0.015,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          opacityPhase: Math.random() * Math.PI * 2,
        });
      }

      // ── Petals ────────────────────────────────────────────────
      const petalGeo = new THREE.PlaneGeometry(0.12, 0.08);
      const petalColors = [0xffb6c1, 0xffc0cb, 0xff69b4];

      type Petal = {
        mesh: import("three").Mesh;
        posX: number;
        posY: number;
        velY: number;
        velX: number;
        phase: number;
        sway: number;
        rotX: number; rotY: number; rotZ: number;
      };

      const petals: Petal[] = [];

      for (let i = 0; i < petalCount; i++) {
        const mat = new THREE.MeshStandardMaterial({
          color: petalColors[i % petalColors.length],
          transparent: true,
          opacity: 0.55 + Math.random() * 0.3,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(petalGeo, mat);
        const posX = (Math.random() - 0.5) * 14;
        const posY = (Math.random() - 0.5) * 14;
        mesh.position.set(posX, posY, (Math.random() - 0.5) * 5);
        mesh.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        scene.add(mesh);
        petals.push({
          mesh, posX, posY,
          velY: -(0.01 + Math.random() * 0.015),
          velX: (Math.random() - 0.5) * 0.005,
          phase: Math.random() * Math.PI * 2,
          sway: 0.006 + Math.random() * 0.012,
          rotX: (Math.random() - 0.5) * 0.018,
          rotY: (Math.random() - 0.5) * 0.015,
          rotZ: (Math.random() - 0.5) * 0.012,
        });
      }

      // ── Animation ─────────────────────────────────────────────
      let time = 0;

      function animate() {
        if (disposed) return;
        rafRef.current = requestAnimationFrame(animate);
        time += 0.016;

        // Camera romantic drift
        camera.position.x = Math.sin(time * 0.15) * 0.5;
        camera.position.y = Math.cos(time * 0.1) * 0.3;
        camera.lookAt(0, 0, 0);

        // Pink point light pulse
        pinkPoint.intensity = 0.8 + Math.sin(time * 1.5) * 0.3;

        // Hearts float upward
        for (const h of hearts) {
          h.posY += h.velY;
          h.posX += Math.sin(time * 0.8 + h.swayPhase) * h.swayAmp;
          h.mesh.rotation.z += h.rotSpeed;
          h.mat.opacity = 0.6 + Math.sin(time + h.opacityPhase) * 0.2;
          h.mesh.position.x = h.posX;
          h.mesh.position.y = h.posY;
          if (h.posY > 8) {
            h.posY = -6;
            h.posX = (Math.random() - 0.5) * 12;
          }
        }

        // Petals drift diagonally
        for (const p of petals) {
          p.posY += p.velY;
          p.posX += p.velX + Math.sin(time + p.phase) * p.sway;
          p.mesh.rotation.x += p.rotX;
          p.mesh.rotation.y += p.rotY;
          p.mesh.rotation.z += p.rotZ;
          p.mesh.position.x = p.posX;
          p.mesh.position.y = p.posY;
          if (p.posY < -8) {
            p.posY = 8;
            p.posX = (Math.random() - 0.5) * 14;
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
