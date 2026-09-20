import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import {  ok, serverError, badRequest } from '@/lib/api-helpers'
import { getServerSession } from 'next-auth'
import { authOptions }  from '@/lib/auth'
import { findClosestMatch } from '@/lib/fuzzy-match'
import { parseJsonArray } from '@/lib/json-field'

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

// Explicit shape rather than deriving from `ReturnType<typeof prisma...>` —
// keeps this file's typing stable regardless of Prisma client generation.
interface InteractionRow {
  id: string
  drugName: string
  drugAliases: unknown
  drugClass: string | null
  rxCui: string | null
  herbName: string
  herbScientific: string | null
  herbAliases: unknown
  herbLocalNames: unknown
  severity: string
  mechanism: string | null
  mechanismTypes: unknown
  affectedPathways: unknown
  effect: string
  advice: string
  evidenceLevel: string
  herbDosageThresholdMg: number | null
  drugDosageThresholdMg: number | null
  formulationContext: unknown
  source: string
  confirmedCount: number
  disputedCount: number
  reportedCount: number
  feedback: unknown[]
}

function drugCandidates(i: InteractionRow): string[] {
  return [i.drugName, ...parseJsonArray(i.drugAliases)]
}
function herbCandidates(i: InteractionRow): string[] {
  return [
    i.herbName,
    ...parseJsonArray(i.herbAliases),
    ...parseJsonArray(i.herbLocalNames),
  ]
}

// Exact or substring match, either direction — catches "aspirin" vs "aspirin
// 100mg", brand vs generic (via aliases), and most partial typing.
function looseMatches(input: string, candidates: string[]): boolean {
  return candidates.some(c => {
    const norm = c.toLowerCase().trim()
    return norm === input || norm.includes(input) || input.includes(norm)
  })
}

const SEVERITY_ORDER: Record<string, number> = {
  CONTRAINDICATED: 0, DANGER: 1, WARNING: 2, INFO: 3, BENEFICIAL: 4,
}

// POST /api/dashboard/customer/interactions
// Body: { drugs: string[], herbs?: string[], sessionId?: string }
//
// The core query engine:
//   1. Normalises drug/herb names (lowercase, trim)
//   2. Matches in three tiers per name: exact/alias, substring (either
//      direction), then — only if NEITHER of those found anything at all —
//      a Levenshtein-distance fuzzy match against every known name/alias,
//      to tolerate typos without ever overriding a real substring match.
//   3. If a herb filter is provided, restricts results to those herbs
//   4. Attaches per-result feedback counts and the full clinical metadata
//      (mechanism types, affected CYP/P-gp pathways, dosage thresholds,
//      formulation context, RxNorm CUI where known)
//   5. Logs the query — including any still-missing names after all three
//      tiers — to power the admin gap report
export async function POST(req: NextRequest) {
  try {
    const session  = await getServerSession(authOptions)
    const userId   = session?.user ? (session.user as { id?: string }).id : null
    const body     = await req.json()
    const { drugs, herbs, sessionId } = body

    if (!Array.isArray(drugs) || drugs.length === 0) {
      return badRequest('drugs must be a non-empty array')
    }

    const normalisedDrugs = [...new Set(drugs.map((d: string) => d.toLowerCase().trim()))]
    const normalisedHerbs = herbs && herbs.length > 0
      ? [...new Set((herbs as string[]).map(h => h.toLowerCase().trim()))]
      : []

    // Table is small enough (low hundreds of rows) that fetching everything
    // published and matching in-memory is simpler and more flexible than
    // trying to express fuzzy matching as a DB query — this is what makes
    // the fuzzy fallback tier possible at all, since it needs to compare
    // against the full universe of known names, not just a pre-filtered
    // subset. Revisit with a proper search index if this table grows to
    // tens of thousands of rows.
    const allInteractions = await prisma.drugHerbInteraction.findMany({
      where: { isPublished: true },
      include: { feedback: { select: { id: true, type: true } } },
    }) as InteractionRow[]

    const allDrugNames = [...new Set(allInteractions.flatMap(drugCandidates))]
    const allHerbNames = [...new Set(allInteractions.flatMap(herbCandidates))]

    // Resolve each input drug/herb name to the tier it matched at, trying
    // loose matching first and only falling back to fuzzy if loose found
    // nothing for that specific name.
    const fuzzyCorrections: { input: string; matchedAs: string; type: 'drug' | 'herb' }[] = []

    function resolveDrug(input: string): { matched: boolean; effectiveTerm: string } {
      if (looseMatches(input, allDrugNames)) return { matched: true, effectiveTerm: input }
      const fuzzy = findClosestMatch(input, allDrugNames)
      if (fuzzy) {
        fuzzyCorrections.push({ input, matchedAs: fuzzy.match, type: 'drug' })
        return { matched: true, effectiveTerm: fuzzy.match.toLowerCase() }
      }
      return { matched: false, effectiveTerm: input }
    }
    function resolveHerb(input: string): { matched: boolean; effectiveTerm: string } {
      if (looseMatches(input, allHerbNames)) return { matched: true, effectiveTerm: input }
      const fuzzy = findClosestMatch(input, allHerbNames)
      if (fuzzy) {
        fuzzyCorrections.push({ input, matchedAs: fuzzy.match, type: 'herb' })
        return { matched: true, effectiveTerm: fuzzy.match.toLowerCase() }
      }
      return { matched: false, effectiveTerm: input }
    }

    const drugResolutions = normalisedDrugs.map(d => ({ input: d, ...resolveDrug(d) }))
    const herbResolutions = normalisedHerbs.map(h => ({ input: h, ...resolveHerb(h) }))

    const effectiveDrugTerms = drugResolutions.filter(r => r.matched).map(r => r.effectiveTerm)
    const effectiveHerbTerms = herbResolutions.filter(r => r.matched).map(r => r.effectiveTerm)

    const matchingInteractions = allInteractions.filter(interaction => {
      const matchesDrug = effectiveDrugTerms.some(term => looseMatches(term, drugCandidates(interaction)))
      if (!matchesDrug) return false
      // Check whether the user asked for specific herbs at all — NOT
      // whether any of them successfully resolved. Using
      // effectiveHerbTerms.length here was the bug: if someone typed a
      // herb that failed to resolve, effectiveHerbTerms went empty and
      // this silently fell through to "match every herb for this drug",
      // ignoring the herb filter entirely and returning results for
      // completely unrelated herbs the person never asked about.
      if (normalisedHerbs.length > 0) {
        return effectiveHerbTerms.some(term => looseMatches(term, herbCandidates(interaction)))
      }
      return true
    })

    matchingInteractions.sort((a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99)
    )

    const results = matchingInteractions.map(i => ({
      id:                    i.id,
      drugName:              i.drugName,
      drugClass:             i.drugClass,
      rxCui:                 i.rxCui,
      herbName:              i.herbName,
      herbScientific:        i.herbScientific,
      herbAliases:           parseJsonArray(i.herbAliases),
      herbLocalNames:        parseJsonArray(i.herbLocalNames),
      severity:              i.severity,
      mechanism:             i.mechanism,
      mechanismTypes:        parseJsonArray(i.mechanismTypes),
      affectedPathways:      parseJsonArray(i.affectedPathways),
      effect:                i.effect,
      advice:                i.advice,
      evidenceLevel:         i.evidenceLevel,
      herbDosageThresholdMg: i.herbDosageThresholdMg,
      drugDosageThresholdMg: i.drugDosageThresholdMg,
      formulationContext:    parseJsonArray(i.formulationContext),
      source:                i.source,
      confirmedCount:        i.confirmedCount,
      disputedCount:         i.disputedCount,
      reportedCount:         i.reportedCount,
      feedbackCount:         i.feedback.length,
    }))

    // Anything that didn't resolve at ANY tier (loose or fuzzy) is a real
    // gap — not just a typo we could catch.
    const missingDrugs = drugResolutions.filter(r => !r.matched).map(r => r.input)
    const missingHerbs = herbResolutions.filter(r => !r.matched).map(r => r.input)

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
    }).catch((err: unknown) => console.error('[InteractionQuery log]', err))

    return ok({ results, missingDrugs, missingHerbs, fuzzyCorrections, totalFound: results.length })
  } catch (e) { return serverError(e) }
}
