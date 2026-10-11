# Floating Case Panel And Unit Island Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** The case quick view opens as a floating panel that rises from the
bottom on every page, and a unit click on the Sales Chart raises a floating
island with that unit's overview.

**Architecture:** The Radix Sheet gains a `floating` side; `CaseQuickView`
switches to it, so Bookings, Today and the Sales Chart all get the panel at
once. A pure `unitOverview.ts` turns a chart unit and its case row into the
island's facts, and `UnitIsland.tsx` draws them. The Sales Chart page shows the
island on selection and opens the panel from its Open Case button.

**Tech Stack:** React 19, Radix Dialog (via `radix-ui`), Tailwind 4 with
`tw-animate-css`, Vitest and Testing Library.

**Spec:** `docs/research/sales-chart/showhouse-model.md` (The Unit Island, The
Floating Case Panel, Design System Amendments).

## Global Constraints

- Title Case for every label and sentence-like UI string, as the app does today.
- Radius: 6 px (`rounded-md`) at most in the app shell.
- Panel: 16 px from the bottom and side edges, up to 720 px wide, centred, at
  most 85% of the window tall, scrolling inside; rises over `motion/slow` (250
  ms); fades only under reduced motion.
- Island: 16 px above the bottom edge, up to 560 px wide, full width less 32 px
  on a phone, glass like the Bookings bulk-action island (`bg-card/85`,
  `backdrop-blur-md`, `border-border`, `shadow-[var(--shadow-overlay)]`).
- The island is not a modal: no scrim, no focus trap, focus stays put.
- Run commands with `rtk` when it is installed (`rtk bun run test`).
- Finish with `bun run check`, then `bun run format`.

## Review Focus

1. **Esc with the panel open:** Esc closes the panel only; the island and the
   selection stay. Pinned in Task 3 Step 1
   (`keeps the island when Esc closes the case panel`).
2. **A unit on another desk:** the island names the holding desk and offers no
   Open Case. Pinned in Task 3 Step 1 (updated `names the desk holding a unit`).
3. **A refresh that recolours the selected unit:** the island stays open and
   shows the new state. Pinned in Task 3 Step 1 (updated `recolours a unit`).
4. **The last rows behind the island:** the page gains bottom space while the
   island shows, so no unit hides behind it. Pinned in Task 3 Step 1
   (`leaves room below the chart for the island`).
5. **A closed case:** a cancelled or lapsed booking reads "Booking Cancelled" or
   "Booking Lapsed" rather than a loan line. Pinned in Task 2 Step 1.

---

### Task 1: The Floating Case Panel

**Files:**

- Modify: `frontend/src/components/ui/sheet.tsx` (the `SIDE_STYLES` map and
  `SheetContent`)
- Modify: `frontend/src/components/bookings/CaseQuickView.tsx` (header comment,
  `SheetContent` props)
- Modify: `frontend/src/tour/tourSteps.ts:63` (copy)
- Modify: `frontend/src/components/chase/ChaseCard.tsx:6,72,99`,
  `frontend/src/pages/ChasePage.tsx:18,216,228,406`,
  `frontend/src/pages/BookingDetailPage.tsx:159`,
  `frontend/src/components/sales-chart/SalesChartBuilding.tsx:4`,
  `frontend/src/pages/SalesChartPage.tsx:5` (comments only)
- Modify: `docs/DESIGN.md`, `docs/PRODUCT.md:246-271`, `docs/PRD.md`,
  `docs/TRD.md:81,137`, `docs/README.md:208`, `docs/agents/notes.md:203`
- Test: `frontend/src/components/ui/__tests__/modal-scrim.test.tsx`

**Interfaces:**

- Produces: `SheetContent` accepts `side="floating"` and renders
  `data-side={side}` on the content element. `CaseQuickView` renders
  `<SheetContent side="floating">`; its props are unchanged.

- [ ] **Step 1: Write the failing test**

Append to `frontend/src/components/ui/__tests__/modal-scrim.test.tsx`, inside
the `describe`:

```tsx
it('floats a sheet above the bottom edge, centred and capped in width', () => {
  render(
    <Sheet open>
      <SheetContent side="floating" aria-describedby={undefined}>
        <SheetTitle>Floating</SheetTitle>
      </SheetContent>
    </Sheet>
  )
  const panel = screen.getByRole('dialog')
  expect(panel.getAttribute('data-side')).toBe('floating')
  for (const token of [
    'inset-x-4',
    'bottom-4',
    'mx-auto',
    'max-w-[720px]',
    'max-h-[85vh]',
    'rounded-md'
  ])
    expect(panel.className).toContain(token)
  // It slides only where motion is welcome; under reduced motion it just fades.
  expect(panel.className).toContain(
    'motion-safe:data-[state=open]:slide-in-from-bottom'
  )
  expect(panel.className).not.toMatch(
    /(^|\s)data-\[state=open\]:slide-in-from-bottom/
  )
})
```

and change the import line to:

```tsx
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `rtk bun run --cwd frontend test -- modal-scrim` Expected: FAIL. TypeScript
accepts the prop only after Step 3; at runtime `data-side` is `null`.

- [ ] **Step 3: Implement the floating side**

In `frontend/src/components/ui/sheet.tsx`, add the `floating` entry to
`SIDE_STYLES` and the `data-side` attribute:

```tsx
const SIDE_STYLES = {
  right:
    'inset-y-0 right-0 h-full w-[calc(100vw-2rem)] max-w-md border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
  left: 'inset-y-0 left-0 h-full w-[calc(100vw-2rem)] max-w-md border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
  bottom:
    'inset-x-0 bottom-0 max-h-[85vh] rounded-t-md border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
  // The case panel: a card floating 16px in from the bottom and sides, centred.
  // It rises where motion is welcome and only fades under reduced motion.
  floating:
    'inset-x-4 bottom-4 mx-auto max-h-[85vh] max-w-[720px] rounded-md border data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 motion-safe:data-[state=closed]:slide-out-to-bottom motion-safe:data-[state=open]:slide-in-from-bottom'
} as const
```

and in `SheetContent`, pass the side through:

```tsx
      <SheetPrimitive.Content
        data-side={side}
        className={cn(
```

Update the file's header comment to: "Sheet — a Dialog anchored to one edge of
the screen, or floating above the bottom edge, for looking into a row without
leaving the list."

- [ ] **Step 4: Run the test to verify it passes**

Run: `rtk bun run --cwd frontend test -- modal-scrim` Expected: PASS (3 tests).

- [ ] **Step 5: Move `CaseQuickView` to the floating side**

In `frontend/src/components/bookings/CaseQuickView.tsx`, change `<SheetContent`
to `<SheetContent side="floating"`, and its header comment's first line to:
"Case quick view — a floating panel that rises from the bottom, opened from the
ledger's row, its Waiting On cell, a Today card or a Sales Chart unit, so a desk
can see where a unit is, who holds it and what to do next without leaving the
screen (its filters, sort and page stay put)."

- [ ] **Step 6: Run the pages that open it**

Run:
`rtk bun run --cwd frontend test -- BookingsPage ChasePage SalesChartPage ManagerToday`
Expected: PASS. They find the panel by `role="dialog"`, which has not changed.

- [ ] **Step 7: Rename "side sheet" to "case panel" in copy, comments and docs**

- `frontend/src/tour/tourSteps.ts:63`: "in its side sheet" becomes "in its case
  panel".
- The comments listed under **Files** say "case panel" where they say "side
  sheet".
- `docs/PRODUCT.md`: the heading "The Shared Side Sheet" becomes "The Shared
  Case Panel", and "side sheet" becomes "case panel" in its paragraphs (lines
  246-271).
- `docs/PRD.md`, `docs/TRD.md`, `docs/README.md`, `docs/agents/notes.md`: each
  "side sheet" becomes "case panel" ("Quick View Side Sheet" becomes "Quick View
  Case Panel").
- `docs/DESIGN.md`: add this entry directly after the `### Dialog` section:

```markdown
### Floating Panel

- **Purpose:** The case quick view: one booking's state, who holds it and its
  next step, opened over Bookings, Today and the Sales Chart without leaving
  them.
- **Anatomy:** a card 16px in from the bottom and side edges, up to 720px wide
  and centred, at most 85% of the window tall and scrolling inside. Popover
  fill, 1px `--border`, 6px radius (`--radius-md`), `Elevation/Overlay`. The
  close button sits top right, as on Dialog.
- **Behaviour:** modal. The shared scrim dims the page; Esc, a scrim click or
  the close button closes it, and focus returns to what opened it.
- **Motion:** rises from below the window over `motion/slow` and sinks on close;
  under reduced motion it fades instead.
- **Built on:** the Sheet primitive's `floating` side, so the focus trap and
  scrim are the Dialog's.
```

Run: `rtk grep -rn "side sheet" docs frontend/src` and expect no hits outside
test names and this plan's own folder.

- [ ] **Step 8: Commit**

```bash
rtk git add frontend/src docs
rtk git commit -m "feat(case): open the case quick view as a floating panel

Claude-Session: https://claude.ai/code/session_01W7s74co9WkbrhgkSJgxrZZ"
```

---

### Task 2: The Unit Overview

**Files:**

- Create: `frontend/src/components/sales-chart/unitOverview.ts`
- Test: `frontend/src/components/sales-chart/__tests__/unitOverview.test.ts`

**Interfaces:**

- Consumes: `ChartUnit` and `UnitState` from `@mortar/core` (`code`, `block`,
  `floorLabel`, `unitLabel`, `state`, `bookingId`, `heldBy`); `BookingRow` from
  `@/components/bookings/BookingsTable` (`booking`, `summary`);
  `quickViewRow(snapshot, cases, bookingId): BookingRow | null`.
- Produces:

```ts
export type UnitOverview =
  | {
      kind: 'case'
      code: string
      location: string
      state: UnitState
      age: string
      stalled: boolean
      buyer: string
      bookingId: string
      price: string
      position: string
      nextStep: string | null
    }
  | {
      kind: 'held'
      code: string
      location: string
      state: UnitState
      heldBy: string
    }
  | { kind: 'available'; code: string; location: string; state: 'available' }

export function unitLocation(unit: ChartUnit): string
export function loanPosition(summary: CaseSummary): string
export function unitOverview(
  unit: ChartUnit,
  row: BookingRow | null
): UnitOverview
```

- [ ] **Step 1: Write the failing test**

Create `frontend/src/components/sales-chart/__tests__/unitOverview.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { summarizeCases, type CaseSummary, type ChartUnit } from '@mortar/core'
import { buildSnapshot } from '@/components/bookings/__tests__/snapshotFixture'
import { quickViewRow } from '@/components/bookings/quickViewRow'
import { formatRm } from '@/components/case/format'
import { unitsForSnapshot } from '@/components/sales-chart/salesChart'
import {
  loanPosition,
  unitLocation,
  unitOverview
} from '@/components/sales-chart/unitOverview'

const SNAP = buildSnapshot()
const CASES = summarizeCases(SNAP, SNAP.meta.referenceDate)
const UNITS = unitsForSnapshot(SNAP, CASES)
const unit = (code: string) => UNITS.find((u) => u.code === code)!
const summary = (patch: Partial<CaseSummary>): CaseSummary => ({
  ...CASES[0]!,
  ...patch
})

describe('unitLocation', () => {
  it('names the block, floor and unit in words', () => {
    expect(unitLocation(unit('A-12-03'))).toBe('Block A · Floor 12 · Unit 03')
  })

  it('leaves the block out when the project has none', () => {
    expect(unitLocation({ ...unit('A-12-03'), block: '' })).toBe(
      'Floor 12 · Unit 03'
    )
  })
})

describe('loanPosition', () => {
  it('reads a closed case as closed, whatever its loans say', () => {
    expect(loanPosition(summary({ stage: 'cancelled' }))).toBe(
      'Booking Cancelled'
    )
    expect(loanPosition(summary({ stage: 'lapsed' }))).toBe('Booking Lapsed')
  })

  it('reads a signed SPA first', () => {
    expect(loanPosition(summary({ spaSigned: true }))).toBe('SPA Signed')
  })

  it('names the approving bank and whether the SPA appointment is set', () => {
    const approved = [
      { id: 'A1', bank: 'Crestline Bank', status: 'approved' as const }
    ]
    expect(
      loanPosition(
        summary({
          spaSigned: false,
          applications: approved,
          daysSinceSpaSet: null
        })
      )
    ).toBe('Loan Approved By Crestline Bank · No SPA Appointment Yet')
    expect(
      loanPosition(
        summary({
          spaSigned: false,
          applications: approved,
          daysSinceSpaSet: 3
        })
      )
    ).toBe('Loan Approved By Crestline Bank · SPA Appointment Set')
  })

  it('names the bank still deciding, the latest one first', () => {
    const apps = [
      { id: 'A1', bank: 'Malayan Trust Bank', status: 'rejected' as const },
      { id: 'A2', bank: 'Crestline Bank', status: 'submitted' as const }
    ]
    expect(
      loanPosition(summary({ spaSigned: false, applications: apps }))
    ).toBe('Waiting On Crestline Bank To Decide')
    const pending = [
      { id: 'A1', bank: 'Crestline Bank', status: 'documents_pending' as const }
    ]
    expect(
      loanPosition(summary({ spaSigned: false, applications: pending }))
    ).toBe('Crestline Bank Waiting On Documents')
  })

  it('says when no loan is live or none was submitted', () => {
    const declined = [
      { id: 'A1', bank: 'Malayan Trust Bank', status: 'rejected' as const }
    ]
    expect(
      loanPosition(summary({ spaSigned: false, applications: declined }))
    ).toBe('No Live Loan Application')
    expect(loanPosition(summary({ spaSigned: false, applications: [] }))).toBe(
      'No Loan Submitted Yet'
    )
  })
})

describe('unitOverview', () => {
  it('gives a case on the viewer’s desk its buyer, price, loan line and next step', () => {
    const row = quickViewRow(SNAP, CASES, 'BK-9001')!
    const overview = unitOverview(unit('A-12-03'), row)
    expect(overview.kind).toBe('case')
    if (overview.kind !== 'case') return
    expect(overview.code).toBe('A-12-03')
    expect(overview.location).toBe('Block A · Floor 12 · Unit 03')
    expect(overview.buyer).toBe(row.booking.buyer.name)
    expect(overview.bookingId).toBe('BK-9001')
    expect(overview.price).toBe(formatRm(row.booking.priceRm))
    expect(overview.age).toMatch(/^\d+ Days? Old$/)
    expect(overview.position).toBe(loanPosition(row.summary))
    expect(overview.nextStep === null || / · /.test(overview.nextStep)).toBe(
      true
    )
  })

  it('names the desk holding a unit the viewer cannot open', () => {
    const held: ChartUnit = {
      ...unit('C-03-01'),
      state: 'needs_action',
      bookingId: null,
      heldBy: 'Farah Izzati'
    }
    expect(unitOverview(held, null)).toEqual({
      kind: 'held',
      code: 'C-03-01',
      location: 'Block C · Floor 03 · Unit 01',
      state: 'needs_action',
      heldBy: 'Farah Izzati'
    })
  })

  it('says an available unit is not booked', () => {
    const free: ChartUnit = {
      ...unit('C-03-01'),
      state: 'available',
      bookingId: null,
      heldBy: null
    }
    expect(unitOverview(free, null)).toEqual({
      kind: 'available',
      code: 'C-03-01',
      location: 'Block C · Floor 03 · Unit 01',
      state: 'available'
    })
  })
})
```

If `C-03-01`'s floor label in the fixture is not `03`, read it with
`unit('C-03-01').floorLabel` and use that value in the two expected strings.

- [ ] **Step 2: Run the test to verify it fails**

Run: `rtk bun run --cwd frontend test -- unitOverview` Expected: FAIL with
"Failed to resolve import ... unitOverview".

- [ ] **Step 3: Implement**

Create `frontend/src/components/sales-chart/unitOverview.ts`:

```ts
/**
 * What the Sales Chart's unit island says about the selected unit, as plain
 * strings: where it is, its state, and for a case on the viewer's desk the
 * buyer, price, loan line and next step a sales manager asks for first. Pure,
 * so it is tested without rendering.
 */
import {
  ballInCourt,
  type CaseSummary,
  type ChartUnit,
  type UnitState
} from '@mortar/core'
import type { BookingRow } from '@/components/bookings/BookingsTable'
import { formatRm } from '@/components/case/format'
import { nextStepFor } from '@/components/case/nextStep'
import { OWNER_ROLE_LABELS } from '@/components/case/OwnerBadge'
import { NEXT_ACTION_LABELS, ownerName } from '@/components/chase/chase'

export type UnitOverview =
  | {
      kind: 'case'
      code: string
      location: string
      state: UnitState
      age: string
      stalled: boolean
      buyer: string
      bookingId: string
      price: string
      position: string
      nextStep: string | null
    }
  | {
      kind: 'held'
      code: string
      location: string
      state: UnitState
      heldBy: string
    }
  | { kind: 'available'; code: string; location: string; state: 'available' }

/** `Block A · Floor 12 · Unit 03`, without the block when the project has none. */
export function unitLocation(unit: ChartUnit): string {
  const place = `Floor ${unit.floorLabel} · Unit ${unit.unitLabel}`
  return unit.block ? `Block ${unit.block} · ${place}` : place
}

/** The loan and SPA position in one line, from the furthest fact on the log. */
export function loanPosition(summary: CaseSummary): string {
  if (summary.stage === 'cancelled') return 'Booking Cancelled'
  if (summary.stage === 'lapsed') return 'Booking Lapsed'
  if (summary.spaSigned) return 'SPA Signed'
  const approved = summary.applications.find((a) => a.status === 'approved')
  if (approved)
    return `Loan Approved By ${approved.bank} · ${summary.daysSinceSpaSet === null ? 'No SPA Appointment Yet' : 'SPA Appointment Set'}`
  const live = [...summary.applications]
    .reverse()
    .find((a) => a.status === 'submitted' || a.status === 'documents_pending')
  if (live)
    return live.status === 'documents_pending'
      ? `${live.bank} Waiting On Documents`
      : `Waiting On ${live.bank} To Decide`
  return summary.applications.length > 0
    ? 'No Live Loan Application'
    : 'No Loan Submitted Yet'
}

export function unitOverview(
  unit: ChartUnit,
  row: BookingRow | null
): UnitOverview {
  const location = unitLocation(unit)
  if (unit.state === 'available')
    return { kind: 'available', code: unit.code, location, state: 'available' }
  const state = unit.state
  if (!row)
    return {
      kind: 'held',
      code: unit.code,
      location,
      state,
      heldBy: unit.heldBy ?? 'Another'
    }
  const { booking, summary } = row
  const next = nextStepFor(booking, summary, NEXT_ACTION_LABELS)
  const step = next.defaultStep
  const days = summary.bookingAgeDays
  return {
    kind: 'case',
    code: unit.code,
    location,
    state,
    age: `${days} ${days === 1 ? 'Day' : 'Days'} Old`,
    stalled: ballInCourt(summary).stalled,
    buyer: booking.buyer.name,
    bookingId: booking.id,
    price: formatRm(booking.priceRm),
    position: loanPosition(summary),
    nextStep: next.waitingOnNobody
      ? null
      : `${step.label} · ${OWNER_ROLE_LABELS[step.ownerRole]} · ${ownerName(step.ownerRole, booking)}`
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `rtk bun run --cwd frontend test -- unitOverview` Expected: PASS (10
tests).

- [ ] **Step 5: Commit**

```bash
rtk git add frontend/src/components/sales-chart/unitOverview.ts frontend/src/components/sales-chart/__tests__/unitOverview.test.ts
rtk git commit -m "feat(sales-chart): describe the selected unit for its island

Claude-Session: https://claude.ai/code/session_01W7s74co9WkbrhgkSJgxrZZ"
```

---

### Task 3: The Unit Island On The Sales Chart

**Files:**

- Create: `frontend/src/components/sales-chart/UnitIsland.tsx`
- Modify: `frontend/src/pages/SalesChartPage.tsx` (`select`, the island, Esc,
  the spacer, the readout copy, the header comment)
- Modify: `frontend/src/pages/__tests__/SalesChartPage.test.tsx`
- Modify: `docs/DESIGN.md` (Look decision, Sales Chart anatomy and rules, a new
  Unit Island entry), `docs/PRD.md` (the Sales Chart acceptance line at
  `docs/PRD.md:925`), `docs/agents/notes.md:44`

**Interfaces:**

- Consumes: `unitOverview(unit, row)`, `UnitOverview` (Task 2); `quickViewRow`;
  `<SheetContent side="floating">` in `CaseQuickView` (Task 1).
- Produces:
  `UnitIsland({ overview, onOpenCase, onClose }: { overview: UnitOverview; onOpenCase: () => void; onClose: () => void })`,
  a `<section aria-label="Selected Unit">`.

- [ ] **Step 1: Write the failing tests**

In `frontend/src/pages/__tests__/SalesChartPage.test.tsx`:

Replace the end of
`shows the figures, lights a filter, and opens a case from its unit` (from
`fireEvent.click(screen.getByRole('button', { name: label9001() }))` to the end
of the test) with:

```tsx
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
```

Replace the body of
`names the desk holding a unit the viewer cannot open, and opens nothing` after
its `renderPage(...)` call with:

```tsx
fireEvent.click(
  await screen.findByRole('button', { name: 'C-03-01, Needs Action' })
)
const island = screen.getByRole('region', { name: 'Selected Unit' })
expect(within(island).getByText('Held By Farah Izzati’s Desk')).toBeTruthy()
expect(within(island).queryByRole('button', { name: 'Open Case' })).toBeNull()
expect(screen.queryByRole('dialog')).toBeNull()
```

Replace
`fireEvent.click(screen.getByRole('button', { name: 'A-12-03, Needs Action' }))`
and the `const sheet = ...; expect(sheet)...` lines in
`recolours a unit once a save refreshes the snapshot` with:

```tsx
fireEvent.click(screen.getByRole('button', { name: 'A-12-03, Needs Action' }))
fireEvent.click(
  within(screen.getByRole('region', { name: 'Selected Unit' })).getByRole(
    'button',
    { name: 'Open Case' }
  )
)
expect(await screen.findByRole('dialog')).toBeTruthy()
```

and append at the end of that test:

```tsx
// The island outlives the save and reads the new state.
expect(
  within(
    screen.getByRole('region', { name: 'Selected Unit', hidden: true })
  ).getByText('SPA Signed')
).toBeTruthy()
```

Add these tests at the end of the `describe`:

```tsx
it('swaps the island to the next unit clicked and closes it on Esc', async () => {
  renderPage('manager', { units: [] })
  fireEvent.click(
    await screen.findByRole('button', { name: 'A-03-01, Available' })
  )
  expect(
    within(screen.getByRole('region', { name: 'Selected Unit' })).getByText(
      'A-03-01'
    )
  ).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'A-03-02, Available' }))
  const island = screen.getByRole('region', { name: 'Selected Unit' })
  expect(within(island).getByText('A-03-02')).toBeTruthy()
  expect(within(island).getByText('Available · Not Booked')).toBeTruthy()
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(screen.queryByRole('region', { name: 'Selected Unit' })).toBeNull()
})

it('closes the island from its close button', async () => {
  renderPage('manager', { units: [] })
  fireEvent.click(
    await screen.findByRole('button', { name: 'A-03-01, Available' })
  )
  fireEvent.click(
    within(screen.getByRole('region', { name: 'Selected Unit' })).getByRole(
      'button',
      { name: 'Close' }
    )
  )
  expect(screen.queryByRole('region', { name: 'Selected Unit' })).toBeNull()
})

it('keeps the island when Esc closes the case panel', async () => {
  renderPage('manager')
  fireEvent.click(await screen.findByRole('button', { name: label9001() }))
  fireEvent.click(
    within(screen.getByRole('region', { name: 'Selected Unit' })).getByRole(
      'button',
      { name: 'Open Case' }
    )
  )
  const panel = await screen.findByRole('dialog')
  fireEvent.keyDown(panel, { key: 'Escape' })
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(screen.getByRole('region', { name: 'Selected Unit' })).toBeTruthy()
})

it('leaves room below the chart for the island', async () => {
  renderPage('manager', { units: [] })
  fireEvent.click(
    await screen.findByRole('button', { name: 'A-03-01, Available' })
  )
  expect(document.querySelector('[data-island-spacer]')).toBeTruthy()
})
```

and add `waitFor` to the Testing Library import:

```tsx
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `rtk bun run --cwd frontend test -- SalesChartPage` Expected: FAIL. No
region named "Selected Unit" exists yet.

- [ ] **Step 3: Write the island**

Create `frontend/src/components/sales-chart/UnitIsland.tsx`:

```tsx
/**
 * The Sales Chart's unit island: the selected unit's overview, floating at the
 * bottom centre while the chart stays live behind it. Not a modal: nothing
 * dims, focus stays where it was, and clicking another unit swaps it. Glass,
 * like the Bookings bulk-action island.
 */
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { STATE_LABELS } from './salesChart'
import type { UnitOverview } from './unitOverview'
import { UNIT_FILL } from './unitTone'

/** A clause after the state, behind a middot the screen reader skips. */
function Aside({
  children,
  className
}: {
  children: string
  className?: string
}) {
  return (
    <>
      <span aria-hidden="true" className="text-muted-foreground">
        ·
      </span>
      <span className={className ?? 'text-muted-foreground'}>{children}</span>
    </>
  )
}

function Fact({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd className="truncate text-sm text-foreground">{children}</dd>
    </div>
  )
}

export function UnitIsland({
  overview,
  onOpenCase,
  onClose
}: {
  overview: UnitOverview
  onOpenCase: () => void
  onClose: () => void
}) {
  return (
    <section
      aria-label="Selected Unit"
      className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-[560px] rounded-md border border-border bg-card/85 p-4 shadow-[var(--shadow-overlay)] backdrop-blur-md duration-[var(--motion-base)] animate-in fade-in-0 motion-safe:slide-in-from-bottom-4"
    >
      <div className="flex items-start gap-3 pr-8">
        <div className="min-w-0">
          <p className="font-mono text-base font-semibold text-foreground">
            {overview.code}
          </p>
          <p className="text-sm text-muted-foreground">{overview.location}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-sm text-muted-foreground outline-none transition-colors duration-[var(--motion-fast)] hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-4" aria-hidden="true" />
      </button>

      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground">
        <span
          aria-hidden="true"
          className={cn('size-2.5 rounded-[2px]', UNIT_FILL[overview.state])}
        />
        <span>
          {overview.kind === 'available'
            ? 'Available · Not Booked'
            : STATE_LABELS[overview.state]}
        </span>
        {overview.kind === 'case' ? <Aside>{overview.age}</Aside> : null}
        {overview.kind === 'case' && overview.stalled ? (
          <Aside className="text-status-danger-fg">Stalled</Aside>
        ) : null}
        {overview.kind === 'held' ? (
          <Aside>{`Held By ${overview.heldBy}’s Desk`}</Aside>
        ) : null}
      </p>

      {overview.kind === 'case' ? (
        <>
          <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
            <Fact term="Buyer">
              {overview.buyer} · {overview.bookingId}
            </Fact>
            <Fact term="Price">{overview.price}</Fact>
            <Fact term="Loan And SPA">{overview.position}</Fact>
            <Fact term="Next Step">
              {overview.nextStep ?? 'Nobody Owes A Move'}
            </Fact>
          </dl>
          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={onOpenCase}>
              Open Case
            </Button>
          </div>
        </>
      ) : null}
    </section>
  )
}
```

- [ ] **Step 4: Wire the island into the page**

In `frontend/src/pages/SalesChartPage.tsx`:

1. Import the island and the overview:

```tsx
import { UnitIsland } from '@/components/sales-chart/UnitIsland'
import { unitOverview } from '@/components/sales-chart/unitOverview'
```

2. Replace `select` so a click selects without opening the panel:

```tsx
const select = useCallback((unit: ChartUnit) => setSelected(unit.code), [])
```

3. Below `const row = ...`, derive the island's facts:

```tsx
const selectedUnit = units.find((u) => u.code === selected) ?? null
const overview = useMemo(
  () =>
    selectedUnit
      ? unitOverview(
          selectedUnit,
          snapshot && selectedUnit.bookingId
            ? quickViewRow(snapshot, cases, selectedUnit.bookingId)
            : null
        )
      : null,
  [selectedUnit, snapshot, cases]
)
```

4. Close the island on Esc, but only while the case panel is shut, so Esc on the
   panel closes the panel alone:

```tsx
useEffect(() => {
  if (!selected || inspecting) return
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') setSelected(null)
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}, [selected, inspecting])
```

5. Just before `<CaseQuickView`, render the spacer and the island:

```tsx
{
  overview ? (
    <>
      {/* Room below the chart, so the island never covers its last rows. */}
      <div data-island-spacer aria-hidden="true" className="h-48" />
      <UnitIsland
        overview={overview}
        onOpenCase={() =>
          selectedUnit?.bookingId && setInspecting(selectedUnit.bookingId)
        }
        onClose={() => setSelected(null)}
      />
    </>
  ) : null
}
```

6. In `Readout`, change `Click To Open The Case` to `Click To See Its Overview`.

7. In the header comment, the sentence about the side sheet becomes: "Clicking a
   unit raises the unit island with its overview; Open Case brings up the same
   case panel Today and Bookings use."

- [ ] **Step 5: Run the tests to verify they pass**

Run: `rtk bun run --cwd frontend test -- SalesChartPage unitOverview` Expected:
PASS.

- [ ] **Step 6: Document the island**

In `docs/DESIGN.md`:

- In the Decisions table's Look row, replace "The one glass surface is the
  Bookings bulk-action island, which floats at the bottom centre while rows are
  selected, with a translucent card fill and a backdrop blur." with "The glass
  surfaces are the two floating islands: the Bookings bulk-action island while
  rows are selected, and the Sales Chart's unit island while a unit is selected.
  Both float at the bottom centre with a translucent card fill and a backdrop
  blur."
- In the Sales Chart anatomy, add item 5:

```markdown
5. Unit island: see [Unit Island](#unit-island).
```

- In the Sales Chart rules, add: "Clicking a unit selects it and raises the unit
  island. Open Case on the island opens the [Floating Panel](#floating-panel)."
- Add this entry after the Building View subsection:

```markdown
#### Unit Island

- **Purpose:** The selected unit's overview, while the chart stays live.
- **Anatomy:** fixed 16px above the bottom edge, up to 560px wide and full width
  less 32px on a phone; `--card` at 85% with a backdrop blur, 1px `--border`,
  6px radius, `Elevation/Overlay`, 16px padding. The unit code in Geist Mono
  semibold, its location in words below, a close button top right; the state's
  swatch and word; for a case on the viewer's desk the Buyer, Price, Loan And
  SPA and Next Step facts in two columns (one on a phone) and Open Case.
- **States:** a case on the viewer's desk shows its facts and Open Case; a unit
  on another desk reads "Held By {name}'s Desk" with no Open Case; an available
  unit reads "Available · Not Booked".
- **Behaviour:** not a modal. Nothing dims and focus stays put. Clicking another
  unit swaps it; Esc or the close button clears the selection. Esc on an open
  case panel closes the panel alone. The page gains bottom space while it shows,
  so it never covers the chart's last rows.
- **Motion:** rises and fades in over `motion/base`; only fades under reduced
  motion.
```

In `docs/PRD.md:925`, "open the same side sheet on click" reads "raise the unit
island on click, whose Open Case opens the same case panel". In
`docs/agents/notes.md:44`, add `UnitIsland.tsx` and `unitOverview.ts` to the
Sales Chart row.

- [ ] **Step 7: Run the full check**

Run: `rtk bun run check` Expected: PASS (lint, types, every workspace's tests).

- [ ] **Step 8: Commit**

```bash
rtk git add frontend/src docs
rtk git commit -m "feat(sales-chart): raise a unit island with the selected unit's overview

Claude-Session: https://claude.ai/code/session_01W7s74co9WkbrhgkSJgxrZZ"
```

- [ ] **Step 9: Check it in a real browser**

Build and serve the app as plan 2 did (production build behind the API server on
a local Postgres), sign in as Robert Khoo and Tan Mei Ling, and screenshot at
1440px and 390px: the island for a case, for another desk's unit and for an
available unit; the floating panel over the Sales Chart, Bookings and Today; and
dark mode. Look for the island covering the help button or the chart's last row,
and for the panel's close button clearing its header.
