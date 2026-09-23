import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, badRequest, notFound, forbidden, serverError } from '@/lib/api-helpers'

type AuthUser = { id: string; role: string }
type Params = { params: Promise<{ id: string }> }

// POST /api/dashboard/writer/posts/[id]/submit
export async function POST(req: NextRequest, { params }: Params) {
  const { session, error } = await requireAuth(req, ['WRITER', 'ADMIN'])
  if (error) return error

  try {
    const { id } = await params
    const user = session!.user as AuthUser

    const post = await prisma.blogPost.findUnique({ where: { id } })
    if (!post) return notFound('Post not found')
    if (user.role !== 'ADMIN' && post.authorId !== user.id) {
      return forbidden('This post does not belong to you')
    }
    if (!['DRAFT', 'CHANGES_REQUESTED'].includes(post.status)) {
      return badRequest(`Post is already ${post.status.toLowerCase().replace('_', ' ')}`)
    }
    if (!post.title || !post.excerpt || !post.content || !post.category) {
      return badRequest('Title, excerpt, content, and category are required before submitting')
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        status: 'PENDING_REVIEW',
        submittedAt: new Date(),
        // Clear the previous verdict — a fresh submission gets a fresh review.
        reviewNotes: null,
        reviewerId: null,
        reviewedAt: null,
      },
    })

    return ok({ post: updated })
  } catch (e) {
    return serverError(e)
  }
}
