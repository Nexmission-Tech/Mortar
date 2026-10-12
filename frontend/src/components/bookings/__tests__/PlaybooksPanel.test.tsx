import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PLAYBOOKS, REFERENCE_DATE, summarizeCases, type PlaybookRanking } from '@mortar/core'
import { fetchPlaybooks } from '@/lib/api'
import { PlaybooksPanel } from '@/components/bookings/PlaybooksPanel'
import { buildSnapshot } from './snapshotFixture'

vi.mock('@/lib/api', () => ({
  fetchPlaybooks: vi.fn()
}))

const SNAPSHOT = buildSnapshot()
const SUMMARY = summarizeCases(
  {
    bookings: SNAPSHOT.bookings,
    applications: SNAPSHOT.applications,
    events: SNAPSHOT.events,
    tasks: SNAPSHOT.tasks
  },
  REFERENCE_DATE
).find((c) => c.bookingId === 'BK-9001')!

/** Two fitting playbooks ahead of three Jev scored as no fit. */
const RANKING: PlaybookRanking = {
  bookingId: 'BK-9001',
  query: 'missing payslip',
  results: [
    { playbookId: 'PB-001', keywordScore: 1, fit: { score: 2, confidence: 0.9 } },
    { playbookId: 'PB-007', keywordScore: 0.8, fit: { score: 1, confidence: 0.7 } },
    { playbookId: 'PB-005', keywordScore: 0.6, fit: { score: 0, confidence: 0.9 } },
    { playbookId: 'PB-013', keywordScore: 0.5, fit: { score: 0, confidence: 0.8 } },
    { playbookId: 'PB-015', keywordScore: 0.4, fit: { score: 0, confidence: 0.8 } }
  ],
  meta: { source: 'cache', stale: false, latencyMs: null }
}

const titleOf = (id: string) => PLAYBOOKS.find((p) => p.id === id)!.title

function renderPanel() {
  return render(<PlaybooksPanel bookingId="BK-9001" summary={SUMMARY} playbooks={PLAYBOOKS} refreshKey={0} />)
}

describe('PlaybooksPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchPlaybooks).mockResolvedValue(RANKING)
  })

  it('shows the top fit only and folds the rest behind a count control', async () => {
    renderPanel()

    expect(await screen.findByText(titleOf('PB-001'))).toBeTruthy()
    expect(screen.getByText('Applies')).toBeTruthy()
    expect(screen.queryByText(titleOf('PB-007'))).toBeNull()
    expect(screen.queryByText(titleOf('PB-005'))).toBeNull()
    expect(screen.getByRole('button', { name: 'Show 4 More' })).toBeTruthy()
    // The keyword bar went with the rest of the fit scoring: a percentage
    // beside "Applies" told a reader two numbers that disagreed.
    expect(screen.queryByText('100%')).toBeNull()
  })

  it('unfolds the rest behind one click and re-folds', async () => {
    renderPanel()

    fireEvent.click(await screen.findByRole('button', { name: 'Show 4 More' }))

    expect(screen.getByText(titleOf('PB-007'))).toBeTruthy()
    expect(screen.getByText(titleOf('PB-005'))).toBeTruthy()
    expect(screen.getByText('May Apply')).toBeTruthy()
    expect(screen.getAllByText('Does Not Apply').length).toBe(3)
    expect(screen.getByRole('button', { name: 'Show Fewer' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Show Fewer' }))
    expect(screen.queryByText(titleOf('PB-005'))).toBeNull()
  })

  it('keeps the search box and the ranking caption', async () => {
    renderPanel()

    expect(await screen.findByText('Ranked For “missing payslip”')).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'Search guidance' })).toBeTruthy()
  })

  // Issue #75: every playbook shown names its reviewer or carries the Illustrative label.
  it('labels an unreviewed playbook illustrative and keeps its action and limits back', async () => {
    renderPanel()
    fireEvent.click(await screen.findByRole('button', { name: 'Show 4 More' }))
    expect(screen.getAllByText('Illustrative, Not Yet Reviewed')).toHaveLength(5)

    const pb001 = PLAYBOOKS.find((p) => p.id === 'PB-001')!
    fireEvent.click(screen.getByRole('button', { name: titleOf('PB-001') }))
    expect(screen.getByText(pb001.situation)).toBeTruthy()
    expect(screen.queryByText(pb001.action)).toBeNull()
    expect(screen.queryByText(pb001.limits)).toBeNull()
    expect(screen.getByText('Its Action And Limits Show Once A Loan Or Legal Reviewer Validates It.')).toBeTruthy()
  })

  it('names the reviewer of a validated playbook and shows its action and limits', async () => {
    const reviewed = PLAYBOOKS.map((p) =>
      p.id === 'PB-001' ? { ...p, status: 'approved' as const, reviewer: 'Arvind Raj', reviewedOn: '2026-10-01' } : p
    )
    render(<PlaybooksPanel bookingId="BK-9001" summary={SUMMARY} playbooks={reviewed} refreshKey={0} />)
    fireEvent.click(await screen.findByRole('button', { name: titleOf('PB-001') }))

    expect(screen.getByText('Reviewed By Arvind Raj · 1 Oct 2026')).toBeTruthy()
    expect(screen.queryByText('Illustrative, Not Yet Reviewed')).toBeNull()
    expect(screen.getByText(reviewed[0]!.action)).toBeTruthy()
    expect(screen.getByText(reviewed[0]!.limits)).toBeTruthy()
  })
})
