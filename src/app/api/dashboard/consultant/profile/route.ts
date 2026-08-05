import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, badRequest, notFound, serverError } from '@/lib/api-helpers'
import { strongPassword } from '@/lib/vaildation'

// GET /api/dashboard/consultant/profile
export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['CONSULTANT'])
  if (error) return error

  try {
    const userId = (session!.user as { id: string })?.id
    const profile = await prisma.consultantProfile.findUnique({
      where: { userId },
      include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },
    })
    if (!profile) return notFound('Consultant profile not found for this account')

    return ok({ profile })
  } catch (e) {
    return serverError(e)
  }
}

// PATCH /api/dashboard/consultant/profile
// Consultants can edit their own bio/avatar and (once, on first login)
// their password. Specialization and active/inactive status stay
// admin-controlled — see /api/dashboard/admin/consultants for those.
export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['CONSULTANT'])
  if (error) return error

  try {
    const userId = (session!.user as { id: string })?.id
    const profile = await prisma.consultantProfile.findUnique({ where: { userId } })
    if (!profile) return notFound('Consultant profile not found for this account')

    const body = await req.json()
    const { bio, avatarUrl, newPassword } = body

    if (bio !== undefined) {
      await prisma.consultantProfile.update({ where: { userId }, data: { bio } })
    }
    if (avatarUrl !== undefined) {
      await prisma.consultantProfile.update({ where: { userId }, data: { avatarUrl } })
    }

    if (newPassword) {
      const pwError = strongPassword(newPassword)
      if (pwError) return badRequest(pwError)
      const passwordHash = await bcrypt.hash(newPassword, 10)
      await prisma.$transaction([
        prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
        prisma.consultantProfile.update({ where: { userId }, data: { mustResetPassword: false } }),
      ])
    }

    const updated = await prisma.consultantProfile.findUnique({
      where: { userId },
      include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },
    })

    return ok({ profile: updated })
  } catch (e) {
    return serverError(e)
  }
}
