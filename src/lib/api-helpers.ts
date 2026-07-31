import { getServerSession }   from 'next-auth'
import { authOptions }        from '@/lib/auth'
import { NextResponse }       from 'next/server'
import type { NextRequest }   from 'next/server'
import { useState, useEffect, useCallback } from 'react'

// ── Auth guard ────
export async function requireAuth(req: NextRequest, allowedRoles?: string[]) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const role = (session.user as { role?: string }).role as string
  if (allowedRoles && !allowedRoles.includes(role)) {
    return { session: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { session, error: null }
}

// ── Standard responses ─────
export const ok     = (data: unknown, status = 200) =>
  NextResponse.json(data, { status })

export const created = (data: unknown) =>
  NextResponse.json(data, { status: 201 })

export const badRequest = (msg: string) =>
  NextResponse.json({ error: msg }, { status: 400 })

export const notFound = (msg = 'Not found') =>
  NextResponse.json({ error: msg }, { status: 404 })

export const forbidden = (msg = 'Forbidden') =>
  NextResponse.json({ error: msg }, { status: 403 })

export const serverError = (err: unknown) => {
  console.error('[API Error]', err)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

// ── Pagination helper ─────────────────────────────────────────────────────
export function parsePagination(url: URL, defaultLimit = 20) {
  const page  = Math.max(1, Number(url.searchParams.get('page')  ?? 1))
  const limit = Math.min(100, Number(url.searchParams.get('limit') ?? defaultLimit))
  const skip  = (page - 1) * limit
  return { page, limit, skip }
}

// Slug helper for store
export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Store Help APi

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;

  mutate: () => Promise<void>;
}

/**
 * In-memory cache
 */
const cache = new Map<string, unknown>();

/**
 * Prevent duplicate network requests
 */
const pendingRequests = new Map<string, Promise<unknown>>();

export function useFetch<T>(
  url: string | null
): FetchState<T> {
  const [data, setData] = useState<T | null>(() => {
    if (!url) return null

    return (cache.get(url) as T) ?? null;
  })

  const [loading, setLoading] = useState(
    !!url && !cache.has(url)
  )

  const [error, setError] = useState<string | null>(null)

  const fetchNow = useCallback(async () => {

    if (!url) return

    setLoading(true)

    try {
      let promise = pendingRequests.get(
        url
      ) as Promise<T> | undefined

      if (!promise) {
        promise = fetch(url)
         .then(async (res) => {
          const json = await res.json();

          if (!res.ok) {
            throw new Error(
              json.error ?? "Request failed"
            )
          }
          return json
         })
         .finally(() => {pendingRequests.delete(url)})
         pendingRequests.set(url, promise)

      }
      const result = await promise;

      cache.set(url, result)

      setData(result)
      setError(null)
    } catch (e) {
       setError(
        e instanceof Error
          ? e.message
          : "Unknown error"
      );
    } finally {
      setLoading(false);
    }
      
  }, [url])

  useEffect(() => {
    if (!url) return;

    const controller = new AbortController()

    if (cache.has(url)) {
      const cachedData = cache.get(url) as T ?? null

      Promise.resolve().then(() => {
        setData(cachedData)
        setError(null)
        setLoading(false)
      })
    } else {
      Promise.resolve().then(() => {
        fetchNow()
      })
    }

    return () => controller.abort()
  }, [url, fetchNow])

  const mutate = useCallback(async () => {
    if (!url) return

    cache.delete(url)

    await fetchNow()
  }, [url, fetchNow])

  return{
    data,
    loading,
    error,
    mutate
  }
}