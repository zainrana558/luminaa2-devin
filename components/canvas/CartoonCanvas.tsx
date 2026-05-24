"use client";

import { useEffect, useRef } from "react";

export default function CartoonCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // ── Mobile CSS fallback ───────────────────────────────────────
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) return;

    let disposed = false;

    (async () => {
      const THREE = await import("three");
      if (disposed || !canvas) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const cores = navigator.hardwareConcurrency ?? 4;
      const lowPerf = cores < 4;

      const bunnyCount     = lowPerf ? 3 : 5;
      const butterflyCount = lowPerf ? 4 : 8;
      const bearCount      = lowPerf ? 2 : 3;

      // ── Scene ─────────────────────────────────────────────────────
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x87CEEB);
      scene.fog = new THREE.Fog(0x87CEEB, 15, 40);

      // ── Camera ────────────────────────────────────────────────────
      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
      camera.position.set(0, 0, 8);

      // ── Renderer ──────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = true;

      // ── Lighting ──────────────────────────────────────────────────
      const ambientLight = new THREE.AmbientLight(0xfff5c3, 0.8);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffd700, 1.2);
      dirLight.position.set(5, 10, 5);
      dirLight.castShadow = true;
      scene.add(dirLight);

      const pointLight = new THREE.PointLight(0x90EE90, 0.5);
      pointLight.position.set(-5, 3, 0);
      scene.add(pointLight);

      // ── Ground ────────────────────────────────────────────────────
      const groundGeo = new THREE.BoxGeometry(30, 0.3, 10);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x4CAF50 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.position.y = -3;
      ground.receiveShadow = true;
      scene.add(ground);

      // ── Hills ─────────────────────────────────────────────────────
      type Hill = {
        mesh: import("three").Mesh;
        phase: number;
      };

      const hillDefs = [
        { x: -6, y: -2.5, r: 3, color: 0x5cb85c, phase: 0 },
        { x:  0, y: -2.8, r: 4, color: 0x4CAF50, phase: 1.2 },
        { x:  6, y: -2.5, r: 3, color: 0x388E3C, phase: 2.4 },
      ];

      const hills: Hill[] = [];
      for (const def of hillDefs) {
        const geo = new THREE.SphereGeometry(def.r, 16, 16);
        const mat = new THREE.MeshStandardMaterial({ color: def.color });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(def.x, def.y, -1);
        mesh.receiveShadow = true;
        scene.add(mesh);
        hills.push({ mesh, phase: def.phase });
      }

      // ── Bunnies ───────────────────────────────────────────────────
      type Bunny = {
        group: import("three").Group;
        earL: import("three").Mesh;
        earR: import("three").Mesh;
        hopPhase: number;
      };

      const bunnyMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
      const bunnies: Bunny[] = [];

      for (let i = 0; i < bunnyCount; i++) {
        const group = new THREE.Group();

        // Body
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), bunnyMat.clone());
        body.castShadow = true;
        group.add(body);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), bunnyMat.clone());
        head.position.y = 0.45;
        head.castShadow = true;
        group.add(head);

        // Ears
        const earGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8);
        const earL = new THREE.Mesh(earGeo, bunnyMat.clone());
        earL.position.set(-0.08, 0.7, 0);
        earL.rotation.z = 0.2;
        group.add(earL);

        const earR = new THREE.Mesh(earGeo, bunnyMat.clone());
        earR.position.set(0.08, 0.7, 0);
        earR.rotation.z = -0.2;
        group.add(earR);

        // Tail
        const tail = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), bunnyMat.clone());
        tail.position.set(0, 0, -0.3);
        group.add(tail);

        const xPos = -6 + (i / (bunnyCount - 1)) * 12;
        const zPos = (Math.random() - 0.5) * 3;
        group.position.set(xPos, -2.5, zPos);
        scene.add(group);

        bunnies.push({ group, earL, earR, hopPhase: Math.random() * Math.PI * 2 });
      }

      // ── Butterflies ───────────────────────────────────────────────
      type Butterfly = {
        group: import("three").Group;
        wingL: import("three").Mesh;
        wingR: import("three").Mesh;
        phase: number;
        startX: number;
      };

      const brightColors = [
        0xFF69B4, 0xFF6347, 0xFFD700, 0x7CFC00,
        0x00CED1, 0xFF1493, 0xFF8C00, 0x9400D3,
      ];

      const butterflies: Butterfly[] = [];
      const wingGeo = new THREE.PlaneGeometry(0.3, 0.2);

      for (let i = 0; i < butterflyCount; i++) {
        const group = new THREE.Group();
        const color = brightColors[i % brightColors.length];

        const wingMatL = new THREE.MeshStandardMaterial({
          color,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
        });
        const wingMatR = new THREE.MeshStandardMaterial({
          color,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
        });

        const wingL = new THREE.Mesh(wingGeo, wingMatL);
        wingL.position.x = -0.15;
        group.add(wingL);

        const wingR = new THREE.Mesh(wingGeo, wingMatR);
        wingR.position.x = 0.15;
        wingR.rotation.y = Math.PI;
        group.add(wingR);

        const startX = -6 + (i / butterflyCount) * 12;
        const phase = Math.random() * Math.PI * 2;
        group.position.set(startX, 1 + Math.random() * 2, 0);
        scene.add(group);

        butterflies.push({ group, wingL, wingR, phase, startX });
      }

      // ── Bears ─────────────────────────────────────────────────────
      type Bear = {
        group: import("three").Group;
        legFL: import("three").Mesh;
        legFR: import("three").Mesh;
        phase: number;
      };

      const bearBodyMat  = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const bearSnoutMat = new THREE.MeshStandardMaterial({ color: 0xD2691E });
      const bears: Bear[] = [];

      for (let i = 0; i < bearCount; i++) {
        const group = new THREE.Group();

        // Body
        const body = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.4, 0.7, 8),
          bearBodyMat.clone()
        );
        body.castShadow = true;
        group.add(body);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), bearBodyMat.clone());
        head.position.y = 0.65;
        head.castShadow = true;
        group.add(head);

        // Ears
        const earL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), bearBodyMat.clone());
        earL.position.set(-0.2, 0.9, 0);
        group.add(earL);

        const earR = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), bearBodyMat.clone());
        earR.position.set(0.2, 0.9, 0);
        group.add(earR);

        // Snout
        const snout = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), bearSnoutMat.clone());
        snout.position.set(0, 0.6, 0.24);
        group.add(snout);

        // Legs
        const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8);
        const legFL = new THREE.Mesh(legGeo, bearBodyMat.clone());
        legFL.position.set(-0.2, -0.4, 0.2);
        group.add(legFL);

        const legFR = new THREE.Mesh(legGeo, bearBodyMat.clone());
        legFR.position.set(0.2, -0.4, 0.2);
        group.add(legFR);

        const xPos = -5 + (i / (bearCount - 1 || 1)) * 10;
        group.position.set(xPos, -2.3, 1);
        scene.add(group);

        bears.push({ group, legFL, legFR, phase: (i / bearCount) * Math.PI * 2 });
      }

      // ── Resize ────────────────────────────────────────────────────
      function onResize() {
        if (disposed || !canvas) return;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      window.addEventListener("resize", onResize);

      // ── Animation Loop ────────────────────────────────────────────
      let time = 0;

      function animate() {
        if (disposed) return;
        rafRef.current = requestAnimationFrame(animate);
        time += 0.01;

        // Camera gentle pan
        camera.position.x = Math.sin(time * 0.1) * 0.5;

        // Hills idle sway
        for (const hill of hills) {
          hill.mesh.scale.x = 1 + Math.sin(time + hill.phase) * 0.01;
        }

        // Bunnies hop
        for (const b of bunnies) {
          b.group.position.y = -2.5 + Math.abs(Math.sin(time * 2 + b.hopPhase)) * 0.8;
          b.earL.rotation.z = 0.2 + Math.sin(time * 3 + b.hopPhase) * 0.1;
          b.earR.rotation.z = -(0.2 + Math.sin(time * 3 + b.hopPhase) * 0.1);
        }

        // Butterflies flutter & path
        for (const bf of butterflies) {
          bf.wingL.rotation.y =  Math.sin(time * 8 + bf.phase) * 0.8;
          bf.wingR.rotation.y = -Math.sin(time * 8 + bf.phase) * 0.8;
          bf.group.position.x = bf.startX + Math.sin(time * 0.5 + bf.phase) * 3;
          bf.group.position.y = 1 + Math.sin(time * 0.3 + bf.phase) * 1.5;
        }

        // Bears walk
        for (const bear of bears) {
          bear.legFL.rotation.x =  Math.sin(time * 3 + bear.phase) * 0.4;
          bear.legFR.rotation.x =  Math.sin(time * 3 + bear.phase + Math.PI) * 0.4;
          bear.group.position.x += 0.005;
          if (bear.group.position.x > 8) bear.group.position.x = -8;
        }

        renderer.render(scene, camera);
      }

      animate();

      // Store cleanup on canvas element
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

  // Mobile CSS fallback
  const isMobileFallback =
    typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;

  if (isMobileFallback) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          pointerEvents: "none",
          background: "linear-gradient(180deg, #87CEEB 0%, #b2e8b2 60%, #4CAF50 100%)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-around",
          paddingBottom: "10%",
          fontSize: "2rem",
        }}
      >
        <span>🐰</span>
        <span>🦋</span>
        <span>🐻</span>
        <span>🦋</span>
        <span>🐰</span>
      </div>
    );
  }

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
