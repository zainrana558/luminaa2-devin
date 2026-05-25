"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useThemeStore } from "@/lib/store/themeStore";

// Theme color map for particles
const THEME_COLORS: Record<string, [number, number, number]> = {
  cinematic: [1.0, 0.85, 0.3],
  action:    [0.96, 0.62, 0.05],
  romance:   [0.94, 0.38, 0.57],
  anime:     [0.0,  0.9,  1.0 ],
  cartoon:   [0.49, 0.3,  1.0 ],
  scifi:     [0.0,  1.0,  0.53],
  horror:    [0.8,  0.0,  0.13],
};

function Particles({ color }: { color: [number, number, number] }) {
  const COUNT = 260;
  const meshRef = useRef<THREE.Points>(null!);

  const { positions, speeds, offsets } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const speeds    = new Float32Array(COUNT);
    const offsets   = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      speeds[i]  = 0.12 + Math.random() * 0.18;
      offsets[i] = Math.random() * Math.PI * 2;
    }
    return { positions, speeds, offsets };
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const pos = meshRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      // Gentle float upward
      pos[i * 3 + 1] += speeds[i] * 0.008;
      // Drift side to side
      pos[i * 3] += Math.sin(t * 0.3 + offsets[i]) * 0.003;
      // Wrap when off screen
      if (pos[i * 3 + 1] > 7) pos[i * 3 + 1] = -7;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        color={new THREE.Color(...color)}
        size={0.055}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function HeroParticles() {
  const theme = useThemeStore((s) => s.theme);
  const color = THEME_COLORS[theme] ?? THEME_COLORS.cinematic;

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 65 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <Particles color={color} />
    </Canvas>
  );
}
