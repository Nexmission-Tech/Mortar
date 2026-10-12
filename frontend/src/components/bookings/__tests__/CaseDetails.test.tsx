import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { STORIES, type Booking, type CaseSummary, type RiskLevel } from '@mortar/core'
import { CaseDetails } from '@/components/bookings/CaseDetails'
import { LatestMessage } from '@/components/bookings/LatestMessage'

// Radix tooltips position with floating-ui, which needs observers jsdom lacks.
for (const observer of ['ResizeObserver', 'IntersectionObserver'] as const) {
  vi.stubGlobal(
    observer,
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  )
}

const booking: Booking = {
  id: 'BK-9001',
  project: 'Residensi Ujian',
  unit: 'A-12-03',
  priceRm: 550000,
  bookingDate: '2026-09-02',
  buyer: {
    name: 'Raymond Tan Wei Hong',
    ic: '000000-00-0001',
    phone: '+60 00-000 0001',
    age: 34,
    grossMonthlyIncomeRm: 8500,
    monthlyCommitmentsRm: 1200,
    propertiesOwned: 0
  },
  salesOwner: 'Nurul Aina',
  loanOwner: 'Tan Mei Ling',
  legalFirm: 'Wong Rahman Chambers'
}

function summary(risk: RiskLevel): CaseSummary {
  return {
    bookingId: 'BK-9001',
    stage: 'loan_applied',
    spaSigned: false,
    unknown: false,
    bookingAgeDays: 16,
    daysSinceEvidence: 6,
    daysSinceLoIssued: null,
    daysSinceSpaSet: null,
    applications: [{ id: 'APP-1', bank: 'Crestline Bank', status: 'submitted' }],
    outstandingDocuments: [],
    buyerWithdrew: false,
    buyerConcern: false,
    valuationShortfall: false,
    risk: {
      level: risk,
      loanRm: 495000,
      instalmentRm: 2100,
      debtServiceRatio: 0.39,
      marginOfFinancing: 0.9,
      reasons: []
    },
    stallReasons: ['Application Undecided For 10 Working Days'],
    openTasks: 0
  }
}

const riskLabel = (level: RiskLevel) => `${level[0]!.toUpperCase()}${level.slice(1)} Risk`
const details = (level: RiskLevel) => (
  <CaseDetails booking={booking} summary={summary(level)} signals={null} hasBuyerMessages={false} />
)

describe('CaseDetails', () => {
  it('lists the assigned team by desk', () => {
    render(details('low'))
    for (const name of ['Nurul Aina', 'Tan Mei Ling', 'Wong Rahman Chambers'])
      expect(screen.getByText(name)).toBeTruthy()
  })

  it.each(['low', 'medium', 'high'] as const)('states the financing risk at %s, never nothing at all', (level) => {
    render(details(level))
    expect(screen.getByText(riskLabel(level))).toBeTruthy()
  })

  it('carries the explanation on a risk that is not Low, and none on Low', () => {
    const { unmount } = render(details('high'))
    expect(screen.getByText('High Risk').closest('button')).toBeTruthy()
    unmount()
    render(details('low'))
    expect(screen.getByText('Low Risk').closest('button')).toBeNull()
  })

  it('says when the buyer has never messaged, inside the same card', () => {
    render(details('low'))
    expect(screen.getByText('No Buyer Messages Have Arrived Yet.')).toBeTruthy()
    expect(document.querySelectorAll('.shadow-card').length).toBe(1)
  })
})

describe('LatestMessage', () => {
  const messages = STORIES.find((s) => s.booking.id === 'BK-9002')!.messages
  const newest = [...messages].sort((a, b) => b.sentAt.localeCompare(a.sentAt))[0]!

  it('shows the newest message in full, with who sent it', () => {
    render(<LatestMessage messages={messages} onViewAll={() => {}} />)
    expect(screen.getByText(newest.body)).toBeTruthy()
    expect(screen.getByText(newest.senderName)).toBeTruthy()
  })

  it('opens every message from View All', () => {
    const onViewAll = vi.fn()
    render(<LatestMessage messages={messages} onViewAll={onViewAll} />)
    fireEvent.click(screen.getByRole('button', { name: `View All ${messages.length}` }))
    expect(onViewAll).toHaveBeenCalledOnce()
  })

  it('says when there are none', () => {
    render(<LatestMessage messages={[]} onViewAll={() => {}} />)
    expect(screen.getByText('No Messages Yet.')).toBeTruthy()
  })
})
