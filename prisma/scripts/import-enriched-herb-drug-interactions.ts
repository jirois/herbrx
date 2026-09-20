// Standalone re-run of the enriched interaction CSV import (RxCUI, CYP450/
// P-gp pathways, dosage thresholds, formulation context). This also runs
// automatically as part of `npx prisma db seed` (see prisma/seed.ts) — use
// this script only for an ad-hoc re-import of just this one file.
//
// Run with:
//   npx tsx prisma/scripts/import-enriched-herb-drug-interactions.ts

import 'dotenv/config'
import { join } from 'path'
import { prisma } from '../../src/lib/prisma'
import { importEnrichedInteractionsCsv } from './lib/import-enriched-interactions'

async function main() {
  const result = await importEnrichedInteractionsCsv(
    prisma, join(__dirname, '..', 'data', 'herb-drug-interactions-enriched.csv'),
  )
  console.log(`Enriched CSV: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped (of ${result.total})`)
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1 })
  .finally(async () => { await prisma.$disconnect() })
