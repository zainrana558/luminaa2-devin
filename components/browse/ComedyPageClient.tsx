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

const ComedyCanvas = dynamic(() => import("@/components/canvas/ComedyCanvas"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 w-full h-full"
      style={{ background: "linear-gradient(160deg,#f9ca24 0%,#f0932b 50%,#ff6b9d 100%)" }} />
  ),
});

const bouncy = [0.34, 1.56, 0.64, 1] as const;
const spring = { type: "spring" as const, stiffness: 80, damping: 15 };

const GENRES = [
  { label: "All",     value: "" },
  { label: "Standup", value: "35" },
  { label: "Romcom",  value: "10749" },
  { label: "Satire",  value: "9648" },
  { label: "Family",  value: "10751" },
  { label: "Parody",  value: "35" },
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
    style={{ background: "linear-gradient(160deg,#1a0f00,#2d1a00)" }}>
    <p className="text-yellow-300 text-lg">Content unavailable.</p>
    <Link href="/browse"
      className="flex items-center gap-2 rounded-full bg-yellow-900/40 px-5 py-3 text-sm font-medium text-yellow-200 border border-yellow-500/20 min-h-[44px]"
      style={{ touchAction: "manipulation" }}>
      <ArrowLeft className="h-4 w-4" /> Back
    </Link>
  </div>
);

// ── Mobile CSS confetti ───────────────────────────────────────────────────────
function MobileConfetti() {
  const colors = ["#ff6b9d", "#f9ca24", "#6ab04c", "#74b9ff", "#fd79a8", "#f0932b", "#a29bfe", "#ff7675"];
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden md:hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <span key={i} className="absolute rounded-sm"
          style={{
            width: `${8 + (i % 4) * 3}px`,
            height: `${5 + (i % 3) * 2}px`,
            background: colors[i % colors.length],
            left: `${(i * 5) % 100}%`,
            opacity: 0.8,
            animation: `confettiFall ${3 + (i % 4)}s linear ${i * 0.25}s infinite`,
          }} />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 0.9; }
          80%  { opacity: 0.8; }
          100% { transform: translateY(110vh) rotate(540deg); opacity: 0;   }
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
      initial={{ opacity: 0, y: 60, scale: 0.92 }}
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
          className="object-cover blur-sm opacity-50"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/15" />
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      <div className="relative z-10 flex flex-col justify-end p-6 md:flex-row md:items-end md:justify-between"
        style={{ minHeight: 240 }}>
        <div className="space-y-2 max-w-lg">
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-xs font-semibold uppercase tracking-widest text-yellow-300"
          >Featured Comedy</motion.p>
          <h2 className="text-2xl font-bold text-white drop-shadow-lg md:text-3xl">{getTitle(item)}</h2>
          <p className="text-sm text-white/65 line-clamp-2">{item.overview}</p>
          <div className="flex items-center gap-3 text-xs text-yellow-200">
            <Star className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300" />
            {formatRating(item.vote_average)}
            <span>{getYear(item)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 md:mt-0">
          <motion.button
            onClick={() => onPlay({ ...item, media_type: type })}
            whileHover={{ scale: 1.1, boxShadow: "0 0 28px rgba(249,202,36,0.65)" }}
            whileTap={{ scale: 0.9 }}
            transition={spring}
            className="relative flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white overflow-hidden group min-h-[44px]"
            style={{ background: "linear-gradient(135deg,#f0932b,#f9ca24)", touchAction: "manipulation" }}
          >
            <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"
              style={{ background: "rgba(249,202,36,0.35)" }} />
            <Play className="h-4 w-4 fill-white relative z-10" />
            <span className="relative z-10">Play</span>
          </motion.button>

          <motion.button
            onClick={() => setInList(!inList)}
            whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.9 }}
            transition={spring}
            className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white min-h-[44px] border border-white/25 bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
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
interface ComedyPageClientProps {
  movies: MediaItem[];
  tv: MediaItem[];
}

export default function ComedyPageClient({ movies, tv }: ComedyPageClientProps) {
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
        style={{ background: "linear-gradient(160deg,#1a0f00 0%,#2d1a00 40%,#1a0f00 100%)" }}>

        {/* Canvas — desktop only */}
        <div className="fixed inset-0 pointer-events-none hidden md:block" style={{ zIndex: 0 }}>
          <ComedyCanvas />
        </div>

        {/* Mobile CSS confetti */}
        <MobileConfetti />

        {/* Dark overlay z-1 */}
        <div className="fixed inset-0 pointer-events-none"
          style={{ background: "rgba(0,0,0,0.35)", zIndex: 1 }} />

        {/* Content z-10 */}
        <div className="relative mx-auto w-full" style={{ zIndex: 10, maxWidth: "1400px" }}>

          {/* Frosted navbar */}
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: bouncy }}
            className="sticky top-0 flex items-center gap-4 px-4 py-3 md:px-8 backdrop-blur-md bg-black/25 border-b border-yellow-500/15"
            style={{ zIndex: 50 }}
          >
            <Link href="/browse"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-yellow-200 hover:bg-white/10 active:scale-95 transition-all duration-300 min-h-[44px]"
              style={{ touchAction: "manipulation" }}>
              <ArrowLeft className="h-4 w-4" /> Browse
            </Link>
            <div>
              <p className="text-2xl font-black tracking-wide text-white"
                style={{ fontFamily: "'Fredoka One', 'Comic Sans MS', cursive" }}>
                COMEDY
              </p>
            </div>
          </motion.nav>

          <div className="space-y-10 pb-24 pt-8">

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ ...spring, delay: 0.1 }}
              className="px-4 md:px-8"
            >
              <h1 className="text-5xl font-black tracking-wide md:text-7xl"
                style={{
                  background: "linear-gradient(135deg,#f9ca24,#f0932b,#ff6b9d)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "'Fredoka One', 'Comic Sans MS', cursive",
                  borderLeft: "4px solid #f59e0b",
                  paddingLeft: "12px",
                }}>COMEDY</h1>
              <p className="mt-1 text-xs text-yellow-300/60 tracking-widest">Laugh · TMDB Genre 35</p>
            </motion.div>

            {/* Genre pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: bouncy, delay: 0.15 }}
              className="flex gap-2 overflow-x-auto px-4 pb-1 md:px-8"
              style={{ scrollbarWidth: "none" }}
            >
              {GENRES.map((g, i) => (
                <motion.button key={`${g.value}-${i}`}
                  onClick={() => setActiveGenre(g.value)}
                  whileHover={{ scale: 1.1, transition: spring }}
                  whileTap={{ scale: 0.88 }}
                  className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 min-h-[44px]"
                  style={{
                    touchAction: "manipulation",
                    background: activeGenre === g.value
                      ? "linear-gradient(135deg,#f0932b,#f9ca24)"
                      : "rgba(249,202,36,0.1)",
                    color: activeGenre === g.value ? "#1a0f00" : "#f9ca24",
                    border: `1px solid ${activeGenre === g.value ? "transparent" : "rgba(249,202,36,0.3)"}`,
                    boxShadow: activeGenre === g.value ? "0 0 16px rgba(249,202,36,0.5)" : "none",
                    fontWeight: activeGenre === g.value ? 700 : 500,
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
                  title="Comedy Movies"
                  items={moviesFiltered}
                  onItemClick={setSelectedItem}
                  mediaType="movie"
                />
              )}
            </Suspense>

            <Suspense fallback={<SkeletonRow />}>
              {tvFiltered.length > 0 && (
                <ContentRow
                  title="Comedy TV Shows"
                  items={tvFiltered}
                  onItemClick={setSelectedItem}
                  mediaType="tv"
                />
              )}
            </Suspense>

            <Suspense fallback={<SkeletonRow />}>
              {moreFiltered.length > 0 && (
                <ContentRow
                  title="More Laughs"
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
