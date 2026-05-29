import { cookies } from "next/headers";
import { getByGenreWithLanguage } from "@/lib/tmdb/client";
import GenrePageClient from "@/components/genre/GenrePageClient";
import type { ContentRow } from "@/types";

export default async function CartoonPage() {
  const cookieStore = await cookies();
  const profileId = cookieStore.get("profile_id")?.value || null;

  const [cartoonMovies, cartoonTv] = await Promise.all([
    getByGenreWithLanguage("movie", 16, "en"),
    getByGenreWithLanguage("tv", 16, "en"),
  ]);

  const heroItem = cartoonMovies.results[0] ?? cartoonTv.results[0] ?? null;

  const rows: ContentRow[] = [
    { title: "Popular Cartoons", items: cartoonTv.results, mediaType: "tv" },
    { title: "Animated Movies", items: cartoonMovies.results, mediaType: "movie" },
  ];

  return (
    <GenrePageClient
      title="Cartoons"
      accentColor="#4ade80"
      rows={rows}
      heroItem={heroItem}
      profileId={profileId}
      pills={["All", "Kids", "Family", "Adventure", "Comedy"]}
    />
  );
}
