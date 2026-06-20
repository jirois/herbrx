import { getServerSession } from 'next-auth'
import { redirect }         from 'next/navigation'
import { authOptions }      from '@/lib/auth'
import { getUserOrders }    from '@/lib/orders'
import type { Metadata }    from 'next'
import { OrderHistory }     from '@/components/account/order-history'

export const metadata: Metadata = { title: 'My Orders' }

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login?callbackUrl=/account/orders')

  const email = session.user.email
  if (!email) redirect('/login?callbackUrl=/account/orders')

  const orders = getUserOrders(email)
  return <OrderHistory orders={orders} />
}
