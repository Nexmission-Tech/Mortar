import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { summarizeCases, type Snapshot, type Task } from '@mortar/core'
import { PersonaProvider } from '@/lib/persona'
import { ChasePage } from '../ChasePage'
import { booking, nextAction, snapshot } from './mockSnapshot'

// Radix Select scrolls the highlighted item into view on open; jsdom has no layout engine.
Element.prototype.scrollIntoView = vi.fn()

let data: Snapshot

vi.mock('@/lib/data', () => ({
  useSnapshot: () => ({ snapshot: data, loading: false, error: null, refresh: vi.fn() }),
  useCases: () => summarizeCases(data, data.meta.referenceDate)
}))
vi.mock('@/lib/api', () => ({ postTask: vi.fn().mockResolvedValue({}), fetchNextAction: vi.fn() }))

import { postTask } from '@/lib/api'

function show() {
  return render(
    <MemoryRouter initialEntries={['/chase']}>
      <PersonaProvider>
        <ChasePage />
      </PersonaProvider>
    </MemoryRouter>
  )
}

function followUp(overrides: Partial<Task> = {}): Task {
  return {
    id: 'TASK-1',
    bookingId: 'BK-9001',
    action: 'request_document',
    title: 'Collect Documents',
    ownerRole: 'sales_admin',
    ownerName: 'Nurul Aina',
    dueOn: '2026-09-18',
    status: 'open',
    origin: 'staff',
    createdAt: '2026-09-18T09:00:00+08:00',
    completedAt: null,
    managerFlaggedBy: 'Robert Khoo',
    ...overrides
  }
}

describe("The Manager's Today", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('mortar.profile', 'manager')
    // Booked on 3 Sep and nothing confirmed since: 15 days against an expected 7.
    const row = booking('BK-9001', { bookingDate: '2026-09-03' })
    data = snapshot({
      bookings: [row],
      events: [
        {
          id: 'EV-1',
          bookingId: row.id,
          applicationId: null,
          track: 'sales',
          kind: 'booked',
          occurredAt: '2026-09-03T09:00:00+08:00',
          recordedAt: '2026-09-03T09:00:00+08:00',
          reportedBy: 'Test',
          verifiedBy: 'Test',
          status: 'confirmed',
          source: 'staff',
          messageId: null,
          document: null,
          note: null
        }
      ],
      nextActions: [nextAction(row.id, 'request_document', 'sales_admin')]
    })
  })

  it('draws an overdue case as a worklist row, with no percentage or AI score, and routes the follow-up', async () => {
    show()
    expect(screen.getByText('Unblock The Cases Waiting On Your Team')).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Follow-Ups 0 Awaiting Reply' })).toBeTruthy()

    const card = screen.getByTestId('manager-card-BK-9001')
    expect(within(card).getByText('Overdue 8 Days')).toBeTruthy()
    expect(within(card).getByText('Nurul Aina')).toBeTruthy()
    // The unit opens the case panel; the full case is one more click from there.
    expect(within(card).getByRole('button', { name: /^Quick View BK-9001|^Quick View .*BK-9001/ })).toBeTruthy()
    expect(document.body.textContent).not.toMatch(/%/)
    expect(document.body.textContent).not.toMatch(/Mortar AI:/)

    fireEvent.click(within(card).getByRole('button', { name: 'Request Follow-Up' }))
    await waitFor(() =>
      expect(postTask).toHaveBeenCalledWith(
        expect.objectContaining({ ownerRole: 'sales_admin', ownerName: 'Nurul Aina', managerFlaggedBy: 'Robert Khoo' })
      )
    )
  })

  it('moves a case with an open follow-up into Follow-Ups You Sent, awaiting a reply', () => {
    data.tasks = [followUp()]
    show()

    expect(screen.queryByTestId('manager-card-BK-9001')).toBeNull()
    expect(screen.getByText('Every Overdue Case Already Has A Follow-Up.')).toBeTruthy()
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Follow-Ups 1 Awaiting Reply' }))
    const sent = screen.getByRole('region', { name: 'Follow-ups you sent' })
    expect(within(sent).getByText('Awaiting Reply')).toBeTruthy()
  })

  it('keeps a completed follow-up there, answered, until new evidence arrives', () => {
    data.tasks = [followUp({ status: 'done', completedAt: '2026-09-18T10:00:00+08:00' })]
    show()

    const sent = screen.getByRole('region', { name: 'Follow-ups you sent' })
    expect(within(sent).getByText('Answered')).toBeTruthy()
    expect(screen.queryByTestId('manager-card-BK-9001')).toBeNull()
  })

  it('points to the busiest desk on Team', () => {
    show()
    const figures = screen.getByRole('region', { name: "Today's figures" })
    expect(within(figures).getByText('Busiest Desk')).toBeTruthy()
    expect(within(figures).getByText('Nurul Aina')).toBeTruthy()
    expect(within(figures).getByRole('link', { name: 'Open Team' }).getAttribute('href')).toBe('/team')
  })
})
