"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import HeroBanner from "./HeroBanner";
import ContentRow from "./ContentRow";
import AnimeSection from "./AnimeSection";
import DetailModal from "@/components/modals/DetailModal";
import VideoPlayer from "@/components/modals/VideoPlayer";
import type { MediaItem, ContentRow as ContentRowType } from "@/types";

interface BrowseClientProps {
  heroItems: MediaItem[];
  rows: ContentRowType[];
  profileId: string | null;
  animePopular?: MediaItem[];
  animeTop?: MediaItem[];
  animeTrending?: MediaItem[];
}

export default function BrowseClient({ heroItems, rows, profileId, animePopular = [], animeTop = [], animeTrending = [] }: BrowseClientProps) {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [playingItem, setPlayingItem] = useState<MediaItem | null>(null);

  const handleDetailOpen = useCallback((e: Event) => {
    const customEvent = e as CustomEvent<MediaItem>;
    setSelectedItem(customEvent.detail);
  }, []);

  useEffect(() => {
    window.addEventListener("open-detail", handleDetailOpen);
    return () => window.removeEventListener("open-detail", handleDetailOpen);
  }, [handleDetailOpen]);

  function handleItemClick(item: MediaItem) {
    setSelectedItem(item);
  }

  function handlePlay(item: MediaItem) {
    setSelectedItem(null);
    setPlayingItem(item);
  }

  return (
    <>
      <HeroBanner
        items={heroItems}
        onPlay={handlePlay}
        onInfo={handleItemClick}
      />

      <div className="-mt-16 relative z-10 space-y-8 pb-12">
        {rows.map((row) => (
          <ContentRow
            key={row.title}
            title={row.title}
            items={row.items}
            onItemClick={handleItemClick}
            mediaType={row.mediaType}
          />
        ))}

        {/* Anime section card */}
        <div className="px-4 md:px-8 space-y-2">
          <h2 className="text-lg font-semibold md:text-xl">Anime</h2>
          <Link href="/anime">
            <motion.div
              whileHover={{ scale: 1.02, boxShadow: "0 0 32px rgba(244,143,177,0.35)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 60, damping: 20, mass: 1 }}
              className="relative overflow-hidden rounded-2xl border border-pink-500/20 bg-pink-950/20 backdrop-blur-sm p-6 cursor-pointer transition-all duration-400"
            >
              {/* CSS cherry blossom preview */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full opacity-40"
                    style={{
                      width: `${6 + (i % 4) * 2}px`,
                      height: `${6 + (i % 4) * 2}px`,
                      background: i % 2 === 0 ? "#ffb7c5" : "#f48fb1",
                      left: `${(i * 8.3) % 100}%`,
                      animation: `browseBlossomFall ${3 + (i % 3)}s linear ${i * 0.35}s infinite`,
                    }}
                  />
                ))}
                <style>{`
                  @keyframes browseBlossomFall {
                    0% { transform: translateY(-10px) rotate(0deg); opacity: 0.5; }
                    100% { transform: translateY(120px) rotate(180deg); opacity: 0; }
                  }
                `}</style>
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black tracking-widest"
                    style={{
                      background: "linear-gradient(135deg,#ffb7c5,#ff6b9d,#c44dff)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >ANIME</p>
                  <p className="text-xs text-pink-300/70 tracking-widest mt-0.5">アニメ · Explore Japanese Animation</p>
                </div>
                <div className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg,#e91e8c,#c44dff)" }}
                >
                  Explore →
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>

      {selectedItem && (
        <DetailModal
          mediaId={selectedItem.id}
          mediaType={(selectedItem.media_type || (selectedItem.title ? "movie" : "tv")) as "movie" | "tv"}
          onClose={() => setSelectedItem(null)}
          onPlay={handlePlay}
          profileId={profileId}
        />
      )}

      {playingItem && (
        <VideoPlayer
          item={playingItem}
          onClose={() => setPlayingItem(null)}
          profileId={profileId}
        />
      )}
    </>
  );
}
