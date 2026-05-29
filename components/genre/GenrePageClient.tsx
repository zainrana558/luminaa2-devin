"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ContentRow from "@/components/browse/ContentRow";
import DetailModal from "@/components/modals/DetailModal";
import VideoPlayer from "@/components/modals/VideoPlayer";
import type { MediaItem, ContentRow as ContentRowType } from "@/types";

interface GenrePageClientProps {
  title: string;
  accentColor: string;
  rows: ContentRowType[];
  heroItem: MediaItem | null;
  profileId: string | null;
  pills: string[];
}

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { ease: [0.25, 0.46, 0.45, 0.94], duration: 0.5 },
  },
};

const springTransition = { type: "spring" as const, stiffness: 60, damping: 20 };

export default function GenrePageClient({
  title,
  accentColor,
  rows,
  heroItem,
  profileId,
  pills,
}: GenrePageClientProps) {
  const router = useRouter();
  const [activePill, setActivePill] = useState(pills[0] ?? "All");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [playingItem, setPlayingItem] = useState<MediaItem | null>(null);

  function handlePlay(item: MediaItem) {
    setSelectedItem(null);
    setPlayingItem(item);
  }

  return (
    <div className="relative min-h-[100dvh] bg-background">
      {/* Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{ background: "rgba(0,0,0,0.45)" }}
      />

      {/* Gradient bg using accent color */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% -10%, ${accentColor}33 0%, transparent 70%), var(--background)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Frosted glass navbar */}
        <header
          className="sticky top-0 z-50 flex items-center gap-4 px-4 py-3 md:px-8"
          style={{
            background: "rgba(10,10,18,0.72)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <button
            onClick={() => router.push("/browse")}
            className="flex h-10 w-10 min-w-[44px] items-center justify-center rounded-full transition-colors hover:bg-white/10"
            style={{ color: accentColor }}
            aria-label="Back to Browse"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1
            className="text-2xl font-bold tracking-tight md:text-3xl"
            style={{ color: accentColor }}
          >
            {title}
          </h1>
        </header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8 pb-24 pt-6"
        >
          {/* Hero card */}
          {heroItem && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springTransition}
              className="mx-4 md:mx-8 cursor-pointer overflow-hidden rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
              onClick={() => setSelectedItem(heroItem)}
            >
              {heroItem.backdrop_path && (
                <div className="relative h-48 w-full overflow-hidden md:h-72">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://image.tmdb.org/t/p/w1280${heroItem.backdrop_path}`}
                    alt={heroItem.title ?? heroItem.name ?? ""}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-lg font-bold text-white drop-shadow md:text-2xl">
                      {heroItem.title ?? heroItem.name}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-white/70 md:text-sm">
                      {heroItem.overview}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Genre filter pills */}
          <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto px-4 pb-1 md:px-8" style={{ scrollbarWidth: "none" }}>
            {pills.map((pill) => (
              <button
                key={pill}
                onClick={() => setActivePill(pill)}
                className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 min-h-[44px]"
                style={
                  activePill === pill
                    ? { background: accentColor, color: "#000" }
                    : {
                        background: "rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.7)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }
                }
              >
                {pill}
              </button>
            ))}
          </motion.div>

          {/* Content rows */}
          {rows.map((row) => (
            <motion.div key={row.title} variants={itemVariants}>
              <ContentRow
                title={row.title}
                items={row.items}
                onItemClick={setSelectedItem}
                mediaType={row.mediaType}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedItem && (
          <DetailModal
            mediaId={selectedItem.id}
            mediaType={
              (selectedItem.media_type || (selectedItem.title ? "movie" : "tv")) as "movie" | "tv"
            }
            onClose={() => setSelectedItem(null)}
            onPlay={handlePlay}
            profileId={profileId}
          />
        )}
      </AnimatePresence>

      {playingItem && (
        <VideoPlayer
          item={playingItem}
          onClose={() => setPlayingItem(null)}
          profileId={profileId}
        />
      )}
    </div>
  );
}
