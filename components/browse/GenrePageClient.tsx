"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Plus, Check, Star } from "lucide-react";
import ContentRow from "@/components/browse/ContentRow";
import DetailModal from "@/components/modals/DetailModal";
import VideoPlayer from "@/components/modals/VideoPlayer";
import SkeletonRow from "@/components/browse/SkeletonRow";
import { getImageUrl, getTitle, getYear, formatRating } from "@/lib/utils";
import type { MediaItem } from "@/types";
import { useThemeStore } from "@/lib/store/themeStore";

// ── Lazy canvas map per genre theme ─────────────────────────────────────────
const CANVAS_MAP: Record<string, React.ComponentType> = {
  horror:  dynamic(() => import("@/components/canvas/HorrorCanvas"),  { ssr: false, loading: () => null }),
  anime:   dynamic(() => import("@/components/canvas/AnimeCanvas"),   { ssr: false, loading: () => null }),
  action:  dynamic(() => import("@/components/canvas/ActionCanvas"),  { ssr: false, loading: () => null }),
  romance: dynamic(() => import("@/components/canvas/RomanceCanvas"), { ssr: false, loading: () => null }),
  cartoon: dynamic(() => import("@/components/canvas/CartoonCanvas"), { ssr: false, loading: () => null }),
  scifi:   dynamic(() => import("@/components/canvas/SciFiCanvas"),   { ssr: false, loading: () => null }),
};

export interface GenreConfig {
  id: string;       // e.g. "horror"
  label: string;    // e.g. "Horror"
  description?: string;
  rows: { title: string; items: MediaItem[]; mediaType?: "movie" | "tv" }[];
  heroItem?: MediaItem;
}

interface Props {
  config: GenreConfig;
}

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const spring = { type: "spring" as const, stiffness: 60, damping: 22, mass: 1 };

// ── Hero card ─────────────────────────────────────────────────────────────────
function HeroCard({ item, onPlay }: { item: MediaItem; onPlay: (i: MediaItem) => void }) {
  const [inList, setInList] = useState(false);
  const type: "movie" | "tv" = item.media_type === "movie" ? "movie" : "tv";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="mx-4 md:mx-8 overflow-hidden rounded-2xl relative"
      style={{ minHeight: 240 }}
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 scale-110">
        <Image
          src={getImageUrl(item.backdrop_path ?? item.poster_path, "w780")}
          alt=""
          fill
          className="object-cover blur-sm"
          style={{ opacity: 0.35 }}
        />
      </div>
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 100%)" }} />
      {/* Theme-coloured vignette */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{ boxShadow: "inset 0 0 60px rgba(var(--theme-accent-rgb), 0.15)" }}
      />

      <div
        className="relative z-10 flex flex-col justify-end gap-4 p-6 md:flex-row md:items-end md:justify-between"
        style={{ minHeight: 240 }}
      >
        <div className="space-y-2 max-w-lg">
          <span
            className="inline-block rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest"
            style={{
              background: "rgba(var(--theme-accent-rgb), 0.18)",
              color: "var(--color-primary)",
              border: "1px solid rgba(var(--theme-accent-rgb), 0.3)",
            }}
          >
            Featured
          </span>
          <h2 className="text-2xl font-black text-white drop-shadow-lg md:text-3xl">
            {getTitle(item)}
          </h2>
          <p className="text-sm line-clamp-2" style={{ color: "rgba(255,255,255,0.65)" }}>
            {item.overview}
          </p>
          <div className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--color-primary)" }}>
            <Star className="h-3.5 w-3.5 fill-current" />
            {formatRating(item.vote_average)}
            <span style={{ color: "rgba(255,255,255,0.4)" }}>{getYear(item)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <motion.button
            onClick={() => onPlay({ ...item, media_type: type })}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.92 }}
            className="magnetic-btn flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
              boxShadow: "0 8px 24px rgba(var(--theme-accent-rgb), 0.4)",
            }}
          >
            <Play className="h-4 w-4 fill-current" />
            Play
          </motion.button>

          <motion.button
            onClick={() => setInList(!inList)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium backdrop-blur-sm"
            style={{
              border: `1px solid ${inList ? "rgba(var(--theme-accent-rgb), 0.5)" : "rgba(255,255,255,0.15)"}`,
              background: inList ? "rgba(var(--theme-accent-rgb), 0.2)" : "rgba(255,255,255,0.06)",
              color: inList ? "var(--color-primary)" : "white",
            }}
          >
            {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {inList ? "In List" : "My List"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function GenrePageClient({ config }: Props) {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [playingItem,  setPlayingItem]  = useState<MediaItem | null>(null);

  const theme = useThemeStore((s) => s.theme);

  // Choose canvas: prefer genre-specific, fall back to nothing
  const CanvasComponent = CANVAS_MAP[config.id] ?? null;

  // Hero is the first item from any row
  const hero = config.heroItem ?? config.rows[0]?.items[0];

  function handlePlay(item: MediaItem) {
    setSelectedItem(null);
    setPlayingItem(item);
  }

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: "var(--theme-hero-gradient, var(--color-background))" }}
    >
      {/* ── Canvas background — desktop only ─────────────────────────── */}
      {CanvasComponent && (
        <div className="fixed inset-0 pointer-events-none hidden md:block" style={{ zIndex: 0 }}>
          <Suspense fallback={null}>
            <CanvasComponent />
          </Suspense>
        </div>
      )}

      {/* ── Scrim overlay ─────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "rgba(0,0,0,0.48)", zIndex: 1 }}
      />

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="relative mx-auto w-full" style={{ zIndex: 10, maxWidth: "1400px" }}>

        {/* Sub-header strip */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="flex items-center gap-4 px-4 py-3 md:px-8 sticky top-16 backdrop-blur-md border-b"
          style={{
            background: "rgba(0,0,0,0.4)",
            borderColor: "rgba(var(--theme-accent-rgb), 0.1)",
            zIndex: 40,
          }}
        >
          <Link
            href="/browse"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 active:scale-90"
            style={{ color: "var(--color-primary)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Browse
          </Link>

          <div className="h-4 w-px" style={{ background: "var(--color-border)" }} />

          <div>
            <h1
              className="text-xl font-black tracking-wide"
              style={{
                color: "var(--color-primary)",
                textShadow: "var(--theme-text-shadow)",
                fontFamily: "var(--theme-font-display)",
              }}
            >
              {config.label}
            </h1>
            {config.description && (
              <p className="text-[10px] tracking-widest uppercase font-semibold" style={{ color: "var(--color-muted-foreground)" }}>
                {config.description}
              </p>
            )}
          </div>
        </motion.div>

        <div className="space-y-8 pb-24 pt-6">
          {/* Hero card */}
          {hero && <HeroCard item={hero} onPlay={handlePlay} />}

          {/* Content rows */}
          {config.rows.map((row, rowIndex) => (
            <Suspense key={row.title} fallback={<SkeletonRow />}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.1 + rowIndex * 0.08 }}
              >
                <ContentRow
                  title={row.title}
                  items={row.items}
                  onItemClick={setSelectedItem}
                  mediaType={row.mediaType}
                />
              </motion.div>
            </Suspense>
          ))}
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedItem && (
          <DetailModal
            mediaId={selectedItem.id}
            mediaType={(selectedItem.media_type || "movie") as "movie" | "tv"}
            onClose={() => setSelectedItem(null)}
            onPlay={handlePlay}
            profileId={null}
          />
        )}
      </AnimatePresence>

      {playingItem && (
        <VideoPlayer
          item={playingItem}
          onClose={() => setPlayingItem(null)}
          profileId={null}
        />
      )}
    </div>
  );
}
