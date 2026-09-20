import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAuth, ok, created, badRequest, notFound, serverError } from '@/lib/api-helpers'
import { parseJsonArray } from '@/lib/json-field'

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
      const missing = parseJsonArray<string>(q.missingDrugs)
      for (const drug of missing) {
        const key = drug.toLowerCase().trim()
        if (!key) continue
        const ex  = freqMap.get(key)
        if (ex) { ex.count++; if (q.createdAt > ex.lastSeen) ex.lastSeen = q.createdAt }
        else freqMap.set(key, { count: 1, lastSeen: q.createdAt })
      }
    }

    const gaps = Array.from(freqMap.entries())
      .map(([drug, { count, lastSeen }]) => ({ drug, count, lastSeen }))
      .sort((a, b) => b.count - a.count).slice(0, limit)

    // Pending community reports — new suspected interactions awaiting review
    const reports = await prisma.interactionFeedback.findMany({
      where: { type: 'REPORT', verified: false },
      include: { interaction: { select: { drugName: true, herbName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // Individual CONFIRM/DISPUTE notes — previously these only silently
    // incremented a counter on the interaction with no way for an admin to
    // actually read what anyone said. This is the missing review surface.
    const feedbackEntries = await prisma.interactionFeedback.findMany({
      where: { type: { in: ['CONFIRM', 'DISPUTE'] }, verified: false },
      include: { interaction: { select: { drugName: true, herbName: true, severity: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // Already-reviewed reports (promoted or dismissed) — kept visible for
    // audit purposes, and so an accidental dismiss can be caught and undone
    // rather than silently vanishing forever.
    const history = await prisma.interactionFeedback.findMany({
      where: { type: 'REPORT', verified: true },
      include: { interaction: { select: { drugName: true, herbName: true } } },
      orderBy: { verifiedAt: 'desc' },
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
      gaps, reports, disputed, feedbackEntries, history,
      stats: {
        totalInteractions, totalQueries, totalFeedback, totalGapQueries,
        gapRate: totalQueries > 0 ? Math.round((totalGapQueries / totalQueries) * 100) : 0,
        uniqueGaps: freqMap.size,
        pendingReports: reports.length,
        pendingFeedback: feedbackEntries.length,
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

    // Acknowledges a CONFIRM/DISPUTE note as read/considered, without the
    // PROMOTE/REJECT semantics that only make sense for a REPORT.
    if (action === 'ACKNOWLEDGE') {
      const updated = await prisma.interactionFeedback.update({
        where: { id: feedbackId },
        data: { verified: true, verifiedBy: adminId, verifiedAt: new Date() },
      })
      return ok({ feedback: updated, action: 'ACKNOWLEDGED' })
    }

    // Undoes a REJECT (or an ACKNOWLEDGE) — for exactly the scenario that
    // motivated adding this: a report dismissed by mistake, with no
    // confirmation step, used to just vanish with no way back.
    if (action === 'RESTORE') {
      const updated = await prisma.interactionFeedback.update({
        where: { id: feedbackId },
        data: { verified: false, verifiedBy: null, verifiedAt: null },
      })
      return ok({ feedback: updated, action: 'RESTORED' })
    }

    if (action === 'PROMOTE') {
      const { drugName, herbName, severity, mechanism, effect, advice, evidenceLevel,
              drugClass, herbScientific, herbLocalNames, herbAliases, drugAliases,
              rxCui, mechanismTypes, affectedPathways, herbDosageThresholdMg,
              drugDosageThresholdMg, formulationContext } = fields
      if (!drugName || !herbName || !severity || !effect || !advice || !evidenceLevel)
        return badRequest('drugName, herbName, severity, effect, advice, evidenceLevel required')

      const shared = {
        severity, mechanism: mechanism ?? null, effect, advice, evidenceLevel,
        drugClass: drugClass ?? null, herbScientific: herbScientific ?? null,
        herbLocalNames: herbLocalNames ?? [], herbAliases: herbAliases ?? [],
        drugAliases: drugAliases ?? [], rxCui: rxCui ?? null,
        mechanismTypes: mechanismTypes ?? [], affectedPathways: affectedPathways ?? [],
        herbDosageThresholdMg: herbDosageThresholdMg ?? null,
        drugDosageThresholdMg: drugDosageThresholdMg ?? null,
        formulationContext: formulationContext ?? [],
      }

      const interaction = await prisma.drugHerbInteraction.upsert({
        where:  { drugName_herbName: { drugName: drugName.toLowerCase().trim(), herbName } },
        update: { ...shared, source: 'COMMUNITY_REPORTED', reportedCount: { increment: 1 }, reviewedBy: adminId, reviewedAt: new Date(), isPublished: true },
        create: { drugName: drugName.toLowerCase().trim(), herbName, ...shared, references: [], source: 'COMMUNITY_REPORTED', reportedCount: 1, reviewedBy: adminId, reviewedAt: new Date(), isPublished: true },
      })

      await prisma.interactionFeedback.update({
        where: { id: feedbackId },
        data: { verified: true, verifiedBy: adminId, verifiedAt: new Date(), promotedToDb: true, interactionId: interaction.id },
      })
      await prisma.adminAction.create({ data: { adminId, action: 'INTERACTION_PROMOTED', targetType: 'DrugHerbInteraction', targetId: interaction.id, reason: `Promoted: ${drugName} × ${herbName}` } })
      return created({ interaction, action: 'PROMOTED' })
    }
    return badRequest('action must be PROMOTE, REJECT, ACKNOWLEDGE, or RESTORE')
  } catch (e) { return serverError(e) }
}
