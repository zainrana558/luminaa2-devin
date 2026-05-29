import { cookies } from "next/headers";
import { getByGenre } from "@/lib/tmdb/client";
import GenrePageClient from "@/components/genre/GenrePageClient";
import type { ContentRow } from "@/types";

export default async function RomancePage() {
  const cookieStore = await cookies();
  const profileId = cookieStore.get("profile_id")?.value || null;

  const [movies, tv] = await Promise.all([
    getByGenre("movie", 10749),
    getByGenre("tv", 10749),
  ]);

  const heroItem = movies.results[0] ?? null;

  const rows: ContentRow[] = [
    { title: "Romance Movies", items: movies.results, mediaType: "movie" },
    { title: "Romance TV Shows", items: tv.results, mediaType: "tv" },
  ];

  return (
    <GenrePageClient
      title="Romance"
      accentColor="#fb7185"
      rows={rows}
      heroItem={heroItem}
      profileId={profileId}
      pills={["All", "Classic", "Modern", "Drama", "Comedy"]}
    />
  );
}
