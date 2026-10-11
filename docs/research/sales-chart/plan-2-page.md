# Sales Chart Plan 2: The Page And The Grid

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans
> to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship `/sales-chart`: four figures, three filters, a legend, the 2D
Grid view of every unit, a readout of the hovered or selected unit, and the
existing case side sheet on click.

**Architecture:** A pure module
`frontend/src/components/sales-chart/salesChart.ts` holds state labels, filters,
counts and figures. `SalesChartGrid.tsx` draws `ChartUnit[]` as one table per
block with roving focus. `SalesChartPage.tsx` composes them with `StatCard`,
`CaseQuickView` and the snapshot. The 3D Building view (plan 3) will plug into
the same page props.

**Tech Stack:** React 19, Tailwind 4 tokens, react-router 7, Vitest + Testing
Library.

**Spec:** [README.md](README.md) · builds on [plan 1](plan-1-core.md) (merged
core: `chartUnits`, `heldUnits`, `needsAction`, `awaitingSpaAppointment`,
`releaseReview`, `UnitState`, `ChartUnit`).

## Global Constraints

- Colour only from the six status tokens; every state also has a word or a mark.
  No hex values outside `globals.css`; no gradient, glass or glow.
- No `title` tooltips and no native `<select>`; use the existing UI primitives.
- Copy in Title Case for labels, as the rest of the app.
- State labels: Available, Booked, Loan Approved, Needs Action, Release Review,
  SPA Signed.
- Tones: Available = card with border; Booked = `info`; Loan Approved =
  `positive`; Needs Action = `warning` with a dot; Release Review = `danger`
  with a dash; SPA Signed = `signed`.
- Filters light only units the viewer may open (`bookingId !== null`).
- Run `bun run check`, then `bun run format`, before each task's commit.

## Review Focus

1.  A snapshot from a server without `units` (older deploy, or tests) must still
    draw the chart, from the viewer's own bookings.
1.  A unit held by another desk must say whose desk holds it and must not open a
    sheet or a case link.
1.  A filter that matches nothing must say so instead of showing a fully ghosted
    tower with no explanation.
1.  After Record An Update in the sheet, the unit's colour must change without a
    reload (the page re-reads the refreshed snapshot).
1.  The page must stay usable at 1280px wide and on a phone: the grid scrolls
    horizontally inside its card, never the page.

## Rulings Carried From The Spec

- **No "Simulated data" chrome.** DESIGN.md's chip-economy rule states that fact
  once, on `/settings`. The header reads "<project> · <N> units".
- **One readout instead of per-cell tooltips.** A single strip under the chart
  names the hovered, focused or selected unit; 936 tooltips would be heavy.
- **Sales Chart is primary for every persona.** `PERSONA_PAGES` groups by page,
  not by persona; a per-persona group would be new machinery for one entry.

---

### Task 1: Chart Helpers

**Files:**

- Create: `frontend/src/components/sales-chart/salesChart.ts`
- Test: `frontend/src/components/sales-chart/__tests__/salesChart.test.ts`

**Interfaces:**

- Consumes: `ChartUnit`, `UnitState`, `CaseSummary`, `needsAction`,
  `awaitingSpaAppointment`, `releaseReview`, `chartUnits`, `heldUnits`,
  `DEFAULT_PROJECT_SETTINGS`, `Snapshot` from `@mortar/core`.
- Produces:
  - `UNIT_STATES: readonly UnitState[]` (legend order)
  - `STATE_LABELS: Record<UnitState, string>`
  - `type ChartFilter = 'needs_action' | 'awaiting_appointment' | 'release_review'`
  - `CHART_FILTERS: readonly { id: ChartFilter; label: string; info: string }[]`
  - `matchesFilter(filter: ChartFilter, summary: CaseSummary): boolean`
  - `unitsForSnapshot(snapshot: Snapshot, cases: CaseSummary[]): ChartUnit[]`
  - `litUnits(units: ChartUnit[], cases: CaseSummary[], filter: ChartFilter): Set<string>`
  - `legendCounts(units: ChartUnit[]): Record<UnitState, number>`
  - `activeUnsigned(cases: CaseSummary[]): number`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, test } from 'vitest'
import type { CaseSummary, ChartUnit, Snapshot } from '@mortar/core'
import { DEFAULT_PROJECT_SETTINGS } from '@mortar/core'
import { buildSnapshot } from '@/components/bookings/__tests__/snapshotFixture'
import { summarizeCases } from '@mortar/core'
import {
  activeUnsigned,
  legendCounts,
  litUnits,
  matchesFilter,
  unitsForSnapshot,
  UNIT_STATES
} from '../salesChart'

const snapshot = buildSnapshot()
const cases = summarizeCases(snapshot, snapshot.meta.referenceDate)

describe('unitsForSnapshot', () => {
  test('uses the server units when present', () => {
    const units = unitsForSnapshot(
      {
        ...snapshot,
        units: [
          {
            code: 'A-03-01',
            state: 'signed',
            bookingId: null,
            heldBy: 'Farah Izzati'
          }
        ]
      },
      cases
    )
    expect(units).toHaveLength(936)
    expect(units[0]).toMatchObject({
      code: 'A-03-01',
      state: 'signed',
      heldBy: 'Farah Izzati'
    })
  })

  test('falls back to the viewer’s own bookings when the server sent none', () => {
    const units = unitsForSnapshot({ ...snapshot, units: undefined }, cases)
    const held = units.filter((u) => u.state !== 'available')
    expect(held.length).toBeGreaterThan(0)
    expect(held.every((u) => u.bookingId !== null)).toBe(true)
    expect(units.find((u) => u.code === 'A-12-03')?.bookingId).toBe('BK-9001')
  })

  test('uses the snapshot’s project settings for the layout', () => {
    const small = {
      ...DEFAULT_PROJECT_SETTINGS,
      blocks: ['A'],
      minFloor: 3,
      maxFloor: 3,
      unitsPerFloor: 2
    }
    expect(
      unitsForSnapshot(
        { ...snapshot, projectSettings: small, units: [] },
        cases
      ).map((u) => u.code)
    ).toEqual(['A-03-01', 'A-03-02'])
  })
})

describe('filters and counts', () => {
  const units = unitsForSnapshot({ ...snapshot, units: undefined }, cases)
  const byId = new Map(cases.map((c) => [c.bookingId, c]))

  test('a filter lights exactly the units whose case matches', () => {
    for (const filter of [
      'needs_action',
      'awaiting_appointment',
      'release_review'
    ] as const) {
      const lit = litUnits(units, cases, filter)
      const expected = units.filter(
        (u) => u.bookingId && matchesFilter(filter, byId.get(u.bookingId)!)
      )
      expect([...lit].sort()).toEqual(expected.map((u) => u.code).sort())
    }
  })

  test('never lights a unit the viewer cannot open', () => {
    const foreign: ChartUnit[] = units.map((u) =>
      u.code === 'A-12-03' ? { ...u, bookingId: null } : u
    )
    for (const filter of [
      'needs_action',
      'awaiting_appointment',
      'release_review'
    ] as const)
      expect(litUnits(foreign, cases, filter).has('A-12-03')).toBe(false)
  })

  test('legend counts every unit once', () => {
    const counts = legendCounts(units)
    expect(UNIT_STATES.reduce((sum, state) => sum + counts[state], 0)).toBe(
      units.length
    )
  })

  test('active unsigned counts live bookings without a signed SPA', () => {
    const live = cases.filter(
      (c) => c.stage !== 'cancelled' && c.stage !== 'lapsed' && !c.spaSigned
    ).length
    expect(activeUnsigned(cases)).toBe(live)
    expect(activeUnsigned([] as CaseSummary[])).toBe(0)
  })
})

void ({} as Snapshot)
```

- [ ] **Step 2: Run them to see them fail**

Run: `cd frontend && bunx vitest run src/components/sales-chart` Expected: FAIL,
module `../salesChart` not found.

- [ ] **Step 3: Implement** `salesChart.ts`:

```ts
/**
 * Sales Chart helpers: what each unit state is called, the three filters, and
 * the counts behind the figures and the legend. Pure, so the Grid and the
 * Building view read the same answers.
 */
import {
  awaitingSpaAppointment,
  chartUnits,
  DEFAULT_PROJECT_SETTINGS,
  heldUnits,
  needsAction,
  releaseReview,
  type CaseSummary,
  type ChartUnit,
  type Snapshot,
  type UnitState
} from '@mortar/core'

/** Legend order: stock first, then the booking journey, attention, and the sale. */
export const UNIT_STATES: readonly UnitState[] = [
  'available',
  'booked',
  'loan_approved',
  'needs_action',
  'release_review',
  'signed'
]

export const STATE_LABELS: Record<UnitState, string> = {
  available: 'Available',
  booked: 'Booked',
  loan_approved: 'Loan Approved',
  needs_action: 'Needs Action',
  release_review: 'Release Review',
  signed: 'SPA Signed'
}

export type ChartFilter =
  'needs_action' | 'awaiting_appointment' | 'release_review'

export const CHART_FILTERS: readonly {
  id: ChartFilter
  label: string
  info: string
}[] = [
  {
    id: 'needs_action',
    label: 'Needs Action',
    info: 'Live bookings the stall rule flagged: the cases on Today.'
  },
  {
    id: 'awaiting_appointment',
    label: 'Loan Approved, No SPA Appointment',
    info: 'The loan is through and no signing date is on record.'
  },
  {
    id: 'release_review',
    label: 'Release Review',
    info: 'Every recovery path looks spent. A person decides whether to release the unit; Mortar never cancels.'
  }
]

export function matchesFilter(
  filter: ChartFilter,
  summary: CaseSummary
): boolean {
  if (filter === 'needs_action') return needsAction(summary)
  if (filter === 'awaiting_appointment') return awaitingSpaAppointment(summary)
  return releaseReview(summary)
}

/**
 * Every unit in the snapshot's layout with its state. A server that sent no
 * `units` (an older deploy, or a test) leaves the chart to the viewer's own
 * bookings, so it still draws rather than going blank.
 */
export function unitsForSnapshot(
  snapshot: Snapshot,
  cases: CaseSummary[]
): ChartUnit[] {
  const settings = snapshot.projectSettings ?? DEFAULT_PROJECT_SETTINGS
  return chartUnits(
    settings,
    snapshot.units ?? heldUnits(settings, snapshot.bookings, cases)
  )
}

/** The codes a filter lights: units the viewer may open whose case matches. */
export function litUnits(
  units: ChartUnit[],
  cases: CaseSummary[],
  filter: ChartFilter
): Set<string> {
  const byId = new Map(cases.map((c) => [c.bookingId, c]))
  const lit = new Set<string>()
  for (const unit of units) {
    const summary = unit.bookingId ? byId.get(unit.bookingId) : undefined
    if (summary && matchesFilter(filter, summary)) lit.add(unit.code)
  }
  return lit
}

export function legendCounts(units: ChartUnit[]): Record<UnitState, number> {
  const counts = Object.fromEntries(
    UNIT_STATES.map((state) => [state, 0])
  ) as Record<UnitState, number>
  for (const unit of units) counts[unit.state] += 1
  return counts
}

/** Live bookings without a signed SPA, among the viewer's own. */
export function activeUnsigned(cases: CaseSummary[]): number {
  return cases.filter(
    (c) => c.stage !== 'cancelled' && c.stage !== 'lapsed' && !c.spaSigned
  ).length
}
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `cd frontend && bunx vitest run src/components/sales-chart` Expected: PASS.
Remove the trailing `void ({} as Snapshot)` line if lint flags the unused import
instead; it only keeps the type import used.

- [ ] **Step 5: Commit**
      `feat(sales-chart): add the chart's states, filters and counts`.

### Task 2: The Grid

**Files:**

- Create: `frontend/src/components/sales-chart/SalesChartGrid.tsx`
- Create: `frontend/src/components/sales-chart/unitTone.ts`
- Test: `frontend/src/components/sales-chart/__tests__/SalesChartGrid.test.tsx`

**Interfaces:**

- Consumes: `ChartUnit`, `STATE_LABELS`.
- Produces:
  - `UNIT_FILL: Record<UnitState, string>` and `UnitMark({ state })` in
    `unitTone.ts` (shared with the legend and, later, nothing in 3D: the
    Building view reads CSS variables).
  - `SalesChartGrid(props: { units: ChartUnit[]; lit: ReadonlySet<string> | null; selected: string | null; onSelect: (unit: ChartUnit) => void; onHover: (unit: ChartUnit | null) => void })`

- [ ] **Step 1: Write the failing tests**

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { chartUnits, DEFAULT_PROJECT_SETTINGS } from '@mortar/core'
import { SalesChartGrid } from '../SalesChartGrid'

const settings = {
  ...DEFAULT_PROJECT_SETTINGS,
  blocks: ['A', 'B'],
  minFloor: 3,
  maxFloor: 4,
  unitsPerFloor: 2
}
const units = chartUnits(settings, [
  {
    code: 'A-03-01',
    state: 'needs_action',
    bookingId: 'BK-1',
    heldBy: 'Nurul Aina'
  },
  { code: 'B-03A-02', state: 'signed', bookingId: null, heldBy: 'Farah Izzati' }
])

const setup = (lit: ReadonlySet<string> | null = null) => {
  const onSelect = vi.fn()
  const onHover = vi.fn()
  render(
    <SalesChartGrid
      units={units}
      lit={lit}
      selected={null}
      onSelect={onSelect}
      onHover={onHover}
    />
  )
  return { onSelect, onHover }
}

describe('SalesChartGrid', () => {
  test('names every unit with its state, one table per block, top floor first', () => {
    setup()
    expect(screen.getAllByRole('table')).toHaveLength(2)
    expect(
      screen.getByRole('button', { name: 'A-03-01, Needs Action' })
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'B-03A-02, SPA Signed' })
    ).toBeTruthy()
    const rows = screen
      .getAllByRole('rowheader')
      .map((cell) => cell.textContent)
    expect(rows.slice(0, 2)).toEqual(['03A', '03'])
  })

  test('is one tab stop, moved with the arrow keys', () => {
    setup()
    const buttons = screen.getAllByRole('button')
    expect(buttons.filter((b) => b.tabIndex === 0)).toHaveLength(1)
    const first = buttons.find((b) => b.tabIndex === 0)!
    first.focus()
    fireEvent.keyDown(first, { key: 'ArrowRight' })
    expect(document.activeElement?.getAttribute('aria-label')).toBe(
      'A-03A-02, Available'
    )
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' })
    expect(document.activeElement?.getAttribute('aria-label')).toBe(
      'A-03-02, Available'
    )
  })

  test('selects on click and on Enter, and reports hover', () => {
    const { onSelect, onHover } = setup()
    const cell = screen.getByRole('button', { name: 'A-03-01, Needs Action' })
    fireEvent.click(cell)
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'A-03-01' })
    )
    fireEvent.mouseEnter(cell)
    expect(onHover).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'A-03-01' })
    )
    fireEvent.mouseLeave(cell)
    expect(onHover).toHaveBeenLastCalledWith(null)
  })

  test('ghosts units a filter leaves out', () => {
    setup(new Set(['A-03-01']))
    expect(
      screen.getByRole('button', { name: 'A-03-01, Needs Action' }).dataset.lit
    ).toBe('true')
    expect(
      screen.getByRole('button', { name: 'B-03A-02, SPA Signed' }).dataset.lit
    ).toBe('false')
  })
})
```

- [ ] **Step 2: Run them to see them fail**

Run: `cd frontend && bunx vitest run src/components/sales-chart` Expected: FAIL,
module `../SalesChartGrid` not found.

- [ ] **Step 3: Implement** `unitTone.ts`:

```tsx
import type { UnitState } from '@mortar/core'
import { cn } from '@/lib/utils'

/** Cell fill per state: the six status solids, Available as a bordered card. */
export const UNIT_FILL: Record<UnitState, string> = {
  available: 'bg-card border border-border',
  booked: 'bg-status-info',
  loan_approved: 'bg-status-positive',
  needs_action: 'bg-status-warning',
  release_review: 'bg-status-danger',
  signed: 'bg-status-signed'
}

/**
 * The shape that tells the two attention states apart without colour: a dot
 * for Needs Action, a dash for Release Review.
 */
export function UnitMark({
  state,
  className
}: {
  state: UnitState
  className?: string
}) {
  if (state === 'needs_action')
    return (
      <span
        aria-hidden="true"
        className={cn('size-1.5 rounded-full bg-status-warning-fg', className)}
      />
    )
  if (state === 'release_review')
    return (
      <span
        aria-hidden="true"
        className={cn('h-0.5 w-2 rounded-full bg-card', className)}
      />
    )
  return null
}
```

Implement `SalesChartGrid.tsx`:

```tsx
/**
 * The Sales Chart's Grid view: one table per block, top floor first, a cell per
 * unit in its state's tone. The whole chart is one tab stop; arrow keys move
 * between cells and across blocks, Enter selects. It is the chart's accessible
 * form and the fallback when the Building view cannot draw.
 */
import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { ChartUnit } from '@mortar/core'
import { cn } from '@/lib/utils'
import { STATE_LABELS } from './salesChart'
import { UNIT_FILL, UnitMark } from './unitTone'

type SalesChartGridProps = {
  units: ChartUnit[]
  /** Units the active filter lights; `null` when no filter is on. */
  lit: ReadonlySet<string> | null
  selected: string | null
  onSelect: (unit: ChartUnit) => void
  onHover: (unit: ChartUnit | null) => void
}

interface BlockGrid {
  block: string
  unitLabels: string[]
  /** Rows top floor first; each row's cells unit 1 first. */
  rows: { floorLabel: string; cells: ChartUnit[] }[]
}

function toBlocks(units: ChartUnit[]): BlockGrid[] {
  const blocks = new Map<string, Map<number, ChartUnit[]>>()
  for (const unit of units) {
    const floors = blocks.get(unit.block) ?? new Map<number, ChartUnit[]>()
    const row = floors.get(unit.floor) ?? []
    row.push(unit)
    floors.set(unit.floor, row)
    blocks.set(unit.block, floors)
  }
  return [...blocks].map(([block, floors]) => {
    const rows = [...floors.entries()]
      .sort(([a], [b]) => b - a)
      .map(([, cells]) => ({
        floorLabel: cells[0]!.floorLabel,
        cells: [...cells].sort((a, b) => a.unit - b.unit)
      }))
    return {
      block,
      unitLabels: rows[0]?.cells.map((cell) => cell.unitLabel) ?? [],
      rows
    }
  })
}

export function SalesChartGrid({
  units,
  lit,
  selected,
  onSelect,
  onHover
}: SalesChartGridProps) {
  const blocks = useMemo(() => toBlocks(units), [units])
  const [focus, setFocus] = useState<string | null>(null)
  const refs = useRef(new Map<string, HTMLButtonElement>())
  const focusCode = focus ?? blocks[0]?.rows[0]?.cells[0]?.code ?? null

  const move = (b: number, r: number, c: number, event: KeyboardEvent) => {
    const step: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1]
    }
    const delta = step[event.key]
    if (!delta) return
    event.preventDefault()
    let [block, row, col] = [b, r + delta[0], c + delta[1]]
    const width = (i: number) => blocks[i]?.unitLabels.length ?? 0
    if (col < 0 && block > 0) [block, col] = [block - 1, width(block - 1) - 1]
    if (col >= width(block) && block < blocks.length - 1)
      [block, col] = [block + 1, 0]
    const target = blocks[block]?.rows[row]?.cells[col]
    if (!target) return
    setFocus(target.code)
    refs.current.get(target.code)?.focus()
  }

  return (
    <div className="flex gap-8 overflow-x-auto pb-2">
      {blocks.map((grid, b) => (
        <table
          key={grid.block}
          className="shrink-0 border-separate border-spacing-[2px]"
        >
          <caption className="pb-2 text-left text-xs font-semibold text-foreground">
            Block {grid.block}
            <span className="ml-1.5 font-normal text-muted-foreground tabular-nums">
              {grid.rows.length * grid.unitLabels.length} Units
            </span>
          </caption>
          <thead>
            <tr>
              <td />
              {grid.unitLabels.map((label) => (
                <th
                  key={label}
                  scope="col"
                  className="w-[18px] pb-0.5 text-center font-mono text-[9px] font-normal text-muted-foreground"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.rows.map((row, r) => (
              <tr key={row.floorLabel}>
                <th
                  scope="row"
                  className="pr-1.5 text-right font-mono text-[10px] font-normal tabular-nums text-muted-foreground"
                >
                  {row.floorLabel}
                </th>
                {row.cells.map((unit, c) => {
                  const ghost = lit !== null && !lit.has(unit.code)
                  return (
                    <td key={unit.code} className="p-0">
                      <button
                        ref={(node) => {
                          if (node) refs.current.set(unit.code, node)
                          else refs.current.delete(unit.code)
                        }}
                        type="button"
                        tabIndex={unit.code === focusCode ? 0 : -1}
                        aria-label={`${unit.code}, ${STATE_LABELS[unit.state]}`}
                        aria-pressed={unit.code === selected}
                        data-lit={lit === null ? undefined : String(!ghost)}
                        onClick={() => onSelect(unit)}
                        onFocus={() => {
                          setFocus(unit.code)
                          onHover(unit)
                        }}
                        onBlur={() => onHover(null)}
                        onMouseEnter={() => onHover(unit)}
                        onMouseLeave={() => onHover(null)}
                        onKeyDown={(event) => move(b, r, c, event)}
                        className={cn(
                          'flex size-[18px] items-center justify-center rounded-[3px] outline-none transition-colors duration-[var(--motion-fast)] focus-visible:ring-2 focus-visible:ring-ring',
                          ghost ? 'bg-muted' : UNIT_FILL[unit.state],
                          unit.code === selected &&
                            'ring-2 ring-foreground ring-offset-1 ring-offset-card'
                        )}
                      >
                        {!ghost && <UnitMark state={unit.state} />}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  )
}
```

The `<td />` in the header row needs `aria-hidden` or a visually hidden label
("Floor") if the accessibility lint complains; prefer
`<td><span className="sr-only">Floor</span></td>`.

- [ ] **Step 4: Run the tests to see them pass**

Run: `cd frontend && bunx vitest run src/components/sales-chart` Expected: PASS.
Floors in the fixture are 3 and 4 (labelled 03 and 03A), so the first row header
is `03A`.

- [ ] **Step 5: Commit**
      `feat(sales-chart): draw every unit as an accessible grid`.

### Task 3: The Page, Route, Navigation And Tour

**Files:**

- Create: `frontend/src/pages/SalesChartPage.tsx`
- Create: `frontend/src/components/bookings/quickViewRow.ts`
- Modify: `frontend/src/App.tsx:60` (route), `frontend/src/lib/persona.tsx:54`
  (`PERSONA_PAGES`), `frontend/src/components/layout/AppSidebar.tsx:22` (icon),
  `frontend/src/components/layout/AppNav.tsx:17` (crumb),
  `frontend/src/tour/tourSteps.ts` (manager and sales-admin step)
- Test: `frontend/src/pages/__tests__/SalesChartPage.test.tsx`; the existing
  `tourAnchors.test.tsx` covers the new tour targets.

**Interfaces:**

- Consumes: Task 1 and 2 exports; `useSnapshot`, `useCases` (`@/lib/data`);
  `forecast` (`@mortar/core`), `datasetFor` (`@/components/forecast/forecast`);
  `CaseQuickView`, `StatCard`, `PageContainer`, `PageHeaderCard`, `Button`,
  `EmptyState`, `Skeleton`, `RefreshErrorBanner`, `InfoTooltip`.
- Produces:
  `quickViewRow(snapshot: Snapshot, cases: CaseSummary[], bookingId: string): BookingRow | null`;
  route `/sales-chart`; `data-tour="sales-chart-header"`.

- [ ] **Step 1: Write the failing page test** (mock `@/lib/api` as
      `tourAnchors.test.tsx` does, with `fetchSnapshot` returning
      `buildSnapshot()`; render inside
      `MemoryRouter initialEntries={['/sales-chart']}` with the providers
      `ChasePage` tests use):

```tsx
test('shows the figures, lights a filter, opens a case, and names a foreign desk', async () => {
  renderPage('manager')
  expect(
    await screen.findByRole('heading', { name: 'Sales Chart' })
  ).toBeTruthy()
  expect(screen.getByText('Active Unsigned')).toBeTruthy()
  expect(screen.getByText(/Expected SPAs In 30 Days/)).toBeTruthy()

  const chip = screen.getByRole('button', {
    name: /Loan Approved, No SPA Appointment/
  })
  fireEvent.click(chip)
  expect(chip.getAttribute('aria-pressed')).toBe('true')
  const lit = document.querySelectorAll('[data-lit="true"]')
  expect(lit.length).toBeGreaterThan(0)

  fireEvent.click(screen.getByRole('button', { name: 'A-12-03, Needs Action' }))
  expect(await screen.findByRole('dialog')).toBeTruthy()
  expect(
    screen.getByRole('link', { name: /Open Full Case/ }).getAttribute('href')
  ).toBe('/bookings/BK-9001')
})

test('a unit on another desk says whose desk holds it and opens nothing', async () => {
  // Snapshot with units from the server: A-03-01 held by Farah Izzati, no booking id.
  renderPage('sales-admin', {
    units: [
      {
        code: 'A-03-01',
        state: 'needs_action',
        bookingId: null,
        heldBy: 'Farah Izzati'
      }
    ]
  })
  fireEvent.click(
    await screen.findByRole('button', { name: 'A-03-01, Needs Action' })
  )
  expect(screen.getByText(/Held By Farah Izzati/)).toBeTruthy()
  expect(screen.queryByRole('dialog')).toBeNull()
})

test('a filter that lights nothing says so', async () => {
  renderPage('manager', { units: [] })
  fireEvent.click(await screen.findByRole('button', { name: /Release Review/ }))
  expect(screen.getByText('No Units Match This Filter.')).toBeTruthy()
})
```

Adjust `A-12-03, Needs Action` to BK-9001's actual state in the fixture (read it
from `unitsForSnapshot` in the test if needed) rather than editing data.

- [ ] **Step 2: Run it to see it fail**

Run:
`cd frontend && bunx vitest run src/pages/__tests__/SalesChartPage.test.tsx`
Expected: FAIL, page module missing.

- [ ] **Step 3: Implement.**

`quickViewRow.ts`:

```ts
import type { CaseSummary, EventKind, Snapshot, Task } from '@mortar/core'
import type { BookingRow } from './BookingsTable'

/** The row `CaseQuickView` shows for one booking, built the way `/bookings` builds it. */
export function quickViewRow(
  snapshot: Snapshot,
  cases: CaseSummary[],
  bookingId: string
): BookingRow | null {
  const booking = snapshot.bookings.find((b) => b.id === bookingId)
  const summary = cases.find((c) => c.bookingId === bookingId)
  if (!booking || !summary) return null
  const confirmedKinds = new Set<EventKind>(
    snapshot.events
      .filter((e) => e.bookingId === bookingId && e.status === 'confirmed')
      .map((e) => e.kind)
  )
  let openTask: Task | null = null
  for (const task of snapshot.tasks)
    if (
      task.bookingId === bookingId &&
      task.status === 'open' &&
      (!openTask || task.dueOn < openTask.dueOn)
    )
      openTask = task
  return { booking, summary, signals: null, confirmedKinds, openTask }
}
```

`SalesChartPage.tsx`, the composition (keep each block small; the readout and
the filter bar may live in the same file as local components):

```tsx
export function SalesChartPage() {
  const { snapshot, loading, error, refresh } = useSnapshot()
  const cases = useCases()
  const [params, setParams] = useSearchParams()
  const filter =
    CHART_FILTERS.find((f) => f.id === params.get('filter'))?.id ?? null
  const setFilter = (next: ChartFilter | null) =>
    setParams(
      (current) => {
        const copy = new URLSearchParams(current)
        if (next) copy.set('filter', next)
        else copy.delete('filter')
        return copy
      },
      { replace: true }
    )
  const [hovered, setHovered] = useState<ChartUnit | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [inspecting, setInspecting] = useState<string | null>(null)

  const units = useMemo(
    () => (snapshot ? unitsForSnapshot(snapshot, cases) : []),
    [snapshot, cases]
  )
  const counts = useMemo(
    () =>
      Object.fromEntries(
        CHART_FILTERS.map((f) => [f.id, litUnits(units, cases, f.id).size])
      ) as Record<ChartFilter, number>,
    [units, cases]
  )
  const lit = useMemo(
    () => (filter ? litUnits(units, cases, filter) : null),
    [units, cases, filter]
  )
  const legend = useMemo(() => legendCounts(units), [units])
  const outlook = useMemo(
    () =>
      snapshot
        ? forecast(datasetFor(snapshot), snapshot.meta.referenceDate, {
            seed: snapshot.meta.seed,
            model: snapshot.forecastModel
          })
        : null,
    [snapshot]
  )
  const settings = snapshot?.projectSettings ?? DEFAULT_PROJECT_SETTINGS
  const row =
    snapshot && inspecting ? quickViewRow(snapshot, cases, inspecting) : null
  const shown = hovered ?? units.find((u) => u.code === selected) ?? null

  const select = (unit: ChartUnit) => {
    setSelected(unit.code)
    if (unit.bookingId) setInspecting(unit.bookingId)
  }
  // ... render: header, figures, card with filters + legend + grid + readout, CaseQuickView
}
```

Render, in order:

1.  `PageHeaderCard tourTarget="sales-chart-header"`: `h1` "Sales Chart" (same
    classes as Forecast's), then
    `{settings.projectName} · {units.length.toLocaleString()} Units · Every unit by how far its booking has got towards a signed SPA.`
1.  `RefreshErrorBanner` / `EmptyState` / `Skeleton` exactly as Forecast does
    for `error` and `loading && !snapshot`.
1.  Figures, `grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4`:
    - `StatCard label="Active Unsigned" value={String(activeUnsigned(cases))} info="Your live bookings without a signed SPA."`
    - `StatCard label="Expected SPAs In 30 Days"` with
      `value={String(Math.round(outlook.expectedSignings))}`, `caption={`Range
      ${outlook.rangeLow}–${outlook.rangeHigh}`}`,
      `exact={outlook.expectedSignings.toFixed(1)}`; when
      `outlook.support === 'insufficient-history'`, value `—` and caption
      `Not Enough History Yet`.
    - `StatCard label="Needs Action" value={String(counts.needs_action)} onClick={() => setFilter(filter === 'needs_action' ? null : 'needs_action')}`
    - `StatCard label="Release Reviews" value={String(counts.release_review)} onClick={...release_review}`
    - A one-line `text-xs text-muted-foreground` note under the row: "These
      overlap: a booking can be unsigned, need action and be up for release
      review at once."
1.  A card (`rounded-md bg-card shadow-card p-4`, the Today rail's surface):
    - Filter bar: `role="group" aria-label="Filter units"`, one `Button` per
      `CHART_FILTERS` entry, `variant={on ? 'default' : 'outline'}`,
      `size="sm"`, `aria-pressed={on}`, label `{f.label} · {counts[f.id]}`, plus
      an `InfoTooltip text={f.info}` beside each.
    - Legend: `ul aria-label="Unit states"`, one `li` per `UNIT_STATES` entry: a
      `size-2.5 rounded-[2px]` swatch with `UNIT_FILL[state]`, the
      `STATE_LABELS[state]`, and the count in `tabular-nums`.
    - When `lit && lit.size === 0`: a `p role="status"` "No Units Match This
      Filter." above the grid.
    - `SalesChartGrid units lit selected onSelect={select} onHover={setHovered}`.
    - Readout strip, `aria-live="polite"`, min height 40px: when `shown` is
      null, "Hover Or Select A Unit To See Its State." Otherwise the unit code
      in `font-mono`, a swatch and `STATE_LABELS[shown.state]`, then:
      - available: "Available To Sell";
      - `bookingId` set: `Held By {heldBy}` and "Click To Open The Case";
      - `bookingId` null: `Held By {heldBy}'s Desk. Ask Them To Open It.`
1.  `CaseQuickView row={row} referenceDate={snapshot?.meta.referenceDate ?? ''} onClose={() => setInspecting(null)} onChanged={refresh}`.

Wiring:

- `App.tsx`: `<Route path="/sales-chart" element={<SalesChartPage />} />` after
  `/team`.
- `persona.tsx` `PERSONA_PAGES`, after the Team entry:
  `{ to: '/sales-chart', label: 'Sales Chart', group: 'primary', personas: ['sales-admin', 'loan-admin', 'legal-admin', 'manager'] }`.
- `AppSidebar.tsx`: `'/sales-chart': Building2` (import from `lucide-react`).
- `AppNav.tsx` `ROUTE_LABELS`: `'/sales-chart': 'Sales Chart'`.
- `tourSteps.ts`: insert as the second step for `manager` and for `sales-admin`:
  `{ label: 'Sales Chart', route: '/sales-chart', target: '[data-tour="sales-chart-header"]', caption: 'Sales Chart shows every unit by how far its booking has got. Click a unit to open its case.' }`.

- [ ] **Step 4: Run the page, tour and full frontend tests**

Run: `cd frontend && bunx vitest run` Expected: PASS, including
`tourAnchors.test.tsx` and any test that counts sidebar entries or tour steps
(update those counts deliberately).

- [ ] **Step 5: Look at it.** Start the app (`bun run dev` per README), sign in
      as Robert Khoo, open `/sales-chart`, and take screenshots at 1440 and 1280
      wide and at 390 (phone) with Playwright. Check: the grid fits or scrolls
      inside its card; filters light units; a click opens the sheet; Record An
      Update changes a cell after the sheet saves.

- [ ] **Step 6: Commit** `feat(sales-chart): add the Sales Chart page`.

### Task 4: Numbering In Settings

**Files:**

- Modify: `frontend/src/components/settings/ProjectSettingsCard.tsx`
- Test:
  `frontend/src/components/settings/__tests__/ProjectSettingsCard.test.tsx`

- [ ] **Step 1: Failing test:** render the card, find the control labelled
      "Floor And Unit Numbering", expect it to show "Skip Four (3A, 13A, 23A)"
      for the default settings, choose "Plain (04, 14, 24)", save, and expect
      `saveProjectSettings` to have been called with `numbering: 'plain'`.
- [ ] **Step 2: Run it; expect FAIL.**
- [ ] **Step 3: Implement** with the app's Radix `Select` (as Today's filters
      use it), wired through the card's existing `change('numbering', value)`.
      Under the control, the inventory preview line already reflects the
      numbering through `formatUnitRangeDescription`.
- [ ] **Step 4: Run the settings tests; expect PASS.**
- [ ] **Step 5: Commit** `feat(settings): choose floor and unit numbering`.

### Task 5: Docs, Verification And The Pull Request

- [ ] **Step 1:** `docs/DESIGN.md`: add `### Sales Chart` under Components
      (anatomy: figures row, filter bar, legend, grid cells 18px with 2px gaps
      and 3px radius, the tone table from Global Constraints, the marks,
      ghosting to `--muted`, the selected ring, the readout strip; rules: one
      tab stop, arrow keys, filters light only openable units). Note that on the
      chart Booked reads `info`, because the neutral grey is too close to
      Available's white at cell size.
- [ ] **Step 2:** `docs/PRD.md`: a new functional requirement for the Sales
      Chart with acceptance criteria copied from the spec's Acceptance list
      (items 1 to 5 and 7). `docs/PRODUCT.md`: a "Sales Chart" subsection under
      What Mortar Does and one line in the Manager and Sales Admin persona
      sections. `docs/agents/notes.md`: file map row for
      `frontend/src/components/sales-chart/` and the page.
- [ ] **Step 3:** `bun run check`, `bun run build`, `bun run format`; read the
      output.
- [ ] **Step 4:** Branch `feat/sales-chart-page` from the updated `main`; graph
      refresh (`graphify update .`) as the last commit; PR with screenshots,
      `Refs #93`; merge on green; confirm on the live site.
