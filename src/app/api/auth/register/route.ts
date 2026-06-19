import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma }   from '@/lib/prisma'
import { createOtp } from '@/lib/otp'
import { sendVerificationEmail } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password, phone } = await req.json()

    if (!firstName?.trim() || !lastName?.trim())
      return NextResponse.json({ error:'First and last name are required' }, { status:400 })
    if (!email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return NextResponse.json({ error:'A valid email address is required' }, { status:400 })
    if (!password || password.length < 8)
      return NextResponse.json({ error:'Password must be at least 8 characters' }, { status:400 })

    const normalEmail = email.toLowerCase().trim()
    const existing    = await prisma.user.findUnique({ where:{ email:normalEmail } })

    if (existing) {
      if (!existing.emailVerified) {
        const code = await createOtp(existing.id, 'EMAIL_VERIFICATION')
        await sendVerificationEmail({ to:normalEmail, firstName:existing.firstName, code })
        return NextResponse.json({ success:true, userId:existing.id, needsVerification:true, message:'A new verification code has been sent.' })
      }
      return NextResponse.json({ error:'An account with this email already exists.' }, { status:409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data:{ email:normalEmail, firstName:firstName.trim(), lastName:lastName.trim(), phone:phone?.trim()||null, passwordHash, emailVerified:false }
    })

    const code = await createOtp(user.id, 'EMAIL_VERIFICATION')
    await sendVerificationEmail({ to:normalEmail, firstName:user.firstName, code })

    return NextResponse.json({ success:true, userId:user.id, needsVerification:true, message:`Verification code sent to ${normalEmail}` })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed.'
    console.error('[Register]', err)
    return NextResponse.json({ error: message }, { status:500 })
  }
}
