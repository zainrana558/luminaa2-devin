const BASE_URL = "https://api.themoviedb.org/3";

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY is not set");

  const searchParams = new URLSearchParams({ api_key: apiKey, ...params });
  const res = await fetch(`${BASE_URL}${endpoint}?${searchParams}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
  return res.json();
}

interface TMDBListResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

import type { MediaItem, MediaDetails, Episode } from "@/types";

export async function getTrending(mediaType: "movie" | "tv" | "all" = "all", timeWindow: "day" | "week" = "week") {
  return tmdbFetch<TMDBListResponse<MediaItem>>(`/trending/${mediaType}/${timeWindow}`);
}

export async function getPopular(mediaType: "movie" | "tv") {
  return tmdbFetch<TMDBListResponse<MediaItem>>(`/${mediaType}/popular`);
}

export async function getTopRated(mediaType: "movie" | "tv") {
  return tmdbFetch<TMDBListResponse<MediaItem>>(`/${mediaType}/top_rated`);
}

export async function getNowPlaying() {
  return tmdbFetch<TMDBListResponse<MediaItem>>("/movie/now_playing");
}

export async function getUpcoming() {
  return tmdbFetch<TMDBListResponse<MediaItem>>("/movie/upcoming");
}

export async function getAiringToday() {
  return tmdbFetch<TMDBListResponse<MediaItem>>("/tv/airing_today");
}

export async function getOnTheAir() {
  return tmdbFetch<TMDBListResponse<MediaItem>>("/tv/on_the_air");
}

export async function getDetails(mediaType: "movie" | "tv", id: number) {
  return tmdbFetch<MediaDetails>(`/${mediaType}/${id}`, {
    append_to_response: "credits,similar,videos",
  });
}

export async function getSeasonEpisodes(tvId: number, seasonNumber: number) {
  const data = await tmdbFetch<{ episodes: Episode[] }>(`/tv/${tvId}/season/${seasonNumber}`);
  return data.episodes;
}

export async function searchMedia(query: string, page: string = "1") {
  return tmdbFetch<TMDBListResponse<MediaItem>>("/search/multi", { query, page });
}

export async function getGenres(mediaType: "movie" | "tv") {
  return tmdbFetch<{ genres: { id: number; name: string }[] }>(`/genre/${mediaType}/list`);
}

export async function getByGenre(mediaType: "movie" | "tv", genreId: number) {
  return tmdbFetch<TMDBListResponse<MediaItem>>(`/discover/${mediaType}`, {
    with_genres: genreId.toString(),
    sort_by: "popularity.desc",
  });
}

export async function getAnime() {
  const [movies, tv] = await Promise.all([
    tmdbFetch<TMDBListResponse<MediaItem>>("/discover/movie", {
      with_genres: "16",
      with_original_language: "ja",
      sort_by: "popularity.desc",
    }),
    tmdbFetch<TMDBListResponse<MediaItem>>("/discover/tv", {
      with_genres: "16",
      with_original_language: "ja",
      sort_by: "popularity.desc",
    }),
  ]);
  return { movies: movies.results, tv: tv.results };
}
