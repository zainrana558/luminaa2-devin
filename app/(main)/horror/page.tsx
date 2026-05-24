import HorrorPageClient from "@/components/browse/HorrorPageClient";
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

// Genre 27 = Horror
async function getHorror() {
  const [movies, tv] = await Promise.all([
    tmdbFetch<TMDBListResponse<MediaItem>>("/discover/movie", {
      with_genres: "27",
      sort_by: "popularity.desc",
    }),
    tmdbFetch<TMDBListResponse<MediaItem>>("/discover/tv", {
      with_genres: "27",
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
      style={{ background: "linear-gradient(160deg,#050a05 0%,#0a1a0a 40%,#050a05 100%)" }}
    >
      <p className="text-green-400/70 text-lg">Something went wrong loading Horror.</p>
      <Link
        href="/browse"
        className="flex items-center gap-2 rounded-full bg-green-900/30 px-5 py-3 text-sm font-medium text-green-300/70 hover:bg-green-900/50 transition-all duration-300 border border-green-800/40 min-h-[44px]"
        style={{ touchAction: "manipulation" }}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Browse
      </Link>
    </div>
  );
}

// ── Data wrapper ──────────────────────────────────────────────────────────────
async function HorrorData() {
  try {
    const { movies, tv } = await getHorror();
    return <HorrorPageClient movies={movies} tv={tv} />;
  } catch {
    return <ErrorFallback />;
  }
}

export default function HorrorPage() {
  return <HorrorData />;
}
