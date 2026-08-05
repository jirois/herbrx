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

export function isWorkingDay(date: Date) {
  return WORKING_WEEKDAYS.includes(date.getDay())
}
