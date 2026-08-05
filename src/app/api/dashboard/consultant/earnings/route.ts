import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, notFound, serverError } from '@/lib/api-helpers'

// GET /api/dashboard/consultant/earnings
// Feeds the Financial Analytics card and a fuller earnings tab: total
// payouts, this month's earnings, pending balance, and a 6-month trend.
export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['CONSULTANT'])
  if (error) return error

  try {
    const userId = (session!.user as {id: string})?.id
    const profile = await prisma.consultantProfile.findUnique({ where: { userId } })
    if (!profile) return notFound('Consultant profile not found for this account')

    const paidConsultations = await prisma.consultation.findMany({
      where: { consultantId: profile.id, status: 'COMPLETED', paymentStatus: 'PAID' },
      select: { amount: true, platformFeeRate: true, payoutStatus: true, updatedAt: true },
    })

    const netOf = (amountKobo: number, feeRate: number | null) =>
      Math.round(amountKobo * (1 - (feeRate ?? 0.15)))

    const totalPaidOut = paidConsultations
      .filter(c => c.payoutStatus === 'PAID')
      .reduce((sum, c) => sum + netOf(c.amount ?? 0, c.platformFeeRate), 0)

    const pendingBalance = paidConsultations
      .filter(c => c.payoutStatus !== 'PAID')
      .reduce((sum, c) => sum + netOf(c.amount ?? 0, c.platformFeeRate), 0)

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonth = paidConsultations
      .filter(c => c.updatedAt >= monthStart)
      .reduce((sum, c) => sum + netOf(c.amount ?? 0, c.platformFeeRate), 0)

    // Last 6 months trend, oldest first
    const trend: { label: string; netKobo: number; sessions: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const inMonth = paidConsultations.filter(c => c.updatedAt >= start && c.updatedAt < end)
      trend.push({
        label: start.toLocaleDateString('en-NG', { month: 'short' }),
        netKobo: inMonth.reduce((sum, c) => sum + netOf(c.amount ?? 0, c.platformFeeRate), 0),
        sessions: inMonth.length,
      })
    }

    return ok({
      totalPaidOutKobo: totalPaidOut,
      pendingBalanceKobo: pendingBalance,
      thisMonthKobo: thisMonth,
      totalCompletedSessions: paidConsultations.length,
      trend,
    })
  } catch (e) {
    return serverError(e)
  }
}
