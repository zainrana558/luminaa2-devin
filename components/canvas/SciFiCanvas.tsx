"use client";

import { useEffect, useRef } from "react";

export default function SciFiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

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

      const width   = window.innerWidth;
      const height  = window.innerHeight;
      const cores   = navigator.hardwareConcurrency ?? 4;
      const lowPerf = cores < 4;

      const STAR_COUNT = lowPerf ? 200 : 500;

      // ── Scene ─────────────────────────────────────────────────────────
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000814);

      // ── Camera ────────────────────────────────────────────────────────
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(0, 0, 5);

      // ── Renderer ──────────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);

      // ── Lighting ──────────────────────────────────────────────────────
      const ambientLight = new THREE.AmbientLight(0x001133, 0.4);
      scene.add(ambientLight);

      const cyanLight = new THREE.PointLight(0x00ffff, 1.0, 50);
      cyanLight.position.set(0, 3, 3);
      scene.add(cyanLight);

      const dirLight = new THREE.DirectionalLight(0x0044ff, 0.5);
      dirLight.position.set(-3, 4, 2);
      scene.add(dirLight);

      // ── Stars via THREE.Points ─────────────────────────────────────────
      const starPositions  = new Float32Array(STAR_COUNT * 3);
      const starSizes      = new Float32Array(STAR_COUNT);
      const starOpacities  = new Float32Array(STAR_COUNT);

      // Per-star animation metadata (not GPU attributes)
      const starPhases     = new Float32Array(STAR_COUNT);
      const starSpeeds     = new Float32Array(STAR_COUNT);

      for (let i = 0; i < STAR_COUNT; i++) {
        // Random point on sphere radius 20
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(2 * Math.random() - 1);
        const r     = 20;
        starPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        starPositions[i * 3 + 2] = r * Math.cos(phi);

        starSizes[i]     = 0.5 + Math.random() * 2.0;
        starOpacities[i] = 0.3 + Math.random() * 0.7;
        starPhases[i]    = Math.random() * Math.PI * 2;
        starSpeeds[i]    = 0.5 + Math.random() * 1.5;
      }

      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
      starGeo.setAttribute("size",     new THREE.BufferAttribute(starSizes, 1));
      starGeo.setAttribute("opacity",  new THREE.BufferAttribute(starOpacities, 1));

      // ShaderMaterial for per-star opacity via attribute
      const starMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite:  false,
        uniforms: {
          baseColor: { value: new THREE.Color(0xffffff) },
        },
        vertexShader: /* glsl */`
          attribute float size;
          attribute float opacity;
          varying float vOpacity;
          void main() {
            vOpacity = opacity;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position  = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: /* glsl */`
          uniform vec3 baseColor;
          varying float vOpacity;
          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;
            float alpha = (1.0 - d * 2.0) * vOpacity;
            gl_FragColor = vec4(baseColor, alpha);
          }
        `,
      });

      const stars = new THREE.Points(starGeo, starMat);
      scene.add(stars);

      // ── Planets ───────────────────────────────────────────────────────
      type Planet = {
        mesh:        import("three").Mesh;
        orbitRadius: number;
        orbitSpeed:  number;
        orbitAngle:  number;
      };

      const planetDefs = [
        { r: 0.6, color: 0xe17055, metalness: 0.1, roughness: 0.8, orbitRadius: 4,   orbitSpeed: 0.008 },
        { r: 0.4, color: 0x74b9ff, metalness: 0.2, roughness: 0.6, orbitRadius: 6,   orbitSpeed: 0.005 },
        { r: 0.3, color: 0x55efc4, metalness: 0.3, roughness: 0.5, orbitRadius: 2.5, orbitSpeed: 0.015 },
      ];

      const planets: Planet[] = [];

      for (const def of planetDefs) {
        const geo  = new THREE.SphereGeometry(def.r, 32, 32);
        const mat  = new THREE.MeshStandardMaterial({
          color:     def.color,
          metalness: def.metalness,
          roughness: def.roughness,
          emissive:  new THREE.Color(def.color).multiplyScalar(0.08),
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;

        const startAngle = Math.random() * Math.PI * 2;
        mesh.position.x  = Math.cos(startAngle) * def.orbitRadius;
        mesh.position.z  = Math.sin(startAngle) * def.orbitRadius;
        scene.add(mesh);

        planets.push({
          mesh,
          orbitRadius: def.orbitRadius,
          orbitSpeed:  def.orbitSpeed,
          orbitAngle:  startAngle,
        });
      }

      // ── Grid Floor ────────────────────────────────────────────────────
      const grid = new THREE.GridHelper(32, 32, 0x00ffff, 0x003333);
      grid.position.y = -3;
      grid.rotation.x = Math.PI / 3;

      // Make grid semi-transparent
      const gridMats = Array.isArray(grid.material) ? grid.material : [grid.material];
      for (const m of gridMats) {
        m.transparent = true;
        (m as { opacity: number }).opacity = 0.4;
      }
      scene.add(grid);

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

      function animate() {
        if (disposed) return;
        rafRef.current = requestAnimationFrame(animate);
        time += 0.01;

        // ── Cyan light pulse ──────────────────────────────────────────
        cyanLight.intensity = 0.8 + Math.sin(time * 2) * 0.4;

        // ── Star twinkle — update opacity attribute ───────────────────
        const opacAttr = starGeo.attributes.opacity as { array: Float32Array; needsUpdate: boolean };
        for (let i = 0; i < STAR_COUNT; i++) {
          opacAttr.array[i] = 0.3 + Math.sin(time * starSpeeds[i] + starPhases[i]) * 0.5;
        }
        opacAttr.needsUpdate = true;

        // ── Planets orbit ─────────────────────────────────────────────
        for (const p of planets) {
          p.orbitAngle       += p.orbitSpeed;
          p.mesh.position.x   = Math.cos(p.orbitAngle) * p.orbitRadius;
          p.mesh.position.z   = Math.sin(p.orbitAngle) * p.orbitRadius;
          p.mesh.rotation.y  += 0.01;
        }

        // ── Grid scroll — loop z ──────────────────────────────────────
        grid.position.z = (time * 0.5) % 1;

        // ── Camera slow drift ─────────────────────────────────────────
        camera.position.x = Math.sin(time * 0.1) * 0.8;
        camera.position.y = Math.cos(time * 0.08) * 0.4;
        camera.lookAt(0, 0, 0);

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
