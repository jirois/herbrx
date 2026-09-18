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

    // This is the only password-change flow most consultants actually have
    // access to (there's no in-dashboard "change password" form yet, even
    // though the temporary-password banner tells them to use one). If we
    // don't also clear this here, a consultant who resets their temporary
    // password through the normal forgot-password flow keeps seeing "using
    // a temporary password" forever, even after picking a real one.
    await prisma.consultantProfile.updateMany({
      where: { userId },
      data:  { mustResetPassword: false },
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
