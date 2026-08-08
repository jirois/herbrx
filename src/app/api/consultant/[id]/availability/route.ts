import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, badRequest, notFound, serverError } from '@/lib/api-helpers'
import { buildDailySlotTemplate, isWorkingDay } from '@/lib/booking-config'

// GET /api/consultants/[id]/availability?date=YYYY-MM-DD
export async function GET(req: NextRequest,
  { params }: { params: Promise<{ id: string }> }) {
    const {id} = await params
  try {
    const dateParam = req.nextUrl.searchParams.get('date')
    if (!dateParam) return badRequest('date is required, format YYYY-MM-DD')

    const date = new Date(`${dateParam}T00:00:00`)
    if (isNaN(date.getTime())) return badRequest('date must be a valid YYYY-MM-DD')

    const consultant = await prisma.consultantProfile.findUnique({ where: { id } })
    if (!consultant) return notFound('Consultant not found')

    if (!isWorkingDay(date)) {
      return ok({ date: dateParam, slots: [], note: 'This consultant is unavailable on weekends.' })
    }

    const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999)

    const booked = await prisma.consultation.findMany({
      where: {
        consultantId: id,
        status: { in: ['REQUESTED', 'CONFIRMED'] },
        scheduledAt: { gte: dayStart, lte: dayEnd },
      },
      select: { scheduledAt: true },
    })
    const bookedTimes = new Set(booked.map(b => b.scheduledAt?.toISOString()))
    const now = new Date()

    const slots = buildDailySlotTemplate(date).map(t => ({
      iso: t.iso,
      label: t.label,
      available: !bookedTimes.has(t.iso) && new Date(t.iso).getTime() > now.getTime(),
    }))

    return ok({ date: dateParam, slots })
  } catch (e) {
    return serverError(e)
  }
}
