"use client";

import { useState, lazy, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Star } from "lucide-react";
import DetailModal from "@/components/modals/DetailModal";
import VideoPlayer from "@/components/modals/VideoPlayer";
import { getImageUrl, getTitle, getYear, formatRating } from "@/lib/utils";
import type { MediaItem } from "@/types";

const AnimeCanvas = lazy(() => import("@/components/canvas/AnimeCanvas"));

const GENRES = [
  { label: "All", value: "" },
  { label: "Action", value: "28" },
  { label: "Romance", value: "10749" },
  { label: "Comedy", value: "35" },
  { label: "Fantasy", value: "14" },
  { label: "Horror", value: "27" },
];

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const spring = { stiffness: 60, damping: 20, mass: 1 };

interface AnimePageClientProps {
  movies: MediaItem[];
  tv: MediaItem[];
}

function AnimeCard({ item, index, onClick }: { item: MediaItem; index: number; onClick: (i: MediaItem) => void }) {
  const type = item.media_type || (item.title ? "movie" : "tv");
  return (
    <motion.button
      onClick={() => onClick({ ...item, media_type: type })}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease }}
      whileHover={{ scale: 1.05, transition: { type: "spring", ...spring } }}
      whileTap={{ scale: 0.95 }}
      className="relative flex-shrink-0 w-36 md:w-44 overflow-hidden rounded-2xl group"
      style={{ touchAction: "manipulation" }}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-pink-950/40">
        <Image
          src={getImageUrl(item.poster_path)}
          alt={getTitle(item)}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 144px, 176px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400" />
        {/* Pink glow on hover */}
        <div className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 group-hover:ring-pink-400/60 transition-all duration-400 shadow-none group-hover:shadow-[0_0_20px_rgba(244,143,177,0.4)]" />
        <div className="absolute inset-0 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-full">
            <p className="truncate text-xs font-semibold text-white drop-shadow">{getTitle(item)}</p>
            <div className="flex items-center gap-1 text-xs text-pink-200">
              <Star className="h-3 w-3 fill-pink-300 text-pink-300" />
              {formatRating(item.vote_average)}
              <span className="ml-1 text-white/60">{getYear(item)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function HorizontalRow({ title, items, onItemClick }: { title: string; items: MediaItem[]; onItemClick: (i: MediaItem) => void }) {
  if (!items.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease }}
      className="space-y-3 px-4 md:px-8"
    >
      <h3 className="text-lg font-bold text-pink-100 md:text-xl">{title}</h3>
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {items.map((item, i) => (
          <AnimeCard key={item.id} item={item} index={i} onClick={onItemClick} />
        ))}
      </div>
    </motion.div>
  );
}

export default function AnimePageClient({ movies, tv }: AnimePageClientProps) {
  const [activeGenre, setActiveGenre] = useState("");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [playingItem, setPlayingItem] = useState<MediaItem | null>(null);

  const hero = tv[0] ?? movies[0];
  const heroType: "movie" | "tv" = hero?.media_type === "movie" ? "movie" : "tv";

  function handlePlay(item: MediaItem) {
    setSelectedItem(null);
    setPlayingItem(item);
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden"
      style={{ background: "linear-gradient(160deg,#120008 0%,#1a0014 40%,#0d000a 100%)" }}
    >
      {/* Three.js canvas — desktop only, CSS petals on mobile */}
      <div className="fixed inset-0 z-0 pointer-events-none hidden md:block">
        <Suspense fallback={null}>
          <AnimeCanvas />
        </Suspense>
      </div>

      {/* CSS falling petals — mobile only */}
      <div className="fixed inset-0 z-0 pointer-events-none md:hidden overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-60"
            style={{
              background: i % 2 === 0 ? "#ffb7c5" : "#f48fb1",
              left: `${(i * 5.5) % 100}%`,
              animation: `mobilePetal ${4 + (i % 4)}s linear ${i * 0.4}s infinite`,
            }}
          />
        ))}
        <style>{`
          @keyframes mobilePetal {
            0% { transform: translateY(-20px) rotate(0deg); opacity:0.7; }
            100% { transform: translateY(110vh) rotate(360deg); opacity:0; }
          }
        `}</style>
      </div>

      {/* Frosted glass top nav */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="sticky top-0 z-40 flex items-center gap-4 px-4 py-3 md:px-8 backdrop-blur-md bg-black/30 border-b border-white/10"
      >
        <Link
          href="/browse"
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-pink-200 hover:bg-white/10 transition-all duration-300 active:scale-95 min-h-[44px]"
          style={{ touchAction: "manipulation" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Browse
        </Link>
        <h1 className="text-lg font-bold text-white/80">Anime</h1>
      </motion.div>

      <div className="relative z-10 space-y-10 pb-24 pt-6">
        {/* Large title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", ...spring, delay: 0.1 }}
          className="px-4 md:px-8"
        >
          <h1 className="text-5xl font-black tracking-widest md:text-7xl"
            style={{
              background: "linear-gradient(135deg,#ffb7c5,#ff6b9d,#c44dff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "serif",
            }}
          >
            ANIME
          </h1>
          <p className="mt-1 text-sm text-pink-300/70 tracking-widest">アニメ</p>
        </motion.div>

        {/* Genre filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.2 }}
          className="flex gap-2 overflow-x-auto px-4 pb-1 md:px-8"
          style={{ scrollbarWidth: "none" }}
        >
          {GENRES.map((g) => (
            <motion.button
              key={g.value}
              onClick={() => setActiveGenre(g.value)}
              whileHover={{ scale: 1.07, transition: { type: "spring", ...spring } }}
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
            >
              {g.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Hero featured card */}
        {hero && (
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", ...spring, delay: 0.25 }}
            className="mx-4 md:mx-8 overflow-hidden rounded-2xl relative"
            style={{ minHeight: 220 }}
          >
            <div className="absolute inset-0">
              <Image
                src={getImageUrl(hero.backdrop_path ?? hero.poster_path, "w780")}
                alt={getTitle(hero)}
                fill
                className="object-cover scale-105 blur-[1px] opacity-60"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 backdrop-blur-[2px]" />
            <div className="relative z-10 flex h-full flex-col justify-end p-6 md:flex-row md:items-end md:justify-between" style={{ minHeight: 220 }}>
              <div className="space-y-2 max-w-md">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xs font-semibold uppercase tracking-widest text-pink-300"
                >Featured Anime</motion.p>
                <h2 className="text-2xl font-bold text-white drop-shadow-lg md:text-3xl">{getTitle(hero)}</h2>
                <p className="text-sm text-white/70 line-clamp-2">{hero.overview}</p>
                <div className="flex items-center gap-3 text-xs text-pink-200">
                  <Star className="h-3.5 w-3.5 fill-pink-300 text-pink-300" />
                  {formatRating(hero.vote_average)}
                  <span>{getYear(hero)}</span>
                </div>
              </div>
              <motion.button
                onClick={() => handlePlay({ ...hero, media_type: heroType })}
                whileHover={{ scale: 1.08, boxShadow: "0 0 28px rgba(233,30,140,0.6)" }}
                whileTap={{ scale: 0.93 }}
                transition={{ type: "spring", ...spring }}
                className="relative mt-4 flex items-center gap-2 self-start rounded-full px-6 py-3 text-sm font-bold text-white md:mt-0 md:self-auto min-h-[44px] overflow-hidden group"
                style={{
                  background: "linear-gradient(135deg,#e91e8c,#c44dff)",
                  touchAction: "manipulation",
                }}
              >
                <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"
                  style={{ background: "rgba(233,30,140,0.35)" }} />
                <Play className="h-4 w-4 fill-white relative z-10" />
                <span className="relative z-10">Play</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Content rows */}
        <HorizontalRow title="Popular Anime Movies" items={movies.slice(1, 20)} onItemClick={setSelectedItem} />
        <HorizontalRow title="Popular Anime TV" items={tv.slice(1, 20)} onItemClick={setSelectedItem} />
        <HorizontalRow title="More to Explore" items={[...movies, ...tv].slice(10, 30)} onItemClick={setSelectedItem} />
      </div>

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
        />
      )}
    </div>
  );
}
