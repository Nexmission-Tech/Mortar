import type { CaseSummary, EventKind, Snapshot, Task } from '@mortar/core'
import type { BookingRow } from './BookingsTable'

/** The row `CaseQuickView` shows for one booking. Signals stay `null`: the sheet never reads them. */
export function quickViewRow(snapshot: Snapshot, cases: CaseSummary[], bookingId: string): BookingRow | null {
  const booking = snapshot.bookings.find((b) => b.id === bookingId)
  const summary = cases.find((c) => c.bookingId === bookingId)
  if (!booking || !summary) return null
  const confirmedKinds = new Set<EventKind>(
    snapshot.events.filter((e) => e.bookingId === bookingId && e.status === 'confirmed').map((e) => e.kind)
  )
  let openTask: Task | null = null
  for (const task of snapshot.tasks)
    if (task.bookingId === bookingId && task.status === 'open' && (!openTask || task.dueOn < openTask.dueOn))
      openTask = task
  return { booking, summary, signals: null, confirmedKinds, openTask }
}
