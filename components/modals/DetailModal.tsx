"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  X, Play, Plus, Check, Star, Clock, Calendar, Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getImageUrl, getTitle, getYear, formatRuntime, formatRating } from "@/lib/utils";
import type { MediaDetails, MediaItem, CastMember } from "@/types";
import MediaCard from "@/components/browse/MediaCard";

interface DetailModalProps {
  mediaId: number;
  mediaType: "movie" | "tv";
  onClose: () => void;
  onPlay: (item: MediaItem, season?: number, episode?: number) => void;
  profileId: string | null;
}

export default function DetailModal({
  mediaId,
  mediaType,
  onClose,
  onPlay,
  profileId,
}: DetailModalProps) {
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [inList, setInList] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/tmdb?endpoint=/${mediaType}/${mediaId}&append_to_response=credits,similar,videos`
    );
    if (res.ok) {
      const data = await res.json();
      setDetails(data);
    }
    setLoading(false);
  }, [mediaId, mediaType]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    if (!profileId) return;
    import("@/actions/watchlist").then(({ isInWatchlist }) => {
      isInWatchlist(profileId, mediaId, mediaType).then(setInList);
    }).catch(() => {});
  }, [profileId, mediaId, mediaType]);

  useEffect(() => {
    if (!profileId) return;
    import("@/actions/ratings").then(({ getRating }) => {
      getRating(profileId, mediaId, mediaType).then(setUserRating);
    }).catch(() => {});
  }, [profileId, mediaId, mediaType]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  async function toggleWatchlist() {
    if (!profileId || !details) return;
    const action = inList ? "remove" : "add";
    const body = {
      profile_id: profileId,
      media_id: mediaId,
      media_type: mediaType,
      title: getTitle(details),
      poster_path: details.poster_path,
    };

    try {
      if (action === "add") {
        const { addToWatchlist } = await import("@/actions/watchlist");
        await addToWatchlist(body);
      } else {
        const { removeFromWatchlist } = await import("@/actions/watchlist");
        await removeFromWatchlist(profileId, mediaId, mediaType);
      }
      setInList(!inList);
    } catch {
      // ignore
    }
  }

  async function handleRate(rating: number) {
    if (!profileId) return;
    try {
      const { setRating } = await import("@/actions/ratings");
      await setRating({ profile_id: profileId, media_id: mediaId, media_type: mediaType, rating });
      setUserRating(rating);
    } catch {
      // ignore
    }
  }

  const trailer = details?.videos?.results.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 pt-16 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-xl bg-card shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-background/80 p-2 hover:bg-background"
        >
          <X className="h-5 w-5" />
        </button>

        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : details ? (
          <>
            <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
              {trailer ? (
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1`}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <Image
                  src={getImageUrl(details.backdrop_path, "original")}
                  alt={getTitle(details)}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-card to-transparent p-6">
                <h2 className="text-2xl font-bold md:text-3xl">{getTitle(details)}</h2>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={() => onPlay(details)} className="gap-2">
                  <Play className="h-4 w-4 fill-current" />
                  Play
                </Button>
{profileId && (
                <Button variant="outline" onClick={toggleWatchlist} className="gap-2">
                  {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {inList ? "In My List" : "My List"}
                </Button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {formatRating(details.vote_average)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {getYear(details)}
                </span>
                {details.runtime && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatRuntime(details.runtime)}
                  </span>
                )}
                {details.number_of_seasons && (
                  <span className="flex items-center gap-1">
                    <Film className="h-4 w-4" />
                    {details.number_of_seasons} Season{details.number_of_seasons > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {details.tagline && (
                <p className="text-sm italic text-muted-foreground">&ldquo;{details.tagline}&rdquo;</p>
              )}

              <p className="text-sm leading-relaxed text-foreground/80">{details.overview}</p>

              {details.genres && (
                <div className="flex flex-wrap gap-2">
                  {details.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="rounded-full bg-secondary px-3 py-1 text-xs"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {profileId && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Your Rating</p>
                  <div className="flex gap-1">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        onClick={() => handleRate(n)}
                        className={`rounded px-2 py-1 text-xs transition-colors ${
                          userRating !== null && n <= userRating
                            ? "bg-primary text-white"
                            : "bg-secondary hover:bg-secondary/80"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {details.credits?.cast && details.credits.cast.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Cast</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                    {details.credits.cast.slice(0, 10).map((member: CastMember) => (
                      <div key={member.id} className="flex-shrink-0 text-center">
                        <div className="relative h-20 w-20 overflow-hidden rounded-full bg-muted">
                          {member.profile_path ? (
                            <Image
                              src={getImageUrl(member.profile_path, "w185")}
                              alt={member.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-2xl text-muted-foreground">
                              {member.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <p className="mt-1 w-20 truncate text-xs font-medium">{member.name}</p>
                        <p className="w-20 truncate text-xs text-muted-foreground">{member.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {details.similar?.results && details.similar.results.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">More Like This</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                    {details.similar.results.slice(0, 10).map((item: MediaItem) => (
                      <MediaCard
                        key={item.id}
                        item={item}
                        onClick={() => {
                          onClose();
                          setTimeout(() => {
                            window.dispatchEvent(
                              new CustomEvent("open-detail", {
                                detail: { ...item, media_type: mediaType },
                              })
                            );
                          }, 100);
                        }}
                        mediaType={mediaType}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex h-96 items-center justify-center text-muted-foreground">
            Failed to load details
          </div>
        )}
      </div>
    </div>
  );
}
