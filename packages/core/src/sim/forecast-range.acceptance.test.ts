import { describe, expect, it } from 'vitest'
import { forecast } from '../index'
import type { Booking, CaseEvent, Dataset, ForecastModel, Stage } from '../types'

const AS_OF = '2026-09-18'
const STAGES: Stage[] = ['booked', 'loan_applied', 'lo_issued', 'spa_signed', 'loan_agreement', 'disbursed']

function booking(id: string): Booking {
  return {
    id,
    project: 'Fixture Project',
    unit: id,
    priceRm: 500000,
    bookingDate: '2026-09-17',
    buyer: {
      name: `Fixture Buyer ${id}`,
      ic: '000000-00-0000',
      phone: '+60 00-000 0000',
      age: 35,
      grossMonthlyIncomeRm: 20000,
      monthlyCommitmentsRm: 0,
      propertiesOwned: 0
    },
    salesOwner: 'Nurul Aina',
    loanOwner: 'Tan Mei Ling',
    legalFirm: 'Fixture Chambers'
  }
}

function event(id: string, bookingId: string, kind: 'booked' | 'loan_submitted' | 'loan_approved'): CaseEvent {
  const day = kind === 'booked' ? '2026-09-17' : AS_OF
  return {
    id,
    bookingId,
    applicationId: kind === 'booked' ? null : `APP-${bookingId}`,
    track: kind === 'booked' ? 'sales' : 'loan',
    kind,
    occurredAt: `${day}T09:00:00+08:00`,
    recordedAt: `${day}T09:00:00+08:00`,
    reportedBy: 'Fixture Agent',
    verifiedBy: 'Fixture Agent',
    status: 'confirmed',
    source: 'staff',
    messageId: null,
    document: null,
    note: null
  }
}

function source(ids: string[]): Dataset {
  return {
    bookings: ids.map(booking),
    applications: ids.map((id) => ({ id: `APP-${id}`, bookingId: id, bank: 'Fixture Bank', banker: 'Fixture Banker' })),
    events: ids.flatMap((id) => [
      event(`BOOKED-${id}`, id, 'booked'),
      ...(id === 'MID' || id === 'HIGH' ? [event(`SUBMITTED-${id}`, id, 'loan_submitted')] : []),
      ...(id === 'HIGH' ? [event(`APPROVED-${id}`, id, 'loan_approved')] : [])
    ])
  }
}

function model(rates: Partial<Record<Stage, number>>, signed = 5, resolved = 10): ForecastModel {
  return {
    version: 1,
    asOf: AS_OF,
    refreshedAt: '2026-09-18T00:00:00+08:00',
    nextRefreshAt: '2026-09-25T00:00:00+08:00',
    groups: {},
    stages: STAGES.map((stage) => ({ stage, signed: rates[stage] ?? 0, resolved: 10 })),
    overall: { signed, resolved }
  }
}

describe('public forecast count range acceptance', () => {
  it('uses the exact independent count distribution, regardless of seed or draws', () => {
    // For probabilities 0.1, 0.5, 0.9, enumeration of all eight outcomes gives
    // count masses [0.045, 0.455, 0.455, 0.045]. The 10th and 90th counts are 1 and 2.
    const data = source(['LOW', 'MID', 'HIGH'])
    const aggregate = model({ booked: 1, loan_applied: 5, lo_issued: 9 })

    const oneDraw = forecast(data, AS_OF, { model: aggregate, draws: 1, seed: 1 })
    const manyDraws = forecast(data, AS_OF, { model: aggregate, draws: 10000, seed: 999 })

    expect(oneDraw.perBooking).toEqual([
      { bookingId: 'LOW', probability: 0.1 },
      { bookingId: 'MID', probability: 0.5 },
      { bookingId: 'HIGH', probability: 0.9 }
    ])
    expect(oneDraw.expectedSignings).toBe(1.5)
    expect([oneDraw.rangeLow, oneDraw.rangeHigh]).toEqual([1, 2])
    expect(manyDraws).toEqual(oneDraw)
  })

  it('includes exact 0.1 and 0.9 cumulative boundaries', () => {
    const tenth = forecast(source(['LOW']), AS_OF, { model: model({ booked: 9 }) })
    const ninetieth = forecast(source(['LOW']), AS_OF, { model: model({ booked: 1 }) })

    expect([tenth.rangeLow, tenth.rangeHigh]).toEqual([0, 1])
    expect([ninetieth.rangeLow, ninetieth.rangeHigh]).toEqual([0, 0])
  })

  it('keeps all-zero and all-one outcomes fixed', () => {
    const data = source(['LOW', 'MID', 'HIGH'])
    const zero = forecast(data, AS_OF, { model: model({ booked: 0, loan_applied: 0, lo_issued: 0 }) })
    const one = forecast(data, AS_OF, { model: model({ booked: 10, loan_applied: 10, lo_issued: 10 }) })

    expect([zero.expectedSignings, zero.rangeLow, zero.rangeHigh]).toEqual([0, 0, 0])
    expect([one.expectedSignings, one.rangeLow, one.rangeHigh]).toEqual([3, 3, 3])
  })

  it('separates unsupported history from an observed zero conversion rate', () => {
    const data = source(['LOW'])
    const unsupported = forecast(data, AS_OF)
    const observedZero = forecast(data, AS_OF, { model: model({ booked: 0 }, 0, 10) })

    expect([unsupported.support, unsupported.perBooking[0]?.probability]).toEqual(['insufficient-history', 0])
    expect([observedZero.support, observedZero.perBooking[0]?.probability]).toEqual(['supported', 0])
  })
})
