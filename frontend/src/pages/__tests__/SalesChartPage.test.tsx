import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { summarizeCases, type Snapshot } from '@mortar/core'
import { PersonaProvider, type Persona } from '@/lib/persona'
import { SnapshotProvider } from '@/lib/data'
import { buildSnapshot } from '@/components/bookings/__tests__/snapshotFixture'
import { STATE_LABELS, unitsForSnapshot } from '@/components/sales-chart/salesChart'
import { SalesChartPage } from '@/pages/SalesChartPage'

const state = vi.hoisted(() => ({ snapshot: null as Snapshot | null }))

vi.mock('@/lib/api', async () => ({
  fetchSnapshot: vi.fn(async () => state.snapshot),
  postTask: vi.fn(async () => ({})),
  postEvent: vi.fn(async () => ({})),
  postApplication: vi.fn(async () => ({}))
}))

// Radix tooltips and the sheet position with floating-ui, which needs observers jsdom lacks.
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
Element.prototype.scrollIntoView = vi.fn()

const BASE = buildSnapshot()
const CASES = summarizeCases(BASE, BASE.meta.referenceDate)
const label9001 = () => {
  const unit = unitsForSnapshot(state.snapshot!, CASES).find((u) => u.code === 'A-12-03')!
  return `A-12-03, ${STATE_LABELS[unit.state]}`
}

function renderPage(persona: Persona, patch: Partial<Snapshot> = {}) {
  state.snapshot = { ...BASE, ...patch }
  return render(
    <MemoryRouter initialEntries={['/sales-chart']}>
      <PersonaProvider initialPersona={persona}>
        <SnapshotProvider>
          <Routes>
            <Route path="/sales-chart" element={<SalesChartPage />} />
          </Routes>
        </SnapshotProvider>
      </PersonaProvider>
    </MemoryRouter>
  )
}

describe('SalesChartPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows the figures, lights a filter, and opens a case from its unit', async () => {
    renderPage('manager')
    expect(await screen.findByRole('heading', { name: 'Sales Chart' })).toBeTruthy()
    expect(screen.getByText('Active Unsigned')).toBeTruthy()
    expect(screen.getByText('Expected SPAs In 30 Days')).toBeTruthy()

    const filters = screen.getByRole('group', { name: 'Filter units' })
    const chip = within(filters).getByRole('button', { name: /Loan Approved, No SPA Appointment/ })
    fireEvent.click(chip)
    expect(chip.getAttribute('aria-pressed')).toBe('true')
    expect(document.querySelectorAll('[data-lit="true"]').length).toBeGreaterThan(0)
    fireEvent.click(chip)
    expect(chip.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(screen.getByRole('button', { name: label9001() }))
    const sheet = await screen.findByRole('dialog')
    expect(
      within(sheet)
        .getByRole('link', { name: /Open Full Case/ })
        .getAttribute('href')
    ).toBe('/bookings/BK-9001')
  })

  it('names the desk holding a unit the viewer cannot open, and opens nothing', async () => {
    renderPage('sales-admin', {
      units: [{ code: 'C-03-01', state: 'needs_action', bookingId: null, heldBy: 'Farah Izzati' }]
    })
    fireEvent.click(await screen.findByRole('button', { name: 'C-03-01, Needs Action' }))
    expect(screen.getByText(/Held By Farah Izzati’s Desk/)).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('says so when a filter lights nothing', async () => {
    renderPage('manager', { units: [] })
    const filters = await screen.findByRole('group', { name: 'Filter units' })
    fireEvent.click(within(filters).getByRole('button', { name: /Release Review/ }))
    expect(screen.getByText('No Units Match This Filter.')).toBeTruthy()
  })
})
