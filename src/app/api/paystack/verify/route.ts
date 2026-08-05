import { NextRequest, NextResponse } from 'next/server'
import { verifyTransaction } from '@/lib/paystack'
import { getOrderByRef, updateOrder } from '@/lib/orders'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get('reference')

  if (!reference) {
    return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
  }

  try {
    const result = await verifyTransaction(reference)

    if (!result.status) {
      return NextResponse.json({ error: result.message }, { status: 502 })
    }

    const tx = result.data

    // Find the pending order
    const order = getOrderByRef(reference)
    const isPaid = tx.status === 'success'

    // Mirror to the durable record regardless of whether the in-memory
    // store still has it — that in-memory copy is what "server restarted"
    // in the comment below is referring to.
    await prisma.order.updateMany({
      where: { paystackRef: reference },
      data:  { paymentStatus: isPaid ? 'PAID' : 'FAILED', status: isPaid ? 'CONFIRMED' : 'PENDING', paystackTxId: tx.id },
    }).catch(err => console.error('[Paystack Verify] Failed to update DB order:', err))

    if (!order) {
      // Order not found in the in-memory store (e.g. server restarted) —
      // still return tx data. The DB record (if any) was already updated
      // above, so status isn't lost even when this in-memory copy is.
      return NextResponse.json({
        verified:   true,
        paid:       tx.status === 'success',
        reference:  tx.reference,
        amount:     tx.amount / 100,   // kobo → naira
        status:     tx.status,
        channel:    tx.channel,
        paidAt:     tx.paid_at,
        metadata:   tx.metadata,
        orderId:    tx.metadata?.orderId ?? null,
      })
    }

    // Update order payment status
    updateOrder(order.id, {
      paymentStatus:  isPaid ? 'paid'  : 'failed',
      status:         isPaid ? 'confirmed' : 'pending',
      paystackTxId:   tx.id,
    })

    return NextResponse.json({
      verified:  true,
      paid:      isPaid,
      reference: tx.reference,
      amount:    tx.amount / 100,
      status:    tx.status,
      channel:   tx.channel,
      paidAt:    tx.paid_at,
      metadata:  tx.metadata,
      orderId:   order.id,
    })
  } catch (err: unknown) {
    console.error('[Paystack Verify]', err)
    const message = err instanceof Error ? err.message : 'Verification failed'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
