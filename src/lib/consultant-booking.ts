// ── Consultant slot validation ──────────────────────────────────────────────
// /api/booking and /api/dashboard/customer/consultations are two separate
// (pre-existing, duplicate) entry points that both create a Consultation +
// initialize Paystack. Rather than duplicate the new consultant-assignment
// and double-booking logic in both, both routes call this one function.
//
// The exact copy the frontend's conflict-warning UI should show — kept as
// one constant so client and server can't drift into slightly different
// wording for the same condition.

import { prisma } from '@/lib/prisma'

export const SLOT_TAKEN_MESSAGE = 'This time slot has already been reserved. Please select a different time or date.'

type ValidationResult =
  | { ok: true; consultant: { id: string; specialization: string } }
  | { ok: false; message: string }

export async function validateConsultantSlot(
  consultantId: string | undefined | null,
  type: string,
  scheduledAt: Date,
): Promise<ValidationResult> {
  if (!consultantId) {
    return { ok: false, message: 'Please select a consultant.' }
  }

  const consultant = await prisma.consultantProfile.findUnique({ where: { id: consultantId } })
  if (!consultant) return { ok: false, message: 'Consultant not found.' }
  if (consultant.status !== 'ACTIVE') return { ok: false, message: 'This consultant is not currently accepting bookings.' }
  if (consultant.specialization !== type) {
    return { ok: false, message: 'This consultant does not offer that consultation type.' }
  }

  // Authoritative conflict check — the calendar UI already filtered this
  // slot as available when it rendered, but that was a read from moments
  // ago. Re-check here, right before creating the row.
  //
  // NOTE: this is check-then-create, not a DB-level constraint (no partial
  // unique index). Acceptable for expected traffic; see
  // CONSULTANT-INTEGRATION-NOTES.md for the raw-SQL upgrade path if needed.
  const conflict = await prisma.consultation.findFirst({
    where: {
      consultantId,
      scheduledAt,
      status: { in: ['REQUESTED', 'CONFIRMED'] },
    },
  })
  if (conflict) return { ok: false, message: SLOT_TAKEN_MESSAGE }

  return { ok: true, consultant: { id: consultant.id, specialization: consultant.specialization } }
}
