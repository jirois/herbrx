import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, created, badRequest, serverError, slugify } from '@/lib/api-helpers'

type AuthUser = { id: string; role: string }

const authorSelect = { select: { firstName: true, lastName: true, email: true } } as const

// GET /api/dashboard/writer/posts — the current writer's own posts (or all, for ADMIN)
export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['WRITER', 'ADMIN'])
  if (error) return error

  try {
    const user = session!.user as AuthUser
    const posts = await prisma.blogPost.findMany({
      where: user.role === 'ADMIN' ? {} : { authorId: user.id },
      include: { author: authorSelect, reviewer: authorSelect },
      orderBy: { updatedAt: 'desc' },
    })
    return ok({ posts })
  } catch (e) {
    return serverError(e)
  }
}

// POST /api/dashboard/writer/posts — create a new draft
// Body: { title, excerpt, content, category, tags?, imageUrl?, readTime?, authorTitle? }
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['WRITER', 'ADMIN'])
  if (error) return error

  try {
    const user = session!.user as AuthUser
    const body = await req.json()
    const { title, excerpt, content, category, tags, imageUrl, readTime, authorTitle } = body

    if (!title || !excerpt || !content || !category) {
      return badRequest('title, excerpt, content, and category are required')
    }

    const slug = await generateUniqueSlug(title)

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        category,
        tags: Array.isArray(tags) ? tags : [],
        imageUrl: imageUrl ?? null,
        readTime: Number(readTime) || 4,
        authorTitle: authorTitle ?? null,
        authorId: user.id,
        status: 'DRAFT',
      },
      include: { author: authorSelect, reviewer: authorSelect },
    })

    return created({ post })
  } catch (e) {
    return serverError(e)
  }
}

async function generateUniqueSlug(title: string) {
  const base = slugify(title)
  let slug = base
  let count = 1
  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${base}-${count++}`
  }
  return slug
}
