import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, badRequest, notFound, forbidden, serverError, slugify } from '@/lib/api-helpers'

type AuthUser = { id: string; role: string }
type Params = { params: Promise<{ id: string }> }

const authorSelect = { select: { firstName: true, lastName: true, email: true } } as const

async function loadOwned(id: string, user: AuthUser) {
  const post = await prisma.blogPost.findUnique({ where: { id } })
  if (!post) return { post: null, owns: false }
  const owns = user.role === 'ADMIN' || post.authorId === user.id
  return { post, owns }
}

// GET /api/dashboard/writer/posts/[id]
export async function GET(req: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth(req, ['WRITER', 'ADMIN'])
  if (error) return error

  try {
    const { id } = await params
    const user = session!.user as AuthUser
    const { post, owns } = await loadOwned(id, user)
    if (!post) return notFound('Post not found')
    if (!owns) return forbidden('This post does not belong to you')

    const full = await prisma.blogPost.findUnique({
      where: { id },
      include: { author: authorSelect, reviewer: authorSelect },
    })
    return ok({ post: full })
  } catch (e) {
    return serverError(e)
  }
}

// PATCH /api/dashboard/writer/posts/[id]
// Body: { title?, excerpt?, content?, category?, tags?, imageUrl?, readTime?, authorTitle? }
// Only editable while DRAFT or CHANGES_REQUESTED — once submitted or published,
// the writer must wait for the editor's decision (or ask an admin to intervene).
export async function PATCH(req: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth(req, ['WRITER', 'ADMIN'])
  if (error) return error

  try {
    const { id } = await params
    const user = session!.user as AuthUser
    const { post, owns } = await loadOwned(id, user)
    if (!post) return notFound('Post not found')
    if (!owns) return forbidden('This post does not belong to you')

    if (user.role !== 'ADMIN' && !['DRAFT', 'CHANGES_REQUESTED'].includes(post.status)) {
      return forbidden(`Cannot edit a post that is ${post.status.toLowerCase().replace('_', ' ')}`)
    }

    const body = await req.json()
    const { title, excerpt, content, category, tags, imageUrl, readTime, authorTitle } = body

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title, slug: await generateUniqueSlug(title, id) } : {}),
        ...(excerpt !== undefined ? { excerpt } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(tags !== undefined ? { tags: Array.isArray(tags) ? tags : [] } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(readTime !== undefined ? { readTime: Number(readTime) || 4 } : {}),
        ...(authorTitle !== undefined ? { authorTitle } : {}),
      },
      include: { author: authorSelect, reviewer: authorSelect },
    })

    return ok({ post: updated })
  } catch (e) {
    return serverError(e)
  }
}

// DELETE /api/dashboard/writer/posts/[id] — only drafts/changes-requested posts can be withdrawn
export async function DELETE(req: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth(req, ['WRITER', 'ADMIN'])
  if (error) return error

  try {
    const { id } = await params
    const user = session!.user as AuthUser
    const { post, owns } = await loadOwned(id, user)
    if (!post) return notFound('Post not found')
    if (!owns) return forbidden('This post does not belong to you')

    if (user.role !== 'ADMIN' && !['DRAFT', 'CHANGES_REQUESTED'].includes(post.status)) {
      return badRequest('Only draft posts or posts sent back for changes can be deleted')
    }

    await prisma.blogPost.delete({ where: { id } })
    return ok({ success: true, deletedId: id })
  } catch (e) {
    return serverError(e)
  }
}

async function generateUniqueSlug(title: string, excludeId?: string) {
  const base = slugify(title)
  let slug = base
  let count = 1
  while (
    await prisma.blogPost.findFirst({ where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) } })
  ) {
    slug = `${base}-${count++}`
  }
  return slug
}
