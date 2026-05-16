export function getEmbedUrl(
  mediaType: "movie" | "tv",
  tmdbId: number,
  season?: number,
  episode?: number
): string {
  const apiKey = process.env.NEXSTREAM_API_KEY;
  if (!apiKey) throw new Error("NEXSTREAM_API_KEY is not set");

  const base = `https://api.codespecters.com/v1/embed`;

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `${base}?tmdb=${tmdbId}&season=${season}&episode=${episode}&api_key=${apiKey}`;
  }

  return `${base}?tmdb=${tmdbId}&api_key=${apiKey}`;
}
