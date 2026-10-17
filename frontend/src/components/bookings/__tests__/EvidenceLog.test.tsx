import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CaseEvent } from '@mortar/core'
import { EvidenceLog } from '@/components/bookings/EvidenceLog'

const event = (over: Partial<CaseEvent>): CaseEvent => ({
  id: 'EV-T000',
  bookingId: 'BK-T001',
  applicationId: null,
  track: 'loan',
  kind: 'documents_requested',
  // Two updates back-dated to one day land at the same time.
  occurredAt: '2026-09-16T12:00:00+08:00',
  recordedAt: '2026-09-18T10:00:00+08:00',
  reportedBy: 'Tan Mei Ling',
  verifiedBy: 'Tan Mei Ling',
  status: 'confirmed',
  source: 'staff',
  messageId: null,
  document: 'payslip',
  note: null,
  ...over
})

const EVENTS = [
  event({ id: 'EV-f0000000', kind: 'documents_requested', seq: 1 }),
  event({ id: 'EV-00000000', kind: 'documents_received', seq: 2 }),
  event({ id: 'EV-80000000', kind: 'buyer_contacted', occurredAt: '2026-09-15T12:00:00+08:00', seq: 3 })
]

describe('EvidenceLog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('folds the table behind a control that names how many updates it hides', () => {
    render(<EvidenceLog events={EVENTS} />)

    // The track timelines above carry the story; the full table waits.
    expect(screen.queryByRole('table')).toBeNull()
    const control = screen.getByRole('button', { name: 'Show Full History (3)' })
    expect(control.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(control)
    expect(screen.getByRole('table')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Hide Full History' }).getAttribute('aria-expanded')).toBe('true')
  })

  it('offers nothing to unfold when the case has no updates yet', () => {
    render(<EvidenceLog events={[]} />)

    expect(screen.getByText('No Updates Yet.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Show Full History/ })).toBeNull()
  })

  it('lists updates at the same time newest entry first, whatever their ids', () => {
    const { container } = render(<EvidenceLog events={EVENTS} />)
    fireEvent.click(screen.getByRole('button', { name: 'Show Full History (3)' }))

    const rows = [...container.querySelectorAll('tbody tr')].map((row) => row.children[3]?.textContent)
    expect(rows).toEqual(['Documents Received · Payslip', 'Documents Requested · Payslip', 'Buyer Contacted · Payslip'])
  })

  it('reads the demo generator and the story fixtures as Demo, and staff and Jev as they are', () => {
    const { container } = render(
      <EvidenceLog
        events={[
          event({ id: 'EV-1', source: 'generator' }),
          event({ id: 'EV-2', source: 'story' }),
          event({ id: 'EV-3', source: 'jev' })
        ]}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show Full History (3)' }))

    const sources = [...container.querySelectorAll('tbody tr')].map((row) => row.children[7]?.textContent)
    expect(sources).toEqual(['Mortar AI', 'Demo', 'Demo'])
  })

  it.each([
    ['100% Probability', 'Mortar AI Is Sure'],
    ['90% Probability', 'Mortar AI Is Sure'],
    ['84% Probability', 'Mortar AI Is Fairly Sure'],
    ['70% Probability', 'Mortar AI Is Fairly Sure'],
    ['62% Probability', 'Mortar AI Is Not Sure']
  ])('reads the stored note %s as the words a person uses for it', (note, certainty) => {
    // DESIGN.md Plain Language bans a probability on screen; the same words the
    // messages panel uses carry it instead.
    const { container } = render(<EvidenceLog events={[event({ id: 'EV-1', note })]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Show Full History (1)' }))

    expect(container.querySelector('tbody tr')!.children[4]?.textContent).toBe(certainty)
    expect(container.textContent).not.toContain('Probability')
  })

  it('leaves a note that is a sentence alone, however it reads', () => {
    const { container } = render(
      <EvidenceLog events={[event({ id: 'EV-1', note: 'Firm Confirmed 29 Jul, Awaiting Signature' })]} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show Full History (1)' }))

    expect(container.querySelector('tbody tr')!.children[4]?.textContent).toBe(
      'Firm Confirmed 29 Jul, Awaiting Signature'
    )
  })
  // Issue #75: a month-end cut-off needs when it happened and when it was recorded.
  it('shows when each update occurred and when it was recorded, with who reported and confirmed it', () => {
    const { container } = render(
      <EvidenceLog
        events={[
          event({
            id: 'EV-SPA',
            kind: 'spa_signed',
            track: 'legal',
            document: null,
            occurredAt: '2026-09-30T12:00:00+08:00',
            recordedAt: '2026-10-03T09:15:00+08:00',
            reportedBy: 'Arvind Raj',
            verifiedBy: 'Arvind Raj'
          })
        ]}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Show Full History (1)' }))

    const headers = screen.getAllByRole('columnheader').map((h) => h.textContent)
    expect(headers.slice(0, 2)).toEqual(['Occurred On', 'Recorded On'])
    expect(headers).toEqual(expect.arrayContaining(['Reported By', 'Verified By']))
    expect(headers).not.toContain('When')
    const cells = [...container.querySelector('tbody tr')!.children].map((cell) => cell.textContent)
    expect(cells[0]).toBe('30 Sep 2026 · 12:00')
    expect(cells[1]).toBe('3 Oct 2026 · 09:15')
  })

  it('names Mortar AI as the reporter of an event the AI proposed, whatever name is stored', () => {
    render(<EvidenceLog events={[event({ id: 'EV-AI', reportedBy: 'Jev', source: 'jev' })]} />)
    fireEvent.click(screen.getByRole('button', { name: /Show Full History/ }))
    expect(screen.getAllByText('Mortar AI').length).toBeGreaterThan(0)
    expect(screen.queryByText('Jev')).toBeNull()
  })
})
