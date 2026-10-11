/**
 * Case history — the whole evidence log with every entry on view, narrowed to
 * one desk's track when asked. Opening History shows All Tracks; the journey's
 * bank detour opens it on Loan.
 */

import type { CaseEvent, Track } from '@mortar/core'
import { EvidenceLog } from './EvidenceLog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export type HistoryTrack = 'all' | Track

const TRACKS: readonly { value: HistoryTrack; label: string }[] = [
  { value: 'all', label: 'All Tracks' },
  { value: 'loan', label: 'Loan' },
  { value: 'legal', label: 'Legal' },
  { value: 'sales', label: 'Sales' }
]

export function CaseHistory({
  events,
  track,
  onTrackChange
}: {
  events: CaseEvent[]
  track: HistoryTrack
  onTrackChange: (track: HistoryTrack) => void
}) {
  const count = (value: HistoryTrack) =>
    value === 'all' ? events.length : events.filter((e) => e.track === value).length
  const shown = track === 'all' ? events : events.filter((e) => e.track === track)
  const label = TRACKS.find((t) => t.value === track)?.label ?? 'All Tracks'
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 md:p-6">
        <div role="group" aria-label="Track" className="flex flex-wrap gap-1">
          {TRACKS.map((t) => (
            <Button
              key={t.value}
              type="button"
              size="sm"
              variant={track === t.value ? 'secondary' : 'ghost'}
              aria-pressed={track === t.value}
              onClick={() => onTrackChange(t.value)}
            >
              {t.label}
              <span className="tabular-nums text-muted-foreground">{count(t.value)}</span>
            </Button>
          ))}
        </div>
        {shown.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {track === 'all' ? 'No Updates Yet.' : `No ${label} Updates Yet.`}
          </p>
        ) : (
          <EvidenceLog events={shown} embedded />
        )}
      </CardContent>
    </Card>
  )
}
