"use client";

import { useEffect, useRef } from "react";

export default function ComedyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;
    console.log("ComedyCanvas ref found", canvasRef.current);

    const canvas = canvasRef.current;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) return;

    let disposed = false;

    (async () => {
      console.log("ComedyCanvas Three.js starting");
      const THREE = await import("three");
      if (disposed || !canvas) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const cores = navigator.hardwareConcurrency ?? 4;
      const pieceCount = cores < 4 ? 100 : 200;

      // ── Scene ──────────────────────────────────────────────────
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a0f00);

      const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
      camera.position.set(0, 0, 7);

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      console.log("ComedyCanvas renderer created", renderer);

      // ── Lighting ──────────────────────────────────────────────
      const ambient = new THREE.AmbientLight(0xffffff, 1.0);
      scene.add(ambient);

      const dirLight = new THREE.DirectionalLight(0xffd700, 0.8);
      dirLight.position.set(3, 5, 3);
      scene.add(dirLight);

      const pointLightPink = new THREE.PointLight(0xff6b9d, 0.6);
      pointLightPink.position.set(-3, 2, 2);
      scene.add(pointLightPink);

      const pointLightBlue = new THREE.PointLight(0x00bfff, 0.6);
      pointLightBlue.position.set(3, 2, 2);
      scene.add(pointLightBlue);

      // ── Confetti ───────────────────────────────────────────────
      const COLORS = [
        0xff6b9d, 0xf9ca24, 0x6ab04c, 0x74b9ff,
        0xfd79a8, 0xf0932b, 0xa29bfe, 0xff7675,
      ];

      const geo = new THREE.PlaneGeometry(0.12, 0.08);

      type Piece = {
        mesh: import("three").Mesh;
        posX: number;
        posY: number;
        velY: number;
        velX: number;
        rotSpeedX: number;
        rotSpeedZ: number;
        phase: number;
        swayAmp: number;
        bounceY: number;
        bounceVel: number;
      };

      const pieces: Piece[] = [];

      for (let i = 0; i < pieceCount; i++) {
        const mat = new THREE.MeshStandardMaterial({
          color: COLORS[i % COLORS.length],
          transparent: true,
          opacity: 0.9,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geo, mat);
        const posX = (Math.random() - 0.5) * 16;
        const posY = 5 + Math.random() * 10;
        mesh.position.set(posX, posY, (Math.random() - 0.5) * 4);
        mesh.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        scene.add(mesh);
        pieces.push({
          mesh,
          posX,
          posY,
          velY: -(0.03 + Math.random() * 0.04),
          velX: (Math.random() - 0.5) * 0.01,
          rotSpeedX: (Math.random() - 0.5) * 0.05,
          rotSpeedZ: (Math.random() - 0.5) * 0.05,
          phase: Math.random() * Math.PI * 2,
          swayAmp: 0.02 + Math.random() * 0.03,
          bounceY: -4,
          bounceVel: 0,
        });
      }

      // ── Animation ─────────────────────────────────────────────
      let time = 0;

      function animate() {
        if (disposed) return;
        rafRef.current = requestAnimationFrame(animate);
        time += 0.01;

        // Camera gentle rock
        camera.position.y = Math.sin(time * 0.4) * 0.3;
        camera.position.x = Math.cos(time * 0.3) * 0.2;

        for (const p of pieces) {
          // Gravity
          p.velY += -0.001;
          p.posY += p.velY;
          p.posX += Math.sin(time + p.phase) * p.swayAmp;

          p.mesh.rotation.x += p.rotSpeedX;
          p.mesh.rotation.z += p.rotSpeedZ;

          // Bounce
          if (p.posY < p.bounceY) {
            p.posY = p.bounceY;
            p.bounceVel = Math.abs(p.velY) * 0.4;
            p.velY = p.bounceVel;
          }

          // Reset after settled
          if (p.bounceVel < 0.005 && p.posY <= p.bounceY) {
            p.posY = 12;
            p.posX = (Math.random() - 0.5) * 16;
            p.velY = -(0.03 + Math.random() * 0.04);
            p.bounceVel = 0;
          }

          p.mesh.position.x = p.posX;
          p.mesh.position.y = p.posY;
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
