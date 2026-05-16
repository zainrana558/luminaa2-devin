import { cookies } from "next/headers";
import { getTrending, getPopular, getTopRated, getNowPlaying } from "@/lib/tmdb/client";
import BrowseClient from "@/components/browse/BrowseClient";
import type { ContentRow } from "@/types";

export default async function BrowsePage() {
  const cookieStore = await cookies();
  const profileId = cookieStore.get("profile_id")?.value || null;

  const [trending, popularMovies, popularTv, topRatedMovies, nowPlaying] = await Promise.all([
    getTrending("all", "week"),
    getPopular("movie"),
    getPopular("tv"),
    getTopRated("movie"),
    getNowPlaying(),
  ]);

  const heroItems = trending.results.slice(0, 5);

  const rows: ContentRow[] = [
    { title: "Trending Now", items: trending.results.slice(5, 25) },
    { title: "Popular Movies", items: popularMovies.results, mediaType: "movie" },
    { title: "Popular TV Shows", items: popularTv.results, mediaType: "tv" },
    { title: "Now Playing", items: nowPlaying.results, mediaType: "movie" },
    { title: "Top Rated Movies", items: topRatedMovies.results, mediaType: "movie" },
  ];

  return <BrowseClient heroItems={heroItems} rows={rows} profileId={profileId} />;
}
