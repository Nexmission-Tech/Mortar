import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { STORIES, type CaseEvent } from '@mortar/core'
import { CaseHistory } from '@/components/bookings/CaseHistory'

const events = STORIES.find((s) => s.booking.id === 'BK-9002')!.events

describe('CaseHistory', () => {
  it('shows every entry with no extra click', () => {
    render(<CaseHistory events={events} track="all" onTrackChange={() => {}} />)
    expect(screen.queryByRole('button', { name: /Show Full History/ })).toBeNull()
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(events.length + 1)
    expect(screen.getByRole('button', { name: /^All Tracks/ }).getAttribute('aria-pressed')).toBe('true')
  })

  it('narrows to one desk’s track, and asks for a change through the filter', () => {
    const onTrackChange = vi.fn()
    const loan = events.filter((e) => e.track === 'loan')
    const { rerender } = render(<CaseHistory events={events} track="all" onTrackChange={onTrackChange} />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^Loan ${loan.length}$`) }))
    expect(onTrackChange).toHaveBeenCalledWith('loan')
    rerender(<CaseHistory events={events} track="loan" onTrackChange={onTrackChange} />)
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(loan.length + 1)
  })

  it('says so when a track has nothing yet', () => {
    render(<CaseHistory events={events.filter((e) => e.track !== 'legal')} track="legal" onTrackChange={() => {}} />)
    expect(screen.getByText('No Legal Updates Yet.')).toBeTruthy()
  })

  it('never cuts a note short', () => {
    const note = 'A long note that the history must show whole, '.repeat(6).trim()
    const long: CaseEvent = { ...events[0]!, id: 'EV-LONG', note }
    render(<CaseHistory events={[long]} track="all" onTrackChange={() => {}} />)
    const cell = screen.getByText(note)
    expect(cell.className).not.toContain('truncate')
  })
})
