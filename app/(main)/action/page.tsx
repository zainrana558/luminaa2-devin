import { cookies } from "next/headers";
import { getByGenre } from "@/lib/tmdb/client";
import GenrePageClient from "@/components/genre/GenrePageClient";
import type { ContentRow } from "@/types";

export default async function ActionPage() {
  const cookieStore = await cookies();
  const profileId = cookieStore.get("profile_id")?.value || null;

  const [movies, tv] = await Promise.all([
    getByGenre("movie", 28),
    getByGenre("tv", 28),
  ]);

  const heroItem = movies.results[0] ?? null;

  const rows: ContentRow[] = [
    { title: "Action Movies", items: movies.results, mediaType: "movie" },
    { title: "Action TV Shows", items: tv.results, mediaType: "tv" },
  ];

  return (
    <GenrePageClient
      title="Action"
      accentColor="#f97316"
      rows={rows}
      heroItem={heroItem}
      profileId={profileId}
      pills={["All", "Thriller", "Spy", "Martial Arts", "Heist"]}
    />
  );
}
