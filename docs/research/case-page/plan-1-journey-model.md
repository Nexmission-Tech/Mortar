# Booking Journey View Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** A pure `bookingJourney()` that turns one booking's snapshot into the
roadmap's five milestones, the current stop, the bank attempts and the rejection
detour, so the illustrated journey and the case page can render it without any
business rules of their own.

**Architecture:** One pure module in the frontend,
`frontend/src/components/bookings/bookingJourney.ts`, over `@mortar/core`'s
`CaseSummary`, `CaseEvent`, `LoanApplication`, `ballInCourt` and `byOccurred`.
Achievements come only from confirmed evidence on or before the reference date;
the current stop comes only from `ballInCourt`; nothing is inferred that was not
recorded. Table-driven tests pin every case in the design's build plan.

**Tech Stack:** TypeScript, Vitest, `@mortar/core`.

**Spec:** `docs/research/case-page/README.md` (section 5, Booking Journey, and
section 10A, Pure View Model And Evidence Rules).

## Global Constraints

- No React, DOM, `Date.now()`, timezone or network use in the module.
- Calendar days are UTC day ordinals of `YYYY-MM-DD` prefixes, never millisecond
  maths across time zones.
- Only `status === 'confirmed'` events whose `occurredAt` and `recordedAt` dates
  are on or before the reference date count. Input arrays are never mutated, and
  their order does not change the output.
- A missing fact stays `null` or `—`; it is never defaulted (no default bank
  status, no inferred receipt, no SPA from an appointment).
- Labels in Title Case: Booked, Documents, Loan Submitted, Loan Approved, SPA
  Signed.

## Review Focus

1. **Closed after progress:** a cancelled case freezes at its cancellation
   event; a later approval does not advance it, and the rest read Not Reached.
   Pinned in Task 1 (`freezes a cancelled case at its cancellation`).
2. **Evidence not yet known:** an event that occurred before the reference date
   but was recorded after it does not count. Pinned in Task 1
   (`counts only confirmed evidence known by the reference date`).
3. **Two banks at once:** two live applications read "2 Banks Reviewing" and no
   detour. Pinned in Task 1 (`reads two live banks as reviewing`).
4. **A rejection repeated on one application:** counts once. Pinned in Task 1
   (`counts each rejected application once`).
5. **Buyer withdrew:** Release Review with no current stop and no closure.
   Pinned in Task 1 (`puts a withdrawn buyer in release review`).

---

### Task 1: The View Model

**Files:**

- Create: `frontend/src/components/bookings/bookingJourney.ts`
- Create: `frontend/src/components/bookings/__tests__/bookingJourney.test.ts`

**Interfaces:**

- Consumes: `ballInCourt`, `byOccurred`, `REFERENCE_DATE`, `STORIES`,
  `summarizeCases` and the types `ApplicationStatus`, `Booking`, `CaseEvent`,
  `CaseSummary`, `DocumentKind`, `EventKind`, `IsoDate`, `IsoDateTime`,
  `LoanApplication`, `NextAction` from `@mortar/core`; `formatDate` from
  `@/components/case/format`.
- Produces: the types in the spec's section 10A (`JourneyStopId`,
  `JourneyStopState`, `JourneyEvidence`, `JourneyDuration`, `JourneyStop`,
  `JourneyApplication`, `JourneyRejection`, `JourneyDetour`,
  `BookingJourneyModel`, `BookingJourneyInput`), with one addition:
  `JourneyStop.note: string | null`, a factual sentence for the tooltip; and
  `bookingJourney(input: BookingJourneyInput): BookingJourneyModel`.

- [ ] **Step 1: Write the failing tests**

Create `frontend/src/components/bookings/__tests__/bookingJourney.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  REFERENCE_DATE,
  STORIES,
  summarizeCases,
  type Booking,
  type CaseEvent,
  type LoanApplication
} from '@mortar/core'
import {
  bookingJourney,
  type BookingJourneyModel
} from '@/components/bookings/bookingJourney'

const story = STORIES.find((s) => s.booking.id === 'BK-9002')!

/** A journey for a booking, its applications and events, summarised by core as of the reference date. */
function journeyOf(
  booking: Booking,
  applications: LoanApplication[],
  events: CaseEvent[],
  ref = REFERENCE_DATE
) {
  const summary = summarizeCases(
    { bookings: [booking], applications, events, tasks: [] },
    ref
  )[0]!
  return bookingJourney({
    booking,
    summary,
    events,
    applications,
    referenceDate: ref
  })
}

const stop = (model: BookingJourneyModel, id: string) =>
  model.stops.find((s) => s.id === id)!

let seq = 0
/** A confirmed event on the story's booking, recorded five minutes after it occurred. */
function ev(
  kind: CaseEvent['kind'],
  day: string,
  patch: Partial<CaseEvent> = {}
): CaseEvent {
  seq++
  return {
    id: `EV-T-${String(seq).padStart(3, '0')}`,
    bookingId: story.booking.id,
    applicationId: null,
    track: kind.startsWith('spa')
      ? 'legal'
      : kind === 'booked'
        ? 'sales'
        : 'loan',
    kind,
    occurredAt: `${day}T10:00:00+08:00`,
    recordedAt: `${day}T10:05:00+08:00`,
    reportedBy: 'Tan Mei Ling',
    verifiedBy: 'Tan Mei Ling',
    status: 'confirmed',
    source: 'staff',
    messageId: null,
    document: null,
    note: null,
    ...patch
  }
}
const app = (
  id: string,
  bank: string,
  banker = 'A Banker'
): LoanApplication => ({
  id,
  bookingId: story.booking.id,
  bank,
  banker
})

describe('bookingJourney', () => {
  it('reads BK-9002 as the design describes it', () => {
    const model = journeyOf(story.booking, story.applications, story.events)
    expect(model.resolution).toBe('open')
    expect(stop(model, 'booked')).toMatchObject({
      state: 'done',
      caption: '1 Sep 2026',
      current: false
    })
    expect(stop(model, 'documents')).toMatchObject({
      state: 'record_missing',
      caption: 'Receipt Not Recorded',
      confirmedAt: null
    })
    expect(stop(model, 'loan_submitted')).toMatchObject({
      state: 'done',
      caption: '10 Sep 2026 · Resubmitted'
    })
    const approved = stop(model, 'loan_approved')
    expect(approved).toMatchObject({
      state: 'upcoming',
      current: true,
      stalled: true,
      caption: 'Awaiting Decision',
      confirmedAt: null
    })
    expect(approved.duration).toEqual({
      kind: 'elapsed',
      from: '2026-09-10',
      through: '2026-09-18',
      calendarDays: 8
    })
    expect(stop(model, 'spa_signed')).toMatchObject({
      state: 'upcoming',
      current: false,
      caption: 'Upcoming'
    })
    expect(model.stops.filter((s) => s.current)).toHaveLength(1)
    expect(stop(model, 'booked').duration?.calendarDays).toBe(2)
    expect(model.detour?.flag).toBe('Malayan Trust · Rejected 8 Sep')
    expect(model.detour?.rejections).toHaveLength(1)
    expect(model.detour?.rejections[0]?.rejection.id).toBe('EV-9002-3')
    expect(model.detour?.rejections[0]?.nextSubmission?.evidence.id).toBe(
      'EV-9002-4'
    )
    expect(
      model.applications.map((a) => [
        a.bank,
        a.status,
        a.duration?.calendarDays
      ])
    ).toEqual([
      ['Crestline Bank', 'submitted', 8],
      ['Malayan Trust Bank', 'rejected', 5]
    ])
    expect(model.routeThrough).toBe('loan_approved')
  })

  it('reads a signed case as all done, with no current stop', () => {
    const a = app('APP-S', 'Apex Bank')
    const events = [
      ev('booked', '2026-08-01'),
      ev('documents_received', '2026-08-03', { document: 'payslip' }),
      ev('loan_submitted', '2026-08-04', { applicationId: a.id }),
      ev('loan_approved', '2026-08-12', { applicationId: a.id }),
      ev('spa_signed', '2026-08-20', { verifiedBy: 'Arvind Raj' })
    ]
    const model = journeyOf(story.booking, [a], events)
    expect(model.resolution).toBe('signed')
    expect(model.stops.map((s) => s.state)).toEqual([
      'done',
      'done',
      'done',
      'done',
      'done'
    ])
    expect(model.stops.some((s) => s.current || s.stalled)).toBe(false)
    expect(stop(model, 'spa_signed').duration).toEqual({
      kind: 'completed',
      from: '2026-08-12',
      through: '2026-08-20',
      calendarDays: 8
    })
    // Without a recorded receipt, Documents stays unproven even on a signed case.
    const noReceipt = journeyOf(
      story.booking,
      [a],
      events.filter((e) => e.kind !== 'documents_received')
    )
    expect(stop(noReceipt, 'documents').state).toBe('record_missing')
  })

  it('freezes a cancelled case at its cancellation', () => {
    const a = app('APP-C', 'Apex Bank')
    const events = [
      ev('booked', '2026-08-01'),
      ev('loan_submitted', '2026-08-04', { applicationId: a.id }),
      ev('cancelled', '2026-08-10', {
        track: 'sales',
        note: 'Buyer cancelled'
      }),
      ev('loan_approved', '2026-08-12', { applicationId: a.id })
    ]
    const model = journeyOf(story.booking, [a], events)
    expect(model.resolution).toBe('cancelled')
    expect(model.closure?.evidence?.note).toBe('Buyer cancelled')
    expect(stop(model, 'loan_submitted').state).toBe('done')
    expect(stop(model, 'loan_approved').state).toBe('not_reached')
    expect(stop(model, 'spa_signed').state).toBe('not_reached')
    expect(model.stops.some((s) => s.current || s.stalled)).toBe(false)
  })

  it('reads two live banks as reviewing, with no detour', () => {
    const a = app('APP-1', 'Apex Bank', 'Ali')
    const b = app('APP-2', 'Crestline Bank', 'Bea')
    const events = [
      ev('booked', '2026-09-01'),
      ev('loan_submitted', '2026-09-03', { applicationId: a.id }),
      ev('loan_submitted', '2026-09-04', { applicationId: b.id })
    ]
    const model = journeyOf(story.booking, [a, b], events)
    expect(model.detour).toBeNull()
    expect(stop(model, 'loan_approved')).toMatchObject({
      current: true,
      caption: '2 Banks Reviewing'
    })
    expect(stop(model, 'loan_submitted').caption).not.toMatch(/Resubmitted/)
    expect(model.applications.map((x) => x.banker)).toEqual(['Ali', 'Bea'])
  })

  it('counts each rejected application once, and links the next submission', () => {
    const a = app('APP-1', 'Apex Bank')
    const b = app('APP-2', 'Bayu Bank')
    const c = app('APP-3', 'Crestline Bank')
    const events = [
      ev('booked', '2026-09-01'),
      ev('loan_submitted', '2026-09-02', { applicationId: a.id }),
      ev('loan_rejected', '2026-09-04', { applicationId: a.id }),
      ev('loan_rejected', '2026-09-05', { applicationId: a.id }),
      ev('loan_submitted', '2026-09-06', { applicationId: b.id }),
      ev('loan_rejected', '2026-09-08', { applicationId: b.id }),
      ev('loan_submitted', '2026-09-09', { applicationId: c.id })
    ]
    const model = journeyOf(story.booking, [a, b, c], events)
    expect(model.detour?.flag).toBe('2 Rejections')
    expect(
      model.detour?.rejections.map((r) => [
        r.applicationId,
        r.nextSubmission?.applicationId
      ])
    ).toEqual([
      ['APP-1', 'APP-2'],
      ['APP-2', 'APP-3']
    ])
    expect(stop(model, 'loan_approved').current).toBe(true)
  })

  it('reopens Documents when a request follows a receipt', () => {
    const a = app('APP-1', 'Apex Bank')
    const events = [
      ev('booked', '2026-09-01'),
      ev('documents_received', '2026-09-02', { document: 'payslip' }),
      ev('loan_submitted', '2026-09-03', { applicationId: a.id }),
      ev('documents_requested', '2026-09-12', {
        applicationId: a.id,
        document: 'payslip'
      })
    ]
    const model = journeyOf(story.booking, [a], events)
    const docs = stop(model, 'documents')
    expect(docs).toMatchObject({
      state: 'outstanding',
      current: true,
      reopened: true,
      caption: 'Documents Outstanding'
    })
    expect(docs.outstandingDocuments).toEqual(['payslip'])
    expect(docs.evidence.map((e) => e.kind)).toEqual([
      'documents_received',
      'documents_requested'
    ])
    expect(stop(model, 'loan_submitted').state).toBe('done')
    const noPrior = journeyOf(
      story.booking,
      [a],
      events.filter((e) => e.kind !== 'documents_received')
    )
    expect(stop(noPrior, 'documents').reopened).toBe(false)
  })

  it('puts a withdrawn buyer in release review, with no current stop and no closure', () => {
    const a = app('APP-1', 'Apex Bank')
    const events = [
      ev('booked', '2026-09-01'),
      ev('loan_submitted', '2026-09-03', { applicationId: a.id }),
      ev('buyer_withdrew', '2026-09-10', { track: 'sales' })
    ]
    const model = journeyOf(story.booking, [a], events)
    expect(model.releaseReview).toBe(true)
    expect(model.resolution).toBe('open')
    expect(model.closure).toBeNull()
    expect(model.stops.some((s) => s.current)).toBe(false)
  })

  it('counts only confirmed evidence known by the reference date, whatever the input order', () => {
    const a = app('APP-1', 'Apex Bank')
    const events = [
      ev('booked', '2026-09-01'),
      ev('loan_submitted', '2026-09-03', { applicationId: a.id }),
      ev('loan_approved', '2026-09-08', {
        applicationId: a.id,
        status: 'provisional'
      }),
      ev('loan_approved', '2026-09-09', {
        applicationId: a.id,
        status: 'disputed'
      }),
      // Happened before the reference date, but Mortar only learned of it after.
      ev('loan_approved', '2026-09-17', {
        applicationId: a.id,
        recordedAt: '2026-09-19T09:00:00+08:00'
      }),
      ev('spa_appointment_set', '2026-09-12', { track: 'legal' })
    ]
    const frozen = structuredClone(events)
    const model = journeyOf(story.booking, [a], events)
    expect(stop(model, 'loan_approved').state).toBe('upcoming')
    expect(stop(model, 'spa_signed').state).toBe('upcoming')
    expect(events).toEqual(frozen)
    expect(journeyOf(story.booking, [a], [...events].reverse())).toEqual(model)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `rtk bun run --cwd frontend test -- bookingJourney` Expected: FAIL with
"Failed to resolve import ... bookingJourney".

- [ ] **Step 3: Implement**

Create `frontend/src/components/bookings/bookingJourney.ts` with the code in the
next block. It keeps the spec's types and adds `note` to `JourneyStop`.

```ts
/**
 * The booking journey as a view: five milestones, which of them the log proves,
 * which one the case is waiting on now, and the bank attempts behind them, all
 * read from one snapshot. A presentation derivation over core's rules, not a
 * second stage engine: the current stop comes from `ballInCourt`, achievements
 * only from confirmed evidence on the log, and nothing unrecorded is inferred.
 * Pure: no React, DOM, clock or network.
 */
import { ballInCourt, byOccurred } from '@mortar/core'
import type {
  ApplicationStatus,
  Booking,
  CaseEvent,
  CaseSummary,
  DocumentKind,
  EventKind,
  IsoDate,
  IsoDateTime,
  LoanApplication,
  NextAction
} from '@mortar/core'
import { formatDate } from '@/components/case/format'

export type JourneyStopId =
  'booked' | 'documents' | 'loan_submitted' | 'loan_approved' | 'spa_signed'
export type JourneyStopState =
  'done' | 'upcoming' | 'record_missing' | 'outstanding' | 'not_reached'
export type JourneyEvidence = Pick<
  CaseEvent,
  | 'id'
  | 'kind'
  | 'applicationId'
  | 'occurredAt'
  | 'recordedAt'
  | 'reportedBy'
  | 'verifiedBy'
  | 'messageId'
  | 'document'
  | 'note'
>
export interface JourneyDuration {
  kind: 'completed' | 'elapsed'
  from: IsoDate
  through: IsoDate
  calendarDays: number
}
export interface JourneyStop {
  id: JourneyStopId
  label: string
  state: JourneyStopState
  current: boolean
  stalled: boolean
  /** A receipt is on the log, and documents are outstanding again. */
  reopened: boolean
  confirmedAt: IsoDateTime | null
  caption: string
  responsible: readonly string[]
  outstandingDocuments: readonly DocumentKind[]
  evidence: readonly JourneyEvidence[]
  duration: JourneyDuration | null
  facts: readonly { label: string; value: string }[]
  /** One factual sentence for the details, or null. */
  note: string | null
}
export interface JourneyApplication {
  applicationId: LoanApplication['id']
  bank: string
  banker: string | null
  /** From the case summary; null means absent, never Submitted. */
  status: ApplicationStatus | null
  submitted: JourneyEvidence | null
  decision: JourneyEvidence | null
  duration: JourneyDuration | null
}
export interface JourneyRejection {
  applicationId: LoanApplication['id']
  bank: string
  rejection: JourneyEvidence
  /** The next different application submitted after this rejection, if any. */
  nextSubmission: {
    applicationId: LoanApplication['id']
    evidence: JourneyEvidence
  } | null
}
export interface JourneyDetour {
  id: 'bank-rejections'
  attachBefore: 'loan_submitted'
  flag: string
  rejections: readonly JourneyRejection[]
  target: { view: 'history'; track: 'loan' }
}
export interface BookingJourneyModel {
  bookingId: Booking['id']
  referenceDate: IsoDate
  resolution: 'open' | 'signed' | 'cancelled' | 'lapsed'
  releaseReview: boolean
  stops: readonly [
    JourneyStop,
    JourneyStop,
    JourneyStop,
    JourneyStop,
    JourneyStop
  ]
  applications: readonly JourneyApplication[]
  detour: JourneyDetour | null
  /** How far the road is drawn, independent of which earlier stops are proven. */
  routeThrough: JourneyStopId | null
  closure: {
    kind: 'cancelled' | 'lapsed'
    evidence: JourneyEvidence | null
  } | null
}
export interface BookingJourneyInput {
  booking: Booking
  summary: CaseSummary
  events: readonly CaseEvent[]
  applications: readonly LoanApplication[]
  referenceDate: IsoDate
}

const ORDER: readonly JourneyStopId[] = [
  'booked',
  'documents',
  'loan_submitted',
  'loan_approved',
  'spa_signed'
]
const LABELS: Record<JourneyStopId, string> = {
  booked: 'Booked',
  documents: 'Documents',
  loan_submitted: 'Loan Submitted',
  loan_approved: 'Loan Approved',
  spa_signed: 'SPA Signed'
}
/** Where each next move puts the "you are here" marker. */
const CURRENT: Partial<Record<NextAction, JourneyStopId>> = {
  request_document: 'documents',
  chase_banker: 'loan_approved',
  submit_another_bank: 'loan_submitted',
  schedule_spa: 'spa_signed',
  escalate_legal: 'spa_signed'
}
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

const dateOf = (t: IsoDateTime): IsoDate => t.slice(0, 10) as IsoDate
const ordinal = (d: IsoDate) =>
  Date.UTC(
    Number(d.slice(0, 4)),
    Number(d.slice(5, 7)) - 1,
    Number(d.slice(8, 10))
  ) / 86_400_000
const span = (
  kind: JourneyDuration['kind'],
  from: IsoDate,
  through: IsoDate
): JourneyDuration => ({
  kind,
  from,
  through,
  calendarDays: ordinal(through) - ordinal(from)
})
const shortDate = (d: IsoDate) =>
  `${Number(d.slice(8, 10))} ${MONTHS[Number(d.slice(5, 7)) - 1]}`
const isLive = (s: ApplicationStatus | null) =>
  s === 'submitted' || s === 'documents_pending'
const byEvent = (a: CaseEvent | null, b: CaseEvent | null) =>
  a && b ? byOccurred(a, b) : a ? -1 : b ? 1 : 0
const evidenceOf = (e: CaseEvent): JourneyEvidence => ({
  id: e.id,
  kind: e.kind,
  applicationId: e.applicationId,
  occurredAt: e.occurredAt,
  recordedAt: e.recordedAt,
  reportedBy: e.reportedBy,
  verifiedBy: e.verifiedBy,
  messageId: e.messageId,
  document: e.document,
  note: e.note
})

export function bookingJourney({
  booking,
  summary,
  events,
  applications,
  referenceDate
}: BookingJourneyInput): BookingJourneyModel {
  const ref = referenceDate
  const eligible = events
    .filter(
      (e) =>
        e.bookingId === booking.id &&
        e.status === 'confirmed' &&
        dateOf(e.occurredAt) <= ref &&
        dateOf(e.recordedAt) <= ref
    )
    .sort(byOccurred)

  // A closed case freezes at its first terminal event: later records do not move it.
  const closedKind =
    summary.stage === 'cancelled' || summary.stage === 'lapsed'
      ? summary.stage
      : null
  const terminal = closedKind
    ? eligible.findIndex((e) => e.kind === 'cancelled' || e.kind === 'lapsed')
    : -1
  const log = terminal >= 0 ? eligible.slice(0, terminal) : eligible
  const closure = closedKind
    ? {
        kind: closedKind,
        evidence: terminal >= 0 ? evidenceOf(eligible[terminal]!) : null
      }
    : null
  const resolution: BookingJourneyModel['resolution'] =
    closedKind ?? (summary.spaSigned ? 'signed' : 'open')
  const ball = ballInCourt(summary)
  const releaseReview =
    resolution === 'open' && ball.nextMove === 'review_release'
  const of = (...kinds: EventKind[]) =>
    log.filter((e) => kinds.includes(e.kind))

  // The bank attempts, joined to the summary's statuses by ID.
  const statusOf = new Map(summary.applications.map((a) => [a.id, a.status]))
  const attempts = applications
    .filter((a) => a.bookingId === booking.id)
    .map((app) => {
      const submitted =
        log.find(
          (e) => e.applicationId === app.id && e.kind === 'loan_submitted'
        ) ?? null
      const decision =
        log.find(
          (e) =>
            e.applicationId === app.id &&
            (e.kind === 'loan_approved' || e.kind === 'loan_rejected')
        ) ?? null
      const status = statusOf.get(app.id) ?? null
      const duration =
        submitted && decision
          ? span(
              'completed',
              dateOf(submitted.occurredAt),
              dateOf(decision.occurredAt)
            )
          : submitted && isLive(status) && resolution === 'open'
            ? span('elapsed', dateOf(submitted.occurredAt), ref)
            : null
      return { app, submitted, decision, status, duration }
    })
  const live = attempts.filter((a) => isLive(a.status))
  const ordered = [...attempts].sort(
    (a, b) =>
      Number(isLive(b.status)) - Number(isLive(a.status)) ||
      byEvent(a.submitted, b.submitted)
  )

  const rejections: JourneyRejection[] = attempts
    .filter((a) => a.decision?.kind === 'loan_rejected')
    .sort((a, b) => byOccurred(a.decision!, b.decision!))
    .map((a) => {
      const next = attempts
        .filter(
          (o) =>
            o.app.id !== a.app.id &&
            o.submitted &&
            byOccurred(o.submitted, a.decision!) > 0
        )
        .sort((x, y) => byOccurred(x.submitted!, y.submitted!))[0]
      return {
        applicationId: a.app.id,
        bank: a.app.bank,
        rejection: evidenceOf(a.decision!),
        nextSubmission: next
          ? {
              applicationId: next.app.id,
              evidence: evidenceOf(next.submitted!)
            }
          : null
      }
    })
  const first = rejections[0]
  const detour: JourneyDetour | null = first
    ? {
        id: 'bank-rejections',
        attachBefore: 'loan_submitted',
        flag:
          rejections.length === 1
            ? `${first.bank.replace(/ Bank$/, '')} · Rejected ${shortDate(dateOf(first.rejection.occurredAt))}`
            : `${rejections.length} Rejections`,
        rejections,
        target: { view: 'history', track: 'loan' }
      }
    : null

  // What proves each stop.
  const booked = of('booked')
  const requests = of('documents_requested')
  const receipts = of('documents_received')
  const submissions = attempts
    .flatMap((a) => (a.submitted ? [a.submitted] : []))
    .sort(byOccurred)
  const liveSubmissions = live
    .flatMap((a) => (a.submitted ? [a.submitted] : []))
    .sort(byOccurred)
  const shownSubmission = liveSubmissions.at(-1) ?? submissions.at(-1) ?? null
  const approvals = of('loan_approved')
  const signings = of('spa_signed')
  const proof: Record<JourneyStopId, CaseEvent | null> = {
    booked: booked[0] ?? null,
    documents: receipts.at(-1) ?? null,
    loan_submitted: shownSubmission,
    loan_approved: approvals[0] ?? null,
    spa_signed: signings[0] ?? null
  }
  const evidence: Record<JourneyStopId, CaseEvent[]> = {
    booked,
    documents: [...requests, ...receipts].sort(byOccurred),
    loan_submitted: submissions,
    loan_approved: approvals,
    spa_signed: of('spa_appointment_set', 'spa_signed')
  }
  const furthest = Math.max(-1, ...ORDER.map((id, i) => (proof[id] ? i : -1)))
  const currentId =
    resolution === 'open' && !releaseReview && ball.nextMove
      ? (CURRENT[ball.nextMove] ?? null)
      : null
  const resubmitted = rejections.some((r) => r.nextSubmission)
  const lastUpdate = log.at(-1)
  const approvedAttempt = approvals[0]
    ? attempts.find((a) => a.decision?.id === approvals[0]!.id)
    : undefined

  const durationOf = (
    id: JourneyStopId,
    current: boolean
  ): JourneyDuration | null => {
    switch (id) {
      case 'booked':
        return booked[0] && submissions[0]
          ? span(
              'completed',
              dateOf(booked[0].occurredAt),
              dateOf(submissions[0].occurredAt)
            )
          : null
      case 'documents':
        return requests[0] && receipts.at(-1)
          ? span(
              'completed',
              dateOf(requests[0].occurredAt),
              dateOf(receipts.at(-1)!.occurredAt)
            )
          : null
      case 'loan_submitted':
        return null
      case 'loan_approved':
        if (approvals[0] && approvedAttempt?.submitted)
          return span(
            'completed',
            dateOf(approvedAttempt.submitted.occurredAt),
            dateOf(approvals[0].occurredAt)
          )
        return current && shownSubmission
          ? span('elapsed', dateOf(shownSubmission.occurredAt), ref)
          : null
      case 'spa_signed':
        return signings[0] && approvals[0]
          ? span(
              'completed',
              dateOf(approvals[0].occurredAt),
              dateOf(signings[0].occurredAt)
            )
          : null
    }
  }

  const responsibleOf = (id: JourneyStopId): string[] => {
    if (id === 'booked') return [booking.salesOwner]
    if (id === 'spa_signed') return [booking.legalFirm]
    if (id === 'loan_approved')
      return [
        ...new Set([
          ...live.map((a) => `${a.app.banker} · ${a.app.bank}`),
          booking.loanOwner
        ])
      ]
    return [booking.loanOwner]
  }

  const stops = ORDER.map((id, i): JourneyStop => {
    const hit = proof[id]
    const outstanding =
      id === 'documents' &&
      resolution === 'open' &&
      summary.outstandingDocuments.length > 0
    const state: JourneyStopState = outstanding
      ? 'outstanding'
      : hit
        ? 'done'
        : closure && i > furthest
          ? 'not_reached'
          : i < furthest
            ? 'record_missing'
            : 'upcoming'
    const current = id === currentId
    const caption = current
      ? id === 'documents'
        ? requests.length > 0
          ? 'Documents Outstanding'
          : 'Collecting Documents'
        : id === 'loan_approved'
          ? live.length > 1
            ? `${live.length} Banks Reviewing`
            : 'Awaiting Decision'
          : id === 'loan_submitted'
            ? 'Another Bank Needed'
            : ball.nextMove === 'schedule_spa'
              ? 'Awaiting Appointment'
              : 'Awaiting Signing'
      : state === 'done'
        ? `${formatDate(dateOf(hit!.occurredAt))}${id === 'loan_submitted' && resubmitted ? ' · Resubmitted' : ''}`
        : state === 'outstanding'
          ? 'Documents Outstanding'
          : state === 'record_missing'
            ? id === 'documents'
              ? 'Receipt Not Recorded'
              : 'Date Not Recorded'
            : state === 'not_reached'
              ? 'Not Reached'
              : 'Upcoming'
    const duration = durationOf(id, current)
    const facts =
      current && id === 'loan_approved'
        ? [
            { label: 'Approval Date', value: '—' },
            {
              label: 'Banker',
              value:
                live.map((a) => `${a.app.banker} · ${a.app.bank}`).join(', ') ||
                '—'
            },
            {
              label: 'Last Confirmed Update',
              value: lastUpdate
                ? formatDate(dateOf(lastUpdate.occurredAt))
                : '—'
            }
          ]
        : hit
          ? [
              { label: 'Date', value: formatDate(dateOf(hit.occurredAt)) },
              { label: 'Recorded By', value: hit.reportedBy },
              { label: 'Verified By', value: hit.verifiedBy ?? '—' }
            ]
          : [{ label: 'Date', value: '—' }]
    const note =
      current && id === 'loan_approved' && duration
        ? `${duration.calendarDays} calendar days since submission.${
            ball.stalled && summary.stallReasons.length
              ? ` Stalled: ${summary.stallReasons.join('; ')}.`
              : ''
          } Approval has not been confirmed.`
        : state === 'record_missing' && id === 'documents'
          ? 'Later work is recorded, but no document receipt is on the log.'
          : (hit?.note ?? null)
    return {
      id,
      label: LABELS[id],
      state,
      current,
      stalled: current && ball.stalled,
      reopened: outstanding && receipts.length > 0,
      confirmedAt: hit?.occurredAt ?? null,
      caption,
      responsible: responsibleOf(id),
      outstandingDocuments:
        id === 'documents' ? summary.outstandingDocuments : [],
      evidence: evidence[id].map(evidenceOf),
      duration,
      facts,
      note
    }
  }) as unknown as BookingJourneyModel['stops']

  return {
    bookingId: booking.id,
    referenceDate: ref,
    resolution,
    releaseReview,
    stops,
    applications: ordered.map((a) => ({
      applicationId: a.app.id,
      bank: a.app.bank,
      banker: a.app.banker || null,
      status: a.status,
      submitted: a.submitted ? evidenceOf(a.submitted) : null,
      decision: a.decision ? evidenceOf(a.decision) : null,
      duration: a.duration
    })),
    detour,
    routeThrough:
      currentId ??
      (resolution === 'signed'
        ? 'spa_signed'
        : furthest >= 0
          ? ORDER[furthest]!
          : null),
    closure
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `rtk bun run --cwd frontend test -- bookingJourney` Expected: PASS (8
tests). If BK-9002's Approved stop is not stalled, read `summarizeCases`'s stall
reasons for it as of the reference date and check the story still stalls at 8
days; never weaken the assertion to make it pass without a ruling.

- [ ] **Step 5: Typecheck and lint**

Run: `rtk bun run --cwd frontend typecheck` and
`rtk bunx eslint frontend/src/components/bookings/bookingJourney.ts` Expected:
no errors.

- [ ] **Step 6: Commit**

```bash
rtk git add frontend/src/components/bookings/bookingJourney.ts frontend/src/components/bookings/__tests__/bookingJourney.test.ts docs/research/case-page
rtk git commit -m "feat(case): derive the booking journey from confirmed evidence

Claude-Session: https://claude.ai/code/session_01W7s74co9WkbrhgkSJgxrZZ"
```
