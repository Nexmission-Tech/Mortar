# Showhouse Towers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** The Building view draws each block as a real tower (a double-loaded
floor plate with slab edges, fins, balconies, a core and a roof) on a podium,
seen through a perspective camera that turns all the way round, with Front and
Back presets and see-through filtering.

**Architecture:** A pure `towerModel.ts` turns the chart units into boxes in
metres: one per unit, plus every structure piece and the podium. The scene draws
units in two instanced meshes (solid and ghost) and all structure in one more,
under a hemisphere light and one soft-shadowed sun. `buildingLayout.ts` and its
test are deleted.

**Tech Stack:** three 0.186.1, @react-three/fiber 9.8.1, @react-three/drei
10.7.9, Vitest.

**Spec:** `docs/research/sales-chart/showhouse-model.md` (The Towers, The Look,
Interaction).

## Global Constraints

- One scene unit is one metre. Bay 9 m wide and 11 m deep; corridor 2.4 m; floor
  to floor 3.15 m; slab 0.3 m; panel recess 0.4 m; end-unit projection 1.2 m;
  balcony 1.5 m; podium 8 m; towers 30 m apart; the middle of an odd row of
  three or more set back 12 m; parapet 1.2 m; lift overrun 6 m.
- Numbering: the first half of a floor's units, rounded up, run left to right
  along the front; the rest run right to left along the back.
- Camera: perspective, 30° field of view, starting from the front left about 30°
  above the deck; turns all the way round; 15° to 75° above the deck; no pan;
  zoom only with Ctrl or ⌘ and the wheel.
- Filter on: lit units solid; every other unit and all structure see-through and
  unclickable; the podium stays solid.
- Tone mapping off (`flat`); one hemisphere light and one directional sun with a
  soft shadow map; no tinted light, reflections or bloom.
- Budgets: under 60 draw calls and 300k triangles at 936 units; the Building
  chunk under 300 kB gzip; render on demand only.
- Colours come only from CSS tokens in `frontend/src/globals.css`.
- Run commands with `rtk` when it is installed; finish with `bun run check`,
  then `bun run format`.

## Review Focus

1. **One unit per floor, or one block:** a project with 1 unit a floor has no
   back row and no projection; one block has no setback. Pinned in Task 1
   (`lays out any units per floor and any block count`).
2. **Front and Back twice in a row:** the camera turns the short way round and
   does not swing through the building. Checked in Task 2 Step 6 in a browser.
3. **A filter with lit units on the back:** they show through the see-through
   front and can be clicked. Checked in Task 2 Step 6.
4. **Dark mode:** white SPA Signed units stay visible against the structure.
   Pinned by the token values in Task 2 Step 1 and checked in Step 6.
5. **A data refresh while turned:** the camera stays where the viewer put it.
   Pinned in Task 1 (`modelKey ignores unit states`).

---

### Task 1: The Tower Model

**Files:**

- Create: `frontend/src/components/sales-chart/towerModel.ts`
- Create: `frontend/src/components/sales-chart/__tests__/towerModel.test.ts`
- Delete: `frontend/src/components/sales-chart/buildingLayout.ts`,
  `frontend/src/components/sales-chart/__tests__/buildingLayout.test.ts` (in
  Task 2, once the scene no longer imports them)

**Interfaces:**

- Consumes: `ChartUnit` from `@mortar/core` (`code`, `block`, `floor`,
  `floorLabel`, `unit`).
- Produces:

```ts
export type Vec3 = [number, number, number]
export interface Box {
  center: Vec3
  size: Vec3
}
export interface UnitBox extends Box {
  code: string
  block: string
  side: 'front' | 'back'
}
export interface TowerFrame {
  block: string
  center: Vec3
  size: Vec3
  roof: number
  left: number
  front: number
}
export interface TowerModel {
  units: Map<string, UnitBox>
  towers: TowerFrame[]
  structure: Box[]
  podium: Box
  floors: { label: string; y: number }[]
  bounds: { min: Vec3; max: Vec3 }
}
export function towerModel(units: ChartUnit[]): TowerModel
export function modelKey(model: TowerModel): string
```

`TowerFrame.center` and `size` box the whole tower from the ground to the top of
its crown; `roof` is the roof slab's top; `left` is the plate's left edge in
world x; `front` is the front frame plane in world z.

- [ ] **Step 1: Write the failing test**

Create `frontend/src/components/sales-chart/__tests__/towerModel.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  chartUnits,
  DEFAULT_PROJECT_SETTINGS,
  type ChartUnit,
  type ProjectSettings
} from '@mortar/core'
import {
  BAY_WIDTH,
  CORRIDOR,
  MIDDLE_SETBACK,
  PROJECTION,
  modelKey,
  towerModel,
  type Box
} from '@/components/sales-chart/towerModel'

const project = (patch: Partial<ProjectSettings> = {}): ChartUnit[] =>
  chartUnits({ ...DEFAULT_PROJECT_SETTINGS, ...patch }, [])

function overlaps(a: Box, b: Box): boolean {
  return [0, 1, 2].every(
    (k) =>
      Math.abs(a.center[k]! - b.center[k]!) <
      (a.size[k]! + b.size[k]!) / 2 - 1e-6
  )
}

function noOverlaps(boxes: Box[]): boolean {
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++)
      if (overlaps(boxes[i]!, boxes[j]!)) return false
  return true
}

describe('towerModel', () => {
  const units = project()
  const model = towerModel(units)

  it('gives every unit one box and no two units overlap', () => {
    expect(model.units.size).toBe(units.length)
    expect(noOverlaps([...model.units.values()])).toBe(true)
  })

  it('runs the numbers left to right along the front, then back along the rear', () => {
    const floor = units.filter(
      (u) => u.block === units[0]!.block && u.floor === units[0]!.floor
    )
    const boxes = floor
      .sort((a, b) => a.unit - b.unit)
      .map((u) => model.units.get(u.code)!)
    const half = Math.ceil(floor.length / 2)
    const front = boxes.slice(0, half)
    const back = boxes.slice(half)
    expect(front.every((b) => b.side === 'front')).toBe(true)
    expect(back.every((b) => b.side === 'back')).toBe(true)
    for (let i = 1; i < front.length; i++)
      expect(front[i]!.center[0]).toBeGreaterThan(front[i - 1]!.center[0])
    for (let i = 1; i < back.length; i++)
      expect(back[i]!.center[0]).toBeLessThan(back[i - 1]!.center[0])
    // Unit 07 stands behind unit 06.
    expect(back[0]!.center[0]).toBeCloseTo(front[front.length - 1]!.center[0])
    expect(back[0]!.center[2]).toBeLessThan(front[front.length - 1]!.center[2])
  })

  it('keeps each stack in line from floor to floor', () => {
    const stack = units.filter(
      (u) => u.block === units[0]!.block && u.unit === 2
    )
    const xs = new Set(
      stack.map((u) => model.units.get(u.code)!.center[0].toFixed(3))
    )
    const zs = new Set(
      stack.map((u) => model.units.get(u.code)!.center[2].toFixed(3))
    )
    expect(xs.size).toBe(1)
    expect(zs.size).toBe(1)
    const ys = stack.map((u) => model.units.get(u.code)!.center[1])
    expect(new Set(ys.map((y) => y.toFixed(3))).size).toBe(stack.length)
  })

  it('projects the end units of a row of three or more', () => {
    const floor = units
      .filter((u) => u.block === units[0]!.block && u.floor === units[0]!.floor)
      .sort((a, b) => a.unit - b.unit)
    const z = (n: number) => model.units.get(floor[n - 1]!.code)!.center[2]
    expect(z(1) - z(2)).toBeCloseTo(PROJECTION)
    expect(z(6) - z(5)).toBeCloseTo(PROJECTION)
  })

  it('sets the middle of three blocks back', () => {
    const [a, b, c] = model.towers
    expect(a!.center[2]).toBeCloseTo(0)
    expect(b!.center[2]).toBeCloseTo(-MIDDLE_SETBACK)
    expect(c!.center[2]).toBeCloseTo(0)
    expect(b!.center[0] - a!.center[0]).toBeCloseTo(c!.center[0] - b!.center[0])
  })

  it('keeps every tower and its structure on the podium', () => {
    const { podium } = model
    for (const box of [...model.structure, ...model.units.values()])
      for (const k of [0, 2])
        expect(
          Math.abs(box.center[k]! - podium.center[k]!)
        ).toBeLessThanOrEqual(podium.size[k]! / 2)
    for (const box of model.units.values())
      expect(box.center[1]).toBeGreaterThan(podium.size[1])
  })

  it('lays out any units per floor and any block count', () => {
    for (const unitsPerFloor of [1, 2, 3, 7, 12, 60])
      for (const blocks of [['A'], ['A', 'B'], ['A', 'B', 'C', 'D']]) {
        const small = project({
          unitsPerFloor,
          blocks,
          minFloor: 3,
          maxFloor: 5
        })
        const m = towerModel(small)
        expect(m.units.size).toBe(small.length)
        expect(m.towers).toHaveLength(blocks.length)
        if (unitsPerFloor <= 12)
          expect(noOverlaps([...m.units.values()])).toBe(true)
        if (unitsPerFloor === 1)
          expect([...m.units.values()].every((b) => b.side === 'front')).toBe(
            true
          )
        if (blocks.length !== 3)
          expect(m.towers.every((t) => Math.abs(t.center[2]) < 1e-6)).toBe(true)
      }
  })

  it('puts the core inside the plate, between the rows', () => {
    const tower = model.towers[0]!
    const core = model.structure.find(
      (box) =>
        box.size[0] === 8 && Math.abs(box.center[0] - tower.center[0]) < 1e-6
    )!
    expect(core).toBeTruthy()
    expect(Math.abs(core.center[2] - tower.center[2])).toBeLessThanOrEqual(
      CORRIDOR
    )
    expect(core.size[0]).toBeLessThan(BAY_WIDTH * 6)
  })

  it('modelKey ignores unit states', () => {
    const recoloured = units.map((u) => ({ ...u, state: 'signed' as const }))
    expect(modelKey(towerModel(recoloured))).toBe(modelKey(model))
    expect(modelKey(towerModel(project({ maxFloor: 20 })))).not.toBe(
      modelKey(model)
    )
  })

  it('draws nothing for no units', () => {
    const empty = towerModel([])
    expect(empty.units.size).toBe(0)
    expect(empty.towers).toHaveLength(0)
    expect(empty.structure).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `rtk bun run --cwd frontend test -- towerModel` Expected: FAIL with "Failed
to resolve import ... towerModel".

- [ ] **Step 3: Implement**

Create `frontend/src/components/sales-chart/towerModel.ts`:

```ts
/**
 * The Building view's towers, in metres: a box for every unit, and the
 * structure round it (slab edges, fins, balconies, parapet, core, tanks and
 * crown), standing on a podium. Each block is a double-loaded slab: the first
 * half of a floor's units, rounded up, run left to right along the front and
 * the rest right to left along the back, so the numbers go round the floor as
 * on a key plan, and unit 07 stands behind unit 06. Pure, so it is tested
 * without WebGL.
 */
import type { ChartUnit } from '@mortar/core'

export type Vec3 = [number, number, number]
export interface Box {
  center: Vec3
  size: Vec3
}
export interface UnitBox extends Box {
  code: string
  block: string
  side: 'front' | 'back'
}
export interface TowerFrame {
  block: string
  /** The whole tower, ground to crown. */
  center: Vec3
  size: Vec3
  /** The roof slab's top. */
  roof: number
  /** The plate's left edge, in world x. */
  left: number
  /** The front frame plane, in world z. */
  front: number
}
export interface TowerModel {
  units: Map<string, UnitBox>
  towers: TowerFrame[]
  structure: Box[]
  podium: Box
  floors: { label: string; y: number }[]
  bounds: { min: Vec3; max: Vec3 }
}

export const BAY_WIDTH = 9
export const BAY_DEPTH = 11
export const CORRIDOR = 2.4
export const FLOOR_HEIGHT = 3.15
export const SLAB = 0.3
export const RECESS = 0.4
export const PROJECTION = 1.2
export const BALCONY_DEPTH = 1.5
export const PODIUM_HEIGHT = 8
export const TOWER_GAP = 30
export const MIDDLE_SETBACK = 12
export const PARAPET = 1.2
export const OVERRUN = 6
const CORE: Vec3 = [8, OVERRUN, 6]
const TANK: Vec3 = [3.5, 2.5, 3.5]
const CROWN: [number, number] = [18, 10]
const BEAM = 0.5
const PODIUM_MARGIN = 10
/** The deck in front of the towers, left open for the site to fill. */
const DECK_DEPTH = 40

const EMPTY: TowerModel = {
  units: new Map(),
  towers: [],
  structure: [],
  podium: { center: [0, PODIUM_HEIGHT / 2, 0], size: [0, PODIUM_HEIGHT, 0] },
  floors: [],
  bounds: { min: [0, 0, 0], max: [0, 0, 0] }
}

export function towerModel(units: ChartUnit[]): TowerModel {
  if (units.length === 0) return EMPTY
  const blocks = [...new Set(units.map((u) => u.block))]
  const floorLabels = new Map(units.map((u) => [u.floor, u.floorLabel]))
  const floorNumbers = [...floorLabels.keys()].sort((a, b) => a - b)
  const floorIndex = new Map(floorNumbers.map((floor, i) => [floor, i]))
  const storeys = floorNumbers.length
  const perFloor = Math.max(...units.map((u) => u.unit))
  const frontCount = Math.ceil(perFloor / 2)
  const backCount = perFloor - frontCount
  const plateWidth = frontCount * BAY_WIDTH
  const rowOffset = backCount > 0 ? CORRIDOR / 2 + BAY_DEPTH / 2 : 0
  const roof = PODIUM_HEIGHT + storeys * FLOOR_HEIGHT
  const unitHeight = FLOOR_HEIGHT - SLAB
  const top = roof + OVERRUN + FLOOR_HEIGHT
  const step = plateWidth + TOWER_GAP
  const setBackMiddle = blocks.length >= 3 && blocks.length % 2 === 1

  const slotOf = (n: number) =>
    n <= frontCount
      ? { side: 'front' as const, slot: n - 1, count: frontCount }
      : { side: 'back' as const, slot: n - frontCount - 1, count: backCount }
  const projects = (count: number, slot: number) =>
    count >= 3 && (slot === 0 || slot === count - 1)
  const xOf = (side: 'front' | 'back', slot: number) =>
    side === 'front'
      ? -plateWidth / 2 + (slot + 0.5) * BAY_WIDTH
      : plateWidth / 2 - (slot + 0.5) * BAY_WIDTH
  const sign = (side: 'front' | 'back') => (side === 'front' ? 1 : -1)
  /** The unit's outward face, as a distance from the tower's centre line. */
  const faceOf = (count: number, slot: number) =>
    rowOffset + BAY_DEPTH / 2 + (projects(count, slot) ? PROJECTION : 0)
  const yOf = (i: number) =>
    PODIUM_HEIGHT + i * FLOOR_HEIGHT + SLAB + unitHeight / 2

  const unitBoxes = new Map<string, UnitBox>()
  const structure: Box[] = []
  const towers: TowerFrame[] = []
  const box = (center: Vec3, size: Vec3) => structure.push({ center, size })

  blocks.forEach((block, i) => {
    const ox = (i - (blocks.length - 1) / 2) * step
    const oz =
      setBackMiddle && i === (blocks.length - 1) / 2 ? -MIDDLE_SETBACK : 0
    const rows = (['front', 'back'] as const).filter(
      (side) => (side === 'front' ? frontCount : backCount) > 0
    )

    for (const unit of units) {
      if (unit.block !== block) continue
      const { side, slot, count } = slotOf(unit.unit)
      const s = sign(side)
      const centre = s * (faceOf(count, slot) - BAY_DEPTH / 2)
      unitBoxes.set(unit.code, {
        code: unit.code,
        block,
        side,
        center: [
          ox + xOf(side, slot),
          yOf(floorIndex.get(unit.floor)!),
          oz + centre
        ],
        size: [BAY_WIDTH - SLAB, unitHeight, BAY_DEPTH]
      })
    }

    for (const side of rows) {
      const count = side === 'front' ? frontCount : backCount
      const s = sign(side)
      for (let slot = 0; slot < count; slot++) {
        const x = ox + xOf(side, slot)
        const face = faceOf(count, slot)
        // A slab edge under every bay at every level, roof included, 0.3m proud of the frame.
        const slabDepth = BAY_DEPTH + RECESS + SLAB
        for (let level = 0; level <= storeys; level++)
          box(
            [
              x,
              PODIUM_HEIGHT + level * FLOOR_HEIGHT + SLAB / 2,
              oz + s * (face - BAY_DEPTH + slabDepth / 2)
            ],
            [BAY_WIDTH, SLAB, slabDepth]
          )
        // A balcony across 70% of the bay on every residential floor.
        for (let level = 0; level < storeys; level++)
          box(
            [
              x,
              PODIUM_HEIGHT + level * FLOOR_HEIGHT + SLAB / 2,
              oz + s * (face + RECESS + SLAB + BALCONY_DEPTH / 2)
            ],
            [BAY_WIDTH * 0.7, SLAB / 2, BALCONY_DEPTH]
          )
        // The parapet along the bay's outward edge.
        box(
          [x, roof + PARAPET / 2, oz + s * (face + RECESS + SLAB / 2)],
          [BAY_WIDTH, PARAPET, SLAB]
        )
      }
      // A fin at every bay boundary, at the frame plane of the further-out neighbour.
      for (let b = 0; b <= count; b++) {
        const out = Math.max(
          b > 0 ? faceOf(count, b - 1) : 0,
          b < count ? faceOf(count, b) : 0
        )
        const x =
          side === 'front'
            ? -plateWidth / 2 + b * BAY_WIDTH
            : plateWidth / 2 - b * BAY_WIDTH
        box(
          [
            ox + x,
            PODIUM_HEIGHT + (storeys * FLOOR_HEIGHT) / 2,
            oz + s * (out + RECESS / 2)
          ],
          [SLAB, storeys * FLOOR_HEIGHT, RECESS]
        )
      }
    }

    // The corridor's slab at every level, and the plate's end walls on the roof.
    const plateDepth = 2 * rowOffset + (backCount > 0 ? 0 : BAY_DEPTH)
    if (backCount > 0)
      for (let level = 0; level <= storeys; level++)
        box(
          [ox, PODIUM_HEIGHT + level * FLOOR_HEIGHT + SLAB / 2, oz],
          [plateWidth, SLAB, CORRIDOR]
        )
    for (const end of [-1, 1])
      box(
        [ox + (end * plateWidth) / 2, roof + PARAPET / 2, oz],
        [SLAB, PARAPET, plateDepth + BAY_DEPTH]
      )

    // The core's overrun, two water tanks and a crown frame one floor tall.
    box([ox, roof + OVERRUN / 2, oz], CORE)
    for (const end of [-1, 1]) box([ox + end * 7, roof + TANK[1] / 2, oz], TANK)
    const [cw, cd] = CROWN
    const crownBase = roof + OVERRUN
    for (const [dx, dz] of [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1]
    ] as const)
      box(
        [ox + (dx * cw) / 2, crownBase + FLOOR_HEIGHT / 2, oz + (dz * cd) / 2],
        [BEAM, FLOOR_HEIGHT, BEAM]
      )
    for (const dz of [-1, 1])
      box(
        [ox, crownBase + FLOOR_HEIGHT - BEAM / 2, oz + (dz * cd) / 2],
        [cw, BEAM, BEAM]
      )
    for (const dx of [-1, 1])
      box(
        [ox + (dx * cw) / 2, crownBase + FLOOR_HEIGHT - BEAM / 2, oz],
        [BEAM, BEAM, cd]
      )

    const reach =
      rowOffset +
      BAY_DEPTH / 2 +
      (frontCount >= 3 ? PROJECTION : 0) +
      RECESS +
      SLAB +
      BALCONY_DEPTH
    const backReach = backCount > 0 ? reach : BAY_DEPTH / 2
    towers.push({
      block,
      center: [ox, top / 2, oz + (reach - backReach) / 2],
      size: [plateWidth, top, reach + backReach],
      roof,
      left: ox - plateWidth / 2,
      front: oz + rowOffset + BAY_DEPTH / 2 + RECESS
    })
  })

  const minX =
    Math.min(...towers.map((t) => t.center[0] - t.size[0] / 2)) - PODIUM_MARGIN
  const maxX =
    Math.max(...towers.map((t) => t.center[0] + t.size[0] / 2)) + PODIUM_MARGIN
  const minZ =
    Math.min(...towers.map((t) => t.center[2] - t.size[2] / 2)) - PODIUM_MARGIN
  const maxZ =
    Math.max(...towers.map((t) => t.center[2] + t.size[2] / 2)) +
    PODIUM_MARGIN +
    DECK_DEPTH
  const podium: Box = {
    center: [(minX + maxX) / 2, PODIUM_HEIGHT / 2, (minZ + maxZ) / 2],
    size: [maxX - minX, PODIUM_HEIGHT, maxZ - minZ]
  }

  return {
    units: unitBoxes,
    towers,
    structure,
    podium,
    floors: floorNumbers.map((floor, i) => ({
      label: floorLabels.get(floor)!,
      y: yOf(i)
    })),
    bounds: { min: [minX, 0, minZ], max: [maxX, top, maxZ] }
  }
}

/** Equal for any two models of the same shape, whatever their units' states, so a data refresh never reframes the camera. */
export function modelKey(model: TowerModel): string {
  return [
    model.towers.map((t) => t.block).join(','),
    ...model.bounds.min.map((v) => v.toFixed(2)),
    ...model.bounds.max.map((v) => v.toFixed(2))
  ].join('|')
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `rtk bun run --cwd frontend test -- towerModel` Expected: PASS (10 tests).
If the overlap check for 12 units a floor fails at a projected end unit, the
projection pushes a unit into its neighbour's slab: check `faceOf` against the
test, never loosen `overlaps`.

- [ ] **Step 5: Commit**

```bash
rtk git add frontend/src/components/sales-chart/towerModel.ts frontend/src/components/sales-chart/__tests__/towerModel.test.ts
rtk git commit -m "feat(sales-chart): model each block as a real tower in metres

Claude-Session: https://claude.ai/code/session_01W7s74co9WkbrhgkSJgxrZZ"
```

---

### Task 2: Draw The Towers

**Files:**

- Modify: `frontend/src/globals.css` (model tokens in `:root` and `.dark`)
- Modify: `frontend/src/components/sales-chart/sceneColors.ts`
- Modify: `frontend/src/components/sales-chart/__tests__/sceneColors.test.ts`
- Rewrite: `frontend/src/components/sales-chart/SalesChartBuilding.tsx`
- Delete: `frontend/src/components/sales-chart/buildingLayout.ts`,
  `frontend/src/components/sales-chart/__tests__/buildingLayout.test.ts`
- Modify: `docs/DESIGN.md` (Building View), `docs/agents/notes.md` (Sales Chart
  row)

**Interfaces:**

- Consumes: `towerModel`, `modelKey`, `TowerModel`, `Vec3` (Task 1). The page's
  props to `SalesChartBuilding` are unchanged:
  `{ units, lit, selected, onSelect, onHover, projectName }`.
- Produces: `SceneColors` gains `structure` and `podium` reads `--model-podium`;
  `available` reads `--model-glass`.

- [ ] **Step 1: Write the failing colour test and add the tokens**

In `frontend/src/components/sales-chart/__tests__/sceneColors.test.ts`, add to
`vars`:

```ts
    '--model-glass': 'rgb(11, 11, 11)',
    '--model-structure': 'rgb(12, 12, 12)',
    '--model-podium': 'rgb(13, 13, 13)',
```

and change the expectations `available: 'rgb(6, 6, 6)'` to
`available: 'rgb(11, 11, 11)'`, `podium: 'rgb(7, 7, 7)'` to
`podium: 'rgb(13, 13, 13)'`, and add `structure: 'rgb(12, 12, 12)'`.

Run: `rtk bun run --cwd frontend test -- sceneColors` Expected: FAIL (available
is still `rgb(6, 6, 6)`).

In `frontend/src/globals.css`, after the Desk colours group in `:root`, add:

```css
/* Model — the Sales Chart's Building view, a sales-gallery scale model.
     Muted, so a unit's status colour is always the loudest thing in it. */
--model-structure: #f4f2ee;
--model-glass: #c3ccd4;
--model-podium: #dedad3;
```

and in `.dark`, after its Desk colours group:

```css
/* Model — a night model: dark structure, so white SPA Signed units stand out. */
--model-structure: #3b3a37;
--model-glass: #2b3239;
--model-podium: #262523;
```

In `frontend/src/components/sales-chart/sceneColors.ts`, change the type and the
token map:

```ts
export type SceneColors = Record<
  | UnitState
  | 'ghost'
  | 'podium'
  | 'structure'
  | 'selected'
  | 'selectedInner'
  | 'hovered',
  string
>

const TOKENS: Record<keyof SceneColors, string> = {
  // Available units are glazing: a pale cool tint against the white frame.
  available: '--model-glass',
  booked: '--status-info',
  loan_approved: '--status-positive',
  needs_action: '--status-warning',
  release_review: '--status-danger',
  signed: '--status-signed',
  ghost: '--muted',
  podium: '--model-podium',
  structure: '--model-structure',
  selected: '--foreground',
  // The gap between the ink ring and the unit, as the Grid's ring offset: it shows on signed units too.
  selectedInner: '--card',
  hovered: '--muted-foreground'
}
```

Run: `rtk bun run --cwd frontend test -- sceneColors` Expected: PASS.

- [ ] **Step 2: Rewrite the scene**

Replace the whole of
`frontend/src/components/sales-chart/SalesChartBuilding.tsx` with:

```tsx
/**
 * The Sales Chart's Building view: the project as a sales-gallery scale model.
 * Each block is a real tower (a double-loaded plate, slab edges, fins,
 * balconies, a core and a roof) on a podium, every unit a box in its state's
 * tone. It takes the same props as the Grid, so filters, the readout and the
 * unit island work the same way.
 *
 * DESIGN.md names this the one 3D surface in the product. Colours come from
 * CSS tokens; a hemisphere light and one soft-shadowed sun shade it; with a
 * filter on, the units it does not light and all structure turn see-through.
 * The scene renders on demand, never in a loop.
 */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject
} from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { ChartUnit } from '@mortar/core'
import { cn } from '@/lib/utils'
import {
  modelKey,
  towerModel,
  type Box,
  type TowerModel,
  type Vec3
} from './towerModel'
import { sceneColors, type SceneColors } from './sceneColors'

type SalesChartBuildingProps = {
  units: ChartUnit[]
  /** Units the active filter lights; `null` when no filter is on. */
  lit: ReadonlySet<string> | null
  selected: string | null
  onSelect: (unit: ChartUnit) => void
  onHover: (unit: ChartUnit | null) => void
  /** Read out to screen readers in place of the canvas. */
  projectName?: string
}

type Side = 'front' | 'back'

/** The camera starts from the front left, about 30° above the deck. */
const START_AZIMUTH = -0.6
const START_POLAR = Math.PI / 2 - 0.52
const FOV = 30
const FIT_MARGIN = 1.04
const TWEEN_MS = 200
/** A click that travelled further than this since pointer down was a drag. */
const DRAG_PX = 4
const GHOST_OPACITY = 0.1
const STRUCTURE_GHOST_OPACITY = 0.16
/** The camera stays between 15° and 75° above the deck. */
const MIN_POLAR = (15 * Math.PI) / 180
const MAX_POLAR = (75 * Math.PI) / 180

/** The colours, re-read whenever the theme class on `<html>` changes. */
function useSceneColors(): SceneColors {
  const read = useCallback(() => {
    const style = getComputedStyle(document.documentElement)
    return sceneColors((name) => style.getPropertyValue(name))
  }, [])
  const [colors, setColors] = useState(read)
  useEffect(() => {
    const observer = new MutationObserver(() => setColors(read()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style']
    })
    return () => observer.disconnect()
  }, [read])
  return colors
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** The distance at which a sphere round `size` fits the camera's narrower field of view. */
function fitDistance(size: Vec3, aspect: number): number {
  const radius = Math.hypot(...size) / 2
  const vertical = (FOV * Math.PI) / 180
  const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * aspect)
  return (radius * FIT_MARGIN) / Math.sin(Math.min(vertical, horizontal) / 2)
}

type OrbitLike = { target: THREE.Vector3; update: () => void }

/**
 * Frames the model, or one tower, from the front or the back at the starting
 * height: on mount, when the canvas or the model's shape changes, and on every
 * preset click. It turns the short way round, so Front to Back never swings
 * through the building. A data refresh that only recolours units leaves the
 * camera where the viewer put it.
 */
function Framing({
  model,
  focus,
  side,
  nonce
}: {
  model: TowerModel
  focus: string | null
  side: Side
  nonce: number
}) {
  const shape = modelKey(model)
  const latest = useRef(model)
  useEffect(() => {
    latest.current = model
  }, [model])
  const width = useThree((s) => s.size.width)
  const height = useThree((s) => s.size.height)
  const get = useThree((s) => s.get)
  const first = useRef(true)

  useEffect(() => {
    const { camera, invalidate } = get()
    const controls = get().controls as unknown as OrbitLike | null
    const current = latest.current
    const tower = focus
      ? current.towers.find((t) => t.block === focus)
      : undefined
    const { min, max } = current.bounds
    const frame = tower ?? {
      center: [
        (min[0] + max[0]) / 2,
        max[1] / 3,
        (min[2] + max[2]) / 2
      ] as Vec3,
      size: [max[0] - min[0], max[1], max[2] - min[2]] as Vec3
    }
    const toTarget = new THREE.Vector3(...frame.center)
    const to = new THREE.Spherical(
      fitDistance(frame.size, width / Math.max(1, height)),
      START_POLAR,
      START_AZIMUTH + (side === 'back' ? Math.PI : 0)
    )
    const fromTarget = controls ? controls.target.clone() : toTarget.clone()
    const from = new THREE.Spherical().setFromVector3(
      camera.position.clone().sub(fromTarget)
    )
    // The short way round.
    let turn = to.theta - from.theta
    turn = Math.atan2(Math.sin(turn), Math.cos(turn))
    const fromZoom = camera.zoom

    const apply = (t: number) => {
      const target = fromTarget.clone().lerp(toTarget, t)
      const spherical = new THREE.Spherical(
        from.radius + (to.radius - from.radius) * t,
        from.phi + (to.phi - from.phi) * t,
        from.theta + turn * t
      )
      camera.position.copy(
        target.clone().add(new THREE.Vector3().setFromSpherical(spherical))
      )
      camera.zoom = fromZoom + (1 - fromZoom) * t
      camera.updateProjectionMatrix()
      if (controls) {
        controls.target.copy(target)
        controls.update()
      } else camera.lookAt(target)
      invalidate()
    }

    if (first.current || prefersReducedMotion()) {
      first.current = false
      apply(1)
      return
    }
    let raf = 0
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / TWEEN_MS)
      apply(1 - (1 - t) * (1 - t))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [shape, focus, side, nonce, width, height, get])

  return null
}

const UNIT_CUBE = new THREE.BoxGeometry(1, 1, 1)

/** Writes each box's position and size into an instanced mesh's matrices. */
function useBoxMatrices(
  mesh: RefObject<THREE.InstancedMesh | null>,
  boxes: Box[]
) {
  const invalidate = useThree((s) => s.invalidate)
  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const scale = new THREE.Vector3()
    const rotation = new THREE.Quaternion()
    boxes.forEach((box, i) => {
      m.setMatrixAt(
        i,
        matrix.compose(
          position.set(...box.center),
          rotation,
          scale.set(...box.size)
        )
      )
    })
    m.instanceMatrix.needsUpdate = true
    m.computeBoundingSphere()
    invalidate()
  }, [mesh, boxes, invalidate])
}

/** The units the active filter keeps solid, and the rest. */
function splitUnits(units: ChartUnit[], lit: ReadonlySet<string> | null) {
  const solid: number[] = []
  const ghost: number[] = []
  units.forEach((unit, i) =>
    (lit && !lit.has(unit.code) ? ghost : solid).push(i)
  )
  return { solid, ghost }
}

function UnitMesh({
  units,
  indices,
  model,
  colors,
  ghost,
  onHoverIndex,
  onPick
}: {
  units: ChartUnit[]
  indices: number[]
  model: TowerModel
  colors: SceneColors
  ghost: boolean
  onHoverIndex?: (index: number | null) => void
  onPick?: (index: number) => void
}) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const material = useRef<THREE.MeshLambertMaterial>(null)
  const invalidate = useThree((s) => s.invalidate)
  const boxes = useMemo(
    () => indices.map((i) => model.units.get(units[i]!.code)!),
    [indices, model, units]
  )
  useBoxMatrices(mesh, boxes)

  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    const hadColors = Boolean(m.instanceColor)
    const color = new THREE.Color()
    indices.forEach((unitIndex, i) => {
      const unit = units[unitIndex]!
      m.setColorAt(i, color.set(ghost ? colors.ghost : colors[unit.state]))
    })
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    // The first instance colours change the shader the material needs.
    if (!hadColors && material.current) material.current.needsUpdate = true
    invalidate()
  }, [indices, units, colors, ghost, invalidate])

  if (indices.length === 0) return null
  return (
    <instancedMesh
      key={`${ghost}-${indices.length}`}
      ref={mesh}
      args={[UNIT_CUBE, undefined, indices.length]}
      castShadow={!ghost}
      receiveShadow={!ghost}
      // A see-through unit takes no clicks: the lit ones behind it do.
      raycast={ghost ? () => null : undefined}
      onPointerMove={
        onHoverIndex
          ? (event: ThreeEvent<PointerEvent>) => {
              event.stopPropagation()
              onHoverIndex(
                event.instanceId === undefined
                  ? null
                  : indices[event.instanceId]!
              )
            }
          : undefined
      }
      onPointerOut={onHoverIndex ? () => onHoverIndex(null) : undefined}
      onClick={
        onPick
          ? (event: ThreeEvent<MouseEvent>) => {
              event.stopPropagation()
              if (event.delta > DRAG_PX || event.instanceId === undefined)
                return
              onPick(indices[event.instanceId]!)
            }
          : undefined
      }
    >
      <meshLambertMaterial
        ref={material}
        transparent={ghost}
        opacity={ghost ? GHOST_OPACITY : 1}
        depthWrite={!ghost}
      />
    </instancedMesh>
  )
}

function Structure({
  model,
  colors,
  ghost
}: {
  model: TowerModel
  colors: SceneColors
  ghost: boolean
}) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  useBoxMatrices(mesh, model.structure)
  if (model.structure.length === 0) return null
  return (
    <instancedMesh
      key={model.structure.length}
      ref={mesh}
      args={[UNIT_CUBE, undefined, model.structure.length]}
      castShadow={!ghost}
      receiveShadow={!ghost}
      raycast={() => null}
    >
      <meshLambertMaterial
        color={colors.structure}
        transparent={ghost}
        opacity={ghost ? STRUCTURE_GHOST_OPACITY : 1}
        depthWrite={!ghost}
      />
    </instancedMesh>
  )
}

/** The edges drawn round a hovered or selected unit; one per scene, disposed with it. */
function useOutlineGeometry(size: Vec3, scale: number): THREE.EdgesGeometry {
  const [w, h, d] = size
  const geometry = useMemo(() => {
    const box = new THREE.BoxGeometry(w * scale, h * scale, d * scale)
    const edges = new THREE.EdgesGeometry(box)
    box.dispose()
    return edges
  }, [w, h, d, scale])
  useEffect(() => () => geometry.dispose(), [geometry])
  return geometry
}

function Outline({
  at,
  color,
  geometry
}: {
  at: Vec3 | undefined
  color: string
  geometry: THREE.EdgesGeometry
}) {
  if (!at) return null
  return (
    <lineSegments position={at} geometry={geometry} raycast={() => null}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
}

/** A text label pinned to a point in the scene, drawn in the DOM so it stays crisp Geist. */
interface Anchor {
  key: string
  text: string
  at: Vec3
  className: string
}

const FLOOR_LABEL = 'font-mono text-[10px] text-muted-foreground'
const BLOCK_LABEL =
  'rounded-sm border border-border bg-card/90 px-1.5 py-0.5 text-xs font-semibold text-foreground shadow-card'

/** A pill above each roof, and every fifth floor plus the top one up the left end of the framed block. */
function labelAnchors(model: TowerModel, focus: string | null): Anchor[] {
  const blocks = model.towers.map((tower) => ({
    key: `block-${tower.block}`,
    text: `Block ${tower.block}`,
    at: [tower.center[0], tower.size[1] + 4, tower.center[2]] as Vec3,
    className: BLOCK_LABEL
  }))
  const tower = model.towers.find((t) => t.block === focus) ?? model.towers[0]
  const top = model.floors[model.floors.length - 1]
  const floors = tower
    ? model.floors
        .filter((floor, i) => i % 5 === 0 || floor === top)
        .map((floor) => ({
          key: `floor-${floor.label}`,
          text: floor.label,
          at: [tower.left - 3, floor.y, tower.front] as Vec3,
          className: FLOOR_LABEL
        }))
    : []
  return [...blocks, ...floors]
}

/** Moves each label to its anchor's place on screen whenever the scene draws; hides labels behind the camera. */
function LabelProjector({
  anchors,
  labels
}: {
  anchors: Anchor[]
  labels: RefObject<Map<string, HTMLSpanElement>>
}) {
  const point = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera, size }) => {
    for (const anchor of anchors) {
      const el = labels.current.get(anchor.key)
      if (!el) continue
      point.set(...anchor.at).project(camera)
      if (point.z > 1) {
        el.style.transform = 'translate(-9999px, -9999px)'
        continue
      }
      const x = ((point.x + 1) / 2) * size.width
      const y = ((1 - point.y) / 2) * size.height
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
    }
  })
  return null
}

const MIN_ZOOM = 0.7
const MAX_ZOOM = 8

/**
 * Zooms only with Ctrl or ⌘ held (a trackpad pinch sends the same), so a plain
 * scroll over the canvas still scrolls the page, as a presenter expects.
 */
function WheelZoom() {
  const get = useThree((s) => s.get)
  const element = useThree((s) => s.gl.domElement)
  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      const { camera, invalidate } = get()
      camera.zoom = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, camera.zoom * Math.exp(-event.deltaY * 0.002))
      )
      camera.updateProjectionMatrix()
      invalidate()
    }
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [element, get])
  return null
}

/** Draws again once the browser hands back a lost GPU context; on demand, nothing else would. */
function ContextRestore() {
  const invalidate = useThree((s) => s.invalidate)
  const element = useThree((s) => s.gl.domElement)
  useEffect(() => {
    const redraw = () => invalidate()
    element.addEventListener('webglcontextrestored', redraw)
    return () => element.removeEventListener('webglcontextrestored', redraw)
  }, [element, invalidate])
  return null
}

/** A hemisphere light and one sun from the upper left front, its shadow sized to the model. */
function Lights({ model }: { model: TowerModel }) {
  const { min, max } = model.bounds
  const span = Math.max(max[0] - min[0], max[2] - min[2], max[1]) * 0.75
  const sun = useRef<THREE.DirectionalLight>(null)
  useLayoutEffect(() => {
    const light = sun.current
    if (!light) return
    const camera = light.shadow.camera
    camera.left = -span
    camera.right = span
    camera.top = span
    camera.bottom = -span
    camera.near = 1
    camera.far = span * 6
    camera.updateProjectionMatrix()
  }, [span])
  return (
    <>
      {/* Intensities are in units of π, so a lit top face shows its token's own colour. */}
      <hemisphereLight args={['#ffffff', '#8a8780', 0.72 * Math.PI]} />
      <directionalLight
        ref={sun}
        position={[-span * 1.2, span * 2, span]}
        intensity={0.3 * Math.PI}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
        shadow-radius={4}
      />
    </>
  )
}

function Scene({
  units,
  model,
  lit,
  selected,
  focus,
  side,
  onSelect,
  onHover,
  nonce,
  anchors,
  labels
}: SalesChartBuildingProps & {
  model: TowerModel
  focus: string | null
  side: Side
  nonce: number
  anchors: Anchor[]
  labels: RefObject<Map<string, HTMLSpanElement>>
}) {
  const colors = useSceneColors()
  const unitSize =
    model.units.values().next().value?.size ?? ([1, 1, 1] as Vec3)
  const outline = useOutlineGeometry(unitSize, 1.04)
  const outerRing = useOutlineGeometry(unitSize, 1.12)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const { solid, ghost } = useMemo(() => splitUnits(units, lit), [units, lit])
  const indexOf = useMemo(
    () => new Map(units.map((unit, i) => [unit.code, i])),
    [units]
  )
  const selectedUnit =
    selected !== null ? units[indexOf.get(selected) ?? -1] : undefined
  const hoveredUnit = hoverIndex !== null ? units[hoverIndex] : undefined
  const filtering = lit !== null
  const hovered = useRef<number | null>(null)

  const hover = (index: number | null) => {
    if (hovered.current === index) return
    hovered.current = index
    document.body.style.cursor = index === null ? '' : 'pointer'
    setHoverIndex(index)
    onHover(index === null ? null : (units[index] ?? null))
  }
  useEffect(() => () => void (document.body.style.cursor = ''), [])

  return (
    <>
      <Lights model={model} />

      <mesh position={model.podium.center} receiveShadow raycast={() => null}>
        <boxGeometry args={model.podium.size} />
        <meshLambertMaterial color={colors.podium} />
      </mesh>

      <Structure model={model} colors={colors} ghost={filtering} />
      <UnitMesh
        units={units}
        indices={solid}
        model={model}
        colors={colors}
        ghost={false}
        onHoverIndex={hover}
        onPick={(index) => {
          const unit = units[index]
          if (unit) onSelect(unit)
        }}
      />
      <UnitMesh
        units={units}
        indices={ghost}
        model={model}
        colors={colors}
        ghost
      />

      {hoveredUnit && hoveredUnit.code !== selected ? (
        <Outline
          at={model.units.get(hoveredUnit.code)?.center}
          color={colors.hovered}
          geometry={outline}
        />
      ) : null}
      {/* A card-coloured ring inside an ink ring, as the Grid's ring offset, so the
          selection shows on every state, black SPA Signed units included. */}
      {selectedUnit ? (
        <>
          <Outline
            at={model.units.get(selectedUnit.code)?.center}
            color={colors.selectedInner}
            geometry={outline}
          />
          <Outline
            at={model.units.get(selectedUnit.code)?.center}
            color={colors.selected}
            geometry={outerRing}
          />
        </>
      ) : null}

      <LabelProjector anchors={anchors} labels={labels} />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping={false}
        enableZoom={false}
        minPolarAngle={MIN_POLAR}
        maxPolarAngle={MAX_POLAR}
      />
      <WheelZoom />
      <ContextRestore />
      <Framing model={model} focus={focus} side={side} nonce={nonce} />
    </>
  )
}

function Segmented<T extends string | null>({
  label,
  options,
  value,
  onPick
}: {
  label: string
  options: { id: T; label: string }[]
  value: T
  onPick: (id: T) => void
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex rounded-md bg-muted p-0.5"
    >
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onPick(option.id)}
          className={cn(
            'h-7 min-w-8 rounded-sm px-2.5 text-xs font-medium outline-none transition-colors duration-[var(--motion-fast)] focus-visible:ring-2 focus-visible:ring-ring',
            value === option.id
              ? 'bg-card text-foreground shadow-card'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function SalesChartBuilding(props: SalesChartBuildingProps) {
  const model = useMemo(() => towerModel(props.units), [props.units])
  const [focus, setFocus] = useState<string | null>(null)
  const [side, setSide] = useState<Side>('front')
  const anchors = useMemo(() => labelAnchors(model, focus), [model, focus])
  const labels = useRef(new Map<string, HTMLSpanElement>())
  // Every click reframes, even on the preset already pressed.
  const [nonce, setNonce] = useState(0)
  const reframe = () => setNonce((n) => n + 1)
  const blocks = [
    { id: null, label: 'All' },
    ...model.towers.map((t) => ({ id: t.block, label: `Block ${t.block}` }))
  ]

  return (
    <div className="relative">
      <div className="absolute left-0 top-0 z-[1] flex flex-wrap gap-2">
        <Segmented
          label="Frame the building"
          options={blocks}
          value={focus}
          onPick={(id) => {
            setFocus(id)
            reframe()
          }}
        />
        <Segmented
          label="Side of the building"
          options={[
            { id: 'front' as Side, label: 'Front' },
            { id: 'back' as Side, label: 'Back' }
          ]}
          value={side}
          onPick={(id) => {
            setSide(id)
            reframe()
          }}
        />
      </div>
      <p className="absolute right-0 top-0 z-[1] flex h-8 items-center rounded-md bg-muted px-2.5 text-xs text-muted-foreground max-sm:hidden">
        Drag To Turn · Ctrl Or ⌘ And Scroll To Zoom
      </p>
      <p className="sr-only">
        Building View Of {props.projectName ?? 'The Project'}. Use The Grid View
        To Move Between Units By Keyboard.
      </p>
      <div
        aria-hidden="true"
        className="relative h-[620px] w-full overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 z-[1] select-none">
          {anchors.map((anchor) => (
            <span
              key={anchor.key}
              ref={(node) => {
                if (node) labels.current.set(anchor.key, node)
                else labels.current.delete(anchor.key)
              }}
              className={cn(
                'absolute left-0 top-0 whitespace-nowrap',
                anchor.className
              )}
              style={{ transform: 'translate(-9999px, -9999px)' }}
            >
              {anchor.text}
            </span>
          ))}
        </div>
        <Canvas
          flat
          shadows="soft"
          frameloop="demand"
          dpr={[1, 2]}
          camera={{ fov: FOV, near: 1, far: 5000, position: [-300, 220, 400] }}
        >
          <Scene
            {...props}
            model={model}
            focus={focus}
            side={side}
            nonce={nonce}
            anchors={anchors}
            labels={labels}
          />
        </Canvas>
      </div>
    </div>
  )
}

export default SalesChartBuilding
```

- [ ] **Step 3: Delete the old layout**

Run:
`rtk git rm frontend/src/components/sales-chart/buildingLayout.ts frontend/src/components/sales-chart/__tests__/buildingLayout.test.ts`
Then: `rtk grep -rn "buildingLayout" frontend/src` — expect no hits.

- [ ] **Step 4: Lint, types and tests**

Run: `rtk bun run check` Expected: PASS. The React Compiler lint may flag
mutating a three.js object read from a hook; read it from the store inside an
effect (`get()`), as `Framing` does, rather than disabling the rule.

- [ ] **Step 5: Document the towers**

In `docs/DESIGN.md`'s Building View section, replace the **Scene**, **Shading**,
**Colour** and **Labels** bullets with:

```markdown
- **Scene:** a sales-gallery scale model. Each block is a real tower: a
  double-loaded plate, units 01 onwards left to right along the front and back
  right to left along the rear, end units projecting 1.2m; a white slab edge at
  every floor, fins between bays and a balcony on every unit; a core, water
  tanks and a crown frame on the roof. The towers stand 30m apart on a podium,
  the middle of three set back. A perspective camera with a 30° field of view
  starts from the front left, about 30° above the deck.
- **Shading:** a hemisphere light and one sun from the upper left front cast one
  soft shadow. Tone mapping is off, so a lit top face shows its token's own
  colour. No tinted light, reflections, glow or bloom.
- **Colour:** units read the status tokens; available units read
  `--model-glass`, a pale cool glazing; structure reads `--model-structure` and
  the podium `--model-podium`. In dark mode the model turns to a night model
  with dark structure, so white SPA Signed units stand out. With a filter on,
  the units it does not light and all structure turn see-through and take no
  clicks; the podium stays solid.
- **Labels:** a pill above each roof names its block; every fifth floor and the
  top floor are numbered up the left end of the framed block, in Geist Mono,
  drawn in the DOM over the canvas.
```

and in its **Motion** bullet, after "Dragging turns the building", replace
"within limits" with "all the way round, between 15° and 75° above the deck",
and after "The All and Block presets" add "and the Front and Back switch".

In `docs/agents/notes.md`'s Sales Chart row, replace `buildingLayout.ts` with
`towerModel.ts` (the towers in metres).

- [ ] **Step 6: Check it in a real browser**

Build and serve the app on a local database, sign in as Robert Khoo, open
`/sales-chart` on the Building view, and screenshot:

1. All, Front: three towers with slab edges, balconies, fins, cores and crowns;
   unit colours legible.
2. Back: units 07 to 12 face the camera; the turn went the short way round.
3. Block B: one tower fills the canvas.
4. The Loan Approved, No SPA Appointment filter, Front and Back: the 7 lit units
   show through the see-through structure and open the island on click.
5. Dark mode, All: white SPA Signed units stand out.

Read the draw calls and triangles with `renderer.info.render` (`window.__r3f` is
not exposed; log `gl.info.render` from `onCreated` once, temporarily, and remove
it). Expected: under 60 calls and 300k triangles. Confirm `bun run build` keeps
the Building chunk under 300 kB gzip.

- [ ] **Step 7: Commit**

```bash
rtk git add -A frontend/src docs
rtk git commit -m "feat(sales-chart): draw the blocks as real towers on a podium

Claude-Session: https://claude.ai/code/session_01W7s74co9WkbrhgkSJgxrZZ"
```
