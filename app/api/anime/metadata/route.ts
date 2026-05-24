import { NextResponse, type NextRequest } from "next/server";
import { getAnimeMetadata } from "@/lib/animeMetadata";

export const maxDuration = 9;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get("tmdbId");
  const title = searchParams.get("title");

  if (!tmdbId || !title) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const data = await getAnimeMetadata(tmdbId, title);
  return NextResponse.json(data);
}
