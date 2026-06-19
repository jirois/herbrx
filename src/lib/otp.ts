import { prisma } from './prisma'

const OTP_EXPIRY_MINUTES = 10
const MAX_ATTEMPTS       = 5
const MAX_RESENDS        = 3
const RESEND_WINDOW_MS   = 15 * 60 * 1000 // 15 min

/** Generate a cryptographically random 6-digit code */
export function generateOtpCode(): string {
  // Use Web Crypto API (available in Node 18+)
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return String(array[0] % 1_000_000).padStart(6, '0')
}

/** Create and store a new OTP for a user, invalidating any previous ones */
export async function createOtp(userId: string, purpose: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'TWO_FACTOR') {
  // Rate-limit: max 3 OTP requests per 15 min window
  const recentCount = await prisma.otpCode.count({
    where: {
      userId,
      purpose,
      createdAt: { gte: new Date(Date.now() - RESEND_WINDOW_MS) },
    },
  })
  if (recentCount >= MAX_RESENDS) {
    throw new Error('Too many OTP requests. Please wait 15 minutes before requesting again.')
  }

  // Invalidate all previous unused OTPs for this purpose
  await prisma.otpCode.updateMany({
    where: { userId, purpose, usedAt: null },
    data:  { usedAt: new Date() },
  })

  const code      = generateOtpCode()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

  await prisma.otpCode.create({
    data: { userId, code, purpose, expiresAt },
  })

  return code
}

/** Verify an OTP code. Returns true if valid, throws descriptive error otherwise */
export async function verifyOtp(
  userId:  string,
  code:    string,
  purpose: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'TWO_FACTOR'
): Promise<boolean> {
  // Find the most recent unused OTP
  const otp = await prisma.otpCode.findFirst({
    where:   { userId, purpose, usedAt: null },
    orderBy: { createdAt: 'desc' },
  })

  if (!otp) throw new Error('No active verification code found. Please request a new one.')

  // Increment attempt count
  await prisma.otpCode.update({
    where: { id: otp.id },
    data:  { attempts: { increment: 1 } },
  })

  if (otp.attempts + 1 >= MAX_ATTEMPTS) {
    await prisma.otpCode.update({ where:{ id:otp.id }, data:{ usedAt: new Date() } })
    throw new Error('Too many incorrect attempts. Please request a new code.')
  }

  if (otp.expiresAt < new Date()) {
    throw new Error(`Code expired. Codes are valid for ${OTP_EXPIRY_MINUTES} minutes.`)
  }

  if (otp.code !== code.trim()) {
    const remaining = MAX_ATTEMPTS - (otp.attempts + 1)
    throw new Error(`Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`)
  }

  // Mark as used
  await prisma.otpCode.update({ where:{ id:otp.id }, data:{ usedAt: new Date() } })
  return true
}
