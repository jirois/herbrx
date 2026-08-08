import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import type { Prisma }  from '@prisma/client'
import { requireAuth, ok, serverError } from '@/lib/api-helpers'

// GET /api/dashboard/admin/compliance
// Lists ProducerProfiles for the Admin Compliance queue.
// Query params:
//   status  — 'PENDING' (default, = SUBMITTED + UNDER_REVIEW) | 'ALL' | any VerificationStatus value
//   search  — matches business name, RC number, or producer email
export async function GET(req: NextRequest) {
  const { error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    const url    = new URL(req.url)
    const status = url.searchParams.get('status') ?? 'PENDING'
    const search = url.searchParams.get('search')

    const statusWhere: Prisma.ProducerProfileWhereInput =
      status === 'ALL'
        ? {}
        : status === 'PENDING'
          ? { OR: [{ verificationStatus: 'SUBMITTED' }, { verificationStatus: 'UNDER_REVIEW' }] }
          : { verificationStatus: status as 'UNVERIFIED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' }

    const searchWhere: Prisma.ProducerProfileWhereInput = search ? {
      OR: [
        { businessName: { contains: search } },
        { rcNumber:     { contains: search } },
        { businessEmail: { contains: search } },
        { user: { email: { contains: search } } },
      ],
    } : {}

    const where: Prisma.ProducerProfileWhereInput = { ...statusWhere, ...searchWhere }

    const [profiles, allForCounts] = await Promise.all([
      prisma.producerProfile.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, createdAt: true } },
          _count: { select: { products: true } },
        },
        orderBy: [
          { submittedAt: 'desc' },
          { updatedAt: 'desc' },
        ],
      }),
      // Unfiltered-by-status snapshot (still respects search) so KPI counts stay stable across tabs
      prisma.producerProfile.findMany({
        where: { ...searchWhere },
        select: { verificationStatus: true },
      }),
    ])

    const shaped = profiles.map(p => ({
      id:                 p.id,
      producerUserId:     p.userId,
      businessName:       p.businessName,
      businessEmail:      p.businessEmail,
      businessPhone:      p.businessPhone,
      rcNumber:           p.rcNumber,
      nafdacNumber:       p.nafdacNumber,
      state:              p.state,
      website:            p.website,
      tier:               p.tier,
      verificationStatus: p.verificationStatus,
      verificationNote:   p.verificationNote,
      submittedAt:        p.submittedAt,
      verifiedAt:         p.verifiedAt,
      createdAt:          p.createdAt,
      updatedAt:          p.updatedAt,
      documents: {
        cacCertUrl:    p.cacCertUrl,
        labPartnerUrl: p.labPartnerUrl,
        nafdacCertUrl: p.nafdacCertUrl,
        insuranceUrl:  p.insuranceUrl,
      },
      productCount: p._count.products,
      contact: {
        name:      `${p.user.firstName} ${p.user.lastName}`.trim(),
        email:     p.user.email,
        phone:     p.user.phone,
        joinedAt:  p.user.createdAt,
      },
    }))

    const counts = {
      pending:  allForCounts.filter(p => ['SUBMITTED', 'UNDER_REVIEW'].includes(p.verificationStatus)).length,
      approved: allForCounts.filter(p => p.verificationStatus === 'APPROVED').length,
      rejected: allForCounts.filter(p => p.verificationStatus === 'REJECTED').length,
      total:    allForCounts.length,
    }

    return ok({ producers: shaped, counts })
  } catch (e) {
    return serverError(e)
  }
}
