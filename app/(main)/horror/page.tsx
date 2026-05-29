import { cookies } from "next/headers";
import { getByGenre, getTopRated } from "@/lib/tmdb/client";
import GenrePageClient from "@/components/genre/GenrePageClient";
import type { ContentRow } from "@/types";

export default async function HorrorPage() {
  const cookieStore = await cookies();
  const profileId = cookieStore.get("profile_id")?.value || null;

  const [popular, topRated] = await Promise.all([
    getByGenre("movie", 27),
    getTopRated("movie"),
  ]);

  const topRatedHorror = topRated.results.filter((m) => m.genre_ids?.includes(27));
  const heroItem = popular.results[0] ?? null;

  const rows: ContentRow[] = [
    { title: "Popular Horror", items: popular.results, mediaType: "movie" },
    { title: "Top Rated Horror", items: topRatedHorror, mediaType: "movie" },
  ];

  return (
    <GenrePageClient
      title="Horror"
      accentColor="#ef4444"
      rows={rows}
      heroItem={heroItem}
      profileId={profileId}
      pills={["All", "Supernatural", "Slasher", "Psychological", "Thriller"]}
    />
  );
}
