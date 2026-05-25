"use client";

import { useState, Suspense, Component } from "react";
import { ThemeApplier } from "@/components/ui/ThemeApplier";
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
const SciFiCanvas = dynamic(
  () => import("@/components/canvas/SciFiCanvas"),
  {
    ssr: false,
    loading: () => (
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: "linear-gradient(160deg,#000814 0%,#001428 50%,#000814 100%)",
        }}
      />
    ),
  }
);

// ── Animation constants ───────────────────────────────────────────────────────
const ease   = [0.25, 0.46, 0.45, 0.94] as const;
const spring = { type: "spring" as const, stiffness: 60, damping: 20, mass: 1 };

// ── Genre pills ───────────────────────────────────────────────────────────────
const GENRES = [
  { label: "All",         value: ""     },
  { label: "Space",       value: "878"  },
  { label: "Cyberpunk",   value: "28"   }, // Action overlap
  { label: "Alien",       value: "27"   }, // Horror overlap
  { label: "Time Travel", value: "12"   }, // Adventure overlap
  { label: "Dystopia",    value: "18"   }, // Drama overlap
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
    style={{ background: "linear-gradient(160deg,#000814 0%,#001a2e 40%,#000814 100%)" }}
  >
    <p className="text-cyan-400/70 text-lg">Content unavailable.</p>
    <Link
      href="/browse"
      className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-all duration-300 border min-h-[44px]"
      style={{
        background: "rgba(0,180,200,0.1)",
        color: "rgba(0,220,255,0.7)",
        borderColor: "rgba(0,180,200,0.3)",
        touchAction: "manipulation",
      }}
    >
      <ArrowLeft className="h-4 w-4" /> Back to Browse
    </Link>
  </div>
);

// ── Mobile CSS space fallback ─────────────────────────────────────────────────
function MobileSciFi() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden md:hidden">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg,#000814 0%,#001428 55%,#000814 100%)",
        }}
      />
      {/* Drifting space emojis */}
      {[
        { emoji: "🚀", left: "8%",  delay: "0s",   dur: "8s"  },
        { emoji: "⭐", left: "25%", delay: "1s",   dur: "6s"  },
        { emoji: "🛸", left: "50%", delay: "0.5s", dur: "9s"  },
        { emoji: "🌌", left: "72%", delay: "2s",   dur: "7s"  },
        { emoji: "🪐", left: "88%", delay: "1.5s", dur: "8.5s"},
      ].map((a, i) => (
        <span
          key={i}
          className="absolute text-2xl"
          style={{
            left: a.left,
            bottom: "15%",
            opacity: 0.5,
            animation: `scifiFloat ${a.dur} ease-in-out ${a.delay} infinite alternate`,
          }}
        >
          {a.emoji}
        </span>
      ))}
      <style>{`
        @keyframes scifiFloat {
          0%   { transform: translateY(0px)   rotate(-4deg); opacity: 0.35; }
          100% { transform: translateY(-28px) rotate(4deg);  opacity: 0.65; }
        }
      `}</style>
    </div>
  );
}

// ── Hero Card — glitch entrance ───────────────────────────────────────────────
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
    // Glitch effect: x oscillates then settles
    <motion.div
      initial={{ opacity: 0, y: 40, x: -2 }}
      animate={{ opacity: 1, y: 0, x: [null, -2, 2, -1, 1, -0.5, 0.5, 0] }}
      transition={{
        opacity: { duration: 0.5, ease },
        y:       { ...spring },
        x:       { duration: 0.6, ease: "easeOut", delay: 0.2 },
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
          className="object-cover blur-sm opacity-35"
        />
      </div>

      {/* Dark space gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/65 to-black/25" />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg,rgba(0,20,60,0.7),rgba(0,40,80,0.4))",
        }}
      />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      {/* Cyan scan-line vignette */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{ boxShadow: "inset 0 0 60px rgba(0,180,255,0.12)" }}
      />

      {/* Scan line effect */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,180,255,0.015) 2px,rgba(0,180,255,0.015) 4px)",
        }}
      />

      <div
        className="relative z-10 flex flex-col justify-end p-6 md:flex-row md:items-end md:justify-between"
        style={{ minHeight: 260 }}
      >
        <div className="space-y-2 max-w-lg">
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease }}
            className="text-xs font-bold uppercase tracking-widest"
            style={{
              color: "#00ffff",
              textShadow: "0 0 8px rgba(0,255,255,0.6)",
              fontFamily: "'Orbitron', 'Share Tech Mono', monospace, system-ui",
            }}
          >
            ◈ Featured Sci-Fi
          </motion.p>

          <h2
            className="text-2xl font-black text-white drop-shadow-lg md:text-3xl"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.95)" }}
          >
            {getTitle(item)}
          </h2>

          <p className="text-sm text-white/55 line-clamp-2">{item.overview}</p>

          <div
            className="flex items-center gap-3 text-xs"
            style={{ color: "#00ccff" }}
          >
            <Star className="h-3.5 w-3.5" style={{ fill: "#00ccff", color: "#00ccff" }} />
            {formatRating(item.vote_average)}
            <span className="text-white/40">{getYear(item)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 md:mt-0 flex-wrap">
          {/* Play button — cyan gradient */}
          <motion.button
            onClick={() => onPlay({ ...item, media_type: type })}
            whileHover={{ scale: 1.08, boxShadow: "0 0 32px rgba(0,200,255,0.55)" }}
            whileTap={{ scale: 0.92 }}
            transition={spring}
            className="relative flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-black overflow-hidden group min-h-[44px]"
            style={{
              background: "linear-gradient(135deg,#00ccff,#0066ff)",
              touchAction: "manipulation",
            }}
          >
            <span
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "rgba(0,220,255,0.25)" }}
            />
            <Play className="h-4 w-4 fill-black relative z-10" />
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
                ? "1px solid rgba(0,200,255,0.5)"
                : "1px solid rgba(255,255,255,0.15)",
              background: inList ? "rgba(0,100,180,0.3)" : "rgba(255,255,255,0.06)",
            }}
          >
            {inList
              ? <Check className="h-4 w-4" style={{ color: "#00ccff" }} />
              : <Plus className="h-4 w-4" />}
            {inList ? "In List" : "My List"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Client Component ─────────────────────────────────────────────────────
interface SciFiPageClientProps {
  movies: MediaItem[];
  tv:     MediaItem[];
}

export default function SciFiPageClient({ movies, tv }: SciFiPageClientProps) {
  const [activeGenre,  setActiveGenre]  = useState("");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [playingItem,  setPlayingItem]  = useState<MediaItem | null>(null);

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
      <ThemeApplier theme="scifi" />
      <div
        className="relative min-h-screen overflow-x-hidden"
        style={{ background: "linear-gradient(180deg,#000814 0%,#001428 50%,#000814 100%)" }}
      >

        {/* ── SciFiCanvas — desktop only, z-index 0 ───────────────── */}
        <div className="fixed inset-0 pointer-events-none hidden md:block" style={{ zIndex: 0 }}>
          <SciFiCanvas />
        </div>

        {/* ── Mobile space fallback ────────────────────────────────── */}
        <MobileSciFi />

        {/* ── Dark overlay z-index 1 ───────────────────────────────── */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1 }}
        />

        {/* ── All content z-index 10 ───────────────────────────────── */}
        <div className="relative mx-auto w-full" style={{ zIndex: 10, maxWidth: "1400px" }}>

          {/* Dark space frosted glass navbar */}
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="sticky top-0 flex items-center gap-4 px-4 py-3 md:px-8 backdrop-blur-md border-b"
            style={{
              zIndex: 50,
              background: "rgba(0,8,20,0.75)",
              borderColor: "rgba(0,180,255,0.15)",
            }}
          >
            <Link
              href="/browse"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium min-h-[44px] transition-all duration-300 active:scale-95"
              style={{ color: "rgba(0,200,255,0.8)", touchAction: "manipulation" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,100,180,0.25)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <ArrowLeft className="h-4 w-4" />
              Browse
            </Link>

            <div className="flex flex-col leading-none">
              <p
                className="text-2xl font-black tracking-widest"
                style={{
                  fontFamily: "'Orbitron', 'Share Tech Mono', 'Rajdhani', monospace, system-ui",
                  color: "#00ffff",
                  textShadow: "0 0 12px rgba(0,255,255,0.7), 0 0 24px rgba(0,180,255,0.35)",
                  letterSpacing: "0.18em",
                }}
              >
                SCI-FI
              </p>
              <p
                className="text-[9px] tracking-[0.25em] uppercase font-semibold"
                style={{ color: "rgba(0,180,255,0.5)" }}
              >
                Science Fiction · Genre 878
              </p>
            </div>
          </motion.nav>

          <div className="space-y-10 pb-24 pt-8">

            {/* ── Page title ────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.1 }}
              className="px-4 md:px-8"
            >
              <h1
                className="text-5xl font-black tracking-widest md:text-7xl"
                style={{
                  fontFamily: "'Orbitron', 'Share Tech Mono', 'Rajdhani', monospace, system-ui",
                  color: "#00ffff",
                  textShadow:
                    "0 0 20px rgba(0,255,255,0.8), 0 0 40px rgba(0,180,255,0.4), 0 4px 16px rgba(0,0,0,0.9)",
                  letterSpacing: "0.14em",
                  borderLeft: "4px solid #38bdf8",
                  paddingLeft: "12px",
                }}
              >
                SCI-FI
              </h1>
              <p
                className="mt-1 text-xs tracking-[0.3em] font-semibold"
                style={{
                  color: "rgba(0,180,255,0.5)",
                  fontFamily: "'Orbitron', monospace, system-ui",
                }}
              >
                Science Fiction · Space · Future · Genre 878
              </p>
            </motion.div>

            {/* ── Genre pills — cyan/blue themed ───────────────────── */}
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
                        ? "rgba(0,150,200,0.3)"
                        : "rgba(0,60,100,0.3)",
                      color: isActive ? "#00ffff" : "rgba(0,180,255,0.65)",
                      border: `1px solid ${
                        isActive ? "rgba(0,200,255,0.55)" : "rgba(0,120,180,0.3)"
                      }`,
                      boxShadow: isActive
                        ? "0 0 14px rgba(0,200,255,0.35), inset 0 0 8px rgba(0,100,180,0.2)"
                        : "none",
                      fontFamily: "'Orbitron', monospace, system-ui",
                      fontSize: "0.75rem",
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
                    title="🚀 Sci-Fi Movies"
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
                    title="🛸 Sci-Fi Series"
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
                    title="🌌 Beyond the Stars"
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
