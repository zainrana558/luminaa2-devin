"use client";

import { useEffect, useRef } from "react";

export default function AnimeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: import("three").WebGLRenderer | null = null;

    async function init() {
      try {
        const THREE = await import("three");
        if (!canvas) return;

        const dpr = Math.min(window.devicePixelRatio, 2);
        const isMobile = (navigator.hardwareConcurrency ?? 4) < 4;
        const petalCount = isMobile ? 60 : 120;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          60,
          canvas.clientWidth / canvas.clientHeight,
          0.1,
          1000
        );
        camera.position.z = 28;

        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
        renderer.setPixelRatio(dpr);
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setClearColor(0x000000, 0);

        // Lights
        const ambient = new THREE.AmbientLight(0xffb7c5, 0.7);
        scene.add(ambient);
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(5, 10, 7);
        scene.add(dirLight);

        // ── Cherry Blossoms ──────────────────────────────────────
        const petalColors = [0xffb7c5, 0xff8fa3, 0xffc0cb, 0xffaabb, 0xf48fb1];
        type Petal = {
          mesh: import("three").Mesh;
          phase: number;
          vx: number;
          vy: number;
          targetRx: number;
          targetRy: number;
          targetRz: number;
        };
        const petals: Petal[] = [];

        for (let i = 0; i < petalCount; i++) {
          const geo = new THREE.PlaneGeometry(0.3, 0.3);
          const mat = new THREE.MeshStandardMaterial({
            color: petalColors[i % petalColors.length],
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5 + Math.random() * 0.4,
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(
            (Math.random() - 0.5) * 55,
            (Math.random() - 0.5) * 38 + 18,
            (Math.random() - 0.5) * 15
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
            vx: (Math.random() - 0.5) * 0.03,
            vy: -(0.03 + Math.random() * 0.05),
            targetRx: Math.random() * Math.PI * 2,
            targetRy: Math.random() * Math.PI * 2,
            targetRz: Math.random() * Math.PI * 2,
          });
        }

        // ── Samurai Silhouette ───────────────────────────────────
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e });
        const samuraiGroup = new THREE.Group();
        samuraiGroup.position.set(-14, -6, -5);

        // body parts
        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.5), darkMat);
        torso.position.y = 1.1;
        samuraiGroup.add(torso);

        const head = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.5), darkMat);
        head.position.y = 2.8;
        samuraiGroup.add(head);

        const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.8, 0.4), darkMat);
        leftArm.position.set(-1.05, 1.3, 0);
        leftArm.rotation.z = 0.25;
        samuraiGroup.add(leftArm);

        const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.8, 0.4), darkMat);
        rightArm.position.set(1.05, 1.5, 0);
        rightArm.rotation.z = -0.6;
        samuraiGroup.add(rightArm);

        const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.0, 0.45), darkMat);
        leftLeg.position.set(-0.45, -0.8, 0);
        samuraiGroup.add(leftLeg);

        const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.0, 0.45), darkMat);
        rightLeg.position.set(0.45, -0.8, 0);
        samuraiGroup.add(rightLeg);

        scene.add(samuraiGroup);

        // ── Sword Slash ──────────────────────────────────────────
        function makeSlashLine(opacity: number): import("three").LineSegments {
          const points = [
            new THREE.Vector3(-2, 3, 0),
            new THREE.Vector3(3, -1, 0),
          ];
          const geo = new THREE.BufferGeometry().setFromPoints(points);
          const mat = new THREE.LineBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity,
          });
          return new THREE.LineSegments(geo, mat);
        }

        const slash1 = makeSlashLine(0);
        const slash2 = makeSlashLine(0);
        const slash3 = makeSlashLine(0);
        slash2.position.x = 0.15;
        slash3.position.x = 0.3;
        const slashGroup = new THREE.Group();
        slashGroup.position.set(-12, -3, -4);
        slashGroup.add(slash1, slash2, slash3);
        scene.add(slashGroup);

        // Slash timing
        let slashTime = 0;
        const SLASH_PERIOD = 4.0; // repeat every 4s
        const SLASH_DURATION = 1.5;

        // ── Animate ──────────────────────────────────────────────
        let time = 0;
        const samuraiBaseY = samuraiGroup.position.y;

        function animate() {
          rafRef.current = requestAnimationFrame(animate);
          time += 0.016;
          slashTime += 0.016;

          // Camera idle float
          camera.position.y = Math.sin(time * 0.5) * 0.1;

          // Petals: lerp fall with sin wave sway
          for (const p of petals) {
            const target = new THREE.Vector3(
              p.mesh.position.x + p.vx + Math.sin(time + p.phase) * 0.008,
              p.mesh.position.y + p.vy + Math.sin(time + p.phase) * 0.003,
              p.mesh.position.z
            );
            p.mesh.position.lerp(target, 0.05);

            // Lerp rotation
            p.mesh.rotation.x += (p.targetRx - p.mesh.rotation.x) * 0.05;
            p.mesh.rotation.y += (p.targetRy - p.mesh.rotation.y) * 0.05;
            p.mesh.rotation.z += (p.targetRz - p.mesh.rotation.z) * 0.05;

            // Slow drift of targets
            p.targetRx += 0.008;
            p.targetRy += 0.005;
            p.targetRz += 0.003;

            // Reset when fallen off
            if (p.mesh.position.y < -20) {
              p.mesh.position.y = 20;
              p.mesh.position.x = (Math.random() - 0.5) * 55;
            }
          }

          // Samurai idle breathing — sin wave scale lerp
          const breathScale = 1 + Math.sin(time * 1.2) * 0.015;
          torso.scale.y += (breathScale - torso.scale.y) * 0.05;
          samuraiGroup.position.y += (samuraiBaseY + Math.sin(time * 1.2) * 0.03 - samuraiGroup.position.y) * 0.05;

          // Sword slash: opacity lerp 0->1->0 over 1.5s, every 4s
          const slashPhase = slashTime % SLASH_PERIOD;
          let slashOpacity = 0;
          if (slashPhase < SLASH_DURATION) {
            const t = slashPhase / SLASH_DURATION;
            slashOpacity = t < 0.3 ? t / 0.3 : (1 - t) / 0.7;
          }
          (slash1.material as import("three").LineBasicMaterial).opacity += (slashOpacity - (slash1.material as import("three").LineBasicMaterial).opacity) * 0.15;
          (slash2.material as import("three").LineBasicMaterial).opacity += (slashOpacity * 0.6 - (slash2.material as import("three").LineBasicMaterial).opacity) * 0.12;
          (slash3.material as import("three").LineBasicMaterial).opacity += (slashOpacity * 0.3 - (slash3.material as import("three").LineBasicMaterial).opacity) * 0.1;

          renderer!.render(scene, camera);
        }

        animate();

        function onResize() {
          if (!renderer || !canvas) return;
          const w = canvas.clientWidth;
          const h = canvas.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
      } catch {
        // WebGL failed — fallback gradient shows via CSS
      }
    }

    const cleanupPromise = init();

    return () => {
      cancelAnimationFrame(rafRef.current);
      renderer?.dispose();
      cleanupPromise?.then((fn) => fn?.());
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ willChange: "transform" }}
    />
  );
}
