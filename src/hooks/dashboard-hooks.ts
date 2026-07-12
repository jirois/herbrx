/**
 * useDashboard — lightweight SWR-style hooks for HerbRx dashboard API routes.
 * Usage: const { data, loading, error, mutate } = useProducerProducts()
 */

import { useState, useEffect, useCallback } from 'react'

type FetchState<T> = {
  data:    T | null
  loading: boolean
  error:   string | null
  mutate:  () => Promise<void>
}

function useFetch<T>(url: string): FetchState<T> {
  const [data,    setData]    = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [tick,    ]    = useState(0)

  const fetchNow = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(url)
      const d = await res.json()
      setData(d)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [url])

  const mutate = useCallback(async () => {
      await fetchNow()
  }, [fetchNow])

  // const mutate = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    let cancelled = false
  
    fetch(url)
      .then(r => r.json())
      .then(d => { if (!cancelled) { setData(d); setLoading(false) } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false) } })
    return () => { cancelled = true }
  }, [url, tick])

  return { data, loading, error, mutate }
}

// ── Producer hooks ───────
export function useProducerProducts() {
  return useFetch<{ products: Record<string, unknown>[]; tier: string; businessName?: string }>(
    '/api/dashboard/producer/products'
  )
}

export function useProducerBatches() {
  return useFetch<{ batches: Record<string, unknown>[]; products: Record<string, unknown>[] }>(
    '/api/dashboard/producer/batches'
  )
}

export function useVerificationStatus() {
  return useFetch<{ status: string; profile: Record<string, unknown> | null }>(
    '/api/dashboard/producer/verification'
  )
}

// ── Customer hooks ──────
export function useSafetyAlerts(status = 'ACTIVE') {
  return useFetch<{ alerts: Record<string, unknown>[] }>(
    `/api/dashboard/customer/alerts?status=${status}`
  )
}

export function usePublicAlerts(params?: {severity?: string; status?: string}){
  const queryParams = new URLSearchParams()
  if (params?.severity) queryParams.set('severity', params.severity)
  if (params?.status) queryParams.set('status', params.status)
  const qs = queryParams.toString()
  return useFetch<{ alerts: Record<string, unknown>[] }>(`/api/alerts${qs ? `?${qs}` : ''}`)
}

export function useConsultations() {
  return useFetch<{ consultations: Record<string, unknown>[] }>(
    '/api/dashboard/customer/consultations'
  )
}

// ── Admin hooks ─────────────────────
export function useAdminFlags() {
  return useFetch<{ flaggedProducts: Record<string, unknown>[]; rejectedBatches: Record<string, unknown>[] }>(
    '/api/dashboard/admin/flags'
  )
}

export function useAdminBatchQueue(status?: string) {
  const qs = status ? `?status=${status}` : ''
  return useFetch<{ batches: Record<string, unknown>[] }>(
    `/api/dashboard/admin/batches${qs}`
  )
}

export function useAdminAlerts(status = 'ALL') {
  return useFetch<{ alerts: Record<string, unknown>[] }>(
    `/api/dashboard/admin/alerts?status=${status}`
  )
}

export function useAdminUsers(role?: string, search?: string) {
  const params = new URLSearchParams()
  if (role)   params.set('role',   role)
  if (search) params.set('search', search)
  const qs = params.toString() ? `?${params}` : ''
  return useFetch<{ users: Record<string, unknown>[]; total: number }>(
    `/api/dashboard/admin/users${qs}`
  )
}

// ── Mutation helpers ──────────

/** Generic POST helper */
export async function apiPost(url: string, body: unknown) {
  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Request failed')
  return data
}

/** Generic PATCH helper */
export async function apiPatch(url: string, body: unknown) {
  const res = await fetch(url, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Request failed')
  return data
}

/** Generic DELETE helper */
export async function apiDelete(url: string) {
  const res = await fetch(url, {method: 'DELETE'})
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Request failed')
  return data;
}

// ── Domain-specific mutations ───────

export const producerApi = {
  createProduct:  (body: unknown) => apiPost('/api/dashboard/producer/products', body),
  updateProduct:  (body: unknown) => apiPatch('/api/dashboard/producer/products', body),
  deleteProduct:  (productId: string) => apiDelete(`/api/dashboard/producer/products?id=${productId}`),
  submitBatch:    (body: unknown) => apiPost('/api/dashboard/producer/batches',  body),
  applyVerification: (body: unknown) => apiPost('/api/dashboard/producer/verification', body),
}

export const customerApi = {
  bookConsultation: (body: unknown) => apiPost('/api/dashboard/customer/consultations', body),
  verifyConsultationPayment: (reference: string) =>
    apiPost('/api/dashboard/customer/consultations/verify', { reference }),
}

export const adminApi = {
  takeFlagAction: (body: unknown) => apiPatch('/api/dashboard/admin/flags',  body),
  reviewBatch:    (body: unknown) => apiPatch('/api/dashboard/admin/batches', body),
  publishAlert:   (body: unknown) => apiPost('/api/dashboard/admin/alerts',  body),
  resolveAlert:   (body: unknown) => apiPatch('/api/dashboard/admin/alerts', body),
  deleteAlert: (alertId: string) => apiDelete(`/api/dashboard/admin/alerts?id=${alertId}`),
  changeUserStatus: (body: unknown) => apiPatch('/api/dashboard/admin/users', body),
}

export const bookingApi = {
  create: (body: unknown) => apiPost('/api/booking', body),
  getSlots: () => fetch('/api/booking').then(r => r.json()),
}

// ── Public page hooks ─────

export function useHerbs(params?: { category?: string; rating?: string; search?: string }) {
  const entries = Object.entries(params || {})
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => [k, String(v)]) as [string, string][]
  const qs = new URLSearchParams(entries).toString()
  return useFetch<{ herbs: unknown[] }>(`/api/herbs${qs ? `?${qs}` : ''}`)
}

export function useGuides(params?: { category?: string; featured?: string; search?: string }) {
  const entries = Object.entries(params || {})
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => [k, String(v)]) as [string, string][]
  const qs = new URLSearchParams(entries).toString()
  return useFetch<{ guides: unknown[] }>(`/api/guides${qs ? `?${qs}` : ''}`)
}

export function useSafetyReviews(params?: { verdict?: string; search?: string }) {
  const entries = Object.entries(params || {})
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => [k, String(v)]) as [string, string][]
  const qs = new URLSearchParams(entries).toString()
  return useFetch<{ reviews: Record<string, unknown>[] }>(`/api/safety-reviews${qs ? `?${qs}` : ''}`)
}

export function usePress(type?: string) {
  return useFetch<{ items: Record<string, unknown>[] }>(`/api/press${type ? `?type=${type}` : ''}`)
}

export const alertsApi = {
  subscribe: (body: { email?: string; channels?: string[]; herbIds?: string[] }) =>
    apiPost('/api/alerts/subscribe', body),
}

export function useAdminProducts(status?: string, search?: string) {
  const params = new URLSearchParams()
  if (status && status !== 'ALL') params.set('status', status)
  if (search) params.set('search', search)
  const qs = params.toString()
  return useFetch<{ products: Record<string, unknown>[] }>(`/api/dashboard/admin/products${qs ? `?${qs}` : ''}`)
}

// ── Incubation hooks ───
export function useIncubation() {
  return useFetch<{ submission: Record<string, unknown> | null }>('/api/incubation')
}

export const incubationApi = {
  submit: (body: unknown) => apiPost('/api/incubation', body),
}

export function useProducerAnalytics() {
  return useFetch<{
    summary: Record<string, unknown> | null
    products: Record<string, unknown>[]
    batches: Record<string, unknown>[]
    revenueByMonth: { label: string; revenue: number; sales: number }[]
    categories: { category: string; revenue: number; sales: number; count: number }[]
  }>('/api/dashboard/producer/analytics')
}
