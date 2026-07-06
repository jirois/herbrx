import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'

// Minimal user shape expected on session.user
interface SessionUser { id: string }
import { requireAuth, ok, created, badRequest, serverError } from '@/lib/api-helpers'
import { notFound } from 'next/navigation'

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
        // lifecycle independently of the marketplace-selling tier.
        verificationStatus: true,
        verificationNote:   true,
        submittedAt:        true,
        cacCertUrl:          true,
        labPartnerUrl:       true,
        nafdacCertUrl:       true,
        insuranceUrl:        true,
        state:               true,
        website:             true,
      },
    })

    if (!profile) {
      return ok({ status: 'UNVERIFIED', profile: null })
    }

    return ok({
      status:  profile.verificationStatus,
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
      rcNumber, nafdacNumber, state, website,
      cacCertUrl, labPartnerUrl, nafdacUrl, insuranceUrl,
    } = body

    if (!businessName || !businessEmail || !businessPhone || !rcNumber) {
      return badRequest('businessName, businessEmail, businessPhone, and rcNumber are required')
    }
    const data = {
      businessName, businessEmail, businessPhone, rcNumber, nafdacNumber,
      state, website,
      cacCertUrl:    cacCertUrl    || null,
      labPartnerUrl: labPartnerUrl || null,
      nafdacCertUrl: nafdacUrl     || null,
      insuranceUrl:  insuranceUrl  || null,
      verificationStatus: 'SUBMITTED' as const,
      submittedAt:   new Date(),
    }


    const profile = await prisma.producerProfile.upsert({
      where:  { userId },
      update: data,
      create: { userId, ...data },
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

    return created({ profile, status: profile.verificationStatus })
  } catch (e) {
    return serverError(e)
  }
}

// PATCH /api/dashboard/producer/verification
// Admin-only: approve or reject a pending verification application.
// Body: { producerUserId, decision: 'APPROVED'|'REJECTED'|'UNDER_REVIEW', note? }
export async function PATCH(req: NextRequest) {
  const {session, error} = await requireAuth(req, ['ADMIN'])
  if(error) return error

  try {
    const adminId = (session!.user as SessionUser).id
    const body   = await req.json()
    const {producerUserId, decision, note} = body
    
    if (!producerUserId || !decision){
      return badRequest('ProducerUserId and decision are required')
    }
    if (!['APPROVED', 'REJECTED', 'UNDER_REVIEW'].includes(decision)){
     return badRequest('decision must be APPROVED, REJECTED, or UNDER_REVIEW') 
    }
    const profile = await prisma.producerProfile.findUnique({where: {userId: producerUserId}})
    if (!profile) return notFound()
    
    const updated = await prisma.producerProfile.update({
      where: {userId: producerUserId},
      data: {
        verificationStatus: decision,
        verificationNote: note ?? null,
        ...(decision === 'APPROVED' ? {
          tier:     'VERIFIED',
          verifiedAt: new Date(),
          verifiedBy: adminId
        }: {})
      }
    })

    await prisma.adminAction.create({
      data: {
        adminId,
        action:        `VERIFICATION_${decision}`,
        targetType:     'User',
        targetId:       producerUserId,
        reason:     note ?? null
      }
    })

    return ok({ profile: updated})
  } catch (e) {
    return serverError(e)
    
  }
}