import { NextRequest, NextResponse } from 'next/server'
import { prisma }      from '@/lib/prisma'
import { createOtp }   from '@/lib/otp'
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const { userId, email, purpose = 'EMAIL_VERIFICATION' } = await req.json()

    let user
    if (userId) {
      user = await prisma.user.findUnique({ where:{ id:userId } })
    } else if (email) {
      user = await prisma.user.findUnique({ where:{ email: email.toLowerCase().trim() } })
    }

    if (!user)
      return NextResponse.json({ error:'Account not found' }, { status:404 })

    const code = await createOtp(user.id, purpose)

    if (purpose === 'PASSWORD_RESET') {
      await sendPasswordResetEmail({ to:user.email, firstName:user.firstName, code })
    } else {
      await sendVerificationEmail({ to:user.email, firstName:user.firstName, code })
    }

    return NextResponse.json({ success:true, message:`Code sent to ${user.email}` })
  } catch (err: unknown) {
    console.error('[SendOTP]', err)
    const message = err instanceof Error ? err.message : 'Failed to send code'
    return NextResponse.json({ error: message }, { status:429 })
  }
}
