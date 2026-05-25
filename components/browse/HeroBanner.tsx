"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Play, Info, Plus, Check, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getImageUrl, getTitle, getYear, formatRating } from "@/lib/utils";
import type { MediaItem } from "@/types";

// R3F canvas — ssr:false, only desktop (hidden md:block)
const HeroParticles = dynamic(() => import("@/components/canvas/HeroParticles"), {
  ssr: false,
  loading: () => null,
});

interface HeroBannerProps {
  items: MediaItem[];
  onPlay:  (item: MediaItem) => void;
  onInfo:  (item: MediaItem) => void;
}

export default function HeroBanner({ items, onPlay, onInfo }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [inList, setInList]   = useState(false);
  const [mouse,  setMouse]    = useState({ x: 0, y: 0 });
  const item = items[current];

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => setCurrent((p) => (p + 1) % items.length), 9000);
    return () => clearInterval(id);
  }, [items.length]);

  // Reset inList when slide changes
  useEffect(() => setInList(false), [current]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 18;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 12;
    setMouse({ x, y });
  }

  if (!item) return null;
  const mediaType = item.media_type || (item.title ? "movie" : "tv");

  return (
    <div
      className="relative h-[72vh] w-full overflow-hidden md:h-[88vh]"
      style={{ marginLeft: "calc(-1 * clamp(16px, 4vw, 48px))", marginRight: "calc(-1 * clamp(16px, 4vw, 48px))", width: "calc(100% + clamp(32px, 8vw, 96px))" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMouse({ x: 0, y: 0 })}
    >
      {/* ── Backdrop with parallax + crossfade ─────────────────────────── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-0"
          style={{
            transform: `translate(${mouse.x}px, ${mouse.y}px) scale(1.08)`,
            transition: "transform 0.3s ease-out",
          }}
        >
          <Image
            src={getImageUrl(item.backdrop_path, "original")}
            alt={getTitle(item)}
            fill
            className="object-cover"
            priority
          />
          {/* Color tint overlay per theme */}
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(var(--theme-accent-rgb, 201,168,76), 0.04)",
              mixBlendMode: "color",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── R3F particles — desktop only ───────────────────────────────── */}
      <div className="absolute inset-0 hidden md:block" style={{ zIndex: 2, pointerEvents: "none" }}>
        <Suspense fallback={null}>
          <HeroParticles />
        </Suspense>
      </div>

      {/* ── Cinematic gradients ─────────────────────────────────────────── */}
      <div className="absolute inset-0" style={{ zIndex: 3 }}>
        <div className="absolute inset-0 bg-gradient-to-t  from-background via-background/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r  from-background/85 via-background/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
        {/* Subtle vignette edges */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)" }} />
      </div>

      {/* ── Hero content ────────────────────────────────────────────────── */}
      <div
        className="absolute bottom-20 left-4 max-w-lg space-y-5 md:bottom-28 md:left-12"
        style={{ zIndex: 4 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            {/* Genre badge */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05, duration: 0.35 }}
              className="flex items-center gap-2"
            >
              <span
                className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest"
                style={{
                  background: "rgba(var(--theme-accent-rgb), 0.18)",
                  color: "var(--color-primary)",
                  border: "1px solid rgba(var(--theme-accent-rgb), 0.3)",
                }}
              >
                {mediaType === "movie" ? "Movie" : "TV Series"}
              </span>
              <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--color-primary)" }}>
                <Star className="h-3 w-3 fill-current" />
                {formatRating(item.vote_average)}
                <span style={{ color: "var(--color-muted-foreground)" }}>· {getYear(item)}</span>
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl font-black leading-tight text-balance md:text-5xl lg:text-6xl"
              style={{ textShadow: "var(--theme-text-shadow, 0 2px 12px rgba(0,0,0,0.8))" }}
            >
              {getTitle(item)}
            </motion.h1>

            {/* Overview */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="line-clamp-3 text-sm leading-relaxed md:text-base"
              style={{ color: "var(--color-foreground)", opacity: 0.8, maxWidth: "42ch" }}
            >
              {item.overview}
            </motion.p>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.4 }}
              className="flex items-center gap-3 flex-wrap"
            >
              {/* Play — magnetic primary */}
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => onPlay({ ...item, media_type: mediaType })}
                className="magnetic-btn flex items-center gap-2.5 rounded-full px-7 py-3 text-sm font-bold shadow-lg transition-all duration-200"
                style={{
                  background: "var(--color-primary)",
                  color: "var(--color-primary-foreground)",
                  boxShadow: `0 8px 24px rgba(var(--theme-accent-rgb), 0.45)`,
                }}
              >
                <Play className="h-4 w-4 fill-current" />
                Play
              </motion.button>

              {/* More Info */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => onInfo({ ...item, media_type: mediaType })}
                className="magnetic-btn flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold backdrop-blur-sm transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "var(--color-foreground)",
                }}
              >
                <Info className="h-4 w-4" />
                More Info
              </motion.button>

              {/* My List */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => setInList((l) => !l)}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200"
                style={{
                  background: inList
                    ? "rgba(var(--theme-accent-rgb), 0.2)"
                    : "rgba(255,255,255,0.1)",
                  border: `1px solid ${inList ? "rgba(var(--theme-accent-rgb), 0.45)" : "rgba(255,255,255,0.2)"}`,
                  color: inList ? "var(--color-primary)" : "var(--color-foreground)",
                }}
                aria-label={inList ? "Remove from list" : "Add to list"}
              >
                {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Slide indicators ─────────────────────────────────────────────── */}
      {items.length > 1 && (
        <div
          className="absolute bottom-8 right-4 flex gap-1.5 md:bottom-14 md:right-12"
          style={{ zIndex: 4 }}
        >
          {items.slice(0, 6).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-300"
              style={{
                height: "3px",
                width: i === current ? "28px" : "14px",
                background:
                  i === current
                    ? "var(--color-primary)"
                    : "rgba(255,255,255,0.3)",
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
