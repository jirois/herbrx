'use client'

import { useState, useEffect, useCallback } from 'react'

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
      let promise = pendingRequests.get(url) as Promise<T> | undefined

      if (!promise) {
        promise = fetch(url)
          .then(async (res) => {
            const json = await res.json();
            if (!res.ok) {
              throw new Error(json.error ?? "Request failed")
            }
            return json
          })
          .finally(() => { pendingRequests.delete(url) })
        
        pendingRequests.set(url, promise)
      }
      const result = await promise;

      cache.set(url, result)
      setData(result)
      setError(null)
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unknown error"
      );
    } finally {
      setLoading(false);
    }
  }, [url])

  useEffect(() => {
    if (!url) return;

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
  }, [url, fetchNow])

  const mutate = useCallback(async () => {
    if (!url) return
    cache.delete(url)
    await fetchNow()
  }, [url, fetchNow])

  return {
    data,
    loading,
    error,
    mutate
  }
}