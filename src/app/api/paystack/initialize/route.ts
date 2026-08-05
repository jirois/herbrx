import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { initializeTransaction, generateReference } from '@/lib/paystack'
import { saveOrder } from '@/lib/orders'
import { prisma }    from '@/lib/prisma'
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

    // Also persist durably to the database, keyed to the logged-in user
    // when there is one. The in-memory store above resets on every
    // deploy/restart and has no userId at all, which made it unusable as
    // a source of truth for anything that needs to survive — like knowing
    // whether someone actually bought a product (used by the review
    // system's "verified purchase" gate). This runs best-effort so a DB
    // hiccup here never blocks checkout.
    const session = await getServerSession(authOptions).catch(() => null)
    try {
      await prisma.order.create({
        data: {
          id:            orderId,
          userId:        session?.user?.id ?? null,
          paystackRef:   reference,
          custFirstName: customer.firstName,
          custLastName:  customer.lastName,
          custEmail:     customer.email,
          custPhone:     customer.phone,
          custAddress:   customer.address,
          custCity:      customer.city,
          custState:     customer.state,
          subtotal,
          shipping,
          total,
          paymentMethod: 'CARD',
          paymentStatus: 'PENDING',
          status:        'PENDING',
          items: {
            create: items.map(i => ({
              productId:    i.product.id,
              productName:  i.product.name,
              productEmoji: i.product.emoji,
              price:        i.product.price,
              quantity:     i.quantity,
            })),
          },
        },
      })
    } catch (dbErr) {
      console.error('[Paystack Initialize] Failed to persist order to DB:', dbErr)
    }

    return NextResponse.json({
      orderId,
      reference,
      authorizationUrl:  paystackRes.data.authorization_url,
      accessCode:        paystackRes.data.access_code,
    })
  } catch (err: unknown) {
    console.error('[Paystack Initialize]', err)
    const errorMessage =
      err instanceof Error ? err.message : typeof err === 'string' ? err : 'Internal server error'

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
