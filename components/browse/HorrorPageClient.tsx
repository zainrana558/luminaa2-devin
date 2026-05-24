"use client";

import { useState, Suspense, Component } from "react";
import type { ReactNode } from "react";
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

// ── Dynamic import — ssr:false ────────────────────────────────────────────────
const HorrorCanvas = dynamic(
  () => import("@/components/canvas/HorrorCanvas"),
  {
    ssr: false,
    loading: () => (
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: "linear-gradient(160deg,#050a05 0%,#0d1a0d 50%,#050a05 100%)",
        }}
      />
    ),
  }
);

// ── Animation constants ───────────────────────────────────────────────────────
const ease = [0.25, 0.46, 0.45, 0.94] as const;
const spring = { type: "spring" as const, stiffness: 60, damping: 20, mass: 1 };

// ── Genre pills — Horror sub-genres mapped to TMDB genre IDs ─────────────────
const GENRES = [
  { label: "All",          value: ""     },
  { label: "Supernatural", value: "14"   }, // Fantasy often overlaps
  { label: "Slasher",      value: "28"   }, // Action
  { label: "Thriller",     value: "53"   }, // Thriller
  { label: "Ghost",        value: "9648" }, // Mystery
  { label: "Gore",         value: "80"   }, // Crime
];

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

const ErrorFallback = () => (
  <div
    className="flex min-h-screen flex-col items-center justify-center gap-6"
    style={{ background: "linear-gradient(160deg,#050a05 0%,#0a1a0a 40%,#050a05 100%)" }}
  >
    <p className="text-green-400/70 text-lg">Content unavailable.</p>
    <Link
      href="/browse"
      className="flex items-center gap-2 rounded-full bg-green-900/30 px-5 py-3 text-sm font-medium text-green-300/70 hover:bg-green-900/50 transition-all duration-300 border border-green-800/40 min-h-[44px]"
      style={{ touchAction: "manipulation" }}
    >
      <ArrowLeft className="h-4 w-4" /> Back to Browse
    </Link>
  </div>
);

// ── Mobile CSS dark fallback ──────────────────────────────────────────────────
function MobileHorror() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden md:hidden">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg,#050a05 0%,#0a1a0a 55%,#050a05 100%)",
        }}
      />
      {/* Drifting ghost emojis */}
      {[
        { emoji: "👻", left: "8%",  delay: "0s",   dur: "7s"  },
        { emoji: "🦇", left: "28%", delay: "1.2s", dur: "5s"  },
        { emoji: "👻", left: "52%", delay: "0.6s", dur: "8s"  },
        { emoji: "🦇", left: "72%", delay: "2s",   dur: "6s"  },
        { emoji: "💀", left: "88%", delay: "1.5s", dur: "7.5s"},
      ].map((a, i) => (
        <span
          key={i}
          className="absolute text-2xl"
          style={{
            left: a.left,
            bottom: "15%",
            opacity: 0.5,
            animation: `horrorFloat ${a.dur} ease-in-out ${a.delay} infinite alternate`,
          }}
        >
          {a.emoji}
        </span>
      ))}
      <style>{`
        @keyframes horrorFloat {
          0%   { transform: translateY(0px)   rotate(-3deg); opacity: 0.3; }
          100% { transform: translateY(-24px) rotate(3deg);  opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

// ── Hero Card ─────────────────────────────────────────────────────────────────
function HeroCard({
  item,
  onPlay,
}: {
  item: MediaItem;
  onPlay: (i: MediaItem) => void;
}) {
  const [inList, setInList] = useState(false);
  const type: "movie" | "tv" = item.media_type === "movie" ? "movie" : "tv";

  return (
    // Slide-up spring with flicker opacity effect
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      animate={{ opacity: [null, 0.9, 1.0, 0.95, 1.0] }}
      transition={{
        y: { ...spring },
        opacity: { duration: 3, repeat: Infinity, ease: "linear", delay: 0.5 },
      }}
      className="mx-4 md:mx-8 overflow-hidden rounded-2xl relative"
      style={{ minHeight: 260 }}
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 scale-110">
        <Image
          src={getImageUrl(item.backdrop_path ?? item.poster_path, "w780")}
          alt=""
          fill
          className="object-cover blur-sm opacity-40"
        />
      </div>
      {/* Dark gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/30" />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg,rgba(0,40,0,0.6),rgba(0,20,0,0.4))",
        }}
      />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      {/* Eerie green vignette edge */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{ boxShadow: "inset 0 0 60px rgba(0,80,0,0.25)" }}
      />

      <div
        className="relative z-10 flex flex-col justify-end p-6 md:flex-row md:items-end md:justify-between"
        style={{ minHeight: 260 }}
      >
        <div className="space-y-2 max-w-lg">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "#00cc44", textShadow: "0 0 8px rgba(0,200,60,0.5)" }}
          >
            ☠️ Featured Horror
          </motion.p>

          <h2
            className="text-2xl font-black text-white drop-shadow-lg md:text-3xl"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.9)" }}
          >
            {getTitle(item)}
          </h2>

          <p className="text-sm text-white/60 line-clamp-2">{item.overview}</p>

          <div className="flex items-center gap-3 text-xs" style={{ color: "#00cc44" }}>
            <Star className="h-3.5 w-3.5" style={{ fill: "#00cc44", color: "#00cc44" }} />
            {formatRating(item.vote_average)}
            <span className="text-white/40">{getYear(item)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 md:mt-0 flex-wrap">
          {/* Play button — dark gradient */}
          <motion.button
            onClick={() => onPlay({ ...item, media_type: type })}
            whileHover={{ scale: 1.08, boxShadow: "0 0 28px rgba(0,180,50,0.5)" }}
            whileTap={{ scale: 0.92 }}
            transition={spring}
            className="relative flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white overflow-hidden group min-h-[44px]"
            style={{
              background: "linear-gradient(135deg,#1a4a1a,#0d2d0d)",
              border: "1px solid rgba(0,180,50,0.35)",
              touchAction: "manipulation",
            }}
          >
            <span
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "rgba(0,150,40,0.2)" }}
            />
            <Play className="h-4 w-4 fill-white relative z-10" />
            <span className="relative z-10">Play</span>
          </motion.button>

          {/* Watchlist button */}
          <motion.button
            onClick={() => setInList(!inList)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            transition={spring}
            className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white min-h-[44px] backdrop-blur-sm transition-all duration-300"
            style={{
              touchAction: "manipulation",
              border: inList
                ? "1px solid rgba(0,180,50,0.5)"
                : "1px solid rgba(255,255,255,0.15)",
              background: inList ? "rgba(0,100,30,0.3)" : "rgba(255,255,255,0.06)",
            }}
          >
            {inList
              ? <Check className="h-4 w-4" style={{ color: "#00cc44" }} />
              : <Plus className="h-4 w-4" />}
            {inList ? "In List" : "My List"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Client Component ─────────────────────────────────────────────────────
interface HorrorPageClientProps {
  movies: MediaItem[];
  tv: MediaItem[];
}

export default function HorrorPageClient({ movies, tv }: HorrorPageClientProps) {
  const [activeGenre, setActiveGenre]   = useState("");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [playingItem, setPlayingItem]   = useState<MediaItem | null>(null);

  const hero = movies[0] ?? tv[0];

  function filterItems(items: MediaItem[]) {
    if (!activeGenre) return items;
    return items.filter((i) => i.genre_ids?.includes(Number(activeGenre)));
  }

  function handlePlay(item: MediaItem) {
    setSelectedItem(null);
    setPlayingItem(item);
  }

  const moviesFiltered = filterItems(movies.slice(1, 20));
  const tvFiltered     = filterItems(tv.slice(1, 20));
  const moreFiltered   = filterItems([...movies, ...tv].slice(10, 30));

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div
        className="relative min-h-screen overflow-x-hidden"
        style={{ background: "linear-gradient(180deg,#050a05 0%,#0a1a0a 50%,#050a05 100%)" }}
      >

        {/* ── HorrorCanvas — desktop only, z-index 0 ──────────────── */}
        <div className="fixed inset-0 pointer-events-none hidden md:block" style={{ zIndex: 0 }}>
          <HorrorCanvas />
        </div>

        {/* ── Mobile dark fallback ─────────────────────────────────── */}
        <MobileHorror />

        {/* ── Dark overlay z-index 1 ───────────────────────────────── */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1 }}
        />

        {/* ── All content z-index 10 ───────────────────────────────── */}
        <div className="relative" style={{ zIndex: 10 }}>

          {/* Dark frosted glass navbar */}
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="sticky top-0 flex items-center gap-4 px-4 py-3 md:px-8 backdrop-blur-md border-b"
            style={{
              zIndex: 50,
              background: "rgba(0,0,0,0.5)",
              borderColor: "rgba(0,150,50,0.15)",
            }}
          >
            <Link
              href="/browse"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium min-h-[44px] transition-all duration-300 active:scale-95"
              style={{
                color: "rgba(0,200,60,0.8)",
                touchAction: "manipulation",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,100,30,0.3)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <ArrowLeft className="h-4 w-4" />
              Browse
            </Link>

            <div className="flex flex-col leading-none">
              {/* Title with flicker animation */}
              <motion.p
                animate={{ opacity: [0.85, 1.0, 0.9, 1.0, 0.88, 1.0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="text-2xl font-black tracking-widest"
                style={{
                  fontFamily: "'Creepster', 'Permanent Marker', 'Chiller', cursive, system-ui",
                  color: "#00ff44",
                  textShadow: "0 0 12px rgba(0,255,68,0.6), 0 0 24px rgba(0,200,50,0.3)",
                  letterSpacing: "0.15em",
                }}
              >
                HORROR
              </motion.p>
              <p
                className="text-[9px] tracking-[0.25em] uppercase font-semibold"
                style={{ color: "rgba(0,180,50,0.55)" }}
              >
                Fright · Genre 27
              </p>
            </div>
          </motion.nav>

          <div className="space-y-10 pb-24 pt-8">

            {/* ── Page title with flicker ───────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.1 }}
              className="px-4 md:px-8"
            >
              <motion.h1
                animate={{ opacity: [0.85, 1.0, 0.88, 1.0, 0.92, 1.0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 0.3 }}
                className="text-5xl font-black tracking-widest md:text-7xl"
                style={{
                  fontFamily: "'Creepster', 'Permanent Marker', 'Chiller', cursive, system-ui",
                  color: "#00ff44",
                  textShadow:
                    "0 0 20px rgba(0,255,68,0.7), 0 0 40px rgba(0,200,50,0.35), 0 4px 16px rgba(0,0,0,0.8)",
                  letterSpacing: "0.12em",
                }}
              >
                HORROR
              </motion.h1>
              <p
                className="mt-1 text-xs tracking-[0.3em] font-semibold"
                style={{ color: "rgba(0,180,50,0.5)" }}
              >
                Fear · Dread · Genre 27
              </p>
            </motion.div>

            {/* ── Genre pills — dark green themed ──────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.18 }}
              className="flex gap-2 overflow-x-auto px-4 pb-1 md:px-8"
              style={{ scrollbarWidth: "none" }}
            >
              {GENRES.map((g) => {
                const isActive = activeGenre === g.value;
                return (
                  <motion.button
                    key={g.value}
                    onClick={() => setActiveGenre(g.value)}
                    whileHover={{ scale: 1.07, transition: spring }}
                    whileTap={{ scale: 0.92 }}
                    className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 min-h-[44px]"
                    style={{
                      touchAction: "manipulation",
                      background: isActive
                        ? "rgba(0,100,30,0.85)"
                        : "rgba(0,40,15,0.5)",
                      color: isActive ? "#00ff44" : "rgba(0,180,50,0.7)",
                      border: `1px solid ${isActive ? "rgba(0,200,60,0.5)" : "rgba(0,120,40,0.3)"}`,
                      boxShadow: isActive
                        ? "0 0 14px rgba(0,180,50,0.35), inset 0 0 8px rgba(0,100,30,0.3)"
                        : "none",
                    }}
                  >
                    {g.label}
                  </motion.button>
                );
              })}
            </motion.div>

            {/* ── Hero card ────────────────────────────────────────── */}
            {hero && <HeroCard item={hero} onPlay={handlePlay} />}

            {/* ── Content rows ─────────────────────────────────────── */}
            <Suspense fallback={<SkeletonRow />}>
              {moviesFiltered.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease, delay: 0.25 }}
                >
                  <ContentRow
                    title="☠️ Horror Movies"
                    items={moviesFiltered}
                    onItemClick={setSelectedItem}
                    mediaType="movie"
                  />
                </motion.div>
              )}
            </Suspense>

            <Suspense fallback={<SkeletonRow />}>
              {tvFiltered.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease, delay: 0.35 }}
                >
                  <ContentRow
                    title="👻 Horror TV Series"
                    items={tvFiltered}
                    onItemClick={setSelectedItem}
                    mediaType="tv"
                  />
                </motion.div>
              )}
            </Suspense>

            <Suspense fallback={<SkeletonRow />}>
              {moreFiltered.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease, delay: 0.45 }}
                >
                  <ContentRow
                    title="🦇 More Nightmares"
                    items={moreFiltered}
                    onItemClick={setSelectedItem}
                  />
                </motion.div>
              )}
            </Suspense>

          </div>
        </div>

        {/* ── Modals ───────────────────────────────────────────────── */}
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
    </ErrorBoundary>
  );
}
