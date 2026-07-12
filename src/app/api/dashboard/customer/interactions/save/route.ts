import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAuth,  created, badRequest, serverError } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(req)
  if (error) return error
  try {
    const userId = (session!.user as { id: string }).id
    const body   = await req.json()
    const { medications } = body
    if (!Array.isArray(medications)) return badRequest('medications must be an array')
    await prisma.savedMedication.deleteMany({ where: { userId } })
    const saved = await Promise.all(
      medications.filter((m: string) => m?.trim()).map((name: string) =>
        prisma.savedMedication.create({ data: { userId, name: name.trim(), normalised: name.trim().toLowerCase() } })
      )
    )
    return created({ medications: saved, count: saved.length })
  } catch (e) { return serverError(e) }
}
