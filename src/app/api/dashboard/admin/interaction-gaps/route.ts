import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAuth, ok, created, badRequest, notFound, serverError } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const {  error } = await requireAuth(req, ['ADMIN'])
  if (error) return error
  try {
    const url   = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') ?? '50', 10)

    const gapQueries = await prisma.interactionQuery.findMany({
      where: { hadMissingDrug: true },
      select: { missingDrugs: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5000,
    })

    const freqMap = new Map<string, { count: number; lastSeen: Date }>()
    for (const q of gapQueries) {
      const missing = Array.isArray(q.missingDrugs) ? q.missingDrugs : []
      for (const drug of missing) {
        const key = typeof drug === 'string' ? drug.toLowerCase().trim() : ''
        if (!key) continue
        const ex  = freqMap.get(key)
        if (ex) { ex.count++; if (q.createdAt > ex.lastSeen) ex.lastSeen = q.createdAt }
        else freqMap.set(key, { count: 1, lastSeen: q.createdAt })
      }
    }

    const gaps = Array.from(freqMap.entries())
      .map(([drug, { count, lastSeen }]) => ({ drug, count, lastSeen }))
      .sort((a, b) => b.count - a.count).slice(0, limit)

    const reports = await prisma.interactionFeedback.findMany({
      where: { type: 'REPORT', verified: false },
      include: { interaction: { select: { drugName: true, herbName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const disputed = await prisma.drugHerbInteraction.findMany({
      where: { disputedCount: { gte: 1 } },
      orderBy: { disputedCount: 'desc' },
      take: 50,
      select: { id: true, drugName: true, herbName: true, severity: true, confirmedCount: true, disputedCount: true, reportedCount: true, evidenceLevel: true },
    })

    const [totalInteractions, totalQueries, totalFeedback, totalGapQueries] = await Promise.all([
      prisma.drugHerbInteraction.count({ where: { isPublished: true } }),
      prisma.interactionQuery.count(),
      prisma.interactionFeedback.count(),
      prisma.interactionQuery.count({ where: { hadMissingDrug: true } }),
    ])

    return ok({
      gaps, reports, disputed,
      stats: {
        totalInteractions, totalQueries, totalFeedback, totalGapQueries,
        gapRate: totalQueries > 0 ? Math.round((totalGapQueries / totalQueries) * 100) : 0,
        uniqueGaps: freqMap.size,
      },
    })
  } catch (e) { return serverError(e) }
}

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['ADMIN'])
  if (error) return error
  try {
    const adminId = (session!.user as { id: string }).id
    const body    = await req.json()
    const { feedbackId, action, ...fields } = body
    if (!feedbackId || !action) return badRequest('feedbackId and action are required')
    const feedback = await prisma.interactionFeedback.findUnique({ where: { id: feedbackId } })
    if (!feedback) return notFound('Feedback not found')

    if (action === 'REJECT') {
      const updated = await prisma.interactionFeedback.update({
        where: { id: feedbackId },
        data: { verified: true, verifiedBy: adminId, verifiedAt: new Date() },
      })
      return ok({ feedback: updated, action: 'REJECTED' })
    }

    if (action === 'PROMOTE') {
      const { drugName, herbName, severity, mechanism, effect, advice, evidenceLevel,
              drugClass, herbScientific, herbLocalNames, drugAliases } = fields
      if (!drugName || !herbName || !severity || !effect || !advice || !evidenceLevel)
        return badRequest('drugName, herbName, severity, effect, advice, evidenceLevel required')

      const safeStringList = (value: unknown): string[] => {
        if (!Array.isArray(value)) return [] as string[]
        return value.filter((item): item is string => typeof item === 'string')
      }

      const normalizedHerbLocalNames = safeStringList(herbLocalNames)
      const normalizedDrugAliases = safeStringList(drugAliases)
      const herbLocalNamesString = normalizedHerbLocalNames.join(', ')
      const drugAliasesString = normalizedDrugAliases.join(', ')

      const interaction = await prisma.drugHerbInteraction.upsert({
        where:  { drugName_herbName: { drugName: drugName.toLowerCase().trim(), herbName } },
        update: { severity, mechanism: mechanism ?? null, effect, advice, evidenceLevel, drugClass: drugClass ?? null, herbScientific: herbScientific ?? null, herbLocalNames: herbLocalNamesString, drugAliases: drugAliasesString, source: 'COMMUNITY_REPORTED', reportedCount: { increment: 1 }, reviewedBy: adminId, reviewedAt: new Date(), isPublished: true },
        create: { drugName: drugName.toLowerCase().trim(), herbName, severity, mechanism: mechanism ?? null, effect, advice, evidenceLevel, drugClass: drugClass ?? null, herbScientific: herbScientific ?? null, herbLocalNames: herbLocalNamesString, drugAliases: drugAliasesString, references: '', source: 'COMMUNITY_REPORTED', reportedCount: 1, reviewedBy: adminId, reviewedAt: new Date(), isPublished: true },
      })

      await prisma.interactionFeedback.update({
        where: { id: feedbackId },
        data: { verified: true, verifiedBy: adminId, verifiedAt: new Date(), promotedToDb: true, interactionId: interaction.id },
      })
      await prisma.adminAction.create({ data: { adminId, action: 'INTERACTION_PROMOTED', targetType: 'DrugHerbInteraction', targetId: interaction.id, reason: `Promoted: ${drugName} × ${herbName}` } })
      return created({ interaction, action: 'PROMOTED' })
    }
    return badRequest('action must be PROMOTE or REJECT')
  } catch (e) { return serverError(e) }
}
