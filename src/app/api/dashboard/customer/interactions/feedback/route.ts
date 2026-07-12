import { NextRequest }  from 'next/server'
import type { Severity } from '@prisma/client'
import { prisma }       from '@/lib/prisma'
import { requireAuth, ok, created, badRequest, serverError } from '@/lib/api-helpers'

type FeedbackBody = {
  type: 'CONFIRM' | 'DISPUTE' | 'REPORT'
  interactionId?: string
  drugName?: string
  herbName?: string
  severity?: Severity | null
  description?: string
  outcome?: string
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(req)
  if (error) return error
  try {
    const userId = (session!.user as { id: string }).id
    const body   = await req.json() as FeedbackBody
    const { type, interactionId, drugName, herbName, severity, description, outcome } = body
    if (!['CONFIRM','DISPUTE','REPORT'].includes(type)) return badRequest('type must be CONFIRM, DISPUTE, or REPORT')
    if (!description?.trim()) return badRequest('description is required')
    if ((type === 'CONFIRM' || type === 'DISPUTE') && !interactionId) return badRequest('interactionId is required')
    if (type === 'REPORT' && (!drugName?.trim() || !herbName?.trim())) return badRequest('drugName and herbName are required for REPORT')
    if (interactionId) {
      const existing = await prisma.interactionFeedback.findFirst({ where: { userId, interactionId, type } })
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
      message: type === 'REPORT' ? 'Report submitted. Our pharmacists will review within 5 business days.'
        : type === 'CONFIRM' ? 'Thank you — your confirmation strengthens the evidence.'
        : 'Your dispute has been logged for pharmacist review.',
    })
  } catch (e) { return serverError(e) }
}

export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth(req)
  if (error) return error
  try {
    const userId = (session!.user as { id: string }).id
    const url = new URL(req.url)
    const interactionId = url.searchParams.get('interactionId')
    const feedback = await prisma.interactionFeedback.findMany({
      where: { userId, ...(interactionId ? { interactionId } : {}) },
      orderBy: { createdAt: 'desc' },
    })
    return ok({ feedback })
  } catch (e) { return serverError(e) }
}
