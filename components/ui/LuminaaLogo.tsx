"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useThemeStore, THEMES } from "@/lib/store/themeStore";

interface LuminaaLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { fontSize: "1.25rem", letterSpacing: "0.12em" },
  md: { fontSize: "1.6rem",  letterSpacing: "0.14em" },
  lg: { fontSize: "2.4rem",  letterSpacing: "0.16em" },
};

export default function LuminaaLogo({ size = "md", className = "" }: LuminaaLogoProps) {
  const theme = useThemeStore((s) => s.theme);
  const config = THEMES.find((t) => t.id === theme)!;
  const gradientId = useRef(`logo-grad-${Math.random().toString(36).slice(2)}`);

  // Horror: glitch + drip effect modifier
  const isHorror = theme === "horror";
  const isScifi  = theme === "scifi";
  const { fontSize, letterSpacing } = sizeMap[size];

  return (
    <motion.span
      key={theme}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`relative inline-block select-none font-black ${className}`}
      style={{
        fontSize,
        letterSpacing,
        fontFamily:
          isHorror
            ? "'Creepster','Permanent Marker',cursive,system-ui"
            : isScifi
            ? "'Share Tech Mono','Courier New',monospace"
            : "'Inter',sans-serif",
      }}
    >
      {/* SVG gradient text */}
      <svg
        aria-label="Luminaa2"
        style={{ display: "inline", overflow: "visible", verticalAlign: "middle" }}
        width="0"
        height="0"
      >
        <defs>
          <linearGradient id={gradientId.current} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%">
              <animate
                attributeName="stop-color"
                values={`${config.from};${config.to};${config.from}`}
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%">
              <animate
                attributeName="stop-color"
                values={`${config.to};${config.from};${config.to}`}
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
        </defs>
      </svg>

      {/* Visible text with gradient fill */}
      <span
        className={isHorror ? "horror-glitch horror-flicker" : ""}
        style={{
          background: `linear-gradient(90deg, ${config.from}, ${config.to}, ${config.from})`,
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "logoShimmer 3s linear infinite",
          filter: isHorror
            ? `drop-shadow(0 0 8px ${config.from}88)`
            : `drop-shadow(0 0 6px ${config.from}66)`,
          display: "inline-block",
        }}
      >
        Luminaa2
      </span>

      {/* Horror drip */}
      {isHorror && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: "100%",
            left: "15%",
            width: "6px",
            height: "18px",
            background: config.from,
            borderRadius: "0 0 3px 3px",
            transformOrigin: "top",
            animation: "drip 2.5s ease-in 0s infinite",
            opacity: 0.85,
          }}
        />
      )}

      <style>{`
        @keyframes logoShimmer {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </motion.span>
  );
}
