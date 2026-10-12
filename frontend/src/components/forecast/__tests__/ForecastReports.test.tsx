import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { DEFAULT_SEED, REFERENCE_DATE, STORIES, generate } from '@mortar/core'
import type { Booking, CaseEvent, Dataset, EventKind, ForecastInsights, InsightBooking } from '@mortar/core'
import { ForecastReports, type HistoryReach } from '../ForecastReports'

function row(bookingId: string, overrides: Partial<InsightBooking> = {}): InsightBooking {
  return {
    bookingId,
    unit: 'A-12-01',
    project: 'Residensi Ujian',
    priceRm: 550000,
    bookingDate: '2026-09-01',
    stage: 'loan_applied',
    ageDays: 40,
    daysInStage: 12,
    daysSinceUpdate: 3,
    holder: 'bank',
    waitingFor: 'Apex Bank To Decide On The Loan',
    nextMove: 'chase_banker',
    assigneeName: 'Nurul Aina',
    ...overrides
  }
}

const outlook = [
  { ...row('BK-O-1', { unit: 'A-12-01' }), probability: 0, deadline: '2026-10-01' },
  { ...row('BK-O-2', { unit: 'A-12-02' }), probability: 0.25, deadline: '2026-10-02' },
  { ...row('BK-O-3', { unit: 'A-12-03' }), probability: 0.25, deadline: '2026-10-03' },
  { ...row('BK-O-4', { unit: 'A-12-04' }), probability: 0.5, deadline: '2026-10-04' },
  { ...row('BK-O-5', { unit: 'A-12-05' }), probability: 0.5, deadline: '2026-10-05' },
  { ...row('BK-O-6', { unit: 'A-12-06' }), probability: 0.75, deadline: '2026-10-06' },
  { ...row('BK-O-7', { unit: 'A-12-07' }), probability: 0.75, deadline: '2026-10-07' },
  { ...row('BK-O-8', { unit: 'A-12-08' }), probability: 1, deadline: '2026-10-08' },
  { ...row('BK-O-9', { unit: 'A-12-09' }), probability: null, deadline: '2026-10-09' }
]

const INSIGHTS: ForecastInsights = {
  asOf: '2026-10-11',
  forecast: {
    asOf: '2026-10-11',
    horizonDays: 30,
    liveBookings: 2,
    expectedSignings: 1.25,
    rangeLow: 1,
    rangeHigh: 2,
    stageRates: [
      { stage: 'booked', signed: 5, resolved: 10, rate: 0.5, low: 0.24, high: 0.76 },
      { stage: 'loan_applied', signed: 3, resolved: 8, rate: 0.375, low: 0.14, high: 0.69 },
      { stage: 'lo_issued', signed: 2, resolved: 4, rate: 0.5, low: 0.15, high: 0.85 },
      { stage: 'loan_agreement', signed: 1, resolved: 2, rate: 0.5, low: 0.1, high: 0.9 }
    ],
    perBooking: [
      { bookingId: 'BK-O-1', probability: 0 },
      { bookingId: 'BK-O-2', probability: 1 }
    ],
    support: 'supported'
  },
  history: { scope: 'project', asOf: '2026-10-05', resolved: 22, signed: 11 },
  open: { count: 3, valueRm: 1625000, olderCount: 1, withdrawnCount: 1 },
  outlook,
  approved: {
    count: 2,
    valueRm: 950000,
    withoutAppointmentCount: 1,
    rows: [
      {
        ...row('BK-A-DATED', { unit: 'B-01-01', stage: 'lo_issued', bookingDate: '2026-09-01' }),
        approvedOn: '2026-09-15',
        daysSinceApproval: 26,
        appointmentRecorded: true,
        appointmentOn: null
      },
      {
        ...row('BK-A-NONE', { unit: 'B-01-02', stage: 'lo_issued', bookingDate: '2026-09-02' }),
        approvedOn: '2026-09-20',
        daysSinceApproval: 21,
        appointmentRecorded: false,
        appointmentOn: null
      }
    ]
  },
  appointments: {
    from: '2026-10-11',
    to: '2026-11-10',
    upcoming: [{ ...row('BK-APPT-UP', { unit: 'C-01-01' }), appointmentOn: '2026-10-19' }],
    overdue: [{ ...row('BK-APPT-OLD', { unit: 'C-01-02' }), appointmentOn: '2026-10-09' }],
    undatedCount: 1
  },
  waiting: {
    groups: [
      { holder: 'bank', count: 2, valueRm: 1200000, oldestDays: 45 },
      { holder: 'buyer', count: 1, valueRm: 425000, oldestDays: null }
    ],
    rows: [
      row('BK-WAIT-OLD', { unit: 'D-01-01', ageDays: 50, daysInStage: 45 }),
      row('BK-WITHDRAWN', {
        unit: 'D-01-02',
        stage: 'lo_issued',
        holder: 'developer',
        waitingFor: 'Buyer Withdrawal To Be Reviewed',
        nextMove: 'review_release',
        daysInStage: null
      }),
      row('BK-WAIT-UNKNOWN', { unit: 'D-01-03', daysInStage: null, daysSinceUpdate: null, holder: 'buyer' })
    ]
  },
  turnaround: {
    bookingToSigning: { sample: 2, medianDays: 15 },
    approvalToSigning: { sample: 1, medianDays: 8 },
    rows: [
      {
        bookingId: 'BK-TURN-1',
        unit: 'E-01-01',
        priceRm: 700000,
        bookedOn: '2026-09-01',
        signedOn: '2026-09-16',
        approvedOn: '2026-09-08',
        bookingToSigningDays: 15,
        approvalToSigningDays: 8
      },
      {
        bookingId: 'BK-TURN-2',
        unit: 'E-01-02',
        priceRm: 600000,
        bookedOn: '2026-08-01',
        signedOn: '2026-08-31',
        approvedOn: null,
        bookingToSigningDays: 30,
        approvalToSigningDays: null
      }
    ]
  },
  exits: {
    count: 2,
    valueRm: 1100000,
    cancelledCount: 1,
    lapsedCount: 1,
    medianDaysToExit: 15,
    rows: [
      {
        ...row('BK-EXIT-CANCEL', { unit: 'F-01-01' }),
        outcome: 'cancelled',
        closedOn: '2026-09-10',
        daysToExit: 9
      },
      {
        ...row('BK-EXIT-LAPSE', { unit: 'F-01-02' }),
        outcome: 'lapsed',
        closedOn: '2026-09-20',
        daysToExit: 19
      }
    ]
  },
  secondBank: {
    attemptedCount: 2,
    signedCount: 1,
    resolvedCount: 1,
    pendingCount: 1,
    rows: [
      {
        bookingId: 'BK-RETRY-SIGNED',
        unit: 'G-01-01',
        priceRm: 700000,
        resubmittedOn: '2026-09-02',
        outcome: 'signed'
      },
      { bookingId: 'BK-RETRY-OPEN', unit: 'G-01-02', priceRm: 500000, resubmittedOn: '2026-09-06', outcome: 'open' }
    ],
    followUp: [row('BK-REVIEW', { unit: 'G-01-03', holder: 'bank', waitingFor: 'Public Bank To Decide On The Loan' })]
  }
}

const EMPTY: ForecastInsights = {
  ...INSIGHTS,
  forecast: {
    ...INSIGHTS.forecast,
    liveBookings: 0,
    expectedSignings: 0,
    rangeLow: 0,
    rangeHigh: 0,
    stageRates: [
      { stage: 'booked', signed: 0, resolved: 0, rate: 0, low: 0, high: 1 },
      { stage: 'loan_applied', signed: 0, resolved: 0, rate: 0, low: 0, high: 1 },
      { stage: 'lo_issued', signed: 0, resolved: 0, rate: 0, low: 0, high: 1 }
    ],
    perBooking: [],
    support: 'insufficient-history'
  },
  history: { scope: 'visible', asOf: '2026-10-11', resolved: 0, signed: 0 },
  open: { count: 0, valueRm: 0, olderCount: 0, withdrawnCount: 0 },
  outlook: [],
  approved: { count: 0, valueRm: 0, withoutAppointmentCount: 0, rows: [] },
  appointments: { from: '2026-10-11', to: '2026-11-10', upcoming: [], overdue: [], undatedCount: 0 },
  waiting: { groups: [], rows: [] },
  turnaround: {
    bookingToSigning: { sample: 0, medianDays: null },
    approvalToSigning: { sample: 0, medianDays: null },
    rows: []
  },
  exits: {
    count: 0,
    valueRm: 0,
    cancelledCount: 0,
    lapsedCount: 0,
    medianDaysToExit: null,
    rows: []
  },
  secondBank: { attemptedCount: 0, signedCount: 0, resolvedCount: 0, pendingCount: 0, rows: [], followUp: [] }
}

function renderReports(insights: ForecastInsights = INSIGHTS) {
  return render(
    <MemoryRouter>
      <ForecastReports insights={insights} />
    </MemoryRouter>
  )
}

function openDocument(title: string) {
  fireEvent.click(screen.getByRole('button', { name: title }))
  fireEvent.click(screen.getByRole('button', { name: 'Open Document' }))
  return screen.getByRole('dialog')
}

describe('ForecastReports', () => {
  it('uses the hand-derived fixture values and detail counts on all five covers', () => {
    renderReports()
    const expected = [
      ['Signing Outlook', '1', 'Estimated SPAs By Booking Day 30', '2 eligible bookings · 1 to 2 estimated range'],
      ['Approved, Awaiting SPA', 'RM 950.0k', '2 Approved Bookings Awaiting SPA', '1 without a recorded appointment'],
      ['Where Bookings Are Waiting', 'RM 1.2m', 'Waiting On Bank', '2 bookings · longest time in stage 45 days'],
      [
        'Conversion And Turnaround',
        '15 Days',
        'Median Booking-To-SPA Time',
        '2 signed bookings in your accessible history'
      ],
      ['Lost Bookings', 'RM 1.1m', '2 Exited Bookings', '1 open rejected booking needs a financing review']
    ]
    const stack = screen.getByRole('group', { name: 'Forecast documents' })

    for (const [title, value, label, detail] of expected) {
      fireEvent.click(screen.getByRole('button', { name: title! }))
      const slide = stack.querySelector('[aria-roledescription="slide"]')
      expect(slide?.textContent).toContain(title)
      expect(slide?.textContent).toContain(value)
      expect(slide?.textContent).toContain(label)
      expect(slide?.textContent).toContain(detail)
    }
  })

  it('shows the data date and permitted case-row scope inside every report dialog', async () => {
    renderReports()
    const titles = [
      'Signing Outlook',
      'Approved, Awaiting SPA',
      'Where Bookings Are Waiting',
      'Conversion And Turnaround',
      'Lost Bookings'
    ]
    const note = 'Records as of 11 Oct 2026. Case rows are limited to your permitted bookings.'

    for (const title of titles) {
      const dialog = openDocument(title)
      expect(within(dialog).getByText(note)).toBeTruthy()
      fireEvent.keyDown(dialog, { key: 'Escape' })
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    }
  })

  it('shows exact outlook facts, keeps real zero distinct from missing chance, and folds methodology', () => {
    renderReports()
    const dialog = openDocument('Signing Outlook')

    const estimate = within(dialog).getByRole('heading', { name: 'Booking-Day-30 Estimate' }).closest('section')
    expect(estimate?.textContent).toContain('1.3 expected SPA signings')
    expect(estimate?.textContent).toContain('2 eligible bookings')
    expect(within(dialog).getByText('0%')).toBeTruthy()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Show All 9 Bookings' }))
    expect(dialog.textContent).toContain('—')
    const appointments = within(dialog).getByRole('heading', { name: 'Recorded Appointments' }).closest('section')
    expect(appointments?.textContent).toContain('11 Oct 2026 Through 10 Nov 2026')
    expect(appointments?.textContent).toContain('1 overdue; date passed, booking still unsigned.')
    expect(appointments?.textContent).toContain('1 recorded appointment has a missing date.')

    const method = within(dialog).getByRole('button', { name: 'How This Is Counted' })
    expect(method.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(method)
    expect(method.getAttribute('aria-expanded')).toBe('true')
    expect(dialog.textContent).toContain(
      'History sample: 22 resolved bookings, 11 signed by booking day 30, as of 5 Oct 2026 in project-wide history.'
    )
    expect(within(dialog).getByText(/buyer withdrawal without recorded closure stays in the estimate/i)).toBeTruthy()
  })

  it('distinguishes an appointment recorded without a date from no appointment record', () => {
    renderReports()
    const dialog = openDocument('Approved, Awaiting SPA')

    expect(within(dialog).getByText(/2 approved bookings.*RM 950,000/)).toBeTruthy()
    expect(within(dialog).getByText(/Loan approval does not verify legal readiness or an LO signature/i)).toBeTruthy()
    expect(within(dialog).getByText('Recorded, Date Missing')).toBeTruthy()
    expect(within(dialog).getByText('Not Recorded')).toBeTruthy()
    expect(within(dialog).getByRole('link', { name: 'B-01-01' }).getAttribute('href')).toBe('/bookings/BK-A-DATED')
  })

  it('shows older waiting cases and says when the progress date is unknown', () => {
    renderReports()
    const dialog = openDocument('Where Bookings Are Waiting')

    expect(within(dialog).getByText(/including bookings older than the estimate’s 30-day window/i)).toBeTruthy()
    expect(
      within(dialog).getByText(
        'Ages measure time in the recorded stage, not time with the current bank or person. A later bank submission does not reset the clock for the same stage.'
      )
    ).toBeTruthy()
    expect(within(dialog).getByText('45 days in stage')).toBeTruthy()
    expect(within(dialog).getAllByText('No recorded progress date').length).toBeGreaterThan(0)
    expect(within(dialog).getByText(/buyer withdrawal is shown as a release review/i)).toBeTruthy()
  })

  it('shows the stage-rate samples and distinct completed turnaround measures', () => {
    renderReports()
    const dialog = openDocument('Conversion And Turnaround')

    expect(within(dialog).getByRole('heading', { name: 'Signed By Booking Day 30' })).toBeTruthy()
    expect(dialog.textContent).toContain(
      'Among bookings that reached each stage and have a known 30-day outcome, the rate shows how many signed by day 30.'
    )
    expect(within(dialog).queryByText('Loan Agreement')).toBeNull()
    expect(dialog.textContent).toContain('Median Booking-To-SPA15 days · 2 signed bookings.')
    expect(dialog.textContent).toContain('Median Approval-To-SPA8 days · 1 signed booking.')
    expect(dialog.textContent).toContain('—')
    expect(within(dialog).getByRole('link', { name: 'E-01-01' }).getAttribute('href')).toBe('/bookings/BK-TURN-1')
  })

  it('keeps exit facts separate from second-bank outcomes and financing reviews', () => {
    renderReports()
    const dialog = openDocument('Lost Bookings')

    expect(dialog.textContent).toContain('1 cancellation and 1 lapse; RM 1,100,000 in booked value.')
    expect(within(dialog).getByText(/not recognized revenue lost or permanent stock loss/i)).toBeTruthy()
    expect(dialog.textContent).toMatch(
      /2 bookings that went to another bank after a rejection, 1 completed booking, 1 signed, and 1 still open/i
    )
    expect(dialog.textContent).toMatch(/may be small/i)
    expect(dialog.textContent).toMatch(/no recoverable money or units are forecast/i)
    expect(within(dialog).getByRole('link', { name: 'G-01-03' }).getAttribute('href')).toBe('/bookings/BK-REVIEW')
  })

  it('shows all records behind a real Show All control', () => {
    renderReports()
    const dialog = openDocument('Signing Outlook')
    const showAll = within(dialog).getByRole('button', { name: 'Show All 9 Bookings' })

    expect(showAll.getAttribute('aria-expanded')).toBe('false')
    expect(within(dialog).queryByRole('link', { name: 'A-12-09' })).toBeNull()
    fireEvent.click(showAll)
    expect(within(dialog).getByRole('button', { name: 'Show Fewer' }).getAttribute('aria-expanded')).toBe('true')
    expect(within(dialog).getByRole('link', { name: 'A-12-09' }).getAttribute('href')).toBe('/bookings/BK-O-9')
  })

  it('keeps every report meaningful when statistical history and operational rows are empty', async () => {
    renderReports(EMPTY)
    const outlookDialog = openDocument('Signing Outlook')
    expect(outlookDialog.textContent).toMatch(/no confirmed SPA appointment dates fall within/i)
    expect(outlookDialog.textContent).toContain('11 Oct 2026 Through 10 Nov 2026')
    expect(outlookDialog.textContent).toMatch(/estimate is unavailable/i)
    fireEvent.keyDown(outlookDialog, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

    const lostDialog = openDocument('Lost Bookings')
    expect(lostDialog.textContent).toContain(
      'No completed bookings that went to another bank after a rejection are recorded.'
    )
    expect(lostDialog.textContent).toContain('No bookings are recorded as going to another bank after a rejection.')
    expect(lostDialog.textContent).toMatch(/no open rejected bookings are waiting for a financing review/i)
    fireEvent.keyDown(lostDialog, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

    const conversionDialog = openDocument('Conversion And Turnaround')
    expect(conversionDialog.textContent).toContain('Median Booking-To-SPANo completed sample.')
    expect(conversionDialog.textContent).toContain('Median Approval-To-SPANo completed sample.')
  })
})

// Issue #75: the sponsor's one number, and "how often were you right?", answered on screen.
describe('ForecastReports with the bookings behind them', () => {
  const booking = (id: string, bookingDate: string): Booking => ({
    id,
    project: 'Residensi Ujian',
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
    salesOwner: 'Nurul Aina',
    loanOwner: 'Tan Mei Ling',
    legalFirm: 'Test Chambers'
  })
  const event = (bookingId: string, kind: EventKind, on: string): CaseEvent => ({
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
    note: null
  })

  function renderWith(insights: ForecastInsights, dataset: Dataset, reach: HistoryReach = 'all') {
    return render(
      <MemoryRouter>
        <ForecastReports insights={insights} dataset={dataset} reach={reach} />
      </MemoryRouter>
    )
  }

  it('reports the latest final four-week intake as N of M signed by day 30, exits kept in the count', () => {
    const bookings = [
      booking('BK-01', '2026-08-20'),
      booking('BK-02', '2026-08-25'),
      booking('BK-03', '2026-09-01'),
      booking('BK-04', '2026-09-05'),
      booking('BK-05', '2026-07-01')
    ]
    const events = [
      ...bookings.map((b) => event(b.id, 'booked', b.bookingDate)),
      event('BK-01', 'spa_signed', '2026-09-05'),
      event('BK-02', 'cancelled', '2026-09-10'),
      event('BK-04', 'spa_signed', '2026-10-10'),
      event('BK-05', 'spa_signed', '2026-07-20')
    ]
    renderWith(INSIGHTS, { bookings, applications: [], events })
    const dialog = openDocument('Conversion And Turnaround')
    const cohort = within(dialog).getByRole('heading', { name: 'Cohort Result' }).closest('section')!

    expect(within(cohort).getByLabelText('Booked From, 15 Aug 2026')).toBeTruthy()
    expect(within(cohort).getByLabelText('Booked To, 11 Sep 2026')).toBeTruthy()
    expect(within(cohort).getByText('1 of 4 signed by booking day 30 (25%).')).toBeTruthy()
    expect(cohort.textContent).toContain('1 cancellation or lapse, kept in the count.')
    expect(cohort.textContent).toContain('1 booking signed after day 30')
    expect(cohort.textContent).toContain('this result is final')
    expect(cohort.textContent).toContain('the booking-day-30 estimate is not part of it')
  })

  it('shows the accuracy check in How This Is Counted, including where the method was over-confident', () => {
    const generated = generate({ seed: DEFAULT_SEED, referenceDate: REFERENCE_DATE, bookings: 140 })
    const dataset: Dataset = {
      bookings: [...generated.bookings, ...STORIES.map((s) => s.booking)],
      applications: [...generated.applications, ...STORIES.flatMap((s) => s.applications)],
      events: [...generated.events, ...STORIES.flatMap((s) => s.events)]
    }
    renderWith({ ...INSIGHTS, asOf: REFERENCE_DATE }, dataset)
    const dialog = openDocument('Signing Outlook')
    fireEvent.click(within(dialog).getByRole('button', { name: 'How This Is Counted' }))

    expect(dialog.textContent).toContain(
      'Accuracy check: at 19 Aug 2026, the method expected 9.9 signings by booking day 30; 10 happened.'
    )
    expect(dialog.textContent).toContain(
      'It was over-confident in the 50–75% band (54% expected, 40% happened, 10 bookings).'
    )
    expect(within(dialog).getByText('Simulated history; not measured on real bookings.')).toBeTruthy()
    expect(dialog.textContent).not.toMatch(/Brier|backtest/i)
  })

  // A Loan or Legal view drops a booking as it signs, so a check on it would count only what is left.
  it('names a Sales Admin’s own bookings, and shows neither check on a view that keeps only assigned bookings', () => {
    const bookings = [booking('BK-01', '2026-08-20'), booking('BK-02', '2026-08-25')]
    const events = [
      ...bookings.map((b) => event(b.id, 'booked', b.bookingDate)),
      event('BK-01', 'spa_signed', '2026-09-05')
    ]
    const own = renderWith(INSIGHTS, { bookings, applications: [], events }, 'own')
    const dialog = openDocument('Conversion And Turnaround')
    expect(within(dialog).getByText('1 of 2 of your bookings signed by booking day 30 (50%).')).toBeTruthy()
    own.unmount()

    renderWith(INSIGHTS, { bookings, applications: [], events }, 'assigned')
    const assigned = openDocument('Conversion And Turnaround')
    const cohort = within(assigned).getByRole('heading', { name: 'Cohort Result' }).closest('section')!
    expect(cohort.textContent).toContain('Not shown here.')
    expect(cohort.textContent).not.toMatch(/signed by booking day 30 \(/)
  })
})
