export interface StreamProvider {
  name: string;
  getMovieUrl: (tmdbId: number) => string;
  getTvUrl: (tmdbId: number, season: number, episode: number) => string;
}

const providers: StreamProvider[] = [
  {
    name: "2Embed",
    getMovieUrl: (id) => `https://www.2embed.online/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://www.2embed.online/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: "AutoEmbed",
    getMovieUrl: (id) => `https://autoembed.co/movie/tmdb/${id}`,
    getTvUrl: (id, s, e) => `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`,
  },
  {
    name: "VidPhantom",
    getMovieUrl: (id) => `https://vidphantom.com/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidphantom.com/tv/${id}/${s}/${e}`,
  },
  {
    name: "VidSrc",
    getMovieUrl: (id) => `https://vidsrc.fyi/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.fyi/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: "NexStream",
    getMovieUrl: (id) => {
      const key = process.env.NEXSTREAM_API_KEY || "";
      return `https://api.codespecters.com/embed/movie/${id}?apikey=${key}`;
    },
    getTvUrl: (id, s, e) => {
      const key = process.env.NEXSTREAM_API_KEY || "";
      return `https://api.codespecters.com/embed/tv/${id}/${s}/${e}?apikey=${key}`;
    },
  },
];

export function getAllEmbedUrls(
  mediaType: "movie" | "tv",
  tmdbId: number,
  season?: number,
  episode?: number
): { name: string; url: string }[] {
  return providers.map((p) => ({
    name: p.name,
    url:
      mediaType === "tv" && season !== undefined && episode !== undefined
        ? p.getTvUrl(tmdbId, season, episode)
        : p.getMovieUrl(tmdbId),
  }));
}
