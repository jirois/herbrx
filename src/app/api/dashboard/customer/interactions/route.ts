import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import {  ok, serverError, badRequest } from '@/lib/api-helpers'
import { getServerSession } from 'next-auth'
import { authOptions }  from '@/lib/auth'

// GET /api/dashboard/customer/interactions
// Returns the current user's saved medications.
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return ok({ medications: [] })
    const userId = (session.user as { id?: string }).id
    const medications = await prisma.savedMedication.findMany({
      where: { userId }, orderBy: { name: 'asc' },
    })
    return ok({ medications })
  } catch (e) { return serverError(e) }
}

// POST /api/dashboard/customer/interactions
// Body: { drugs: string[], herbs?: string[], sessionId?: string }
//
// The core query engine:
//   1. Normalises drug names (lowercase, strips punctuation)
//   2. Looks up all matching interactions for those drugs against known herbs
//   3. If herb filter provided, restricts results to those herbs
//   4. Attaches per-result feedback counts
//   5. Logs the query — including any missing drug names — to power the gap report
export async function POST(req: NextRequest) {
  try {
    const session  = await getServerSession(authOptions)
    const userId   = session?.user ? (session.user as { id?: string }).id : null
    const body     = await req.json()
    const { drugs, herbs, sessionId } = body

    if (!Array.isArray(drugs) || drugs.length === 0) {
      return badRequest('drugs must be a non-empty array')
    }

    // Normalise: lowercase, trim, de-duplicate
    const normalisedDrugs = [...new Set(
      drugs.map((d: string) => d.toLowerCase().trim())
    )]

    // Search: match on drugName OR any drugAliases element
    // We fetch all published interactions for these drugs, then filter by herbs if specified
    const allInteractions = await prisma.drugHerbInteraction.findMany({
      where: {
        isPublished: true,
        OR: normalisedDrugs.map(drug => ({
          OR: [
            { drugName: drug },
            { drugName: { contains: drug } },
            // drugAliases is a JSON array — search handled post-fetch for aliases
          ],
        })),
      },
      include: {
        feedback: { select: { id: true, type: true } },
      },
    })

    // Filter: also match drugAliases (JSON array, can't query natively in MySQL)
    const matchingInteractions = allInteractions.filter(interaction => {
      const aliases = Array.isArray(interaction.drugAliases)
        ? interaction.drugAliases
        : typeof interaction.drugAliases === 'string'
          ? [interaction.drugAliases]
          : []

      const matchesDrug = normalisedDrugs.some(drug =>
        interaction.drugName === drug ||
        interaction.drugName.includes(drug) ||
        drug.includes(interaction.drugName) ||
        aliases.some((a: string) => a.toLowerCase() === drug || a.toLowerCase().includes(drug))
      )
      if (!matchesDrug) return false

      // Apply herb filter if provided
      if (herbs && herbs.length > 0) {
        const normHerbs = (herbs as string[]).map((h: string) => h.toLowerCase())
        return normHerbs.some(h =>
          interaction.herbName.toLowerCase().includes(h) ||
          h.includes(interaction.herbName.toLowerCase())
        )
      }
      return true
    })

    // Sort: DANGER first, then WARNING, INFO, BENEFICIAL
    const severityOrder: Record<string, number> = { DANGER: 0, WARNING: 1, INFO: 2, BENEFICIAL: 3 }
    matchingInteractions.sort((a, b) =>
      (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4)
    )

    // Shape results — include community signal counts and total feedback
    const results = matchingInteractions.map(i => {
      const herbLocalNames = Array.isArray(i.herbLocalNames)
        ? i.herbLocalNames
        : typeof i.herbLocalNames === 'string'
          ? [i.herbLocalNames]
          : []

      return {
        id:             i.id,
        drugName:       i.drugName,
        drugClass:      i.drugClass,
        herbName:       i.herbName,
        herbScientific: i.herbScientific,
        herbLocalNames,
        severity:       i.severity,
        mechanism:      i.mechanism,
        effect:         i.effect,
        advice:         i.advice,
        evidenceLevel:  i.evidenceLevel,
        source:         i.source,
        confirmedCount: i.confirmedCount,
        disputedCount:  i.disputedCount,
        reportedCount:  i.reportedCount,
        feedbackCount:  i.feedback.length,
      }
    })

    // Identify which drugs had zero results — these become gap signals
    const foundDrugs = new Set(
      matchingInteractions.flatMap(i => {
        const aliases = Array.isArray(i.drugAliases)
          ? i.drugAliases
          : typeof i.drugAliases === 'string'
            ? [i.drugAliases]
            : []

        return [i.drugName, ...aliases.map(a => a.toLowerCase())]
      })
    )
    const missingDrugs = normalisedDrugs.filter(drug =>
      !foundDrugs.has(drug) &&
      !matchingInteractions.some(i =>
        i.drugName.includes(drug) || drug.includes(i.drugName)
      )
    )

    // Log the query for the gap report (fire-and-forget — don't block the response)
    prisma.interactionQuery.create({
      data: {
        userId:       userId ?? null,
        sessionId:    sessionId ?? null,
        drugs:        JSON.stringify(normalisedDrugs),
        herbs:        herbs ?? [],
        resultCount:  results.length,
        hadMissingDrug: missingDrugs.length > 0,
        missingDrugs: JSON.stringify(missingDrugs),
      },
    }).catch(err => console.error('[InteractionQuery log]', err))

    return ok({ results, missingDrugs, totalFound: results.length })
  } catch (e) { return serverError(e) }
}
