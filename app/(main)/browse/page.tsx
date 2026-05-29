import { cookies } from "next/headers";
import { getTrending, getPopular, getTopRated, getNowPlaying } from "@/lib/tmdb/client";
import { getContinueWatching } from "@/actions/progress";
import BrowseClient from "@/components/browse/BrowseClient";
import type { ContentRow, MediaItem } from "@/types";

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

  const rows: ContentRow[] = [];

  if (profileId) {
    const continueWatching = await getContinueWatching(profileId);
    if (continueWatching.length > 0) {
      rows.push({
        title: "Continue Watching",
        items: continueWatching.map((item): MediaItem => ({
          id: item.media_id,
          overview: "",
          poster_path: item.poster_path,
          backdrop_path: null,
          vote_average: 0,
          vote_count: 0,
          popularity: 0,
          media_type: item.media_type as "movie" | "tv",
          ...(item.media_type === "movie" ? { title: item.title } : { name: item.title }),
        })),
      });
    }
  }

  rows.push(
    { title: "Trending Now", items: trending.results.slice(5, 25) },
    { title: "Popular Movies", items: popularMovies.results, mediaType: "movie" },
    { title: "Popular TV Shows", items: popularTv.results, mediaType: "tv" },
    { title: "Now Playing", items: nowPlaying.results, mediaType: "movie" },
    { title: "Top Rated Movies", items: topRatedMovies.results, mediaType: "movie" },
  );

  return <BrowseClient heroItems={heroItems} rows={rows} profileId={profileId} />;
}
