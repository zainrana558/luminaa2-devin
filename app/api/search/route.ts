import { NextResponse, type NextRequest } from "next/server";
import { searchMedia } from "@/lib/tmdb/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const page = searchParams.get("page") || "1";

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const data = await searchMedia(query, page);
  const filtered = {
    ...data,
    results: data.results.filter(
      (item) => item.media_type === "movie" || item.media_type === "tv"
    ),
  };

  return NextResponse.json(filtered);
}
