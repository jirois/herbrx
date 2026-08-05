import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, created, badRequest, notFound, serverError } from '@/lib/api-helpers'
import { EMAIL_RE } from '@/lib/vaildation'
import { generateTempPassword } from '@/lib/generate-credentials'

const SPECIALIZATIONS = ['HERBALIST', 'NATUROPATH', 'TOXICOLOGIST', 'PHARMACIST']


// GET /api/dashboard/admin/consultants?status=ACTIVE&search=
// List all consultants for the admin management table.
export async function GET(req: NextRequest) {
  const {  error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // ACTIVE | INACTIVE | ALL
    const search = searchParams.get('search')?.trim()

    const consultants = await prisma.consultantProfile.findMany({
      where: {
        ...(status && status !== 'ALL' ? { status: status as 'ACTIVE' | 'INACTIVE' } : {}),
        ...(search ? {
          user: {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { email: { contains: search } },
            ],
          },
        } : {}),
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, createdAt: true } },
        _count: { select: { consultations: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Aggregate rating + earnings per consultant in one pass rather than
    // N+1 queries per row.
    const ids = consultants.map(c => c.id)
    const stats = ids.length ? await prisma.consultation.groupBy({
      by: ['consultantId'],
      where: { consultantId: { in: ids }, status: 'COMPLETED' },
      _avg: { rating: true },
      _sum: { amount: true },
      _count: { _all: true },
    }) : []
    const statsMap = new Map(stats.map(s => [s.consultantId, s]))

    const shaped = consultants.map(c => {
      const s = statsMap.get(c.id)
      return {
        id: c.id,
        userId: c.userId,
        firstName: c.user.firstName,
        lastName: c.user.lastName,
        email: c.user.email,
        phone: c.user.phone,
        specialization: c.specialization,
        bio: c.bio,
        licenseNumber: c.licenseNumber,
        yearsExperience: c.yearsExperience,
        avatarUrl: c.avatarUrl,
        status: c.status,
        mustResetPassword: c.mustResetPassword,
        totalConsultations: c._count.consultations,
        completedConsultations: s?._count._all ?? 0,
        avgRating: s?._avg.rating ?? null,
        totalEarningsKobo: s?._sum.amount ?? 0,
        createdAt: c.createdAt,
        deactivatedAt: c.deactivatedAt,
      }
    })

    return ok({ consultants: shaped, total: shaped.length })
  } catch (e) {
    return serverError(e)
  }
}

// POST /api/dashboard/admin/consultants
// Body: { firstName, lastName, email, phone?, specialization, bio?, licenseNumber?, yearsExperience? }
// Creates the User (role=CONSULTANT) + ConsultantProfile together and
// returns the generated temp password ONCE — it is never retrievable again,
// same as any sane "invite" flow. Admin must hand it to the consultant
// out-of-band.
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    const adminId = (session!.user as { id: string }).id
    const body = await req.json()
    const {
      firstName, lastName, email, phone,
      specialization, bio, licenseNumber, yearsExperience,
    } = body

    if (!firstName || !lastName || !email || !specialization) {
      return badRequest('firstName, lastName, email, and specialization are required')
    }
    if (!EMAIL_RE.test(String(email).trim())) {
      return badRequest('A valid email address is required')
    }
    if (!SPECIALIZATIONS.includes(specialization)) {
      return badRequest(`specialization must be one of: ${SPECIALIZATIONS.join(', ')}`)
    }

    const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
    if (existing) return badRequest('A user with this email already exists')

    const tempPassword = generateTempPassword()
    const passwordHash = await bcrypt.hash(tempPassword, 10)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName, lastName,
          email: email.trim().toLowerCase(),
          phone: phone || null,
          passwordHash,
          role: 'CONSULTANT',
          emailVerified: true, // admin-provisioned — skip the usual OTP flow
        },
      })
      const profile = await tx.consultantProfile.create({
        data: {
          userId: user.id,
          specialization,
          bio: bio || null,
          licenseNumber: licenseNumber || null,
          yearsExperience: yearsExperience ? Number(yearsExperience) : null,
          status: 'ACTIVE',
          mustResetPassword: true,
          createdBy: adminId,
        },
      })
      return { user, profile }
    })

    await prisma.adminAction.create({
      data: {
        adminId,
        action: 'CONSULTANT_CREATED',
        targetType: 'User',
        targetId: result.user.id,
        reason: `Created consultant account for ${firstName} ${lastName} (${specialization})`,
      },
    }).catch(() => {})

    return created({
      consultant: {
        id: result.profile.id,
        userId: result.user.id,
        firstName, lastName, email: result.user.email, specialization,
      },
      // Shown once in the admin UI — copy-to-clipboard, then gone.
      credentials: { email: result.user.email, tempPassword },
    })
  } catch (e) {
    return serverError(e)
  }
}

// PATCH /api/dashboard/admin/consultants
// Body: { consultantId, ...fields to update }
// Handles both profile edits and activate/deactivate in one endpoint since
// they're both "admin edits a consultant record" — deactivate is just
// status: 'INACTIVE' with a note.
export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    const adminId = (session!.user as { id: string }).id
    const body = await req.json()
    const {
      consultantId, specialization, bio, licenseNumber, yearsExperience,
      status, deactivationNote, firstName, lastName, phone,
    } = body

    if (!consultantId) return badRequest('consultantId is required')
    if (specialization && !SPECIALIZATIONS.includes(specialization)) {
      return badRequest(`specialization must be one of: ${SPECIALIZATIONS.join(', ')}`)
    }
    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      return badRequest('status must be ACTIVE or INACTIVE')
    }

    const profile = await prisma.consultantProfile.findUnique({ where: { id: consultantId } })
    if (!profile) return notFound('Consultant not found')

    const updated = await prisma.consultantProfile.update({
      where: { id: consultantId },
      data: {
        ...(specialization ? { specialization } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(licenseNumber !== undefined ? { licenseNumber } : {}),
        ...(yearsExperience !== undefined ? { yearsExperience: yearsExperience ? Number(yearsExperience) : null } : {}),
        ...(status ? {
          status,
          ...(status === 'INACTIVE'
            ? { deactivatedAt: new Date(), deactivatedBy: adminId, deactivationNote: deactivationNote || null }
            : { deactivatedAt: null, deactivatedBy: null, deactivationNote: null }),
        } : {}),
      },
    })

    if (firstName || lastName || phone !== undefined) {
      await prisma.user.update({
        where: { id: profile.userId },
        data: {
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
          ...(phone !== undefined ? { phone } : {}),
        },
      })
    }

    await prisma.adminAction.create({
      data: {
        adminId,
        action: status ? `CONSULTANT_${status}` : 'CONSULTANT_UPDATED',
        targetType: 'User',
        targetId: profile.userId,
        reason: deactivationNote || null,
      },
    }).catch(() => {})

    return ok({ consultant: updated })
  } catch (e) {
    return serverError(e)
  }
}
