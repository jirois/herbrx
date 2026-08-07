'use client'

import { useState, useEffect, useCallback } from 'react'
import type { StoreProduct, StoreProductDetail } from '@/types'

function useFetch<T>(url: string | null): { data: T | null; loading: boolean; error: string | null; mutate: () => Promise<void> } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(!!url)
  const [error, setError] = useState<string | null>(null)

  const fetchNow = useCallback(async () => {
    if (!url) return
    setLoading(true)
    try {
      const res = await fetch(url)
      const d = await res.json()
      if (!res.ok) throw new Error(d?.error ?? 'Something went wrong')
      setData(d)
      setError(null)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    if (!url) {
      const timeoutId = window.setTimeout(() => {
        setData(null)
        setLoading(false)
        setError(null)
      }, 0)
      return () => window.clearTimeout(timeoutId)
    }
    let cancelled = false
    Promise.resolve().then(() => {
      if (!cancelled) setLoading(true)
    })
    fetch(url)
      .then(async r => {
        const d = await r.json()
        if (!r.ok) throw new Error(d?.error ?? 'Something went wrong')
        return d
      })
      .then(d => { if (!cancelled) { setData(d); setError(null); setLoading(false) } })
      .catch((err: unknown) => { const message = err instanceof Error ? err.message : String(err); if (!cancelled) { setError(message); setLoading(false) } })
    return () => { cancelled = true }
  }, [url])

  return { data, loading, error, mutate: fetchNow }
}

/** Full storefront catalog — replaces `import { products } from '@/data/products'`. */
export function useStoreProducts(category?: string) {
  const qs = category && category !== 'All Products' ? `?category=${encodeURIComponent(category)}` : ''
  return useFetch<{ products: StoreProduct[] }>(`/api/products${qs}`)
}

/** Single product by slug, with related products embedded — replaces
 *  `getProductBySlug()` + `getRelatedProducts()`. */
export function useStoreProduct(slug: string | null) {
  return useFetch<{ product: StoreProductDetail }>(slug ? `/api/products/${slug}` : null)
}

/** Replaces `getFeaturedProducts()` for the cart page's "You May Also Like". */
export function useFeaturedProducts(limit = 4) {
  const { data, loading, error } = useStoreProducts()
  const featured = (data?.products ?? []).filter(p => p.featured)
  // Fall back to most-recent products if nothing's been marked featured yet,
  // so the section isn't just empty on a fresh catalog.
  const list = (featured.length > 0 ? featured : data?.products ?? []).slice(0, limit)
  return { products: list, loading, error }
}
