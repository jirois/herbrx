import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { ConsultantProfile } from '@prisma/client'
import { ok, serverError } from '@/lib/api-helpers'

// GET /api/consultants?type=HERBALIST
// Public — browsing consultants shouldn't require login, only booking
// should. Replaces the static PRACTITIONERS arrays duplicated in
// booking-page.tsx and consultations-page.tsx.
export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get('type')

    const consultants = await prisma.consultantProfile.findMany({
      where: {
        status: 'ACTIVE',
        ...(type ? { specialization: type as ConsultantProfile['specialization'] } : {}), // look out
      },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'asc' },
    })

    const ids = consultants.map(c => c.id)
    const ratingAgg = ids.length ? await prisma.consultation.groupBy({
      by: ['consultantId'],
      where: { consultantId: { in: ids }, rating: { not: null } },
      _avg: { rating: true },
      _count: { rating: true },
    }) : []
    const ratingMap = new Map(ratingAgg.map(r => [r.consultantId, r]))

    return ok({
      consultants: consultants.map(c => {
        const r = ratingMap.get(c.id)
        return {
          id: c.id,
          name: `${c.user.firstName} ${c.user.lastName}`,
          type: c.specialization,
          bio: c.bio,
          licenseNumber: c.licenseNumber,
          yearsExperience: c.yearsExperience,
          avatarUrl: c.avatarUrl,
          rating: r?._avg.rating ?? null,
          reviewCount: r?._count.rating ?? 0,
        }
      }),
    })
  } catch (e) {
    return serverError(e)
  }
}
