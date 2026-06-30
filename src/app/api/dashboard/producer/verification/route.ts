import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'

// Minimal user shape expected on session.user
interface SessionUser { id: string }
import { requireAuth, ok, created, badRequest, serverError } from '@/lib/api-helpers'

// GET /api/dashboard/producer/verification
export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['PRODUCER', 'ADMIN'])
  if (error) return error

  try {
    const userId = (session!.user as SessionUser).id

    const profile = await prisma.producerProfile.findUnique({
      where: { userId },
      select: {
        id: true, businessName: true, businessEmail: true,
        businessPhone: true, rcNumber: true, nafdacNumber: true,
        tier: true, verifiedAt: true,
      },
    })

    if (!profile) {
      return ok({ status: 'UNVERIFIED', profile: null })
    }

    return ok({
      status:  profile.tier === 'VERIFIED' ? 'APPROVED' : 'UNVERIFIED',
      profile,
    })
  } catch (e) {
    return serverError(e)
  }
}

// POST /api/dashboard/producer/verification
// Submit a verification application (upserts ProducerProfile with business details)
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['PRODUCER', 'ADMIN'])
  if (error) return error

  try {
    const userId = (session!.user as SessionUser).id
    const body   = await req.json()

    const {
      businessName, businessEmail, businessPhone,
      rcNumber, nafdacNumber, address, state,
      website, yearFounded, employeeRange, description,
      // Document URLs — upload handled client-side to storage (e.g. Cloudinary / S3)
      cacCertUrl, labPartnerUrl, nafdacUrl, insuranceUrl,
    } = body

    if (!businessName || !businessEmail || !businessPhone || !rcNumber) {
      return badRequest('businessName, businessEmail, businessPhone, and rcNumber are required')
    }

    const profile = await prisma.producerProfile.upsert({
      where:  { userId },
      update: { businessName, businessEmail, businessPhone, rcNumber, nafdacNumber },
      create: { userId, businessName, businessEmail, businessPhone, rcNumber, nafdacNumber },
    })

    // Log submission as an admin audit action
    await prisma.adminAction.create({
      data: {
        adminId:    userId,
        action:     'VERIFICATION_SUBMITTED',
        targetType: 'User',
        targetId:   userId,
        reason:     `Verification application submitted for ${businessName}`,
      },
    }).catch(() => {})

    return created({ profile, status: 'SUBMITTED' })
  } catch (e) {
    return serverError(e)
  }
}
