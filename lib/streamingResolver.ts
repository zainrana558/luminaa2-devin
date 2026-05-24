import { fetchConsumet } from "./consumet";

export async function resolveAnimeStream(
  title: string,
  episode: number = 1,
  existingEmbeds: string[] = []
) {
  // 1. Try Consumet / Gogoanime
  const search = await fetchConsumet(
    `/anime/gogoanime/${encodeURIComponent(title)}`
  );
  if (search?.results?.[0]?.id) {
    const streams = await fetchConsumet(
      `/anime/gogoanime/watch/${search.results[0].id}-episode-${episode}`
    );
    if (streams?.sources?.[0]?.url) {
      return {
        source: "consumet",
        url: streams.sources[0].url as string,
        quality: (streams.sources[0].quality as string) ?? "default",
      };
    }
  }

  // 2. Try Aniwatch
  const aniwatch = await fetch(
    `https://api.aniwatch.to/anime/episode-srcs?id=${encodeURIComponent(title)}-episode-${episode}`
  )
    .then((r) => r.json())
    .catch(() => null);
  if (aniwatch?.sources?.[0]?.url) {
    return {
      source: "aniwatch",
      url: aniwatch.sources[0].url as string,
      quality: "default",
    };
  }

  // 3. Fall back to existing embeds
  if (existingEmbeds?.length > 0) {
    return {
      source: "embed",
      url: existingEmbeds[0],
      quality: "embed",
    };
  }

  return null;
}
