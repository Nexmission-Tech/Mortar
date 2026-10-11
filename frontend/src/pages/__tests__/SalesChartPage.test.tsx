import { useEffect } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { summarizeCases, type Snapshot } from '@mortar/core'
import { PersonaProvider, type Persona } from '@/lib/persona'
import { SnapshotProvider, useSnapshot } from '@/lib/data'
import { buildSnapshot } from '@/components/bookings/__tests__/snapshotFixture'
import { STATE_LABELS, unitsForSnapshot } from '@/components/sales-chart/salesChart'
import { SalesChartPage } from '@/pages/SalesChartPage'

const state = vi.hoisted(() => ({ snapshot: null as Snapshot | null, webgl: false }))

vi.mock('@/components/sales-chart/webgl', () => ({ canUseWebGL: () => state.webgl }))
// jsdom has no WebGL; the scene is checked in a real browser.
vi.mock('@/components/sales-chart/SalesChartBuilding', () => ({
  default: () => <div data-testid="building" />
}))

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

/** The snapshot's refresh, as CaseQuickView's onChanged calls it after a save. */
const refreshRef: { current: (() => Promise<void>) | null } = { current: null }
function RefreshGrabber() {
  const { refresh } = useSnapshot()
  useEffect(() => {
    refreshRef.current = refresh
  }, [refresh])
  return null
}

function renderPage(persona: Persona, patch: Partial<Snapshot> = {}) {
  state.snapshot = { ...BASE, ...patch }
  return render(
    <MemoryRouter initialEntries={['/sales-chart']}>
      <PersonaProvider initialPersona={persona}>
        <SnapshotProvider>
          <RefreshGrabber />
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
    state.webgl = false
  })

  it('shows the figures, lights a filter, and opens a case from its unit', async () => {
    renderPage('manager')
    expect(await screen.findByRole('heading', { name: 'Sales Chart' })).toBeTruthy()
    for (const label of ['Units Booked', 'SPA Signed', 'Expected SPAs In 30 Days', 'Needs Action'])
      expect(screen.getAllByText(label).length).toBeGreaterThan(0)
    expect(screen.getByText(/Bookings Under 30 Days Old/)).toBeTruthy()

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
    expect(screen.getByText(/Farah Izzati’s Desk/)).toBeTruthy()
    expect(screen.queryByText(/Held By Farah Izzati ·/)).toBeNull()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('says so when a filter lights nothing', async () => {
    renderPage('manager', { units: [] })
    const filters = await screen.findByRole('group', { name: 'Filter units' })
    fireEvent.click(within(filters).getByRole('button', { name: /Release Review/ }))
    expect(screen.getByText('No Units Match This Filter.')).toBeTruthy()
  })

  it('tells a scoped viewer why a filter lights nothing', async () => {
    renderPage('sales-admin', {
      units: [{ code: 'C-03-01', state: 'release_review', bookingId: null, heldBy: 'Farah Izzati' }]
    })
    const filters = await screen.findByRole('group', { name: 'Filter units' })
    fireEvent.click(within(filters).getByRole('button', { name: /Release Review/ }))
    expect(screen.getByText('None Of Your Bookings Match This Filter. Other Desks’ Units Stay Grey.')).toBeTruthy()
  })

  it('keeps the readout steady while the pointer crosses the gap between two cells', async () => {
    renderPage('manager', { units: [] })
    const a = await screen.findByRole('button', { name: 'A-03-01, Available' })
    const b = screen.getByRole('button', { name: 'A-03-02, Available' })
    const readout = () => document.querySelector('[aria-live="polite"]')!.textContent ?? ''
    fireEvent.mouseEnter(a)
    expect(readout()).toContain('A-03-01')
    fireEvent.mouseLeave(a)
    expect(readout()).toContain('A-03-01')
    fireEvent.mouseEnter(b)
    expect(readout()).toContain('A-03-02')
  })

  it('recolours a unit once a save refreshes the snapshot', async () => {
    const { fetchSnapshot } = await import('@/lib/api')
    renderPage('manager', {
      units: [{ code: 'A-12-03', state: 'needs_action', bookingId: 'BK-9001', heldBy: 'Nurul Aina' }]
    })
    expect(await screen.findByRole('button', { name: 'A-12-03, Needs Action' })).toBeTruthy()
    state.snapshot = {
      ...state.snapshot!,
      units: [{ code: 'A-12-03', state: 'signed', bookingId: 'BK-9001', heldBy: 'Nurul Aina' }]
    }
    // What CaseQuickView's onChanged does after Record An Update.
    vi.mocked(fetchSnapshot).mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'A-12-03, Needs Action' }))
    const sheet = await screen.findByRole('dialog')
    expect(sheet).toBeTruthy()
    await act(async () => {
      await refreshRef.current?.()
    })
    // The modal sheet hides the page from the accessibility tree while it is open.
    expect(await screen.findByRole('button', { name: 'A-12-03, SPA Signed', hidden: true })).toBeTruthy()
  })

  it('opens on the Building view where WebGL works, and remembers a switch to the Grid', async () => {
    state.webgl = true
    const first = renderPage('manager')
    expect(await screen.findByTestId('building')).toBeTruthy()
    const views = screen.getByRole('group', { name: 'Chart view' })
    fireEvent.click(within(views).getByRole('button', { name: 'Grid' }))
    expect(screen.queryByTestId('building')).toBeNull()
    expect(screen.getAllByRole('table').length).toBeGreaterThan(0)
    expect(window.localStorage.getItem('mortar.salesChart.view')).toBe('grid')
    first.unmount()
    renderPage('manager')
    expect(await screen.findByRole('group', { name: 'Chart view' })).toBeTruthy()
    expect(screen.queryByTestId('building')).toBeNull()
  })

  it('stays on the Grid without WebGL and says why the Building view is off', async () => {
    renderPage('manager')
    const views = await screen.findByRole('group', { name: 'Chart view' })
    expect((within(views).getByRole('button', { name: 'Building' }) as HTMLButtonElement).disabled).toBe(true)
    expect(screen.queryByTestId('building')).toBeNull()
    expect(screen.getAllByRole('table').length).toBeGreaterThan(0)
  })
})
