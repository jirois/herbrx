import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAuth, ok, created, badRequest, serverError } from '@/lib/api-helpers'

// GET /api/incubation
// Returns the authenticated user's latest incubation submission with
// all phase logs and documents.
export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['PRODUCER', 'ADMIN'])
  if (error) return error

  try {
    const userId = (session!.user as { id: string }).id

    const submission = await prisma.incubationSubmission.findFirst({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        phases:    { orderBy: { enteredAt: 'asc' } },
        documents: { orderBy: { uploadedAt: 'desc' } },
      },
    })

    return ok({ submission })
  } catch (e) {
    return serverError(e)
  }
}

// POST /api/incubation
// Creates a new incubation submission (Phase 1 intake).
// Once submitted, the tracker shows the live pipeline.
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['PRODUCER', 'ADMIN'])
  if (error) return error

  try {
    const userId = (session!.user as { id: string }).id
    const body   = await req.json()

    const {
      productName, formulaCategory, description,
      targetDosage, currentForm, originStory,
      ndaSigned, royaltyAgreed, royaltyRate,
    } = body

    if (!productName?.trim())     return badRequest('productName is required')
    if (!formulaCategory?.trim()) return badRequest('formulaCategory is required')
    if (!description?.trim())     return badRequest('description is required')
    if (!ndaSigned)               return badRequest('You must agree to the NDA to proceed')
    if (!royaltyAgreed)           return badRequest('You must agree to the royalty terms to proceed')

    // Only allow one active submission per user at a time
    const existing = await prisma.incubationSubmission.findFirst({
      where: { userId, status: 'ACTIVE' },
    })
    if (existing) {
      return badRequest('You already have an active incubation submission. Track its progress in the Incubation Tracker.')
    }

    const submission = await prisma.incubationSubmission.create({
      data: {
        userId,
        productName:     productName.trim(),
        formulaCategory: formulaCategory.trim(),
        description:     description.trim(),
        targetDosage:    targetDosage?.trim() || null,
        currentForm:     currentForm?.trim()  || null,
        originStory:     originStory?.trim()  || null,
        ndaSigned:       true,
        ndaSignedAt:     new Date(),
        royaltyAgreed:   true,
        royaltyRate:     royaltyRate ?? 0.15,
        currentPhase:    'INTAKE',
        status:          'ACTIVE',
      },
      include: {
        phases:    true,
        documents: true,
      },
    })

    // Log the first phase entry
    await prisma.incubationPhaseLog.create({
      data: {
        submissionId: submission.id,
        phase:        'INTAKE',
        notes:        'Formulation intake submitted. NDA and royalty agreement signed.',
      },
    })

    // Audit log
    await prisma.adminAction.create({
      data: {
        adminId:    userId,
        action:     'INCUBATION_SUBMITTED',
        targetType: 'IncubationSubmission',
        targetId:   submission.id,
        reason:     `Incubation submitted for ${productName}`,
      },
    }).catch(() => {})

    return created({ submission })
  } catch (e) {
    return serverError(e)
  }
}
