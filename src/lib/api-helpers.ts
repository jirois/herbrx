import { getServerSession }   from 'next-auth'
import { authOptions }        from '@/lib/auth'
import { NextResponse }       from 'next/server'
import type { NextRequest }   from 'next/server'

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

