import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAuth, ok, serverError } from '@/lib/api-helpers'

// GET /api/dashboard/customer/alerts
// Returns active safety alerts (optionally filtered by severity)
export async function GET(req: NextRequest) {
  const {  error } = await requireAuth(req)
  if (error) return error

  try {
    const url      = new URL(req.url)
    const severity = url.searchParams.get('severity')  // 'DANGER' | 'WARNING' | 'INFO'
    const status   = url.searchParams.get('status') ?? 'ACTIVE'

    const alerts = await prisma.safetyAlert.findMany({
      where: {
        status:   status === 'ALL' ? undefined : (status as "ACTIVE" ), // Revisit: fix only temporary
        severity: severity
          ? (severity as 'DANGER' | 'WARNING' | 'INFO')
          : undefined,
      },
      orderBy: [
        { severity: 'asc' },   // DANGER first (alphabetically: DANGER < INFO < WARNING — override below)
        { publishedAt: 'desc' },
      ],
    })

    // Re-sort: DANGER → WARNING → INFO
    const order = { DANGER: 0, WARNING: 1, INFO: 2 }
    alerts.sort((a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3))

    return ok({ alerts })
  } catch (e) {
    return serverError(e)
  }
}
