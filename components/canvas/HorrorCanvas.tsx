"use client";

import { useEffect, useRef } from "react";

export default function HorrorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // ── Mobile CSS fallback ───────────────────────────────────────────
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) return;

    let disposed = false;

    (async () => {
      const THREE = await import("three");
      if (disposed || !canvas) return;

      const width  = window.innerWidth;
      const height = window.innerHeight;
      const cores  = navigator.hardwareConcurrency ?? 4;
      const lowPerf = cores < 4;

      const ghostCount = lowPerf ? 4  : 6;
      const fogCount   = lowPerf ? 80 : 150;
      const batCount   = lowPerf ? 5  : 8;

      // ── Scene ─────────────────────────────────────────────────────────
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050a05);
      scene.fog = new THREE.FogExp2(0x050a05, 0.04);

      // ── Camera ────────────────────────────────────────────────────────
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(0, 0, 6);

      // ── Renderer ──────────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);

      // ── Lighting ──────────────────────────────────────────────────────
      const ambientLight = new THREE.AmbientLight(0x002200, 0.3);
      scene.add(ambientLight);

      // Green flicker light
      const flickerLight = new THREE.PointLight(0x00ff44, 0, 20);
      flickerLight.position.set(0, 2, 2);
      scene.add(flickerLight);

      // Purple atmospheric light
      const purpleLight = new THREE.PointLight(0x330033, 0.5, 30);
      purpleLight.position.set(-3, 3, 0);
      scene.add(purpleLight);

      // ── Flicker state ──────────────────────────────────────────────────
      let flickerTarget   = 0;
      let flickerTimer    = 0;

      // ── Ghosts ────────────────────────────────────────────────────────
      type Ghost = {
        group:         import("three").Group;
        bodyMat:       import("three").MeshStandardMaterial;
        tailMat:       import("three").MeshStandardMaterial;
        floatPhase:    number;
        startY:        number;
        opacityTarget: number;
        opacityTimer:  number;
      };

      const ghosts: Ghost[] = [];

      for (let i = 0; i < ghostCount; i++) {
        const group = new THREE.Group();

        const bodyMat = new THREE.MeshStandardMaterial({
          color:       0xeeffee,
          transparent: true,
          opacity:     0.5,
          emissive:    new THREE.Color(0x002200),
          emissiveIntensity: 0.2,
        });
        const tailMat = bodyMat.clone();

        // Body
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), bodyMat);
        group.add(body);

        // Tail — cone flipped upside down
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.6, 16), tailMat);
        tail.rotation.z = Math.PI; // flip
        tail.position.y = -0.5;
        group.add(tail);

        // Eyes
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const eyeGeo = new THREE.SphereGeometry(0.06, 6, 6);

        const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
        eyeL.position.set(-0.12, 0.05, 0.38);
        group.add(eyeL);

        const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
        eyeR.position.set(0.12, 0.05, 0.38);
        group.add(eyeR);

        const startX = -5 + Math.random() * 10;
        const startY = -1 + Math.random() * 4;
        group.position.set(startX, startY, -2 + Math.random() * 3);
        scene.add(group);

        ghosts.push({
          group,
          bodyMat,
          tailMat,
          floatPhase:    Math.random() * Math.PI * 2,
          startY,
          opacityTarget: 0.3 + Math.random() * 0.4,
          opacityTimer:  Math.random() * 2,
        });
      }

      // ── Fog Particles ─────────────────────────────────────────────────
      type FogParticle = {
        mesh:  import("three").Mesh;
        phase: number;
      };

      const fogParticles: FogParticle[] = [];
      const fogGeo = new THREE.SphereGeometry(0.3, 4, 4);

      for (let i = 0; i < fogCount; i++) {
        const fogMat = new THREE.MeshStandardMaterial({
          color:       0x336633,
          transparent: true,
          opacity:     0.05 + Math.random() * 0.1,
        });
        const mesh = new THREE.Mesh(fogGeo, fogMat);
        mesh.position.set(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 8,
          -8 + Math.random() * 12
        );
        scene.add(mesh);
        fogParticles.push({ mesh, phase: Math.random() * Math.PI * 2 });
      }

      // ── Bats ──────────────────────────────────────────────────────────
      type Bat = {
        group:    import("three").Group;
        wingL:    import("three").Mesh;
        wingR:    import("three").Mesh;
        phase:    number;
        startZ:   number;
      };

      const bats: Bat[] = [];
      const wingGeo = new THREE.PlaneGeometry(0.4, 0.2);

      for (let i = 0; i < batCount; i++) {
        const group = new THREE.Group();

        const wingMatL = new THREE.MeshStandardMaterial({
          color:       0x111111,
          transparent: true,
          opacity:     0.9,
          side:        THREE.DoubleSide,
        });
        const wingMatR = new THREE.MeshStandardMaterial({
          color:       0x111111,
          transparent: true,
          opacity:     0.9,
          side:        THREE.DoubleSide,
        });

        const wingL = new THREE.Mesh(wingGeo, wingMatL);
        wingL.position.x = -0.25;
        group.add(wingL);

        const wingR = new THREE.Mesh(wingGeo, wingMatR);
        wingR.position.x = 0.25;
        wingR.rotation.y = Math.PI;
        group.add(wingR);

        const body = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 6, 6),
          new THREE.MeshStandardMaterial({ color: 0x222222 })
        );
        group.add(body);

        const startZ = -4 + Math.random() * 4;
        const phase  = (i / batCount);
        group.position.set(-8, 1, startZ);
        scene.add(group);

        bats.push({ group, wingL, wingR, phase, startZ });
      }

      // ── Resize ────────────────────────────────────────────────────────
      function onResize() {
        if (disposed || !canvas) return;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      window.addEventListener("resize", onResize);

      // ── Animation Loop ─────────────────────────────────────────────────
      let time = 0;

      function lerp(a: number, b: number, t: number) {
        return a + (b - a) * t;
      }

      function animate() {
        if (disposed) return;
        rafRef.current = requestAnimationFrame(animate);
        time        += 0.008;
        flickerTimer += 0.008;

        // ── Flicker light every ~0.1s ──────────────────────────────────
        if (flickerTimer >= 0.1) {
          flickerTimer  = 0;
          flickerTarget = 0.3 + Math.random() * 1.2;
        }
        flickerLight.intensity += (flickerTarget - flickerLight.intensity) * 0.1;

        // ── Camera slow creep ──────────────────────────────────────────
        camera.position.x = Math.sin(time * 0.15) * 0.3;
        camera.position.y = Math.cos(time * 0.1)  * 0.2;

        // ── Ghosts ────────────────────────────────────────────────────
        for (const g of ghosts) {
          // Float
          g.group.position.y  = g.startY + Math.sin(time + g.floatPhase) * 0.4;
          g.group.position.x += Math.sin(time * 0.3 + g.floatPhase) * 0.003;

          // Opacity timer
          g.opacityTimer += 0.008;
          if (g.opacityTimer >= 2) {
            g.opacityTimer   = 0;
            g.opacityTarget  = 0.3 + Math.random() * 0.4;
          }

          // Opacity lerp
          g.bodyMat.opacity += (g.opacityTarget - g.bodyMat.opacity) * 0.02;
          g.tailMat.opacity  = g.bodyMat.opacity;
        }

        // ── Fog drift ─────────────────────────────────────────────────
        for (const f of fogParticles) {
          f.mesh.position.x += Math.sin(time * 0.1 + f.phase) * 0.002;
          f.mesh.position.z += 0.001;
          if (f.mesh.position.z > 4) f.mesh.position.z = -8;
        }

        // ── Bats swoop ────────────────────────────────────────────────
        for (const b of bats) {
          // Wing flap
          b.wingL.rotation.y =  Math.sin(time * 12 + b.phase) * 0.9;
          b.wingR.rotation.y = -Math.sin(time * 12 + b.phase) * 0.9;

          // Bezier-like swoop arc: t cycles 0→1
          const t = ((time * 0.2 + b.phase) % 1 + 1) % 1;
          const x = lerp(-8, 8, t);
          const y = -2 * t * t + 2 * t; // arc: 0 at t=0, peaks at t=0.5, 0 at t=1
          b.group.position.set(x, y + 1, b.startZ);
        }

        renderer.render(scene, camera);
      }

      animate();

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
        position:      "fixed",
        top:           0,
        left:          0,
        width:         "100vw",
        height:        "100vh",
        zIndex:        0,
        pointerEvents: "none",
        willChange:    "transform",
      }}
    />
  );
}
