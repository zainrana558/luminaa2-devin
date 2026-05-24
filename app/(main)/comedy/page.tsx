import { getByGenre } from "@/lib/tmdb/client";
import ComedyPageClient from "@/components/browse/ComedyPageClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function ErrorFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6"
      style={{ background: "linear-gradient(160deg,#1a0f00 0%,#2d1a00 50%,#1a0f00 100%)" }}>
      <p className="text-yellow-300 text-lg">Something went wrong loading Comedy.</p>
      <Link href="/browse"
        className="flex items-center gap-2 rounded-full bg-yellow-900/40 px-5 py-3 text-sm font-medium text-yellow-200 hover:bg-yellow-900/60 transition-all duration-300 border border-yellow-500/20 min-h-[44px]"
        style={{ touchAction: "manipulation" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Browse
      </Link>
    </div>
  );
}

async function ComedyData() {
  try {
    const [movies, tv] = await Promise.all([
      getByGenre("movie", 35),
      getByGenre("tv", 35),
    ]);
    return <ComedyPageClient movies={movies.results} tv={tv.results} />;
  } catch {
    return <ErrorFallback />;
  }
}

export default function ComedyPage() {
  return <ComedyData />;
}
