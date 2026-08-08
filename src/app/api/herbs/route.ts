import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, serverError } from '@/lib/api-helpers'

// GET /api/herbs
export async function GET(req: NextRequest) {
  try {
    const herbs = await prisma.herb.findMany({
      where: { isPublished: true },
      orderBy: { name: 'asc' },
    })

    return ok({ herbs })
  } catch (e) {
    return serverError(e)
  }
}