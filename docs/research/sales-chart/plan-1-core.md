# Sales Chart Plan 1: Core And Server

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans
> to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Give `@mortar/core` a project layout with Malaysian numbering, unique
demo units, unit states, and a scoped `snapshot.units`, so the Sales Chart page
(plan 2) only has to draw.

**Architecture:** The layout is the existing `ProjectSettings` (blocks, floor
range, units per floor) plus a new `numbering` field. A new pure module
`packages/core/src/units.ts` turns settings into unit codes and bookings plus
case summaries into unit states. The server attaches the stored settings to the
snapshot; `scopeSnapshot` adds the held units, hiding booking IDs the viewer may
not open. The client rebuilds the full layout from settings, so the snapshot
carries only held units.

**Tech Stack:** TypeScript, Bun workspaces, Vitest (core, frontend), Bun test
(server).

**Spec:** [README.md](README.md)

## Global Constraints

- Every number on screen stays simulated; no claim of real inventory.
- Generated data must stay identical apart from `unit` and `project`: never add
  or remove a random draw in `generateDataset`.
- Story fixture units (`A-12-03`, `B-08-05`, `A-05-11`, `B-15-08`, `A-18-07`,
  `A-23A-02`, `B-21-03A`, `A-28-01`) never change; their message text and the
  Jev cache depend on them.
- Unit states, in order: available, signed, release_review, needs_action,
  loan_approved, booked.
- Release Review thresholds: buyer withdrew; or two or more rejections with no
  live application; or 30 days old with no live application. Live means
  submitted, documents pending or approved.
- `bun run check`, then `bun run format`, before every commit that ends a task.
- Commit messages: `type(scope): what changed`, lowercase, imperative, ending
  with the session trailer.

## Review Focus

1.  A stored project-settings record from before this change (no `numbering`)
    must still load, as plain numbering, and the chart must not crash on it.
1.  An imported booking written with plain numbering (`A-24-02`) under skip-four
    settings must land on the same slot as `A-23A-02`.
1.  A booking on a unit outside the layout, or in another project, must not
    break `heldUnits`; it is simply not on the chart.
1.  The Jev cache must stay fresh: renaming the project and moving units must
    not mark any cached `next_action` or `signals` answer stale.
1.  A Sales Admin's scoped snapshot must hold every held unit, but booking IDs
    only for her own bookings.

---

### Task 1: Numbering And Layout

**Files:**

- Create: `packages/core/src/units.ts`
- Create: `packages/core/src/units.test.ts`
- Modify: `packages/core/src/projectSettings.ts` (type, defaults, normalize)
- Modify: `packages/core/src/sim/names.ts:103` (`PROJECT_NAME`)
- Modify: `packages/core/src/index.ts` (export `./units`)

**Interfaces:**

- Produces:
  - `type UnitNumbering = 'plain' | 'skip-four'` (in `projectSettings.ts`)
  - `ProjectSettings.numbering?: UnitNumbering`
  - `numberLabel(n: number, numbering?: UnitNumbering): string`
  - `labelNumber(label: string): number | null`
  - `unitCode(block: string, floor: number, unit: number, numbering?: UnitNumbering): string`
  - `parseUnitCode(code: string): UnitPosition | null`
  - `interface UnitPosition { block: string; floor: number; unit: number }`
  - `interface ProjectUnit extends UnitPosition { code: string; floorLabel: string; unitLabel: string }`
  - `projectBlocks(settings: ProjectSettings): string[]`
  - `projectUnits(settings: ProjectSettings): ProjectUnit[]`
  - `MAX_PROJECT_UNITS = 10_000`

- [ ] **Step 1: Write the failing tests** in `packages/core/src/units.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import {
  DEFAULT_PROJECT_SETTINGS,
  normalizeProjectSettings
} from './projectSettings'
import {
  labelNumber,
  numberLabel,
  parseUnitCode,
  projectUnits,
  unitCode
} from './units'

describe('numbering', () => {
  test('skip-four renames every number containing a 4', () => {
    expect(
      [3, 4, 12, 13, 14, 24, 28].map((n) => numberLabel(n, 'skip-four'))
    ).toEqual(['03', '03A', '12', '13', '13A', '23A', '28'])
  })

  test('plain numbering only pads', () => {
    expect(numberLabel(4)).toBe('04')
    expect(numberLabel(24, 'plain')).toBe('24')
  })

  test('labels read back to their numbers', () => {
    expect(labelNumber('23A')).toBe(24)
    expect(labelNumber('03a')).toBe(4)
    expect(labelNumber('07')).toBe(7)
    expect(labelNumber('7B')).toBeNull()
    expect(labelNumber('')).toBeNull()
  })

  test('unit codes match the story fixtures', () => {
    expect(unitCode('A', 24, 2, 'skip-four')).toBe('A-23A-02')
    expect(unitCode('B', 21, 4, 'skip-four')).toBe('B-21-03A')
    expect(unitCode('', 5, 11, 'plain')).toBe('05-11')
  })

  test('codes parse to positions, plain and skip-four alike', () => {
    expect(parseUnitCode('A-23A-02')).toEqual({
      block: 'A',
      floor: 24,
      unit: 2
    })
    expect(parseUnitCode('a-24-02')).toEqual({ block: 'A', floor: 24, unit: 2 })
    expect(parseUnitCode('B-21-03A')).toEqual({
      block: 'B',
      floor: 21,
      unit: 4
    })
    expect(parseUnitCode('05-11')).toEqual({ block: '', floor: 5, unit: 11 })
    expect(parseUnitCode('TOWER-1-12-03')).toEqual({
      block: 'TOWER-1',
      floor: 12,
      unit: 3
    })
    expect(parseUnitCode('A-12')).toBeNull()
    expect(parseUnitCode('garbage')).toBeNull()
  })
})

describe('the demo layout', () => {
  const units = projectUnits(DEFAULT_PROJECT_SETTINGS)

  test('is Aster Heights: three blocks, floors 3 to 28, twelve units a floor', () => {
    expect(DEFAULT_PROJECT_SETTINGS.projectName).toBe('Aster Heights')
    expect(units).toHaveLength(3 * 26 * 12)
    expect(units[0]).toEqual({
      code: 'A-03-01',
      block: 'A',
      floor: 3,
      unit: 1,
      floorLabel: '03',
      unitLabel: '01'
    })
    expect(units.at(-1)?.code).toBe('C-28-12')
  })

  test('holds every story fixture unit, once each', () => {
    const codes = new Set(units.map((u) => u.code))
    expect(codes.size).toBe(units.length)
    for (const code of [
      'A-12-03',
      'B-08-05',
      'A-05-11',
      'B-15-08',
      'A-18-07',
      'A-23A-02',
      'B-21-03A',
      'A-28-01'
    ])
      expect(codes.has(code)).toBe(true)
  })

  test('never shows a plain 4 in a floor or unit label', () => {
    expect(units.some((u) => /(^|-)\d?4(-|$)/.test(u.code))).toBe(false)
  })

  test('is empty past the inventory cap', () => {
    expect(
      projectUnits({
        ...DEFAULT_PROJECT_SETTINGS,
        blocks: ['A'],
        minFloor: 0,
        maxFloor: 200,
        unitsPerFloor: 100
      })
    ).toEqual([])
  })
})

describe('normalizeProjectSettings', () => {
  test('keeps skip-four and reads a missing numbering as plain', () => {
    expect(normalizeProjectSettings(DEFAULT_PROJECT_SETTINGS)?.numbering).toBe(
      'skip-four'
    )
    const { numbering: _dropped, ...legacy } = DEFAULT_PROJECT_SETTINGS
    expect(normalizeProjectSettings(legacy)?.numbering).toBe('plain')
    expect(
      normalizeProjectSettings({ ...legacy, numbering: 'roman' })?.numbering
    ).toBe('plain')
  })
})
```

- [ ] **Step 2: Run them to see them fail**

Run: `cd packages/core && bunx vitest run src/units.test.ts` Expected: FAIL,
`Cannot find module './units'`.

- [ ] **Step 3: Implement.** In `projectSettings.ts`, add the type and field,
      change the defaults, and normalize the field:

```ts
/** How floors and units are numbered. `skip-four` writes 4 as 03A, 14 as 13A, 24 as 23A. */
export type UnitNumbering = 'plain' | 'skip-four'
```

Add to `ProjectSettings`, after `unitsPerFloor`:

```ts
  /** Missing on records saved before numbering existed: read as plain. */
  numbering?: UnitNumbering
```

Change `DEFAULT_PROJECT_SETTINGS` to:

```ts
export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  projectName: PROJECT_NAME,
  blockPrefix: 'A',
  blocks: ['A', 'B', 'C'],
  minFloor: 3,
  maxFloor: 28,
  unitsPerFloor: 12,
  numbering: 'skip-four',
  defaultLawFirm: 'Teh & Partners',
  defaultPriceRm: 480_000,
  models: DEFAULT_UNIT_MODELS,
  defaultModelId: 'model-a'
}
```

In `normalizeProjectSettings`'s returned object, after `unitsPerFloor`:

```ts
    numbering: v.numbering === 'skip-four' ? 'skip-four' : 'plain',
```

In `sim/names.ts`, set `export const PROJECT_NAME = 'Aster Heights'`.

Create `packages/core/src/units.ts`:

```ts
/**
 * The project's units: how floors and units are numbered, and every unit code
 * the configured layout holds. Unit states for the Sales Chart live here too
 * (Task 3).
 */
import type { ProjectSettings, UnitNumbering } from './projectSettings'

/** Matches the import screen's cap: a layout above it is refused, not drawn. */
export const MAX_PROJECT_UNITS = 10_000

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * A floor or unit number as staff write it. Under `skip-four`, a number that
 * contains a 4 takes the number below with an A: 4 → 03A, 14 → 13A, 24 → 23A.
 */
export function numberLabel(
  n: number,
  numbering: UnitNumbering = 'plain'
): string {
  return numbering === 'skip-four' && String(n).includes('4')
    ? `${pad(n - 1)}A`
    : pad(n)
}

/** A label read back to its number: `23A` → 24, `07` → 7; `null` when it is not a label. */
export function labelNumber(label: string): number | null {
  const match = /^(\d{1,3})(A?)$/.exec(label.trim().toUpperCase())
  if (!match) return null
  return Number.parseInt(match[1]!, 10) + (match[2] ? 1 : 0)
}

export function unitCode(
  block: string,
  floor: number,
  unit: number,
  numbering: UnitNumbering = 'plain'
): string {
  const tail = `${numberLabel(floor, numbering)}-${numberLabel(unit, numbering)}`
  return block ? `${block}-${tail}` : tail
}

export interface UnitPosition {
  block: string
  floor: number
  unit: number
}

/**
 * Block, floor and unit numbers from a code, whichever numbering wrote it, so
 * `A-24-02` and `A-23A-02` are the same unit. The block is upper-cased.
 */
export function parseUnitCode(code: string): UnitPosition | null {
  const parts = code.trim().toUpperCase().split('-')
  if (parts.length < 2) return null
  const unit = labelNumber(parts.pop()!)
  const floor = labelNumber(parts.pop()!)
  if (unit === null || floor === null) return null
  return { block: parts.join('-'), floor, unit }
}

export interface ProjectUnit extends UnitPosition {
  code: string
  floorLabel: string
  unitLabel: string
}

/** The configured blocks, falling back to the legacy single prefix, then to no block. */
export function projectBlocks(settings: ProjectSettings): string[] {
  if (settings.blocks?.length) return settings.blocks
  return settings.blockPrefix ? [settings.blockPrefix] : ['']
}

/** Every unit in the layout, block by block, lowest floor first, unit 1 first. Empty past the cap. */
export function projectUnits(settings: ProjectSettings): ProjectUnit[] {
  const blocks = projectBlocks(settings)
  const numbering = settings.numbering ?? 'plain'
  const size =
    blocks.length *
    (settings.maxFloor - settings.minFloor + 1) *
    settings.unitsPerFloor
  if (size > MAX_PROJECT_UNITS) return []
  const units: ProjectUnit[] = []
  for (const block of blocks)
    for (let floor = settings.minFloor; floor <= settings.maxFloor; floor += 1)
      for (let unit = 1; unit <= settings.unitsPerFloor; unit += 1)
        units.push({
          code: unitCode(block, floor, unit, numbering),
          block,
          floor,
          unit,
          floorLabel: numberLabel(floor, numbering),
          unitLabel: numberLabel(unit, numbering)
        })
  return units
}
```

Add `export * from './units'` to `packages/core/src/index.ts` after
`./projectSettings`.

- [ ] **Step 4: Run the tests to see them pass**

Run: `cd packages/core && bunx vitest run src/units.test.ts` Expected: PASS.

- [ ] **Step 5: Run the whole suite and fix what the new defaults break**

Run: `bun run check` from the repo root. Expect failures in tests that assumed
the old default (block A, floors 1 to 35, 12 units, `Residensi Cahaya Muda`),
for example `frontend/src/components/import/__tests__/readSheetFile.test.ts:38`
and any range description such as `A-01-01 to A-35-12 (420 units)`. Update each
expectation to the new default; do not change behaviour to keep an old string.

- [ ] **Step 6: Commit**

```bash
git add packages/core frontend server
git commit -m "feat(core): describe the project layout with Malaysian numbering"
```

### Task 2: Unique Demo Units

**Files:**

- Modify: `packages/core/src/units.ts` (add `uniqueUnits`)
- Modify: `packages/core/src/sim/generate.ts:66-69` (`drawUnit`) and the end of
  `generateDataset`
- Test: `packages/core/src/units.test.ts`, `packages/core/src/sim.test.ts`

**Interfaces:**

- Consumes: `projectUnits`, `unitCode`, `DEFAULT_PROJECT_SETTINGS`.
- Produces:
  `uniqueUnits(bookings: Booking[], settings: ProjectSettings, reserved?: Iterable<string>): Booking[]`

- [ ] **Step 1: Record the dataset before the change.** Write `$SCRATCH/dump.ts`
      (the session scratchpad) and run it from the repo root with
      `bun $SCRATCH/dump.ts > $SCRATCH/before.json`:

```ts
import {
  generate,
  DEFAULT_SEED,
  REFERENCE_DATE
} from '/home/user/Documents/Mortar/packages/core/src/index'
const d = generate({
  seed: DEFAULT_SEED,
  referenceDate: REFERENCE_DATE,
  bookings: 140
})
console.log(
  JSON.stringify({
    ...d,
    bookings: d.bookings.map(({ unit: _u, project: _p, ...rest }) => rest)
  })
)
```

- [ ] **Step 2: Write the failing tests.** Append to `units.test.ts`:

```ts
import type { Booking } from './types'
import { uniqueUnits } from './units'

const tiny = {
  ...DEFAULT_PROJECT_SETTINGS,
  blocks: ['A'],
  minFloor: 1,
  maxFloor: 1,
  unitsPerFloor: 3,
  numbering: 'plain' as const
}
const at = (id: string, unit: string) => ({ id, unit }) as Booking

describe('uniqueUnits', () => {
  test('moves a duplicate to the next free unit, leaving the first in place', () => {
    const out = uniqueUnits([at('x', 'A-01-01'), at('y', 'A-01-01')], tiny)
    expect(out.map((b) => b.unit)).toEqual(['A-01-01', 'A-01-02'])
  })

  test('skips reserved units and wraps at the end of the layout', () => {
    const out = uniqueUnits([at('x', 'A-01-03'), at('y', 'A-01-03')], tiny, [
      'A-01-01'
    ])
    expect(out.map((b) => b.unit)).toEqual(['A-01-03', 'A-01-02'])
  })

  test('returns unique input untouched, by reference', () => {
    const input = [at('x', 'A-01-01'), at('y', 'A-01-02')]
    const out = uniqueUnits(input, tiny)
    expect(out[0]).toBe(input[0])
    expect(out[1]).toBe(input[1])
  })

  test('leaves the duplicate when the layout is full', () => {
    const full = [
      at('a', 'A-01-01'),
      at('b', 'A-01-02'),
      at('c', 'A-01-03'),
      at('d', 'A-01-01')
    ]
    expect(uniqueUnits(full, tiny).map((b) => b.unit)).toEqual([
      'A-01-01',
      'A-01-02',
      'A-01-03',
      'A-01-01'
    ])
  })
})
```

Append to `packages/core/src/sim.test.ts`:

```ts
import { DEFAULT_PROJECT_SETTINGS, projectUnits, STORIES } from './index'

describe('the canonical demo units', () => {
  const data = generate({
    seed: DEFAULT_SEED,
    referenceDate: REFERENCE_DATE,
    bookings: 140
  })
  const layout = new Set(
    projectUnits(DEFAULT_PROJECT_SETTINGS).map((u) => u.code)
  )
  const all = [...data.bookings, ...STORIES.map((s) => s.booking)]

  test('no two bookings share a unit, story fixtures included', () => {
    expect(new Set(all.map((b) => b.unit)).size).toBe(all.length)
  })

  test('every unit sits in the Aster Heights layout', () => {
    for (const b of all) expect(layout.has(b.unit)).toBe(true)
    for (const b of all) expect(b.project).toBe('Aster Heights')
  })
})
```

Use the file's existing imports for `generate`, `DEFAULT_SEED` and
`REFERENCE_DATE`; add only what is missing.

- [ ] **Step 3: Run them to see them fail**

Run: `cd packages/core && bunx vitest run src/units.test.ts src/sim.test.ts`
Expected: FAIL (`uniqueUnits` missing; duplicates and out-of-layout codes).

- [ ] **Step 4: Implement.** Append to `units.ts`:

```ts
import type { Booking } from './types'

/**
 * Gives every booking its own unit. A booking whose unit is already taken, by
 * an earlier booking or a reserved code, moves to the next free unit in layout
 * order, wrapping at the end. Nothing is mutated; untouched bookings keep
 * their reference. A full layout leaves the duplicate rather than invent one.
 */
export function uniqueUnits(
  bookings: Booking[],
  settings: ProjectSettings,
  reserved: Iterable<string> = []
): Booking[] {
  const codes = projectUnits(settings).map((u) => u.code)
  const index = new Map(codes.map((code, i) => [code, i]))
  const taken = new Set(reserved)
  return bookings.map((booking) => {
    if (!taken.has(booking.unit)) {
      taken.add(booking.unit)
      return booking
    }
    const start = (index.get(booking.unit) ?? -1) + 1
    for (let step = 0; step < codes.length; step += 1) {
      const code = codes[(start + step) % codes.length]!
      if (!taken.has(code)) {
        taken.add(code)
        return { ...booking, unit: code }
      }
    }
    return booking
  })
}
```

Move the `import type { Booking }` to the top of the file with the other
imports.

In `generate.ts`, replace `drawUnit` so it draws from the demo layout with the
same three random calls as before (one pick, two ints):

```ts
/** Same three draws as ever (block, floor, unit), now read from the demo layout. */
function drawUnit(rng: Rng): string {
  const { minFloor, maxFloor, unitsPerFloor, numbering } =
    DEFAULT_PROJECT_SETTINGS
  const block = rng.pick(projectBlocks(DEFAULT_PROJECT_SETTINGS))
  return unitCode(
    block,
    rng.int(minFloor, maxFloor),
    rng.int(1, unitsPerFloor),
    numbering
  )
}
```

At the end of `generateDataset`, replace
`return { bookings, applications, events }` with:

```ts
// Random draws collide; give each booking its own unit without touching the
// random stream, and keep the story fixtures' units free for them.
const reserved = STORIES.map((story) => story.booking.unit)
return {
  bookings: uniqueUnits(bookings, DEFAULT_PROJECT_SETTINGS, reserved),
  applications,
  events
}
```

Imports to add in `generate.ts`: `DEFAULT_PROJECT_SETTINGS` from
`'../projectSettings'`, `projectBlocks, unitCode, uniqueUnits` from
`'../units'`, `STORIES` from `'../fixtures/stories'`.

- [ ] **Step 5: Run the tests to see them pass**

Run: `cd packages/core && bunx vitest run` Expected: PASS, apart from
expectations that pinned an old unit code; update those to the new codes.

- [ ] **Step 6: Prove the rest of the dataset is unchanged**

Run:
`bun $SCRATCH/dump.ts > $SCRATCH/after.json && cmp $SCRATCH/before.json $SCRATCH/after.json && echo SAME`
Expected: `SAME`. If it differs, a random draw was added or removed; fix it.

- [ ] **Step 7: Commit**

```bash
git add packages/core
git commit -m "fix(core): give every demo booking its own unit"
```

### Task 3: Unit States And Release Review

**Files:**

- Modify: `packages/core/src/units.ts`
- Test: `packages/core/src/units.test.ts`

**Interfaces:**

- Consumes: `CaseSummary` (`types.ts:176`), `projectUnits`, `parseUnitCode`.
- Produces:
  - `type UnitState = 'available' | 'signed' | 'release_review' | 'needs_action' | 'loan_approved' | 'booked'`
  - `releaseReview(summary: CaseSummary): boolean`
  - `awaitingSpaAppointment(summary: CaseSummary): boolean`
  - `needsAction(summary: CaseSummary): boolean`
  - `unitState(summary: CaseSummary): Exclude<UnitState, 'available'>`
  - `interface HeldUnit { code: string; state: Exclude<UnitState, 'available'>; bookingId: string | null; heldBy: string }`
  - `heldUnits(settings: ProjectSettings, bookings: Booking[], summaries: CaseSummary[]): HeldUnit[]`
  - `interface ChartUnit extends ProjectUnit { state: UnitState; bookingId: string | null; heldBy: string | null }`
  - `chartUnits(settings: ProjectSettings, held: HeldUnit[]): ChartUnit[]`

- [ ] **Step 1: Write the failing tests.** Append to `units.test.ts`:

```ts
import type { CaseSummary } from './types'
import {
  awaitingSpaAppointment,
  chartUnits,
  heldUnits,
  needsAction,
  releaseReview,
  unitState
} from './units'

const summary = (patch: Partial<CaseSummary> = {}): CaseSummary => ({
  bookingId: 'BK-1',
  stage: 'loan_applied',
  spaSigned: false,
  unknown: false,
  bookingAgeDays: 10,
  daysSinceEvidence: 1,
  daysSinceLoIssued: null,
  daysSinceSpaSet: null,
  applications: [{ id: 'LA-1', bank: 'Apex Bank', status: 'submitted' }],
  outstandingDocuments: [],
  buyerWithdrew: false,
  risk: {
    level: 'low',
    debtServiceRatio: 0.3,
    marginOfFinancing: 0.9,
    reasons: []
  },
  stallReasons: [],
  openTasks: 0,
  ...patch
})

describe('releaseReview', () => {
  test('flags a withdrawn buyer', () =>
    expect(releaseReview(summary({ buyerWithdrew: true }))).toBe(true))
  test('flags two rejections with nothing live', () =>
    expect(
      releaseReview(
        summary({
          applications: [
            { id: 'a', bank: 'X', status: 'rejected' },
            { id: 'b', bank: 'Y', status: 'rejected' }
          ]
        })
      )
    ).toBe(true))
  test('flags 30 days with no live application', () =>
    expect(
      releaseReview(summary({ bookingAgeDays: 30, applications: [] }))
    ).toBe(true))
  test('spares a booking with a live or approved application', () => {
    expect(releaseReview(summary({ bookingAgeDays: 60 }))).toBe(false)
    expect(
      releaseReview(
        summary({
          applications: [
            { id: 'a', bank: 'X', status: 'rejected' },
            { id: 'b', bank: 'Y', status: 'rejected' },
            { id: 'c', bank: 'Z', status: 'approved' }
          ]
        })
      )
    ).toBe(false)
  })
  test('spares one rejection inside 30 days', () =>
    expect(
      releaseReview(
        summary({ applications: [{ id: 'a', bank: 'X', status: 'rejected' }] })
      )
    ).toBe(false))
  test('never flags a signed, cancelled or lapsed booking', () => {
    expect(
      releaseReview(
        summary({ buyerWithdrew: true, spaSigned: true, stage: 'spa_signed' })
      )
    ).toBe(false)
    expect(
      releaseReview(summary({ buyerWithdrew: true, stage: 'cancelled' }))
    ).toBe(false)
    expect(
      releaseReview(summary({ buyerWithdrew: true, stage: 'lapsed' }))
    ).toBe(false)
  })
})

describe('unitState', () => {
  test('follows the spec order', () => {
    expect(
      unitState(
        summary({ spaSigned: true, stage: 'spa_signed', stallReasons: ['x'] })
      )
    ).toBe('signed')
    expect(
      unitState(summary({ buyerWithdrew: true, stallReasons: ['x'] }))
    ).toBe('release_review')
    expect(
      unitState(summary({ stallReasons: ['No Update For 12 Days'] }))
    ).toBe('needs_action')
    expect(
      unitState(summary({ stage: 'lo_issued', daysSinceLoIssued: 3 }))
    ).toBe('loan_approved')
    expect(unitState(summary())).toBe('booked')
  })

  test('awaitingSpaAppointment matches the Legal desk split', () => {
    expect(
      awaitingSpaAppointment(
        summary({ stage: 'lo_issued', daysSinceLoIssued: 3 })
      )
    ).toBe(true)
    expect(
      awaitingSpaAppointment(
        summary({
          stage: 'lo_issued',
          daysSinceLoIssued: 3,
          daysSinceSpaSet: 1
        })
      )
    ).toBe(false)
    expect(
      awaitingSpaAppointment(
        summary({
          stage: 'lo_issued',
          daysSinceLoIssued: 3,
          buyerWithdrew: true
        })
      )
    ).toBe(false)
    expect(
      awaitingSpaAppointment(
        summary({ stage: 'lo_issued', daysSinceLoIssued: null })
      )
    ).toBe(false)
  })

  test('needsAction is a live, unsigned booking with stall reasons', () => {
    expect(needsAction(summary({ stallReasons: ['x'] }))).toBe(true)
    expect(needsAction(summary({ stallReasons: ['x'], spaSigned: true }))).toBe(
      false
    )
    expect(
      needsAction(summary({ stallReasons: ['x'], stage: 'cancelled' }))
    ).toBe(false)
  })
})

describe('heldUnits and chartUnits', () => {
  const settings = {
    ...DEFAULT_PROJECT_SETTINGS,
    blocks: ['A'],
    minFloor: 24,
    maxFloor: 24,
    unitsPerFloor: 2
  }
  const booking = (
    id: string,
    unit: string,
    bookingDate = '2026-09-01',
    project = 'Aster Heights'
  ) => ({ id, unit, bookingDate, project, salesOwner: 'Nurul Aina' }) as Booking

  test('a live booking holds its unit; a cancelled one frees it', () => {
    const held = heldUnits(
      settings,
      [booking('BK-1', 'A-23A-01'), booking('BK-2', 'A-23A-02')],
      [
        summary({ bookingId: 'BK-1' }),
        summary({ bookingId: 'BK-2', stage: 'cancelled' })
      ]
    )
    expect(held).toEqual([
      {
        code: 'A-23A-01',
        state: 'booked',
        bookingId: 'BK-1',
        heldBy: 'Nurul Aina'
      }
    ])
  })

  test('plain-numbered codes land on their skip-four slot', () => {
    const held = heldUnits(
      settings,
      [booking('BK-1', 'A-24-02')],
      [summary({ bookingId: 'BK-1' })]
    )
    expect(held[0]?.code).toBe('A-23A-02')
  })

  test('the latest live booking wins a shared unit', () => {
    const held = heldUnits(
      settings,
      [
        booking('BK-1', 'A-23A-01', '2026-08-01'),
        booking('BK-2', 'A-23A-01', '2026-09-01')
      ],
      [summary({ bookingId: 'BK-1' }), summary({ bookingId: 'BK-2' })]
    )
    expect(held.map((h) => h.bookingId)).toEqual(['BK-2'])
  })

  test('other projects, unknown units and unsummarised bookings are ignored', () => {
    const held = heldUnits(
      settings,
      [
        booking('BK-1', 'A-23A-01', '2026-09-01', 'Elsewhere'),
        booking('BK-2', 'Z-99-99'),
        booking('BK-3', 'A-23A-02')
      ],
      [summary({ bookingId: 'BK-1' }), summary({ bookingId: 'BK-2' })]
    )
    expect(held).toEqual([])
  })

  test('chartUnits fills the rest of the layout as available', () => {
    const units = chartUnits(settings, [
      {
        code: 'A-23A-02',
        state: 'signed',
        bookingId: null,
        heldBy: 'Farah Izzati'
      }
    ])
    expect(units.map((u) => [u.code, u.state, u.heldBy])).toEqual([
      ['A-23A-01', 'available', null],
      ['A-23A-02', 'signed', 'Farah Izzati']
    ])
  })
})
```

Check the `risk` literal against `FinancingRisk` in `types.ts` and fix field
names if they differ; the test only needs a valid value.

- [ ] **Step 2: Run them to see them fail**

Run: `cd packages/core && bunx vitest run src/units.test.ts` Expected: FAIL,
missing exports.

- [ ] **Step 3: Implement.** Append to `units.ts` (move imports to the top):

```ts
import type { ApplicationStatus, Booking, CaseSummary } from './types'

export type UnitState =
  | 'available'
  | 'signed'
  | 'release_review'
  | 'needs_action'
  | 'loan_approved'
  | 'booked'

/** Release Review triggers, after the 48-Hour Clean Exit idea. */
export const RELEASE_REVIEW_AGE_DAYS = 30
export const RELEASE_REVIEW_REJECTIONS = 2

const LIVE_APPLICATIONS: ReadonlySet<ApplicationStatus> = new Set([
  'submitted',
  'documents_pending',
  'approved'
])

const terminal = (s: CaseSummary) =>
  s.stage === 'cancelled' || s.stage === 'lapsed'
const liveUnsigned = (s: CaseSummary) => !terminal(s) && !s.spaSigned

/**
 * Advisory: a live, unsigned booking whose recovery paths look spent, so an
 * authorised person should decide whether to cancel and re-release the unit.
 * Mortar never cancels.
 */
export function releaseReview(summary: CaseSummary): boolean {
  if (!liveUnsigned(summary)) return false
  if (summary.buyerWithdrew) return true
  if (summary.applications.some((a) => LIVE_APPLICATIONS.has(a.status)))
    return false
  const rejections = summary.applications.filter(
    (a) => a.status === 'rejected'
  ).length
  return (
    rejections >= RELEASE_REVIEW_REJECTIONS ||
    summary.bookingAgeDays >= RELEASE_REVIEW_AGE_DAYS
  )
}

/** A live, unsigned booking the stall rule flagged: the same rule that fills Today. */
export function needsAction(summary: CaseSummary): boolean {
  return liveUnsigned(summary) && summary.stallReasons.length > 0
}

const loanApproved = (s: CaseSummary) =>
  liveUnsigned(s) &&
  s.stage === 'lo_issued' &&
  s.daysSinceLoIssued !== null &&
  !s.buyerWithdrew

/** Loan through, no SPA appointment on record: the Legal desk's No Appointment Yet rows. */
export function awaitingSpaAppointment(summary: CaseSummary): boolean {
  return loanApproved(summary) && summary.daysSinceSpaSet === null
}

/** The state of a unit a booking holds, first match wins. */
export function unitState(
  summary: CaseSummary
): Exclude<UnitState, 'available'> {
  if (summary.spaSigned) return 'signed'
  if (releaseReview(summary)) return 'release_review'
  if (needsAction(summary)) return 'needs_action'
  if (loanApproved(summary)) return 'loan_approved'
  return 'booked'
}

/** A unit some booking holds. Every other unit in the layout is available. */
export interface HeldUnit {
  /** The layout's code for the unit, whichever numbering the booking used. */
  code: string
  state: Exclude<UnitState, 'available'>
  /** `null` on a scoped snapshot when the viewer may not open the booking. */
  bookingId: string | null
  /** The holding booking's sales owner: whose desk to ask. */
  heldBy: string
}

/** Case-blind position key: `parseUnitCode` upper-cases blocks, settings may not. */
const slot = (p: UnitPosition) =>
  `${p.block.toUpperCase()}|${p.floor}|${p.unit}`

/**
 * The units bookings hold in this project. A cancelled or lapsed booking frees
 * its unit; when two live bookings share one, the later booking holds it.
 * Bookings in other projects, on units outside the layout, or without a
 * summary are not on the chart.
 */
export function heldUnits(
  settings: ProjectSettings,
  bookings: Booking[],
  summaries: CaseSummary[]
): HeldUnit[] {
  const byBooking = new Map(summaries.map((s) => [s.bookingId, s]))
  const layout = new Map(projectUnits(settings).map((u) => [slot(u), u]))
  const project = settings.projectName.trim().toUpperCase()
  const holders = new Map<
    string,
    { booking: Booking; summary: CaseSummary; code: string }
  >()
  for (const booking of bookings) {
    if (booking.project.trim().toUpperCase() !== project) continue
    const summary = byBooking.get(booking.id)
    const position = parseUnitCode(booking.unit)
    const unit = position ? layout.get(slot(position)) : undefined
    if (!summary || !unit || terminal(summary)) continue
    const key = slot(unit)
    const seen = holders.get(key)
    const later =
      !seen ||
      booking.bookingDate > seen.booking.bookingDate ||
      (booking.bookingDate === seen.booking.bookingDate &&
        booking.id > seen.booking.id)
    if (later) holders.set(key, { booking, summary, code: unit.code })
  }
  return [...layout.values()].flatMap((unit) => {
    const held = holders.get(slot(unit))
    if (!held) return []
    return [
      {
        code: held.code,
        state: unitState(held.summary),
        bookingId: held.booking.id,
        heldBy: held.booking.salesOwner
      }
    ]
  })
}

export interface ChartUnit extends ProjectUnit {
  state: UnitState
  bookingId: string | null
  heldBy: string | null
}

/** The whole layout in order, each unit with its state: held units as given, the rest available. */
export function chartUnits(
  settings: ProjectSettings,
  held: HeldUnit[]
): ChartUnit[] {
  const byCode = new Map(held.map((h) => [h.code, h]))
  return projectUnits(settings).map((unit) => {
    const h = byCode.get(unit.code)
    return h
      ? { ...unit, state: h.state, bookingId: h.bookingId, heldBy: h.heldBy }
      : { ...unit, state: 'available', bookingId: null, heldBy: null }
  })
}
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `cd packages/core && bunx vitest run src/units.test.ts` Expected: PASS.

- [ ] **Step 5: Check the canonical distribution.** Run from the repo root:

```bash
bun -e "import {generate,STORIES,summarizeCases,heldUnits,DEFAULT_PROJECT_SETTINGS,DEFAULT_SEED,REFERENCE_DATE} from './packages/core/src/index'; const d=generate({seed:DEFAULT_SEED,referenceDate:REFERENCE_DATE,bookings:140}); const b=[...d.bookings,...STORIES.map(s=>s.booking)]; const data={bookings:b,applications:[...d.applications,...STORIES.flatMap(s=>s.applications)],events:[...d.events,...STORIES.flatMap(s=>s.events)],tasks:[]}; const h=heldUnits(DEFAULT_PROJECT_SETTINGS,b,summarizeCases(data,REFERENCE_DATE)); const c={}; for(const u of h)c[u.state]=(c[u.state]??0)+1; console.log(h.length,c)"
```

Expected: about 100 to 148 held units, with signed, needs_action and booked all
present and release_review under a fifth of the live units. Record the counts in
the PR body. If release_review dominates, stop and report rather than tune the
thresholds silently.

- [ ] **Step 6: Commit**

```bash
git add packages/core
git commit -m "feat(core): derive each unit's sales chart state"
```

### Task 4: Scoped Units In The Snapshot

**Files:**

- Modify: `packages/core/src/types.ts:380-389` (`Snapshot`)
- Modify: `packages/core/src/profiles.ts:92-119` (`scopeSnapshot`)
- Test: `packages/core/src/profiles.test.ts`

**Interfaces:**

- Consumes: `heldUnits`, `DEFAULT_PROJECT_SETTINGS`.
- Produces: `Snapshot.projectSettings?: ProjectSettings`,
  `Snapshot.units?: HeldUnit[]` (set by `scopeSnapshot`).

- [ ] **Step 1: Write the failing test.** Add to `profiles.test.ts`, reusing the
      file's existing snapshot builder (see the test at line 60):

```ts
test('scoped snapshots carry every held unit but only the viewer’s booking ids', () => {
  const snapshot = /* the two-booking snapshot the file already builds, one per sales admin */
  const sales = scopeSnapshot(snapshot, profileFor('sales-nurul-aina')!)
  const manager = scopeSnapshot(snapshot, profileFor('manager')!)
  expect(manager.units?.length).toBe(sales.units?.length)
  expect(manager.units?.every((u) => u.bookingId !== null)).toBe(true)
  const own = new Set(sales.bookings.map((b) => b.id))
  for (const unit of sales.units ?? []) expect(unit.bookingId === null || own.has(unit.bookingId)).toBe(true)
  expect(sales.units?.some((u) => u.bookingId === null)).toBe(true)
})
```

Make the fixture bookings use project `Aster Heights` and units inside the
default layout (for example `A-03-01` and `A-03-02`), or the test proves
nothing.

- [ ] **Step 2: Run it to see it fail**

Run: `cd packages/core && bunx vitest run src/profiles.test.ts` Expected: FAIL,
`units` is undefined.

- [ ] **Step 3: Implement.** In `types.ts`, import the types with
      `import type { ProjectSettings } from './projectSettings'` and
      `import type { HeldUnit } from './units'`, then add to `Snapshot`:

```ts
  /** The stored project layout; absent means the default demo layout. */
  projectSettings?: ProjectSettings
  /** Units bookings hold, set by `scopeSnapshot`: whole project, booking ids only where the viewer may open them. */
  units?: HeldUnit[]
```

In `scopeSnapshot`, after `bookingIds` is built, compute and return the units:

```ts
const settings = snapshot.projectSettings ?? DEFAULT_PROJECT_SETTINGS
const units = heldUnits(settings, snapshot.bookings, context.summaries).map(
  (unit) =>
    unit.bookingId && !bookingIds.has(unit.bookingId)
      ? { ...unit, bookingId: null }
      : unit
)
```

and add `units` to the returned object. Import `DEFAULT_PROJECT_SETTINGS` from
`'./projectSettings'` and `heldUnits` from `'./units'`.

- [ ] **Step 4: Run the core suite**

Run: `cd packages/core && bunx vitest run` Expected: PASS. If an existing test
deep-compares a scoped snapshot, add `units` to its expectation rather than
dropping the field.

- [ ] **Step 5: Commit**

```bash
git add packages/core
git commit -m "feat(core): put the project's held units in every scoped snapshot"
```

### Task 5: Server Settings And Demo Reset

**Files:**

- Modify: `server/db/index.ts:385` (`assembleSnapshot`)
- Modify: `server/db/reset.ts:47` (`addDemoData`)
- Test: `server/src/__tests__/app.test.ts`,
  `server/db/__tests__/integration.test.ts`

**Interfaces:**

- Consumes: `normalizeProjectSettings`, `DEFAULT_PROJECT_SETTINGS`,
  `scopeSnapshot` (already called at `server/src/app.ts:1034`).
- Produces: `/api/snapshot` responses with `projectSettings` and `units`.

- [ ] **Step 1: Write the failing tests.**
  - In `app.test.ts`, next to the existing `/api/snapshot` tests, add one that
    signs in as `sales-nurul-aina`, requests `/api/snapshot`, and asserts that
    `body.units` is an array and that every non-null `bookingId` is among
    `body.bookings` ids. Follow the file's existing sign-in helper.
  - In `integration.test.ts`, add: after `addDemoData`,
    `db.getProjectSettings()` equals `DEFAULT_PROJECT_SETTINGS`, and
    `(await db.snapshot()).projectSettings` equals it too.

- [ ] **Step 2: Run them to see them fail**

Run: `cd server && bun --env-file=../.env test src/__tests__/app.test.ts`
Expected: the new test FAILS. The integration test needs a database; if the
local `.env` has none, it is skipped, and CI runs it.

- [ ] **Step 3: Implement.**
  - In `assembleSnapshot`, read the stored settings with the same query
    `getProjectSettings` uses, normalize it, and set
    `projectSettings: normalizeProjectSettings(stored) ?? DEFAULT_PROJECT_SETTINGS`
    on the returned snapshot. `setProjectSettings` is a write, so the snapshot
    cache already forgets on save (`server/db/index.ts:856`).
  - In `addDemoData`, inside its transaction, upsert `DEFAULT_PROJECT_SETTINGS`
    into `meta` under `project_settings`, with the same SQL `setProjectSettings`
    uses, so a demo reset restores the layout the demo bookings sit in. Leave
    `deleteDemoData` alone: deleting demo data keeps a staff member's own
    settings.

- [ ] **Step 4: Prove the Jev cache stayed fresh.** With a local database, run
      `bun run --cwd server db:reset` (or the reset script `server/db/cli.ts`
      exposes), then:

```bash
bun -e "import {createDb} from './server/db/index'; const db=createDb(process.env.DATABASE_URL); const s=await db.snapshot(); console.log('stale next', s.nextActions.filter(a=>a.stale).length, 'stale signals', s.signals.filter(v=>v.stale).length); process.exit(0)"
```

Compare with the same command on `main` before the change. Expected: equal
counts. If no database is available, say so in the PR body instead of claiming
it.

- [ ] **Step 5: Run the server suite**

Run:
`cd server && bun --env-file=../.env test src && bun --env-file=../.env test db`
Expected: PASS (or database tests skipped locally).

- [ ] **Step 6: Commit**

```bash
git add server
git commit -m "feat(server): send the project layout and reset it with the demo data"
```

### Task 6: Shared Inventory In Add Bookings

**Files:**

- Modify: `frontend/src/lib/projectSettings.ts:13-90`
- Test: the existing tests for this file and for `DirectTableImport`

**Interfaces:**

- Consumes: `projectUnits`, `parseUnitCode`, `unitCode`, `projectBlocks`,
  `MAX_PROJECT_UNITS` from `@mortar/core`.
- Produces: unchanged exports (`generateProjectInventoryUnits`, `isUnitInRange`,
  `formatUnitRangeDescription`, `projectInventorySize`, `MAX_PROJECT_UNITS`),
  now numbering-aware.

- [ ] **Step 1: Write the failing tests** (in the file's existing test, or a new
      `frontend/src/lib/__tests__/projectSettings.test.ts`):

```ts
import { describe, expect, test } from 'vitest'
import { DEFAULT_PROJECT_SETTINGS } from '@mortar/core'
import {
  formatUnitRangeDescription,
  generateProjectInventoryUnits,
  isUnitInRange
} from '@/lib/projectSettings'

describe('skip-four inventory', () => {
  test('lists 3A, 13A and 23A floors and 03A units', () => {
    const units = generateProjectInventoryUnits(DEFAULT_PROJECT_SETTINGS)
    expect(units).toContain('A-23A-02')
    expect(units).toContain('B-21-03A')
    expect(units).not.toContain('A-24-02')
  })

  test('accepts the configured format and explains the plain one', () => {
    expect(isUnitInRange('B-21-03A', DEFAULT_PROJECT_SETTINGS)).toEqual({
      inRange: true
    })
    expect(isUnitInRange('A-24-02', DEFAULT_PROJECT_SETTINGS).inRange).toBe(
      false
    )
    expect(isUnitInRange('D-05-01', DEFAULT_PROJECT_SETTINGS).inRange).toBe(
      false
    )
  })

  test('describes the range with skip-four labels', () => {
    expect(formatUnitRangeDescription(DEFAULT_PROJECT_SETTINGS)).toBe(
      'A-03-01 to C-28-12 (936 units)'
    )
  })
})
```

- [ ] **Step 2: Run them to see them fail**

Run: `cd frontend && bunx vitest run src/lib` Expected: FAIL.

- [ ] **Step 3: Implement.** Rewrite the three helpers on top of core, keeping
      their signatures:

```ts
import {
  MAX_PROJECT_UNITS,
  parseUnitCode,
  projectBlocks,
  projectUnits,
  unitCode
} from '@mortar/core'
export { MAX_PROJECT_UNITS }

export function generateProjectInventoryUnits(
  settings: ProjectSettings
): string[] {
  return projectUnits(settings).map((unit) => unit.code)
}

export function formatUnitRangeDescription(settings: ProjectSettings): string {
  const blocks = projectBlocks(settings)
  const numbering = settings.numbering ?? 'plain'
  const first = unitCode(blocks[0] ?? '', settings.minFloor, 1, numbering)
  const last = unitCode(
    blocks[blocks.length - 1] ?? '',
    settings.maxFloor,
    settings.unitsPerFloor,
    numbering
  )
  return `${first} to ${last} (${projectInventorySize(settings).toLocaleString()} units)`
}

export function isUnitInRange(
  unit: string,
  settings: ProjectSettings
): { inRange: boolean; reason?: string } {
  const normalized = unit.trim().toUpperCase()
  if (!normalized) return { inRange: false, reason: 'Choose A Unit' }
  const blocks = projectBlocks(settings)
  const position = parseUnitCode(normalized)
  if (!position)
    return {
      inRange: false,
      reason: 'Enter A Unit Number In The Configured Format'
    }
  const block = blocks.find((b) => b.toUpperCase() === position.block)
  if (block === undefined)
    return { inRange: false, reason: `Choose A Unit In ${blocks.join(', ')}` }
  if (
    normalized !==
    unitCode(
      block,
      position.floor,
      position.unit,
      settings.numbering ?? 'plain'
    ).toUpperCase()
  )
    return { inRange: false, reason: 'Choose A Unit In The Configured Format' }
  if (position.floor < settings.minFloor || position.floor > settings.maxFloor)
    return {
      inRange: false,
      reason: `Floor ${position.floor} Is Outside The Configured Range`
    }
  if (position.unit < 1 || position.unit > settings.unitsPerFloor)
    return {
      inRange: false,
      reason: `Unit ${position.unit} Is Outside The Configured Range`
    }
  return { inRange: true }
}
```

Remove the local `MAX_PROJECT_UNITS` constant. With no blocks configured,
`projectBlocks` returns `['']`, and `parseUnitCode('05-11')` gives block `''`,
which matches, as before.

- [ ] **Step 4: Run the frontend suite**

Run: `cd frontend && bunx vitest run` Expected: PASS after updating tests that
pinned the old default range.

- [ ] **Step 5: Commit**

```bash
git add frontend
git commit -m "feat(import): validate units with the project's numbering"
```

### Task 7: Docs, Verification And The Pull Request

**Files:**

- Modify: `docs/TRD.md` (snapshot fields, units module), `docs/agents/notes.md`
  (file map: `packages/core/src/units.ts`)
- Modify: `graphify-out/` (refresh, last commit)

- [ ] **Step 1: Document.** In `docs/TRD.md`, where `GET /api/snapshot` and
      `scopeSnapshot` are described, add `projectSettings` and `units` with one
      sentence each, and add `units.ts` to the core module list. In
      `docs/agents/notes.md`, add `packages/core/src/units.ts` to the file map
      and a gotcha: "Demo units come from `DEFAULT_PROJECT_SETTINGS`; Add Demo
      Data rewrites the stored project settings."
- [ ] **Step 2: Verify.** Run `bun run check` and `bun run build`; read the
      output; both must pass. Then `bun run format`.
- [ ] **Step 3: Issue and branch hygiene.** Open the issue "Feature: Sales
      Chart" from the spec (the Feature Or Change form), linking #75 as related.
      Work on branch `feat/sales-chart-core`.
- [ ] **Step 4: Refresh the graph** with `graphify update .` and commit
      `graphify-out/` as the last commit.
- [ ] **Step 5: Open the PR** (`Refs #<issue>`), with the state distribution
      from Task 3 and the Jev staleness result from Task 5. Watch CI with
      `gh pr checks <n> --watch`; squash-merge when green with
      `gh pr merge <n> --squash --delete-branch`. Then open the live app after
      the Render deploy and confirm `/api/snapshot` carries `units`.
