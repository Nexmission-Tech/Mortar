/**
 * What the Sales Chart's unit island says about the selected unit, as plain
 * strings: where it is, its state, and for a case on the viewer's desk the
 * buyer, price, loan line and next step a sales manager asks for first. Pure,
 * so it is tested without rendering.
 */
import { ballInCourt, type CaseSummary, type ChartUnit, type UnitState } from '@mortar/core'
import type { BookingRow } from '@/components/bookings/BookingsTable'
import { formatRm } from '@/components/case/format'
import { nextStepFor } from '@/components/case/nextStep'
import { OWNER_ROLE_LABELS } from '@/components/case/OwnerBadge'
import { NEXT_ACTION_LABELS, ownerName } from '@/components/chase/chase'

export type UnitOverview =
  | {
      kind: 'case'
      code: string
      location: string
      state: UnitState
      age: string
      stalled: boolean
      buyer: string
      bookingId: string
      price: string
      position: string
      nextStep: string | null
    }
  | {
      kind: 'held'
      code: string
      location: string
      state: UnitState
      heldBy: string
    }
  | { kind: 'available'; code: string; location: string; state: 'available' }

/** `Block A · Floor 12 · Unit 03`, without the block when the project has none. */
export function unitLocation(unit: ChartUnit): string {
  const place = `Floor ${unit.floorLabel} · Unit ${unit.unitLabel}`
  return unit.block ? `Block ${unit.block} · ${place}` : place
}

/** The loan and SPA position in one line, from the furthest fact on the log. */
export function loanPosition(summary: CaseSummary): string {
  if (summary.stage === 'cancelled') return 'Booking Cancelled'
  if (summary.stage === 'lapsed') return 'Booking Lapsed'
  if (summary.spaSigned) return 'SPA Signed'
  const approved = summary.applications.find((a) => a.status === 'approved')
  if (approved)
    return `Loan Approved By ${approved.bank} · ${summary.daysSinceSpaSet === null ? 'No SPA Appointment Yet' : 'SPA Appointment Set'}`
  // Every bank still deciding, so the line never depends on the order applications are stored in.
  const deciding = [...new Set(summary.applications.filter((a) => a.status === 'submitted').map((a) => a.bank))]
  if (deciding.length) return `Waiting On ${deciding.join(' And ')} To Decide`
  const waiting = summary.applications.find((a) => a.status === 'documents_pending')
  if (waiting) return `${waiting.bank} Waiting On Documents`
  return summary.applications.length > 0 ? 'No Live Loan Application' : 'No Loan Submitted Yet'
}

export function unitOverview(unit: ChartUnit, row: BookingRow | null): UnitOverview {
  const location = unitLocation(unit)
  if (unit.state === 'available') return { kind: 'available', code: unit.code, location, state: 'available' }
  const state = unit.state
  if (!row)
    return {
      kind: 'held',
      code: unit.code,
      location,
      state,
      heldBy: unit.heldBy ?? 'Another'
    }
  const { booking, summary } = row
  const next = nextStepFor(booking, summary, NEXT_ACTION_LABELS)
  const step = next.defaultStep
  const days = summary.bookingAgeDays
  return {
    kind: 'case',
    code: unit.code,
    location,
    state,
    age: `${days} ${days === 1 ? 'Day' : 'Days'} Old`,
    stalled: ballInCourt(summary).stalled,
    buyer: booking.buyer.name,
    bookingId: booking.id,
    price: formatRm(booking.priceRm),
    position: loanPosition(summary),
    nextStep: next.waitingOnNobody
      ? null
      : `${step.label} · ${OWNER_ROLE_LABELS[step.ownerRole]} · ${ownerName(step.ownerRole, booking)}`
  }
}
