/**
 * Sales Chart helpers: what each unit state is called, the three filters, and
 * the counts behind the figures and the legend. Pure, so the Grid and the
 * Building view read the same answers.
 */
import {
  awaitingSpaAppointment,
  chartUnits,
  DEFAULT_PROJECT_SETTINGS,
  heldUnits,
  needsAction,
  releaseReview,
  type CaseSummary,
  type ChartUnit,
  type Snapshot,
  type UnitState
} from '@mortar/core'

/** Legend order: stock first, then the booking journey, attention, and the sale. */
export const UNIT_STATES: readonly UnitState[] = [
  'available',
  'booked',
  'loan_approved',
  'needs_action',
  'release_review',
  'signed'
]

export const STATE_LABELS: Record<UnitState, string> = {
  available: 'Available',
  booked: 'Booked',
  loan_approved: 'Loan Approved',
  needs_action: 'Needs Action',
  release_review: 'Release Review',
  signed: 'SPA Signed'
}

export type ChartFilter = 'needs_action' | 'awaiting_appointment' | 'release_review'

export const CHART_FILTERS: readonly { id: ChartFilter; label: string; info: string }[] = [
  { id: 'needs_action', label: 'Needs Action', info: 'Live Bookings The Stall Rule Flagged: The Cases On Today.' },
  {
    id: 'awaiting_appointment',
    label: 'Loan Approved, No SPA Appointment',
    info: 'The Loan Is Through And No Signing Date Is On Record.'
  },
  {
    id: 'release_review',
    label: 'Release Review',
    info: 'Every Recovery Path Looks Spent. A Person Decides Whether To Release The Unit; Mortar Never Cancels.'
  }
]

export function matchesFilter(filter: ChartFilter, summary: CaseSummary): boolean {
  if (filter === 'needs_action') return needsAction(summary)
  if (filter === 'awaiting_appointment') return awaitingSpaAppointment(summary)
  return releaseReview(summary)
}

/**
 * Every unit in the snapshot's layout with its state. A server that sent no
 * `units` (an older deploy, or a test) leaves the chart to the viewer's own
 * bookings, so it still draws rather than going blank.
 */
export function unitsForSnapshot(snapshot: Snapshot, cases: CaseSummary[]): ChartUnit[] {
  const settings = snapshot.projectSettings ?? DEFAULT_PROJECT_SETTINGS
  return chartUnits(settings, snapshot.units ?? heldUnits(settings, snapshot.bookings, cases))
}

/** The codes a filter lights: units the viewer may open whose case matches. */
export function litUnits(units: ChartUnit[], cases: CaseSummary[], filter: ChartFilter): Set<string> {
  const byId = new Map(cases.map((c) => [c.bookingId, c]))
  const lit = new Set<string>()
  for (const unit of units) {
    const summary = unit.bookingId ? byId.get(unit.bookingId) : undefined
    if (summary && matchesFilter(filter, summary)) lit.add(unit.code)
  }
  return lit
}

export function legendCounts(units: ChartUnit[]): Record<UnitState, number> {
  const counts = Object.fromEntries(UNIT_STATES.map((state) => [state, 0])) as Record<UnitState, number>
  for (const unit of units) counts[unit.state] += 1
  return counts
}

/** Live bookings without a signed SPA, among the viewer's own. */
export function activeUnsigned(cases: CaseSummary[]): number {
  return cases.filter((c) => c.stage !== 'cancelled' && c.stage !== 'lapsed' && !c.spaSigned).length
}
