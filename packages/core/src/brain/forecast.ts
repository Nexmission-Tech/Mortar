import type { AskContext, AskQuestion, AskReply } from '../types'
import { forecastInsights } from '../sim/insights'

const money = new Intl.NumberFormat('en-MY', { maximumFractionDigits: 0 })
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDay(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return '—'
  const [, year, month, day] = match
  const monthLabel = MONTHS[Number(month) - 1]
  return monthLabel ? `${Number(day)} ${monthLabel} ${year}` : '—'
}

function formatRm(value: number): string {
  return `RM ${money.format(Number.isFinite(value) ? value : 0)}`
}

export const FORECAST_DOCUMENT_QUESTIONS = {
  outlook: 'Explain the SPA signing outlook and its booking-day-30 deadline.',
  approved: 'Which approved bookings are still awaiting their SPA?',
  waiting: 'Where are our unsigned bookings waiting, including older bookings?',
  conversion: 'What do our recorded conversion rates and completed signing times show?',
  lost: 'What do our cancelled or lapsed bookings and second-bank follow-ups show?'
} as const

const CITATION_LIMIT = 6

const report = (text: string, citations: string[] = []): AskReply => ({
  text: text.endsWith('.') ? text : `${text}.`,
  citations: [...new Set(citations)].slice(0, CITATION_LIMIT)
})

function insightsFor(context: AskContext) {
  const { snapshot } = context
  return forecastInsights(snapshot, snapshot.meta.referenceDate, { model: snapshot.forecastModel })
}

function outlookAnswer(context: AskContext): AskReply {
  const result = insightsFor(context)
  const historyScope = result.history.scope === 'project' ? 'project-wide history' : 'your accessible history'
  const historyBasis = `${result.history.resolved} resolved bookings, ${result.history.signed} signed by booking day 30, as of ${formatDay(result.history.asOf)} in ${historyScope}`
  const appointments = `Recorded appointments from ${formatDay(result.appointments.from)} through ${formatDay(result.appointments.to)}: ${result.appointments.upcoming.length} upcoming, ${result.appointments.overdue.length} overdue, ${result.appointments.undatedCount} with a missing date.`
  if (result.forecast.support !== 'supported') {
    return report(
      `The booking-day-30 outlook is unavailable because there is no resolved history to estimate from. There are ${result.forecast.liveBookings} eligible bookings; the available history is ${historyBasis}. ${appointments}`,
      result.outlook.map((row) => row.bookingId)
    )
  }

  const eligibleWithdrawals = result.outlook.filter((row) => row.nextMove === 'review_release').length
  const withdrawal =
    eligibleWithdrawals > 0
      ? ` ${eligibleWithdrawals} buyer withdrawal${eligibleWithdrawals === 1 ? '' : 's'} without recorded closure remain in the estimate; willingness to proceed is unconfirmed.`
      : ''
  return report(
    `The estimate is ${result.forecast.expectedSignings.toFixed(1)} expected signings across ${result.forecast.liveBookings} eligible bookings, with a count range of ${result.forecast.rangeLow} to ${result.forecast.rangeHigh}. Eligible bookings are unsigned, unclosed, and less than 30 days from booking. The range uses the same historical chances; it is not a promise. History: ${historyBasis}. ${appointments}${withdrawal}`,
    result.outlook.map((row) => row.bookingId)
  )
}

function approvedAnswer(context: AskContext): AskReply {
  const result = insightsFor(context)
  const noAppointment = result.approved.withoutAppointmentCount
  const detail =
    result.approved.count === 0
      ? 'No approved bookings await an SPA.'
      : noAppointment === 0
        ? 'Every approved booking has a recorded appointment.'
        : `${noAppointment} without a recorded appointment.`
  return report(
    `There ${result.approved.count === 1 ? 'is' : 'are'} ${result.approved.count} approved booking${result.approved.count === 1 ? '' : 's'} awaiting SPA, with ${formatRm(result.approved.valueRm)} in booked value. ${detail} Loan approval does not verify legal readiness or an LO signature`,
    result.approved.rows.map((row) => row.bookingId)
  )
}

function waitingAnswer(context: AskContext): AskReply {
  const result = insightsFor(context)
  const groups = result.waiting.groups.map((group) => {
    const holder = group.holder[0]!.toUpperCase() + group.holder.slice(1)
    const oldest =
      group.oldestDays === null ? 'no recorded progress date' : `longest time in stage ${group.oldestDays} days`
    return `${holder}: ${group.count} booking${group.count === 1 ? '' : 's'}, ${formatRm(group.valueRm)}, ${oldest}`
  })
  const groupSummary = groups.length > 0 ? ` Waiting groups: ${groups.join('; ')}.` : ' No open bookings are waiting.'
  return report(
    `The unsigned queue has ${result.open.count} unsigned booking${result.open.count === 1 ? '' : 's'} worth ${formatRm(result.open.valueRm)}, including ${result.open.olderCount} older than the 30-day estimate window.${groupSummary}`,
    result.waiting.rows.map((row) => row.bookingId)
  )
}

function conversionAnswer(context: AskContext): AskReply {
  const result = insightsFor(context)
  const stageNames = { booked: 'Booked', loan_applied: 'With Bank', lo_issued: 'Loan Approved' }
  const rates = result.forecast.stageRates
    .filter((row): row is typeof row & { stage: keyof typeof stageNames } => row.stage in stageNames)
    .map(
      (row) =>
        `${stageNames[row.stage]} ${row.signed}/${row.resolved} known outcomes, ${
          row.resolved === 0
            ? 'rate —, range —'
            : `rate ${Math.round(row.rate * 100)}%, range ${Math.round(row.low * 100)}–${Math.round(row.high * 100)}%`
        }`
    )
  const rateScope = result.history.scope === 'project' ? 'project-history' : 'accessible-history'
  const stageSummary =
    rates.length > 0
      ? `Pre-signing stage outcomes: ${rates.join('; ')}. Among bookings that reached each stage and have a known 30-day outcome, the rate shows how many signed by day 30. It is not the chance of reaching the next stage.`
      : 'No pre-signing stage outcome rates are available.'
  const bookingMedian = result.turnaround.bookingToSigning.medianDays
  const approvalMedian = result.turnaround.approvalToSigning.medianDays
  const timing =
    `Median booking-to-SPA time: ${bookingMedian === null ? '—' : `${bookingMedian} days`} from ${result.turnaround.bookingToSigning.sample} signed booking${result.turnaround.bookingToSigning.sample === 1 ? '' : 's'}. ` +
    `Median approval-to-SPA time: ${approvalMedian === null ? '—' : `${approvalMedian} days`} from approval across ${result.turnaround.approvalToSigning.sample} signed booking${result.turnaround.approvalToSigning.sample === 1 ? '' : 's'}.`
  return report(
    `Historical stage rates use ${result.history.resolved} resolved ${rateScope} bookings as of ${formatDay(result.history.asOf)}. ${stageSummary} ${timing} Completed timings use accessible confirmed completed cases only; they do not describe the open queue ages.`,
    result.turnaround.rows.map((row) => row.bookingId)
  )
}

function lostAnswer(context: AskContext): AskReply {
  const result = insightsFor(context)
  const retrySummary =
    result.secondBank.resolvedCount > 0
      ? `${result.secondBank.signedCount} of ${result.secondBank.resolvedCount} completed booking${result.secondBank.resolvedCount === 1 ? '' : 's'} that went to another bank after a rejection signed. The observed sample may be small and does not guarantee another booking will sign.`
      : 'No completed bookings that went to another bank after a rejection are recorded.'
  const reviewText =
    result.secondBank.followUp.length === 0
      ? 'No open rejected bookings are waiting for a financing review.'
      : `${result.secondBank.followUp.length} open rejected booking${result.secondBank.followUp.length === 1 ? ' needs' : 's need'} a financing review.`
  return report(
    `Recorded exits: ${result.exits.cancelledCount} cancellation${result.exits.cancelledCount === 1 ? '' : 's'} and ${result.exits.lapsedCount} lapse${result.exits.lapsedCount === 1 ? '' : 's'}, ${result.exits.count} exited bookings with ${formatRm(result.exits.valueRm)} in booked value. This is not recognized revenue lost or permanent stock loss. Second-bank outcomes: ${result.secondBank.attemptedCount} bookings that went to another bank after a rejection, ${result.secondBank.resolvedCount} completed booking${result.secondBank.resolvedCount === 1 ? '' : 's'}, ${result.secondBank.signedCount} signed, and ${result.secondBank.pendingCount} still open. ${retrySummary} ${reviewText} No recoverable money or units are forecast, and the observed outcomes do not guarantee future results`,
    [
      ...result.secondBank.followUp.map((row) => row.bookingId),
      ...result.exits.rows.map((row) => row.bookingId),
      ...result.secondBank.rows.map((row) => row.bookingId)
    ]
  )
}

export const FORECAST_ASK_QUESTIONS: AskQuestion[] = [
  {
    id: 'FORECAST-OUTLOOK',
    question: FORECAST_DOCUMENT_QUESTIONS.outlook,
    tags: ['SPA signing outlook', 'day-thirty deadline', 'stage chance horizon'],
    desk: 'all',
    predicate: null,
    answer: outlookAnswer
  },
  {
    id: 'FORECAST-APPROVED',
    question: FORECAST_DOCUMENT_QUESTIONS.approved,
    tags: ['approved awaiting spa', 'approved loan not signed', 'approved queue'],
    desk: 'all',
    predicate: null,
    answer: approvedAnswer
  },
  {
    id: 'FORECAST-WAITING',
    question: FORECAST_DOCUMENT_QUESTIONS.waiting,
    tags: ['where is the unsigned pipeline', 'aged queue by holder', 'who holds the next move'],
    desk: 'all',
    predicate: null,
    answer: waitingAnswer
  },
  {
    id: 'FORECAST-CONVERSION',
    question: FORECAST_DOCUMENT_QUESTIONS.conversion,
    tags: ['recorded conversion rates', 'completed signing times', 'booking to spa time'],
    desk: 'all',
    predicate: null,
    answer: conversionAnswer
  },
  {
    id: 'FORECAST-LOST',
    question: FORECAST_DOCUMENT_QUESTIONS.lost,
    tags: ['recorded cancellations and lapses', 'second-bank outcomes', 'financing review after rejection'],
    desk: 'all',
    predicate: null,
    answer: lostAnswer
  }
]
