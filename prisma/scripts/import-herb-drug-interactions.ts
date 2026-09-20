// Standalone re-run of the basic interaction CSV import, for when you don't
// want to run the full seed. This now also runs automatically as part of
// `npx prisma db seed` (see prisma/seed.ts) — use this script only for an
// ad-hoc re-import of just this one file.
//
// Run with:
//   npx tsx prisma/scripts/import-herb-drug-interactions.ts

import 'dotenv/config'
import { join } from 'path'
import { prisma } from '../../src/lib/prisma'
import { importBasicInteractionsCsv } from './lib/import-basic-interactions'

async function main() {
  const result = await importBasicInteractionsCsv(
    prisma, join(__dirname, '..', 'data', 'herb-drug-interactions-clean.csv'),
  )
  console.log(`Basic CSV: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped (of ${result.total})`)
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1 })
  .finally(async () => { await prisma.$disconnect() })
