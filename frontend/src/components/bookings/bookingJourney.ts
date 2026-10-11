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

export type JourneyStopId = 'booked' | 'documents' | 'loan_submitted' | 'loan_approved' | 'spa_signed'
export type JourneyStopState = 'done' | 'upcoming' | 'record_missing' | 'outstanding' | 'not_reached'
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
  nextSubmission: { applicationId: LoanApplication['id']; evidence: JourneyEvidence } | null
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
  /** Calendar days from the booking date to the reference date. */
  ageDays: number
  resolution: 'open' | 'signed' | 'cancelled' | 'lapsed'
  releaseReview: boolean
  stops: readonly [JourneyStop, JourneyStop, JourneyStop, JourneyStop, JourneyStop]
  applications: readonly JourneyApplication[]
  detour: JourneyDetour | null
  /** How far the road is drawn, independent of which earlier stops are proven. */
  routeThrough: JourneyStopId | null
  closure: { kind: 'cancelled' | 'lapsed'; evidence: JourneyEvidence | null } | null
}
export interface BookingJourneyInput {
  booking: Booking
  summary: CaseSummary
  events: readonly CaseEvent[]
  applications: readonly LoanApplication[]
  referenceDate: IsoDate
}

const ORDER: readonly JourneyStopId[] = ['booked', 'documents', 'loan_submitted', 'loan_approved', 'spa_signed']
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
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const dateOf = (t: IsoDateTime): IsoDate => t.slice(0, 10) as IsoDate
const ordinal = (d: IsoDate) =>
  Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10))) / 86_400_000
/** Calendar days from one date to a later one; null when the end comes first, since work can overlap. */
const span = (kind: JourneyDuration['kind'], from: IsoDate, through: IsoDate): JourneyDuration | null =>
  ordinal(through) < ordinal(from) ? null : { kind, from, through, calendarDays: ordinal(through) - ordinal(from) }
const shortDate = (d: IsoDate) => `${Number(d.slice(8, 10))} ${MONTHS[Number(d.slice(5, 7)) - 1]}`
const last = <T>(xs: readonly T[]): T | undefined => xs[xs.length - 1]
/** The wait for a bank's decision in one sentence; a silence stall says so without repeating the count. */
const approvalWait = (days: number, stallReasons: readonly string[]) => {
  const span = `${days} calendar day${days === 1 ? '' : 's'}`
  if (stallReasons.length > 0 && stallReasons.every((r) => r.startsWith('No Update For')))
    return `No update has been recorded in the ${span} since submission.`
  return `${span} since submission.${stallReasons.length ? ` Stalled: ${stallReasons.join('; ')}.` : ''}`
}
const isLive = (s: ApplicationStatus | null) => s === 'submitted' || s === 'documents_pending'
const byEvent = (a: CaseEvent | null, b: CaseEvent | null) => (a && b ? byOccurred(a, b) : a ? -1 : b ? 1 : 0)
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
  const closedKind = summary.stage === 'cancelled' || summary.stage === 'lapsed' ? summary.stage : null
  const terminal = closedKind ? eligible.findIndex((e) => e.kind === 'cancelled' || e.kind === 'lapsed') : -1
  const log = terminal >= 0 ? eligible.slice(0, terminal) : eligible
  const closure = closedKind
    ? { kind: closedKind, evidence: terminal >= 0 ? evidenceOf(eligible[terminal]!) : null }
    : null
  const resolution: BookingJourneyModel['resolution'] = closedKind ?? (summary.spaSigned ? 'signed' : 'open')
  const ball = ballInCourt(summary)
  const releaseReview = resolution === 'open' && ball.nextMove === 'review_release'
  const of = (...kinds: EventKind[]) => log.filter((e) => kinds.includes(e.kind))

  // The bank attempts, joined to the summary's statuses by ID.
  const statusOf = new Map(summary.applications.map((a) => [a.id, a.status]))
  const attempts = applications
    .filter((a) => a.bookingId === booking.id)
    .map((app) => {
      const submitted = log.find((e) => e.applicationId === app.id && e.kind === 'loan_submitted') ?? null
      const decision =
        log.find((e) => e.applicationId === app.id && (e.kind === 'loan_approved' || e.kind === 'loan_rejected')) ??
        null
      const status = statusOf.get(app.id) ?? null
      const duration =
        submitted && decision
          ? span('completed', dateOf(submitted.occurredAt), dateOf(decision.occurredAt))
          : submitted && isLive(status) && resolution === 'open'
            ? span('elapsed', dateOf(submitted.occurredAt), ref)
            : null
      return { app, submitted, decision, status, duration }
    })
  const live = attempts.filter((a) => isLive(a.status))
  const ordered = [...attempts].sort(
    (a, b) => Number(isLive(b.status)) - Number(isLive(a.status)) || byEvent(a.submitted, b.submitted)
  )

  const rejections: JourneyRejection[] = attempts
    .filter((a) => a.decision?.kind === 'loan_rejected')
    .sort((a, b) => byOccurred(a.decision!, b.decision!))
    .map((a) => {
      const next = attempts
        .filter((o) => o.app.id !== a.app.id && o.submitted && byOccurred(o.submitted, a.decision!) > 0)
        .sort((x, y) => byOccurred(x.submitted!, y.submitted!))[0]
      return {
        applicationId: a.app.id,
        bank: a.app.bank,
        rejection: evidenceOf(a.decision!),
        nextSubmission: next ? { applicationId: next.app.id, evidence: evidenceOf(next.submitted!) } : null
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
  const submissions = attempts.flatMap((a) => (a.submitted ? [a.submitted] : [])).sort(byOccurred)
  const liveSubmissions = live.flatMap((a) => (a.submitted ? [a.submitted] : [])).sort(byOccurred)
  const shownSubmission = last(liveSubmissions) ?? last(submissions) ?? null
  const approvals = of('loan_approved')
  const signings = of('spa_signed')
  const proof: Record<JourneyStopId, CaseEvent | null> = {
    booked: booked[0] ?? null,
    documents: last(receipts) ?? null,
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
  const currentId = resolution === 'open' && !releaseReview && ball.nextMove ? (CURRENT[ball.nextMove] ?? null) : null
  const currentIndex = currentId ? ORDER.indexOf(currentId) : -1
  /** How far the case has got: the furthest proven stop or the one being waited on, whichever is later. */
  const reached = Math.max(furthest, currentIndex)
  // Resubmitted only when another bank had already said no before the submission shown.
  const resubmitted =
    shownSubmission !== null &&
    rejections.some(
      (r) => r.applicationId !== shownSubmission.applicationId && r.rejection.occurredAt < shownSubmission.occurredAt
    )
  const lastUpdate = last(log)
  const approvedAttempt = approvals[0] ? attempts.find((a) => a.decision?.id === approvals[0]!.id) : undefined

  const durationOf = (id: JourneyStopId, current: boolean): JourneyDuration | null => {
    switch (id) {
      case 'booked':
        return booked[0] && submissions[0]
          ? span('completed', dateOf(booked[0].occurredAt), dateOf(submissions[0].occurredAt))
          : null
      case 'documents': {
        // From the first request to the first receipt that answered it.
        const answer = requests[0] ? receipts.find((r) => byOccurred(r, requests[0]!) >= 0) : undefined
        return requests[0] && answer
          ? span('completed', dateOf(requests[0].occurredAt), dateOf(answer.occurredAt))
          : null
      }
      case 'loan_submitted':
        return null
      case 'loan_approved':
        if (approvals[0] && approvedAttempt?.submitted)
          return span('completed', dateOf(approvedAttempt.submitted.occurredAt), dateOf(approvals[0].occurredAt))
        return current && shownSubmission ? span('elapsed', dateOf(shownSubmission.occurredAt), ref) : null
      case 'spa_signed':
        return signings[0] && approvals[0]
          ? span('completed', dateOf(approvals[0].occurredAt), dateOf(signings[0].occurredAt))
          : null
    }
  }

  const responsibleOf = (id: JourneyStopId): string[] => {
    if (id === 'booked') return [booking.salesOwner]
    if (id === 'spa_signed') return [booking.legalFirm]
    if (id === 'loan_approved')
      return [...new Set([...live.map((a) => `${a.app.banker} · ${a.app.bank}`), booking.loanOwner])]
    return [booking.loanOwner]
  }

  const stops = ORDER.map((id, i): JourneyStop => {
    const hit = proof[id]
    const outstanding = id === 'documents' && resolution === 'open' && summary.outstandingDocuments.length > 0
    const state: JourneyStopState = outstanding
      ? 'outstanding'
      : hit
        ? 'done'
        : closure && i > furthest
          ? 'not_reached'
          : i < reached
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
            { label: 'Banker', value: live.map((a) => `${a.app.banker} · ${a.app.bank}`).join(', ') || '—' },
            { label: 'Last Confirmed Update', value: lastUpdate ? formatDate(dateOf(lastUpdate.occurredAt)) : '—' }
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
        ? `${approvalWait(duration.calendarDays, ball.stalled ? summary.stallReasons : [])} Approval has not been confirmed.`
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
      outstandingDocuments: id === 'documents' ? summary.outstandingDocuments : [],
      evidence: evidence[id].map(evidenceOf),
      duration,
      facts,
      note
    }
  }) as unknown as BookingJourneyModel['stops']

  return {
    bookingId: booking.id,
    referenceDate: ref,
    ageDays: Math.max(0, ordinal(ref) - ordinal(booking.bookingDate)),
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
      resolution === 'signed'
        ? 'spa_signed'
        : (closure ? furthest : reached) >= 0
          ? ORDER[closure ? furthest : reached]!
          : null,
    closure
  }
}
