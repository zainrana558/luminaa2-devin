import { cookies } from "next/headers";
import { getByGenre } from "@/lib/tmdb/client";
import GenrePageClient from "@/components/genre/GenrePageClient";
import type { ContentRow } from "@/types";

export default async function ComedyPage() {
  const cookieStore = await cookies();
  const profileId = cookieStore.get("profile_id")?.value || null;

  const [movies, tv] = await Promise.all([
    getByGenre("movie", 35),
    getByGenre("tv", 35),
  ]);

  const heroItem = movies.results[0] ?? null;

  const rows: ContentRow[] = [
    { title: "Comedy Movies", items: movies.results, mediaType: "movie" },
    { title: "Comedy TV Shows", items: tv.results, mediaType: "tv" },
  ];

  return (
    <GenrePageClient
      title="Comedy"
      accentColor="#facc15"
      rows={rows}
      heroItem={heroItem}
      profileId={profileId}
      pills={["All", "Stand-Up", "Sitcom", "Rom-Com", "Dark Comedy"]}
    />
  );
}
