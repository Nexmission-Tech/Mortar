import type { Dataset, IsoDate } from '../types'
import { deriveCase, groupBy } from './cases'
import { HORIZON_DAYS } from './constants'

/**
 * One intake cohort's recorded result: every booking made between `from` and
 * `to`, and where each stands at `asOf`. The 30-day verified SPA rate is
 * `signedByDay30` over `enrolled`, with cancelled and lapsed bookings kept in
 * the count, so a gain cannot come from leaving failures out. It reads
 * confirmed events only, never the forecast's estimate.
 */
export interface CohortResult {
  from: IsoDate
  to: IsoDate
  asOf: IsoDate
  /** Every booking dated from `from` to `to`, whatever became of it. */
  enrolled: number
  /** A confirmed SPA signing by booking day 30. */
  signedByDay30: number
  /** Signed after booking day 30: a later conversion, outside the timing measure. */
  signedLater: number
  /** Cancelled or lapsed without a signing. */
  exited: number
  /** Neither signed nor exited yet. */
  unsigned: number
  /** Of `unsigned`, those not yet 30 days from booking: the result is not final while any remain. */
  maturing: number
  /** `signedByDay30 / enrolled`; `null` for an empty cohort. */
  rate: number | null
}

/** The recorded day-30 result for the bookings made from `from` through `to`, as of `asOf`. */
export function cohortResult(data: Dataset, from: IsoDate, to: IsoDate, asOf: IsoDate): CohortResult {
  const appsByBooking = groupBy(data.applications, (x) => x.bookingId)
  const eventsByBooking = groupBy(data.events, (x) => x.bookingId)
  const result: CohortResult = {
    from,
    to,
    asOf,
    enrolled: 0,
    signedByDay30: 0,
    signedLater: 0,
    exited: 0,
    unsigned: 0,
    maturing: 0,
    rate: null
  }
  for (const booking of data.bookings) {
    if (booking.bookingDate < from || booking.bookingDate > to || booking.bookingDate > asOf) continue
    const facts = deriveCase(booking, appsByBooking.get(booking.id) ?? [], eventsByBooking.get(booking.id) ?? [], asOf)
    result.enrolled += 1
    if (facts.signedOn !== null) {
      if (facts.signedWithinHorizon) result.signedByDay30 += 1
      else result.signedLater += 1
    } else if (facts.terminal !== null) result.exited += 1
    else {
      result.unsigned += 1
      if (facts.ageDays < HORIZON_DAYS) result.maturing += 1
    }
  }
  result.rate = result.enrolled > 0 ? result.signedByDay30 / result.enrolled : null
  return result
}
