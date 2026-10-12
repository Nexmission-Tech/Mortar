import { describe, expect, it } from 'vitest'
import type { Booking, CaseEvent, EventKind, IsoDate } from '../types'
import { STORIES } from '../fixtures/stories'
import { DEFAULT_SEED, REFERENCE_DATE, generate } from '../sim'
import { cohortResult } from './cohort'
import { addDays, dateOf, diffDays } from './dates'

const booking = (id: string, bookingDate: IsoDate): Booking => ({
  id,
  project: 'Test Project',
  unit: `A-01-${id.slice(-2)}`,
  priceRm: 500000,
  bookingDate,
  buyer: {
    name: 'Test Buyer',
    ic: '000000-00-0000',
    phone: '+60 00-000 0000',
    age: 30,
    grossMonthlyIncomeRm: 10000,
    monthlyCommitmentsRm: 0,
    propertiesOwned: 0
  },
  salesOwner: 'Test Agent',
  loanOwner: 'Tan Mei Ling',
  legalFirm: 'Test Chambers'
})

const event = (bookingId: string, kind: EventKind, on: IsoDate, extra: Partial<CaseEvent> = {}): CaseEvent => ({
  id: `EV-${bookingId}-${kind}`,
  bookingId,
  applicationId: null,
  track: 'sales',
  kind,
  occurredAt: `${on}T12:00:00+08:00`,
  recordedAt: `${on}T18:00:00+08:00`,
  reportedBy: 'Test',
  verifiedBy: 'Test',
  status: 'confirmed',
  source: 'staff',
  messageId: null,
  document: null,
  note: null,
  ...extra
})

describe('cohortResult', () => {
  const bookings = [
    booking('BK-01', '2026-08-01'),
    booking('BK-02', '2026-08-03'),
    booking('BK-03', '2026-08-05'),
    booking('BK-04', '2026-08-07'),
    booking('BK-05', '2026-09-10'),
    // Outside the intake: never counted.
    booking('BK-06', '2026-07-01')
  ]
  const events = [
    ...bookings.map((b) => event(b.id, 'booked', b.bookingDate)),
    event('BK-01', 'spa_signed', '2026-08-20'),
    event('BK-02', 'spa_signed', '2026-09-15'),
    event('BK-03', 'cancelled', '2026-08-25'),
    // Proposed, not confirmed: not a signing.
    event('BK-04', 'spa_signed', '2026-08-10', { status: 'provisional' }),
    event('BK-06', 'spa_signed', '2026-07-10')
  ]

  it('keeps exits in the denominator and the estimate out of the result', () => {
    expect(cohortResult({ bookings, applications: [], events }, '2026-08-01', '2026-09-17', '2026-09-18')).toEqual({
      from: '2026-08-01',
      to: '2026-09-17',
      asOf: '2026-09-18',
      enrolled: 5,
      signedByDay30: 1,
      signedLater: 1,
      exited: 1,
      unsigned: 2,
      maturing: 1,
      rate: 0.2
    })
  })

  it('reads only what was recorded by the cut-off', () => {
    const lateRecord = [
      ...events,
      event('BK-04', 'spa_signed', '2026-08-30', { recordedAt: '2026-09-20T09:00:00+08:00' })
    ]
    const before = cohortResult(
      { bookings, applications: [], events: lateRecord },
      '2026-08-01',
      '2026-08-31',
      '2026-09-18'
    )
    const after = cohortResult(
      { bookings, applications: [], events: lateRecord },
      '2026-08-01',
      '2026-08-31',
      '2026-09-20'
    )
    expect(before.signedByDay30).toBe(1)
    expect(after.signedByDay30).toBe(2)
  })

  it('has no rate for an empty intake', () => {
    expect(
      cohortResult({ bookings, applications: [], events }, '2026-06-01', '2026-06-30', '2026-09-18').rate
    ).toBeNull()
  })

  // Issue #75's success check: a four-week intake in the demo data matches a hand count.
  it('matches a hand count over a four-week intake of the demo data', () => {
    const dataset = generate({ seed: DEFAULT_SEED, referenceDate: REFERENCE_DATE, bookings: 140 })
    const data = {
      bookings: [...dataset.bookings, ...STORIES.map((s) => s.booking)],
      applications: [...dataset.applications, ...STORIES.flatMap((s) => s.applications)],
      events: [...dataset.events, ...STORIES.flatMap((s) => s.events)]
    }
    const from = addDays(REFERENCE_DATE, -57)
    const to = addDays(REFERENCE_DATE, -30)
    const result = cohortResult(data, from, to, REFERENCE_DATE)

    const intake = data.bookings.filter((b) => b.bookingDate >= from && b.bookingDate <= to)
    const confirmed = (id: string, kind: EventKind) =>
      data.events.filter((e) => e.bookingId === id && e.kind === kind && e.status === 'confirmed')
    const signedByDay30 = intake.filter((b) =>
      confirmed(b.id, 'spa_signed').some((e) => diffDays(b.bookingDate, dateOf(e.occurredAt)) <= 30)
    )
    const exited = intake.filter(
      (b) =>
        confirmed(b.id, 'spa_signed').length === 0 &&
        (confirmed(b.id, 'cancelled').length > 0 || confirmed(b.id, 'lapsed').length > 0)
    )
    expect(result.enrolled).toBe(intake.length)
    expect(result.enrolled).toBeGreaterThan(0)
    expect(result.signedByDay30).toBe(signedByDay30.length)
    expect(result.exited).toBe(exited.length)
    expect(result.signedByDay30 + result.signedLater + result.exited + result.unsigned).toBe(result.enrolled)
    // Every booking in a window that closed 30 days ago has had its full 30 days.
    expect(result.maturing).toBe(0)
  })
})
