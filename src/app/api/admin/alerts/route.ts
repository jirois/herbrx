import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAuth, ok, created, badRequest, notFound, serverError } from '@/lib/api-helpers'

// GET /api/dashboard/admin/alerts
export async function GET(req: NextRequest) {
  const {  error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    const url    = new URL(req.url)
    const status = url.searchParams.get('status') as 'ACTIVE' | 'RESOLVED' | 'ALL' | null

    const alerts = await prisma.safetyAlert.findMany({
      where:   status && status !== 'ALL' ? { status } : undefined,
      orderBy: { publishedAt: 'desc' },
    })

    return ok({ alerts })
  } catch (e) {
    return serverError(e)
  }
}

// POST /api/dashboard/admin/alerts  — publish a new safety alert
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    type AuthUser = { id: string }
    const adminId = (session!.user as unknown as AuthUser).id
    const body    = await req.json()
    const { title, body: alertBody, severity, productName, batchNo } = body

    if (!title || !alertBody || !severity) {
      return badRequest('title, body, and severity are required')
    }
    if (!['DANGER', 'WARNING', 'INFO'].includes(severity)) {
      return badRequest('severity must be DANGER, WARNING, or INFO')
    }

    const alert = await prisma.safetyAlert.create({
      data: {
        title,
        body:        alertBody,
        severity,
        productName: productName ?? null,
        batchNo:     batchNo    ?? null,
        status:      'ACTIVE',
        createdBy:   adminId,
      },
    })

    // Audit log
    await prisma.adminAction.create({
      data: {
        adminId,
        action:     'ALERT_PUBLISHED',
        targetType: 'Alert',
        targetId:   alert.id,
        reason:     title,
      },
    })

    return created({ alert })
  } catch (e) {
    return serverError(e)
  }
}

// PATCH /api/dashboard/admin/alerts
// Body: { alertId, status: 'RESOLVED' | 'ACTIVE' }
export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    type AuthUser = { id: string }
    const adminId = (session!.user as unknown as AuthUser).id
    const body    = await req.json()
    const { alertId, status } = body

    if (!alertId || !status) return badRequest('alertId and status are required')

    const alert = await prisma.safetyAlert.findUnique({ where: { id: alertId } })
    if (!alert) return notFound('Alert not found')

    const updated = await prisma.safetyAlert.update({
      where: { id: alertId },
      data:  { status },
    })

    await prisma.adminAction.create({
      data: {
        adminId,
        action:     `ALERT_${status}`,
        targetType: 'Alert',
        targetId:   alertId,
      },
    })

    return ok({ alert: updated })
  } catch (e) {
    return serverError(e)
  }
}
