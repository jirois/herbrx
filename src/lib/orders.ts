import type { Order } from '@/types'

/**
 * In-memory order store for demo purposes.
 * Replace with your database (Prisma + PostgreSQL, etc.)
 * This store persists for the lifetime of the Node.js process.
 */
const orderStore: Map<string, Order> = new Map()

export function saveOrder(order: Order): void {
  orderStore.set(order.id, order)
}

export function getOrder(id: string): Order | undefined {
  return orderStore.get(id)
}

export function getOrderByRef(paystackRef: string): Order | undefined {
  for (const order of orderStore.values()) {
    if (order.paystackRef === paystackRef) return order
  }
  return undefined
}

export function updateOrder(id: string, updates: Partial<Order>): Order | undefined {
  const existing = orderStore.get(id)
  if (!existing) return undefined
  const updated = { ...existing, ...updates }
  orderStore.set(id, updated)
  return updated
}

export function getUserOrders(email: string): Order[] {
  return Array.from(orderStore.values())
    .filter((o) => o.customer.email.toLowerCase() === email.toLowerCase())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getAllOrders(): Order[] {
  return Array.from(orderStore.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
