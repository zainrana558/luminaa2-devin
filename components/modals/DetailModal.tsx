"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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

const GENRE_COLORS = [
  "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "bg-teal-500/20 text-teal-300 border-teal-500/30",
  "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "bg-rose-500/20 text-rose-300 border-rose-500/30",
];

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

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

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
    return () => { document.body.style.overflow = ""; };
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
    } catch { /* ignore */ }
  }

  async function handleRate(rating: number) {
    if (!profileId) return;
    try {
      const { setRating } = await import("@/actions/ratings");
      await setRating({ profile_id: profileId, media_id: mediaId, media_type: mediaType, rating });
      setUserRating(rating);
    } catch { /* ignore */ }
  }

  const trailer = details?.videos?.results.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 pt-16 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 32, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-3xl rounded-2xl bg-card shadow-2xl overflow-hidden"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-black/60 p-2 text-white hover:bg-black/90 transition-all duration-300 ease-in-out active:scale-95 backdrop-blur-sm"
        >
          <X className="h-5 w-5" />
        </button>

        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : details ? (
          <>
            {/* Hero */}
            <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl">
              {/* Blurred backdrop */}
              {details.backdrop_path && !trailer && (
                <div className="absolute inset-0 scale-110 blur-sm">
                  <Image
                    src={getImageUrl(details.backdrop_path, "w780")}
                    alt=""
                    fill
                    className="object-cover opacity-40"
                  />
                </div>
              )}
              {trailer ? (
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1`}
                  className="relative z-10 h-full w-full rounded-2xl"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <Image
                  src={getImageUrl(details.backdrop_path, "original")}
                  alt={getTitle(details)}
                  fill
                  className="relative z-10 object-cover"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-card via-card/60 to-transparent p-6">
                <h2 className="text-2xl font-bold md:text-3xl drop-shadow-lg">{getTitle(details)}</h2>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Play button with pulse */}
                <motion.button
                  onClick={() => onPlay(details)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg overflow-hidden group"
                >
                  <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity" />
                  <Play className="h-4 w-4 fill-current relative z-10" />
                  <span className="relative z-10">Play</span>
                </motion.button>

                {profileId && (
                  <Button
                    variant="outline"
                    onClick={toggleWatchlist}
                    className="gap-2 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {inList ? "In My List" : "My List"}
                  </Button>
                )}
              </div>

              {/* Meta */}
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

              {/* Genre pills — colored */}
              {details.genres && (
                <div className="flex flex-wrap gap-2">
                  {details.genres.map((genre, i) => (
                    <span
                      key={genre.id}
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${GENRE_COLORS[i % GENRE_COLORS.length]}`}
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Animated rating */}
              {profileId && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Your Rating</p>
                  <div className="flex gap-1">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <motion.button
                        key={n}
                        onClick={() => handleRate(n)}
                        whileTap={{ scale: 0.85 }}
                        animate={{
                          backgroundColor: userRating !== null && n <= userRating
                            ? "rgb(124 58 237)"
                            : "rgb(30 30 63)",
                        }}
                        transition={{ duration: 0.2 }}
                        className="rounded-full px-2 py-1 text-xs text-white"
                      >
                        {n}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cast — circular with hover zoom */}
              {details.credits?.cast && details.credits.cast.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Cast</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                    {details.credits.cast.slice(0, 10).map((member: CastMember) => (
                      <motion.div
                        key={member.id}
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0 text-center cursor-default"
                      >
                        <div className="relative h-20 w-20 overflow-hidden rounded-full bg-muted ring-2 ring-white/10">
                          {member.profile_path ? (
                            <Image
                              src={getImageUrl(member.profile_path, "w185")}
                              alt={member.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-2xl text-muted-foreground bg-gradient-to-br from-purple-900 to-pink-900">
                              {member.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <p className="mt-1 w-20 truncate text-xs font-medium">{member.name}</p>
                        <p className="w-20 truncate text-xs text-muted-foreground">{member.character}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* More Like This */}
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
      </motion.div>
    </div>
  );
}
