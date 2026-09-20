import { NextRequest } from 'next/server'
import type { Severity } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, created, badRequest, serverError, notFound } from '@/lib/api-helpers'

type ReportBody = {
  type: 'CONFIRM' | 'DISPUTE' | 'REPORT'
  interactionId?: string
  drugName?: string
  herbName?: string
  severity?: Severity | null
  description?: string
  outcome?: string
  consultationId?: string
}

// POST /api/dashboard/consultant/interaction-reports
// Lets a consultant file a clinical observation about a herb-drug
// interaction — either their own professional read, or something a client
// told them about during a session (use consultationId + outcome to capture
// that context; nothing about the client is stored here beyond the link).
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['CONSULTANT'])
  if (error) return error
  try {
    const userId = (session!.user as { id: string }).id
    const body = await req.json() as ReportBody
    const { type, interactionId, drugName, herbName, severity, description, outcome, consultationId } = body

    if (!['CONFIRM', 'DISPUTE', 'REPORT'].includes(type)) {
      return badRequest('type must be CONFIRM, DISPUTE, or REPORT')
    }
    if (!description?.trim()) return badRequest('description is required')
    if ((type === 'CONFIRM' || type === 'DISPUTE') && !interactionId) {
      return badRequest('interactionId is required for CONFIRM/DISPUTE')
    }
    if (type === 'REPORT' && (!drugName?.trim() || !herbName?.trim())) {
      return badRequest('drugName and herbName are required for REPORT')
    }

    // If they're linking this to a specific session, make sure it's
    // actually theirs — a consultant should only be able to attach reports
    // to their own consultations, not anyone else's.
    if (consultationId) {
      const consultant = await prisma.consultantProfile.findUnique({ where: { userId } })
      const consultation = await prisma.consultation.findUnique({ where: { id: consultationId } })
      if (!consultation) return notFound('Consultation not found')
      if (!consultant || consultation.consultantId !== consultant.id) {
        return badRequest('That consultation does not belong to you')
      }
    }

    if (interactionId) {
      const existing = await prisma.interactionFeedback.findFirst({
        where: { userId, interactionId, type },
      })
      if (existing) return badRequest('You have already submitted this type of feedback for this interaction.')
    }

    const feedback = await prisma.interactionFeedback.create({
      data: {
        userId, interactionId: interactionId ?? null, type,
        drugName: drugName?.trim().toLowerCase() ?? null,
        herbName: herbName?.trim() ?? null,
        severity: severity ?? null,
        description: description.trim(),
        outcome: outcome?.trim() ?? null,
        submittedAsConsultant: true,
        consultationId: consultationId ?? null,
        verified: false, promotedToDb: false,
      },
    })

    if (interactionId) {
      const update = type === 'CONFIRM' ? { confirmedCount: { increment: 1 } }
        : type === 'DISPUTE' ? { disputedCount: { increment: 1 } }
        : { reportedCount: { increment: 1 } }
      await prisma.drugHerbInteraction.update({ where: { id: interactionId }, data: update })
    }

    return created({
      feedback,
      message: 'Report submitted for pharmacist review. As a licensed consultant, your reports are prioritized in the review queue.',
    })
  } catch (e) { return serverError(e) }
}

// GET /api/dashboard/consultant/interaction-reports
// This consultant's own submitted reports, with review status.
export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['CONSULTANT'])
  if (error) return error
  try {
    const userId = (session!.user as { id: string }).id
    const reports = await prisma.interactionFeedback.findMany({
      where: { userId, submittedAsConsultant: true },
      orderBy: { createdAt: 'desc' },
      include: {
        interaction: { select: { drugName: true, herbName: true, severity: true } },
      },
    })
    return ok({ reports })
  } catch (e) { return serverError(e) }
}
