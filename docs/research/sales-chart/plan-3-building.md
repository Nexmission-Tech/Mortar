# Sales Chart Plan 3: The Building View

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans
> to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add the Building view to `/sales-chart`: the project's towers in 3D,
every unit a block in its state's tone, with the same filters, readout and side
sheet as the Grid view.

**Architecture:** A pure `buildingLayout.ts` places each `ChartUnit` in space.
`SalesChartBuilding.tsx` draws them with one `InstancedMesh` through
`@react-three/fiber`, in an orthographic isometric camera that renders on
demand. The page lazy-loads it, so three.js lands in its own chunk, and offers a
Building/Grid switch that falls back to the Grid without WebGL.

**Tech Stack:** three 0.186.1, @react-three/fiber 9.8.1, @react-three/drei
10.7.9 (`OrbitControls`, `Html`), all about 17 days old at the time of writing.

**Spec:** [README.md](README.md), section The Two Views · builds on
[plan 2](plan-2-page.md).

## Global Constraints

- Colours come from the CSS custom properties at runtime; no hex in the scene.
- Flat shading only: an ambient light plus one directional light on Lambert
  boxes gives three fixed face steps. No textures, shadows, glow, gradients or
  transparency.
- `frameloop="demand"`: no animation loop. The camera moves only on input; the
  preset tween runs 200ms and is instant under reduced motion.
- The Grid stays the accessible form; the canvas is `aria-hidden` with a text
  alternative that points to the Grid.
- No new page-level dependency outside the lazy chunk: the main bundle must not
  grow by more than 5 kB gzip.

## Review Focus

1.  No WebGL (old laptop, remote desktop, jsdom): the switch shows the Grid and
    says why; nothing throws.
1.  Dark mode toggled while the Building view is open: block colours follow.
1.  A filter on, then the view switched: the same units stay lit in both views.
1.  A click that ends a drag must not select a unit.
1.  A layout far from the demo (one block, 40 floors, 4 units a floor) still
    frames inside the canvas.

---

### Task 1: Dependencies And Layout

**Files:**

- Modify: `frontend/package.json`, `bun.lock`
  (`bun add three@0.186.1 @react-three/fiber@9.8.1 @react-three/drei@10.7.9` and
  `bun add -d @types/three@0.186.0` in `frontend/`)
- Create: `frontend/src/components/sales-chart/buildingLayout.ts`
- Test: `frontend/src/components/sales-chart/__tests__/buildingLayout.test.ts`

**Interfaces:**

- Produces:
  - `UNIT_SIZE = { w: 0.9, h: 0.72, d: 0.9 }`, `FLOOR_HEIGHT = 0.8`,
    `TOWER_GAP = 2`, `PODIUM_HEIGHT = 0.6`
  - `interface TowerFrame { block: string; center: [number, number, number]; size: [number, number, number] }`
  - `interface BuildingLayout { positions: Map<string, [number, number, number]>; towers: TowerFrame[]; size: [number, number, number]; floors: { label: string; y: number }[] }`
  - `buildingLayout(units: ChartUnit[]): BuildingLayout`

Placement: each block is a slab two units deep. Units `1..ceil(n/2)` run left to
right along the front row (z = +0.5), the rest right to left along the back row
(z = -0.5), so unit numbers wrap the corridor as in a real floor plate. Floor
`y = PODIUM_HEIGHT + (floor - lowest) * FLOOR_HEIGHT + UNIT_SIZE.h / 2`. Blocks
sit side by side along x with `TOWER_GAP` between them; the whole building is
centred on the origin in x and z.

- [ ] **Step 1: Failing tests**

```ts
import { describe, expect, test } from 'vitest'
import { chartUnits, DEFAULT_PROJECT_SETTINGS } from '@mortar/core'
import {
  buildingLayout,
  FLOOR_HEIGHT,
  PODIUM_HEIGHT,
  UNIT_SIZE
} from '../buildingLayout'

const units = chartUnits(DEFAULT_PROJECT_SETTINGS, [])

describe('buildingLayout', () => {
  const layout = buildingLayout(units)

  test('places every unit once, never two in the same spot', () => {
    expect(layout.positions.size).toBe(936)
    const spots = new Set(
      [...layout.positions.values()].map((p) =>
        p.map((v) => v.toFixed(3)).join(',')
      )
    )
    expect(spots.size).toBe(936)
  })

  test('stacks floors upward from the podium', () => {
    const [, y3] = layout.positions.get('A-03-01')!
    const [, y28] = layout.positions.get('A-28-01')!
    expect(y3).toBeCloseTo(PODIUM_HEIGHT + UNIT_SIZE.h / 2)
    expect(y28 - y3).toBeCloseTo(25 * FLOOR_HEIGHT)
  })

  test('wraps unit numbers around the corridor: front row left to right, back row right to left', () => {
    const [x1, , z1] = layout.positions.get('A-03-01')!
    const [x6, , z6] = layout.positions.get('A-03-06')!
    const [x7, , z7] = layout.positions.get('A-03-07')!
    const [x12, , z12] = layout.positions.get('A-03-12')!
    expect(z1).toBeGreaterThan(0)
    expect(z7).toBeLessThan(0)
    expect(x6).toBeGreaterThan(x1)
    expect(x7).toBeCloseTo(x6)
    expect(x12).toBeCloseTo(x1)
    expect(z12).toBeCloseTo(z7)
  })

  test('puts the blocks side by side, centred on the origin', () => {
    expect(layout.towers.map((t) => t.block)).toEqual(['A', 'B', 'C'])
    expect(layout.towers[0]!.center[0]).toBeLessThan(
      layout.towers[1]!.center[0]
    )
    expect(layout.towers[1]!.center[0]).toBeCloseTo(0)
    expect(layout.floors[0]).toMatchObject({ label: '03' })
    expect(layout.floors.at(-1)).toMatchObject({ label: '28' })
  })

  test('copes with a single narrow tower', () => {
    const one = buildingLayout(
      chartUnits(
        {
          ...DEFAULT_PROJECT_SETTINGS,
          blocks: ['T'],
          minFloor: 1,
          maxFloor: 40,
          unitsPerFloor: 3
        },
        []
      )
    )
    expect(one.positions.size).toBe(120)
    expect(one.towers).toHaveLength(1)
    expect(one.towers[0]!.center[0]).toBeCloseTo(0)
  })
})
```

- [ ] **Step 2: Run; expect FAIL**
      (`bunx vitest run src/components/sales-chart`).

- [ ] **Step 3: Implement** `buildingLayout.ts`:

```ts
/** Where each unit sits in the Building view, in scene units. Pure, so it is tested without WebGL. */
import type { ChartUnit } from '@mortar/core'

export const UNIT_SIZE = { w: 0.9, h: 0.72, d: 0.9 } as const
export const FLOOR_HEIGHT = 0.8
export const TOWER_GAP = 2
export const PODIUM_HEIGHT = 0.6

export interface TowerFrame {
  block: string
  center: [number, number, number]
  size: [number, number, number]
}

export interface BuildingLayout {
  positions: Map<string, [number, number, number]>
  towers: TowerFrame[]
  size: [number, number, number]
  floors: { label: string; y: number }[]
}

export function buildingLayout(units: ChartUnit[]): BuildingLayout {
  const blocks = [...new Set(units.map((u) => u.block))]
  const floorsByNumber = new Map(units.map((u) => [u.floor, u.floorLabel]))
  const lowest = Math.min(...floorsByNumber.keys())
  const highest = Math.max(...floorsByNumber.keys())
  const perFloor = Math.max(...units.map((u) => u.unit))
  const cols = Math.ceil(perFloor / 2)
  const towerWidth = cols
  const totalWidth =
    blocks.length * towerWidth + (blocks.length - 1) * TOWER_GAP
  const yOf = (floor: number) =>
    PODIUM_HEIGHT + (floor - lowest) * FLOOR_HEIGHT + UNIT_SIZE.h / 2
  const towerLeft = (i: number) =>
    -totalWidth / 2 + i * (towerWidth + TOWER_GAP)

  const positions = new Map<string, [number, number, number]>()
  for (const unit of units) {
    const i = blocks.indexOf(unit.block)
    const front = unit.unit <= cols
    const col = front ? unit.unit - 1 : perFloor - unit.unit
    positions.set(unit.code, [
      towerLeft(i) + col + 0.5,
      yOf(unit.floor),
      front ? 0.5 : -0.5
    ])
  }
  const height = yOf(highest) + UNIT_SIZE.h / 2
  return {
    positions,
    towers: blocks.map((block, i) => ({
      block,
      center: [towerLeft(i) + towerWidth / 2, height / 2, 0],
      size: [towerWidth, height, 2]
    })),
    size: [totalWidth, height, 2],
    floors: [...floorsByNumber.entries()]
      .sort(([a], [b]) => a - b)
      .map(([floor, label]) => ({ label, y: yOf(floor) }))
  }
}
```

Note: with an odd `perFloor` the back row is one shorter; `col` for the back row
then starts one column in. The tests with 3 units a floor cover it.

- [ ] **Step 4: Run; expect PASS.**
- [ ] **Step 5: Commit**
      `feat(sales-chart): lay out the building view's blocks`.

### Task 2: The Scene, The Switch And The Fallback

**Files:**

- Create: `frontend/src/components/sales-chart/SalesChartBuilding.tsx`
- Create: `frontend/src/components/sales-chart/sceneColors.ts`
- Create: `frontend/src/components/sales-chart/webgl.ts`
- Modify: `frontend/src/pages/SalesChartPage.tsx`
- Test: `frontend/src/pages/__tests__/SalesChartPage.test.tsx` (switch and
  fallback), `frontend/src/components/sales-chart/__tests__/sceneColors.test.ts`

**Interfaces:**

- `SalesChartBuilding(props: { units: ChartUnit[]; lit: ReadonlySet<string> | null; selected: string | null; onSelect: (unit: ChartUnit) => void; onHover: (unit: ChartUnit | null) => void })`
  — the same props as `SalesChartGrid`; default export too, for `React.lazy`.
- `sceneColors(read: (name: string) => string): Record<UnitState | 'ghost' | 'podium' | 'ink', string>`
  reads `--status-info`, `--status-positive`, `--status-warning`,
  `--status-danger`, `--status-signed`, `--card`, `--muted`, `--border`,
  `--foreground`.
- `canUseWebGL(): boolean` — creates a canvas and asks for `webgl2`, then
  `webgl`; false on any throw.

Scene, in `SalesChartBuilding.tsx`:

- `<Canvas orthographic frameloop="demand" dpr={[1, 2]} camera={{ position: [30, 26, 30], zoom: 14, near: -500, far: 500 }}>`
  inside a `h-[560px]` wrapper with `aria-hidden`. A sibling `p.sr-only` reads
  "Building View Of {project}. Use The Grid View To Move Between Units By
  Keyboard."
- `<ambientLight intensity={0.75} />` and
  `<directionalLight position={[-6, 12, 8]} intensity={0.6} />`.
- One `instancedMesh` of `boxGeometry [w, h, d]` and `meshLambertMaterial`, one
  instance per unit; `setMatrixAt` from `buildingLayout`, `setColorAt` from
  `sceneColors` (ghost colour for units a filter leaves out), then
  `instanceColor.needsUpdate = true` and `invalidate()` whenever units, lit or
  colours change.
- The podium: one box per tower, `--muted`, under the units.
- Pointer: `onPointerMove` sets the hovered instance (and
  `document.body.style.cursor`); `onPointerOut` clears it; `onClick` selects
  unless the pointer moved more than 4px since `onPointerDown` (a drag).
- Selected and hovered units: a box one step larger drawn as `lineSegments` of
  `EdgesGeometry`, ink for selected, `--border` for hovered.
- Labels with drei `Html` (DOM, Geist): "Block A" under each tower's front face;
  floor labels on the first tower's left at every fifth floor and the top floor.
- `OrbitControls makeDefault enablePan={false} enableDamping={false}` with
  `minPolarAngle={0.6} maxPolarAngle={1.25}`, azimuth within ±0.9 rad of the
  start, `minZoom={6} maxZoom={60}`.
- Framing: on mount and on resize, zoom so `layout.size` fits the canvas with a
  10% margin, looking at the building's centre.
- Presets: All, then one button per block, above the canvas. Each tweens the
  controls' target and the camera zoom over 200ms with `requestAnimationFrame` +
  `invalidate()`, or jumps when `prefers-reduced-motion: reduce` matches.
- Theme: re-read colours when the `dark` class on `<html>` changes (a
  `MutationObserver` on its `class` attribute).

Page changes:

- A `role="group" aria-label="Chart view"` switch styled like Today's Mine and
  Everyone switch: Building, Grid. Default Building when `canUseWebGL()` and the
  window is at least 720px wide; otherwise Grid. Remember the choice under
  `mortar.salesChart.view` (try/catch around `localStorage`).
- Building renders `<Suspense fallback={<Skeleton className="h-[560px]" />}>`
  around
  `const SalesChartBuilding = lazy(() => import('@/components/sales-chart/SalesChartBuilding'))`.
- Without WebGL the Building button is disabled with an `InfoTooltip`: "This
  Browser Cannot Draw 3D. The Grid Shows The Same Units."

- [ ] **Step 1: Failing tests.** In the page test, mock the scene module:
      `vi.mock('@/components/sales-chart/SalesChartBuilding', () => ({ default: () => <div data-testid="building" /> }))`
      and
      `vi.mock('@/components/sales-chart/webgl', () => ({ canUseWebGL: () => webgl.ok }))`
      with a hoisted `webgl` flag. Tests:
  - With WebGL and a 1280px window, the Building view is the default
    (`findByTestId('building')`); clicking Grid shows the grid and stores `grid`
    under `mortar.salesChart.view`; a remount starts on Grid.
  - Without WebGL, the Grid shows and the Building button is disabled.
  - `sceneColors` maps each state to its variable and falls back to a neutral
    when a variable is empty.
- [ ] **Step 2: Run; expect FAIL.**
- [ ] **Step 3: Implement** the three new modules and the page change as above.
- [ ] **Step 4: Run the frontend suite; expect PASS.**
- [ ] **Step 5: Build and check the chunks.** `bun run build`; the three.js code
      must sit in its own chunk, and the main chunk's gzip size must not grow by
      more than 5 kB against `main`.
- [ ] **Step 6: Look at it** in a real browser at 1440 × 900 against the local
      server: default framing, hover readout, click opens the sheet, a drag does
      not select, filters ghost the rest, presets frame each block, dark mode
      recolours. Screenshot each.
- [ ] **Step 7: Commit** `feat(sales-chart): draw the project as a 3D building`.

### Task 3: The Design Exception, Docs And The Pull Request

- [ ] **Step 1:** `docs/DESIGN.md`: a named exception in the house style, next
      to the existing ones (the landing gradient, the canvas dot grid, the glass
      island): "The Sales Chart's Building view is the one 3D surface in the
      product." Scoped to `/sales-chart`; the six status tones at three fixed
      face steps; no gradient, glow, glass, texture, shadow, autoplay or looping
      motion; moves only on input; no other surface may use three.js. Amend the
      Do Not list's gradient and motion lines to point at it.
- [ ] **Step 2:** `docs/TRD.md` (frontend stack: three.js in a lazy chunk),
      `docs/agents/notes.md` (file map; gotcha: tests mock the scene module
      because jsdom has no WebGL).
- [ ] **Step 3:** `bun run check`, `bun run build`, `bun run format`.
- [ ] **Step 4:** PR with screenshots, `Closes #93` if the pitch pieces are
      already merged, else `Refs #93`; graph refresh last; merge on green.
