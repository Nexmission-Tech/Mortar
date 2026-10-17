import { describe, expect, it } from 'vitest'
import type { Booking, CaseEvent, CaseSummary, EventKind, LoanApplication } from './types'
import { REFERENCE_DATE, summarizeCases } from './sim'
import { deriveCase } from './sim/cases'
import { ballInCourt } from './ball'
import { canAccessBooking, currentCaseAssignee, profileFor } from './profiles'

// Updates staff record by hand: parallel banks, withdrawals the buyer comes back
// from, and documents recorded for one bank or for none. The generator never
// writes these, so each case here is built event by event.

const b: Booking = {
  id: 'BK-T100',
  project: 'Test Project',
  unit: 'A-01-01',
  priceRm: 500000,
  bookingDate: '2026-08-25',
  buyer: {
    name: 'Test Buyer',
    ic: '000000-00-9100',
    phone: '+60 00-000 9100',
    age: 36,
    grossMonthlyIncomeRm: 20000,
    monthlyCommitmentsRm: 0,
    propertiesOwned: 0
  },
  salesOwner: 'Test Agent',
  loanOwner: 'Tan Mei Ling',
  legalFirm: 'Test Chambers'
}
const A: LoanApplication = { id: 'APP-A', bookingId: b.id, bank: 'Apex Bank', banker: 'Kelvin Teo' }
const B: LoanApplication = { id: 'APP-B', bookingId: b.id, bank: 'Bumi Bank', banker: 'Aida Rahman' }

let seq = 0
/** What `POST /api/events` stores for a staff update: confirmed, noon on the chosen day, recorded that evening. */
function ev(kind: EventKind, on: string, extra: Partial<CaseEvent> = {}): CaseEvent {
  seq += 1
  return {
    id: `EV-T${String(seq).padStart(4, '0')}`,
    bookingId: b.id,
    applicationId: null,
    track: 'loan',
    kind,
    occurredAt: `${on}T12:00:00+08:00`,
    recordedAt: `${on}T18:00:00+08:00`,
    reportedBy: 'Tan Mei Ling',
    verifiedBy: 'Tan Mei Ling',
    status: 'confirmed',
    source: 'staff',
    messageId: null,
    document: null,
    note: null,
    ...extra
  }
}

const booked = ev('booked', '2026-08-25', { track: 'sales' })
const submitted = (app: LoanApplication, on: string) => ev('loan_submitted', on, { applicationId: app.id })
const approved = (app: LoanApplication, on: string) => ev('loan_approved', on, { applicationId: app.id })
const rejected = (app: LoanApplication, on: string) => ev('loan_rejected', on, { applicationId: app.id })
const withdrew = (on: string) => ev('buyer_withdrew', on, { track: 'sales' })
const requested = (app: LoanApplication | null, document: CaseEvent['document'], on: string) =>
  ev('documents_requested', on, { applicationId: app?.id ?? null, document })
const received = (app: LoanApplication | null, document: CaseEvent['document'], on: string) =>
  ev('documents_received', on, { applicationId: app?.id ?? null, document })

function summarize(apps: LoanApplication[], events: CaseEvent[]): CaseSummary {
  return summarizeCases({ bookings: [b], applications: apps, events, tasks: [] }, REFERENCE_DATE)[0]
}

const statuses = (s: CaseSummary) => s.applications.map((a) => `${a.bank}: ${a.status}`)
const bankStalls = (s: CaseSummary) => s.stallReasons.filter((r) => r.startsWith('Bank Has Not Decided'))
const documentStalls = (s: CaseSummary) => s.stallReasons.filter((r) => r.includes('Still Outstanding'))

describe('a buyer who withdrew', () => {
  it('stops the bank clock on the application the withdrawal covers', () => {
    const s = summarize([A], [booked, submitted(A, '2026-08-27'), withdrew('2026-09-17')])
    expect(statuses(s)).toEqual(['Apex Bank: withdrawn'])
    expect(s.buyerWithdrew).toBe(true)
    expect(bankStalls(s)).toEqual([])
    expect(ballInCourt(s)).toMatchObject({ holder: 'developer', nextMove: 'review_release' })
  })

  it('counts a submission on the day of the withdrawal as withdrawn too', () => {
    const s = summarize(
      [A, B],
      [booked, submitted(A, '2026-08-27'), withdrew('2026-09-01'), submitted(B, '2026-09-01')]
    )
    expect(statuses(s)).toEqual(['Apex Bank: withdrawn', 'Bumi Bank: withdrawn'])
    expect(s.buyerWithdrew).toBe(true)
    expect(bankStalls(s)).toEqual([])
  })

  it('takes a bank submitted after the withdrawal as the buyer coming back', () => {
    const s = summarize(
      [A, B],
      [booked, submitted(A, '2026-08-27'), withdrew('2026-09-01'), submitted(B, '2026-09-03')]
    )
    expect(statuses(s)).toEqual(['Apex Bank: withdrawn', 'Bumi Bank: submitted'])
    expect(s.buyerWithdrew).toBe(false)
    // Only the new bank's clock runs: 11 working days from 3 Sep to 18 Sep.
    expect(bankStalls(s)).toEqual(['Bank Has Not Decided After 11 Working Days'])
    expect(ballInCourt(s)).toMatchObject({ holder: 'bank', waitingFor: 'Bumi Bank To Decide On The Loan' })
  })

  it('hands the case to the solicitor once the new bank approves', () => {
    const s = summarize(
      [A, B],
      [
        booked,
        submitted(A, '2026-08-27'),
        withdrew('2026-09-01'),
        submitted(B, '2026-09-02'),
        approved(B, '2026-09-05')
      ]
    )
    expect(s.stage).toBe('lo_issued')
    expect(statuses(s)).toEqual(['Apex Bank: withdrawn', 'Bumi Bank: approved'])
    expect(s.buyerWithdrew).toBe(false)
    expect(bankStalls(s)).toEqual([])
    expect(ballInCourt(s)).toMatchObject({ holder: 'solicitor', nextMove: 'schedule_spa' })
  })

  it('stays withdrawn when a bank approves after the withdrawal with no new submission', () => {
    const s = summarize([A], [booked, submitted(A, '2026-08-27'), withdrew('2026-09-01'), approved(A, '2026-09-05')])
    expect(statuses(s)).toEqual(['Apex Bank: approved'])
    expect(s.buyerWithdrew).toBe(true)
    expect(ballInCourt(s)).toMatchObject({ holder: 'developer', nextMove: 'review_release' })
  })

  it('reads the latest withdrawal: withdrawing again after coming back withdraws again', () => {
    const s = summarize(
      [A, B],
      [booked, submitted(A, '2026-08-27'), withdrew('2026-09-01'), submitted(B, '2026-09-03'), withdrew('2026-09-10')]
    )
    expect(statuses(s)).toEqual(['Apex Bank: withdrawn', 'Bumi Bank: withdrawn'])
    expect(s.buyerWithdrew).toBe(true)
    expect(bankStalls(s)).toEqual([])
  })
})

describe('a case once a bank has approved', () => {
  it('drops a rejected bank’s open document request', () => {
    const s = summarize(
      [A, B],
      [
        booked,
        submitted(A, '2026-08-27'),
        requested(A, 'payslip', '2026-08-28'),
        rejected(A, '2026-09-03'),
        submitted(B, '2026-09-04'),
        approved(B, '2026-09-07')
      ]
    )
    expect(s.outstandingDocuments).toEqual([])
    expect(documentStalls(s)).toEqual([])
    expect(s.risk.reasons).not.toContain('Income Document Outstanding')
    expect(ballInCourt(s)).toMatchObject({ holder: 'solicitor', nextMove: 'schedule_spa' })
  })

  it('drops the documents another bank is still waiting on', () => {
    const s = summarize(
      [A, B],
      [
        booked,
        submitted(A, '2026-08-27'),
        submitted(B, '2026-08-27'),
        requested(B, 'epf_statement', '2026-08-29'),
        approved(A, '2026-09-14')
      ]
    )
    expect(statuses(s)).toEqual(['Apex Bank: approved', 'Bumi Bank: documents_pending'])
    expect(s.outstandingDocuments).toEqual([])
    expect(documentStalls(s)).toEqual([])
    expect(ballInCourt(s)).toMatchObject({ holder: 'solicitor', nextMove: 'schedule_spa' })
  })

  it('stops chasing another bank for a decision', () => {
    const s = summarize(
      [A, B],
      [booked, submitted(A, '2026-08-27'), submitted(B, '2026-08-27'), approved(A, '2026-09-14')]
    )
    expect(statuses(s)).toEqual(['Apex Bank: approved', 'Bumi Bank: submitted'])
    expect(bankStalls(s)).toEqual([])
    expect(ballInCourt(s)).toMatchObject({ holder: 'solicitor', nextMove: 'schedule_spa' })
  })

  // Issue #75: an approval must not hide a document the approving bank still needs.
  it('keeps the case with the buyer while the approving bank still wants a document', () => {
    const events = [
      booked,
      submitted(A, '2026-08-27'),
      requested(A, 'payslip', '2026-09-01'),
      approved(A, '2026-09-14')
    ]
    const s = summarize([A], events)
    expect(s.outstandingDocuments).toEqual(['payslip'])
    expect(ballInCourt(s)).toEqual({
      holder: 'buyer',
      waitingFor: 'Payslip From The Buyer',
      nextMove: 'request_document',
      stalled: true
    })
    // Once the payslip reaches that bank, the solicitor schedules the SPA.
    const after = summarize([A], [...events, received(A, 'payslip', '2026-09-16')])
    expect(ballInCourt(after)).toMatchObject({ holder: 'solicitor', nextMove: 'schedule_spa' })
  })
})

describe('a bank that declined', () => {
  it('no longer holds the case up with a document it asked for', () => {
    const s = summarize(
      [A, B],
      [
        booked,
        submitted(A, '2026-08-27'),
        requested(A, 'payslip', '2026-08-28'),
        rejected(A, '2026-09-03'),
        submitted(B, '2026-09-14')
      ]
    )
    expect(s.outstandingDocuments).toEqual([])
    expect(ballInCourt(s)).toMatchObject({ holder: 'bank', waitingFor: 'Bumi Bank To Decide On The Loan' })
  })
})

// Issue #75: a rejection, a valuation shortfall and a buyer's concern each reach
// Today the day they are confirmed, instead of after a week of silence.
describe('a financing problem or a buyer concern', () => {
  const ownedBy = (salesOwner: string): Booking => ({ ...b, salesOwner })

  it('puts a case whose only bank just rejected it on the loan desk the same day, for a financing review', () => {
    const s = summarize([A], [booked, submitted(A, '2026-08-27'), rejected(A, '2026-09-18')])
    expect(s.daysSinceEvidence).toBe(0)
    expect(s.stallReasons).toEqual(['Loan Rejected, No Bank Still Deciding'])
    expect(ballInCourt(s)).toEqual({
      holder: 'developer',
      waitingFor: 'A Financing Review After The Rejection',
      nextMove: 'review_financing',
      stalled: true
    })
    expect(currentCaseAssignee(ownedBy('Nurul Aina'), s)?.name).toBe('Tan Mei Ling')
  })

  it('raises no financing review while another bank is still deciding, or once one is submitted', () => {
    const parallel = summarize(
      [A, B],
      [booked, submitted(A, '2026-08-27'), submitted(B, '2026-09-10'), rejected(A, '2026-09-18')]
    )
    expect(parallel.stallReasons).toEqual([])
    expect(ballInCourt(parallel).nextMove).toBe('chase_banker')
    const resubmitted = summarize(
      [A, B],
      [booked, submitted(A, '2026-08-27'), rejected(A, '2026-09-17'), submitted(B, '2026-09-18')]
    )
    expect(resubmitted.stallReasons).toEqual([])
    expect(ballInCourt(resubmitted).holder).toBe('bank')
  })

  it('sends a confirmed valuation shortfall to a financing review until the bank decides', () => {
    const shortfall = ev('valuation_shortfall', '2026-09-18', { applicationId: A.id })
    const s = summarize([A], [booked, submitted(A, '2026-09-14'), shortfall])
    expect(s.valuationShortfall).toBe(true)
    expect(s.stallReasons).toEqual(['Valuation Shortfall Confirmed'])
    expect(ballInCourt(s)).toMatchObject({
      holder: 'developer',
      waitingFor: 'A Financing Review After The Valuation Shortfall',
      nextMove: 'review_financing'
    })
    const decided = summarize(
      [A],
      [
        booked,
        submitted(A, '2026-09-10'),
        ev('valuation_shortfall', '2026-09-14', { applicationId: A.id }),
        approved(A, '2026-09-17')
      ]
    )
    expect(decided.valuationShortfall).toBe(false)
    expect(ballInCourt(decided).holder).toBe('solicitor')
  })

  it('makes Call The Buyer the step for a confirmed concern, on the sales desk, until the call is recorded', () => {
    const hesitant = ev('buyer_hesitant', '2026-09-18', { track: 'sales' })
    const s = summarize([A], [booked, submitted(A, '2026-09-14'), hesitant])
    expect(s.buyerConcern).toBe(true)
    expect(s.stallReasons).toEqual(['Buyer Raised A Concern'])
    expect(ballInCourt(s)).toMatchObject({ holder: 'buyer', nextMove: 'call_buyer' })
    expect(currentCaseAssignee(ownedBy('Nurul Aina'), s)?.name).toBe('Nurul Aina')
    // The bank keeps processing alongside: its application is still with it.
    expect(statuses(s)).toEqual(['Apex Bank: submitted'])

    const called = summarize(
      [A],
      [booked, submitted(A, '2026-09-14'), hesitant, ev('buyer_contacted', '2026-09-18', { track: 'sales' })]
    )
    expect(called.buyerConcern).toBe(false)
    expect(called.stallReasons).toEqual([])
    expect(ballInCourt(called)).toMatchObject({ holder: 'bank', nextMove: 'chase_banker' })
  })

  it('ignores a concern that is only proposed or disputed', () => {
    const proposed = ev('buyer_hesitant', '2026-09-18', { track: 'sales', status: 'provisional' })
    const s = summarize([A], [booked, submitted(A, '2026-09-14'), proposed])
    expect(s.buyerConcern).toBe(false)
    expect(ballInCourt(s).nextMove).toBe('chase_banker')
  })

  it('takes a signing date the buyer agreed after a concern as its answer', () => {
    const s = summarize(
      [A],
      [
        booked,
        submitted(A, '2026-08-27'),
        ev('buyer_hesitant', '2026-09-01', { track: 'sales' }),
        approved(A, '2026-09-08'),
        ev('spa_appointment_set', '2026-09-10', { track: 'legal', note: 'Appointment On 2026-09-24' })
      ]
    )
    expect(s.buyerConcern).toBe(false)
    expect(ballInCourt(s)).toMatchObject({ holder: 'solicitor', nextMove: 'escalate_legal' })
  })

  it('leaves the desk processing the case its access while the next move is the concern or the shortfall', () => {
    const tan = profileFor('loan-tan-mei-ling')!
    const arvind = profileFor('legal-admin')!
    const access = (events: CaseEvent[], profile: typeof tan) =>
      canAccessBooking(b, profile, { summaries: [summarize([A], events)], tasks: [] })
    const hesitant = ev('buyer_hesitant', '2026-09-18', { track: 'sales' })
    // A bank still deciding: the loan desk records its decision while sales calls the buyer.
    expect(access([booked, submitted(A, '2026-09-14'), hesitant], tan)).toBe(true)
    // An approved loan: the solicitor keeps scheduling the SPA alongside the call.
    expect(access([booked, submitted(A, '2026-09-01'), approved(A, '2026-09-10'), hesitant], arvind)).toBe(true)
    expect(access([booked, submitted(A, '2026-09-01'), approved(A, '2026-09-10'), hesitant], tan)).toBe(false)
  })

  it('leaves one bank’s shortfall standing when another bank turns the buyer down', () => {
    const shortfall = ev('valuation_shortfall', '2026-09-10', { applicationId: A.id })
    const otherRejects = summarize(
      [A, B],
      [booked, submitted(A, '2026-09-01'), submitted(B, '2026-09-02'), shortfall, rejected(B, '2026-09-15')]
    )
    expect(otherRejects.valuationShortfall).toBe(true)
    expect(ballInCourt(otherRejects).nextMove).toBe('review_financing')
    // The short bank's own decision, or any approval, settles it.
    const ownRejects = summarize(
      [A, B],
      [booked, submitted(A, '2026-09-01'), submitted(B, '2026-09-02'), shortfall, rejected(A, '2026-09-15')]
    )
    expect(ownRejects.valuationShortfall).toBe(false)
    const otherApproves = summarize(
      [A, B],
      [booked, submitted(A, '2026-09-01'), submitted(B, '2026-09-02'), shortfall, approved(B, '2026-09-15')]
    )
    expect(otherApproves.valuationShortfall).toBe(false)
  })

  it('reviews the financing, not a document, once every bank has declined', () => {
    const s = summarize(
      [A],
      [booked, requested(null, 'ic_copy', '2026-08-26'), submitted(A, '2026-08-27'), rejected(A, '2026-09-18')]
    )
    expect(s.outstandingDocuments).toEqual(['ic_copy'])
    expect(ballInCourt(s)).toMatchObject({
      waitingFor: 'A Financing Review After The Rejection',
      nextMove: 'review_financing'
    })
  })
})

describe('one document ledger for the case and each bank', () => {
  // Issue #75: "the buyer gave it to us" is not "each bank has it".
  // With one bank deciding, a receipt not for one bank can only be for it.
  it('clears the one deciding bank’s request with a receipt not for one bank, restarting its clock', () => {
    const events = [
      booked,
      submitted(A, '2026-08-27'),
      requested(A, 'payslip', '2026-08-28'),
      received(null, 'payslip', '2026-09-16')
    ]
    const s = summarize([A], events)
    expect(statuses(s)).toEqual(['Apex Bank: submitted'])
    expect(s.outstandingDocuments).toEqual([])
    expect(bankStalls(s)).toEqual([])
    expect(ballInCourt(s)).toMatchObject({ holder: 'bank', waitingFor: 'Apex Bank To Decide On The Loan' })
    expect(deriveCase(b, [A], events, REFERENCE_DATE).applications[0].pendingSince).toBe('2026-09-16')
  })

  // Receipts saved with no bank once none was deciding, as the form and Jev did before #75.
  it('clears the approving bank’s request with a receipt not for one bank once no bank is deciding', () => {
    const s = summarize(
      [A],
      [
        booked,
        submitted(A, '2026-08-27'),
        requested(A, 'payslip', '2026-09-03'),
        approved(A, '2026-09-08'),
        received(null, 'payslip', '2026-09-10')
      ]
    )
    expect(s.outstandingDocuments).toEqual([])
    expect(documentStalls(s)).toEqual([])
    expect(ballInCourt(s)).toMatchObject({ holder: 'solicitor', nextMove: 'schedule_spa' })
    const access = canAccessBooking(b, profileFor('legal-admin')!, { summaries: [s], tasks: [] })
    expect(access).toBe(true)
  })

  it('leaves both banks’ requests open after a receipt not for one bank sent while both were deciding', () => {
    const s = summarize(
      [A, B],
      [
        booked,
        submitted(A, '2026-08-27'),
        submitted(B, '2026-08-27'),
        requested(A, 'payslip', '2026-08-28'),
        requested(B, 'payslip', '2026-08-29'),
        received(null, 'payslip', '2026-09-02'),
        rejected(B, '2026-09-04')
      ]
    )
    // Bumi's later rejection does not make the earlier receipt Apex's.
    expect(statuses(s)).toEqual(['Apex Bank: documents_pending', 'Bumi Bank: rejected'])
    expect(s.outstandingDocuments).toEqual(['payslip'])
  })

  it('clears neither bank’s request with one receipt not for one bank', () => {
    const s = summarize(
      [A, B],
      [
        booked,
        submitted(A, '2026-08-27'),
        submitted(B, '2026-08-27'),
        requested(A, 'payslip', '2026-08-28'),
        requested(B, 'payslip', '2026-08-29'),
        received(null, 'payslip', '2026-09-16')
      ]
    )
    expect(statuses(s)).toEqual(['Apex Bank: documents_pending', 'Bumi Bank: documents_pending'])
    expect(s.outstandingDocuments).toEqual(['payslip'])
  })

  it('clears a request not for one bank with a receipt not for one bank, restarting no bank’s clock', () => {
    const events = [
      booked,
      requested(null, 'payslip', '2026-08-26'),
      submitted(A, '2026-08-27'),
      received(null, 'payslip', '2026-09-16')
    ]
    const s = summarize([A], events)
    expect(s.outstandingDocuments).toEqual([])
    expect(statuses(s)).toEqual(['Apex Bank: submitted'])
    // Apex has been deciding since its submission, not since the receipt.
    expect(deriveCase(b, [A], events, REFERENCE_DATE).applications[0].pendingSince).toBe('2026-08-27')
  })

  it('clears only that bank’s requests with All Outstanding Documents for one bank', () => {
    const s = summarize(
      [A, B],
      [
        booked,
        submitted(A, '2026-08-27'),
        submitted(B, '2026-08-27'),
        requested(A, 'payslip', '2026-08-28'),
        requested(B, 'epf_statement', '2026-08-28'),
        requested(null, 'ic_copy', '2026-08-28'),
        received(A, null, '2026-09-16')
      ]
    )
    expect(statuses(s)).toEqual(['Apex Bank: submitted', 'Bumi Bank: documents_pending'])
    expect(s.outstandingDocuments).toEqual(['epf_statement', 'ic_copy'])
    expect(ballInCourt(s)).toMatchObject({ holder: 'buyer', waitingFor: 'EPF Statement And IC Copy From The Buyer' })
  })

  it('clears only the requests not for one bank with All Outstanding Documents not for one bank', () => {
    const s = summarize(
      [A, B],
      [
        booked,
        submitted(A, '2026-08-27'),
        submitted(B, '2026-08-27'),
        requested(A, 'payslip', '2026-08-28'),
        requested(B, 'epf_statement', '2026-08-28'),
        requested(null, 'ic_copy', '2026-08-28'),
        received(null, null, '2026-09-16')
      ]
    )
    expect(statuses(s)).toEqual(['Apex Bank: documents_pending', 'Bumi Bank: documents_pending'])
    expect(s.outstandingDocuments).toEqual(['payslip', 'epf_statement'])
  })

  // Issue #75's success check: two live banks, the payslip received for one only.
  it('leaves another bank’s request for the same document open, and its clock stopped', () => {
    const events = [
      booked,
      submitted(A, '2026-08-27'),
      submitted(B, '2026-08-27'),
      requested(A, 'payslip', '2026-08-28'),
      requested(B, 'payslip', '2026-08-29'),
      received(A, 'payslip', '2026-09-16')
    ]
    const s = summarize([A, B], events)
    expect(statuses(s)).toEqual(['Apex Bank: submitted', 'Bumi Bank: documents_pending'])
    expect(s.outstandingDocuments).toEqual(['payslip'])
    const facts = deriveCase(b, [A, B], events, REFERENCE_DATE)
    expect(facts.applications.map((a) => a.pendingSince)).toEqual(['2026-09-16', null])
  })

  it('clears a request not for one bank with a receipt for one bank', () => {
    const s = summarize(
      [A],
      [
        booked,
        requested(null, 'payslip', '2026-08-26'),
        submitted(A, '2026-08-27'),
        received(A, 'payslip', '2026-09-16')
      ]
    )
    expect(s.outstandingDocuments).toEqual([])
  })
})

describe('the bank clock', () => {
  it('starts no earlier than the submission when a receipt is back-dated before it', () => {
    const events = [
      booked,
      submitted(A, '2026-09-10'),
      ev('documents_received', '2026-08-26', {
        applicationId: A.id,
        document: 'payslip',
        recordedAt: '2026-09-18T10:00:00+08:00'
      })
    ]
    expect(deriveCase(b, [A], events, REFERENCE_DATE).applications[0].pendingSince).toBe('2026-09-10')
    // Six working days from 10 Sep, not 17 from 26 Aug.
    expect(bankStalls(summarize([A], events))).toEqual([])
  })

  it('restarts at a receipt after the submission', () => {
    const events = [booked, submitted(A, '2026-08-27'), received(A, 'payslip', '2026-09-08')]
    expect(deriveCase(b, [A], events, REFERENCE_DATE).applications[0].pendingSince).toBe('2026-09-08')
  })
})
