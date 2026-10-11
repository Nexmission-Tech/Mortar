import { useEffect } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { summarizeCases, type Snapshot } from '@mortar/core'
import { PersonaProvider, type Persona } from '@/lib/persona'
import { SnapshotProvider, useSnapshot } from '@/lib/data'
import { buildSnapshot } from '@/components/bookings/__tests__/snapshotFixture'
import { STATE_LABELS, unitsForSnapshot } from '@/components/sales-chart/salesChart'
import { SalesChartPage } from '@/pages/SalesChartPage'

const state = vi.hoisted(() => ({ snapshot: null as Snapshot | null, webgl: false, sceneFails: false }))

vi.mock('@/components/sales-chart/webgl', () => ({ canUseWebGL: () => state.webgl }))
// jsdom has no WebGL; the scene is checked in a real browser.
vi.mock('@/components/sales-chart/SalesChartBuilding', () => ({
  default: () => {
    if (state.sceneFails) throw new Error('Error creating WebGL context.')
    return <div data-testid="building" />
  }
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
    state.sceneFails = false
  })

  it('shows the figures, lights a filter, and opens a case from its unit', async () => {
    renderPage('manager')
    expect(await screen.findByRole('heading', { name: 'Sales Chart' })).toBeTruthy()
    for (const label of ['Units Booked', 'SPA Signed', 'Expected To Sign By Day 30', 'Needs Action'])
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
    const island = screen.getByRole('region', { name: 'Selected Unit' })
    expect(within(island).getByText('A-12-03')).toBeTruthy()
    expect(within(island).getByText('Block A · Floor 12 · Unit 03')).toBeTruthy()
    expect(within(island).getByText(/BK-9001/)).toBeTruthy()
    // The island is not a modal: nothing opens until Open Case.
    expect(screen.queryByRole('dialog')).toBeNull()

    fireEvent.click(within(island).getByRole('button', { name: 'Open Case' }))
    const panel = await screen.findByRole('dialog')
    expect(panel.getAttribute('data-side')).toBe('floating')
    expect(
      within(panel)
        .getByRole('link', { name: /Open Full Case/ })
        .getAttribute('href')
    ).toBe('/bookings/BK-9001')
  })

  it('names the desk holding a unit the viewer cannot open, and opens nothing', async () => {
    renderPage('sales-admin', {
      units: [{ code: 'C-03-01', state: 'needs_action', bookingId: null, heldBy: 'Farah Izzati' }]
    })
    fireEvent.click(await screen.findByRole('button', { name: 'C-03-01, Needs Action' }))
    const island = screen.getByRole('region', { name: 'Selected Unit' })
    expect(within(island).getByText('Held By Farah Izzati’s Desk')).toBeTruthy()
    expect(within(island).queryByRole('button', { name: 'Open Case' })).toBeNull()
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
    fireEvent.click(
      within(screen.getByRole('region', { name: 'Selected Unit' })).getByRole('button', { name: 'Open Case' })
    )
    expect(await screen.findByRole('dialog')).toBeTruthy()
    await act(async () => {
      await refreshRef.current?.()
    })
    // The modal sheet hides the page from the accessibility tree while it is open.
    expect(await screen.findByRole('button', { name: 'A-12-03, SPA Signed', hidden: true })).toBeTruthy()
    // The island outlives the save and reads the new state.
    // The modal hides the island from the accessibility tree, and with it its name.
    const island = document.querySelector<HTMLElement>('section[aria-label="Selected Unit"]')!
    expect(within(island).getByText('SPA Signed')).toBeTruthy()
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

  it('falls back to the Grid, and says why, when the 3D scene cannot start', async () => {
    state.webgl = true
    state.sceneFails = true
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {})
    renderPage('manager')
    expect(
      await screen.findByText('This Browser Could Not Draw The Building View. The Grid Shows The Same Units.')
    ).toBeTruthy()
    expect(screen.getAllByRole('table').length).toBeGreaterThan(0)
    const views = screen.getByRole('group', { name: 'Chart view' })
    expect((within(views).getByRole('button', { name: 'Building' }) as HTMLButtonElement).disabled).toBe(true)
    expect(window.localStorage.getItem('mortar.salesChart.view')).toBe('grid')
    quiet.mockRestore()
  })
  it('swaps the island to the next unit clicked and closes it on Esc', async () => {
    renderPage('manager', { units: [] })
    fireEvent.click(await screen.findByRole('button', { name: 'A-03-01, Available' }))
    expect(within(screen.getByRole('region', { name: 'Selected Unit' })).getByText('A-03-01')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'A-03-02, Available' }))
    const island = screen.getByRole('region', { name: 'Selected Unit' })
    expect(within(island).getByText('A-03-02')).toBeTruthy()
    expect(within(island).getByText('Available · Not Booked')).toBeTruthy()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('region', { name: 'Selected Unit' })).toBeNull()
  })

  it('closes the island from its close button', async () => {
    renderPage('manager', { units: [] })
    fireEvent.click(await screen.findByRole('button', { name: 'A-03-01, Available' }))
    fireEvent.click(
      within(screen.getByRole('region', { name: 'Selected Unit' })).getByRole('button', { name: 'Close' })
    )
    expect(screen.queryByRole('region', { name: 'Selected Unit' })).toBeNull()
  })

  it('keeps the island when Esc closes the case panel', async () => {
    renderPage('manager')
    fireEvent.click(await screen.findByRole('button', { name: label9001() }))
    fireEvent.click(
      within(screen.getByRole('region', { name: 'Selected Unit' })).getByRole('button', { name: 'Open Case' })
    )
    const panel = await screen.findByRole('dialog')
    fireEvent.keyDown(panel, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(screen.getByRole('region', { name: 'Selected Unit' })).toBeTruthy()
  })

  it('leaves room below the chart for the island', async () => {
    renderPage('manager', { units: [] })
    fireEvent.click(await screen.findByRole('button', { name: 'A-03-01, Available' }))
    expect(document.querySelector('[data-island-spacer]')).toBeTruthy()
  })
  it('keeps the island when another layer has already handled Esc', async () => {
    renderPage('manager', { units: [] })
    fireEvent.click(await screen.findByRole('button', { name: 'A-03-01, Available' }))
    const handled = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true, bubbles: true })
    handled.preventDefault()
    act(() => void window.dispatchEvent(handled))
    expect(screen.getByRole('region', { name: 'Selected Unit' })).toBeTruthy()
  })

  it('sizes the room below the chart to the island, and keeps the island under the app shell', async () => {
    class Measured {
      constructor(private callback: ResizeObserverCallback) {}
      observe(target: Element) {
        this.callback(
          [{ target, borderBoxSize: [{ blockSize: 300, inlineSize: 500 }] } as unknown as ResizeObserverEntry],
          this as unknown as ResizeObserver
        )
      }
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', Measured)
    try {
      renderPage('manager', { units: [] })
      fireEvent.click(await screen.findByRole('button', { name: 'A-03-01, Available' }))
      const spacer = document.querySelector<HTMLElement>('[data-island-spacer]')!
      expect(spacer.style.height).toBe('332px')
      expect(screen.getByRole('region', { name: 'Selected Unit' }).className).toContain('z-40')
    } finally {
      vi.stubGlobal(
        'ResizeObserver',
        class {
          observe() {}
          unobserve() {}
          disconnect() {}
        }
      )
    }
  })

  it('returns focus to the unit when the island closes from inside', async () => {
    renderPage('manager', { units: [] })
    fireEvent.click(await screen.findByRole('button', { name: 'A-03-02, Available' }))
    const close = within(screen.getByRole('region', { name: 'Selected Unit' })).getByRole('button', { name: 'Close' })
    close.focus()
    fireEvent.click(close)
    expect(document.activeElement?.getAttribute('aria-label')).toBe('A-03-02, Available')
  })
})
