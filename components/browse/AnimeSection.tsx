"use client";

import { Component, lazy, Suspense, type ReactNode } from "react";
import { motion } from "framer-motion";
import ContentRow from "@/components/browse/ContentRow";
import type { MediaItem } from "@/types";

const AnimeCanvas = lazy(() => import("@/components/canvas/AnimeCanvas"));

// ── Error boundary ──────────────────────────────────────────────────────────
class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function GradientFallback() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: "linear-gradient(135deg, #1a0533 0%, #2d0f5c 40%, #1a0533 100%)",
        opacity: 0.7,
      }}
    />
  );
}

interface AnimeSectionProps {
  popularAnime: MediaItem[];
  topAnime: MediaItem[];
  trendingAnime: MediaItem[];
  onItemClick: (item: MediaItem) => void;
}

const EASE = "easeOut" as const;

export default function AnimeSection({
  popularAnime,
  topAnime,
  trendingAnime,
  onItemClick,
}: AnimeSectionProps) {
  const rowVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ staggerChildren: 0.08 }}
      className="relative mt-8"
    >
      {/* Decorative canvas banner */}
      <motion.div
        variants={rowVariant}
        className="relative mx-4 md:mx-8 mb-2 h-48 md:h-64 overflow-hidden rounded-3xl"
        style={{
          background: "linear-gradient(135deg, #1a0533 0%, #2d0f5c 40%, #1a0533 100%)",
        }}
      >
        <CanvasErrorBoundary>
          <Suspense fallback={<GradientFallback />}>
            <AnimeCanvas />
          </Suspense>
        </CanvasErrorBoundary>

        {/* Overlay text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none select-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
            className="text-center"
          >
            <h2
              className="text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg"
              style={{
                background: "linear-gradient(90deg, #ffb7c5 0%, #c084fc 50%, #818cf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              アニメ
            </h2>
            <p className="mt-1 text-sm md:text-base text-white/60 font-medium tracking-widest uppercase">
              Anime
            </p>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />
      </motion.div>

      {/* Rows */}
      <motion.div variants={rowVariant}>
        <ContentRow title="🌸 Popular Anime" items={popularAnime} onItemClick={onItemClick} mediaType="tv" />
      </motion.div>

      <motion.div variants={rowVariant}>
        <ContentRow title="⭐ Top Rated Anime" items={topAnime} onItemClick={onItemClick} mediaType="tv" />
      </motion.div>

      <motion.div variants={rowVariant}>
        <ContentRow title="🔥 Trending Anime" items={trendingAnime} onItemClick={onItemClick} mediaType="tv" />
      </motion.div>
    </motion.section>
  );
}
