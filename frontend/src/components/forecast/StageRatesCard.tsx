import type { Stage, StageRate } from '@mortar/core'
import { STAGE_LABELS, formatDate, formatPercent } from '@/components/case'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const SIGNING_STAGES = new Set<Stage>(['booked', 'loan_applied', 'lo_issued'])

export function StageRatesCard({
  stageRates,
  scope,
  asOf
}: {
  stageRates: StageRate[]
  scope: 'project' | 'visible'
  asOf: string
}) {
  const rows = stageRates.filter((row) => SIGNING_STAGES.has(row.stage))
  const historyLabel = scope === 'project' ? 'Project-wide history' : 'Your accessible history'

  return (
    <section aria-labelledby="forecast-stage-rates-heading" className="space-y-3">
      <div>
        <h3 id="forecast-stage-rates-heading" className="text-base font-semibold text-foreground">
          Signed By Booking Day 30
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Among bookings that reached each stage and have a known 30-day outcome, the rate shows how many signed by day
          30. It is not the chance of reaching the next stage.
        </p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Historical rate rows use {historyLabel.toLowerCase()} as of {formatDate(asOf)}.
        </p>
      </div>

      {rows.length > 0 ? (
        <div className="min-w-0 max-w-full overflow-x-auto">
          <Table className="min-w-[620px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Signed / Known Outcome</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Range</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.stage}>
                  <TableCell>{STAGE_LABELS[row.stage]}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {row.signed} / {row.resolved}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.resolved === 0 ? '—' : formatPercent(row.rate)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {row.resolved === 0 ? '—' : `${formatPercent(row.low)} – ${formatPercent(row.high)}`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No pre-signing stage outcomes are available in this history.</p>
      )}
    </section>
  )
}
