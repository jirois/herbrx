import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, badRequest, notFound, serverError } from '@/lib/api-helpers'

const VALID_STATUSES = ['DRAFT', 'PENDING_REVIEW', 'CHANGES_REQUESTED', 'PUBLISHED', 'ARCHIVED'] as const
type Status = (typeof VALID_STATUSES)[number]

const authorSelect = { select: { firstName: true, lastName: true, email: true } } as const

// GET /api/dashboard/editor/posts?status=PENDING_REVIEW
// Defaults to the review queue (PENDING_REVIEW), oldest first — a FIFO queue,
// same convention as the admin batch-review queue.
export async function GET(req: NextRequest) {
  const { error } = await requireAuth(req, ['EDITOR', 'ADMIN'])
  if (error) return error

  try {
    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const statusFilter = status && VALID_STATUSES.includes(status as Status) ? (status as Status) : undefined

    const posts = await prisma.blogPost.findMany({
      where: statusFilter ? { status: statusFilter } : { status: 'PENDING_REVIEW' },
      include: { author: authorSelect, reviewer: authorSelect },
      orderBy: statusFilter && statusFilter !== 'PENDING_REVIEW' ? { updatedAt: 'desc' } : { submittedAt: 'asc' },
    })

    return ok({ posts })
  } catch (e) {
    return serverError(e)
  }
}

// PATCH /api/dashboard/editor/posts
// Body: { postId, decision: 'PUBLISHED' | 'CHANGES_REQUESTED' | 'ARCHIVED', reviewNote? }
// CHANGES_REQUESTED requires a reviewNote so the writer knows what to fix.
export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['EDITOR', 'ADMIN'])
  if (error) return error

  try {
    const editorId = (session!.user as { id: string }).id
    const body = await req.json()
    const { postId, decision, reviewNote } = body

    if (!postId || !decision) return badRequest('postId and decision are required')
    if (!['PUBLISHED', 'CHANGES_REQUESTED', 'ARCHIVED'].includes(decision)) {
      return badRequest('decision must be PUBLISHED, CHANGES_REQUESTED, or ARCHIVED')
    }
    if (decision === 'CHANGES_REQUESTED' && !reviewNote) {
      return badRequest('reviewNote is required when requesting changes, so the writer knows what to fix')
    }

    const post = await prisma.blogPost.findUnique({ where: { id: postId } })
    if (!post) return notFound('Post not found')

    if (decision === 'ARCHIVED' && post.status !== 'PUBLISHED') {
      return badRequest('Only a published post can be archived')
    }
    if (['PUBLISHED', 'CHANGES_REQUESTED'].includes(decision) && post.status !== 'PENDING_REVIEW') {
      return badRequest(`Post is ${post.status.toLowerCase().replace('_', ' ')}, not pending review`)
    }

    const updated = await prisma.blogPost.update({
      where: { id: postId },
      data: {
        status: decision,
        reviewerId: editorId,
        reviewNotes: reviewNote ?? null,
        reviewedAt: new Date(),
        ...(decision === 'PUBLISHED' ? { publishedAt: post.publishedAt ?? new Date() } : {}),
      },
      include: { author: authorSelect, reviewer: authorSelect },
    })

    await prisma.adminAction.create({
      data: {
        adminId: editorId,
        action: `BLOG_${decision}`,
        targetType: 'BlogPost',
        targetId: postId,
        reason: reviewNote ?? null,
      },
    })

    return ok({ post: updated })
  } catch (e) {
    return serverError(e)
  }
}
