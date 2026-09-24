/** Roughly 200 words/minute, rounded up, minimum 1 minute — used both
 * server-side (writer post create/update) and client-side (live preview
 * in the editor) so the number the writer sees while typing matches
 * what actually gets saved. */
export function estimateReadTime(content: string): number {
  const words = content
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
