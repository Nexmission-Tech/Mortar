/**
 * Forecast-page helpers: turn the authorized snapshot into a core dataset and
 * map assumption source tags to status tones.
 */
import type { Assumption, Dataset, IsoDate, Snapshot, SourceTag } from '@mortar/core'
import type { StatusPillTone } from '@/components/ui/status-pill'

export function datasetFor(snapshot: Snapshot): Dataset {
  return { bookings: snapshot.bookings, applications: snapshot.applications, events: snapshot.events }
}

/** `YYYY-MM-DD` `days` after `isoDate` (negative allowed). */
export function addDays(isoDate: string, days: number): IsoDate {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** `1 day` / `2 days` — drop the plural s on a value of one. */
export function formatAssumptionValue(a: Assumption): string {
  const unit = a.value === 1 && a.unit.endsWith('s') ? a.unit.slice(0, -1) : a.unit
  return `${a.value} ${unit}`
}

export const SOURCE_TAG_TONES: Record<SourceTag, StatusPillTone> = {
  official: 'positive',
  industry: 'info',
  survey: 'neutral',
  anecdotal: 'warning',
  assumption: 'neutral'
}

export const SOURCE_TAG_LABELS: Record<SourceTag, string> = {
  official: 'Official',
  industry: 'Industry',
  survey: 'Survey',
  anecdotal: 'Anecdotal',
  assumption: 'Assumption'
}
