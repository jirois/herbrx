import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/paystack'
import { getOrderByRef, updateOrder } from '@/lib/orders'
import { prisma } from '@/lib/prisma'
import { generateMeetingLink } from '@/lib/meeting-link'
import { sendOrderConfirmationEmail, sendConsultationConfirmationEmail } from '@/lib/mailer'

type OrderWithDetails = {
  id: string | number
  paymentStatus?: string
  email?: string
  customerEmail?: string
  firstName?: string
  customerFirstName?: string
  items?: Array<{
    name?: string
    emoji?: string
    quantity?: number
    price?: number
  }>
  total?: number
}

/**
 * Paystack Webhook Handler
 *
 * Configure in Paystack Dashboard → Settings → API Keys & Webhooks
 * URL: https://yourdomain.ng/api/paystack/webhook
 *
 * Events handled:
 *   charge.success   — payment successful
 *   charge.failed    — payment failed
 *   transfer.success — bank transfer confirmed
 *
 * References are namespaced by prefix (see lib/paystack.ts generateReference):
 *   HRX-...      → product order payments
 *   CONSULT-...  → consultation booking payments
 * This handler checks both stores so either payment type, regardless of
 * which page the user was on, gets confirmed from the same webhook.
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-paystack-signature') ?? ''
  const rawBody   = await req.text()

  // Verify webhook authenticity
  const isValid = await verifyWebhookSignature(rawBody, signature)
  if (!isValid) {
    console.warn('[Webhook] Invalid Paystack signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: { event: string; data: { reference?: string; id?: string; [key: string]: unknown } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { event: eventType, data } = event

  console.log(`[Webhook] Received: ${eventType}`, { reference: data?.reference })

  switch (eventType) {
    case 'charge.success': {
      const reference = data?.reference
      if (!reference) break

      // ── Consultation payment ──────────────────────────────────────
      // Include user + consultant here (wasn't fetched before) — the
      // confirmation email needs the client's name/email and the
      // consultant's name/specialization, neither of which the bare
      // paystackRef lookup gave us.
      const consultation = await prisma.consultation.findUnique({
        where: { paystackRef: reference },
        include: {
          user: { select: { firstName: true, email: true } },
          consultant: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
      }).catch(() => null)

      if (consultation) {
        if (consultation.paymentStatus !== 'PAID') {
          const meetingUrl = generateMeetingLink(consultation.id)
          await prisma.consultation.update({
            where: { id: consultation.id },
            data: {
              paymentStatus: 'PAID',
              status:        'CONFIRMED',
              meetingUrl,
            },
          })
          console.log(`[Webhook] Consultation ${consultation.id} marked as paid and confirmed`)

          if (consultation.user?.email) {
            const consultant = consultation.consultant as { user: { firstName: string; lastName: string } } | null
            const consultantName = consultant
              ? `${consultant.user.firstName} ${consultant.user.lastName}`
              : 'your consultant'
            await sendConsultationConfirmationEmail({
              clientEmail: consultation.user.email,
              clientFirstName: consultation.user.firstName,
              consultantName,
              specialization: consultation.type,
              scheduledAt: consultation.scheduledAt,
              meetingUrl,
            }).catch(err => console.error('[Webhook] Failed to send consultation confirmation email:', err))
          }
        }
        break
      }

      // ── Product order payment ───────────────────────────────────────
      const order = getOrderByRef(reference) as OrderWithDetails | null
      if (order && order.paymentStatus !== 'paid') {
        updateOrder(String(order.id), {
          paymentStatus:  'paid',
          status:         'confirmed',
          paystackTxId:   data.id ? Number(data.id) : undefined,
        })
        console.log(`[Webhook] Order ${order.id} marked as paid`)

        const orderEmail = order.email ?? order.customerEmail ?? ''
        const orderFirstName = order.firstName ?? order.customerFirstName ?? ''
        const orderItems = (order.items ?? []).map((item) => ({
          name: item.name ?? 'Item',
          emoji: item.emoji ?? '📦',
          quantity: item.quantity ?? 1,
          price: item.price ?? 0,
        }))

        await sendOrderConfirmationEmail({
          to: orderEmail,
          firstName: orderFirstName,
          orderId: String(order.id),
          total: order.total ?? 0,
          items: orderItems,
        }).catch(err => console.error('[Webhook] Failed to send order confirmation email:', err))
      }

      // Mirror the same status onto the durable Prisma record (see
      // /api/paystack/initialize) so verified-purchase checks — e.g. who's
      // allowed to leave a product review — reflect real payment status.
      await prisma.order.updateMany({
        where: { paystackRef: reference, paymentStatus: { not: 'PAID' } },
        data:  { paymentStatus: 'PAID', status: 'CONFIRMED', paystackTxId: data.id === undefined ? undefined : Number(data.id) },
      }).catch(err => console.error('[Webhook] Failed to update DB order:', err))
      break
    }

    case 'charge.failed': {
      const reference = data?.reference
      if (!reference) break

      const consultation = await prisma.consultation.findUnique({ where: { paystackRef: reference } }).catch(() => null)
      if (consultation) {
        await prisma.consultation.update({
          where: { id: consultation.id },
          data:  { paymentStatus: 'FAILED', status: 'CANCELLED' },
        })
        console.log(`[Webhook] Consultation ${consultation.id} payment failed`)
        break
      }

      const order = getOrderByRef(reference)
      if (order) {
        updateOrder(order.id, {
          paymentStatus: 'failed',
          status:        'cancelled',
        })
        console.log(`[Webhook] Order ${order.id} payment failed`)
      }
      await prisma.order.updateMany({
        where: { paystackRef: reference },
        data:  { paymentStatus: 'FAILED', status: 'CANCELLED' },
      }).catch(err => console.error('[Webhook] Failed to update DB order:', err))
      break
    }

    case 'transfer.success':
    case 'transfer.failed':
      // Handle transfer events if you use Paystack Transfers
      console.log(`[Webhook] Transfer event: ${eventType}`)
      break

    default:
      console.log(`[Webhook] Unhandled event: ${eventType}`)
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true })
}
