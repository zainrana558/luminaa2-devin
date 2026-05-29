export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  media_type?: "movie" | "tv";
  popularity: number;
}

export interface MediaDetails extends MediaItem {
  genres: Genre[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status: string;
  tagline?: string;
  credits?: { cast: CastMember[] };
  similar?: { results: MediaItem[] };
  videos?: { results: Video[] };
  seasons?: Season[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string | null;
  air_date: string | null;
}

export interface Episode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string | null;
  runtime: number | null;
}

export interface Profile {
  id: string;
  account_id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface WatchlistItem {
  id: string;
  profile_id: string;
  media_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  added_at: string;
}

export interface WatchProgress {
  id: string;
  profile_id: string;
  media_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  progress: number;
  duration: number;
  season_number?: number;
  episode_number?: number;
  updated_at: string;
}

export interface Rating {
  id: string;
  profile_id: string;
  media_id: number;
  media_type: "movie" | "tv";
  rating: number;
  created_at: string;
}

export interface ContentRow {
  title: string;
  items: MediaItem[];
  mediaType?: "movie" | "tv";
}
