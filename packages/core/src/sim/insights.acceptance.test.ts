import { describe, expect, it } from 'vitest'
import { forecastInsights } from '../index'
import type { Booking, CaseEvent, Dataset, EventKind, ForecastModel, LoanApplication } from '../types'

const AS_OF = '2026-09-18'

function booking(id: string, bookingDate = '2026-09-01', priceRm = 500000, unit = id): Booking {
  return {
    id,
    project: 'Fixture Project',
    unit,
    priceRm,
    bookingDate,
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

function application(id: string, bookingId: string, bank: string): LoanApplication {
  return { id, bookingId, bank, banker: 'Fixture Banker' }
}

function event(
  id: string,
  bookingId: string,
  kind: EventKind,
  day: string,
  options: {
    applicationId?: string
    recordedDay?: string
    status?: CaseEvent['status']
    note?: string
    time?: string
    seq?: number
  } = {}
): CaseEvent {
  const time = options.time ?? '09:00'
  return {
    id,
    bookingId,
    applicationId: options.applicationId ?? null,
    track:
      kind.startsWith('loan_') || kind.startsWith('documents_') ? 'loan' : kind.startsWith('spa_') ? 'legal' : 'sales',
    kind,
    occurredAt: `${day}T${time}:00+08:00`,
    recordedAt: `${options.recordedDay ?? day}T${time}:00+08:00`,
    reportedBy: 'Fixture Agent',
    verifiedBy: 'Fixture Agent',
    status: options.status ?? 'confirmed',
    source: 'staff',
    messageId: null,
    document: null,
    note: options.note ?? null,
    ...(options.seq === undefined ? {} : { seq: options.seq })
  }
}

function dataset(bookings: Booking[], applications: LoanApplication[] = [], events: CaseEvent[] = []): Dataset {
  return { bookings, applications, events }
}

function historicalModel(signed = 12, resolved = 40): ForecastModel {
  return {
    version: 1,
    asOf: '2026-09-17',
    refreshedAt: '2026-09-18T00:00:00+08:00',
    nextRefreshAt: '2026-09-25T00:00:00+08:00',
    groups: {},
    stages: [],
    overall: { signed, resolved }
  }
}

describe('forecastInsights acceptance', () => {
  it('orders unsupported null chances by deadline, then booking ID', () => {
    const source = dataset([booking('A', '2026-09-17'), booking('B', '2026-09-10'), booking('C', '2026-09-15')])

    const result = forecastInsights(source, AS_OF)

    expect(result.forecast.support).toBe('insufficient-history')
    expect(result.turnaround.bookingToSigning).toEqual({ sample: 0, medianDays: null })
    expect(result.turnaround.approvalToSigning).toEqual({ sample: 0, medianDays: null })
    expect(result.outlook.map(({ bookingId, probability }) => [bookingId, probability])).toEqual([
      ['B', null],
      ['C', null],
      ['A', null]
    ])
  })

  it('breaks equal supported chances by deadline and ID without mutating frozen input', () => {
    const source = dataset(
      [
        booking('Z', '2026-09-17'),
        booking('C', '2026-09-10'),
        booking('B', '2026-09-10'),
        booking('FUTURE', '2026-09-19')
      ],
      [],
      [event('LATE', 'Z', 'buyer_contacted', '2026-09-18'), event('EARLY', 'Z', 'buyer_contacted', '2026-09-17')]
    )
    Object.freeze(source.bookings)
    Object.freeze(source.applications)
    Object.freeze(source.events)
    source.bookings.forEach(Object.freeze)
    source.events.forEach(Object.freeze)

    const result = forecastInsights(source, AS_OF, { model: historicalModel(20, 40) })

    expect(result.outlook.map(({ bookingId, probability }) => [bookingId, probability])).toEqual([
      ['B', 0.5],
      ['C', 0.5],
      ['Z', 0.5]
    ])
    expect(result.open.count).toBe(3)
    expect(result.forecast.liveBookings).toBe(3)
    expect(result.outlook.some((row) => row.bookingId === 'FUTURE')).toBe(false)
    expect(source.events.map((row) => row.id)).toEqual(['LATE', 'EARLY'])
  })

  it('keeps project history aggregate outside a scoped operational snapshot', () => {
    const visible = booking('VISIBLE', '2026-09-15', 410000)
    const outside = booking('OUTSIDE', '2026-09-01', 990000)
    const source = dataset(
      [visible],
      [application('OUTSIDE-APP', outside.id, 'Outside Bank')],
      [
        event('OUTSIDE-SIGNED', outside.id, 'spa_signed', '2026-09-08'),
        event('OUTSIDE-APPROVED', outside.id, 'loan_approved', '2026-09-05', { applicationId: 'OUTSIDE-APP' })
      ]
    )

    const result = forecastInsights(source, AS_OF, { model: historicalModel(123, 456) })

    expect(result.history).toEqual({ scope: 'project', asOf: '2026-09-17', signed: 123, resolved: 456 })
    expect(result.open).toEqual({ count: 1, valueRm: 410000, olderCount: 0, withdrawnCount: 0 })
    expect(result.forecast.perBooking.map((row) => row.bookingId)).toEqual(['VISIBLE'])
    expect(result.waiting.rows.map((row) => row.bookingId)).toEqual(['VISIBLE'])
    expect(result.approved.count).toBe(0)
    expect(result.turnaround.rows).toEqual([])
    expect(JSON.stringify(result)).not.toContain(outside.id)
  })

  it('reconciles literal booking values, including two exits on one physical unit', () => {
    const source = dataset(
      [
        booking('OPEN', '2026-08-01', 410000),
        booking('WITHDRAWN', '2026-08-10', 620000),
        booking('CANCELLED', '2026-08-01', 730000, 'SAME-UNIT'),
        booking('LAPSED', '2026-08-20', 840000, 'SAME-UNIT'),
        booking('SIGNED', '2026-08-01', 950000)
      ],
      [],
      [
        event('WITHDRAW', 'WITHDRAWN', 'buyer_withdrew', '2026-08-20'),
        event('CANCEL', 'CANCELLED', 'cancelled', '2026-08-15'),
        event('LAPSE', 'LAPSED', 'lapsed', '2026-09-01'),
        event('SIGN', 'SIGNED', 'spa_signed', '2026-08-20')
      ]
    )

    const result = forecastInsights(source, AS_OF)

    expect(result.open).toEqual({ count: 2, valueRm: 1030000, olderCount: 2, withdrawnCount: 1 })
    expect(result.waiting.rows.map((row) => row.priceRm).sort((a, b) => a - b)).toEqual([410000, 620000])
    expect(result.exits).toMatchObject({
      count: 2,
      valueRm: 1570000,
      cancelledCount: 1,
      lapsedCount: 1,
      medianDaysToExit: 13
    })
    expect(result.exits.rows.map((row) => [row.bookingId, row.priceRm])).toEqual([
      ['LAPSED', 840000],
      ['CANCELLED', 730000]
    ])
    expect(result.turnaround.rows.map((row) => row.bookingId)).toEqual(['SIGNED'])
  })

  it('uses only known confirmed appointment evidence through the inclusive window end', () => {
    const source = dataset(
      [booking('BOUNDARY'), booking('BEYOND'), booking('INVALID'), booking('UNDATED')],
      [],
      [
        event('APPROVED-BOUNDARY', 'BOUNDARY', 'loan_approved', '2026-09-05'),
        event('APPROVED-BEYOND', 'BEYOND', 'loan_approved', '2026-09-05'),
        event('APPROVED-INVALID', 'INVALID', 'loan_approved', '2026-09-05'),
        event('APPROVED-UNDATED', 'UNDATED', 'loan_approved', '2026-09-05'),
        event('BOUNDARY-DATED', 'BOUNDARY', 'spa_appointment_set', '2026-09-10', {
          note: 'Appointment On 2026-10-18'
        }),
        event('BOUNDARY-FUTURE', 'BOUNDARY', 'spa_appointment_set', '2026-09-19', {
          note: 'Appointment On 2026-09-20'
        }),
        event('BOUNDARY-LATE', 'BOUNDARY', 'spa_appointment_set', '2026-09-17', {
          recordedDay: '2026-09-19',
          note: 'Appointment On 2026-09-21'
        }),
        event('BEYOND-DATED', 'BEYOND', 'spa_appointment_set', '2026-09-10', {
          note: 'Appointment On 2026-10-19'
        }),
        event('INVALID-DATED', 'INVALID', 'spa_appointment_set', '2026-09-10', {
          note: 'Appointment On 2026-02-31'
        }),
        event('UNDATED-OLD', 'UNDATED', 'spa_appointment_set', '2026-09-10', {
          note: 'Appointment On 2026-09-17'
        }),
        event('UNDATED-NEW', 'UNDATED', 'spa_appointment_set', '2026-09-15', {
          note: 'Reschedule pending'
        }),
        event('UNCONFIRMED', 'BEYOND', 'spa_appointment_set', '2026-09-11', {
          status: 'provisional',
          note: 'Appointment On 2026-09-18'
        })
      ]
    )

    const result = forecastInsights(source, AS_OF)

    expect(result.approved).toMatchObject({ count: 4, valueRm: 2000000, withoutAppointmentCount: 0 })
    expect(result.appointments).toMatchObject({
      from: AS_OF,
      to: '2026-10-18',
      upcoming: [{ bookingId: 'BOUNDARY', appointmentOn: '2026-10-18' }],
      overdue: [],
      undatedCount: 2
    })
    expect(result.approved.rows.find((row) => row.bookingId === 'BEYOND')).toMatchObject({
      appointmentRecorded: true,
      appointmentOn: '2026-10-19'
    })
  })

  it('keeps old, withdrawn, and legal-only cases open without inventing an SPA', () => {
    const source = dataset(
      [
        booking('OLD', '2026-08-01', 100000),
        booking('WITHDRAWN', '2026-09-01', 200000),
        booking('REENTERED', '2026-09-01', 300000),
        booking('AGREEMENT', '2026-09-01', 400000),
        booking('REJECTED-WITHDRAWN', '2026-09-01', 500000)
      ],
      [
        application('WITHDRAWN-APP', 'WITHDRAWN', 'First Bank'),
        application('REENTRY-APP', 'REENTERED', 'Reentry Bank'),
        application('REJECTED-APP', 'REJECTED-WITHDRAWN', 'First Bank')
      ],
      [
        event('APPROVED-WITHDRAWN', 'WITHDRAWN', 'loan_approved', '2026-09-05', {
          applicationId: 'WITHDRAWN-APP'
        }),
        event('WITHDRAW', 'WITHDRAWN', 'buyer_withdrew', '2026-09-10'),
        event('REENTRY-WITHDRAW', 'REENTERED', 'buyer_withdrew', '2026-09-10'),
        event('REENTRY-SUBMIT', 'REENTERED', 'loan_submitted', '2026-09-11', { applicationId: 'REENTRY-APP' }),
        event('LOAN-AGREEMENT', 'AGREEMENT', 'loan_agreement_signed', '2026-09-12'),
        event('DISBURSEMENT', 'AGREEMENT', 'disbursed', '2026-09-13'),
        event('REJECTED', 'REJECTED-WITHDRAWN', 'loan_rejected', '2026-09-05', {
          applicationId: 'REJECTED-APP'
        }),
        event('REJECTED-WITHDRAW', 'REJECTED-WITHDRAWN', 'buyer_withdrew', '2026-09-10')
      ]
    )

    const result = forecastInsights(source, AS_OF)

    expect(result.open).toEqual({ count: 5, valueRm: 1500000, olderCount: 1, withdrawnCount: 2 })
    expect(result.turnaround.rows).toEqual([])
    expect(result.approved.count).toBe(0)
    expect(result.secondBank.followUp).toEqual([])
    expect(result.waiting.rows.find((row) => row.bookingId === 'AGREEMENT')?.stage).toBe('booked')
    expect(result.waiting.rows.find((row) => row.bookingId === 'REENTERED')?.stage).toBe('loan_applied')
  })

  it('counts a retry only after a distinct-bank rejection and once per booking', () => {
    const ids = ['VALID', 'BARE', 'SAME', 'PARALLEL', 'WRONG', 'FUTURE', 'LATE', 'CLOSED', 'SEQ', 'POST-SIGN']
    const bookings = ids.map((id) => booking(id))
    const apps = [
      application('V1', 'VALID', ' Maybank  Berhad '),
      application('V2', 'VALID', 'RHB'),
      application('V3', 'VALID', 'CIMB'),
      application('B1', 'BARE', 'Maybank'),
      application('S1', 'SAME', ' Maybank  Berhad '),
      application('S2', 'SAME', 'MAYBANK BERHAD'),
      application('P1', 'PARALLEL', 'Maybank'),
      application('P2', 'PARALLEL', 'CIMB'),
      application('W1', 'WRONG', 'Maybank'),
      application('OTHER-APP', 'OTHER', 'CIMB'),
      application('F1', 'FUTURE', 'Maybank'),
      application('F2', 'FUTURE', 'CIMB'),
      application('L1', 'LATE', 'Maybank'),
      application('L2', 'LATE', 'CIMB'),
      application('C1', 'CLOSED', 'Maybank'),
      application('C2', 'CLOSED', 'CIMB'),
      application('Q1', 'SEQ', 'Maybank'),
      application('Q2', 'SEQ', 'CIMB'),
      application('Z1', 'POST-SIGN', 'Maybank'),
      application('Z2', 'POST-SIGN', 'CIMB')
    ]
    const events = [
      event('V-REJECT-1', 'VALID', 'loan_rejected', '2026-09-02', { applicationId: 'V1' }),
      event('V-REJECT-2', 'VALID', 'loan_rejected', '2026-09-03', { applicationId: 'V3' }),
      event('V-RETRY', 'VALID', 'loan_submitted', '2026-09-04', { applicationId: 'V2' }),
      event('V-SUBMIT-AGAIN', 'VALID', 'loan_submitted', '2026-09-05', { applicationId: 'V2' }),
      event('V-SIGN', 'VALID', 'spa_signed', '2026-09-06'),
      event('S-REJECT', 'SAME', 'loan_rejected', '2026-09-02', { applicationId: 'S1' }),
      event('S-SUBMIT', 'SAME', 'loan_submitted', '2026-09-03', { applicationId: 'S2' }),
      event('P-SUBMIT', 'PARALLEL', 'loan_submitted', '2026-09-02', { applicationId: 'P2' }),
      event('P-REJECT', 'PARALLEL', 'loan_rejected', '2026-09-03', { applicationId: 'P1' }),
      event('W-REJECT', 'WRONG', 'loan_rejected', '2026-09-02', { applicationId: 'W1' }),
      event('W-SUBMIT', 'WRONG', 'loan_submitted', '2026-09-03', { applicationId: 'OTHER-APP' }),
      event('F-REJECT', 'FUTURE', 'loan_rejected', '2026-09-02', { applicationId: 'F1' }),
      event('F-SUBMIT', 'FUTURE', 'loan_submitted', '2026-09-19', { applicationId: 'F2' }),
      event('L-REJECT', 'LATE', 'loan_rejected', '2026-09-02', { applicationId: 'L1' }),
      event('L-SUBMIT', 'LATE', 'loan_submitted', '2026-09-03', { applicationId: 'L2', recordedDay: '2026-09-19' }),
      event('C-REJECT', 'CLOSED', 'loan_rejected', '2026-09-02', { applicationId: 'C1' }),
      event('C-CLOSE', 'CLOSED', 'cancelled', '2026-09-03'),
      event('C-SUBMIT', 'CLOSED', 'loan_submitted', '2026-09-04', { applicationId: 'C2' }),
      event('Q-SUBMIT', 'SEQ', 'loan_submitted', '2026-09-03', { applicationId: 'Q2', seq: 9 }),
      event('Q-REJECT', 'SEQ', 'loan_rejected', '2026-09-03', { applicationId: 'Q1', seq: 8 }),
      event('Z-REJECT', 'POST-SIGN', 'loan_rejected', '2026-09-02', { applicationId: 'Z1' }),
      event('Z-SIGN', 'POST-SIGN', 'spa_signed', '2026-09-03'),
      event('Z-SUBMIT', 'POST-SIGN', 'loan_submitted', '2026-09-04', { applicationId: 'Z2' })
    ]

    const result = forecastInsights(dataset(bookings, apps, events), AS_OF)

    expect(result.secondBank).toMatchObject({
      attemptedCount: 2,
      signedCount: 1,
      resolvedCount: 1,
      pendingCount: 1,
      rows: [
        { bookingId: 'SEQ', resubmittedOn: '2026-09-03', outcome: 'open' },
        { bookingId: 'VALID', resubmittedOn: '2026-09-04', outcome: 'signed' }
      ]
    })
    expect(result.secondBank.followUp.map((row) => row.bookingId).sort()).toEqual(['FUTURE', 'LATE', 'WRONG'])
  })

  it('uses separate completed turnaround cohorts, including a real zero and late signing', () => {
    const source = dataset(
      [
        booking('SAME-DAY', '2026-09-01'),
        booking('LATE-SIGN', '2026-08-01'),
        booking('LATE-APPROVAL', '2026-09-05'),
        booking('OPEN-QUEUE', '2026-08-01')
      ],
      [],
      [
        event('A0', 'SAME-DAY', 'loan_approved', '2026-09-01'),
        event('S0', 'SAME-DAY', 'spa_signed', '2026-09-01'),
        event('A1', 'LATE-SIGN', 'loan_approved', '2026-08-31'),
        event('S1', 'LATE-SIGN', 'spa_signed', '2026-09-15'),
        event('S2', 'LATE-APPROVAL', 'spa_signed', '2026-09-10'),
        event('A2', 'LATE-APPROVAL', 'loan_approved', '2026-09-12')
      ]
    )

    const result = forecastInsights(source, AS_OF)

    expect(result.turnaround.bookingToSigning).toEqual({ sample: 3, medianDays: 5 })
    expect(result.turnaround.approvalToSigning).toEqual({ sample: 2, medianDays: 7.5 })
    expect(result.turnaround.rows.find((row) => row.bookingId === 'SAME-DAY')).toMatchObject({
      bookingToSigningDays: 0,
      approvalToSigningDays: 0
    })
    expect(result.turnaround.rows.find((row) => row.bookingId === 'LATE-SIGN')?.bookingToSigningDays).toBe(45)
    expect(result.turnaround.rows.find((row) => row.bookingId === 'LATE-APPROVAL')?.approvalToSigningDays).toBeNull()
    expect(result.open.olderCount).toBe(1)
    expect(result.turnaround.rows.some((row) => row.bookingId === 'OPEN-QUEUE')).toBe(false)
  })
})
