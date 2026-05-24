import { getByGenre } from "@/lib/tmdb/client";
import ActionPageClient from "@/components/browse/ActionPageClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function ErrorFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6"
      style={{ background: "linear-gradient(160deg,#050200 0%,#1a0800 50%,#050200 100%)" }}>
      <p className="text-orange-300 text-lg">Something went wrong loading Action.</p>
      <Link href="/browse"
        className="flex items-center gap-2 rounded-full bg-orange-900/40 px-5 py-3 text-sm font-medium text-orange-200 hover:bg-orange-900/60 transition-all duration-300 border border-orange-500/20 min-h-[44px]"
        style={{ touchAction: "manipulation" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Browse
      </Link>
    </div>
  );
}

async function ActionData() {
  try {
    const [movies, tv] = await Promise.all([
      getByGenre("movie", 28),
      getByGenre("tv", 28),
    ]);
    return <ActionPageClient movies={movies.results} tv={tv.results} />;
  } catch {
    return <ErrorFallback />;
  }
}

export default function ActionPage() {
  return <ActionData />;
}
