import { cookies } from "next/headers";
import {
  getPopular,
  getTopRated,
  getAiringToday,
  getOnTheAir,
} from "@/lib/tmdb/client";
import BrowseClient from "@/components/browse/BrowseClient";
import type { ContentRow } from "@/types";

export default async function TvPage() {
  const cookieStore = await cookies();
  const profileId = cookieStore.get("profile_id")?.value || null;

  const [popular, topRated, airingToday, onTheAir] = await Promise.all([
    getPopular("tv"),
    getTopRated("tv"),
    getAiringToday(),
    getOnTheAir(),
  ]);

  const heroItems = popular.results.slice(0, 5);

  const rows: ContentRow[] = [
    { title: "Popular TV Shows", items: popular.results.slice(5), mediaType: "tv" },
    { title: "Airing Today", items: airingToday.results, mediaType: "tv" },
    { title: "On The Air", items: onTheAir.results, mediaType: "tv" },
    { title: "Top Rated", items: topRated.results, mediaType: "tv" },
  ];

  return <BrowseClient heroItems={heroItems} rows={rows} profileId={profileId} />;
}
