import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { ForecastInsights, InsightBooking } from '@mortar/core'
import { FORECAST_DOCUMENT_QUESTIONS } from '@mortar/core'
import {
  BALL_HOLDER_LABELS,
  STAGE_LABELS,
  formatDate,
  formatDaysLong,
  formatPercent,
  formatRm,
  formatRmCompact
} from '@/components/case'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ForecastDocuments, type ForecastDocument } from './ForecastDocuments'
import { StageRatesCard } from './StageRatesCard'

const ROW_LIMIT = 8

function useVisibleRows<Row>(rows: Row[]) {
  const [expanded, setExpanded] = useState(false)
  return {
    visibleRows: expanded ? rows : rows.slice(0, ROW_LIMIT),
    control:
      rows.length > ROW_LIMIT ? (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'Show Fewer' : `Show All ${rows.length} Bookings`}
          </Button>
        </div>
      ) : null
  }
}

function TableFrame({ children, minWidth = 'min-w-[720px]' }: { children: ReactNode; minWidth?: string }) {
  return <Table className={minWidth}>{children}</Table>
}

function BookingReference({ bookingId, unit }: Pick<InsightBooking, 'bookingId' | 'unit'>) {
  return (
    <span className="inline-flex min-w-28 flex-col items-start gap-0.5">
      <Link
        to={`/bookings/${encodeURIComponent(bookingId)}`}
        className="font-mono text-[13px] font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {unit}
      </Link>
      <span className="font-mono text-[13px] text-muted-foreground">{bookingId}</span>
    </span>
  )
}

function Definition({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-border py-2 sm:grid-cols-[minmax(10rem,1fr)_2fr] sm:gap-4">
      <dt className="text-sm font-medium text-foreground">{label}</dt>
      <dd className="min-w-0 text-sm text-muted-foreground">{children}</dd>
    </div>
  )
}

function OutlookReport({ insights }: { insights: ForecastInsights }) {
  const { visibleRows, control } = useVisibleRows(insights.outlook)
  const { visibleRows: upcomingRows, control: upcomingControl } = useVisibleRows(insights.appointments.upcoming)
  const supported = insights.forecast.support === 'supported'
  const historyScope = insights.history.scope === 'project' ? 'project-wide history' : 'your accessible history'

  return (
    <div className="min-w-0 space-y-6">
      <section aria-labelledby="outlook-explanation" className="space-y-3">
        <h3 id="outlook-explanation" className="text-base font-semibold text-foreground">
          Booking-Day-30 Estimate
        </h3>
        {supported ? (
          <p className="text-sm leading-5 text-muted-foreground">
            The estimate is {insights.forecast.expectedSignings.toFixed(1)} expected SPA signings across{' '}
            {insights.forecast.liveBookings} eligible bookings, with a count range of {insights.forecast.rangeLow} to{' '}
            {insights.forecast.rangeHigh}. The estimate covers unsigned, unclosed bookings less than 30 days from
            booking.
          </p>
        ) : (
          <p className="text-sm leading-5 text-muted-foreground">
            The booking-day-30 estimate is unavailable because there is not enough resolved history. There are{' '}
            {insights.forecast.liveBookings} eligible bookings, but an unsupported estimate is not a zero forecast.
          </p>
        )}
      </section>

      <section aria-labelledby="outlook-cases-heading" className="space-y-3">
        <h3 id="outlook-cases-heading" className="text-base font-semibold text-foreground">
          Eligible Bookings
        </h3>
        {insights.outlook.length > 0 ? (
          <>
            <TableFrame>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Unit / Booking</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Signing Chance</TableHead>
                  <TableHead>Booking-Day-30 Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRows.map((row) => (
                  <TableRow key={row.bookingId}>
                    <TableCell>
                      <BookingReference bookingId={row.bookingId} unit={row.unit} />
                    </TableCell>
                    <TableCell>{STAGE_LABELS[row.stage]}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.probability === null ? '—' : formatPercent(row.probability)}
                    </TableCell>
                    <TableCell>{formatDate(row.deadline)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableFrame>
            {control}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            {supported
              ? 'No unsigned, unclosed bookings are under 30 days from booking.'
              : 'No eligible booking rows are available while the estimate is unsupported.'}
          </p>
        )}
      </section>

      <section aria-labelledby="recorded-appointments-heading" className="space-y-3">
        <div>
          <h3 id="recorded-appointments-heading" className="text-base font-semibold text-foreground">
            Recorded Appointments
          </h3>
          <dl className="mt-2 divide-y divide-border">
            <Definition label="Upcoming">
              {insights.appointments.upcoming.length} from {formatDate(insights.appointments.from)} Through{' '}
              {formatDate(insights.appointments.to)}.
            </Definition>
            <Definition label="Overdue">
              {insights.appointments.overdue.length} overdue; date passed, booking still unsigned.
            </Definition>
            <Definition label="Date Missing">
              {insights.appointments.undatedCount} recorded appointment
              {insights.appointments.undatedCount === 1 ? ' has' : 's have'} a missing date.
            </Definition>
          </dl>
        </div>
        {insights.appointments.upcoming.length > 0 ? (
          <>
            <TableFrame>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Unit / Booking</TableHead>
                  <TableHead>Recorded Appointment Date</TableHead>
                  <TableHead>Assigned To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingRows.map((row) => (
                  <TableRow key={row.bookingId}>
                    <TableCell>
                      <BookingReference bookingId={row.bookingId} unit={row.unit} />
                    </TableCell>
                    <TableCell>{formatDate(row.appointmentOn)}</TableCell>
                    <TableCell>{row.assigneeName ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableFrame>
            {upcomingControl}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No confirmed SPA appointment dates fall within {formatDate(insights.appointments.from)} Through{' '}
            {formatDate(insights.appointments.to)}.
          </p>
        )}
        {insights.appointments.overdue.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            {insights.appointments.overdue.length} recorded appointment date
            {insights.appointments.overdue.length === 1 ? ' has' : 's have'} passed. The booking remains unsigned; the
            record does not say whether an appointment was missed.
          </p>
        ) : null}
      </section>

      <HowThisIsCounted insights={insights} historyScope={historyScope} />
    </div>
  )
}

function HowThisIsCounted({ insights, historyScope }: { insights: ForecastInsights; historyScope: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <section className="border-t border-border pt-4">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        className="text-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        How This Is Counted
      </button>
      {expanded ? (
        <div className="mt-3 space-y-2 text-sm leading-5 text-muted-foreground">
          <p>
            Each chance is the observed share of resolved bookings at a similar stage and booking age that signed by day
            30. When a stage-and-age comparison has fewer than 8 resolved cases, the estimate falls back to the wider
            stage history when it has 8 cases, then to overall history.
          </p>
          <p>
            History sample: {insights.history.resolved} resolved bookings, {insights.history.signed} signed by booking
            day 30, as of {formatDate(insights.history.asOf)} in {historyScope}.
          </p>
          <p>
            Signed, exited, and 30-day-old bookings are outside the estimate but remain in the reports. A buyer
            withdrawal without recorded closure stays in the estimate and does not establish current willingness to
            proceed.
          </p>
          <p>
            The range assumes independent booking outcomes with fixed historical chances. It does not capture all
            uncertainty.
          </p>
        </div>
      ) : null}
    </section>
  )
}

function ApprovedReport({ insights }: { insights: ForecastInsights }) {
  const { visibleRows, control } = useVisibleRows(insights.approved.rows)

  return (
    <div className="min-w-0 space-y-5">
      <p className="text-sm leading-5 text-muted-foreground">
        {insights.approved.count} approved booking{insights.approved.count === 1 ? '' : 's'} awaiting an SPA, with{' '}
        {formatRm(insights.approved.valueRm)} in booked value. {insights.approved.withoutAppointmentCount} have no
        recorded appointment. Loan approval does not verify legal readiness or an LO signature.
      </p>
      {insights.approved.rows.length > 0 ? (
        <>
          <TableFrame>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Unit / Booking</TableHead>
                <TableHead>Waiting Since Approval</TableHead>
                <TableHead>Appointment</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Booking Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.map((row) => (
                <TableRow key={row.bookingId}>
                  <TableCell>
                    <BookingReference bookingId={row.bookingId} unit={row.unit} />
                  </TableCell>
                  <TableCell>{formatDaysLong(row.daysSinceApproval)}</TableCell>
                  <TableCell>
                    {row.appointmentRecorded
                      ? row.appointmentOn
                        ? formatDate(row.appointmentOn)
                        : 'Recorded, Date Missing'
                      : 'Not Recorded'}
                  </TableCell>
                  <TableCell>{row.assigneeName ?? '—'}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatRm(row.priceRm)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableFrame>
          {control}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No qualifying open bookings have a recorded loan approval.</p>
      )}
    </div>
  )
}

function WaitingReport({ insights }: { insights: ForecastInsights }) {
  const { visibleRows, control } = useVisibleRows(insights.waiting.rows)

  return (
    <div className="min-w-0 space-y-5">
      <p className="text-sm leading-5 text-muted-foreground">
        The unsigned pipeline has {insights.open.count} bookings, including {insights.open.olderCount} older than the
        estimate’s 30-day window. A confirmed buyer withdrawal is shown as a release review when no closure is recorded;
        it does not indicate active legal readiness.
      </p>

      <section aria-labelledby="waiting-groups-heading" className="space-y-3">
        <h3 id="waiting-groups-heading" className="text-base font-semibold text-foreground">
          Waiting Groups
        </h3>
        {insights.waiting.groups.length > 0 ? (
          <TableFrame minWidth="min-w-[560px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Waiting On</TableHead>
                <TableHead className="text-right">Bookings</TableHead>
                <TableHead className="text-right">Booked Value</TableHead>
                <TableHead>Oldest Time In Stage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insights.waiting.groups.map((group) => (
                <TableRow key={group.holder}>
                  <TableCell>{BALL_HOLDER_LABELS[group.holder]}</TableCell>
                  <TableCell className="text-right tabular-nums">{group.count}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatRm(group.valueRm)}</TableCell>
                  <TableCell>
                    {group.oldestDays === null
                      ? 'No recorded progress date'
                      : `${formatDaysLong(group.oldestDays)} in stage`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableFrame>
        ) : (
          <p className="text-sm text-muted-foreground">No open bookings are waiting on a recorded holder.</p>
        )}
      </section>

      <section aria-labelledby="waiting-cases-heading" className="space-y-3">
        <h3 id="waiting-cases-heading" className="text-base font-semibold text-foreground">
          Unsigned Bookings
        </h3>
        {insights.waiting.rows.length > 0 ? (
          <>
            <TableFrame>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Unit / Booking</TableHead>
                  <TableHead>Stage And Time</TableHead>
                  <TableHead>Waiting For</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRows.map((row) => (
                  <TableRow key={row.bookingId}>
                    <TableCell>
                      <BookingReference bookingId={row.bookingId} unit={row.unit} />
                    </TableCell>
                    <TableCell>
                      {STAGE_LABELS[row.stage]} ·{' '}
                      {row.daysInStage === null
                        ? 'No recorded progress date'
                        : `${formatDaysLong(row.daysInStage)} in stage`}
                    </TableCell>
                    <TableCell>
                      {row.nextMove === 'review_release' ? 'Release Review' : row.waitingFor || '—'}
                    </TableCell>
                    <TableCell>{row.assigneeName ?? '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatRm(row.priceRm)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableFrame>
            {control}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No open unsigned bookings are waiting.</p>
        )}
      </section>
    </div>
  )
}

function ConversionReport({ insights }: { insights: ForecastInsights }) {
  const { visibleRows, control } = useVisibleRows(insights.turnaround.rows)
  const bookingMedian = insights.turnaround.bookingToSigning.medianDays
  const approvalMedian = insights.turnaround.approvalToSigning.medianDays

  return (
    <div className="min-w-0 space-y-6">
      <StageRatesCard
        stageRates={insights.forecast.stageRates}
        scope={insights.history.scope}
        asOf={insights.history.asOf}
      />

      <section aria-labelledby="turnaround-heading" className="space-y-3">
        <h3 id="turnaround-heading" className="text-base font-semibold text-foreground">
          Completed Signing Times
        </h3>
        <dl className="divide-y divide-border">
          <Definition label="Median Booking-To-SPA">
            {bookingMedian === null
              ? 'No completed sample.'
              : `${formatDaysLong(bookingMedian)} · ${insights.turnaround.bookingToSigning.sample} signed booking${insights.turnaround.bookingToSigning.sample === 1 ? '' : 's'}.`}
          </Definition>
          <Definition label="Median Approval-To-SPA">
            {approvalMedian === null
              ? 'No completed sample.'
              : `${formatDaysLong(approvalMedian)} · ${insights.turnaround.approvalToSigning.sample} signed booking${insights.turnaround.approvalToSigning.sample === 1 ? '' : 's'}.`}
          </Definition>
        </dl>
        <p className="text-sm leading-5 text-muted-foreground">
          These timings cover accessible confirmed completed cases only. They do not use project-wide aggregate rates or
          the ages of bookings still open.
        </p>
      </section>

      <section aria-labelledby="turnaround-cases-heading" className="space-y-3">
        <h3 id="turnaround-cases-heading" className="text-base font-semibold text-foreground">
          Contributing Signed Bookings
        </h3>
        {insights.turnaround.rows.length > 0 ? (
          <>
            <TableFrame>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Unit / Booking</TableHead>
                  <TableHead>Booked</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Signed</TableHead>
                  <TableHead>Booking-To-SPA</TableHead>
                  <TableHead>Approval-To-SPA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRows.map((row) => (
                  <TableRow key={row.bookingId}>
                    <TableCell>
                      <BookingReference bookingId={row.bookingId} unit={row.unit} />
                    </TableCell>
                    <TableCell>{formatDate(row.bookedOn)}</TableCell>
                    <TableCell>{formatDate(row.approvedOn)}</TableCell>
                    <TableCell>{formatDate(row.signedOn)}</TableCell>
                    <TableCell>{formatDaysLong(row.bookingToSigningDays)}</TableCell>
                    <TableCell>{formatDaysLong(row.approvalToSigningDays)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableFrame>
            {control}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No accessible confirmed signed bookings have complete dates.</p>
        )}
      </section>
    </div>
  )
}

function LostReport({ insights }: { insights: ForecastInsights }) {
  const exitList = useVisibleRows(insights.exits.rows)
  const retryList = useVisibleRows(insights.secondBank.rows)
  const reviewList = useVisibleRows(insights.secondBank.followUp)

  return (
    <div className="min-w-0 space-y-6">
      <section aria-labelledby="exit-summary-heading" className="space-y-3">
        <h3 id="exit-summary-heading" className="text-base font-semibold text-foreground">
          Recorded Cancellations And Lapses
        </h3>
        <p className="text-sm leading-5 text-muted-foreground">
          {insights.exits.cancelledCount} cancellation{insights.exits.cancelledCount === 1 ? '' : 's'} and{' '}
          {insights.exits.lapsedCount} lapse{insights.exits.lapsedCount === 1 ? '' : 's'};{' '}
          {formatRm(insights.exits.valueRm)} in booked value. This is not recognized revenue lost or permanent stock
          loss.
        </p>
        {insights.exits.rows.length > 0 ? (
          <>
            <TableFrame>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Unit / Booking</TableHead>
                  <TableHead>Recorded Outcome</TableHead>
                  <TableHead>Exit Date</TableHead>
                  <TableHead>Days To Exit</TableHead>
                  <TableHead className="text-right">Booking Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exitList.visibleRows.map((row) => (
                  <TableRow key={row.bookingId}>
                    <TableCell>
                      <BookingReference bookingId={row.bookingId} unit={row.unit} />
                    </TableCell>
                    <TableCell>{STAGE_LABELS[row.outcome]}</TableCell>
                    <TableCell>{formatDate(row.closedOn)}</TableCell>
                    <TableCell>{formatDaysLong(row.daysToExit)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatRm(row.priceRm)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableFrame>
            {exitList.control}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No recorded cancellations or lapses are in this accessible history.
          </p>
        )}
      </section>

      <section aria-labelledby="second-bank-heading" className="space-y-3">
        <h3 id="second-bank-heading" className="text-base font-semibold text-foreground">
          Second-Bank Outcomes
        </h3>
        <p className="text-sm leading-5 text-muted-foreground">
          {insights.secondBank.attemptedCount} bookings that went to another bank after a rejection,{' '}
          {insights.secondBank.resolvedCount} completed booking{insights.secondBank.resolvedCount === 1 ? '' : 's'},{' '}
          {insights.secondBank.signedCount} signed, and {insights.secondBank.pendingCount} still open.
        </p>
        {insights.secondBank.resolvedCount > 0 ? (
          <p className="text-sm leading-5 text-muted-foreground">
            {insights.secondBank.signedCount} of {insights.secondBank.resolvedCount} completed booking
            {insights.secondBank.resolvedCount === 1 ? '' : 's'} signed. This is an observed sample and may be small; it
            does not guarantee another booking will sign.
          </p>
        ) : (
          <p className="text-sm leading-5 text-muted-foreground">
            No completed bookings that went to another bank after a rejection are recorded.
          </p>
        )}
        <p className="text-sm leading-5 text-muted-foreground">
          No recoverable money or units are forecast from these outcomes. They do not establish an uplift or cause a
          future signing.
        </p>
        {insights.secondBank.rows.length > 0 ? (
          <>
            <TableFrame>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Unit / Booking</TableHead>
                  <TableHead>Second-Bank Attempt</TableHead>
                  <TableHead>Recorded Outcome</TableHead>
                  <TableHead className="text-right">Booking Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {retryList.visibleRows.map((row) => (
                  <TableRow key={row.bookingId}>
                    <TableCell>
                      <BookingReference bookingId={row.bookingId} unit={row.unit} />
                    </TableCell>
                    <TableCell>{formatDate(row.resubmittedOn)}</TableCell>
                    <TableCell>
                      {row.outcome === 'open'
                        ? 'Still Open'
                        : row.outcome === 'signed'
                          ? 'Signed'
                          : STAGE_LABELS[row.outcome]}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatRm(row.priceRm)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableFrame>
            {retryList.control}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No bookings are recorded as going to another bank after a rejection.
          </p>
        )}
      </section>

      <section aria-labelledby="financing-reviews-heading" className="space-y-3">
        <h3 id="financing-reviews-heading" className="text-base font-semibold text-foreground">
          Financing Reviews
        </h3>
        {insights.secondBank.followUp.length > 0 ? (
          <>
            <TableFrame>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Unit / Booking</TableHead>
                  <TableHead>Currently Waiting For</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Booking Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviewList.visibleRows.map((row) => (
                  <TableRow key={row.bookingId}>
                    <TableCell>
                      <BookingReference bookingId={row.bookingId} unit={row.unit} />
                    </TableCell>
                    <TableCell>{row.waitingFor || '—'}</TableCell>
                    <TableCell>{row.assigneeName ?? '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatRm(row.priceRm)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableFrame>
            {reviewList.control}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No open rejected bookings are waiting for a financing review.</p>
        )}
      </section>
    </div>
  )
}

function capitalize(value: string): string {
  return value.length > 0 ? value[0]!.toUpperCase() + value.slice(1) : value
}

export function ForecastReports({ insights }: { insights: ForecastInsights }) {
  const supported = insights.forecast.support === 'supported'
  const largestGroup = insights.waiting.groups[0]
  const conversionMedian = insights.turnaround.bookingToSigning.medianDays

  const documents: ForecastDocument[] = [
    {
      id: 'outlook',
      title: 'Signing Outlook',
      summary: 'The signings supported by past booking outcomes, with the cases and deadlines behind the estimate.',
      motif: '/forecast/stages.webp',
      question: FORECAST_DOCUMENT_QUESTIONS.outlook,
      finding: {
        value: supported ? String(Math.round(insights.forecast.expectedSignings)) : '—',
        label: 'Estimated SPAs By Booking Day 30',
        detail: supported
          ? `${insights.forecast.liveBookings} eligible bookings · ${insights.forecast.rangeLow} to ${insights.forecast.rangeHigh} estimated range`
          : undefined
      },
      content: <OutlookReport insights={insights} />
    },
    {
      id: 'approved',
      title: 'Approved, Awaiting SPA',
      summary: 'Approved loans that have not reached an SPA, ordered by how long they have waited.',
      motif: '/forecast/assumptions.webp',
      question: FORECAST_DOCUMENT_QUESTIONS.approved,
      finding: {
        value: formatRmCompact(insights.approved.valueRm),
        label: `${insights.approved.count} Approved Bookings Awaiting SPA`,
        detail: `${insights.approved.withoutAppointmentCount} without a recorded appointment`
      },
      content: <ApprovedReport insights={insights} />
    },
    {
      id: 'waiting',
      title: 'Where Bookings Are Waiting',
      summary:
        'The unsigned pipeline by who holds the next move, including bookings older than the estimate’s 30-day window.',
      motif: '/forecast/spread.webp',
      question: FORECAST_DOCUMENT_QUESTIONS.waiting,
      finding: {
        value: formatRmCompact(largestGroup?.valueRm ?? 0),
        label: largestGroup ? `Waiting On ${capitalize(BALL_HOLDER_LABELS[largestGroup.holder])}` : 'No Open Bookings',
        detail:
          largestGroup?.oldestDays === null || !largestGroup
            ? undefined
            : `${largestGroup.count} bookings · longest time in stage ${largestGroup.oldestDays} days`
      },
      content: <WaitingReport insights={insights} />
    },
    {
      id: 'conversion',
      title: 'Conversion And Turnaround',
      summary: 'Observed signing outcomes and completed turnaround times, with the size of the history behind them.',
      motif: '/forecast/backtest.webp',
      question: FORECAST_DOCUMENT_QUESTIONS.conversion,
      finding: {
        value: conversionMedian === null ? '—' : `${conversionMedian} Days`,
        label: 'Median Booking-To-SPA Time',
        detail: `${insights.turnaround.bookingToSigning.sample} signed bookings in your accessible history`
      },
      content: <ConversionReport insights={insights} />
    },
    {
      id: 'lost',
      title: 'Lost Bookings',
      summary: 'Recorded cancellations and lapses, plus rejected bookings that still need a financing review.',
      motif: '/forecast/leak.webp',
      question: FORECAST_DOCUMENT_QUESTIONS.lost,
      finding: {
        value: formatRmCompact(insights.exits.valueRm),
        label: `${insights.exits.count} Exited Bookings`,
        detail: `${insights.secondBank.followUp.length} open rejected booking${insights.secondBank.followUp.length === 1 ? ' needs' : 's need'} a financing review`
      },
      content: <LostReport insights={insights} />
    }
  ]

  return <ForecastDocuments documents={documents} />
}
