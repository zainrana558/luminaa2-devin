"use client";

import { useState, Component, Suspense } from "react";
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

const ActionCanvas = dynamic(() => import("@/components/canvas/ActionCanvas"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 w-full h-full"
      style={{ background: "linear-gradient(160deg,#050200 0%,#1a0800 50%,#2a1000 100%)" }} />
  ),
});

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const spring = { type: "spring" as const, stiffness: 100, damping: 10 };

const GENRES = [
  { label: "All",        value: "" },
  { label: "Thriller",   value: "53" },
  { label: "War",        value: "10752" },
  { label: "Crime",      value: "80" },
  { label: "Superhero",  value: "878" },
  { label: "Adventure",  value: "12" },
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

const ErrFallback = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-6"
    style={{ background: "linear-gradient(160deg,#050200,#1a0800)" }}>
    <p className="text-orange-300 text-lg">Content unavailable.</p>
    <Link href="/browse"
      className="flex items-center gap-2 rounded-full bg-orange-900/40 px-5 py-3 text-sm font-medium text-orange-200 border border-orange-500/20 min-h-[44px]"
      style={{ touchAction: "manipulation" }}>
      <ArrowLeft className="h-4 w-4" /> Back
    </Link>
  </div>
);

// ── Mobile CSS sparks ─────────────────────────────────────────────────────────
function MobileSparks() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden md:hidden"
      style={{ background: "linear-gradient(160deg,#050200,#1a0800,#050200)" }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <span key={i} className="absolute rounded-full"
          style={{
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            background: i % 2 === 0 ? "#ff4500" : "#ff6b35",
            left: `${(i * 5) % 100}%`,
            top: `${(i * 7) % 100}%`,
            opacity: 0.7,
            animation: `sparkFloat ${2 + (i % 3)}s ease-in-out ${i * 0.2}s infinite alternate`,
          }} />
      ))}
      <style>{`
        @keyframes sparkFloat {
          0%   { transform: translateY(0px) scale(1);   opacity: 0.7; }
          100% { transform: translateY(-30px) scale(0); opacity: 0;   }
        }
      `}</style>
    </div>
  );
}

// ── Hero Card ─────────────────────────────────────────────────────────────────
function HeroCard({ item, onPlay }: { item: MediaItem; onPlay: (i: MediaItem) => void }) {
  const [inList, setInList] = useState(false);
  const type: "movie" | "tv" = item.media_type === "movie" ? "movie" : "tv";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
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
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/20" />
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      <div className="relative z-10 flex flex-col justify-end p-6 md:flex-row md:items-end md:justify-between"
        style={{ minHeight: 240 }}>
        <div className="space-y-2 max-w-lg">
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-xs font-semibold uppercase tracking-widest text-orange-400"
          >Featured Action</motion.p>
          <h2 className="text-2xl font-black text-white drop-shadow-lg md:text-3xl"
            style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: "0.05em" }}>
            {getTitle(item)}
          </h2>
          <p className="text-sm text-white/65 line-clamp-2">{item.overview}</p>
          <div className="flex items-center gap-3 text-xs text-orange-200">
            <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
            {formatRating(item.vote_average)}
            <span>{getYear(item)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 md:mt-0">
          <motion.button
            onClick={() => onPlay({ ...item, media_type: type })}
            whileHover={{ scale: 1.08, boxShadow: "0 0 32px rgba(255,69,0,0.7)" }}
            whileTap={{ scale: 0.88 }}
            transition={spring}
            className="relative flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black text-white overflow-hidden group min-h-[44px]"
            style={{
              background: "linear-gradient(135deg,#ff4500,#ff8c00)",
              touchAction: "manipulation",
              fontFamily: "'Bebas Neue','Impact',sans-serif",
              letterSpacing: "0.08em",
              fontSize: "0.95rem",
            }}
          >
            <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"
              style={{ background: "rgba(255,69,0,0.4)" }} />
            <Play className="h-4 w-4 fill-white relative z-10" />
            <span className="relative z-10">PLAY</span>
          </motion.button>

          <motion.button
            onClick={() => setInList(!inList)}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.88 }}
            transition={spring}
            className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white min-h-[44px] border border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
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

// ── Main Component ────────────────────────────────────────────────────────────
interface ActionPageClientProps {
  movies: MediaItem[];
  tv: MediaItem[];
}

export default function ActionPageClient({ movies, tv }: ActionPageClientProps) {
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
      <div className="relative min-h-screen overflow-x-hidden"
        style={{ background: "linear-gradient(160deg,#050200 0%,#1a0800 40%,#050200 100%)" }}>

        {/* Canvas — desktop only, z-0 */}
        <div className="fixed inset-0 pointer-events-none hidden md:block" style={{ zIndex: 0 }}>
          <ActionCanvas />
        </div>

        {/* Mobile sparks */}
        <MobileSparks />

        {/* Dark overlay z-1 */}
        <div className="fixed inset-0 pointer-events-none"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1 }} />

        {/* Content z-10 */}
        <div className="relative" style={{ zIndex: 10 }}>

          {/* Frosted dark steel navbar */}
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease }}
            className="sticky top-0 flex items-center gap-4 px-4 py-3 md:px-8 backdrop-blur-md bg-black/40 border-b border-orange-900/30"
            style={{ zIndex: 50 }}
          >
            <Link href="/browse"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-orange-200 hover:bg-white/10 active:scale-95 transition-all duration-300 min-h-[44px]"
              style={{ touchAction: "manipulation" }}>
              <ArrowLeft className="h-4 w-4" /> Browse
            </Link>
            <div>
              <p className="text-2xl font-black tracking-widest text-white"
                style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: "0.15em" }}>
                ACTION
              </p>
            </div>
          </motion.nav>

          <div className="space-y-10 pb-24 pt-8">

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...spring, delay: 0.1 }}
              className="px-4 md:px-8"
            >
              <h1 className="text-5xl font-black tracking-widest md:text-8xl"
                style={{
                  background: "linear-gradient(135deg,#ff4500,#ff8c00,#ffd700)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "'Bebas Neue','Impact',sans-serif",
                  letterSpacing: "0.1em",
                }}>ACTION</h1>
              <p className="mt-1 text-xs text-orange-400/60 tracking-widest">TMDB Genre 28 · High Intensity</p>
            </motion.div>

            {/* Genre pills */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease, delay: 0.12 }}
              className="flex gap-2 overflow-x-auto px-4 pb-1 md:px-8"
              style={{ scrollbarWidth: "none" }}
            >
              {GENRES.map((g) => (
                <motion.button key={g.value}
                  onClick={() => setActiveGenre(g.value)}
                  whileHover={{ scale: 1.08, transition: spring }}
                  whileTap={{ scale: 0.88 }}
                  className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 min-h-[44px]"
                  style={{
                    touchAction: "manipulation",
                    background: activeGenre === g.value
                      ? "linear-gradient(135deg,#ff4500,#ff8c00)"
                      : "rgba(255,69,0,0.1)",
                    color: activeGenre === g.value ? "#fff" : "#ff8c00",
                    border: `1px solid ${activeGenre === g.value ? "transparent" : "rgba(255,140,0,0.3)"}`,
                    boxShadow: activeGenre === g.value ? "0 0 20px rgba(255,69,0,0.5)" : "none",
                    letterSpacing: "0.05em",
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
                  title="Action Movies"
                  items={moviesFiltered}
                  onItemClick={setSelectedItem}
                  mediaType="movie"
                />
              )}
            </Suspense>

            <Suspense fallback={<SkeletonRow />}>
              {tvFiltered.length > 0 && (
                <ContentRow
                  title="Action TV Shows"
                  items={tvFiltered}
                  onItemClick={setSelectedItem}
                  mediaType="tv"
                />
              )}
            </Suspense>

            <Suspense fallback={<SkeletonRow />}>
              {moreFiltered.length > 0 && (
                <ContentRow
                  title="More Action"
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
