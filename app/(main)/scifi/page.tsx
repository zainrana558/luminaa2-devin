import { cookies } from "next/headers";
import { getByGenre } from "@/lib/tmdb/client";
import GenrePageClient from "@/components/genre/GenrePageClient";
import type { ContentRow } from "@/types";

export default async function SciFiPage() {
  const cookieStore = await cookies();
  const profileId = cookieStore.get("profile_id")?.value || null;

  const [movies, tv] = await Promise.all([
    getByGenre("movie", 878),
    getByGenre("tv", 878),
  ]);

  const heroItem = movies.results[0] ?? null;

  const rows: ContentRow[] = [
    { title: "Sci-Fi Movies", items: movies.results, mediaType: "movie" },
    { title: "Sci-Fi TV Shows", items: tv.results, mediaType: "tv" },
  ];

  return (
    <GenrePageClient
      title="Sci-Fi"
      accentColor="#818cf8"
      rows={rows}
      heroItem={heroItem}
      profileId={profileId}
      pills={["All", "Space", "Dystopian", "Cyberpunk", "Time Travel"]}
    />
  );
}
