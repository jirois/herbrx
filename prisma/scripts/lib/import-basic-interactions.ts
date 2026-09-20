import type { prisma as PrismaSingleton } from '@/lib/prisma'
import { readFileSync } from 'fs'
import { parseCsv } from './csv-parse'

type PrismaClientType = typeof PrismaSingleton

const SEVERITY_MAP: Record<string, 'DANGER' | 'WARNING' | 'INFO'> = {
  major: 'DANGER',
  moderate: 'WARNING',
  minor: 'INFO',
}

// "Ginkgo Biloba (Ginkgo biloba)" -> { name: "Ginkgo Biloba", scientific: "Ginkgo biloba" }
function splitHerbName(display: string): { name: string; scientific: string | null } {
  const m = display.match(/^(.*?)\s*\(([^)]+)\)\s*$/)
  if (!m) return { name: display.trim(), scientific: null }
  return { name: m[1].trim(), scientific: m[2].trim() }
}

export async function importBasicInteractionsCsv(prisma: PrismaClientType, csvPath: string) {
  const csvText = readFileSync(csvPath, 'utf-8')
  const rows = parseCsv(csvText)
  const [header, ...dataRows] = rows

  if (header.join(',') !== 'herb_display_name,drug_name,mechanism,severity,advice') {
    throw new Error(`Unexpected basic-CSV header: ${header.join(',')}`)
  }

  let created = 0, updated = 0, skipped = 0

  for (const cols of dataRows) {
    const [herbDisplay, drugRaw, mechanism, severityRaw, advice] = cols
    if (!herbDisplay || !drugRaw || !severityRaw || !advice) { skipped++; continue }

    const severity = SEVERITY_MAP[severityRaw.trim().toLowerCase()]
    if (!severity) { skipped++; continue }

    const { name: herbName, scientific: herbScientific } = splitHerbName(herbDisplay)
    const drugName = drugRaw.trim().toLowerCase()

    const data = {
      severity,
      mechanism: mechanism || null,
      effect: mechanism || advice, // source has one combined mechanism/effect column
      advice,
      evidenceLevel: 'MODERATE' as const,
      herbScientific,
      source: 'CSV_IMPORT_2026',
      isPublished: true,
    }

    try {
      const existing = await prisma.drugHerbInteraction.findUnique({
        where: { drugName_herbName: { drugName, herbName } },
      })
      await prisma.drugHerbInteraction.upsert({
        where:  { drugName_herbName: { drugName, herbName } },
        update: data,
        create: {
          drugName, herbName, drugAliases: [], herbAliases: [], herbLocalNames: [],
          mechanismTypes: [], affectedPathways: [], formulationContext: [], references: [],
          ...data,
        },
      })
      if (existing) {
        updated++
      } else {
        created++
      }
    } catch {
      skipped++
    }
  }

  return { created, updated, skipped, total: dataRows.length }
}
