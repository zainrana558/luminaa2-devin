"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useThemeStore } from "@/lib/store/themeStore";
import type { Theme } from "@/lib/store/themeStore";

// ─── Shared helpers ───────────────────────────────────────────────────────────
function randRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

// ─── ANIME — Cherry blossoms + swordsman silhouette ───────────────────────────
function AnimeScene() {
  const COUNT = 220;
  const petalRef = useRef<THREE.Points>(null!);
  const swordRef = useRef<THREE.Mesh>(null!);
  const slashRef = useRef<THREE.Mesh>(null!);
  const slashProgress = useRef(0);

  const { positions, speeds, phases, sizes } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    const phases = new Float32Array(COUNT);
    const sizes = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = randRange(-14, 14);
      positions[i * 3 + 1] = randRange(-8, 10);
      positions[i * 3 + 2] = randRange(-3, 3);
      speeds[i]  = randRange(0.018, 0.048);
      phases[i]  = Math.random() * Math.PI * 2;
      sizes[i]   = randRange(0.04, 0.11);
    }
    return { positions, speeds, phases, sizes };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!petalRef.current) return;
    const pos = petalRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     += Math.sin(t * 0.5 + phases[i]) * 0.012;
      pos[i * 3 + 1] -= speeds[i];
      if (pos[i * 3 + 1] < -8) {
        pos[i * 3 + 1] = 10;
        pos[i * 3]     = randRange(-14, 14);
      }
    }
    petalRef.current.geometry.attributes.position.needsUpdate = true;

    // Swordsman subtle sway
    if (swordRef.current) {
      swordRef.current.rotation.z = Math.sin(t * 0.6) * 0.06;
      swordRef.current.position.y = -3.2 + Math.sin(t * 1.1) * 0.08;
    }

    // Sword slash arc
    if (slashRef.current) {
      slashProgress.current = (slashProgress.current + 0.022) % (Math.PI * 2);
      const prog = slashProgress.current;
      slashRef.current.rotation.z = -1.2 + Math.sin(prog) * 2.4;
      (slashRef.current.material as THREE.MeshBasicMaterial).opacity =
        Math.max(0, Math.sin(prog) * 0.65);
    }
  });

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  // Swordsman body (tall dark silhouette)
  const bodyGeo = useMemo(() => new THREE.CapsuleGeometry(0.22, 1.4, 4, 8), []);
  // Sword blade
  const bladeGeo = useMemo(() => new THREE.PlaneGeometry(0.07, 1.8), []);
  // Slash arc mesh
  const slashGeo = useMemo(() => new THREE.RingGeometry(1.0, 1.15, 32, 1, 0, 2.2), []);

  return (
    <group>
      {/* Cherry blossoms */}
      <points ref={petalRef} geometry={geo}>
        <pointsMaterial
          color={new THREE.Color(1.0, 0.65, 0.78)}
          size={0.07}
          transparent
          opacity={0.72}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Swordsman silhouette — bottom right */}
      <group position={[4.5, -3.2, -1]}>
        <mesh ref={swordRef} geometry={bodyGeo}>
          <meshBasicMaterial color={new THREE.Color(0.05, 0.03, 0.12)} transparent opacity={0.88} />
        </mesh>
        {/* Blade */}
        <mesh geometry={bladeGeo} position={[0.55, 0.8, 0]} rotation={[0, 0, -0.5]}>
          <meshBasicMaterial color={new THREE.Color(0.75, 0.95, 1.0)} transparent opacity={0.9} />
        </mesh>
      </group>

      {/* Slash arc */}
      <mesh ref={slashRef} geometry={slashGeo} position={[5.0, -2.4, -0.5]}>
        <meshBasicMaterial
          color={new THREE.Color(0.0, 0.9, 1.0)}
          transparent
          opacity={0.0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ─── CARTOON — Grassy meadow with bees, butterflies, rabbits ──────────────────
function CartoonScene() {
  const COUNT = 180;
  const particlesRef = useRef<THREE.Points>(null!);
  const beeRef = useRef<THREE.InstancedMesh>(null!);
  const BEE_COUNT = 12;

  const { positions, phases } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const phases = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = randRange(-14, 14);
      positions[i * 3 + 1] = randRange(-8, 10);
      positions[i * 3 + 2] = randRange(-4, 2);
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, phases };
  }, []);

  const beeOffsets = useMemo(() =>
    Array.from({ length: BEE_COUNT }, () => ({
      x: randRange(-10, 10),
      baseY: randRange(-1, 4),
      speed: randRange(0.7, 1.8),
      phase: Math.random() * Math.PI * 2,
    }))
  , []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (particlesRef.current) {
      const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < COUNT; i++) {
        pos[i * 3]     += Math.sin(t * 0.4 + phases[i]) * 0.006;
        pos[i * 3 + 1] += Math.cos(t * 0.3 + phases[i]) * 0.004;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
    if (beeRef.current) {
      beeOffsets.forEach((b, idx) => {
        dummy.position.set(
          b.x + Math.sin(t * b.speed + b.phase) * 2.5,
          b.baseY + Math.sin(t * b.speed * 1.4 + b.phase) * 0.6,
          0
        );
        dummy.scale.setScalar(0.22);
        dummy.updateMatrix();
        beeRef.current.setMatrixAt(idx, dummy.matrix);
      });
      beeRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const beeGeo = useMemo(() => new THREE.SphereGeometry(1, 6, 4), []);

  return (
    <group>
      <points ref={particlesRef} geometry={geo}>
        <pointsMaterial
          color={new THREE.Color(0.4, 0.95, 0.4)}
          size={0.06}
          transparent
          opacity={0.55}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      {/* Bees as yellow orbs */}
      <instancedMesh ref={beeRef} args={[beeGeo, undefined, BEE_COUNT]}>
        <meshBasicMaterial color={new THREE.Color(1.0, 0.88, 0.1)} transparent opacity={0.82} />
      </instancedMesh>
    </group>
  );
}

// ─── SCI-FI — Galaxy + shooting stars ─────────────────────────────────────────
function ScifiScene() {
  const STAR_COUNT = 400;
  const SHOOT_COUNT = 8;
  const starsRef = useRef<THREE.Points>(null!);
  const shootRef = useRef<THREE.Points>(null!);

  const starData = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);
    for (let i = 0; i < STAR_COUNT; i++) {
      positions[i * 3]     = randRange(-18, 18);
      positions[i * 3 + 1] = randRange(-10, 10);
      positions[i * 3 + 2] = randRange(-8, 0);
      sizes[i] = randRange(0.02, 0.07);
    }
    return positions;
  }, []);

  const shootData = useMemo(() => {
    const positions = new Float32Array(SHOOT_COUNT * 3);
    const vx = new Float32Array(SHOOT_COUNT);
    const vy = new Float32Array(SHOOT_COUNT);
    for (let i = 0; i < SHOOT_COUNT; i++) {
      positions[i * 3]     = randRange(-16, 8);
      positions[i * 3 + 1] = randRange(2, 8);
      positions[i * 3 + 2] = randRange(-3, 0);
      vx[i] = randRange(0.08, 0.18);
      vy[i] = randRange(-0.05, -0.02);
    }
    return { positions, vx, vy };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (starsRef.current) {
      starsRef.current.rotation.y = t * 0.008;
      starsRef.current.rotation.x = Math.sin(t * 0.004) * 0.05;
    }
    if (shootRef.current) {
      const pos = shootRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < SHOOT_COUNT; i++) {
        pos[i * 3]     += shootData.vx[i];
        pos[i * 3 + 1] += shootData.vy[i];
        if (pos[i * 3] > 18 || pos[i * 3 + 1] < -10) {
          pos[i * 3]     = randRange(-18, 0);
          pos[i * 3 + 1] = randRange(2, 9);
        }
      }
      shootRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const starGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(starData, 3));
    return g;
  }, [starData]);

  const shootGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(shootData.positions, 3));
    return g;
  }, [shootData.positions]);

  return (
    <group>
      {/* Galaxy stars */}
      <points ref={starsRef} geometry={starGeo}>
        <pointsMaterial
          color={new THREE.Color(0.8, 0.95, 1.0)}
          size={0.045}
          transparent
          opacity={0.7}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      {/* Shooting stars — brighter, larger */}
      <points ref={shootRef} geometry={shootGeo}>
        <pointsMaterial
          color={new THREE.Color(0.6, 1.0, 0.85)}
          size={0.22}
          transparent
          opacity={0.92}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// ─── HORROR — Spooky fog, ghosts, red lightning ────────────────────────────────
function HorrorScene() {
  const FOG_COUNT = 160;
  const GHOST_COUNT = 5;
  const fogRef = useRef<THREE.Points>(null!);
  const ghostRef = useRef<THREE.InstancedMesh>(null!);
  const lightningRef = useRef<THREE.Mesh>(null!);
  const lightningTimer = useRef(0);

  const fogData = useMemo(() => {
    const positions = new Float32Array(FOG_COUNT * 3);
    const phases = new Float32Array(FOG_COUNT);
    for (let i = 0; i < FOG_COUNT; i++) {
      positions[i * 3]     = randRange(-14, 14);
      positions[i * 3 + 1] = randRange(-6, 2);
      positions[i * 3 + 2] = randRange(-4, 2);
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, phases };
  }, []);

  const ghostOffsets = useMemo(() =>
    Array.from({ length: GHOST_COUNT }, () => ({
      x: randRange(-10, 10),
      baseY: randRange(-2, 5),
      speed: randRange(0.2, 0.5),
      phase: Math.random() * Math.PI * 2,
    }))
  , []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (fogRef.current) {
      const pos = fogRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < FOG_COUNT; i++) {
        pos[i * 3]     += Math.sin(t * 0.3 + fogData.phases[i]) * 0.007;
        pos[i * 3 + 1] += Math.cos(t * 0.2 + fogData.phases[i]) * 0.003;
      }
      fogRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (ghostRef.current) {
      ghostOffsets.forEach((g, idx) => {
        dummy.position.set(
          g.x + Math.sin(t * g.speed + g.phase) * 2.2,
          g.baseY + Math.sin(t * g.speed * 0.8 + g.phase) * 1.2,
          -1
        );
        dummy.scale.setScalar(0.6 + Math.sin(t * g.speed + g.phase) * 0.12);
        dummy.updateMatrix();
        ghostRef.current.setMatrixAt(idx, dummy.matrix);
      });
      ghostRef.current.instanceMatrix.needsUpdate = true;
    }

    // Red lightning flash
    lightningTimer.current += 0.016;
    if (lightningRef.current) {
      const mat = lightningRef.current.material as THREE.MeshBasicMaterial;
      if (lightningTimer.current > randRange(2.5, 5.0)) {
        mat.opacity = 0.85;
        lightningTimer.current = 0;
      } else {
        mat.opacity = Math.max(0, mat.opacity - 0.08);
      }
    }
  });

  const fogGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(fogData.positions, 3));
    return g;
  }, [fogData.positions]);

  const ghostGeo = useMemo(() => new THREE.CapsuleGeometry(0.35, 0.55, 4, 8), []);
  const lightningGeo = useMemo(() => new THREE.PlaneGeometry(0.08, 7), []);

  return (
    <group>
      {/* Fog particles */}
      <points ref={fogRef} geometry={fogGeo}>
        <pointsMaterial
          color={new THREE.Color(0.55, 0.45, 0.55)}
          size={0.28}
          transparent
          opacity={0.18}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Ghosts */}
      <instancedMesh ref={ghostRef} args={[ghostGeo, undefined, GHOST_COUNT]}>
        <meshBasicMaterial color={new THREE.Color(0.85, 0.8, 0.9)} transparent opacity={0.18} />
      </instancedMesh>

      {/* Red lightning bolt */}
      <mesh ref={lightningRef} geometry={lightningGeo} position={[2.5, 1.0, -0.5]} rotation={[0, 0, 0.15]}>
        <meshBasicMaterial color={new THREE.Color(1.0, 0.0, 0.1)} transparent opacity={0.0} />
      </mesh>
    </group>
  );
}

// ─── ACTION — Sparks, flying embers, metallic flashes ─────────────────────────
function ActionScene() {
  const EMBER_COUNT = 280;
  const emberRef = useRef<THREE.Points>(null!);

  const emberData = useMemo(() => {
    const positions = new Float32Array(EMBER_COUNT * 3);
    const vx = new Float32Array(EMBER_COUNT);
    const vy = new Float32Array(EMBER_COUNT);
    const phases = new Float32Array(EMBER_COUNT);
    for (let i = 0; i < EMBER_COUNT; i++) {
      positions[i * 3]     = randRange(-12, 12);
      positions[i * 3 + 1] = randRange(-8, -1);
      positions[i * 3 + 2] = randRange(-3, 3);
      vx[i] = (Math.random() - 0.5) * 0.06;
      vy[i] = randRange(0.025, 0.1);
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, vx, vy, phases };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!emberRef.current) return;
    const pos = emberRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < EMBER_COUNT; i++) {
      pos[i * 3]     += emberData.vx[i] + Math.sin(t + emberData.phases[i]) * 0.008;
      pos[i * 3 + 1] += emberData.vy[i];
      if (pos[i * 3 + 1] > 8) {
        pos[i * 3 + 1] = -8;
        pos[i * 3]     = randRange(-12, 12);
        emberData.vy[i] = randRange(0.025, 0.1);
      }
    }
    emberRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(emberData.positions, 3));
    return g;
  }, [emberData.positions]);

  return (
    <points ref={emberRef} geometry={geo}>
      <pointsMaterial
        color={new THREE.Color(1.0, 0.55, 0.05)}
        size={0.055}
        transparent
        opacity={0.78}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ─── ROMANCE — Rose petals, glowing hearts, warm light ────────────────────────
function RomanceScene() {
  const PETAL_COUNT = 200;
  const HEART_COUNT = 18;
  const petalRef = useRef<THREE.Points>(null!);
  const heartRef = useRef<THREE.Points>(null!);

  const petalData = useMemo(() => {
    const positions = new Float32Array(PETAL_COUNT * 3);
    const speeds = new Float32Array(PETAL_COUNT);
    const phases = new Float32Array(PETAL_COUNT);
    for (let i = 0; i < PETAL_COUNT; i++) {
      positions[i * 3]     = randRange(-14, 14);
      positions[i * 3 + 1] = randRange(-8, 10);
      positions[i * 3 + 2] = randRange(-3, 3);
      speeds[i]  = randRange(0.012, 0.032);
      phases[i]  = Math.random() * Math.PI * 2;
    }
    return { positions, speeds, phases };
  }, []);

  const heartData = useMemo(() => {
    const positions = new Float32Array(HEART_COUNT * 3);
    const phases = new Float32Array(HEART_COUNT);
    const speeds = new Float32Array(HEART_COUNT);
    for (let i = 0; i < HEART_COUNT; i++) {
      positions[i * 3]     = randRange(-12, 12);
      positions[i * 3 + 1] = randRange(-6, 8);
      positions[i * 3 + 2] = randRange(-2, 2);
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = randRange(0.005, 0.018);
    }
    return { positions, phases, speeds };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (petalRef.current) {
      const pos = petalRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < PETAL_COUNT; i++) {
        pos[i * 3]     += Math.sin(t * 0.4 + petalData.phases[i]) * 0.009;
        pos[i * 3 + 1] -= petalData.speeds[i];
        if (pos[i * 3 + 1] < -8) {
          pos[i * 3 + 1] = 10;
          pos[i * 3]     = randRange(-14, 14);
        }
      }
      petalRef.current.geometry.attributes.position.needsUpdate = true;
    }
    if (heartRef.current) {
      const pos = heartRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < HEART_COUNT; i++) {
        pos[i * 3 + 1] -= heartData.speeds[i];
        if (pos[i * 3 + 1] < -8) {
          pos[i * 3 + 1] = 8;
          pos[i * 3]     = randRange(-12, 12);
        }
      }
      heartRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const petalGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(petalData.positions, 3));
    return g;
  }, [petalData.positions]);

  const heartGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(heartData.positions, 3));
    return g;
  }, [heartData.positions]);

  return (
    <group>
      {/* Rose petals */}
      <points ref={petalRef} geometry={petalGeo}>
        <pointsMaterial
          color={new THREE.Color(0.9, 0.2, 0.42)}
          size={0.07}
          transparent
          opacity={0.72}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      {/* Glowing hearts (warm light particles) */}
      <points ref={heartRef} geometry={heartGeo}>
        <pointsMaterial
          color={new THREE.Color(1.0, 0.55, 0.7)}
          size={0.16}
          transparent
          opacity={0.55}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// ─── COMEDY — Confetti, balloons, bouncy energy ────────────────────────────────
function ComedyScene() {
  const CONFETTI_COUNT = 260;
  const BALLOON_COUNT = 10;
  const confettiRef = useRef<THREE.Points>(null!);
  const balloonRef = useRef<THREE.InstancedMesh>(null!);

  const CONFETTI_COLORS: [number, number, number][] = [
    [1.0, 0.42, 0.62], [0.98, 0.79, 0.14], [0.42, 0.69, 0.30],
    [0.46, 0.73, 1.0],  [0.94, 0.48, 0.99], [1.0, 0.46, 0.17],
  ];

  const confettiData = useMemo(() => {
    const positions = new Float32Array(CONFETTI_COUNT * 3);
    const colors = new Float32Array(CONFETTI_COUNT * 3);
    const speeds = new Float32Array(CONFETTI_COUNT);
    const phases = new Float32Array(CONFETTI_COUNT);
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      positions[i * 3]     = randRange(-14, 14);
      positions[i * 3 + 1] = randRange(-8, 12);
      positions[i * 3 + 2] = randRange(-3, 3);
      speeds[i]  = randRange(0.022, 0.058);
      phases[i]  = Math.random() * Math.PI * 2;
      const c = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      colors[i * 3]     = c[0];
      colors[i * 3 + 1] = c[1];
      colors[i * 3 + 2] = c[2];
    }
    return { positions, colors, speeds, phases };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const balloonOffsets = useMemo(() =>
    Array.from({ length: BALLOON_COUNT }, () => ({
      x: randRange(-11, 11),
      baseY: randRange(-1, 5),
      speed: randRange(0.35, 0.75),
      phase: Math.random() * Math.PI * 2,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  , []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (confettiRef.current) {
      const pos = confettiRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < CONFETTI_COUNT; i++) {
        pos[i * 3]     += Math.sin(t * 0.6 + confettiData.phases[i]) * 0.014;
        pos[i * 3 + 1] -= confettiData.speeds[i];
        if (pos[i * 3 + 1] < -8) {
          pos[i * 3 + 1] = 12;
          pos[i * 3]     = randRange(-14, 14);
        }
      }
      confettiRef.current.geometry.attributes.position.needsUpdate = true;
    }
    if (balloonRef.current) {
      balloonOffsets.forEach((b, idx) => {
        dummy.position.set(
          b.x + Math.sin(t * 0.3 + b.phase) * 1.2,
          b.baseY + Math.sin(t * b.speed + b.phase) * 1.4,
          0
        );
        dummy.scale.setScalar(0.38 + Math.sin(t * b.speed * 1.5 + b.phase) * 0.04);
        dummy.updateMatrix();
        balloonRef.current.setMatrixAt(idx, dummy.matrix);
      });
      balloonRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const confettiGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(confettiData.positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(confettiData.colors, 3));
    return g;
  }, [confettiData.positions, confettiData.colors]);

  const balloonGeo = useMemo(() => new THREE.SphereGeometry(1, 8, 8), []);

  return (
    <group>
      {/* Colorful confetti */}
      <points ref={confettiRef} geometry={confettiGeo}>
        <pointsMaterial
          vertexColors
          size={0.1}
          transparent
          opacity={0.82}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      {/* Balloons */}
      <instancedMesh ref={balloonRef} args={[balloonGeo, undefined, BALLOON_COUNT]}>
        <meshBasicMaterial color={new THREE.Color(0.98, 0.4, 0.62)} transparent opacity={0.45} />
      </instancedMesh>
    </group>
  );
}

// ─── Scene selector ───────────────────────────────────────────────────────────
function ThemedScene({ theme }: { theme: Theme }) {
  switch (theme) {
    case "anime":   return <AnimeScene />;
    case "cartoon": return <CartoonScene />;
    case "scifi":   return <ScifiScene />;
    case "horror":  return <HorrorScene />;
    case "action":  return <ActionScene />;
    case "romance": return <RomanceScene />;
    case "comedy":  return <ComedyScene />;
    default:        return <ComedyScene />;
  }
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function HeroParticles() {
  const theme = useThemeStore((s) => s.theme);

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 65 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <ThemedScene theme={theme} />
    </Canvas>
  );
}
