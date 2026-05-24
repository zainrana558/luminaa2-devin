const ANILIST_URL = 'https://graphql.anilist.co'

export async function fetchAniList<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T | null> {
  try {
    const res = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error('AniList failed')
    return await res.json()
  } catch {
    return null
  }
}
