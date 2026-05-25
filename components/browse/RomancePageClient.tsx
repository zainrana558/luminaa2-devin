"use client";

import { useState, Component, Suspense } from "react";
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

const RomanceCanvas = dynamic(() => import("@/components/canvas/RomanceCanvas"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 w-full h-full"
      style={{ background: "linear-gradient(160deg,#2d0a1f 0%,#1a0010 50%,#3d1030 100%)" }} />
  ),
});

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const spring = { type: "spring" as const, stiffness: 50, damping: 25 };

const GENRES = [
  { label: "All",      value: "" },
  { label: "Romantic", value: "10749" },
  { label: "Drama",    value: "18" },
  { label: "Romcom",   value: "35" },
  { label: "Classic",  value: "36" },
  { label: "Holiday",  value: "10751" },
];

// ── Error Boundary ─────────────────────────────────────────────────────────
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

const ErrFallback = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-6"
    style={{ background: "linear-gradient(160deg,#1a0010,#2d0a1f)" }}>
    <p className="text-pink-300 text-lg">Content unavailable.</p>
    <Link href="/browse"
      className="flex items-center gap-2 rounded-full bg-pink-900/40 px-5 py-3 text-sm font-medium text-pink-200 border border-pink-500/20 min-h-[44px]"
      style={{ touchAction: "manipulation" }}>
      <ArrowLeft className="h-4 w-4" /> Back
    </Link>
  </div>
);

// ── Mobile CSS hearts ───────────────────────────────────────────────────────
function MobileHearts() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden md:hidden"
      style={{ background: "linear-gradient(160deg,#1a0010,#2d0a1f,#1a0010)" }}>
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className="absolute text-pink-400"
          style={{
            fontSize: `${10 + (i % 4) * 4}px`,
            left: `${(i * 5.5) % 100}%`,
            opacity: 0.5 + (i % 3) * 0.15,
            animation: `heartFloat ${5 + (i % 4)}s ease-in-out ${i * 0.4}s infinite`,
          }}>♥</span>
      ))}
      <style>{`
        @keyframes heartFloat {
          0%   { transform: translateY(110vh) scale(0.8); opacity: 0; }
          20%  { opacity: 0.7; }
          80%  { opacity: 0.5; }
          100% { transform: translateY(-10vh) scale(1.1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── Hero Card ───────────────────────────────────────────────────────────────
function HeroCard({ item, onPlay }: { item: MediaItem; onPlay: (i: MediaItem) => void }) {
  const [inList, setInList] = useState(false);
  const type: "movie" | "tv" = item.media_type === "movie" ? "movie" : "tv";

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="mx-4 md:mx-8 overflow-hidden rounded-2xl relative"
      style={{ minHeight: 240 }}
    >
      <div className="absolute inset-0 scale-110">
        <Image
          src={getImageUrl(item.backdrop_path ?? item.poster_path, "w780")}
          alt=""
          fill
          className="object-cover blur-sm opacity-45"
        />
      </div>
      {/* Pink tinted overlay */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(135deg,rgba(180,0,80,0.5) 0%,rgba(0,0,0,0.7) 60%,rgba(0,0,0,0.3) 100%)" }} />
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      <div className="relative z-10 flex flex-col justify-end p-6 md:flex-row md:items-end md:justify-between"
        style={{ minHeight: 240 }}>
        <div className="space-y-2 max-w-lg">
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-xs font-medium uppercase tracking-widest text-pink-300"
            style={{ fontFamily: "serif", fontStyle: "italic" }}
          >Featured Romance</motion.p>
          <h2 className="text-2xl font-bold text-white drop-shadow-lg md:text-3xl"
            style={{ fontFamily: "'Playfair Display','Georgia',serif", fontStyle: "italic" }}>
            {getTitle(item)}
          </h2>
          <p className="text-sm text-white/65 line-clamp-2">{item.overview}</p>
          <div className="flex items-center gap-3 text-xs text-pink-200">
            <Star className="h-3.5 w-3.5 fill-pink-300 text-pink-300" />
            {formatRating(item.vote_average)}
            <span>{getYear(item)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 md:mt-0">
          <motion.button
            onClick={() => onPlay({ ...item, media_type: type })}
            whileHover={{ scale: 1.06, boxShadow: "0 0 24px rgba(255,20,147,0.55)" }}
            whileTap={{ scale: 0.94 }}
            transition={spring}
            className="relative flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white overflow-hidden group min-h-[44px]"
            style={{ background: "linear-gradient(135deg,#ff1493,#ff69b4)", touchAction: "manipulation" }}
          >
            <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"
              style={{ background: "rgba(255,20,147,0.3)" }} />
            <Play className="h-4 w-4 fill-white relative z-10" />
            <span className="relative z-10">Play</span>
          </motion.button>

          <motion.button
            onClick={() => setInList(!inList)}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }}
            transition={spring}
            className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white min-h-[44px] border border-pink-300/20 bg-pink-900/20 hover:bg-pink-900/40 transition-all duration-300 backdrop-blur-sm"
            style={{ touchAction: "manipulation" }}
          >
            {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {inList ? "In List" : "My List"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
interface RomancePageClientProps {
  movies: MediaItem[];
  tv: MediaItem[];
}

export default function RomancePageClient({ movies, tv }: RomancePageClientProps) {
  const [activeGenre, setActiveGenre] = useState("");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [playingItem, setPlayingItem] = useState<MediaItem | null>(null);

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
  const tvFiltered = filterItems(tv.slice(1, 20));
  const moreFiltered = filterItems([...movies, ...tv].slice(10, 30));

  return (
    <ErrorBoundary fallback={<ErrFallback />}>
      <ThemeApplier theme="romance" />
      <div className="relative min-h-screen overflow-x-hidden"
        style={{ background: "linear-gradient(160deg,#1a0010 0%,#2d0a1f 40%,#1a0010 100%)" }}>

        {/* Canvas — desktop only */}
        <div className="fixed inset-0 pointer-events-none hidden md:block" style={{ zIndex: 0 }}>
          <RomanceCanvas />
        </div>

        {/* Mobile hearts */}
        <MobileHearts />

        {/* Soft overlay z-1 */}
        <div className="fixed inset-0 pointer-events-none"
          style={{ background: "rgba(0,0,0,0.4)", zIndex: 1 }} />

        {/* Content z-10 */}
        <div className="relative mx-auto w-full" style={{ zIndex: 10, maxWidth: "1400px" }}>

          {/* Soft pink frosted navbar */}
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="sticky top-0 flex items-center gap-4 px-4 py-3 md:px-8 backdrop-blur-md border-b border-pink-300/10"
            style={{ zIndex: 50, background: "rgba(180,0,80,0.12)" }}
          >
            <Link href="/browse"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-pink-200 hover:bg-pink-900/30 active:scale-95 transition-all duration-300 min-h-[44px]"
              style={{ touchAction: "manipulation" }}>
              <ArrowLeft className="h-4 w-4" /> Browse
            </Link>
            <div>
              <p className="text-2xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display','Georgia',serif", fontStyle: "italic" }}>
                Romance
              </p>
            </div>
          </motion.nav>

          <div className="space-y-10 pb-24 pt-8">

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.1 }}
              className="px-4 md:px-8"
            >
              <h1 className="text-5xl font-bold md:text-7xl"
                style={{
                  background: "linear-gradient(135deg,#ff69b4,#ff1493,#ffd700)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "'Playfair Display','Georgia',serif",
                  fontStyle: "italic",
                  borderLeft: "4px solid #c2848a",
                  paddingLeft: "12px",
                }}>Romance</h1>
              <p className="mt-1 text-xs text-pink-300/60 tracking-widest">Love Stories · TMDB Genre 10749</p>
            </motion.div>

            {/* Genre pills */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.2 }}
              className="flex gap-2 overflow-x-auto px-4 pb-1 md:px-8"
              style={{ scrollbarWidth: "none" }}
            >
              {GENRES.map((g) => (
                <motion.button key={g.value}
                  onClick={() => setActiveGenre(g.value)}
                  whileHover={{ scale: 1.06, transition: spring }}
                  whileTap={{ scale: 0.94 }}
                  className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 min-h-[44px]"
                  style={{
                    touchAction: "manipulation",
                    background: activeGenre === g.value
                      ? "linear-gradient(135deg,#ff1493,#ff69b4)"
                      : "rgba(255,105,180,0.1)",
                    color: activeGenre === g.value ? "#fff" : "#ff69b4",
                    border: `1px solid ${activeGenre === g.value ? "transparent" : "rgba(255,105,180,0.25)"}`,
                    boxShadow: activeGenre === g.value ? "0 0 16px rgba(255,20,147,0.4)" : "none",
                  }}
                >{g.label}</motion.button>
              ))}
            </motion.div>

            {/* Hero */}
            {hero && <HeroCard item={hero} onPlay={handlePlay} />}

            {/* Content rows */}
            <Suspense fallback={<SkeletonRow />}>
              {moviesFiltered.length > 0 && (
                <ContentRow
                  title="Romantic Movies"
                  items={moviesFiltered}
                  onItemClick={setSelectedItem}
                  mediaType="movie"
                />
              )}
            </Suspense>

            <Suspense fallback={<SkeletonRow />}>
              {tvFiltered.length > 0 && (
                <ContentRow
                  title="Romantic TV Shows"
                  items={tvFiltered}
                  onItemClick={setSelectedItem}
                  mediaType="tv"
                />
              )}
            </Suspense>

            <Suspense fallback={<SkeletonRow />}>
              {moreFiltered.length > 0 && (
                <ContentRow
                  title="More Love Stories"
                  items={moreFiltered}
                  onItemClick={setSelectedItem}
                />
              )}
            </Suspense>

          </div>
        </div>

        {/* Modals */}
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
