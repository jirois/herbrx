import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'

// Minimal user shape expected on session.user
interface SessionUser { id: string }
import { requireAuth, ok, created, badRequest, serverError,notFound } from '@/lib/api-helpers'
import { EMAIL_RE, NG_PHONE_RE } from '@/lib/vaildation'

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
    if (businessName.trim().length < 2 || businessName.trim().length > 150) {
      return badRequest('businessName must be between 2 and 150 characters')
    }
    if (!EMAIL_RE.test(businessEmail.trim())) {
      return badRequest('businessEmail must be a valid email address')
    }
    if (!NG_PHONE_RE.test(businessPhone.replace(/[\s-]/g, ''))) {
      return badRequest('businessPhone must be a valid Nigerian phone number')
    }
    if (rcNumber.trim().length < 2 || rcNumber.trim().length > 40) {
      return badRequest('rcNumber must be between 2 and 40 characters')
    }
    if (website && !/^https?:\/\/.+/.test(website.trim())) {
      return badRequest('website must be a valid URL starting with http:// or https://')
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
    const profile = await prisma.producerProfile.findUnique({where: {userId: producerUserId},
    include: {user: {select: {email: true, firstName: true}}}
    })
    
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

    // Notify the producer by email (fire-and-forget — don't block the response)
    const producerEmail = profile.user?.email
    const producerName  = profile.user?.firstName ?? 'there'
    if (producerEmail) {
      import('@/lib/mailer').then(({ sendVerificationStatusEmail }) => {
        sendVerificationStatusEmail({
          to:           producerEmail,
          firstName:    producerName,
          businessName: profile.businessName,
          decision:     decision as 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW',
          note:         note ?? undefined,
        }).catch(err => console.error('[VerificationStatus Email]', err))
      }).catch(() => {})
    }


    return ok({ profile: updated})
  } catch (e) {
    return serverError(e)
    
  }
}