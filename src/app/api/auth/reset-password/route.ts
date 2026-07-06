import { NextRequest, NextResponse } from 'next/server'
import { prisma }    from '@/lib/prisma'
import { verifyOtp } from '@/lib/otp'
import bcrypt        from 'bcryptjs'

// POST /api/auth/reset-password
// Body: { userId, code, newPassword }
export async function POST(req: NextRequest) {
  try {
    const { userId, code, newPassword } = await req.json()

    if (!userId || !code || !newPassword) {
      return NextResponse.json(
        { error: 'userId, code, and newPassword are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // Throws descriptive error on wrong code, expired, too many attempts
    await verifyOtp(userId, code, 'PASSWORD_RESET')

    const passwordHash = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: userId },
      data:  { passwordHash, emailVerified: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. You can now sign in.',
    })
  } catch (err: unknown) {
    console.error('[ResetPassword]', err)
    const errorMessage = err instanceof Error ? err.message : 'Password reset failed'
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}
