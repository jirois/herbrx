/**
 * Generates a real, working video meeting link.
 *
 * The codebase previously generated links like
 * `https://meet.herbrx.ng/session/<id>` — that domain does not exist
 * and was never going to resolve to anything, regardless of whether
 * a real video backend was ever wired up behind it. Every "meeting link"
 * in the product was therefore guaranteed to be broken.
 *
 * This uses Jitsi Meet's public instance (meet.jit.si), which requires
 * zero API keys or account setup and creates a real, working video room
 * the instant the link is opened by either party. Room names are
 * namespaced and randomised so they can't be guessed/joined by strangers.
 *
 * To upgrade later to a branded/self-hosted Jitsi instance, Daily.co,
 * Zoom, or Google Meet API, only this one function needs to change —
 * every call site already goes through here.
 */
export function generateMeetingLink(consultationId: string): string {
  const randomSuffix = Math.random().toString(36).slice(2, 10)
  const roomName = `HerbRx-${consultationId}-${randomSuffix}`
  return `https://meet.jit.si/${encodeURIComponent(roomName)}`
}
