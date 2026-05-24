"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Plus, Check, Star, Clock, Calendar, Film, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getImageUrl, getTitle, getYear, formatRuntime, formatRating } from "@/lib/utils";
import type { MediaDetails, MediaItem, CastMember } from "@/types";
import MediaCard from "@/components/browse/MediaCard";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface DetailModalProps {
  mediaId: number;
  mediaType: "movie" | "tv";
  onClose: () => void;
  onPlay: (item: MediaItem, season?: number, episode?: number) => void;
  profileId: string | null;
}

// Reusable accent heading — matches ContentRow pattern from Prompt 3
function AccentHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", paddingLeft: "12px" }}>
      <span aria-hidden style={{
        position: "absolute", left: 0, top: "3px", bottom: "3px",
        width: "4px", borderRadius: "2px",
        background: "var(--color-primary, #7c3aed)",
      }} />
      <h3 className="text-base font-semibold md:text-lg">{children}</h3>
    </div>
  );
}

export default function DetailModal({
  mediaId, mediaType, onClose, onPlay, profileId,
}: DetailModalProps) {
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [inList, setInList] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);

  // Cast scroll refs
  const castScrollRef = useRef<HTMLDivElement>(null);
  const [castAtStart, setCastAtStart] = useState(true);
  const [castAtEnd, setCastAtEnd] = useState(false);

  // More Like This entrance — reuse hook from Prompt 3
  const [similarRef, similarVisible] = useIntersectionObserver<HTMLDivElement>();

  // All data fetching unchanged
  const fetchDetails = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/tmdb?endpoint=/${mediaType}/${mediaId}&append_to_response=credits,similar,videos`);
    if (res.ok) setDetails(await res.json());
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

  // Cast scroll boundary tracking — reuses ContentRow pattern
  function updateCastBounds() {
    const el = castScrollRef.current;
    if (!el) return;
    setCastAtStart(el.scrollLeft <= 8);
    setCastAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }
  useEffect(() => {
    const el = castScrollRef.current;
    if (!el) return;
    updateCastBounds();
    el.addEventListener("scroll", updateCastBounds, { passive: true });
    return () => el.removeEventListener("scroll", updateCastBounds);
  }, [details]);

  function scrollCast(dir: "left" | "right") {
    const el = castScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  }

  async function toggleWatchlist() {
    if (!profileId || !details) return;
    const body = { profile_id: profileId, media_id: mediaId, media_type: mediaType, title: getTitle(details), poster_path: details.poster_path };
    try {
      if (!inList) { const { addToWatchlist } = await import("@/actions/watchlist"); await addToWatchlist(body); }
      else { const { removeFromWatchlist } = await import("@/actions/watchlist"); await removeFromWatchlist(profileId, mediaId, mediaType); }
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

  const trailer = details?.videos?.results.find((v) => v.site === "YouTube" && v.type === "Trailer");

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 pt-16 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 32, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-3xl rounded-2xl bg-card shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-black/60 p-2 text-white hover:bg-black/90 transition-all duration-300 ease-in-out active:scale-95"
        >
          <X className="h-5 w-5" />
        </button>

        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : details ? (
          <>
            {/* Hero — Ken Burns + bottom gradient fade into card bg */}
            <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl">
              {trailer ? (
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1`}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <>
                  <Image
                    src={getImageUrl(details.backdrop_path, "original")}
                    alt={getTitle(details)}
                    fill
                    className="object-cover"
                    style={{ animation: "kenBurns 12s ease-in-out forwards" }}
                  />
                  <style>{`@keyframes kenBurns { from { transform: scale(1); } to { transform: scale(1.04); } }`}</style>
                </>
              )}
              {/* Bottom gradient bleeds into card bg — no hard edge */}
              <div className="absolute inset-x-0 bottom-0 z-10" style={{ height: "60%", background: "linear-gradient(to top, var(--color-card, #141428) 20%, transparent)" }} />
              {/* Staggered title entrance */}
              <div className="absolute inset-x-0 bottom-0 z-20 p-6">
                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
                  className="text-2xl font-bold md:text-3xl"
                >
                  {getTitle(details)}
                </motion.h2>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  onClick={() => onPlay(details)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-white/90 transition-colors duration-200"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Play
                </motion.button>
                {profileId && (
                  <Button
                    variant="outline"
                    onClick={toggleWatchlist}
                    className="gap-2 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
                  >
                    {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {inList ? "In My List" : "My List"}
                  </Button>
                )}
              </div>

              {/* Meta row — staggered entrance */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: 0.16 }}
                className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
              >
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {formatRating(details.vote_average)}
                </span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{getYear(details)}</span>
                {details.runtime && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatRuntime(details.runtime)}</span>}
                {details.number_of_seasons && (
                  <span className="flex items-center gap-1">
                    <Film className="h-4 w-4" />
                    {details.number_of_seasons} Season{details.number_of_seasons > 1 ? "s" : ""}
                  </span>
                )}
              </motion.div>

              {details.tagline && (
                <p className="text-sm italic text-muted-foreground">&ldquo;{details.tagline}&rdquo;</p>
              )}

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: 0.22 }}
                className="text-sm leading-relaxed text-foreground/80"
              >
                {details.overview}
              </motion.p>

              {/* Genre tags — clean muted labels, thin border, no color */}
              {details.genres && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut", delay: 0.28 }}
                  className="flex flex-wrap gap-2"
                >
                  {details.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                    >
                      {genre.name}
                    </span>
                  ))}
                </motion.div>
              )}

              {/* Rating */}
              {profileId && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Your Rating</p>
                  <div className="flex gap-1">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <motion.button
                        key={n}
                        onClick={() => handleRate(n)}
                        whileTap={{ scale: 0.85 }}
                        animate={{ backgroundColor: userRating !== null && n <= userRating ? "rgb(124 58 237)" : "rgb(30 30 63)" }}
                        transition={{ duration: 0.2 }}
                        className="rounded-full px-2 py-1 text-xs text-white"
                      >
                        {n}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cast — scroll arrows reuse ContentRow pattern; hover scale 1.05; stagger entrance */}
              {details.credits?.cast && details.credits.cast.length > 0 && (
                <div className="space-y-3">
                  <AccentHeading>Cast</AccentHeading>
                  <div className="relative group">
                    <button
                      onClick={() => scrollCast("left")}
                      className="absolute -left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-1.5 shadow-lg backdrop-blur transition-all duration-200 ease-out active:scale-95"
                      style={{ opacity: castAtStart ? 0 : 1, pointerEvents: castAtStart ? "none" : "auto" }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div ref={castScrollRef} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                      {details.credits.cast.slice(0, 12).map((member: CastMember, i: number) => (
                        <div
                          key={member.id}
                          className="flex-shrink-0 text-center cursor-default"
                          style={{
                            opacity: 1,
                            animation: `castFade 250ms ease-out ${i * 40}ms both`,
                          }}
                        >
                          <style>{`@keyframes castFade { from { opacity:0; transform:translateY(12px);} to { opacity:1; transform:translateY(0);} }`}</style>
                          {/* Avatar: scale 1.05 on hover, clean shadow */}
                          <div
                            className="relative h-16 w-16 overflow-hidden rounded-full bg-muted transition-all duration-200 ease-out hover:scale-[1.05]"
                            style={{ transitionProperty: "transform, box-shadow" }}
                            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.5)")}
                            onMouseLeave={e => (e.currentTarget.style.boxShadow = "")}
                          >
                            {member.profile_path ? (
                              <Image src={getImageUrl(member.profile_path, "w185")} alt={member.name} fill className="object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-lg text-muted-foreground bg-secondary">
                                {member.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <p className="mt-1 w-16 truncate text-xs font-medium">{member.name}</p>
                          <p className="w-16 truncate text-[10px] text-muted-foreground">{member.character}</p>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => scrollCast("right")}
                      className="absolute -right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-1.5 shadow-lg backdrop-blur transition-all duration-200 ease-out active:scale-95"
                      style={{ opacity: castAtEnd ? 0 : 1, pointerEvents: castAtEnd ? "none" : "auto" }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* More Like This — IntersectionObserver entrance + accent heading */}
              {details.similar?.results && details.similar.results.length > 0 && (
                <div className="space-y-3" ref={similarRef}>
                  <AccentHeading>More Like This</AccentHeading>
                  <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                    {details.similar.results.slice(0, 10).map((item: MediaItem, i: number) => (
                      <div
                        key={item.id}
                        style={{
                          opacity: similarVisible ? 1 : 0,
                          transform: similarVisible ? "translateY(0)" : "translateY(24px)",
                          transition: `opacity 250ms ease-out ${i * 40}ms, transform 250ms ease-out ${i * 40}ms`,
                        }}
                      >
                        <MediaCard
                          item={item}
                          onClick={() => {
                            onClose();
                            setTimeout(() => {
                              window.dispatchEvent(new CustomEvent("open-detail", { detail: { ...item, media_type: mediaType } }));
                            }, 100);
                          }}
                          mediaType={mediaType}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex h-96 items-center justify-center text-muted-foreground">Failed to load details</div>
        )}
      </motion.div>
    </div>
  );
}
