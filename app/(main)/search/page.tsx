"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import MediaCard from "@/components/browse/MediaCard";
import DetailModal from "@/components/modals/DetailModal";
import VideoPlayer from "@/components/modals/VideoPlayer";
import type { MediaItem } from "@/types";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [playingItem, setPlayingItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  function getCookieProfileId() {
    const match = document.cookie.match(/profile_id=([^;]+)/);
    return match ? match[1] : null;
  }

  return (
    <div className="px-4 pt-4 md:px-8">
      <div className="relative mx-auto max-w-xl">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search movies, TV shows..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 text-base"
          autoFocus
        />
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {results.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onClick={setSelectedItem}
              />
            ))}
          </div>
        ) : query.trim() ? (
          <p className="py-12 text-center text-muted-foreground">
            No results found for &ldquo;{query}&rdquo;
          </p>
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            Start typing to search for movies and TV shows
          </p>
        )}
      </div>

      {selectedItem && (
        <DetailModal
          mediaId={selectedItem.id}
          mediaType={(selectedItem.media_type || "movie") as "movie" | "tv"}
          onClose={() => setSelectedItem(null)}
          onPlay={(item) => {
            setSelectedItem(null);
            setPlayingItem(item);
          }}
          profileId={getCookieProfileId()}
        />
      )}

      {playingItem && (
        <VideoPlayer
          item={playingItem}
          onClose={() => setPlayingItem(null)}
          profileId={getCookieProfileId()}
        />
      )}
    </div>
  );
}
