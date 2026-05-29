import { NextResponse, type NextRequest } from "next/server";
import { getAllEmbedUrls } from "@/lib/streaming/providers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get("tmdb");
  const type = searchParams.get("type") as "movie" | "tv" | null;
  const season = searchParams.get("season");
  const episode = searchParams.get("episode");

  if (!tmdbId || !type) {
    return NextResponse.json({ error: "Missing tmdb or type" }, { status: 400 });
  }

  const providers = getAllEmbedUrls(
    type,
    parseInt(tmdbId),
    season ? parseInt(season) : undefined,
    episode ? parseInt(episode) : undefined
  );

  return NextResponse.json({ providers, url: providers[0]?.url ?? null });
}
