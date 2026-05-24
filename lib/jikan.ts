const JIKAN_URL = 'https://api.jikan.moe/v4'

export async function fetchJikan<T = unknown>(
  endpoint: string
): Promise<T | null> {
  try {
    const res = await fetch(`${JIKAN_URL}${endpoint}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error('Jikan failed')
    return await res.json()
  } catch {
    return null
  }
}
