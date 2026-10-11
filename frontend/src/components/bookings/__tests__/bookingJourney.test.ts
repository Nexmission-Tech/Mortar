import { describe, expect, it } from 'vitest'
import {
  REFERENCE_DATE,
  STORIES,
  summarizeCases,
  type Booking,
  type CaseEvent,
  type LoanApplication
} from '@mortar/core'
import { bookingJourney, type BookingJourneyModel } from '@/components/bookings/bookingJourney'

const story = STORIES.find((s) => s.booking.id === 'BK-9002')!

/** A journey for a booking, its applications and events, summarised by core as of the reference date. */
function journeyOf(booking: Booking, applications: LoanApplication[], events: CaseEvent[], ref = REFERENCE_DATE) {
  const summary = summarizeCases({ bookings: [booking], applications, events, tasks: [] }, ref)[0]!
  return bookingJourney({ booking, summary, events, applications, referenceDate: ref })
}

const stop = (model: BookingJourneyModel, id: string) => model.stops.find((s) => s.id === id)!

let seq = 0
/** A confirmed event on the story's booking, recorded five minutes after it occurred. */
function ev(kind: CaseEvent['kind'], day: string, patch: Partial<CaseEvent> = {}): CaseEvent {
  seq++
  return {
    id: `EV-T-${String(seq).padStart(3, '0')}`,
    bookingId: story.booking.id,
    applicationId: null,
    track: kind.startsWith('spa') ? 'legal' : kind === 'booked' ? 'sales' : 'loan',
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
const app = (id: string, bank: string, banker = 'A Banker'): LoanApplication => ({
  id,
  bookingId: story.booking.id,
  bank,
  banker
})

describe('bookingJourney', () => {
  it('reads BK-9002 as the design describes it', () => {
    const model = journeyOf(story.booking, story.applications, story.events)
    expect(model.resolution).toBe('open')
    expect(model.ageDays).toBe(17)
    expect(stop(model, 'booked')).toMatchObject({ state: 'done', caption: '1 Sep 2026', current: false })
    expect(stop(model, 'documents')).toMatchObject({
      state: 'record_missing',
      caption: 'Receipt Not Recorded',
      confirmedAt: null
    })
    expect(stop(model, 'loan_submitted')).toMatchObject({ state: 'done', caption: '10 Sep 2026 · Resubmitted' })
    const approved = stop(model, 'loan_approved')
    expect(approved).toMatchObject({
      state: 'upcoming',
      current: true,
      stalled: true,
      caption: 'Awaiting Decision',
      confirmedAt: null
    })
    expect(approved.duration).toEqual({ kind: 'elapsed', from: '2026-09-10', through: '2026-09-18', calendarDays: 8 })
    expect(stop(model, 'spa_signed')).toMatchObject({ state: 'upcoming', current: false, caption: 'Upcoming' })
    expect(model.stops.filter((s) => s.current)).toHaveLength(1)
    expect(stop(model, 'booked').duration?.calendarDays).toBe(2)
    expect(model.detour?.flag).toBe('Malayan Trust · Rejected 8 Sep')
    expect(model.detour?.rejections).toHaveLength(1)
    expect(model.detour?.rejections[0]?.rejection.id).toBe('EV-9002-3')
    expect(model.detour?.rejections[0]?.nextSubmission?.evidence.id).toBe('EV-9002-4')
    expect(model.applications.map((a) => [a.bank, a.status, a.duration?.calendarDays])).toEqual([
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
    expect(model.stops.map((s) => s.state)).toEqual(['done', 'done', 'done', 'done', 'done'])
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
      ev('cancelled', '2026-08-10', { track: 'sales', note: 'Buyer cancelled' }),
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
    expect(stop(model, 'loan_approved')).toMatchObject({ current: true, caption: '2 Banks Reviewing' })
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
    expect(model.detour?.rejections.map((r) => [r.applicationId, r.nextSubmission?.applicationId])).toEqual([
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
      ev('documents_requested', '2026-09-12', { applicationId: a.id, document: 'payslip' })
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
    expect(docs.evidence.map((e) => e.kind)).toEqual(['documents_received', 'documents_requested'])
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
      ev('loan_approved', '2026-09-08', { applicationId: a.id, status: 'provisional' }),
      ev('loan_approved', '2026-09-09', { applicationId: a.id, status: 'disputed' }),
      // Happened before the reference date, but Mortar only learned of it after.
      ev('loan_approved', '2026-09-17', { applicationId: a.id, recordedAt: '2026-09-19T09:00:00+08:00' }),
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
