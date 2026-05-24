"use client";

import { useState, useEffect, useCallback } from "react";
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

        <AnimeSection
          popularAnime={animePopular}
          topAnime={animeTop}
          trendingAnime={animeTrending}
          onItemClick={handleItemClick}
        />
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
