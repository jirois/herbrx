import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, created, badRequest, serverError } from '@/lib/api-helpers'
import { EMAIL_RE } from '@/lib/vaildation'
import { generateTempPassword } from '@/lib/generate-credentials'

const STAFF_ROLES = ['WRITER', 'EDITOR'] as const
type StaffRole = (typeof STAFF_ROLES)[number]

// GET /api/dashboard/admin/staff?role=WRITER
// Lists writer/editor accounts (both, unless ?role narrows it) with a
// quick activity count so the admin can see who's actually contributing.
export async function GET(req: NextRequest) {
  const { error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    const roleParam = req.nextUrl.searchParams.get('role')
    const role = STAFF_ROLES.includes(roleParam as StaffRole) ? (roleParam as StaffRole) : null

    const users = await prisma.user.findMany({
      where: { role: role ? role : { in: [...STAFF_ROLES] } },
      select: {
        id: true, firstName: true, lastName: true, email: true, phone: true,
        role: true, status: true, createdAt: true,
        _count: { select: { blogPosts: true, blogReviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const shaped = users.map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      postCount: u.role === 'WRITER' ? u._count.blogPosts : u._count.blogReviews,
    }))

    return ok({ staff: shaped })
  } catch (e) {
    return serverError(e)
  }
}

// POST /api/dashboard/admin/staff
// Body: { firstName, lastName, email, phone?, role: 'WRITER' | 'EDITOR' }
// Creates the account directly (no self-registration path exists for these
// roles — same "admin-provisioned, temp password shown once" pattern used
// for Consultants) and returns the generated password once for the admin
// to hand off out-of-band.
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    const adminId = (session!.user as { id: string }).id
    const body = await req.json()
    const { firstName, lastName, email, phone, role } = body

    if (!firstName?.trim() || !lastName?.trim() || !email || !role) {
      return badRequest('firstName, lastName, email, and role are required')
    }
    if (!EMAIL_RE.test(String(email).trim())) {
      return badRequest('A valid email address is required')
    }
    if (!STAFF_ROLES.includes(role)) {
      return badRequest(`role must be one of: ${STAFF_ROLES.join(', ')}`)
    }

    const normalEmail = String(email).trim().toLowerCase()
    const existing = await prisma.user.findUnique({ where: { email: normalEmail } })
    if (existing) return badRequest('A user with this email already exists')

    const tempPassword = generateTempPassword()
    const passwordHash = await bcrypt.hash(tempPassword, 10)

    const user = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalEmail,
        phone: phone?.trim() || null,
        passwordHash,
        role,
        emailVerified: true, // admin-provisioned — skip the usual OTP flow
      },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
    })

    // authorTitle (a writer's public byline, e.g. "Herbal Pharmacist") lives
    // on each BlogPost rather than on the User, so it's set per-post in the
    // post editor rather than here at account-creation time.

    await prisma.adminAction.create({
      data: {
        adminId,
        action: `${role}_CREATED`,
        targetType: 'User',
        targetId: user.id,
        reason: `Created ${role.toLowerCase()} account for ${firstName} ${lastName}`,
      },
    }).catch(() => {})

    return created({
      staff: user,
      // Shown once in the admin UI — copy-to-clipboard, then gone.
      credentials: { email: user.email, tempPassword },
    })
  } catch (e) {
    return serverError(e)
  }
}
