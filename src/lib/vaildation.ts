// ── Shared form validation ───────────────────────────────────────────────
// Small, dependency-free validators used across the Producer, Admin, and
// Customer dashboards (and public forms like signup/newsletter) so every
// form applies the same rules and shows the same style of inline error
// instead of each component reinventing — or skipping — its own checks.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Nigerian phone numbers: 070/080/081/090/091 + 8 digits, or +234 + 10 digits.
export const NG_PHONE_RE = /^(?:(?:\+234|234|0)(?:70|80|81|90|91)\d{8})$/

export type FieldErrors = Record<string, string>

export function isBlank(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === 'string' && value.trim().length === 0)
}

export function required(value: unknown, label: string): string | null {
  return isBlank(value) ? `${label} is required.` : null
}

export function validEmail(value: string, label = 'Email'): string | null {
  if (isBlank(value)) return `${label} is required.`
  return EMAIL_RE.test(value.trim()) ? null : `Enter a valid ${label.toLowerCase()}.`
}

export function optionalEmail(value: string | undefined | null, label = 'Email'): string | null {
  if (isBlank(value)) return null
  return EMAIL_RE.test((value as string).trim()) ? null : `Enter a valid ${label.toLowerCase()}.`
}

export function validNgPhone(value: string, label = 'Phone number'): string | null {
  if (isBlank(value)) return `${label} is required.`
  const digits = value.replace(/[\s-]/g, '')
  return NG_PHONE_RE.test(digits) ? null : `Enter a valid Nigerian ${label.toLowerCase()} (e.g. 0803 123 4567).`
}

export function optionalNgPhone(value: string | undefined | null, label = 'Phone number'): string | null {
  if (isBlank(value)) return null
  const digits = (value as string).replace(/[\s-]/g, '')
  return NG_PHONE_RE.test(digits) ? null : `Enter a valid Nigerian ${label.toLowerCase()} (e.g. 0803 123 4567).`
}

export function minLength(value: string, min: number, label: string): string | null {
  if (isBlank(value)) return null // pair with required() if the field is mandatory
  return value.trim().length >= min ? null : `${label} must be at least ${min} characters.`
}

export function maxLength(value: string, max: number, label: string): string | null {
  if (isBlank(value)) return null
  return value.trim().length <= max ? null : `${label} must be ${max} characters or fewer.`
}

export function strongPassword(value: string): string | null {
  if (isBlank(value)) return 'Password is required.'
  if (value.length < 8) return 'Password must be at least 8 characters.'
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value)) return 'Password needs both upper and lowercase letters.'
  if (!/[0-9]/.test(value)) return 'Password needs at least one number.'
  return null
}

export function numberInRange(value: string | number, min: number, max: number, label: string): string | null {
  if (value === '' || value === null || value === undefined) return `${label} is required.`
  const n = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(n)) return `${label} must be a number.`
  if (n < min || n > max) return `${label} must be between ${min} and ${max}.`
  return null
}

export function positiveInteger(value: string | number, label: string): string | null {
  if (value === '' || value === null || value === undefined) return `${label} is required.`
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(n) || n <= 0) return `${label} must be a whole number greater than 0.`
  return null
}

export const todayISO = () => new Date().toISOString().split('T')[0]

export function notFutureDate(value: string, label: string): string | null {
  if (isBlank(value)) return null
  return value > todayISO() ? `${label} cannot be in the future.` : null
}

/**
 * Runs a set of named validators and returns only the non-null messages.
 * Usage: const errors = collectErrors({ email: validEmail(email), name: required(name, 'Name') })
 */
export function collectErrors(fields: Record<string, string | null>): FieldErrors {
  const errors: FieldErrors = {}
  for (const [key, msg] of Object.entries(fields)) {
    if (msg) errors[key] = msg
  }
  return errors
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0
}
