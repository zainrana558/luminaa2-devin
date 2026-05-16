export function getEmbedUrl(
  mediaType: "movie" | "tv",
  tmdbId: number,
  season?: number,
  episode?: number
): string {
  const apiKey = process.env.NEXSTREAM_API_KEY;
  if (!apiKey) throw new Error("NEXSTREAM_API_KEY is not set");

  const base = `https://api.codespecters.com/embed`;

  if (mediaType === "tv" && season !== undefined && episode !== undefined) {
    return `${base}/tv/${tmdbId}/${season}/${episode}?apikey=${apiKey}`;
  }

  return `${base}/movie/${tmdbId}?apikey=${apiKey}`;
}
