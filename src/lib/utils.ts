import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function staggerDelay(index: number, base = 0.08): number {
  return index * base
}


export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

/** Appends a short random suffix so two products named identically don't
 *  collide on the unique constraint. */
export function generateProductSlug(name: string): string {
  const base = slugify(name) || 'product'
  const suffix = Math.random().toString(36).slice(2, 7)
  return `${base}-${suffix}`
}
