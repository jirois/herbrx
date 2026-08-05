// ── Consultant Notification helper ──────────────────────────────────────────
// Single write path for ConsultantNotification rows. Import this from any
// route that creates, reschedules, or cancels a Consultation so the
// consultant dashboard's notification feed can never drift out of sync with
// what actually happened to the booking.
//
// Usage (inside an existing route, after you've updated the Consultation):
//
//   import { notifyConsultant } from '@/lib/consultant-notify'
//   await notifyConsultant({
//     consultantId: consultation.consultantId,
//     consultationId: consultation.id,
//     type: 'RESCHEDULED',
//     clientName: `${user.firstName} ${user.lastName}`,
//     scheduledAt: consultation.scheduledAt,
//   })

import { prisma } from '@/lib/prisma'

type NotifyArgs = {
  consultantId: string | null | undefined
  consultationId: string
  type: 'NEW_BOOKING' | 'CANCELLED' | 'RESCHEDULED' | 'REMINDER'
  clientName?: string
  scheduledAt?: Date | string | null
}

const COPY: Record<NotifyArgs['type'], (a: NotifyArgs) => { title: string; body: string }> = {
  NEW_BOOKING: (a) => ({
    title: 'New consultation booked',
    body: `${a.clientName ?? 'A client'} booked a session${a.scheduledAt ? ` for ${fmt(a.scheduledAt)}` : ''}.`,
  }),
  CANCELLED: (a) => ({
    title: 'Consultation cancelled',
    body: `${a.clientName ?? 'A client'} cancelled their${a.scheduledAt ? ` ${fmt(a.scheduledAt)}` : ''} session.`,
  }),
  RESCHEDULED: (a) => ({
    title: 'Consultation rescheduled',
    body: `${a.clientName ?? 'A client'} moved their session${a.scheduledAt ? ` to ${fmt(a.scheduledAt)}` : ''}.`,
  }),
  REMINDER: (a) => ({
    title: 'Upcoming session reminder',
    body: `You have a session with ${a.clientName ?? 'a client'}${a.scheduledAt ? ` at ${fmt(a.scheduledAt)}` : ''}.`,
  }),
}

function fmt(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
}

/** No-op (returns null) if there's no consultant assigned yet — booking flow
 *  currently allows a REQUESTED consultation to exist before assignment. */
export async function notifyConsultant(args: NotifyArgs) {
  if (!args.consultantId) return null
  const { title, body } = COPY[args.type](args)
  return prisma.consultantNotification.create({
    data: {
      consultantId: args.consultantId,
      consultationId: args.consultationId,
      type: args.type,
      title,
      body,
    },
  }).catch(() => null) // notification failure should never block the booking write that triggered it
}
