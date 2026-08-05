// ── Admin-issued credential generator ───────────────────────────────────────
// Used only for accounts an Admin provisions on someone else's behalf
// (currently: Consultants). Produces a temp password that satisfies
// strongPassword() in lib/validation.ts (upper+lower+number, 8+ chars) so
// the consultant isn't immediately locked out if they reuse it as-is
// before their forced first-login reset.

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ' // no I/O — avoid look-alikes
const LOWER = 'abcdefghijkmnopqrstuvwxyz'
const DIGIT = '23456789'
const SYMBOL = '!@#$%'

function pick(charset: string, n: number) {
  let out = ''
  for (let i = 0; i < n; i++) out += charset[Math.floor(Math.random() * charset.length)]
  return out
}

function shuffle(s: string) {
  const arr = s.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.join('')
}

/** Returns a 12-char temp password, e.g. "xR7#tKq2mPz8" */
export function generateTempPassword(): string {
  const raw = pick(UPPER, 2) + pick(LOWER, 6) + pick(DIGIT, 3) + pick(SYMBOL, 1)
  return shuffle(raw)
}
