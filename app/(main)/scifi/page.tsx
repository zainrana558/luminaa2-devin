import SciFiPageClient from "@/components/browse/SciFiPageClient";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { MediaItem } from "@/types";

// ── Inline TMDB fetch (zero changes to lib/tmdb/client.ts) ───────────────────
const BASE_URL = "https://api.themoviedb.org/3";

async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY is not set");
  const searchParams = new URLSearchParams({ api_key: apiKey, ...params });
  const res = await fetch(`${BASE_URL}${endpoint}?${searchParams}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
  return res.json();
}

interface TMDBListResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// Genre 878 = Science Fiction
async function getSciFi() {
  const [movies, tv] = await Promise.all([
    tmdbFetch<TMDBListResponse<MediaItem>>("/discover/movie", {
      with_genres: "878",
      sort_by: "popularity.desc",
    }),
    tmdbFetch<TMDBListResponse<MediaItem>>("/discover/tv", {
      with_genres: "10765", // Sci-Fi & Fantasy for TV
      sort_by: "popularity.desc",
    }),
  ]);
  return { movies: movies.results, tv: tv.results };
}

// ── Error Fallback ────────────────────────────────────────────────────────────
function ErrorFallback() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6"
      style={{ background: "linear-gradient(160deg,#000814 0%,#001a2e 40%,#000814 100%)" }}
    >
      <p className="text-cyan-400/70 text-lg">Something went wrong loading Sci-Fi.</p>
      <Link
        href="/browse"
        className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-all duration-300 border min-h-[44px]"
        style={{
          background: "rgba(0,180,200,0.1)",
          color: "rgba(0,220,255,0.7)",
          borderColor: "rgba(0,180,200,0.3)",
          touchAction: "manipulation",
        }}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Browse
      </Link>
    </div>
  );
}

// ── Data wrapper ──────────────────────────────────────────────────────────────
async function SciFiData() {
  try {
    const { movies, tv } = await getSciFi();
    return <SciFiPageClient movies={movies} tv={tv} />;
  } catch {
    return <ErrorFallback />;
  }
}

export default function SciFiPage() {
  return <SciFiData />;
}
