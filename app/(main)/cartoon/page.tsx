import CartoonPageClient from "@/components/browse/CartoonPageClient";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { MediaItem } from "@/types";

// ── Inline TMDB fetch (cannot modify lib/tmdb/client.ts) ──────────────────────
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

// Genre 16 (Animation) + English language = cartoon/western animation
async function getCartoon() {
  const [movies, tv] = await Promise.all([
    tmdbFetch<TMDBListResponse<MediaItem>>("/discover/movie", {
      with_genres: "16",
      with_original_language: "en",
      sort_by: "popularity.desc",
    }),
    tmdbFetch<TMDBListResponse<MediaItem>>("/discover/tv", {
      with_genres: "16",
      with_original_language: "en",
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
      style={{
        background:
          "linear-gradient(160deg,#1a4a1a 0%,#2d6a2d 40%,#1a3a1a 100%)",
      }}
    >
      <p className="text-green-300 text-lg">
        Something went wrong loading Cartoon.
      </p>
      <Link
        href="/browse"
        className="flex items-center gap-2 rounded-full bg-green-900/40 px-5 py-3 text-sm font-medium text-green-200 hover:bg-green-900/60 transition-all duration-300 border border-green-500/20 min-h-[44px]"
        style={{ touchAction: "manipulation" }}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Browse
      </Link>
    </div>
  );
}

// ── Data wrapper ──────────────────────────────────────────────────────────────
async function CartoonData() {
  try {
    const { movies, tv } = await getCartoon();
    return <CartoonPageClient movies={movies} tv={tv} />;
  } catch {
    return <ErrorFallback />;
  }
}

export default function CartoonPage() {
  return <CartoonData />;
}
