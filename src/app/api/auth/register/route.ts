import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma }   from '@/lib/prisma'
import { createOtp } from '@/lib/otp'
import { sendVerificationEmail } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password, phone, role='CUSTOMER',
      //Producer-only fields
      businessName, businessEmail, businessPhone, rcNumber,

     } = await req.json()

     // ── Validation ──

    if (!firstName?.trim() || !lastName?.trim())
      return NextResponse.json({ error:'First and last name are required' }, { status:400 })
    if (!email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return NextResponse.json({ error:'A valid email address is required' }, { status:400 })
    if (!password || password.length < 8)
      return NextResponse.json({ error:'Password must be at least 8 characters' }, { status:400 })
    if (!['CUSTOMER', 'PRODUCER'].includes(role))
      return NextResponse.json({error: "Invalid role"}, {status: 400})

    if (role === "PRODUCER" && !businessName?.trim())
      return NextResponse.json({error:"Business name is required for producers"}, {status: 400})

    const normalEmail = email.toLowerCase().trim()
    const passwordHash = await bcrypt.hash(password, 12)
    const existing    = await prisma.user.findUnique({ where:{ email:normalEmail } })

    if (existing) {
      if (!existing.emailVerified) {


        /**
         * The person hasn't verified yet, so this account isn't claimed
         * treat this submission as authoritative and sync role/business
         * details to what they just entered. Previously this branch
         * resent the OTP and left the original role/profile untouched, so
         * anyone who (re)submitted the form under an email that already had
         * a pending, unverified signup - e.g selection Producer after an
         * earlier abandoned Customer attempt, or simply double-submitting - 
         * silentely kept the "old" role matter what they picked this time
         */

        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: {id: existing.id},
            data: {
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              phone: phone?.trim() || null,
              passwordHash,
              role
            }
          })

          if (role === 'PRODUCER'){
            await tx.producerProfile.upsert({
             where: {userId: existing.id},
             create: {
              userId:    existing.id,
              businessName: businessName.trim(),
              businessEmail: businessEmail?.trim() || normalEmail,
              businessPhone: businessPhone?.trim() || phone?.trim() || null,
              rcNumber: rcNumber?.trim() || null,
              tier: 'UNVERIFIED'

             },
             update: {
                businessName:  businessName.trim(),
                businessEmail: businessEmail?.trim() || normalEmail,
                businessPhone: businessPhone?.trim() || phone?.trim() || null,
                rcNumber:      rcNumber?.trim() || null,
              },
            })
          } else {
            // Switched back to Customer - drop any producer profile from 
            // a prior unverified Producer attempt so it doesn't linger.
            await tx.producerProfile.deleteMany({where: {userId: existing.id}})
          }
        })
        const code = await createOtp(existing.id, 'EMAIL_VERIFICATION')
        await sendVerificationEmail({ to:normalEmail, firstName:existing.firstName, code })
        .catch(err => console.error('[Register] Failed to resend verification email:', err))
        return NextResponse.json({ success:true, userId:existing.id, role, needsVerification:true, message:'A new verification code has been sent.' })
      }
      return NextResponse.json({ error:'An account with this email already exists.' }, { status:409 })
      
    }

    
    // ── Create user + producer profile in a transaction ──
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email:    normalEmail,
          firstName:  firstName.trim(),
          lastName:   lastName.trim(),
          phone:      phone?.trim()  || null,
          passwordHash,
          emailVerified: false,
          role,
          
        }
      })

      // Auto-create ProducerProfile when registering as producer
      if (role === 'PRODUCER'){
        await tx.producerProfile.create({
          data: {
            userId:        newUser.id,
            businessName:  businessName.trim(),
            businessEmail: businessEmail?.trim() || normalEmail,
            businessPhone: businessPhone?.trim() || phone?.trim() || null,
            rcNumber:      rcNumber?.trim() || null,
            tier:          'UNVERIFIED',
          }
        })
      }

      return newUser
    })

    // const passwordHash = await bcrypt.hash(password, 12)
    // const user = await prisma.user.create({
    //   data:{ email:normalEmail, firstName:firstName.trim(), lastName:lastName.trim(), phone:phone?.trim()||null, passwordHash, emailVerified:false }
    // })

    const code = await createOtp(user.id, 'EMAIL_VERIFICATION')
    /**
     * 
     */
    await sendVerificationEmail({ to:normalEmail, firstName:user.firstName, code })
     .catch(err => console.error('[Register] Failed to send verification email:', err))
     
    return NextResponse.json({ success:true, userId:user.id, needsVerification:true, message:`Verification code sent to ${normalEmail}` })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed.'
    console.error('[Register]', err)
    return NextResponse.json({ error: message }, { status:500 })
  }
}
