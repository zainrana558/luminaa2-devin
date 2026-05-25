"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronDown, ChevronUp, Server, Maximize2, Minimize2,
  Volume2, VolumeX, Play, Pause, SkipForward, Settings,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MediaItem, Season, Episode } from "@/types";
import { getTitle } from "@/lib/utils";
import { usePlayerStore, type ServerName } from "@/lib/store/playerStore";

interface EmbedProvider { name: string; url: string; }

interface VideoPlayerProps {
  item:          MediaItem;
  onClose:       () => void;
  profileId:     string | null;
  initialSeason?:  number;
  initialEpisode?: number;
}

const SERVERS: ServerName[] = ["Alpha", "Beta", "Gamma"];

export default function VideoPlayer({
  item, onClose, profileId,
  initialSeason  = 1,
  initialEpisode = 1,
}: VideoPlayerProps) {
  const [embedUrl,      setEmbedUrl]      = useState<string | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [season,        setSeason]        = useState(initialSeason);
  const [episode,       setEpisode]       = useState(initialEpisode);
  const [seasons,       setSeasons]       = useState<Season[]>([]);
  const [episodes,      setEpisodes]      = useState<Episode[]>([]);
  const [showEpisodes,  setShowEpisodes]  = useState(false);
  const [providers,     setProviders]     = useState<EmbedProvider[]>([]);
  const [providerIndex, setProviderIndex] = useState(0);
  const [controlsHidden, setControlsHidden] = useState(false);
  const [fullscreen,    setFullscreen]    = useState(false);
  const [muted,         setMuted]         = useState(false);

  const { activeServer, setServer, isTheaterMode, toggleTheaterMode } = usePlayerStore();
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const mediaType = item.media_type || (item.title ? "movie" : "tv");

  // ── Fetch embed URL ─────────────────────────────────────────────────────────
  const fetchEmbed = useCallback(async () => {
    setLoading(true);
    let url = `/api/embed?tmdb=${item.id}&type=${mediaType}&server=${activeServer.toLowerCase()}`;
    if (mediaType === "tv") url += `&season=${season}&episode=${episode}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const list: EmbedProvider[] = data.providers ?? [];
      setProviders(list);
      setProviderIndex(0);
      setEmbedUrl(list[0]?.url ?? data.url ?? null);
    }
    setLoading(false);
  }, [item.id, mediaType, activeServer, season, episode]);

  useEffect(() => { fetchEmbed(); }, [fetchEmbed]);

  // ── TV seasons / episodes ───────────────────────────────────────────────────
  useEffect(() => {
    if (mediaType !== "tv") return;
    fetch(`/api/tmdb?endpoint=/tv/${item.id}`)
      .then((r) => r.json())
      .then((d) => d.seasons && setSeasons(d.seasons.filter((s: Season) => s.season_number > 0)))
      .catch(() => {});
  }, [item.id, mediaType]);

  useEffect(() => {
    if (mediaType !== "tv") return;
    fetch(`/api/tmdb?endpoint=/tv/${item.id}/season/${season}`)
      .then((r) => r.json())
      .then((d) => d.episodes && setEpisodes(d.episodes))
      .catch(() => {});
  }, [item.id, mediaType, season]);

  // ── Progress tracking ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!profileId || !embedUrl) return;
    const id = setInterval(async () => {
      try {
        const { saveProgress } = await import("@/actions/progress");
        await saveProgress({
          profile_id: profileId, media_id: item.id,
          media_type: mediaType as "movie" | "tv",
          title: getTitle(item), poster_path: item.poster_path,
          progress: 0, duration: 0,
          ...(mediaType === "tv" ? { season_number: season, episode_number: episode } : {}),
        });
      } catch {}
    }, 15000);
    return () => clearInterval(id);
  }, [profileId, item, mediaType, season, episode, embedUrl]);

  useEffect(() => {
    if (!profileId) return;
    import("@/actions/progress").then(({ addToHistory }) => {
      addToHistory(profileId, item.id, mediaType, getTitle(item), item.poster_path);
    }).catch(() => {});
  }, [profileId, item, mediaType]);

  // ── Body overflow lock ──────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // ── Auto-hide controls ──────────────────────────────────────────────────────
  function resetHideTimer() {
    setControlsHidden(false);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsHidden(true), 3500);
  }

  useEffect(() => {
    resetHideTimer();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, []);

  function handleProviderSwitch(i: number) {
    setProviderIndex(i);
    setEmbedUrl(providers[i].url);
  }

  function handleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }

  const currentEp = episodes[episode - 1];

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: "#000" }}
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
    >
      {/* ── Ambient glow backdrop (dynamic) ───────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="ambient-glow"
          style={{ left: "20%", top: "20%", width: "60%", height: "60%" }}
        />
      </div>

      {/* ── Top bar (auto-hide) ────────────────────────────────────────────── */}
      <AnimatePresence>
        {!controlsHidden && (
          <motion.div
            key="top-bar"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 py-3"
            style={{
              background: "linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)",
            }}
          >
            {/* Left: title + episode info */}
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-white drop-shadow">
                {getTitle(item)}
              </h3>
              {mediaType === "tv" && (
                <p className="text-xs text-white/60">
                  S{season} E{episode}{currentEp && ` — ${currentEp.name}`}
                </p>
              )}
            </div>

            {/* Right: server selector + fullscreen + close */}
            <div className="flex items-center gap-2">
              {/* Server tabs */}
              <div
                className="flex items-center gap-1 rounded-full p-1"
                style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {SERVERS.map((srv) => (
                  <button
                    key={srv}
                    onClick={() => setServer(srv)}
                    className="rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 active:scale-90"
                    style={{
                      background:
                        activeServer === srv
                          ? "rgba(var(--theme-accent-rgb, 201,168,76), 0.8)"
                          : "transparent",
                      color: activeServer === srv ? "#000" : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {srv}
                  </button>
                ))}
              </div>

              {/* Theater mode */}
              <button
                onClick={toggleTheaterMode}
                className="rounded-full p-2 text-white/70 hover:text-white transition-all duration-200 active:scale-90"
                style={{ background: "rgba(0,0,0,0.4)" }}
                aria-label="Toggle theater mode"
              >
                <Layers className="h-4 w-4" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={handleFullscreen}
                className="rounded-full p-2 text-white/70 hover:text-white transition-all duration-200 active:scale-90"
                style={{ background: "rgba(0,0,0,0.4)" }}
                aria-label="Toggle fullscreen"
              >
                {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="rounded-full p-2 text-white/70 hover:text-white transition-all duration-200 active:scale-90"
                style={{ background: "rgba(0,0,0,0.4)" }}
                aria-label="Close player"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Iframe / loading ────────────────────────────────────────────────── */}
      <div
        className="relative flex-1"
        style={{
          transition: "all 0.3s ease",
          ...(isTheaterMode
            ? {}
            : { maxWidth: "1400px", margin: "0 auto", width: "100%" }),
        }}
      >
        {loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <div
              className="h-12 w-12 animate-spin rounded-full border-[3px] border-t-transparent"
              style={{ borderColor: `rgba(var(--theme-accent-rgb), 0.2)`, borderTopColor: "var(--color-primary)" }}
            />
            <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
              Loading server {activeServer}...
            </p>
          </div>
        ) : embedUrl ? (
          <iframe
            src={embedUrl}
            className="h-full w-full"
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
            title={`${getTitle(item)} — Watch`}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
              Unable to load player. Try a different server.
            </p>
            <div className="flex gap-2">
              {SERVERS.map((srv) => (
                <button
                  key={srv}
                  onClick={() => setServer(srv)}
                  className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95"
                  style={{
                    background: activeServer === srv ? "var(--color-primary)" : "var(--color-secondary)",
                    color: activeServer === srv ? "var(--color-primary-foreground)" : "var(--color-foreground)",
                  }}
                >
                  {srv}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── TV Episode panel ────────────────────────────────────────────────── */}
      {mediaType === "tv" && (
        <div
          className="relative z-10 border-t"
          style={{
            background: "rgba(var(--color-card, 20,18,16), 0.97)",
            backdropFilter: "blur(20px)",
            borderColor: "rgba(var(--theme-accent-rgb), 0.12)",
          }}
        >
          {/* Episode panel header */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
                {getTitle(item)}
              </h3>
              <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                Season {season}, Episode {episode}
                {currentEp && ` — ${currentEp.name}`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEpisodes(!showEpisodes)}
              className="gap-1 text-xs"
              style={{ color: "var(--color-primary)" }}
            >
              Episodes
              {showEpisodes
                ? <ChevronDown className="h-3.5 w-3.5" />
                : <ChevronUp className="h-3.5 w-3.5" />
              }
            </Button>
          </div>

          <AnimatePresence>
            {showEpisodes && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: "hidden" }}
              >
                <div className="space-y-3 px-4 pb-4">
                  {/* Season selector */}
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {seasons.map((s) => (
                      <button
                        key={s.season_number}
                        onClick={() => { setSeason(s.season_number); setEpisode(1); }}
                        className="flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95"
                        style={{
                          background:
                            season === s.season_number
                              ? "var(--color-primary)"
                              : "var(--color-secondary)",
                          color:
                            season === s.season_number
                              ? "var(--color-primary-foreground)"
                              : "var(--color-foreground)",
                        }}
                      >
                        S{s.season_number}
                      </button>
                    ))}
                  </div>

                  {/* Episode list */}
                  <div
                    className="max-h-44 space-y-1 overflow-y-auto no-scrollbar"
                    style={{ scrollbarWidth: "thin" }}
                  >
                    {episodes.map((ep) => (
                      <button
                        key={ep.episode_number}
                        onClick={() => setEpisode(ep.episode_number)}
                        className="w-full rounded-xl p-2.5 text-left transition-all duration-200 active:scale-[0.98]"
                        style={{
                          background:
                            episode === ep.episode_number
                              ? `rgba(var(--theme-accent-rgb), 0.15)`
                              : "transparent",
                          border: `1px solid ${episode === ep.episode_number ? "rgba(var(--theme-accent-rgb), 0.3)" : "transparent"}`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-sm font-medium"
                            style={{
                              color:
                                episode === ep.episode_number
                                  ? "var(--color-primary)"
                                  : "var(--color-foreground)",
                            }}
                          >
                            {ep.episode_number}. {ep.name}
                          </span>
                          {ep.runtime && (
                            <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                              {ep.runtime}m
                            </span>
                          )}
                        </div>
                        {ep.overview && (
                          <p
                            className="mt-0.5 line-clamp-1 text-xs"
                            style={{ color: "var(--color-muted-foreground)" }}
                          >
                            {ep.overview}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
