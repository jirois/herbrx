import { NextRequest, NextResponse } from 'next/server'
import { initializeTransaction, generateReference } from '@/lib/paystack'
import { saveOrder } from '@/lib/orders'
import type { Order, OrderCustomer, CartItem } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer, items, subtotal, shipping, total } = body as {
      customer: OrderCustomer
      items: CartItem[]
      subtotal: number
      shipping: number
      total: number
    }

    // Validate required fields
    if (!customer?.email || !items?.length || !total) {
      return NextResponse.json(
        { error: 'Missing required order fields' },
        { status: 400 }
      )
    }

    const reference = generateReference('HRX')
    const orderId   = `ORD-${Date.now().toString(36).toUpperCase()}`

    // Build items summary for Paystack metadata
    const itemsSummary = items
      .map((i) => `${i.product.name} ×${i.quantity}`)
      .join(', ')

    // Initialize Paystack transaction
    const paystackRes = await initializeTransaction({
      email:     customer.email,
      amount:    total, // lib converts to kobo internally
      reference,
      metadata: {
        orderId,
        customer_name: `${customer.firstName} ${customer.lastName}`,
        items_summary:  itemsSummary,
        cancel_action:  `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/checkout`,
      },
      callback_url: `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/checkout/success?order=${orderId}`,
      channels: ['card', 'bank', 'ussd', 'bank_transfer', 'mobile_money'],
    })

    if (!paystackRes.status) {
      return NextResponse.json(
        { error: paystackRes.message ?? 'Paystack initialization failed' },
        { status: 502 }
      )
    }

    // Persist order as pending
    const order: Order = {
      id:            orderId,
      paystackRef:   reference,
      items,
      customer,
      subtotal,
      shipping,
      total,
      paymentMethod: 'card',
      paymentStatus: 'pending',
      status:        'pending',
      createdAt:     new Date().toISOString(),
    }
    saveOrder(order)

    return NextResponse.json({
      orderId,
      reference,
      authorizationUrl:  paystackRes.data.authorization_url,
      accessCode:        paystackRes.data.access_code,
    })
  } catch (error: unknown) {
    console.error('[Paystack Initialize]', error)
    const message =
      error instanceof Error ? error.message : 'Internal server error'

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
