import { ballInCourt, type BallHolder } from '../ball'
import { currentCaseAssignee } from '../profiles'
import { DEFAULT_ASSUMPTIONS } from './assumptions'
import { byOccurred, deriveCase, groupBy, summarizeCases, type CaseDataInput, type CaseFacts } from './cases'
import { HORIZON_DAYS } from './constants'
import { addDays, dateOf, diffDays, fromEpoch, stamp, toEpoch } from './dates'
import { buildForecastModel, forecast } from './forecast'
import type {
  CaseEvent,
  CaseSummary,
  Dataset,
  Forecast,
  ForecastModel,
  IsoDate,
  LoanApplication,
  NextAction,
  Stage
} from '../types'

export interface InsightBooking {
  bookingId: string
  unit: string
  project: string
  priceRm: number
  bookingDate: IsoDate
  stage: Stage
  ageDays: number
  daysInStage: number | null
  daysSinceUpdate: number | null
  holder: BallHolder | null
  waitingFor: string
  nextMove: NextAction | null
  assigneeName: string | null
}

export interface ForecastInsights {
  asOf: IsoDate
  forecast: Forecast
  history: { scope: 'project' | 'visible'; asOf: IsoDate; resolved: number; signed: number }
  open: { count: number; valueRm: number; olderCount: number; withdrawnCount: number }
  outlook: (InsightBooking & { probability: number | null; deadline: IsoDate })[]
  approved: {
    count: number
    valueRm: number
    withoutAppointmentCount: number
    rows: (InsightBooking & {
      approvedOn: IsoDate
      daysSinceApproval: number
      appointmentRecorded: boolean
      appointmentOn: IsoDate | null
    })[]
  }
  appointments: {
    from: IsoDate
    to: IsoDate
    upcoming: (InsightBooking & { appointmentOn: IsoDate })[]
    overdue: (InsightBooking & { appointmentOn: IsoDate })[]
    undatedCount: number
  }
  waiting: {
    groups: { holder: BallHolder; count: number; valueRm: number; oldestDays: number | null }[]
    rows: InsightBooking[]
  }
  turnaround: {
    bookingToSigning: { sample: number; medianDays: number | null }
    approvalToSigning: { sample: number; medianDays: number | null }
    rows: {
      bookingId: string
      unit: string
      priceRm: number
      bookedOn: IsoDate
      signedOn: IsoDate
      approvedOn: IsoDate | null
      bookingToSigningDays: number | null
      approvalToSigningDays: number | null
    }[]
  }
  exits: {
    count: number
    valueRm: number
    cancelledCount: number
    lapsedCount: number
    medianDaysToExit: number | null
    rows: (InsightBooking & { outcome: 'cancelled' | 'lapsed'; closedOn: IsoDate; daysToExit: number })[]
  }
  secondBank: {
    attemptedCount: number
    signedCount: number
    resolvedCount: number
    pendingCount: number
    rows: {
      bookingId: string
      unit: string
      priceRm: number
      resubmittedOn: IsoDate
      outcome: 'signed' | 'cancelled' | 'lapsed' | 'open'
    }[]
    followUp: InsightBooking[]
  }
}

interface InsightCase {
  facts: CaseFacts
  summary: CaseSummary
  row: InsightBooking
}

const APP_EVIDENCE = new Set<CaseEvent['kind']>([
  'loan_submitted',
  'loan_approved',
  'loan_rejected',
  'documents_requested',
  'documents_received'
])

function isCalendarDate(date: IsoDate): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && fromEpoch(toEpoch(date)) === date
}

function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2
}

function orderedDays(from: IsoDate, to: IsoDate): number | null {
  if (!isCalendarDate(from) || !isCalendarDate(to)) return null
  const days = diffDays(from, to)
  return days >= 0 ? days : null
}

function bankKey(bank: string): string {
  return bank.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase()
}

function firstDistinctRetry(events: CaseEvent[], applications: Map<string, LoanApplication>): CaseEvent | null {
  const rejectedBanks: string[] = []
  for (const event of events) {
    if (event.kind === 'spa_signed' || event.kind === 'cancelled' || event.kind === 'lapsed') break
    if (event.applicationId === null) continue
    const application = applications.get(event.applicationId)
    if (!application) continue
    const bank = bankKey(application.bank)
    if (event.kind === 'loan_rejected') {
      if (bank) rejectedBanks.push(bank)
    } else if (event.kind === 'loan_submitted' && bank && rejectedBanks.some((rejected) => rejected !== bank)) {
      return event
    }
  }
  return null
}

function sortWaitingRows(a: InsightBooking, b: InsightBooking): number {
  if (a.daysInStage === null && b.daysInStage !== null) return 1
  if (a.daysInStage !== null && b.daysInStage === null) return -1
  return (b.daysInStage ?? 0) - (a.daysInStage ?? 0) || b.priceRm - a.priceRm || a.bookingId.localeCompare(b.bookingId)
}

/** Build booking-backed operational views from confirmed evidence known by `asOf`. */
export function forecastInsights(
  data: Dataset,
  asOf: IsoDate,
  options: { model?: ForecastModel } = {}
): ForecastInsights {
  const bookings = data.bookings.filter((booking) => booking.bookingDate <= asOf)
  const events = data.events
    .filter(
      (event) => event.status === 'confirmed' && dateOf(event.occurredAt) <= asOf && dateOf(event.recordedAt) <= asOf
    )
    .sort(byOccurred)
  const eventsByBooking = groupBy(events, (event) => event.bookingId)
  const allAppsByBooking = groupBy(data.applications, (application) => application.bookingId)
  const appsWithEvidence = (bookingId: string) => {
    const eventAppIds = new Set(
      (eventsByBooking.get(bookingId) ?? [])
        .filter((event) => event.applicationId !== null && APP_EVIDENCE.has(event.kind))
        .map((event) => event.applicationId!)
    )
    return (allAppsByBooking.get(bookingId) ?? []).filter((application) => eventAppIds.has(application.id))
  }
  const operationalApplications = bookings.flatMap((booking) => appsWithEvidence(booking.id))
  const operationalData: CaseDataInput = { bookings, applications: operationalApplications, events, tasks: [] }
  const summaries = summarizeCases(operationalData, asOf, DEFAULT_ASSUMPTIONS)
  const summariesById = new Map(summaries.map((summary) => [summary.bookingId, summary]))
  const cases: InsightCase[] = bookings.map((booking) => {
    const bookingEvents = eventsByBooking.get(booking.id) ?? []
    const facts = deriveCase(booking, appsWithEvidence(booking.id), bookingEvents, asOf)
    const summary = summariesById.get(booking.id)!
    const court = ballInCourt(summary)
    const enteredAge = facts.funnelRank >= 0 ? facts.enteredAges[facts.funnelRank] : null
    return {
      facts,
      summary,
      row: {
        bookingId: booking.id,
        unit: booking.unit,
        project: booking.project,
        priceRm: booking.priceRm,
        bookingDate: booking.bookingDate,
        stage: facts.stage,
        ageDays: facts.ageDays,
        daysInStage: enteredAge === null ? null : facts.ageDays - enteredAge,
        daysSinceUpdate: facts.lastEvidenceOn === null ? null : diffDays(facts.lastEvidenceOn, asOf),
        holder: court.holder,
        waitingFor: court.waitingFor,
        nextMove: court.nextMove,
        assigneeName: currentCaseAssignee(booking, summary)?.name ?? null
      }
    }
  })
  const casesById = new Map(cases.map((item) => [item.facts.booking.id, item]))
  const historyModel =
    options.model ??
    buildForecastModel(
      { bookings, applications: data.applications, events },
      asOf,
      stamp(asOf, 0, 0),
      stamp(addDays(asOf, 7), 0, 0)
    )
  const forecastResult = forecast(data, asOf, { model: historyModel })
  const history = {
    scope: options.model ? ('project' as const) : ('visible' as const),
    asOf: historyModel.asOf,
    resolved: historyModel.overall.resolved,
    signed: historyModel.overall.signed
  }
  const openCases = cases.filter(({ facts }) => facts.open)
  const openRows = openCases.map(({ row }) => row)
  const open = {
    count: openCases.length,
    valueRm: openCases.reduce((sum, { facts }) => sum + facts.booking.priceRm, 0),
    olderCount: openCases.filter(({ facts }) => facts.ageDays >= HORIZON_DAYS).length,
    withdrawnCount: openCases.filter(({ facts }) => facts.buyerWithdrew).length
  }
  const forecastById = new Map(forecastResult.perBooking.map((item) => [item.bookingId, item.probability]))
  const outlook = forecastResult.perBooking
    .flatMap(({ bookingId }) => {
      const item = casesById.get(bookingId)
      if (!item) return []
      return [
        {
          ...item.row,
          probability: forecastResult.support === 'supported' ? forecastById.get(bookingId)! : null,
          deadline: addDays(item.facts.booking.bookingDate, HORIZON_DAYS)
        }
      ]
    })
    .sort(
      (a, b) =>
        (a.probability === null
          ? b.probability === null
            ? 0
            : 1
          : b.probability === null
            ? -1
            : b.probability - a.probability) ||
        a.deadline.localeCompare(b.deadline) ||
        a.bookingId.localeCompare(b.bookingId)
    )
  const approvedRows = openCases
    .filter(({ facts }) => !facts.buyerWithdrew && facts.loIssuedOn !== null)
    .map(({ facts, row }) => ({
      ...row,
      approvedOn: facts.loIssuedOn!,
      daysSinceApproval: diffDays(facts.loIssuedOn!, asOf),
      appointmentRecorded: facts.spaAppointmentSetOn !== null,
      appointmentOn: facts.spaAppointmentOn && isCalendarDate(facts.spaAppointmentOn) ? facts.spaAppointmentOn : null
    }))
    .sort(
      (a, b) =>
        b.daysSinceApproval - a.daysSinceApproval || b.priceRm - a.priceRm || a.bookingId.localeCompare(b.bookingId)
    )
  let undatedCount = 0
  const appointmentRows = openCases.flatMap(({ facts, row }) => {
    if (facts.buyerWithdrew || facts.spaAppointmentSetOn === null) return []
    const appointmentOn = facts.spaAppointmentOn
    if (appointmentOn === null || !isCalendarDate(appointmentOn)) {
      undatedCount += 1
      return []
    }
    return [{ ...row, appointmentOn }]
  })
  const to = addDays(asOf, HORIZON_DAYS)
  const appointments = {
    from: asOf,
    to,
    upcoming: appointmentRows
      .filter((row) => row.appointmentOn >= asOf && row.appointmentOn <= to)
      .sort((a, b) => a.appointmentOn.localeCompare(b.appointmentOn) || a.bookingId.localeCompare(b.bookingId)),
    overdue: appointmentRows
      .filter((row) => row.appointmentOn < asOf)
      .sort((a, b) => a.appointmentOn.localeCompare(b.appointmentOn) || a.bookingId.localeCompare(b.bookingId)),
    undatedCount
  }
  const waitingRows = [...openRows].sort(sortWaitingRows)
  const waitingGroups = [
    ...groupBy(
      waitingRows.filter((row) => row.holder !== null),
      (row) => row.holder!
    ).values()
  ]
    .map((rows) => ({
      holder: rows[0]!.holder!,
      count: rows.length,
      valueRm: rows.reduce((sum, row) => sum + row.priceRm, 0),
      oldestDays: rows.reduce<number | null>(
        (oldest, row) =>
          row.daysInStage === null ? oldest : oldest === null ? row.daysInStage : Math.max(oldest, row.daysInStage),
        null
      )
    }))
    .sort((a, b) => b.valueRm - a.valueRm || a.holder.localeCompare(b.holder))
  const turnaroundRows = cases.flatMap(({ facts }) => {
    const signedOn = facts.signedOn
    const booking = facts.booking
    if (signedOn === null || !isCalendarDate(booking.bookingDate) || !isCalendarDate(signedOn)) return []
    const approvedOn = facts.loIssuedOn !== null && isCalendarDate(facts.loIssuedOn) ? facts.loIssuedOn : null
    return [
      {
        bookingId: booking.id,
        unit: booking.unit,
        priceRm: booking.priceRm,
        bookedOn: booking.bookingDate,
        signedOn,
        approvedOn,
        bookingToSigningDays: orderedDays(booking.bookingDate, signedOn),
        approvalToSigningDays: approvedOn === null ? null : orderedDays(approvedOn, signedOn)
      }
    ]
  })
  turnaroundRows.sort((a, b) => b.signedOn.localeCompare(a.signedOn) || a.bookingId.localeCompare(b.bookingId))
  const bookingDurations = turnaroundRows.flatMap((row) =>
    row.bookingToSigningDays === null ? [] : [row.bookingToSigningDays]
  )
  const approvalDurations = turnaroundRows.flatMap((row) =>
    row.approvalToSigningDays === null ? [] : [row.approvalToSigningDays]
  )
  const exitRows = cases.flatMap(({ facts, row }) => {
    if (
      facts.terminal === null ||
      facts.signedOn !== null ||
      facts.terminalAge === null ||
      !isCalendarDate(row.bookingDate)
    ) {
      return []
    }
    return [
      {
        ...row,
        outcome: facts.terminal,
        closedOn: addDays(row.bookingDate, facts.terminalAge),
        daysToExit: facts.terminalAge
      }
    ]
  })
  exitRows.sort((a, b) => b.priceRm - a.priceRm || a.bookingId.localeCompare(b.bookingId))
  const retryRows = cases.flatMap(({ facts }) => {
    const bookingEvents = eventsByBooking.get(facts.booking.id) ?? []
    const applicationById = new Map(
      (allAppsByBooking.get(facts.booking.id) ?? []).map((application) => [application.id, application])
    )
    const retry = firstDistinctRetry(bookingEvents, applicationById)
    if (!retry) return []
    const retryIndex = bookingEvents.indexOf(retry)
    const afterRetry = bookingEvents.slice(retryIndex + 1)
    const signing = afterRetry.some((event) => event.kind === 'spa_signed')
    const terminal = afterRetry.find((event) => event.kind === 'cancelled' || event.kind === 'lapsed')
    const outcome: ForecastInsights['secondBank']['rows'][number]['outcome'] = signing
      ? 'signed'
      : terminal?.kind === 'cancelled' || terminal?.kind === 'lapsed'
        ? terminal.kind
        : 'open'
    return [
      {
        bookingId: facts.booking.id,
        unit: facts.booking.unit,
        priceRm: facts.booking.priceRm,
        resubmittedOn: dateOf(retry.occurredAt),
        outcome
      }
    ]
  })
  retryRows.sort((a, b) => a.resubmittedOn.localeCompare(b.resubmittedOn) || a.bookingId.localeCompare(b.bookingId))
  const activeStatuses = new Set(['submitted', 'documents_pending', 'approved'])
  const followUp = cases
    .filter(({ facts }) => {
      if (!facts.open || facts.buyerWithdrew) return false
      const bookingId = facts.booking.id
      const knownAppIds = new Set((allAppsByBooking.get(bookingId) ?? []).map((application) => application.id))
      const rejected = (eventsByBooking.get(bookingId) ?? []).some(
        (event) =>
          event.kind === 'loan_rejected' && event.applicationId !== null && knownAppIds.has(event.applicationId)
      )
      return (
        rejected &&
        !retryRows.some((retry) => retry.bookingId === bookingId) &&
        !facts.applications.some((application) => activeStatuses.has(application.status))
      )
    })
    .map(({ row }) => row)
    .sort(sortWaitingRows)
  const signedCount = retryRows.filter((row) => row.outcome === 'signed').length
  const resolvedCount = retryRows.filter((row) => row.outcome !== 'open').length

  return {
    asOf,
    forecast: forecastResult,
    history,
    open,
    outlook,
    approved: {
      count: approvedRows.length,
      valueRm: approvedRows.reduce((sum, row) => sum + row.priceRm, 0),
      withoutAppointmentCount: approvedRows.filter((row) => !row.appointmentRecorded).length,
      rows: approvedRows
    },
    appointments,
    waiting: { groups: waitingGroups, rows: waitingRows },
    turnaround: {
      bookingToSigning: { sample: bookingDurations.length, medianDays: median(bookingDurations) },
      approvalToSigning: { sample: approvalDurations.length, medianDays: median(approvalDurations) },
      rows: turnaroundRows
    },
    exits: {
      count: exitRows.length,
      valueRm: exitRows.reduce((sum, row) => sum + row.priceRm, 0),
      cancelledCount: exitRows.filter((row) => row.outcome === 'cancelled').length,
      lapsedCount: exitRows.filter((row) => row.outcome === 'lapsed').length,
      medianDaysToExit: median(exitRows.map((row) => row.daysToExit)),
      rows: exitRows
    },
    secondBank: {
      attemptedCount: retryRows.length,
      signedCount,
      resolvedCount,
      pendingCount: retryRows.length - resolvedCount,
      rows: retryRows,
      followUp
    }
  }
}
