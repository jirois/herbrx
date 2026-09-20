// Small, dependency-free Levenshtein distance + fuzzy "did they mean X"
// matching for drug/herb names. Used as the LAST fallback tier in the
// interaction checker — only after exact, alias, and substring matching
// have all failed — so a clean substring match is never overridden by a
// looser fuzzy one.

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  let prev = new Array(b.length + 1)
  let curr = new Array(b.length + 1)
  for (let j = 0; j <= b.length; j++) prev[j] = j

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(
        prev[j] + 1,      // deletion
        curr[j - 1] + 1,  // insertion
        prev[j - 1] + cost, // substitution
      )
    }
    ;[prev, curr] = [curr, prev]
  }
  return prev[b.length]
}

// A distance threshold that scales with name length — 1 typo allowed for
// short names, up to 3 for long ones. Prevents very short names (e.g. "Q10")
// from fuzzy-matching almost anything.
function maxDistanceFor(length: number): number {
  if (length <= 4) return 1
  if (length <= 8) return 2
  return 3
}

// Finds the single closest candidate to `input` from `candidates`, if any
// is within the length-scaled distance threshold. Returns null when nothing
// is close enough — callers should treat that as "no fuzzy match", not
// "match found with low confidence".
export function findClosestMatch(
  input: string,
  candidates: string[],
): { match: string; distance: number } | null {
  const normInput = input.toLowerCase().trim()
  if (!normInput) return null

  let best: { match: string; distance: number } | null = null
  for (const candidate of candidates) {
    const normCandidate = candidate.toLowerCase().trim()
    if (!normCandidate) continue
    const dist = levenshtein(normInput, normCandidate)
    if (dist <= maxDistanceFor(Math.max(normInput.length, normCandidate.length))) {
      if (!best || dist < best.distance) best = { match: candidate, distance: dist }
    }
  }
  return best
}
