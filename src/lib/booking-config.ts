export const SLOT_DURATION_MINUTES = 30 // matches the "30-minute sessions" copy already on the booking page
export const BUSINESS_START_HOUR = 9
export const BUSINESS_END_HOUR = 17
export const BOOKABLE_DAYS_AHEAD = 14
export const WORKING_WEEKDAYS = [1, 2, 3, 4, 5] // Mon–Fri

export function buildDailySlotTemplate(date: Date): { iso: string; label: string }[] {
  const slots: { iso: string; label: string }[] = []
  for (let hour = BUSINESS_START_HOUR; hour < BUSINESS_END_HOUR; hour++) {
    for (const minute of [0, 30]) {
      const slotDate = new Date(date)
      slotDate.setHours(hour, minute, 0, 0)
      slots.push({
        iso: slotDate.toISOString(),
        label: slotDate.toLocaleString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' }) +
          ' · ' + slotDate.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' }),
      })
    }
  }
  return slots
}

// A consultant is unavailable on Sat/Sun only if they've explicitly opted
// out of weekend work (worksWeekends === false). Everyone is bookable
// every day of the week by default — the platform doesn't impose a
// blanket weekday-only rule.
export function isWorkingDay(date: Date, worksWeekends: boolean = true) {
  if (worksWeekends) return true
  return WORKING_WEEKDAYS.includes(date.getDay())
}

// Formats a Date as a plain YYYY-MM-DD string using its LOCAL calendar
// date — never use `date.toISOString().slice(0, 10)` for this. For any
// timezone ahead of UTC (e.g. Lagos, UTC+1), local midnight converts to
// the previous day in UTC, silently shifting every "selected day" back by
// one — which is exactly why Monday was showing Sunday's (weekend)
// availability, Tuesday was showing Monday's, and so on.
export function toDateOnlyISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
