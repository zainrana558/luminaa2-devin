import { cookies } from "next/headers";
import { getByGenreWithLanguage, getPopular } from "@/lib/tmdb/client";
import GenrePageClient from "@/components/genre/GenrePageClient";
import type { ContentRow } from "@/types";

export default async function AnimePage() {
  const cookieStore = await cookies();
  const profileId = cookieStore.get("profile_id")?.value || null;

  const [animeMovies, animeTv] = await Promise.all([
    getByGenreWithLanguage("movie", 16, "ja"),
    getByGenreWithLanguage("tv", 16, "ja"),
  ]);

  const heroItem = animeTv.results[0] ?? animeMovies.results[0] ?? null;

  const rows: ContentRow[] = [
    { title: "Popular Anime Series", items: animeTv.results, mediaType: "tv" },
    { title: "Anime Movies", items: animeMovies.results, mediaType: "movie" },
  ];

  return (
    <GenrePageClient
      title="Anime"
      accentColor="#f472b6"
      rows={rows}
      heroItem={heroItem}
      profileId={profileId}
      pills={["All", "Series", "Movies", "Action", "Romance", "Fantasy"]}
    />
  );
}
