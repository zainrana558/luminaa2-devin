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

// ── Dynamic import — ssr:false so Three.js never runs on server ───────────────
const CartoonCanvas = dynamic(
  () => import("@/components/canvas/CartoonCanvas"),
  {
    ssr: false,
    loading: () => (
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background:
            "linear-gradient(160deg,#2d8c2d 0%,#87CEEB 50%,#4CAF50 100%)",
        }}
      />
    ),
  }
);

// ── Animation constants ───────────────────────────────────────────────────────
const bouncyEase = [0.34, 1.56, 0.64, 1] as const;
const spring = {
  type: "spring" as const,
  stiffness: 80,
  damping: 15,
  mass: 1,
};
const heroSpring = {
  type: "spring" as const,
  stiffness: 60,
  damping: 20,
  mass: 1,
};

// ── Genre pills ───────────────────────────────────────────────────────────────
const GENRES = [
  { label: "All",       value: "" },
  { label: "Kids",      value: "10762" },
  { label: "Family",    value: "10751" },
  { label: "Adventure", value: "12" },
  { label: "Comedy",    value: "35" },
  { label: "Fantasy",   value: "14" },
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
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

const ErrorFallback = () => (
  <div
    className="flex min-h-screen flex-col items-center justify-center gap-6"
    style={{
      background:
        "linear-gradient(160deg,#1a4a1a 0%,#2d6a2d 40%,#1a3a1a 100%)",
    }}
  >
    <p className="text-green-300 text-lg">Content unavailable.</p>
    <Link
      href="/browse"
      className="flex items-center gap-2 rounded-full bg-green-900/40 px-5 py-3 text-sm font-medium text-green-200 hover:bg-green-900/60 transition-all duration-300 border border-green-500/20 min-h-[44px]"
      style={{ touchAction: "manipulation" }}
    >
      <ArrowLeft className="h-4 w-4" /> Back to Browse
    </Link>
  </div>
);

// ── Mobile CSS fallback ───────────────────────────────────────────────────────
function MobileCartoon() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden md:hidden">
      {/* Green gradient sky */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg,#87CEEB 0%,#b2e8b2 55%,#4CAF50 100%)",
        }}
      />
      {/* Floating emoji animals */}
      {[
        { emoji: "🐰", left: "10%", delay: "0s",  dur: "6s"  },
        { emoji: "🦋", left: "30%", delay: "1s",  dur: "5s"  },
        { emoji: "🐻", left: "55%", delay: "0.5s",dur: "7s"  },
        { emoji: "🦋", left: "75%", delay: "2s",  dur: "4.5s"},
        { emoji: "🐰", left: "88%", delay: "1.5s",dur: "6.5s"},
      ].map((a, i) => (
        <span
          key={i}
          className="absolute text-2xl"
          style={{
            left: a.left,
            bottom: "12%",
            animation: `cartoonBounce ${a.dur} ease-in-out ${a.delay} infinite alternate`,
          }}
        >
          {a.emoji}
        </span>
      ))}
      <style>{`
        @keyframes cartoonBounce {
          0%   { transform: translateY(0px) rotate(-5deg); }
          100% { transform: translateY(-28px) rotate(5deg); }
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
  const type: "movie" | "tv" =
    item.media_type === "movie" ? "movie" : "tv";

  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      animate={{ opacity: 1, y: 0 }}
      transition={heroSpring}
      className="mx-4 md:mx-8 overflow-hidden rounded-2xl relative"
      style={{ minHeight: 260 }}
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 scale-110">
        <Image
          src={getImageUrl(item.backdrop_path ?? item.poster_path, "w780")}
          alt=""
          fill
          className="object-cover blur-sm opacity-50"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/15" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg,rgba(255,220,50,0.08),rgba(76,175,80,0.06))",
        }}
      />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      {/* Frosted glass inner */}
      <div
        className="relative z-10 flex flex-col justify-end p-6 md:flex-row md:items-end md:justify-between"
        style={{ minHeight: 260 }}
      >
        <div className="space-y-2 max-w-lg">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "#FFD700" }}
          >
            ✨ Featured Cartoon
          </motion.p>

          <h2
            className="text-2xl font-black text-white drop-shadow-lg md:text-3xl"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
          >
            {getTitle(item)}
          </h2>

          <p className="text-sm text-white/70 line-clamp-2">{item.overview}</p>

          <div
            className="flex items-center gap-3 text-xs"
            style={{ color: "#FFD700" }}
          >
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            {formatRating(item.vote_average)}
            <span className="text-white/60">{getYear(item)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 md:mt-0 flex-wrap">
          {/* Play button — yellow gradient */}
          <motion.button
            onClick={() => onPlay({ ...item, media_type: type })}
            whileHover={{
              scale: 1.08,
              boxShadow: "0 0 32px rgba(255,200,0,0.7)",
            }}
            whileTap={{ scale: 0.92 }}
            transition={spring}
            className="relative flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black text-black overflow-hidden group min-h-[44px]"
            style={{
              background: "linear-gradient(135deg,#FFD700,#FF8C00)",
              touchAction: "manipulation",
            }}
          >
            <span
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
              style={{
                background: "rgba(255,220,0,0.35)",
                animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite",
              }}
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
            className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white min-h-[44px] backdrop-blur-sm transition-all duration-300"
            style={{
              touchAction: "manipulation",
              border: inList
                ? "1px solid rgba(76,175,80,0.6)"
                : "1px solid rgba(255,255,255,0.25)",
              background: inList
                ? "rgba(76,175,80,0.25)"
                : "rgba(255,255,255,0.1)",
            }}
          >
            {inList ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {inList ? "In List" : "My List"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Client Component ─────────────────────────────────────────────────────
interface CartoonPageClientProps {
  movies: MediaItem[];
  tv: MediaItem[];
}

export default function CartoonPageClient({
  movies,
  tv,
}: CartoonPageClientProps) {
  const [activeGenre, setActiveGenre] = useState("");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [playingItem, setPlayingItem] = useState<MediaItem | null>(null);

  const hero = tv[0] ?? movies[0];

  function filterItems(items: MediaItem[]) {
    if (!activeGenre) return items;
    return items.filter((i) => i.genre_ids?.includes(Number(activeGenre)));
  }

  function handlePlay(item: MediaItem) {
    setSelectedItem(null);
    setPlayingItem(item);
  }

  const tvFiltered      = filterItems(tv.slice(1, 20));
  const moviesFiltered  = filterItems(movies.slice(1, 20));
  const moreFiltered    = filterItems([...movies, ...tv].slice(10, 30));

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <ThemeApplier theme="cartoon" />
      <div
        className="relative min-h-screen overflow-x-hidden"
        style={{
          background:
            "linear-gradient(180deg,#87CEEB 0%,#b2e8b2 40%,#2d6a2d 100%)",
        }}
      >
        {/* ── Three.js canvas — desktop only, z-index 0 ─────────────── */}
        <div
          className="fixed inset-0 pointer-events-none hidden md:block"
          style={{ zIndex: 0 }}
        >
          <CartoonCanvas />
        </div>

        {/* ── Mobile CSS fallback ───────────────────────────────────── */}
        <MobileCartoon />

        {/* ── Semi-transparent overlay z-index 1 ───────────────────── */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ background: "rgba(0,0,0,0.3)", zIndex: 1 }}
        />

        {/* ── All content z-index 10 ────────────────────────────────── */}
        <div className="relative mx-auto w-full" style={{ zIndex: 10, maxWidth: "1400px" }}>

          {/* Frosted glass navbar */}
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: bouncyEase }}
            className="sticky top-0 flex items-center gap-4 px-4 py-3 md:px-8 backdrop-blur-md border-b"
            style={{
              zIndex: 50,
              background: "rgba(0,0,0,0.2)",
              borderColor: "rgba(255,255,255,0.12)",
            }}
          >
            <Link
              href="/browse"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 active:scale-95 transition-all duration-300 min-h-[44px]"
              style={{ touchAction: "manipulation" }}
            >
              <ArrowLeft className="h-4 w-4" />
              Browse
            </Link>

            <div className="flex flex-col leading-none">
              <p
                className="text-2xl font-black tracking-wider text-white"
                style={{
                  fontFamily:
                    "'Fredoka One', 'Nunito', 'Varela Round', system-ui, sans-serif",
                  textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  WebkitTextStroke: "1px rgba(255,200,0,0.3)",
                }}
              >
                CARTOON
              </p>
              <p
                className="text-[9px] tracking-[0.25em] uppercase font-semibold"
                style={{ color: "rgba(255,220,80,0.75)" }}
              >
                Animation · Genre 16 · English
              </p>
            </div>
          </motion.nav>

          <div className="space-y-10 pb-24 pt-8">

            {/* ── Page title ─────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...heroSpring, delay: 0.1 }}
              className="px-4 md:px-8"
            >
              <h1
                className="text-5xl font-black tracking-wider md:text-7xl"
                style={{
                  fontFamily:
                    "'Fredoka One', 'Nunito', 'Varela Round', system-ui, sans-serif",
                  background:
                    "linear-gradient(135deg,#FFD700,#FF8C00,#4CAF50,#00BCD4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                  borderLeft: "4px solid #2563eb",
                  paddingLeft: "12px",
                }}
              >
                CARTOON
              </h1>
              <p
                className="mt-1 text-xs tracking-[0.3em] font-semibold"
                style={{ color: "rgba(255,220,80,0.7)" }}
              >
                Western Animation · Kids &amp; Family · Genre 16
              </p>
            </motion.div>

            {/* ── Genre pills ────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: bouncyEase, delay: 0.18 }}
              className="flex gap-2 overflow-x-auto px-4 pb-1 md:px-8"
              style={{ scrollbarWidth: "none" }}
            >
              {GENRES.map((g) => {
                const isActive = activeGenre === g.value;
                return (
                  <motion.button
                    key={g.value}
                    onClick={() => setActiveGenre(g.value)}
                    whileHover={{
                      scale: 1.07,
                      transition: { ...spring },
                    }}
                    whileTap={{ scale: 0.92 }}
                    className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 min-h-[44px]"
                    style={{
                      touchAction: "manipulation",
                      background: isActive
                        ? "linear-gradient(135deg,#FFD700,#FF8C00)"
                        : "rgba(255,220,50,0.12)",
                      color: isActive ? "#000" : "#FFD700",
                      border: `1px solid ${
                        isActive
                          ? "transparent"
                          : "rgba(255,220,50,0.3)"
                      }`,
                      boxShadow: isActive
                        ? "0 0 18px rgba(255,200,0,0.45)"
                        : "none",
                      fontFamily:
                        "'Fredoka One', 'Nunito', system-ui, sans-serif",
                    }}
                  >
                    {g.label}
                  </motion.button>
                );
              })}
            </motion.div>

            {/* ── Hero card ──────────────────────────────────────────── */}
            {hero && <HeroCard item={hero} onPlay={handlePlay} />}

            {/* ── Content rows using existing ContentRow component ───── */}
            <Suspense fallback={<SkeletonRow />}>
              {tvFiltered.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: 0.25 }}
                >
                  <ContentRow
                    title="🐰 Popular Cartoon TV"
                    items={tvFiltered}
                    onItemClick={setSelectedItem}
                    mediaType="tv"
                  />
                </motion.div>
              )}
            </Suspense>

            <Suspense fallback={<SkeletonRow />}>
              {moviesFiltered.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: 0.33 }}
                >
                  <ContentRow
                    title="🎬 Animated Movies"
                    items={moviesFiltered}
                    onItemClick={setSelectedItem}
                    mediaType="movie"
                  />
                </motion.div>
              )}
            </Suspense>

            <Suspense fallback={<SkeletonRow />}>
              {moreFiltered.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: 0.41 }}
                >
                  <ContentRow
                    title="🦋 More to Explore"
                    items={moreFiltered}
                    onItemClick={setSelectedItem}
                  />
                </motion.div>
              )}
            </Suspense>

          </div>
        </div>

        {/* ── Modals ────────────────────────────────────────────────── */}
        <AnimatePresence>
          {selectedItem && (
            <DetailModal
              mediaId={selectedItem.id}
              mediaType={
                (selectedItem.media_type || "tv") as "movie" | "tv"
              }
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
