"use client";

import { useEffect, useRef } from "react";

export default function AnimeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;
    console.log('Canvas ref found', canvasRef.current);

    const canvas = canvasRef.current;

    // Mobile CSS fallback — no Three.js
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) return;

    let disposed = false;

    (async () => {
      console.log('Three.js starting');
      const THREE = await import("three");
      if (disposed || !canvas) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const cores = navigator.hardwareConcurrency ?? 4;
      const petalCount = cores < 4 ? 60 : 120;

      // ── Scene ────────────────────────────────────────────────
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x0a0020, 0.02);

      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(0, 0, 5);

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      console.log('Renderer created', renderer);

        // ── Lighting ─────────────────────────────────────────────
        const ambientLight = new THREE.AmbientLight(0xff6b9d, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);

        const pointLight = new THREE.PointLight(0xff9ec4, 1, 20);
        pointLight.position.set(0, 2, 3);
        scene.add(pointLight);

        // ── Cherry Blossoms ───────────────────────────────────────
        const petalGeo = new THREE.PlaneGeometry(0.15, 0.1);
        const petalMat = new THREE.MeshStandardMaterial({
          color: 0xff9ec4,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });

        type Petal = {
          mesh: import("three").Mesh;
          velocityY: number;
          velocityX: number;
          rotSpeedX: number;
          rotSpeedY: number;
          rotSpeedZ: number;
          phase: number;
          amplitude: number;
        };

        const petals: Petal[] = [];

        for (let i = 0; i < petalCount; i++) {
          const mat = petalMat.clone();
          mat.opacity = 0.6 + Math.random() * 0.35;
          const mesh = new THREE.Mesh(petalGeo, mat);
          mesh.position.set(
            (Math.random() - 0.5) * 16,   // x: -8 to 8
            5 + Math.random() * 10,        // y: 5 to 15
            -5 + Math.random() * 7         // z: -5 to 2
          );
          mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          );
          scene.add(mesh);
          petals.push({
            mesh,
            velocityY: -(0.008 + Math.random() * 0.012),
            velocityX: (Math.random() - 0.5) * 0.01,
            rotSpeedX: (Math.random() - 0.5) * 0.02,
            rotSpeedY: (Math.random() - 0.5) * 0.015,
            rotSpeedZ: (Math.random() - 0.5) * 0.01,
            phase: Math.random() * Math.PI * 2,
            amplitude: 0.02 + Math.random() * 0.03,
          });
        }

        // ── Samurai ───────────────────────────────────────────────
        const bodyMat = new THREE.MeshStandardMaterial({
          color: 0x1a0010,
          transparent: true,
          opacity: 0.4,
        });
        const swordMat = new THREE.MeshStandardMaterial({
          color: 0xc0c0c0,
          metalness: 0.9,
          roughness: 0.1,
          transparent: true,
          opacity: 0.4,
        });
        const guardMat = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          transparent: true,
          opacity: 0.4,
        });
        const headMat = new THREE.MeshStandardMaterial({
          color: 0x1a0010,
          transparent: true,
          opacity: 0.4,
        });

        const samuraiGroup = new THREE.Group();

        const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.1), bodyMat);
        body.position.y = 0;
        samuraiGroup.add(body);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), headMat);
        head.position.y = 0.6;
        samuraiGroup.add(head);

        const sword = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.2, 0.05), swordMat);
        sword.rotation.z = Math.PI / 4; // 45 degrees
        sword.position.set(0.4, 0.2, 0);
        samuraiGroup.add(sword);

        const swordGuard = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.05), guardMat);
        swordGuard.rotation.z = Math.PI / 4;
        swordGuard.position.set(0.15, -0.15, 0);
        samuraiGroup.add(swordGuard);

        samuraiGroup.position.set(2, -1, 0);
        samuraiGroup.scale.setScalar(1.5);
        scene.add(samuraiGroup);

        // ── Sword Slash ───────────────────────────────────────────
        function makeSlash(offsetX: number) {
          const pts = [
            new THREE.Vector3(-3, 2, 1),
            new THREE.Vector3(1, -1, 1),
          ];
          const geo = new THREE.BufferGeometry().setFromPoints(pts);
          const mat = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0,
          });
          const line = new THREE.Line(geo, mat);
          line.position.x = offsetX;
          return line;
        }

        const slash1 = makeSlash(0);
        const slash2 = makeSlash(0.1);
        const slash3 = makeSlash(0.2);
        scene.add(slash1, slash2, slash3);

        // ── Animation ─────────────────────────────────────────────
        let time = 0;
        let slashTimer = 0;

        function animate() {
          if (disposed) return;
          rafRef.current = requestAnimationFrame(animate);
          time += 0.01;
          slashTimer += 0.01;

          // Camera idle float
          camera.position.y = Math.sin(time * 0.3) * 0.2;
          camera.position.x = Math.sin(time * 0.2) * 0.1;

          // Petals
          for (const p of petals) {
            p.mesh.position.y += p.velocityY;
            p.mesh.position.x += Math.sin(time + p.phase) * p.amplitude;
            p.mesh.rotation.x += 0.01;
            p.mesh.rotation.z += 0.005;
            if (p.mesh.position.y < -8) {
              p.mesh.position.y = 10;
              p.mesh.position.x = (Math.random() - 0.5) * 16;
            }
          }

          // Samurai breathing
          samuraiGroup.scale.y = 1.5 + Math.sin(time * 0.8) * 0.02;

          // Sword slash: 4s cycle, staggered 0.1s
          const cyclePos = slashTimer % 4;
          function slashOpacity(stagger: number) {
            const c = cyclePos - stagger;
            if (c < 0) return 0;
            if (c < 0.5) return c * 2;
            if (c < 1.0) return 1 - (c - 0.5) * 2;
            return 0;
          }
          (slash1.material as import("three").LineBasicMaterial).opacity = slashOpacity(0);
          (slash2.material as import("three").LineBasicMaterial).opacity = slashOpacity(0.1);
          (slash3.material as import("three").LineBasicMaterial).opacity = slashOpacity(0.2);

          renderer.render(scene, camera);
        }

        animate();

        function onResize() {
          if (disposed || !canvas) return;
          const w = canvas.clientWidth;
          const h = canvas.clientHeight;
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
