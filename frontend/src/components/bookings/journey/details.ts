/**
 * The words in one station's details: a title, factual lines and one closing
 * sentence, composed from the journey model. Copy only: the model owns which
 * facts exist, so a missing fact reads "—" and nothing is inferred here.
 */
import type { BookingJourneyModel, JourneyDuration, JourneyStop, JourneyStopId } from '../bookingJourney'
import { DOCUMENT_LABELS } from '../labels'

export interface JourneyDetailCopy {
  title: string
  lines: string[]
  rule: string | null
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const shortDate = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`
export const calendarDays = (n: number) => `${n} calendar day${n === 1 ? '' : 's'}`

const SPANS: Partial<Record<JourneyStopId, (d: JourneyDuration) => string>> = {
  booked: (d) => `${calendarDays(d.calendarDays)} to the first bank submission.`,
  documents: (d) => `${calendarDays(d.calendarDays)} from request to receipt.`,
  loan_approved: (d) => `Approved ${calendarDays(d.calendarDays)} after submission.`,
  spa_signed: (d) => `Signed ${calendarDays(d.calendarDays)} after loan approval.`
}

/** The word after a station's name: its wait when current, otherwise its state. */
export function stopStatus(stop: JourneyStop): string {
  if (stop.state === 'outstanding') return 'Outstanding'
  if (stop.current) return stop.caption
  return stop.state === 'done' ? 'Done' : stop.caption
}

export function journeyDetails(stop: JourneyStop, model: BookingJourneyModel): JourneyDetailCopy {
  const settled = stop.state === 'done' && !stop.current
  const lines = stop.facts.map((f) => `${f.label}: ${f.value}`)
  if (!settled && stop.facts.some((f) => f.label === 'Banker'))
    // The banker decides; the loan desk follows up, and is the last name responsible.
    lines.push(`Follow-Up: ${stop.responsible[stop.responsible.length - 1]}`)
  else if (!settled) lines.push(`${stop.id === 'spa_signed' ? 'Panel Firm' : 'Desk'}: ${stop.responsible.join(', ')}`)
  if (stop.outstandingDocuments.length > 0)
    lines.push(`Outstanding: ${stop.outstandingDocuments.map((d) => DOCUMENT_LABELS[d]).join(', ')}`)
  if (stop.id === 'loan_submitted')
    for (const a of model.applications)
      if (a.decision?.kind === 'loan_rejected' && a.submitted && a.duration)
        lines.push(
          `${a.bank}: ${shortDate(a.submitted.occurredAt)} → rejected ${shortDate(a.decision.occurredAt)} (${calendarDays(a.duration.calendarDays)}).`
        )
  if (settled && stop.note) lines.push(`Update: ${stop.note}`)
  const span = stop.duration?.kind === 'completed' ? SPANS[stop.id]?.(stop.duration) : undefined
  const rule = [span, settled ? null : stop.note].filter(Boolean).join(' ')
  return {
    title: `${stop.label} · ${stopStatus(stop)}`,
    lines,
    rule: rule || null
  }
}
