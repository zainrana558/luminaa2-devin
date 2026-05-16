"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MediaItem, Season, Episode } from "@/types";
import { getTitle } from "@/lib/utils";

interface VideoPlayerProps {
  item: MediaItem;
  onClose: () => void;
  profileId: string | null;
  initialSeason?: number;
  initialEpisode?: number;
}

export default function VideoPlayer({
  item,
  onClose,
  profileId,
  initialSeason = 1,
  initialEpisode = 1,
}: VideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState(initialSeason);
  const [episode, setEpisode] = useState(initialEpisode);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const mediaType = item.media_type || (item.title ? "movie" : "tv");

  const fetchEmbed = useCallback(async () => {
    setLoading(true);
    let url = `/api/embed?tmdb=${item.id}&type=${mediaType}`;
    if (mediaType === "tv") {
      url += `&season=${season}&episode=${episode}`;
    }

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setEmbedUrl(data.url);
    }
    setLoading(false);
  }, [item.id, mediaType, season, episode]);

  useEffect(() => {
    fetchEmbed();
  }, [fetchEmbed]);

  useEffect(() => {
    if (mediaType !== "tv") return;
    fetch(`/api/tmdb?endpoint=/tv/${item.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.seasons) {
          setSeasons(data.seasons.filter((s: Season) => s.season_number > 0));
        }
      })
      .catch(() => {});
  }, [item.id, mediaType]);

  useEffect(() => {
    if (mediaType !== "tv") return;
    fetch(`/api/tmdb?endpoint=/tv/${item.id}/season/${season}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.episodes) setEpisodes(data.episodes);
      })
      .catch(() => {});
  }, [item.id, mediaType, season]);

  useEffect(() => {
    if (!profileId || !embedUrl) return;
    const interval = setInterval(async () => {
      try {
        const { saveProgress } = await import("@/actions/progress");
        await saveProgress({
          profile_id: profileId,
          media_id: item.id,
          media_type: mediaType as "movie" | "tv",
          title: getTitle(item),
          poster_path: item.poster_path,
          progress: 0,
          duration: 0,
          ...(mediaType === "tv" ? { season_number: season, episode_number: episode } : {}),
        });
      } catch {
        // ignore
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [profileId, item, mediaType, season, episode, embedUrl]);

  useEffect(() => {
    if (!profileId) return;
    import("@/actions/progress").then(({ addToHistory }) => {
      addToHistory(profileId, item.id, mediaType, getTitle(item), item.poster_path);
    }).catch(() => {});
  }, [profileId, item, mediaType]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-black">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="flex h-full flex-col">
        <div className="relative flex-1">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : embedUrl ? (
            <iframe
              src={embedUrl}
              className="h-full w-full"
              allow="autoplay; fullscreen; encrypted-media"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Unable to load player
            </div>
          )}
        </div>

        {mediaType === "tv" && (
          <div className="bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{getTitle(item)}</h3>
                <p className="text-sm text-muted-foreground">
                  S{season} E{episode}
                  {episodes[episode - 1] && ` — ${episodes[episode - 1].name}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEpisodes(!showEpisodes)}
                className="gap-1"
              >
                Episodes
                <ChevronDown className={`h-4 w-4 transition-transform ${showEpisodes ? "rotate-180" : ""}`} />
              </Button>
            </div>

            {showEpisodes && (
              <div className="mt-4 space-y-3">
                <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                  {seasons.map((s) => (
                    <button
                      key={s.season_number}
                      onClick={() => { setSeason(s.season_number); setEpisode(1); }}
                      className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
                        season === s.season_number
                          ? "bg-primary text-white"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      Season {s.season_number}
                    </button>
                  ))}
                </div>
                <div className="max-h-48 space-y-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                  {episodes.map((ep) => (
                    <button
                      key={ep.episode_number}
                      onClick={() => setEpisode(ep.episode_number)}
                      className={`w-full rounded-lg p-3 text-left transition-colors ${
                        episode === ep.episode_number
                          ? "bg-primary/20 border border-primary/30"
                          : "hover:bg-secondary"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {ep.episode_number}. {ep.name}
                        </span>
                        {ep.runtime && (
                          <span className="text-xs text-muted-foreground">{ep.runtime}m</span>
                        )}
                      </div>
                      {ep.overview && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{ep.overview}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
