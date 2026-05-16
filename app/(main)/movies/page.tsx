import { cookies } from "next/headers";
import {
  getPopular,
  getTopRated,
  getNowPlaying,
  getUpcoming,
} from "@/lib/tmdb/client";
import BrowseClient from "@/components/browse/BrowseClient";
import type { ContentRow } from "@/types";

export default async function MoviesPage() {
  const cookieStore = await cookies();
  const profileId = cookieStore.get("profile_id")?.value || null;

  const [popular, topRated, nowPlaying, upcoming] = await Promise.all([
    getPopular("movie"),
    getTopRated("movie"),
    getNowPlaying(),
    getUpcoming(),
  ]);

  const heroItems = popular.results.slice(0, 5);

  const rows: ContentRow[] = [
    { title: "Popular Movies", items: popular.results.slice(5), mediaType: "movie" },
    { title: "Now Playing", items: nowPlaying.results, mediaType: "movie" },
    { title: "Upcoming", items: upcoming.results, mediaType: "movie" },
    { title: "Top Rated", items: topRated.results, mediaType: "movie" },
  ];

  return <BrowseClient heroItems={heroItems} rows={rows} profileId={profileId} />;
}
