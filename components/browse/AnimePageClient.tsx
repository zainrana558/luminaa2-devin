"use client";

import { useState, useEffect, Component, Suspense } from "react";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ThemeApplier } from "@/components/ui/ThemeApplier";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Plus, Check, Star } from "lucide-react";
import ContentRow from "@/components/browse/ContentRow";
import DetailModal from "@/components/modals/DetailModal";
import VideoPlayer from "@/components/modals/VideoPlayer";
import SkeletonRow from "@/components/browse/SkeletonRow";
import { getImageUrl, getTitle, getYear, formatRating } from "@/lib/utils";
import type { MediaItem } from "@/types";

// Dynamic import — ssr:false so Three.js never runs on server
const AnimeCanvas = dynamic(() => import("@/components/canvas/AnimeCanvas"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 w-full h-full"
      style={{ background: "linear-gradient(160deg,#2d0020 0%,#1a0030 50%,#0d000a 100%)" }} />
  ),
});

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const spring = { type: "spring" as const, stiffness: 60, damping: 20, mass: 1 };

const GENRES = [
  { label: "All",     value: "" },
  { label: "Action",  value: "28" },
  { label: "Romance", value: "10749" },
  { label: "Fantasy", value: "14" },
  { label: "Shonen",  value: "10759" },
  { label: "Seinen",  value: "10763" },
];

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
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
  <div className="flex min-h-screen flex-col items-center justify-center gap-6"
    style={{ background: "linear-gradient(160deg,#120008 0%,#1a0014 40%,#0d000a 100%)" }}>
    <p className="text-pink-300 text-lg">Content unavailable.</p>
    <Link href="/browse"
      className="flex items-center gap-2 rounded-full bg-pink-900/40 px-5 py-3 text-sm font-medium text-pink-200 hover:bg-pink-900/60 transition-all duration-300 border border-pink-500/20 min-h-[44px]"
      style={{ touchAction: "manipulation" }}>
      <ArrowLeft className="h-4 w-4" /> Back to Browse
    </Link>
  </div>
);

// ── Mobile CSS petals ─────────────────────────────────────────────────────────
function MobilePetals() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden md:hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <span key={i} className="absolute rounded-full"
          style={{
            width: `${6 + (i % 5) * 2}px`,
            height: `${6 + (i % 5) * 2}px`,
            background: i % 2 === 0 ? "#ffb7c5" : "#f48fb1",
            left: `${(i * 5) % 100}%`,
            opacity: 0.55,
            animation: `mobilePetal ${4 + (i % 4)}s linear ${i * 0.35}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes mobilePetal {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 0.6; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0;   }
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
      initial={{ opacity: 0, y: 48 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="mx-4 md:mx-8 overflow-hidden rounded-2xl relative"
      style={{ minHeight: 240 }}
    >
      {/* Blurred poster background */}
      <div className="absolute inset-0 scale-110">
        <Image
          src={getImageUrl(item.backdrop_path ?? item.poster_path, "w780")}
          alt=""
          fill
          className="object-cover blur-sm opacity-50"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      <div className="relative z-10 flex flex-col justify-end p-6 md:flex-row md:items-end md:justify-between"
        style={{ minHeight: 240 }}>
        <div className="space-y-2 max-w-lg">
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
            className="text-xs font-semibold uppercase tracking-widest text-pink-300"
          >Featured Anime</motion.p>
          <h2 className="text-2xl font-bold text-white drop-shadow-lg md:text-3xl">{getTitle(item)}</h2>
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
            whileHover={{ scale: 1.08, boxShadow: "0 0 28px rgba(233,30,140,0.65)" }}
            whileTap={{ scale: 0.93 }}
            transition={spring}
            className="relative flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white overflow-hidden group min-h-[44px]"
            style={{ background: "linear-gradient(135deg,#e91e8c,#c44dff)", touchAction: "manipulation" }}
          >
            <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"
              style={{ background: "rgba(233,30,140,0.3)" }} />
            <Play className="h-4 w-4 fill-white relative z-10" />
            <span className="relative z-10">Play</span>
          </motion.button>

          <motion.button
            onClick={() => setInList(!inList)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
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

// ── Enriched Metadata (max 20 lines added) ────────────────────────────���──────
function AnimeMetadata({ item }: { item: MediaItem | undefined }) {
  const [animeData, setAnimeData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => {
    if (!item) return;
    const title = getTitle(item);
    fetch(`/api/anime/metadata?tmdbId=${item.id}&title=${encodeURIComponent(title)}`)
      .then(r => r.json()).then(setAnimeData).catch(() => null);
  }, [item]);
  if (!animeData) return null;
  const studios = (animeData.studios as { nodes?: { name: string }[] } | undefined)?.nodes;
  return (
    <div className="px-4 md:px-8">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-pink-500/20 bg-pink-950/20 p-4 text-xs text-pink-200 backdrop-blur-sm">
        {animeData.episodes != null && <span className="rounded-full bg-pink-900/30 px-3 py-1">Episodes: {String(animeData.episodes)}</span>}
        {animeData.averageScore != null && <span className="rounded-full bg-pink-900/30 px-3 py-1">Score: {String(animeData.averageScore)}/100</span>}
        {studios?.map(s => <span key={s.name} className="rounded-full bg-purple-900/30 px-3 py-1">{s.name}</span>)}
        {animeData.status != null && <span className="rounded-full bg-pink-900/30 px-3 py-1">{String(animeData.status)}</span>}
      </div>
    </div>
  );
}

// ── Main Client Component ─────────────────────────────────────────────────────
interface AnimePageClientProps {
  movies: MediaItem[];
  tv: MediaItem[];
}

export default function AnimePageClient({ movies, tv }: AnimePageClientProps) {
  const [activeGenre, setActiveGenre] = useState("");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [playingItem, setPlayingItem] = useState<MediaItem | null>(null);
  const [episode, setEpisode] = useState(1);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamSource, setStreamSource] = useState<string | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);

  const hero = tv[0] ?? movies[0];

  async function loadStream(ep: number) {
    if (!hero) return;
    setStreamLoading(true);
    const title = getTitle(hero);
    const data = await fetch(
      `/api/anime/stream?title=${encodeURIComponent(title)}&episode=${ep}`
    ).then(r => r.json()).catch(() => null);
    setStreamUrl(data?.url ?? null);
    setStreamSource(data?.source ?? "embed");
    setStreamLoading(false);
  }

  // Filter items by genre_ids when a subgenre is active
  function filterItems(items: MediaItem[]) {
    if (!activeGenre) return items;
    return items.filter((i) => i.genre_ids?.includes(Number(activeGenre)));
  }

  function handlePlay(item: MediaItem) {
    setSelectedItem(null);
    setPlayingItem(item);
  }

  const tvFiltered = filterItems(tv.slice(1, 20));
  const moviesFiltered = filterItems(movies.slice(1, 20));
  const moreFiltered = filterItems([...movies, ...tv].slice(10, 30));

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <ThemeApplier theme="anime" />
      <div className="relative min-h-screen overflow-x-hidden"
        style={{ background: "linear-gradient(160deg,#120008 0%,#1a0014 40%,#0d000a 100%)" }}>

        {/* Canvas — desktop only, z-index 0 */}
        <div className="fixed inset-0 pointer-events-none hidden md:block" style={{ zIndex: 0 }}>
          <AnimeCanvas />
        </div>

        {/* Mobile CSS petals */}
        <MobilePetals />

        {/* Dark overlay z-index 1 */}
        <div className="fixed inset-0 pointer-events-none"
          style={{ background: "rgba(0,0,0,0.45)", zIndex: 1 }} />

        {/* All content z-index 10 */}
        <div className="relative mx-auto w-full" style={{ zIndex: 10, maxWidth: "1400px" }}>

          {/* Frosted glass navbar */}
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="sticky top-0 flex items-center gap-4 px-4 py-3 md:px-8 backdrop-blur-md bg-black/30 border-b border-white/10"
            style={{ zIndex: 50 }}
          >
            <Link href="/browse"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-pink-200 hover:bg-white/10 active:scale-95 transition-all duration-300 min-h-[44px]"
              style={{ touchAction: "manipulation" }}>
              <ArrowLeft className="h-4 w-4" />
              Browse
            </Link>
            <div>
              <p className="text-xl font-bold text-white leading-none" style={{ fontFamily: "serif" }}>アニメ</p>
              <p className="text-[10px] tracking-[0.2em] text-pink-300/70 uppercase font-semibold">Anime</p>
            </div>
          </motion.nav>

          <div className="space-y-10 pb-24 pt-8">

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...spring, delay: 0.1 }}
              className="px-4 md:px-8"
            >
              <h1 className="text-5xl font-black tracking-widest md:text-7xl"
                style={{
                  background: "linear-gradient(135deg,#ffb7c5,#ff6b9d,#c44dff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "serif",
                  borderLeft: "4px solid #e8a0bf",
                  paddingLeft: "12px",
                }}>ANIME</h1>
              <p className="mt-1 text-xs text-pink-300/60 tracking-[0.3em]">Japanese Animation · Genre 16</p>
            </motion.div>

            {/* Genre filter pills */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.18 }}
              className="flex gap-2 overflow-x-auto px-4 pb-1 md:px-8"
              style={{ scrollbarWidth: "none" }}
            >
              {GENRES.map((g) => (
                <motion.button key={g.value}
                  onClick={() => setActiveGenre(g.value)}
                  whileHover={{ scale: 1.07, transition: spring }}
                  whileTap={{ scale: 0.92 }}
                  className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 min-h-[44px]"
                  style={{
                    touchAction: "manipulation",
                    background: activeGenre === g.value
                      ? "linear-gradient(135deg,#e91e8c,#c44dff)"
                      : "rgba(255,183,197,0.1)",
                    color: activeGenre === g.value ? "#fff" : "#ffb7c5",
                    border: `1px solid ${activeGenre === g.value ? "transparent" : "rgba(255,183,197,0.25)"}`,
                    boxShadow: activeGenre === g.value ? "0 0 16px rgba(233,30,140,0.4)" : "none",
                  }}
                >{g.label}</motion.button>
              ))}
            </motion.div>

            {/* Hero card */}
            {hero && <HeroCard item={hero} onPlay={handlePlay} />}

            {/* Episode selector + stream source indicator */}
            <div className="px-4 md:px-8 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-pink-300/70 uppercase tracking-widest">Episode</span>
                {streamSource === "consumet" && <span className="rounded-full bg-green-900/40 border border-green-500/30 px-3 py-0.5 text-xs text-green-300">HD Stream</span>}
                {streamSource === "aniwatch"  && <span className="rounded-full bg-yellow-900/40 border border-yellow-500/30 px-3 py-0.5 text-xs text-yellow-300">Stream</span>}
                {streamSource === "embed"     && <span className="rounded-full bg-zinc-800/60 border border-zinc-600/30 px-3 py-0.5 text-xs text-zinc-400">Embed</span>}
                {streamLoading                && <span className="rounded-full bg-pink-900/30 px-3 py-0.5 text-xs text-pink-300 animate-pulse">Loading…</span>}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {Array.from({ length: 24 }, (_, i) => i + 1).map(ep => (
                  <button key={ep} onClick={() => { setEpisode(ep); loadStream(ep); }}
                    className="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 active:scale-95 min-w-[36px] min-h-[36px]"
                    style={{ touchAction: "manipulation", background: episode === ep ? "linear-gradient(135deg,#e91e8c,#c44dff)" : "rgba(255,183,197,0.1)", color: episode === ep ? "#fff" : "#ffb7c5", border: `1px solid ${episode === ep ? "transparent" : "rgba(255,183,197,0.2)"}` }}
                  >{ep}</button>
                ))}
              </div>
            </div>

            {/* Content rows using existing ContentRow component */}
            <Suspense fallback={<SkeletonRow />}>
              {tvFiltered.length > 0 && (
                <ContentRow
                  title="Popular Anime TV"
                  items={tvFiltered}
                  onItemClick={setSelectedItem}
                  mediaType="tv"
                />
              )}
            </Suspense>

            <Suspense fallback={<SkeletonRow />}>
              {moviesFiltered.length > 0 && (
                <ContentRow
                  title="Anime Movies"
                  items={moviesFiltered}
                  onItemClick={setSelectedItem}
                  mediaType="movie"
                />
              )}
            </Suspense>

            <Suspense fallback={<SkeletonRow />}>
              {moreFiltered.length > 0 && (
                <ContentRow
                  title="More to Explore"
                  items={moreFiltered}
                  onItemClick={setSelectedItem}
                />
              )}
            </Suspense>

            {/* Enriched metadata — only shown if API returns data */}
            <AnimeMetadata item={hero} />

          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {selectedItem && (
            <DetailModal
              mediaId={selectedItem.id}
              mediaType={(selectedItem.media_type || "tv") as "movie" | "tv"}
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
            initialEpisode={episode}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
