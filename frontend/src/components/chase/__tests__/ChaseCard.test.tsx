import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { Booking, CaseSummary, NextAction, Task } from '@mortar/core'
import { ChaseCard } from '@/components/chase/ChaseCard'
import { NEXT_ACTION_LABELS } from '@/components/chase/chase'
import { nextStepFor, type NextStep } from '@/components/case/nextStep'
import { PersonaProvider, type Persona } from '@/lib/persona'

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

function booking(overrides: Partial<Booking> = {}): Booking {
  return {
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
    legalFirm: 'Wong & Partners',
    ...overrides
  }
}

function summary(overrides: Partial<CaseSummary> = {}): CaseSummary {
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
      level: 'low',
      loanRm: 495000,
      instalmentRm: 2100,
      debtServiceRatio: 0.39,
      marginOfFinancing: 0.9,
      reasons: []
    },
    stallReasons: ['Application Undecided For 10 Working Days'],
    openTasks: 0,
    ...overrides
  }
}

function openTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'TASK-1',
    bookingId: 'BK-9001',
    action: 'chase_banker',
    title: 'Call The Banker About A-12-03',
    ownerRole: 'loan_admin',
    ownerName: 'Tan Mei Ling',
    dueOn: '2026-09-20',
    status: 'open',
    origin: 'staff',
    createdAt: '2026-09-16T00:00:00+08:00',
    completedAt: null,
    ...overrides
  }
}

/** The rule says call the banker; the optional alternative is Jev's differing move. */
function jevMove(action: NextAction) {
  return {
    bookingId: 'BK-9001',
    action: { value: action, probabilities: {}, confidence: 0.8 },
    owner: { value: 'sales' as const, probabilities: {}, confidence: 0.8 },
    urgency: { score: 2, confidence: 0.8 },
    meta: { source: 'cache' as const, stale: false, latencyMs: null }
  }
}

function renderCard(task: Task | null, alternative?: NextStep, caseSummary = summary(), persona?: Persona) {
  const next = nextStepFor(booking(), caseSummary, NEXT_ACTION_LABELS, jevMove('call_buyer'))
  const onCreateTask = vi.fn()
  render(
    <MemoryRouter>
      <PersonaProvider initialPersona={persona}>
        <ChaseCard
          booking={booking()}
          summary={caseSummary}
          step={next.defaultStep}
          alternativeStep={alternative ?? next.alternativeStep}
          openTask={task}
          onInspect={vi.fn()}
          onSuggest={vi.fn()}
          onCreateTask={onCreateTask}
        />
      </PersonaProvider>
    </MemoryRouter>
  )
  return onCreateTask
}

describe('ChaseCard', () => {
  it('shows Task Open with its due date and owner, and no Create Task button, when the booking has an open task', () => {
    renderCard(openTask())

    expect(screen.getByText('Task Open')).toBeTruthy()
    expect(screen.getByText('Due 20 Sep 2026 · Tan Mei Ling')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /^Create Task/ })).toBeNull()
  })

  it('offers Create Task as an outline button, never solid ink inside the worklist', () => {
    renderCard(null, undefined)

    const create = screen.getByRole('button', { name: /^Create Task/ })
    expect(create.className).toContain('border-input')
    expect(create.className).not.toContain('bg-primary')
    expect(screen.queryByText('Task Open')).toBeNull()
  })

  it('leads with the rule-based move, not Mortar AI’s', () => {
    renderCard(null)

    expect(screen.getByText('Call The Banker')).toBeTruthy()
  })

  it('names the desk that owns the step, in that desk’s colour', () => {
    renderCard(null, undefined, summary(), 'sales-admin')

    const step = screen.getByText('Call The Banker').parentElement!
    const desk = within(step).getByText('Loan Admin')
    expect(desk.className).toContain('text-desk-loan-fg')
  })

  it('names the owner desk even when it is the reader’s own', () => {
    renderCard(null, undefined, summary(), 'loan-admin')

    const step = screen.getByText('Call The Banker').parentElement!
    expect(within(step).getByText('Loan Admin')).toBeTruthy()
  })

  it('offers Mortar AI’s differing move as one muted line that raises it directly', () => {
    const onCreateTask = renderCard(null)

    const line = screen.getByText(/^Mortar AI Suggests Call The Buyer/).closest('p')!
    expect(line.className).toContain('text-muted-foreground')
    expect(line.textContent).toContain('Sales Admin')

    fireEvent.click(within(line).getByRole('button', { name: /^Use This Action/ }))
    expect(onCreateTask).toHaveBeenCalledWith(expect.objectContaining({ action: 'call_buyer' }))
  })

  it('leads with the first specific blocker, set in the foreground', () => {
    renderCard(
      null,
      undefined,
      summary({ stallReasons: ['No Update For 8 Days', 'Bank Has Not Decided After 10 Working Days'] })
    )

    const blocker = screen.getByText('Bank Has Not Decided After 10 Working Days')
    expect(blocker.className).toContain('text-foreground')
    expect(screen.queryByText('No Update For 8 Days')).toBeNull()
  })

  it('sets the generic no-update blocker quietly when it is the only one', () => {
    renderCard(null, undefined, summary({ stallReasons: ['No Update For 8 Days'] }))

    expect(screen.getByText('No Update For 8 Days').className).toContain('text-muted-foreground')
  })

  it('opens every fact and every blocker under Details, from a chevron that says what it does', () => {
    renderCard(
      null,
      undefined,
      summary({ stallReasons: ['No Update For 8 Days', 'Bank Has Not Decided After 10 Working Days'] })
    )

    const toggle = screen.getByRole('button', { name: 'Details For A-12-03' })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Hide Details For A-12-03' }).getAttribute('aria-expanded')).toBe('true')

    const details = document.getElementById(toggle.getAttribute('aria-controls')!)!
    for (const label of ['Stage', 'Booking Age', 'Last Update', 'Booking Value', 'Financing Risk', 'All Blockers'])
      expect(within(details).getByText(label)).toBeTruthy()
    expect(within(details).getByText('No Update For 8 Days')).toBeTruthy()
    expect(within(details).getByText('RM 550,000')).toBeTruthy()
  })

  it('shows no pill for a case inside its norm, and no risk chip below High', () => {
    renderCard(null)

    expect(screen.queryByText(/Overdue/)).toBeNull()
    expect(screen.queryByText('Low Risk')).toBeNull()
  })

  it('shows the overdue pill and the risk chip only when each earns its place', () => {
    const caseSummary = summary({ daysSinceEvidence: 14, risk: { ...summary().risk, level: 'high' } })
    render(
      <MemoryRouter>
        <PersonaProvider>
          <ChaseCard
            booking={booking()}
            summary={caseSummary}
            step={nextStepFor(booking(), caseSummary, NEXT_ACTION_LABELS).defaultStep}
            onInspect={vi.fn()}
            onSuggest={vi.fn()}
            onCreateTask={vi.fn()}
          />
        </PersonaProvider>
      </MemoryRouter>
    )

    expect(screen.getByText('Overdue 14 Days')).toBeTruthy()
    expect(screen.getByText('High Risk')).toBeTruthy()
  })

  it('keeps Ask Mortar AI Again as a 32px icon button carrying its own label', () => {
    renderCard(null)

    const button = screen.getByRole('button', { name: /^Ask Mortar AI Again/ })
    expect(button.textContent).toBe('')
    expect(button.className).toContain('size-8')
  })

  it('names the missing document in the step itself, not as a tail after it', () => {
    renderCard(null, undefined, summary({ outstandingDocuments: ['payslip'] }))

    expect(screen.getByText('Ask For Payslip')).toBeTruthy()
    expect(screen.queryByText(/Ask For The Missing Document/)).toBeNull()
  })

  it('falls back to the missing document when the case names none', () => {
    renderCard(
      null,
      undefined,
      summary({ applications: [{ id: 'APP-1', bank: 'Crestline Bank', status: 'documents_pending' }] })
    )

    expect(screen.getByText('Ask For The Missing Document')).toBeTruthy()
    expect(screen.queryByText(/Ask For Payslip/)).toBeNull()
  })

  it('opens the case panel from the unit and buyer', () => {
    const onInspect = vi.fn()
    const caseSummary = summary()
    render(
      <MemoryRouter>
        <PersonaProvider>
          <ChaseCard
            booking={booking()}
            summary={caseSummary}
            step={nextStepFor(booking(), caseSummary, NEXT_ACTION_LABELS).defaultStep}
            onInspect={onInspect}
            onSuggest={vi.fn()}
            onCreateTask={vi.fn()}
          />
        </PersonaProvider>
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Quick View A-12-03: BK-9001 · Raymond Tan Wei Hong' }))
    expect(onInspect).toHaveBeenCalledTimes(1)
  })
})
