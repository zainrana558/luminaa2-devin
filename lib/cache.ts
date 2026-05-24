import { redis } from '@/lib/upstash'

export async function getCached<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number
): Promise<T> {
  try {
    const cached = await redis.get<T>(key)
    if (cached) return cached
    const fresh = await fetchFn()
    await redis.setex(key, ttl, JSON.stringify(fresh))
    return fresh
  } catch {
    return fetchFn()
  }
}
