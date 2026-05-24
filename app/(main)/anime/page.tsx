import { getAnime } from "@/lib/tmdb/client";
import AnimePageClient from "@/components/browse/AnimePageClient";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

// Error boundary (server-side wrapper)
function ErrorFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6"
      style={{ background: "linear-gradient(160deg,#120008 0%,#1a0014 40%,#0d000a 100%)" }}>
      <p className="text-pink-300 text-lg">Something went wrong loading Anime.</p>
      <Link href="/browse"
        className="flex items-center gap-2 rounded-full bg-pink-900/40 px-5 py-3 text-sm font-medium text-pink-200 hover:bg-pink-900/60 transition-all duration-300 border border-pink-500/20 min-h-[44px]">
        <ArrowLeft className="h-4 w-4" /> Back to Browse
      </Link>
    </div>
  );
}

async function AnimeData() {
  try {
    const { movies, tv } = await getAnime();
    return <AnimePageClient movies={movies} tv={tv} />;
  } catch {
    return <ErrorFallback />;
  }
}

export default function AnimePage() {
  return <AnimeData />;
}
