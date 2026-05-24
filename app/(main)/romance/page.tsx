import { getByGenre } from "@/lib/tmdb/client";
import RomancePageClient from "@/components/browse/RomancePageClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function ErrorFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6"
      style={{ background: "linear-gradient(160deg,#1a0010 0%,#2d0a1f 50%,#1a0010 100%)" }}>
      <p className="text-pink-300 text-lg">Something went wrong loading Romance.</p>
      <Link href="/browse"
        className="flex items-center gap-2 rounded-full bg-pink-900/40 px-5 py-3 text-sm font-medium text-pink-200 hover:bg-pink-900/60 transition-all duration-300 border border-pink-500/20 min-h-[44px]"
        style={{ touchAction: "manipulation" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Browse
      </Link>
    </div>
  );
}

async function RomanceData() {
  try {
    const [movies, tv] = await Promise.all([
      getByGenre("movie", 10749),
      getByGenre("tv", 10749),
    ]);
    return <RomancePageClient movies={movies.results} tv={tv.results} />;
  } catch {
    return <ErrorFallback />;
  }
}

export default function RomancePage() {
  return <RomanceData />;
}
