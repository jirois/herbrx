import type { prisma as PrismaSingleton } from '@/lib/prisma'
import { readFileSync } from 'fs'
import { parseCsv, splitPipeList } from './csv-parse'

type PrismaClientType = typeof PrismaSingleton

const SEVERITY_MAP: Record<string, 'CONTRAINDICATED' | 'DANGER' | 'WARNING'> = {
  contraindicated: 'CONTRAINDICATED',
  high: 'DANGER',
  medium: 'WARNING',
}

const KNOWN_MECHANISM_TYPES = new Set([
  'CYP450_INDUCTION', 'CYP450_INHIBITION', 'PGP_INDUCTION', 'PGP_INHIBITION', 'PHARMACODYNAMIC',
])

const EXPECTED_HEADER = 'herb_common_name,herb_scientific_name,herb_aliases,drug_generic_name,rx_cui,drug_aliases,severity,mechanism_type,affected_pathways,herb_dosage_threshold_mg_day,drug_dosage_threshold_mg_day,formulation_context,clinical_effect,management_recommendation'

function toFloatOrNull(v: string | undefined): number | null {
  if (!v || !v.trim()) return null
  const n = Number(v.trim())
  return Number.isFinite(n) ? n : null
}

export async function importEnrichedInteractionsCsv(prisma: PrismaClientType, csvPath: string) {
  const csvText = readFileSync(csvPath, 'utf-8')
  const rows = parseCsv(csvText)
  const [header, ...dataRows] = rows

  if (header.join(',') !== EXPECTED_HEADER) {
    throw new Error(`Unexpected enriched-CSV header: ${header.join(',')}`)
  }

  let created = 0, updated = 0, skipped = 0

  for (const cols of dataRows) {
    const [
      herbCommonName, herbScientificName, herbAliasesRaw,
      drugGenericName, rxCui, drugAliasesRaw,
      severityRaw, mechanismTypeRaw, affectedPathwaysRaw,
      herbDoseRaw, drugDoseRaw, formulationRaw,
      clinicalEffect, managementRecommendation,
    ] = cols

    if (!herbCommonName || !drugGenericName || !severityRaw || !clinicalEffect || !managementRecommendation) {
      skipped++; continue
    }

    const severity = SEVERITY_MAP[severityRaw.trim().toLowerCase()]
    if (!severity) { skipped++; continue }

    const mechanismTypes = splitPipeList(mechanismTypeRaw).map(m =>
      KNOWN_MECHANISM_TYPES.has(m) ? m : 'OTHER'
    )

    const herbName = herbCommonName.trim()
    const drugName = drugGenericName.trim().toLowerCase()

    const data = {
      severity,
      mechanism: clinicalEffect,
      mechanismTypes,
      affectedPathways: splitPipeList(affectedPathwaysRaw),
      effect: clinicalEffect,
      advice: managementRecommendation,
      evidenceLevel: 'MODERATE' as const,
      herbScientific: herbScientificName?.trim() || null,
      herbAliases: splitPipeList(herbAliasesRaw),
      drugAliases: splitPipeList(drugAliasesRaw),
      rxCui: rxCui?.trim() || null,
      herbDosageThresholdMg: toFloatOrNull(herbDoseRaw),
      drugDosageThresholdMg: toFloatOrNull(drugDoseRaw),
      formulationContext: splitPipeList(formulationRaw),
      source: 'CSV_IMPORT_ENRICHED_2026',
      isPublished: true,
    }

    try {
      const existing = await prisma.drugHerbInteraction.findUnique({
        where: { drugName_herbName: { drugName, herbName } },
      })
      await prisma.drugHerbInteraction.upsert({
        where:  { drugName_herbName: { drugName, herbName } },
        update: data,
        create: { drugName, herbName, herbLocalNames: [], references: [], ...data },
      })
      if (existing) {
        updated++
      } else {
        created++
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      console.log(`    ⚠ Failed ${drugName} × ${herbName}: ${message.slice(0, 80)}`)
      skipped++
    }
  }

  return { created, updated, skipped, total: dataRows.length }
}
