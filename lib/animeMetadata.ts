import { fetchAniList } from './anilist'
import { fetchJikan } from './jikan'

interface AnimeMetadata {
  source: 'anilist' | 'jikan' | 'tmdb'
  [key: string]: unknown
}

export async function getAnimeMetadata(
  tmdbId: number | string,
  title: string
): Promise<AnimeMetadata> {
  const anilistData = await fetchAniList<{
    data?: { Media?: Record<string, unknown> }
  }>(
    `
    query($search: String) {
      Media(search: $search, type: ANIME) {
        id
        title { english romaji }
        episodes
        status
        averageScore
        genres
        studios { nodes { name } }
        description
        coverImage { large }
      }
    }
  `,
    { search: title }
  )

  if (anilistData?.data?.Media) {
    return {
      source: 'anilist',
      ...anilistData.data.Media,
    }
  }

  const jikanData = await fetchJikan<{
    data?: Array<Record<string, unknown>>
  }>(`/anime?q=${encodeURIComponent(title)}&limit=1`)

  if (jikanData?.data?.[0]) {
    return {
      source: 'jikan',
      ...jikanData.data[0],
    }
  }

  return {
    source: 'tmdb',
    title: { english: title },
    episodes: null,
    status: null,
    averageScore: null,
    genres: [],
    studios: [],
    description: null,
  }
}
