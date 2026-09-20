// Prisma's native Json columns have been unreliable on this app's MariaDB
// driver adapter — sometimes returned already parsed as a real array,
// sometimes returned as the raw JSON string it was stored as. Silently
// trusting the "already an array" assumption is exactly how a bug like
// spreading `"[]"` as `['[', ']']`, or iterating a JSON string character by
// character, sneaks in — it doesn't throw, it just quietly produces
// garbage. Use this wherever a Json-typed field is read back.
export function parseJsonArray<T = string>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? (parsed as T[]) : []
    } catch { return [] }
  }
  return []
}
