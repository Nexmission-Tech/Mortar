import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Booking, CaseSummary, RiskLevel } from '@mortar/core'
import { CaseHeader } from '@/components/bookings/CaseHeader'

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

describe('CaseHeader', () => {
  it('names the unit, project, stage, buyer, price and booking date', () => {
    render(<CaseHeader booking={booking} summary={summary('low')} />)
    expect(screen.getByText('A-12-03')).toBeTruthy()
    expect(screen.getByText('Residensi Ujian')).toBeTruthy()
    expect(screen.getByText('With Bank')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Raymond Tan Wei Hong')
    expect(screen.getByText('RM 550,000 · Booked 2 Sep 2026')).toBeTruthy()
  })

  it('offers both ways to add to the case', () => {
    const onRecordUpdate = vi.fn()
    const onPasteMessage = vi.fn()
    render(
      <CaseHeader
        booking={booking}
        summary={summary('low')}
        onRecordUpdate={onRecordUpdate}
        onPasteMessage={onPasteMessage}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Record An Update' }))
    fireEvent.click(screen.getByRole('button', { name: 'Paste A Message' }))
    expect(onRecordUpdate).toHaveBeenCalledOnce()
    expect(onPasteMessage).toHaveBeenCalledOnce()
  })

  it('takes no more updates once the case is closed', () => {
    render(
      <CaseHeader
        booking={booking}
        summary={{ ...summary('low'), stage: 'cancelled' }}
        onRecordUpdate={() => {}}
        onPasteMessage={() => {}}
      />
    )
    expect(screen.queryByRole('button', { name: 'Record An Update' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Paste A Message' })).toBeTruthy()
  })

  it('leaves the wait, owners and risk to the summary below', () => {
    render(<CaseHeader booking={booking} summary={summary('high')} />)
    expect(screen.queryByText(/Stalled/)).toBeNull()
    expect(screen.queryByText(/Nurul Aina/)).toBeNull()
    expect(screen.queryByText('High Risk')).toBeNull()
  })
})
