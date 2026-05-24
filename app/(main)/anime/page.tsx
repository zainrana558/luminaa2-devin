import { getAnime } from "@/lib/tmdb/client";
import AnimePageClient from "@/components/browse/AnimePageClient";

export default async function AnimePage() {
  const { movies, tv } = await getAnime();
  return <AnimePageClient movies={movies} tv={tv} />;
}
