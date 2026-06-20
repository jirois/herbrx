import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/paystack'
import { getOrderByRef, updateOrder } from '@/lib/orders'

interface PaystackWebhookData {
  reference?: string
  id?: string
  [key: string]: unknown
}

interface PaystackWebhookEvent {
  event: string
  data: PaystackWebhookData
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

  let event: PaystackWebhookEvent
  try {
    event = JSON.parse(rawBody) as PaystackWebhookEvent
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { event: eventType, data } = event

  console.log(`[Webhook] Received: ${eventType}`, { reference: data?.reference })

  switch (eventType) {
    case 'charge.success': {
      const reference = data?.reference
      if (!reference) break

      const order = getOrderByRef(reference)
      if (order && order.paymentStatus !== 'paid') {
        updateOrder(order.id, {
          paymentStatus:  'paid',
          status:         'confirmed',
          paystackTxId:   data.id ? Number(data.id) : undefined,
        })
        console.log(`[Webhook] Order ${order.id} marked as paid`)

        // TODO: Send confirmation email via your email provider
        // await sendOrderConfirmationEmail(order)
      }
      break
    }

    case 'charge.failed': {
      const reference = data?.reference
      if (!reference) break

      const order = getOrderByRef(reference)
      if (order) {
        updateOrder(order.id, {
          paymentStatus: 'failed',
          status:        'cancelled',
        })
        console.log(`[Webhook] Order ${order.id} payment failed`)
      }
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
