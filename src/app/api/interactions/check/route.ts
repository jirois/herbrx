import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ok, badRequest, serverError } from '@/lib/api-helpers'

// POST /api/interactions/check
//
// Body: { drugs: string[], sessionId?: string }
//
// Checks each medication name against the curated DrugHerbInteraction table
// (matching on drugName or any listed alias, case-insensitive) and logs the
// query to InteractionQuery — which is what powers the admin "Interaction
// Gaps" report, so real usage here feeds real signal there.
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const drugsInput: unknown = body.drugs
    const sessionId: string | undefined = body.sessionId

    if (!Array.isArray(drugsInput) || drugsInput.length === 0) {
      return badRequest('drugs must be a non-empty array of medication names')
    }
    const drugs = drugsInput
      .filter((d): d is string => typeof d === 'string' && d.trim().length > 0)
      .map(d => d.trim())
      .slice(0, 20) // reasonable cap

    if (drugs.length === 0) return badRequest('No valid drug names provided')

    const normalized = drugs.map(d => d.toLowerCase().trim())

    const allPublished = await prisma.drugHerbInteraction.findMany({
      where: { isPublished: true },
    })

    const resultsByDrug: Record<string, typeof allPublished> = {}
    const missingDrugs: string[] = []

    for (let i = 0; i < drugs.length; i++) {
      const original = drugs[i]
      const norm = normalized[i]
     const matches = allPublished.filter(row => {
  if (row.drugName.toLowerCase().trim() === norm) return true

  // Safely parse drugAliases whether it is a raw JSON array, a JSON string, or a comma-separated string
  let aliases: string[] = []
  const rawAliases = row.drugAliases

  if (Array.isArray(rawAliases)) {
    aliases = rawAliases as string[]
  } else if (typeof rawAliases === 'string') {
    try {
      const parsed = JSON.parse(rawAliases)
      if (Array.isArray(parsed)) {
        aliases = parsed
      } else {
        aliases = rawAliases.split(',').map(s => s.trim())
      }
    } catch {
      aliases = rawAliases.split(',').map(s => s.trim())
    }
  }

  return aliases.some(a => typeof a === 'string' && a.toLowerCase().trim() === norm)
})
      if (matches.length > 0) {
        resultsByDrug[original] = matches
      } else {
        missingDrugs.push(original)
      }
    }

    const resultCount = Object.values(resultsByDrug).reduce((s, arr) => s + arr.length, 0)
    const userId = (session?.user as { id?: string } | undefined)?.id ?? null

    await prisma.interactionQuery.create({
      data: {
        userId,
        sessionId: sessionId ?? null,
        drugs: JSON.stringify(drugs),
        resultCount,
        hadMissingDrug: missingDrugs.length > 0,
        missingDrugs: missingDrugs.length > 0 ? JSON.stringify(missingDrugs) : undefined,
      },
    })

    return ok({
      results: resultsByDrug,
      missingDrugs,
      resultCount,
    })
  } catch (e) {
    return serverError(e)
  }
}
