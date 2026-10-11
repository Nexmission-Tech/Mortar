import { describe, expect, it } from 'vitest'
import { forecast } from '../index'
import type { Booking, CaseEvent, Dataset, ForecastModel, Stage } from '../types'

const AS_OF = '2026-10-11'
const STAGES: Stage[] = ['booked', 'loan_applied', 'lo_issued', 'spa_signed', 'loan_agreement', 'disbursed']

function booking(id: string): Booking {
  return {
    id,
    project: 'Test Project',
    unit: id,
    priceRm: 500000,
    bookingDate: '2026-10-10',
    buyer: {
      name: 'Test Buyer',
      ic: '000000-00-9001',
      phone: '+60 00-000 9001',
      age: 36,
      grossMonthlyIncomeRm: 20000,
      monthlyCommitmentsRm: 0,
      propertiesOwned: 0
    },
    salesOwner: 'Test Agent',
    loanOwner: 'Tan Mei Ling',
    legalFirm: 'Test Chambers'
  }
}

function event(id: string, bookingId: string, kind: 'booked' | 'loan_submitted'): CaseEvent {
  return {
    id,
    bookingId,
    applicationId: kind === 'loan_submitted' ? `APP-${bookingId}` : null,
    track: kind === 'loan_submitted' ? 'loan' : 'sales',
    kind,
    occurredAt: `${AS_OF.slice(0, 8)}${kind === 'booked' ? '10' : '11'}T09:00:00+08:00`,
    recordedAt: `${AS_OF}T09:00:00+08:00`,
    reportedBy: 'Test Agent',
    verifiedBy: 'Test Agent',
    status: 'confirmed',
    source: 'staff',
    messageId: null,
    document: null,
    note: null
  }
}

function data(stages: ('booked' | 'loan_applied')[]): Dataset {
  const bookings = stages.map((_, index) => booking(`BK-${index + 1}`))
  return {
    bookings,
    applications: [],
    events: bookings.flatMap((item, index) => [
      event(`EV-${index + 1}-BOOKED`, item.id, 'booked'),
      ...(stages[index] === 'loan_applied' ? [event(`EV-${index + 1}-SUBMITTED`, item.id, 'loan_submitted')] : [])
    ])
  }
}

function model(rates: Partial<Record<'booked' | 'loan_applied', [number, number]>>, overall = [10, 20]): ForecastModel {
  return {
    version: 1,
    asOf: AS_OF,
    refreshedAt: `${AS_OF}T00:00:00+08:00`,
    nextRefreshAt: '2026-10-18T00:00:00+08:00',
    groups: {},
    stages: STAGES.map((stage) => {
      const [signed, resolved] = rates[stage as 'booked' | 'loan_applied'] ?? [0, 0]
      return { stage, signed, resolved }
    }),
    overall: { signed: overall[0]!, resolved: overall[1]! }
  }
}

describe('forecast exact independent-outcome count range', () => {
  it('uses the full count distribution for two half-probability bookings', () => {
    const result = forecast(data(['booked', 'booked']), AS_OF, {
      model: model({ booked: [4, 8] })
    })

    expect(result.perBooking.map((row) => row.probability)).toEqual([0.5, 0.5])
    expect([result.rangeLow, result.rangeHigh]).toEqual([0, 2])
  })

  it('returns the fixed mixed-probability quantiles', () => {
    const result = forecast(data(['booked', 'booked', 'loan_applied']), AS_OF, {
      model: model({ booked: [8, 10], loan_applied: [1, 10] })
    })

    expect(result.expectedSignings).toBeCloseTo(1.7)
    expect([result.rangeLow, result.rangeHigh]).toEqual([1, 2])
  })

  it('keeps a percentile boundary when its cumulative mass rounds just below the threshold', () => {
    const result = forecast(data(['booked']), AS_OF, {
      model: model({ booked: [9, 10] })
    })

    expect(result.perBooking[0]?.probability).toBe(0.9)
    expect([result.rangeLow, result.rangeHigh]).toEqual([0, 1])
  })

  it('keeps deterministic zero and one outcomes in their exact count', () => {
    const result = forecast(data(['booked', 'loan_applied']), AS_OF, {
      model: model({ booked: [10, 10], loan_applied: [0, 10] })
    })

    expect(result.perBooking.map((row) => row.probability)).toEqual([1, 0])
    expect([result.rangeLow, result.rangeHigh]).toEqual([1, 1])
  })

  it('returns zero counts for no live bookings and for unsupported history', () => {
    const noLive = forecast({ bookings: [], applications: [], events: [] }, AS_OF, { model: model({}) })
    const noHistory = forecast(data(['booked', 'loan_applied']), AS_OF, { model: model({}, [0, 0]) })

    expect([noLive.liveBookings, noLive.rangeLow, noLive.rangeHigh]).toEqual([0, 0, 0])
    expect([noHistory.support, noHistory.rangeLow, noHistory.rangeHigh]).toEqual(['insufficient-history', 0, 0])
  })

  it('does not let seed or draw settings change the range', () => {
    const source = data(['booked', 'booked'])
    const aggregate = model({ booked: [4, 8] })
    const oneDraw = forecast(source, AS_OF, { model: aggregate, draws: 1, seed: 1 })
    const manyDraws = forecast(source, AS_OF, { model: aggregate, draws: 5000, seed: 872 })

    expect([manyDraws.rangeLow, manyDraws.rangeHigh]).toEqual([oneDraw.rangeLow, oneDraw.rangeHigh])
    expect([manyDraws.rangeLow, manyDraws.rangeHigh]).toEqual([0, 2])
  })
})
