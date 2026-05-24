"use client";

import { useEffect, useRef } from "react";

export default function AnimeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;

    (async () => {
      try {
        const THREE = await import("three");
        if (disposed || !canvas) return;

        const W = canvas.offsetWidth || 800;
        const H = canvas.offsetHeight || 320;
        const cores = navigator.hardwareConcurrency ?? 4;
        const petalCount = cores < 4 ? 60 : 120;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
        camera.position.set(0, 0, 28);

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(W, H);
        renderer.setClearColor(0x000000, 0);

        // Lights
        const ambient = new THREE.AmbientLight(0xffb7c5, 0.8);
        scene.add(ambient);
        const dir = new THREE.DirectionalLight(0xffffff, 1.2);
        dir.position.set(5, 10, 8);
        scene.add(dir);

        // ── Cherry Blossoms ──
        const petalColors = [0xffb7c5, 0xff8fa3, 0xffc0cb, 0xf48fb1, 0xffaabb];
        type Petal = {
          mesh: import("three").Mesh;
          phase: number; sway: number;
          vy: number; vx: number;
          targetRx: number; targetRy: number; targetRz: number;
        };
        const petals: Petal[] = [];

        for (let i = 0; i < petalCount; i++) {
          const geo = new THREE.PlaneGeometry(0.3, 0.3);
          const mat = new THREE.MeshStandardMaterial({
            color: petalColors[i % petalColors.length],
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.55 + Math.random() * 0.35,
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 30 + 15,
            (Math.random() - 0.5) * 10 - 5
          );
          mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          );
          scene.add(mesh);
          petals.push({
            mesh,
            phase: Math.random() * Math.PI * 2,
            sway: 0.008 + Math.random() * 0.006,
            vy: -(0.03 + Math.random() * 0.04),
            vx: (Math.random() - 0.5) * 0.01,
            targetRx: Math.random() * 0.02 - 0.01,
            targetRy: Math.random() * 0.02 - 0.01,
            targetRz: Math.random() * 0.02 - 0.01,
          });
        }

        // ── Samurai silhouette ──
        const samuraiGroup = new THREE.Group();
        samuraiGroup.position.set(10, -4, -2);
        const darkGrey = new THREE.MeshStandardMaterial({ color: 0x1a1a2e });

        // Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.4, 0.5), darkGrey);
        body.position.y = 0;
        samuraiGroup.add(body);
        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.5), darkGrey);
        head.position.y = 1.8;
        samuraiGroup.add(head);
        // Arms
        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.6, 0.35), darkGrey);
        armL.position.set(-1.0, 0.2, 0);
        samuraiGroup.add(armL);
        const armR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.6, 0.35), darkGrey);
        armR.position.set(1.0, 0.2, 0);
        samuraiGroup.add(armR);
        // Legs
        const legL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, 0.4), darkGrey);
        legL.position.set(-0.4, -1.9, 0);
        samuraiGroup.add(legL);
        const legR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, 0.4), darkGrey);
        legR.position.set(0.4, -1.9, 0);
        samuraiGroup.add(legR);
        scene.add(samuraiGroup);

        // ── Sword slash ──
        const slashMat = new THREE.LineBasicMaterial({
          color: 0xffd700,
          transparent: true,
          opacity: 0,
        });
        const slashLines: import("three").Line[] = [];
        const offsets = [0, 0.15, 0.3];
        for (let o = 0; o < 3; o++) {
          const pts = [
            new THREE.Vector3(6 + o * 0.2, 4 - o * 0.3, 0),
            new THREE.Vector3(14 - o * 0.2, -2 + o * 0.3, 0),
          ];
          const geo = new THREE.BufferGeometry().setFromPoints(pts);
          const line = new THREE.Line(geo, slashMat.clone());
          scene.add(line);
          slashLines.push(line);
          void offsets[o]; // suppress unused warning
        }

        let time = 0;
        let slashTimer = 0;
        const SLASH_PERIOD = 4.0;
        const SLASH_DURATION = 1.5;

        function animate() {
          if (disposed) return;
          rafRef.current = requestAnimationFrame(animate);
          time += 0.016;
          slashTimer += 0.016;

          // Camera idle float
          camera.position.y = Math.sin(time * 0.5) * 0.1;

          // Petals
          for (const p of petals) {
            p.mesh.position.y += p.vy;
            p.mesh.position.x += p.vx + Math.sin(time + p.phase) * p.sway;
            p.mesh.rotation.x += (p.targetRx - p.mesh.rotation.x) * 0.05;
            p.mesh.rotation.y += (p.targetRy - p.mesh.rotation.y) * 0.05;
            p.mesh.rotation.z += (p.targetRz - p.mesh.rotation.z) * 0.05;
            if (p.mesh.position.y < -17) {
              p.mesh.position.y = 17;
              p.mesh.position.x = (Math.random() - 0.5) * 50;
              p.targetRx = Math.random() * 0.02 - 0.01;
              p.targetRy = Math.random() * 0.02 - 0.01;
              p.targetRz = Math.random() * 0.02 - 0.01;
            }
          }

          // Samurai breathing
          const breathScale = 1 + Math.sin(time * 1.2) * 0.008;
          samuraiGroup.scale.y += (breathScale - samuraiGroup.scale.y) * 0.05;

          // Sword slash
          if (slashTimer > SLASH_PERIOD) slashTimer = 0;
          const t = slashTimer / SLASH_DURATION;
          for (let i = 0; i < slashLines.length; i++) {
            const mat = slashLines[i].material as import("three").LineBasicMaterial;
            let targetOpacity = 0;
            if (slashTimer < SLASH_DURATION) {
              const staggerT = Math.max(0, t - i * 0.12);
              targetOpacity = staggerT < 0.5
                ? staggerT * 2
                : Math.max(0, 1 - (staggerT - 0.5) * 2);
            }
            mat.opacity += (targetOpacity - mat.opacity) * 0.12;
          }

          renderer.render(scene, camera);
        }
        animate();

        function onResize() {
          if (!canvas || disposed) return;
          const w = canvas.offsetWidth;
          const h = canvas.offsetHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
        window.addEventListener("resize", onResize);

        // Store cleanup
        (canvas as HTMLCanvasElement & { _cleanup?: () => void })._cleanup = () => {
          window.removeEventListener("resize", onResize);
          renderer.dispose();
        };
      } catch {
        // WebGL failed — fallback gradient shows via CSS
      }
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
      className="absolute inset-0 h-full w-full"
      style={{ willChange: "transform" }}
    />
  );
}
