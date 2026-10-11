import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { REFERENCE_DATE, STORIES, summarizeCases, type CaseEvent } from '@mortar/core'
import { bookingJourney } from '@/components/bookings/bookingJourney'
import { BookingJourney } from '@/components/bookings/BookingJourney'

const story = STORIES.find((s) => s.booking.id === 'BK-9002')!

function modelFor(events: CaseEvent[] = story.events) {
  const summary = summarizeCases(
    {
      bookings: [story.booking],
      applications: story.applications,
      events,
      tasks: []
    },
    REFERENCE_DATE
  )[0]!
  return bookingJourney({
    booking: story.booking,
    summary,
    events,
    applications: story.applications,
    referenceDate: REFERENCE_DATE
  })
}

/** Pretend the viewport is a phone. */
function asPhone() {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('max-width: 719px'),
    addEventListener: () => {},
    removeEventListener: () => {}
  }))
}
afterEach(() => vi.unstubAllGlobals())

const STOP_NAMES = /^(Booked|Documents|Loan Submitted|Loan Approved|SPA Signed)\./
const station = (name: RegExp) => screen.getByRole('button', { name })

describe('BookingJourney', () => {
  it('lists the five milestones and marks only the awaited one', () => {
    render(<BookingJourney model={modelFor()} onShowHistory={() => {}} />)
    const list = screen.getByRole('list', { name: /Booking journey/ })
    expect(within(list).getAllByRole('listitem')).toHaveLength(5)
    expect(screen.getByText('17 Days Since Booking')).toBeTruthy()
    const current = list.querySelectorAll('[aria-current="step"]')
    expect(current).toHaveLength(1)
    expect(current[0]!.getAttribute('aria-label')).toMatch(
      /^Loan Approved\. Current milestone, Awaiting Decision, stalled/
    )
    expect(screen.getByText('You Are Here')).toBeTruthy()
    expect(station(/^Documents\. Receipt Not Recorded/)).toBeTruthy()
    expect(list.querySelectorAll('[data-checked="true"]')).toHaveLength(2)
  })

  it('shows a station’s facts on focus and hides them on Escape', async () => {
    render(<BookingJourney model={modelFor()} onShowHistory={() => {}} />)
    fireEvent.focus(station(/^Loan Approved/))
    const tip = await screen.findByRole('tooltip')
    expect(tip.textContent).toContain('Loan Approved · Awaiting Decision')
    expect(tip.textContent).toContain('Approval Date: —')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('pins a station’s facts on click until clicked again', async () => {
    render(<BookingJourney model={modelFor()} onShowHistory={() => {}} />)
    const booked = station(/^Booked/)
    fireEvent.pointerDown(booked)
    fireEvent.click(booked)
    expect((await screen.findByRole('tooltip')).textContent).toContain('Booked · Done')
    fireEvent.blur(booked)
    expect(screen.getByRole('tooltip')).toBeTruthy()
    fireEvent.pointerDown(booked)
    fireEvent.click(booked)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('opens loan history from the detour without opening the Documents details', () => {
    const onShowHistory = vi.fn()
    render(<BookingJourney model={modelFor()} onShowHistory={onShowHistory} />)
    const flag = screen.getByRole('button', {
      name: /Malayan Trust, Rejected 8 Sep\. View loan history/
    })
    fireEvent.pointerMove(flag)
    fireEvent.click(flag)
    expect(onShowHistory).toHaveBeenCalledWith('loan')
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('caps a closed case and drops You Are Here', () => {
    const cancelled = [
      ...story.events,
      {
        ...story.events[0]!,
        id: 'EV-9002-X',
        kind: 'cancelled',
        occurredAt: '2026-09-15T10:00:00+08:00',
        recordedAt: '2026-09-15T10:05:00+08:00',
        note: 'Buyer cancelled'
      } satisfies CaseEvent
    ]
    const { container } = render(<BookingJourney model={modelFor(cancelled)} onShowHistory={() => {}} />)
    expect(screen.queryByText('You Are Here')).toBeNull()
    expect(container.querySelector('.journey-road-cap')).not.toBeNull()
    expect(station(/^SPA Signed\. Not Reached/)).toBeTruthy()
  })

  it('opens one stop’s facts inline on a phone', () => {
    asPhone()
    render(<BookingJourney model={modelFor()} onShowHistory={() => {}} />)
    const approved = station(/^Loan Approved/)
    expect(approved.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(approved)
    expect(approved.getAttribute('aria-expanded')).toBe('true')
    const panel = screen.getByRole('region', { name: /^Loan Approved/ })
    expect(panel.textContent).toContain('Approval Date: —')
    expect(screen.queryByRole('tooltip')).toBeNull()
    fireEvent.click(station(/^Booked/))
    expect(approved.getAttribute('aria-expanded')).toBe('false')
    expect(screen.getAllByRole('region', { name: STOP_NAMES })).toHaveLength(1)
    fireEvent.keyDown(station(/^Booked/), { key: 'Escape' })
    expect(screen.queryByRole('region', { name: STOP_NAMES })).toBeNull()
  })
})
