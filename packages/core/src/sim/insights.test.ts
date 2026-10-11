import { describe, expect, it } from 'vitest'
import { forecastInsights } from '../index'
import type { Booking, CaseEvent, Dataset, EvidenceStatus, EventKind, LoanApplication, Track } from '../types'

const AS_OF = '2026-10-31'

function booking(id: string, bookingDate = '2026-10-01', priceRm = 500000): Booking {
  return {
    id,
    project: 'Test Project',
    unit: id,
    priceRm,
    bookingDate,
    buyer: {
      name: `Private Buyer ${id}`,
      ic: `000000-00-${id.slice(-4).padStart(4, '0')}`,
      phone: '+60 00-000 0000',
      age: 36,
      grossMonthlyIncomeRm: 20000,
      monthlyCommitmentsRm: 0,
      propertiesOwned: 0
    },
    salesOwner: 'Nurul Aina',
    loanOwner: 'Tan Mei Ling',
    legalFirm: 'Test Chambers'
  }
}

function application(id: string, bookingId: string, bank: string): LoanApplication {
  return { id, bookingId, bank, banker: 'Private Banker' }
}

function event(
  id: string,
  bookingId: string,
  kind: EventKind,
  date: string,
  options: {
    applicationId?: string | null
    recordedDate?: string
    status?: EvidenceStatus
    note?: string | null
    document?: CaseEvent['document']
    time?: string
    seq?: number
    track?: Track
  } = {}
): CaseEvent {
  const track =
    options.track ??
    (kind.startsWith('loan_') || kind.startsWith('documents_') || kind === 'valuation_shortfall'
      ? 'loan'
      : kind.startsWith('spa_') || kind === 'loan_agreement_signed' || kind === 'disbursed'
        ? 'legal'
        : 'sales')
  const time = options.time ?? '09:00'
  return {
    id,
    bookingId,
    applicationId: options.applicationId ?? null,
    track,
    kind,
    occurredAt: `${date}T${time}:00+08:00`,
    recordedAt: `${options.recordedDate ?? date}T${time}:00+08:00`,
    reportedBy: 'Test Agent',
    verifiedBy: 'Test Agent',
    status: options.status ?? 'confirmed',
    source: 'staff',
    messageId: null,
    document: options.document ?? null,
    note: options.note ?? null,
    ...(options.seq === undefined ? {} : { seq: options.seq })
  }
}

function dataset(bookings: Booking[], applications: LoanApplication[] = [], events: CaseEvent[] = []): Dataset {
  return { bookings, applications, events }
}

function bookingEvidence(bookingId: string, date: string): CaseEvent {
  return event(`EV-${bookingId}-BOOKED`, bookingId, 'booked', date)
}

describe('forecastInsights evidence and visible scope', () => {
  it('filters future, late-recorded, provisional, disputed and superseded evidence', () => {
    const first = booking('BK-EVIDENCE')
    const noUpdate = booking('BK-NO-UPDATE', '2026-10-02')
    const future = booking('BK-FUTURE', '2026-11-01')
    const result = forecastInsights(
      dataset(
        [first, noUpdate, future],
        [application('APP-PHANTOM', first.id, 'Apex Bank')],
        [
          bookingEvidence(first.id, first.bookingDate),
          event('EV-FUTURE', first.id, 'loan_submitted', '2026-11-01', { applicationId: 'APP-PHANTOM' }),
          event('EV-LATE', first.id, 'loan_approved', '2026-10-05', {
            applicationId: 'APP-PHANTOM',
            recordedDate: '2026-11-01'
          }),
          event('EV-PROVISIONAL', first.id, 'loan_submitted', '2026-10-06', {
            applicationId: 'APP-PHANTOM',
            status: 'provisional'
          }),
          event('EV-DISPUTED', first.id, 'loan_approved', '2026-10-07', {
            applicationId: 'APP-PHANTOM',
            status: 'disputed'
          }),
          event('EV-SUPERSEDED', first.id, 'loan_submitted', '2026-10-08', {
            applicationId: 'APP-PHANTOM',
            status: 'superseded'
          })
        ]
      ),
      AS_OF
    )

    expect(result.open.count).toBe(2)
    expect(result.open.olderCount).toBe(1)
    expect(result.waiting.rows.find((row) => row.bookingId === first.id)).toMatchObject({
      stage: 'booked',
      daysSinceUpdate: 30,
      holder: 'developer',
      waitingFor: 'The Loan Documents To Be Collected'
    })
    expect(result.waiting.rows.find((row) => row.bookingId === noUpdate.id)?.daysSinceUpdate).toBeNull()
    expect(result.waiting.rows.some((row) => row.bookingId === future.id)).toBe(false)
    expect(result.outlook.map((row) => row.probability)).toEqual([0])
  })

  it('exposes only applications with confirmed as-of loan or document evidence', () => {
    const item = booking('BK-DOC-EVIDENCE')
    const result = forecastInsights(
      dataset(
        [item],
        [
          application('APP-DOCS', item.id, 'Apex Bank'),
          application('APP-EMPTY-1', item.id, 'Empty Bank One'),
          application('APP-EMPTY-2', item.id, 'Empty Bank Two')
        ],
        [
          bookingEvidence(item.id, item.bookingDate),
          event('EV-DOC-REQUEST', item.id, 'documents_requested', '2026-10-10', {
            applicationId: 'APP-DOCS',
            document: 'payslip'
          })
        ]
      ),
      AS_OF
    )

    expect(result.waiting.rows[0]).toMatchObject({
      bookingId: item.id,
      stage: 'loan_applied',
      holder: 'buyer',
      waitingFor: 'Payslip From The Buyer',
      nextMove: 'request_document'
    })
  })

  it('uses model counts and dates without adding identities outside supplied bookings', () => {
    const visible = booking('BK-VISIBLE', '2026-10-02')
    const source = dataset(
      [visible],
      [],
      [
        event('EV-LATE', visible.id, 'buyer_contacted', '2026-10-20'),
        bookingEvidence(visible.id, visible.bookingDate),
        event('EV-MIDDLE', visible.id, 'buyer_contacted', '2026-10-10')
      ]
    )
    const originalEvents = [...source.events]
    const result = forecastInsights(source, AS_OF, {
      model: {
        version: 1,
        asOf: '2026-10-30',
        refreshedAt: '2026-10-31T08:00:00+08:00',
        nextRefreshAt: '2026-11-07T08:00:00+08:00',
        groups: {},
        stages: [],
        overall: { signed: 12, resolved: 40 }
      }
    })

    expect(result.history).toEqual({ scope: 'project', asOf: '2026-10-30', resolved: 40, signed: 12 })
    expect(result.forecast.perBooking.map((row) => row.bookingId)).toEqual([visible.id])
    expect(result.open.count).toBe(1)
    expect(JSON.stringify(result)).not.toContain('Private Buyer')
    expect(JSON.stringify(result)).not.toContain('000000-00-')
    expect(source.events).toEqual(originalEvents)
  })

  it('returns empty visible history and null medians when no records exist', () => {
    const result = forecastInsights(dataset([], [], []), AS_OF)
    const unsupportedLive = forecastInsights(dataset([booking('BK-UNSUPPORTED', '2026-10-02')]), AS_OF)

    expect(result.history).toEqual({ scope: 'visible', asOf: AS_OF, resolved: 0, signed: 0 })
    expect(result.open).toEqual({ count: 0, valueRm: 0, olderCount: 0, withdrawnCount: 0 })
    expect(result.forecast.support).toBe('insufficient-history')
    expect(result.turnaround.bookingToSigning).toEqual({ sample: 0, medianDays: null })
    expect(result.turnaround.approvalToSigning).toEqual({ sample: 0, medianDays: null })
    expect(result.exits.medianDaysToExit).toBeNull()
    expect(unsupportedLive.outlook[0]?.probability).toBeNull()
  })
})

describe('forecastInsights open booking queues', () => {
  it('keeps old and withdrawn bookings open and recognizes withdrawal re-entry', () => {
    const withdrawn = booking('BK-WITHDRAWN', '2026-09-01', 700000)
    const reentered = booking('BK-REENTERED', '2026-09-01', 600000)
    const result = forecastInsights(
      dataset(
        [withdrawn, reentered],
        [
          application('APP-WITHDRAWN', withdrawn.id, 'Apex Bank'),
          application('APP-REENTERED', reentered.id, 'Apex Bank')
        ],
        [
          bookingEvidence(withdrawn.id, withdrawn.bookingDate),
          event('EV-APPROVE-BEFORE-WITHDRAW', withdrawn.id, 'loan_approved', '2026-09-08', {
            applicationId: 'APP-WITHDRAWN'
          }),
          event('EV-WITHDRAW', withdrawn.id, 'buyer_withdrew', '2026-09-10'),
          bookingEvidence(reentered.id, reentered.bookingDate),
          event('EV-REENTER-WITHDRAW', reentered.id, 'buyer_withdrew', '2026-09-10'),
          event('EV-REENTRY', reentered.id, 'loan_submitted', '2026-09-12', { applicationId: 'APP-REENTERED' })
        ]
      ),
      AS_OF
    )

    expect(result.open).toEqual({ count: 2, valueRm: 1300000, olderCount: 2, withdrawnCount: 1 })
    expect(result.approved.count).toBe(0)
    expect(result.waiting.rows.find((row) => row.bookingId === withdrawn.id)).toMatchObject({
      stage: 'lo_issued',
      ageDays: 60,
      holder: 'developer',
      nextMove: 'review_release'
    })
    expect(result.waiting.rows.find((row) => row.bookingId === reentered.id)).toMatchObject({
      stage: 'loan_applied',
      holder: 'bank',
      waitingFor: 'Apex Bank To Decide On The Loan'
    })
    expect(result.waiting.groups.reduce((sum, group) => sum + group.count, 0)).toBe(2)
  })

  it('uses one waiting holder per booking and sorts the oldest known stage waits first', () => {
    const older = booking('BK-OLDER', '2026-09-01')
    const newer = booking('BK-NEWER', '2026-10-20', 600000)
    const unknown = booking('BK-UNKNOWN-UPDATE', '2026-10-01', 700000)
    const result = forecastInsights(
      dataset(
        [older, newer, unknown],
        [application('APP-OLDER', older.id, 'Apex Bank')],
        [
          bookingEvidence(older.id, older.bookingDate),
          event('EV-SUBMIT-OLD', older.id, 'loan_submitted', '2026-09-16', { applicationId: 'APP-OLDER' }),
          bookingEvidence(newer.id, newer.bookingDate)
        ]
      ),
      AS_OF
    )

    expect(result.waiting.rows.map((row) => row.bookingId)).toEqual([older.id, newer.id, unknown.id])
    expect(result.waiting.rows[0]?.daysInStage).toBe(45)
    expect(result.waiting.groups).toEqual([
      { holder: 'developer', count: 2, valueRm: 1300000, oldestDays: 11 },
      { holder: 'bank', count: 1, valueRm: 500000, oldestDays: 45 }
    ])
  })
})

describe('forecastInsights appointments and approval', () => {
  it('uses inclusive appointment boundaries and lets an undated reschedule replace an older date', () => {
    const ids = ['TODAY', 'END', 'OVERDUE', 'RESCHEDULED', 'INVALID', 'NONE']
    const bookings = ids.map((id) => booking(`BK-${id}`))
    const applications = ids.map((id) => application(`APP-${id}`, `BK-${id}`, 'Apex Bank'))
    const appointment = (id: string, date: string, note: string) =>
      event(`EV-${id}-${date}`, `BK-${id}`, 'spa_appointment_set', date, { note })
    const events = bookings.flatMap((item) => [
      event(`EV-${item.id}-APPROVED`, item.id, 'loan_approved', '2026-10-01', {
        applicationId: `APP-${item.id.slice(3)}`
      }),
      ...(item.id === 'BK-TODAY'
        ? [appointment('TODAY', '2026-10-10', 'Appointment On 2026-10-31')]
        : item.id === 'BK-END'
          ? [appointment('END', '2026-10-10', 'Appointment On 2026-11-30')]
          : item.id === 'BK-OVERDUE'
            ? [appointment('OVERDUE', '2026-10-10', 'Appointment On 2026-10-30')]
            : item.id === 'BK-RESCHEDULED'
              ? [
                  appointment('RESCHEDULED', '2026-10-10', 'Appointment On 2026-11-01'),
                  appointment('RESCHEDULED', '2026-10-20', 'Reschedule pending confirmation')
                ]
              : item.id === 'BK-INVALID'
                ? [appointment('INVALID', '2026-10-10', 'Appointment On 2026-02-31')]
                : [])
    ])
    const result = forecastInsights(dataset(bookings, applications, events), AS_OF)

    expect(result.approved.count).toBe(6)
    expect(result.approved.withoutAppointmentCount).toBe(1)
    expect(result.approved.rows.find((row) => row.bookingId === 'BK-RESCHEDULED')).toMatchObject({
      appointmentRecorded: true,
      appointmentOn: null
    })
    expect(result.approved.rows.find((row) => row.bookingId === 'BK-NONE')?.appointmentRecorded).toBe(false)
    expect(result.appointments).toMatchObject({
      from: AS_OF,
      to: '2026-11-30',
      upcoming: [
        { bookingId: 'BK-TODAY', appointmentOn: '2026-10-31' },
        { bookingId: 'BK-END', appointmentOn: '2026-11-30' }
      ],
      overdue: [{ bookingId: 'BK-OVERDUE', appointmentOn: '2026-10-30' }],
      undatedCount: 2
    })
  })
})

describe('forecastInsights outcomes and turnaround', () => {
  it('uses separate valid samples for booking and approval turnaround', () => {
    const bookings = [
      booking('BK-TURN-1', '2026-10-01'),
      booking('BK-TURN-2', '2026-10-10'),
      booking('BK-TURN-3', '2026-09-01'),
      booking('BK-TURN-4', '2026-10-01')
    ]
    const events = [
      event('EV-1-APPROVED', 'BK-TURN-1', 'loan_approved', '2026-10-06', { applicationId: 'APP-1' }),
      event('EV-1-SIGNED', 'BK-TURN-1', 'spa_signed', '2026-10-11'),
      event('EV-2-SIGNED', 'BK-TURN-2', 'spa_signed', '2026-10-15'),
      event('EV-3-APPROVED', 'BK-TURN-3', 'loan_approved', '2026-09-11', { applicationId: 'APP-3' }),
      event('EV-3-SIGNED', 'BK-TURN-3', 'spa_signed', '2026-10-01'),
      event('EV-4-SIGNED', 'BK-TURN-4', 'spa_signed', '2026-10-10'),
      event('EV-4-LATE-APPROVAL', 'BK-TURN-4', 'loan_approved', '2026-10-15', { applicationId: 'APP-4' })
    ]
    const result = forecastInsights(dataset(bookings, [], events), AS_OF)

    expect(result.turnaround.bookingToSigning).toEqual({ sample: 4, medianDays: 9.5 })
    expect(result.turnaround.approvalToSigning).toEqual({ sample: 2, medianDays: 12.5 })
    expect(result.turnaround.rows.map((row) => row.bookingId)).toEqual([
      'BK-TURN-2',
      'BK-TURN-1',
      'BK-TURN-4',
      'BK-TURN-3'
    ])
    expect(result.turnaround.rows.find((row) => row.bookingId === 'BK-TURN-4')?.approvalToSigningDays).toBeNull()
  })

  it('counts only explicit exits and excludes any booking with a confirmed signing', () => {
    const cancelled = booking('BK-CANCELLED', '2026-10-01', 500000)
    const lapsed = booking('BK-LAPSED', '2026-10-01', 600000)
    const withdrawn = booking('BK-WITHDRAWAL', '2026-09-01', 700000)
    const signedThenClosed = booking('BK-SIGNED-CLOSED', '2026-10-01', 800000)
    const result = forecastInsights(
      dataset(
        [cancelled, lapsed, withdrawn, signedThenClosed],
        [],
        [
          event('EV-CANCEL', cancelled.id, 'cancelled', '2026-10-11'),
          event('EV-LAPSE', lapsed.id, 'lapsed', '2026-10-21'),
          event('EV-WITHDRAW', withdrawn.id, 'buyer_withdrew', '2026-09-10'),
          event('EV-SIGNED', signedThenClosed.id, 'spa_signed', '2026-10-15'),
          event('EV-CANCEL-AFTER-SIGN', signedThenClosed.id, 'cancelled', '2026-10-20')
        ]
      ),
      AS_OF
    )

    expect(result.open).toMatchObject({ count: 1, valueRm: 700000, olderCount: 1, withdrawnCount: 1 })
    expect(result.exits).toMatchObject({
      count: 2,
      valueRm: 1100000,
      cancelledCount: 1,
      lapsedCount: 1,
      medianDaysToExit: 15
    })
    expect(result.exits.rows.map((row) => row.bookingId)).toEqual([lapsed.id, cancelled.id])
    expect(result.exits.rows.every((row) => row.outcome !== 'cancelled' || row.closedOn === '2026-10-11')).toBe(true)
  })

  it('returns an empty open queue when every supplied booking is signed', () => {
    const bookings = [booking('BK-ALL-SIGNED-1'), booking('BK-ALL-SIGNED-2')]
    const result = forecastInsights(
      dataset(
        bookings,
        [],
        bookings.map((item, index) => event(`EV-SIGNED-${index}`, item.id, 'spa_signed', '2026-10-10'))
      ),
      AS_OF
    )

    expect(result.open).toEqual({ count: 0, valueRm: 0, olderCount: 0, withdrawnCount: 0 })
    expect(result.waiting.rows).toEqual([])
    expect(result.exits.count).toBe(0)
    expect(result.turnaround.bookingToSigning.sample).toBe(2)
  })

  it('returns an empty open queue when every supplied booking has an explicit exit', () => {
    const cancelled = booking('BK-ALL-CANCELLED')
    const lapsed = booking('BK-ALL-LAPSED')
    const result = forecastInsights(
      dataset(
        [cancelled, lapsed],
        [],
        [
          event('EV-ALL-CANCELLED', cancelled.id, 'cancelled', '2026-10-10'),
          event('EV-ALL-LAPSED', lapsed.id, 'lapsed', '2026-10-11')
        ]
      ),
      AS_OF
    )

    expect(result.open.count).toBe(0)
    expect(result.waiting.rows).toEqual([])
    expect(result.exits.count).toBe(2)
  })
})

describe('forecastInsights second-bank observations', () => {
  it('counts the first known distinct-bank retry and keeps only genuinely actionable follow-up', () => {
    const ids = [
      'SIGNED',
      'LAPSED',
      'SAME',
      'PARALLEL',
      'FOLLOW',
      'UNKNOWN',
      'CLOSED',
      'PROVISIONAL',
      'SEQ',
      'POST-SIGN'
    ]
    const bookings = ids.map((id) => booking(`BK-${id}`))
    const apps = [
      application('APP-S1', 'BK-SIGNED', 'Maybank'),
      application('APP-S2', 'BK-SIGNED', 'CIMB'),
      application('APP-L1', 'BK-LAPSED', 'Maybank'),
      application('APP-L2', 'BK-LAPSED', 'CIMB'),
      application('APP-SAME1', 'BK-SAME', ' Maybank  Berhad '),
      application('APP-SAME2', 'BK-SAME', 'MAYBANK BERHAD'),
      application('APP-P1', 'BK-PARALLEL', 'RHB'),
      application('APP-P2', 'BK-PARALLEL', 'CIMB'),
      application('APP-P3', 'BK-PARALLEL', 'Maybank'),
      application('APP-F1', 'BK-FOLLOW', 'Public Bank'),
      application('APP-U2', 'BK-UNKNOWN', 'CIMB'),
      application('APP-C1', 'BK-CLOSED', 'Public Bank'),
      application('APP-C2', 'BK-CLOSED', 'CIMB'),
      application('APP-R1', 'BK-PROVISIONAL', 'Public Bank'),
      application('APP-R2', 'BK-PROVISIONAL', 'CIMB'),
      application('APP-SEQ1', 'BK-SEQ', 'RHB'),
      application('APP-SEQ2', 'BK-SEQ', 'CIMB'),
      application('APP-Z1', 'BK-POST-SIGN', 'RHB'),
      application('APP-Z2', 'BK-POST-SIGN', 'CIMB'),
      application('APP-PHANTOM', 'BK-FOLLOW', 'Empty Application Bank')
    ]
    const events = [
      event('EV-S-REJECT', 'BK-SIGNED', 'loan_rejected', '2026-10-02', { applicationId: 'APP-S1' }),
      event('EV-S-RETRY', 'BK-SIGNED', 'loan_submitted', '2026-10-03', { applicationId: 'APP-S2' }),
      event('EV-S-SIGNED', 'BK-SIGNED', 'spa_signed', '2026-10-04'),
      event('EV-L-REJECT', 'BK-LAPSED', 'loan_rejected', '2026-10-02', { applicationId: 'APP-L1' }),
      event('EV-L-RETRY', 'BK-LAPSED', 'loan_submitted', '2026-10-03', { applicationId: 'APP-L2' }),
      event('EV-L-LAPSED', 'BK-LAPSED', 'lapsed', '2026-10-04'),
      event('EV-SAME-REJECT', 'BK-SAME', 'loan_rejected', '2026-10-02', { applicationId: 'APP-SAME1' }),
      event('EV-SAME-RETRY', 'BK-SAME', 'loan_submitted', '2026-10-03', { applicationId: 'APP-SAME2' }),
      event('EV-PARALLEL-SUBMIT', 'BK-PARALLEL', 'loan_submitted', '2026-10-01', { applicationId: 'APP-P2' }),
      event('EV-PARALLEL-REJECT', 'BK-PARALLEL', 'loan_rejected', '2026-10-02', { applicationId: 'APP-P1' }),
      event('EV-PARALLEL-APPROVED', 'BK-PARALLEL', 'loan_approved', '2026-10-03', { applicationId: 'APP-P3' }),
      event('EV-FOLLOW-REJECT', 'BK-FOLLOW', 'loan_rejected', '2026-10-02', { applicationId: 'APP-F1' }),
      event('EV-UNKNOWN-REJECT', 'BK-UNKNOWN', 'loan_rejected', '2026-10-02', { applicationId: 'APP-NOT-REAL' }),
      event('EV-UNKNOWN-SUBMIT', 'BK-UNKNOWN', 'loan_submitted', '2026-10-03', { applicationId: 'APP-U2' }),
      event('EV-CLOSED-REJECT', 'BK-CLOSED', 'loan_rejected', '2026-10-02', { applicationId: 'APP-C1' }),
      event('EV-CLOSED', 'BK-CLOSED', 'cancelled', '2026-10-03'),
      event('EV-CLOSED-RETRY', 'BK-CLOSED', 'loan_submitted', '2026-10-04', { applicationId: 'APP-C2' }),
      event('EV-PROVISIONAL-REJECT', 'BK-PROVISIONAL', 'loan_rejected', '2026-10-02', { applicationId: 'APP-R1' }),
      event('EV-PROVISIONAL-RETRY', 'BK-PROVISIONAL', 'loan_submitted', '2026-10-03', {
        applicationId: 'APP-R2',
        status: 'provisional'
      }),
      event('EV-SEQ-REJECT', 'BK-SEQ', 'loan_rejected', '2026-10-02', {
        applicationId: 'APP-SEQ1',
        time: '09:00',
        seq: 1
      }),
      event('EV-SEQ-RETRY', 'BK-SEQ', 'loan_submitted', '2026-10-02', {
        applicationId: 'APP-SEQ2',
        time: '09:00',
        seq: 2
      }),
      event('EV-Z-REJECT', 'BK-POST-SIGN', 'loan_rejected', '2026-10-02', { applicationId: 'APP-Z1' }),
      event('EV-Z-SIGNED', 'BK-POST-SIGN', 'spa_signed', '2026-10-03'),
      event('EV-Z-RETRY-AFTER-SIGN', 'BK-POST-SIGN', 'loan_submitted', '2026-10-04', { applicationId: 'APP-Z2' })
    ]
    const result = forecastInsights(dataset(bookings, apps, events), AS_OF)

    expect(result.secondBank).toMatchObject({
      attemptedCount: 3,
      signedCount: 1,
      resolvedCount: 2,
      pendingCount: 1,
      rows: [
        { bookingId: 'BK-SEQ', resubmittedOn: '2026-10-02', outcome: 'open' },
        { bookingId: 'BK-LAPSED', resubmittedOn: '2026-10-03', outcome: 'lapsed' },
        { bookingId: 'BK-SIGNED', resubmittedOn: '2026-10-03', outcome: 'signed' }
      ],
      followUp: [{ bookingId: 'BK-FOLLOW' }, { bookingId: 'BK-PROVISIONAL' }]
    })
    expect(result.secondBank.rows.some((row) => row.bookingId === 'BK-SAME')).toBe(false)
    expect(result.secondBank.rows.some((row) => row.bookingId === 'BK-CLOSED')).toBe(false)
    expect(result.secondBank.rows.some((row) => row.bookingId === 'BK-POST-SIGN')).toBe(false)
    expect(result.secondBank.followUp.some((row) => row.bookingId === 'BK-PARALLEL')).toBe(false)
    expect(result.secondBank.followUp.some((row) => row.bookingId === 'BK-UNKNOWN')).toBe(false)
    expect(result.waiting.rows.find((row) => row.bookingId === 'BK-PARALLEL')).toMatchObject({
      stage: 'lo_issued',
      holder: 'solicitor'
    })
  })
})
