"use client";

import { useState } from "react";
import MediaCard from "./MediaCard";
import DetailModal from "@/components/modals/DetailModal";
import VideoPlayer from "@/components/modals/VideoPlayer";
import type { MediaItem } from "@/types";

interface HistoryItem {
  id: string;
  profile_id: string;
  media_id: number;
  media_type: string;
  title: string;
  poster_path: string | null;
  watched_at: string;
}

interface HistoryClientProps {
  items: HistoryItem[];
  profileId: string;
}

export default function HistoryClient({ items, profileId }: HistoryClientProps) {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [playingItem, setPlayingItem] = useState<MediaItem | null>(null);

  if (!items.length) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No watch history</h2>
          <p className="mt-2 text-muted-foreground">
            Start watching to build your history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 md:px-8">
      <h1 className="mb-6 text-2xl font-bold">Watch History</h1>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
        {items.map((item) => (
          <MediaCard
            key={item.id}
            item={{
              id: item.media_id,
              overview: "",
              poster_path: item.poster_path,
              backdrop_path: null,
              vote_average: 0,
              vote_count: 0,
              popularity: 0,
              ...(item.media_type === "movie"
                ? { title: item.title }
                : { name: item.title }),
              media_type: item.media_type as "movie" | "tv",
            }}
            onClick={setSelectedItem}
            mediaType={item.media_type as "movie" | "tv"}
          />
        ))}
      </div>

      {selectedItem && (
        <DetailModal
          mediaId={selectedItem.id}
          mediaType={(selectedItem.media_type || "movie") as "movie" | "tv"}
          onClose={() => setSelectedItem(null)}
          onPlay={(playItem) => {
            setSelectedItem(null);
            setPlayingItem(playItem);
          }}
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
    </div>
  );
}
