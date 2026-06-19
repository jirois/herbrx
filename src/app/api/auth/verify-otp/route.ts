import { NextRequest, NextResponse } from 'next/server'
import { prisma }      from '@/lib/prisma'
import { verifyOtp }   from '@/lib/otp'
import { sendWelcomeEmail } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const { userId, code } = await req.json()

    if (!userId || !code)
      return NextResponse.json({ error:'User ID and code are required' }, { status:400 })

    const user = await prisma.user.findUnique({ where:{ id:userId } })
    if (!user)
      return NextResponse.json({ error:'User not found' }, { status:404 })

    if (user.emailVerified)
      return NextResponse.json({ success:true, message:'Email already verified' })

    // Throws descriptive error on failure
    await verifyOtp(userId, code, 'EMAIL_VERIFICATION')

    // Mark verified
    await prisma.user.update({
      where: { id:userId },
      data:  { emailVerified:true },
    })

    // Send welcome email (non-blocking)
    sendWelcomeEmail({ to:user.email, firstName:user.firstName }).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now sign in.',
    })
  } catch (err: unknown) {
    console.error('[VerifyOTP]', err)
    const message = err instanceof Error ? err.message : 'Verification failed'
    return NextResponse.json({ error: message }, { status:400 })
  }
}
