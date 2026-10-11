import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { REFERENCE_DATE, STORIES, summarizeCases } from '@mortar/core'
import { bookingJourney } from '@/components/bookings/bookingJourney'
import { journeyDetails, stopStatus } from '@/components/bookings/journey/details'
import { MilestoneIllustration } from '@/components/bookings/journey/MilestoneIllustrations'

const story = STORIES.find((s) => s.booking.id === 'BK-9002')!
const summary = summarizeCases(
  {
    bookings: [story.booking],
    applications: story.applications,
    events: story.events,
    tasks: []
  },
  REFERENCE_DATE
)[0]!
const model = bookingJourney({
  booking: story.booking,
  summary,
  events: story.events,
  applications: story.applications,
  referenceDate: REFERENCE_DATE
})
const stop = (id: string) => model.stops.find((s) => s.id === id)!

describe('journeyDetails', () => {
  it('words the awaited approval without claiming it happened', () => {
    const copy = journeyDetails(stop('loan_approved'), model)
    expect(copy.title).toBe('Loan Approved · Awaiting Decision')
    expect(copy.lines).toContain('Approval Date: —')
    expect(copy.lines.some((l) => l.startsWith('Banker: ') && l.includes('Crestline Bank'))).toBe(true)
    expect(copy.lines.some((l) => l.startsWith('Desk: '))).toBe(false)
    expect(copy.lines).toContain(`Follow-Up: ${story.booking.loanOwner}`)
    expect(copy.rule).toBe(
      'No update has been recorded in the 8 calendar days since submission. Approval has not been confirmed.'
    )
  })

  it('lists the rejected first bank under the resubmission', () => {
    const copy = journeyDetails(stop('loan_submitted'), model)
    expect(copy.title).toBe('Loan Submitted · Done')
    expect(copy.lines).toContain('Malayan Trust Bank: 3 Sep → rejected 8 Sep (5 calendar days).')
  })

  it('says how long a settled stop took and quotes its update', () => {
    const copy = journeyDetails(stop('booked'), model)
    expect(copy.lines).toContain('Update: Booking confirmed')
    expect(copy.rule).toBe('2 calendar days to the first bank submission.')
  })

  it('names the desk and the missing receipt for an unproven stop', () => {
    const docs = stop('documents')
    expect(stopStatus(docs)).toBe('Receipt Not Recorded')
    const copy = journeyDetails(docs, model)
    expect(copy.lines).toContain(`Desk: ${story.booking.loanOwner}`)
    expect(copy.rule).toBe('Later work is recorded, but no document receipt is on the log.')
  })
})

describe('MilestoneIllustration', () => {
  it.each(['booked', 'documents', 'loan_submitted', 'loan_approved', 'spa_signed'] as const)(
    'draws %s as a decorative, namespaced SVG',
    (id) => {
      const { container } = render(<MilestoneIllustration id={id} />)
      const svg = container.querySelector('svg')!
      expect(svg.getAttribute('aria-hidden')).toBe('true')
      expect(svg.getAttribute('viewBox')).toBe('0 0 96 96')
      expect(container.querySelectorAll('.journey-art-ground')).toHaveLength(1)
      expect(container.querySelector('.outline')).toBeNull()
    }
  )
})
