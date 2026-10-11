import { describe, expect, it } from 'vitest'
import type { Booking, CaseEvent, ForecastModel, LoanApplication, Snapshot } from '../types'
import { ASK_QUESTIONS, askBrain, buildAskContext, matchQuestion } from './index'
import { FORECAST_DOCUMENT_QUESTIONS } from './forecast'

const AS_OF = '2026-10-11'

function booking(id: string, unit: string, bookingDate: string, priceRm: number, salesOwner = 'Nurul Aina'): Booking {
  return {
    id,
    project: 'Residensi Ujian',
    unit,
    priceRm,
    bookingDate,
    buyer: {
      name: 'Fixture Buyer',
      ic: '000000-00-0001',
      phone: '+60 00-000 0001',
      age: 34,
      grossMonthlyIncomeRm: 8500,
      monthlyCommitmentsRm: 1200,
      propertiesOwned: 0
    },
    salesOwner,
    loanOwner: 'Tan Mei Ling',
    legalFirm: 'Wong & Partners'
  }
}

function application(id: string, bookingId: string, bank: string): LoanApplication {
  return { id, bookingId, bank, banker: 'Fixture Banker' }
}

function event(
  id: string,
  bookingId: string,
  kind: CaseEvent['kind'],
  occurredOn: string,
  applicationId: string | null = null
): CaseEvent {
  return {
    id,
    bookingId,
    applicationId,
    track: kind === 'spa_signed' ? 'legal' : 'loan',
    kind,
    occurredAt: `${occurredOn}T10:00:00+08:00`,
    recordedAt: `${occurredOn}T10:05:00+08:00`,
    reportedBy: 'Fixture',
    verifiedBy: 'Nurul Aina',
    status: 'confirmed',
    source: 'staff',
    messageId: null,
    document: null,
    note: null
  }
}

const model: ForecastModel = {
  version: 1,
  asOf: '2026-10-05',
  refreshedAt: '2026-10-05T09:00:00+08:00',
  nextRefreshAt: '2026-10-12T09:00:00+08:00',
  groups: {},
  stages: [
    { stage: 'booked', signed: 7, resolved: 14 },
    { stage: 'loan_applied', signed: 5, resolved: 10 },
    { stage: 'lo_issued', signed: 3, resolved: 6 }
  ],
  overall: { signed: 7, resolved: 14 }
}

const fixture: Snapshot = {
  meta: { seed: 20261011, referenceDate: AS_OF, resetAt: null },
  forecastModel: model,
  bookings: [
    booking('BK-OPEN', 'A-10-01', '2026-10-01', 500000),
    booking('BK-APPROVED', 'B-02-01', '2026-08-01', 750000),
    booking('BK-CANCELLED', 'C-03-01', '2026-10-01', 500000),
    booking('BK-REJECTED', 'D-04-01', '2026-09-01', 600000),
    booking('BK-SIGNED', 'E-05-01', '2026-09-01', 700000),
    booking('BK-RETRY', 'F-06-01', '2026-09-01', 350000)
  ],
  applications: [
    application('APP-APPROVED', 'BK-APPROVED', 'Maybank'),
    application('APP-REJECTED', 'BK-REJECTED', 'Public Bank'),
    application('APP-SIGNED', 'BK-SIGNED', 'CIMB'),
    application('APP-RETRY-OLD', 'BK-RETRY', 'RHB'),
    application('APP-RETRY-NEW', 'BK-RETRY', 'CIMB')
  ],
  events: [
    event('EV-OPEN-BOOKED', 'BK-OPEN', 'booked', '2026-10-01'),
    event('EV-APPROVED-BOOKED', 'BK-APPROVED', 'booked', '2026-08-01'),
    event('EV-APPROVED', 'BK-APPROVED', 'loan_approved', '2026-08-12', 'APP-APPROVED'),
    event('EV-CANCEL-BOOKED', 'BK-CANCELLED', 'booked', '2026-10-01'),
    event('EV-CANCEL', 'BK-CANCELLED', 'cancelled', '2026-10-05'),
    event('EV-REJECTED-BOOKED', 'BK-REJECTED', 'booked', '2026-09-01'),
    event('EV-REJECTED', 'BK-REJECTED', 'loan_rejected', '2026-10-02', 'APP-REJECTED'),
    event('EV-SIGNED-BOOKED', 'BK-SIGNED', 'booked', '2026-09-01'),
    event('EV-SIGNED-APPROVED', 'BK-SIGNED', 'loan_approved', '2026-09-08', 'APP-SIGNED'),
    event('EV-SIGNED', 'BK-SIGNED', 'spa_signed', '2026-09-16'),
    event('EV-RETRY-BOOKED', 'BK-RETRY', 'booked', '2026-09-01'),
    event('EV-RETRY-REJECTED', 'BK-RETRY', 'loan_rejected', '2026-09-05', 'APP-RETRY-OLD'),
    event('EV-RETRY-SUBMITTED', 'BK-RETRY', 'loan_submitted', '2026-09-06', 'APP-RETRY-NEW'),
    event('EV-RETRY-SIGNED', 'BK-RETRY', 'spa_signed', '2026-09-25')
  ],
  messages: [],
  playbooks: [],
  tasks: [],
  extractions: [],
  signals: [],
  nextActions: []
}

const context = buildAskContext(fixture)
const forecastQuestions = ASK_QUESTIONS.filter((question) => question.id.startsWith('FORECAST-'))

describe('forecast report questions', () => {
  it('exposes five canonical document questions and maps each to its own answer', () => {
    const expected = [
      ['outlook', 'FORECAST-OUTLOOK'],
      ['approved', 'FORECAST-APPROVED'],
      ['waiting', 'FORECAST-WAITING'],
      ['conversion', 'FORECAST-CONVERSION'],
      ['lost', 'FORECAST-LOST']
    ] as const

    expect(Object.keys(FORECAST_DOCUMENT_QUESTIONS)).toEqual(expected.map(([key]) => key))
    for (const [key, id] of expected) {
      expect(matchQuestion(FORECAST_DOCUMENT_QUESTIONS[key])?.id).toBe(id)
    }
    expect(forecastQuestions.map((question) => question.id)).toEqual(expected.map(([, id]) => id))
    expect(forecastQuestions.every((question) => question.predicate === null && question.desk === 'all')).toBe(true)
    for (const question of forecastQuestions) {
      expect(new Set(question.tags).size).toBeGreaterThanOrEqual(3)
    }
  })

  it('answers from the supplied model and cites the eligible outlook cases', () => {
    const reply = askBrain(FORECAST_DOCUMENT_QUESTIONS.outlook, context)

    expect(reply?.text).toContain('1 eligible booking')
    expect(reply?.text).toContain('0.5 expected signings')
    expect(reply?.text).toContain('14 resolved bookings')
    expect(reply?.citations).toEqual(['BK-OPEN'])
  })

  it('does not describe an older withdrawn booking as part of the estimate', () => {
    const oldWithdrawal = booking('BK-OLD-WITHDRAWN', 'A-10-02', '2026-09-01', 400000)
    const oldContext = buildAskContext({
      ...fixture,
      bookings: [...fixture.bookings, oldWithdrawal],
      events: [
        ...fixture.events,
        event('EV-OLD-BOOKED', oldWithdrawal.id, 'booked', '2026-09-01'),
        event('EV-OLD-WITHDRAWN', oldWithdrawal.id, 'buyer_withdrew', '2026-09-10')
      ]
    })
    const reply = askBrain(FORECAST_DOCUMENT_QUESTIONS.outlook, oldContext)

    expect(reply?.text).toContain('1 eligible booking')
    expect(reply?.text).not.toMatch(/\d+ buyer withdrawals? without recorded closure remain/i)
    expect(reply?.citations).toEqual(['BK-OPEN'])
  })

  it('gives the snapshot appointment window and counts in the outlook', () => {
    const reply = askBrain(FORECAST_DOCUMENT_QUESTIONS.outlook, context)

    expect(reply?.text).toContain('11 Oct 2026 through 10 Nov 2026')
    expect(reply?.text).toContain('0 upcoming, 0 overdue, 0 with a missing date')
  })

  it('reports approved bookings independently of appointment presence', () => {
    const reply = askBrain(FORECAST_DOCUMENT_QUESTIONS.approved, context)

    expect(reply?.text).toContain('1 approved booking')
    expect(reply?.text).toContain('RM 750,000')
    expect(reply?.text).toContain('without a recorded appointment')
    expect(reply?.citations).toEqual(['BK-APPROVED'])
  })

  it('describes the supported empty approved queue without implying cases exist', () => {
    const emptyContext = buildAskContext({ ...fixture, bookings: [], applications: [], events: [] })
    const reply = askBrain(FORECAST_DOCUMENT_QUESTIONS.approved, emptyContext)

    expect(reply?.text).toContain('0 approved bookings awaiting SPA')
    expect(reply?.text).toContain('No approved bookings await an SPA.')
    expect(reply?.text).not.toContain('Every approved booking')
    expect(reply?.citations).toEqual([])
  })

  it('reports the full unsigned queue, including older bookings', () => {
    const reply = askBrain(FORECAST_DOCUMENT_QUESTIONS.waiting, context)

    expect(reply?.text).toContain('3 unsigned bookings')
    expect(reply?.text).toContain('older than the 30-day estimate window')
    expect(reply?.citations).toEqual(['BK-APPROVED', 'BK-REJECTED', 'BK-OPEN'])
  })

  it('reports historical conversion and completed signing times with separate samples', () => {
    const reply = askBrain(FORECAST_DOCUMENT_QUESTIONS.conversion, context)

    expect(reply?.text).toContain('14 resolved project-history bookings')
    expect(reply?.text).toContain('2 signed bookings')
    expect(reply?.text).toContain('19.5 days')
    expect(reply?.text).toContain('8 days from approval')
    expect(reply?.citations).toEqual(['BK-RETRY', 'BK-SIGNED'])
    expect(reply?.text).toContain('Booked 7/14')
    expect(reply?.text).toContain('With Bank 5/10')
    expect(reply?.text).toContain('Loan Approved 3/6')
    expect(reply?.text).toContain('the rate shows how many signed by day 30')
  })

  it('reports cancellations, lapsed cases, and financing follow-ups without promising recovery', () => {
    const reply = askBrain(FORECAST_DOCUMENT_QUESTIONS.lost, context)

    expect(reply?.text).toContain('1 cancellation')
    expect(reply?.text).toContain('1 open rejected booking')
    expect(reply?.text).toContain('1 of 1 completed booking that went to another bank after a rejection signed')
    expect(reply?.text).toContain('No recoverable money or units are forecast')
    expect(reply?.citations).toEqual(['BK-REJECTED', 'BK-CANCELLED', 'BK-RETRY'])
  })

  it('keeps a live financing review cited when historical exits exceed the citation cap', () => {
    const exits = Array.from({ length: 7 }, (_, index) => {
      const id = `BK-EXTRA-EXIT-${index + 1}`
      return {
        booking: booking(id, `H-01-0${index + 1}`, '2026-09-01', 100000 + index),
        events: [
          event(`EV-${id}-BOOKED`, id, 'booked', '2026-09-01'),
          event(`EV-${id}-CANCELLED`, id, 'cancelled', '2026-09-10')
        ]
      }
    })
    const manyExits = buildAskContext({
      ...fixture,
      bookings: [...fixture.bookings, ...exits.map((item) => item.booking)],
      events: [...fixture.events, ...exits.flatMap((item) => item.events)]
    })
    const reply = askBrain(FORECAST_DOCUMENT_QUESTIONS.lost, manyExits)

    expect(reply?.citations).toContain('BK-REJECTED')
    expect(reply?.citations.length).toBeLessThanOrEqual(6)
  })

  it('describes an empty second-bank sample as bookings rather than attempts', () => {
    const noRetries = buildAskContext({
      ...fixture,
      bookings: fixture.bookings.filter((item) => item.id !== 'BK-RETRY'),
      applications: fixture.applications.filter((item) => item.bookingId !== 'BK-RETRY'),
      events: fixture.events.filter((item) => item.bookingId !== 'BK-RETRY')
    })
    const reply = askBrain(FORECAST_DOCUMENT_QUESTIONS.lost, noRetries)

    expect(reply?.text).toContain('No completed bookings that went to another bank after a rejection are recorded.')
  })

  it('ends every report answer cleanly, cites at most six real records, and offers no action', () => {
    for (const question of forecastQuestions) {
      const reply = askBrain(question.question, context)
      expect(reply).not.toBeNull()
      expect(reply?.text.trimEnd().endsWith('.')).toBe(true)
      expect(reply?.text).not.toMatch(/undefined|NaN|\[object|RM NaN/)
      expect(reply?.citations.length).toBeLessThanOrEqual(6)
      expect(new Set(reply?.citations).size).toBe(reply?.citations.length)
      expect(reply?.citations.every((id) => fixture.bookings.some((booking) => booking.id === id))).toBe(true)
      expect(reply?.action).toBeUndefined()
    }
  })

  it('describes the forecast value as weighted booking value and anchors its horizon to booking day 30', () => {
    const reply = askBrain('What Is The Forecast Worth In Ringgit?', context)

    expect(reply?.text).toContain('weighted booking value')
    expect(reply?.text).toContain('30 days of booking')
    expect(reply?.text).toContain('not guaranteed proceeds')
  })
})
