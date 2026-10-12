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
  // Not "Booked": every held unit is booked; this is the stretch before the loan comes through.
  booked: 'In Progress',
  loan_approved: 'Loan Approved',
  needs_action: 'Needs Action',
  release_review: 'Release Review',
  signed: 'SPA Signed'
}

export type ChartFilter = 'needs_action' | 'awaiting_appointment' | 'release_review'

export const CHART_FILTERS: readonly { id: ChartFilter; label: string; info: string }[] = [
  {
    id: 'needs_action',
    label: 'Needs Action',
    info: 'Units Whose Booking The Stall Rule Flagged. Release Reviews Are Counted On Their Own.'
  },
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

/**
 * Whether a unit the viewer may open matches a filter. Needs Action and Release
 * Review follow the unit's state, so the chip, the figure and the legend agree;
 * the closing list reads the case, because it cuts across states.
 */
export function matchesFilter(filter: ChartFilter, unit: ChartUnit, summary: CaseSummary | undefined): boolean {
  if (!unit.bookingId || !summary) return false
  if (filter === 'awaiting_appointment') return awaitingSpaAppointment(summary)
  return unit.state === filter
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
    if (matchesFilter(filter, unit, unit.bookingId ? byId.get(unit.bookingId) : undefined)) lit.add(unit.code)
  }
  return lit
}

/** Sales owners across all desks, with their held-unit counts and first spelling. */
export function salesOwners(units: ChartUnit[]): { name: string; count: number }[] {
  const owners = new Map<string, { name: string; codes: Set<string> }>()
  for (const unit of units) {
    if (unit.heldBy === null) continue
    const name = unit.heldBy.trim()
    const key = name.toLowerCase()
    const owner = owners.get(key) ?? { name, codes: new Set<string>() }
    owner.codes.add(unit.code)
    owners.set(key, owner)
  }
  return [...owners.values()]
    .map(({ name, codes }) => ({ name, count: codes.size }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** Held codes for one owner, regardless of whether this viewer may open the case. */
export function soldByUnits(units: ChartUnit[], name: string): Set<string> {
  const key = name.trim().toLowerCase()
  return new Set(
    units.filter((unit) => unit.heldBy !== null && unit.heldBy.trim().toLowerCase() === key).map((unit) => unit.code)
  )
}

/** One highlight shared by both views: a person, a scoped filter, or their intersection. */
export function highlightedUnits(
  units: ChartUnit[],
  cases: CaseSummary[],
  filter: ChartFilter | null,
  soldBy: string | null
): Set<string> | null {
  const filtered = filter ? litUnits(units, cases, filter) : null
  if (soldBy === null) return filtered
  const owned = soldByUnits(units, soldBy)
  return filtered ? new Set([...owned].filter((code) => filtered.has(code))) : owned
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

/** Standing bookings (not cancelled or lapsed) among the viewer's own, and how many of them are signed. */
export function bookedAndSigned(cases: CaseSummary[]): { booked: number; signed: number } {
  const standing = cases.filter((c) => c.stage !== 'cancelled' && c.stage !== 'lapsed')
  return { booked: standing.length, signed: standing.filter((c) => c.spaSigned).length }
}
