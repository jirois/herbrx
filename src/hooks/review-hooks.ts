'use client'

import { useState, useEffect, useCallback } from 'react'

// Small local copy of the SWR-style fetch hook used elsewhere in the
// dashboard (see lib/dashboard-hooks.ts) — kept local here since this
// feature is used on public storefront pages, not just the dashboard.
function useFetch<T>(url: string | null): { data: T | null; loading: boolean; error: string | null; mutate: () => Promise<void> } {
  const [data,    setData]    = useState<T | null>(null)
  const [loading, setLoading] = useState(!!url)
  const [error,   setError]   = useState<string | null>(null)
  const [tick,    ]    = useState(0)

  const fetchNow = useCallback(async () => {
    if (!url) return
    setLoading(true)
    try {
      const res = await fetch(url)
      const d   = await res.json()
      setData(d)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [url])

  const mutate = useCallback(async () => { await fetchNow() }, [fetchNow])

  useEffect(() => {
    if (!url) {
      // Avoid synchronous setState inside effect which can cause cascading renders;
      // schedule state updates asynchronously.
      queueMicrotask(() => { setData(null); setLoading(false) })
      return
    }
    let cancelled = false
    // Avoid synchronous setState inside effect which can cause cascading renders;
    // schedule state update asynchronously.
    queueMicrotask(() => { setLoading(true) })
    fetch(url)
      .then(r => r.json())
      .then(d => { if (!cancelled) { setData(d); setLoading(false) } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false) } })
    return () => { cancelled = true }
  }, [url, tick])

  return { data, loading, error, mutate }
}

export type ReviewSort = 'recent' | 'helpful'

export interface ReviewItem {
  id: string
  rating: number
  title: string
  body: string
  verifiedPurchase: boolean
  helpfulCount: number
  createdAt: string
  reviewerName: string
  isOwnReview: boolean
  markedHelpful: boolean
}

export interface ReviewSummary {
  average: number
  count: number
  breakdown: Record<'5' | '4' | '3' | '2' | '1', { count: number; pct: number }>
}

export function useProductReviews(productId: string, opts: { stars?: number | null; sort?: ReviewSort } = {}) {
  const params = new URLSearchParams({ productId })
  if (opts.stars) params.set('stars', String(opts.stars))
  if (opts.sort)  params.set('sort', opts.sort)

  return useFetch<{ reviews: ReviewItem[]; summary: ReviewSummary }>(
    productId ? `/api/reviews?${params.toString()}` : null
  )
}

export type ReviewSummaryMap = Record<string, { average: number; count: number }>

export function useReviewSummaries(ids: string[]) {
  // Stable key so the fetch doesn't re-run every render just because the
  // caller passed a new array instance with the same contents.
  const key = ids.slice().sort().join(',')
  return useFetch<{ summaries: ReviewSummaryMap }>(
    key ? `/api/reviews/summaries?ids=${encodeURIComponent(key)}` : null
  )
}

export function useReviewEligibility(productId: string) {
  return useFetch<{
    loggedIn: boolean
    hasVerifiedPurchase: boolean
    existingReview: { id: string; rating: number; title: string; body: string } | null
  }>(productId ? `/api/reviews/eligibility?productId=${encodeURIComponent(productId)}` : null)
}

export async function submitReview(input: { productId: string; rating: number; title: string; body: string }) {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error ?? 'Failed to submit review')
  return data
}

export async function toggleReviewHelpful(reviewId: string) {
  const res = await fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error ?? 'Failed to update')
  return data as { helpful: boolean; helpfulCount: number }
}
