# Showhouse Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** The Building view becomes the whole sales-gallery model: a timber
plinth with roads, an arrival with a guardhouse and drop-off, a landscaped
facility deck on the podium, trees, quiet neighbours and labels, round the
towers from plan 5.

**Architecture:** A pure `siteModel.ts` turns the tower model into site boxes
grouped by material, trees and label anchors, all in metres. The scene draws
each material group as one instanced mesh and the trees as three instanced
meshes, so the site adds about 15 draw calls. The All framing fits the plinth.

**Tech Stack:** three 0.186.1, @react-three/fiber 9.8.1, Vitest.

**Spec:** `docs/research/sales-chart/showhouse-model.md` (The Site, The Look).

## Global Constraints

- One scene unit is one metre. Sizes from the spec: guardhouse 4 by 6 m between
  two 3.5 m barrier lanes; drop-off canopy 15 by 8 m; water feature 8 by 3 m;
  lap pool 25 by 8 m on a terrace; children's pool 6 by 6 m; lawn 15 by 20 m;
  playground 10 by 12 m; two BBQ pavilions 5 by 4 m; gym 15 by 12 m in glass;
  hall 18 by 12 m; jogging loop 2 m wide; shade tree canopies 4.4 to 6.8 m
  across; palms at the arrival.
- Deterministic: no `Math.random`; variation comes from each item's index.
- Landscape colours are muted tokens; status colours stay the loudest thing.
- Facility labels show in the All framing only; the name plate and north arrow
  show in All too. Labels are DOM over the canvas.
- No cars or people.
- Budgets after both plans: under 60 draw calls and 300k triangles; the Building
  chunk under 300 kB gzip.
- Run commands with `rtk` when it is installed; finish with `bun run check`,
  then `bun run format`.

## Review Focus

1. **One block, or four:** the deck features fall back to the front deck when
   there are no gaps between towers, and nothing overlaps a tower. Pinned in
   Task 1 (`fits any block count`).
2. **The setback middle tower:** the walkway and deck clear its front, which is
   12 m further back. Pinned in Task 1 (`keeps the deck clear of every tower`).
3. **Trees in the road or the driveway:** none. Pinned in Task 1
   (`keeps trees off roads, the driveway and the podium`).
4. **A refresh while framed on All:** the plinth-sized frame is still keyed by
   the model's shape, so a recolour does not reframe. Checked in Task 2 Step 5.
5. **Dark mode:** the landscape stays a night model, darker than the units.
   Checked in Task 2 Step 5.

---

### Task 1: The Site Model

**Files:**

- Create: `frontend/src/components/sales-chart/siteModel.ts`
- Create: `frontend/src/components/sales-chart/__tests__/siteModel.test.ts`
- Modify: `frontend/src/components/sales-chart/towerModel.ts` (`Box` gains an
  optional `tilt`)

**Interfaces:**

- Consumes: `towerModel`, `TowerModel`, `Box`, `Vec3`, `PODIUM_HEIGHT` from
  `./towerModel`.
- Produces:

```ts
export type SiteMaterial =
  | 'plinth'
  | 'ground'
  | 'paving'
  | 'stone'
  | 'road'
  | 'lane'
  | 'lawn'
  | 'water'
  | 'foliage'
  | 'track'
  | 'structure'
  | 'glass'
  | 'neighbour'
  | 'band'
export interface SiteBox extends Box {
  material: SiteMaterial
}
export interface Tree {
  at: Vec3
  canopy: number
  trunk: number
  kind: 'shade' | 'palm'
}
export interface SiteLabel {
  key: string
  text: string
  at: Vec3
  kind: 'facility' | 'nameplate' | 'north'
}
export interface SiteModel {
  boxes: SiteBox[]
  trees: Tree[]
  labels: SiteLabel[]
  bounds: { min: Vec3; max: Vec3 }
  roads: { min: [number, number]; max: [number, number] }[]
  driveway: { min: [number, number]; max: [number, number] }
  podium: { min: [number, number]; max: [number, number] }
}
export function siteModel(towers: TowerModel, projectName: string): SiteModel
```

`Box` in `towerModel.ts` gains `tilt?: number`, a rotation in radians about the
x axis (positive tips the +z end down), used by the car park ramp.

- [ ] **Step 1: Write the failing test**

Create `frontend/src/components/sales-chart/__tests__/siteModel.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  chartUnits,
  DEFAULT_PROJECT_SETTINGS,
  type ProjectSettings
} from '@mortar/core'
import { siteModel, type SiteBox } from '@/components/sales-chart/siteModel'
import {
  towerModel,
  PODIUM_HEIGHT,
  type TowerModel
} from '@/components/sales-chart/towerModel'

const towersFor = (patch: Partial<ProjectSettings> = {}): TowerModel =>
  towerModel(chartUnits({ ...DEFAULT_PROJECT_SETTINGS, ...patch }, []))

type Rect = { min: [number, number]; max: [number, number] }
const rectOf = (box: SiteBox): Rect => ({
  min: [box.center[0] - box.size[0] / 2, box.center[2] - box.size[2] / 2],
  max: [box.center[0] + box.size[0] / 2, box.center[2] + box.size[2] / 2]
})
const overlap = (a: Rect, b: Rect) =>
  a.min[0] < b.max[0] - 1e-6 &&
  b.min[0] < a.max[0] - 1e-6 &&
  a.min[1] < b.max[1] - 1e-6 &&
  b.min[1] < a.max[1] - 1e-6
const inside = (p: [number, number], r: Rect) =>
  p[0] >= r.min[0] && p[0] <= r.max[0] && p[1] >= r.min[1] && p[1] <= r.max[1]
const towerRects = (towers: TowerModel): Rect[] =>
  towers.towers.map((t) => ({
    min: [t.center[0] - t.size[0] / 2, t.center[2] - t.size[2] / 2],
    max: [t.center[0] + t.size[0] / 2, t.center[2] + t.size[2] / 2]
  }))
/** Deck features: everything standing on the podium's roof except its paving, planted edge and walkway. */
const deckFeatures = (boxes: SiteBox[]) =>
  boxes.filter(
    (b) =>
      b.center[1] > PODIUM_HEIGHT &&
      b.center[1] < PODIUM_HEIGHT + 6 &&
      ['water', 'lawn', 'stone', 'glass', 'track'].includes(b.material)
  )

describe('siteModel', () => {
  const towers = towersFor()
  const site = siteModel(towers, 'Aster Heights')

  it('keeps the deck clear of every tower', () => {
    for (const box of deckFeatures(site.boxes))
      for (const tower of towerRects(towers))
        expect(overlap(rectOf(box), tower)).toBe(false)
  })

  it('puts every deck feature on the podium', () => {
    for (const box of deckFeatures(site.boxes)) {
      const r = rectOf(box)
      expect(inside(r.min, site.podium) && inside(r.max, site.podium)).toBe(
        true
      )
    }
  })

  it('builds the spec’s facilities', () => {
    const texts = site.labels
      .filter((l) => l.kind === 'facility')
      .map((l) => l.text)
    for (const name of [
      'Lap Pool',
      'Children’s Pool',
      'Lawn',
      'Playground',
      'Gym',
      'Hall',
      'BBQ',
      'Guardhouse',
      'Drop-Off'
    ])
      expect(texts).toContain(name)
    const pool = site.boxes.find(
      (b) => b.material === 'water' && b.size[0] === 25
    )
    expect(pool?.size[2]).toBe(8)
  })

  it('keeps trees off roads, the driveway and the podium, and on the plinth', () => {
    expect(site.trees.length).toBeGreaterThan(40)
    for (const tree of site.trees) {
      const p: [number, number] = [tree.at[0], tree.at[2]]
      expect(p[0]).toBeGreaterThan(site.bounds.min[0])
      expect(p[0]).toBeLessThan(site.bounds.max[0])
      expect(p[1]).toBeGreaterThan(site.bounds.min[2])
      expect(p[1]).toBeLessThan(site.bounds.max[2])
      for (const road of site.roads) expect(inside(p, road)).toBe(false)
      expect(inside(p, site.driveway)).toBe(false)
      // Ground trees stand off the podium; deck trees stand on it.
      if (tree.at[1] < 1) expect(inside(p, site.podium)).toBe(false)
    }
  })

  it('runs the main road the plinth’s full width and meets the side road', () => {
    const [main, side] = site.roads
    expect(main!.min[0]).toBeCloseTo(site.bounds.min[0])
    expect(main!.max[0]).toBeCloseTo(site.bounds.max[0])
    expect(overlap(main!, side!)).toBe(true)
  })

  it('opens the driveway from the main road to the podium', () => {
    const [main] = site.roads
    expect(site.driveway.max[1]).toBeCloseTo(main!.min[1])
    expect(site.driveway.min[1]).toBeCloseTo(site.podium.max[1])
  })

  it('fits any block count', () => {
    for (const blocks of [['A'], ['A', 'B'], ['A', 'B', 'C', 'D']]) {
      const t = towersFor({ blocks, minFloor: 3, maxFloor: 8 })
      const s = siteModel(t, 'X')
      for (const box of deckFeatures(s.boxes))
        for (const tower of towerRects(t))
          expect(overlap(rectOf(box), tower)).toBe(false)
      expect(
        s.labels.filter((l) => l.kind === 'facility').length
      ).toBeGreaterThanOrEqual(9)
    }
  })

  it('is the same every time', () => {
    expect(siteModel(towers, 'Aster Heights')).toEqual(site)
  })

  it('names the project on the plate', () => {
    expect(site.labels.find((l) => l.kind === 'nameplate')?.text).toBe(
      'Aster Heights'
    )
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `rtk bun run --cwd frontend test -- siteModel` Expected: FAIL with "Failed
to resolve import ... siteModel".

- [ ] **Step 3: Implement**

In `frontend/src/components/sales-chart/towerModel.ts`, change `Box` to:

```ts
export interface Box {
  center: Vec3
  size: Vec3
  /** Radians about the x axis; positive tips the +z end down. */
  tilt?: number
}
```

Create `frontend/src/components/sales-chart/siteModel.ts`:

```ts
/**
 * The sales-gallery model round the towers, in metres: a timber plinth, a main
 * and a side road, an arrival with a guardhouse, drop-off and water feature, a
 * car park ramp, the podium's ventilation bands and planted edge, a facility
 * deck on its roof (lap and children's pools, lawn, playground, BBQ pavilions,
 * gym, hall, jogging loop, covered walkway), trees, quiet neighbours and the
 * labels. Pure and deterministic, so it is tested without WebGL.
 */
import {
  PODIUM_HEIGHT,
  type Box,
  type TowerModel,
  type Vec3
} from './towerModel'

export type SiteMaterial =
  | 'plinth'
  | 'ground'
  | 'paving'
  | 'stone'
  | 'road'
  | 'lane'
  | 'lawn'
  | 'water'
  | 'foliage'
  | 'track'
  | 'structure'
  | 'glass'
  | 'neighbour'
  | 'band'
export interface SiteBox extends Box {
  material: SiteMaterial
}
export interface Tree {
  at: Vec3
  canopy: number
  trunk: number
  kind: 'shade' | 'palm'
}
export interface SiteLabel {
  key: string
  text: string
  at: Vec3
  kind: 'facility' | 'nameplate' | 'north'
}
type Rect = { min: [number, number]; max: [number, number] }
export interface SiteModel {
  boxes: SiteBox[]
  trees: Tree[]
  labels: SiteLabel[]
  bounds: { min: Vec3; max: Vec3 }
  roads: Rect[]
  driveway: Rect
  podium: Rect
}

const STRIP = 18
const MAIN_ROAD = 14
const SIDE_ROAD = 12
const VERGE = 5
const ACROSS = 30
const LEFT = 34
const PLINTH = 2.5
const DECK = PODIUM_HEIGHT

/** A small, stable 0–1 variation from an index, so nothing moves between renders. */
const vary = (i: number, salt: number) =>
  (((i + 1) * 9301 + salt * 49297) % 233280) / 233280

export function siteModel(towers: TowerModel, projectName: string): SiteModel {
  const boxes: SiteBox[] = []
  const trees: Tree[] = []
  const labels: SiteLabel[] = []
  const add = (
    material: SiteMaterial,
    center: Vec3,
    size: Vec3,
    tilt?: number
  ) =>
    boxes.push(
      tilt === undefined
        ? { material, center, size }
        : { material, center, size, tilt }
    )
  const label = (kind: SiteLabel['kind'], text: string, at: Vec3) =>
    labels.push({ key: `${kind}-${text}`, text, at, kind })

  const { center: pc, size: ps } = towers.podium
  const px0 = pc[0] - ps[0] / 2
  const px1 = pc[0] + ps[0] / 2
  const pz0 = pc[2] - ps[2] / 2
  const pz1 = pc[2] + ps[2] / 2

  // The site boundary, the roads and the plinth round them.
  const sx0 = px0 - STRIP
  const sx1 = px1 + STRIP
  const sz0 = pz0 - STRIP
  const sz1 = pz1 + STRIP
  const x0 = sx0 - LEFT
  const x1 = sx1 + SIDE_ROAD + VERGE
  const z0 = sz0 - VERGE
  const z1 = sz1 + MAIN_ROAD + ACROSS
  const W = x1 - x0
  const D = z1 - z0
  add('plinth', [(x0 + x1) / 2, -PLINTH / 2, (z0 + z1) / 2], [W, PLINTH, D])
  add('ground', [(x0 + x1) / 2, 0.05, (z0 + z1) / 2], [W, 0.1, D])
  add(
    'lawn',
    [(sx0 + sx1) / 2, 0.12, (sz0 + sz1) / 2],
    [sx1 - sx0, 0.04, sz1 - sz0]
  )

  const main: Rect = { min: [x0, sz1], max: [x1, sz1 + MAIN_ROAD] }
  const side: Rect = { min: [sx1, z0], max: [sx1 + SIDE_ROAD, sz1 + MAIN_ROAD] }
  for (const road of [main, side])
    add(
      'road',
      [(road.min[0] + road.max[0]) / 2, 0.16, (road.min[1] + road.max[1]) / 2],
      [road.max[0] - road.min[0], 0.04, road.max[1] - road.min[1]]
    )
  // Dashed centre lines, stopping short of the junction.
  for (let x = x0 + 4; x < sx1 - 4; x += 7)
    add('lane', [x + 1.5, 0.2, sz1 + MAIN_ROAD / 2], [3, 0.02, 0.25])
  for (let z = z0 + 4; z < sz1 - 4; z += 7)
    add('lane', [sx1 + SIDE_ROAD / 2, 0.2, z + 1.5], [0.25, 0.02, 3])

  // The arrival: a driveway off the main road, a guardhouse between two barrier
  // lanes, a drop-off canopy at the podium front and a water feature beside it.
  const ex = px1 - 26
  const driveway: Rect = { min: [ex - 5.5, pz1], max: [ex + 5.5, sz1] }
  add('paving', [ex, 0.18, (pz1 + sz1) / 2], [11, 0.06, sz1 - pz1])
  add('structure', [ex, 1.6, sz1 - 5], [4, 3.2, 6])
  add('structure', [ex, 3.35, sz1 - 5], [5, 0.3, 7])
  for (const lane of [-1, 1])
    add('band', [ex + lane * 3.75, 1, sz1 - 2.5], [3.5, 0.15, 0.15])
  add('structure', [ex, 4.6, pz1 + 4], [15, 0.4, 8])
  for (const post of [-1, 1])
    add('structure', [ex + post * 7, 2.2, pz1 + 7.5], [0.4, 4.4, 0.4])
  add('stone', [ex - 15, 0.25, pz1 + 6], [9, 0.3, 4])
  add('water', [ex - 15, 0.45, pz1 + 6], [8, 0.2, 3])
  label('facility', 'Guardhouse', [ex, 4.5, sz1 - 5])
  label('facility', 'Drop-Off', [ex, 6, pz1 + 4])

  // The car park ramp up the podium's right side, low end to the front.
  const rampLength = 30
  add(
    'paving',
    [px1 + 4.5, 2, pz1 - rampLength / 2 - 4],
    [7, 0.6, rampLength],
    Math.atan2(4, rampLength)
  )

  // The podium: ventilation bands on its faces and a planted edge round its roof.
  for (const y of [2.6, 6]) {
    add('band', [pc[0], y, pz1 + 0.05], [ps[0] - 2, 0.8, 0.1])
    add('band', [pc[0], y, pz0 - 0.05], [ps[0] - 2, 0.8, 0.1])
    add('band', [px0 - 0.05, y, pc[2]], [0.1, 0.8, ps[2] - 2])
    add('band', [px1 + 0.05, y, pc[2]], [0.1, 0.8, ps[2] - 2])
  }
  add('paving', [pc[0], DECK + 0.05, pc[2]], [ps[0] - 0.2, 0.1, ps[2] - 0.2])
  add('foliage', [pc[0], DECK + 0.4, pz1 - 0.7], [ps[0], 0.7, 1.4])
  add('foliage', [pc[0], DECK + 0.4, pz0 + 0.7], [ps[0], 0.7, 1.4])
  add('foliage', [px0 + 0.7, DECK + 0.4, pc[2]], [1.4, 0.7, ps[2]])
  add('foliage', [px1 - 0.7, DECK + 0.4, pc[2]], [1.4, 0.7, ps[2]])

  // The deck in front of the towers, inside the planted edge.
  const towerFront = Math.max(
    ...towers.towers.map((t) => t.center[2] + t.size[2] / 2)
  )
  const dz0 = towerFront + 3
  const dz1 = pz1 - 2.5
  const dx0 = px0 + 2.5
  const dx1 = px1 - 2.5
  const dcx = (dx0 + dx1) / 2
  const dcz = (dz0 + dz1) / 2
  const top = DECK + 0.1

  // Lap pool on its terrace, the children's pool beside it.
  add('stone', [dcx, top + 0.08, dcz], [33, 0.15, 16])
  add('water', [dcx, top + 0.2, dcz], [25, 0.12, 8])
  add('stone', [dcx + 22, top + 0.08, dcz], [10, 0.15, 10])
  add('water', [dcx + 22, top + 0.2, dcz], [6, 0.12, 6])
  label('facility', 'Lap Pool', [dcx, top + 1, dcz])
  label('facility', 'Children’s Pool', [dcx + 22, top + 1, dcz])

  // The jogging loop round the front deck.
  add('track', [dcx, top + 0.03, dz0 + 1], [dx1 - dx0, 0.06, 2])
  add('track', [dcx, top + 0.03, dz1 - 1], [dx1 - dx0, 0.06, 2])
  add('track', [dx0 + 1, top + 0.03, dcz], [2, 0.06, dz1 - dz0])
  add('track', [dx1 - 1, top + 0.03, dcz], [2, 0.06, dz1 - dz0])

  // Gym in glass, hall in white, at the back corners of the front deck.
  add('glass', [dx1 - 11, top + 2, dz0 + 9], [15, 4, 12])
  add('structure', [dx1 - 11, top + 4.15, dz0 + 9], [16, 0.3, 13])
  add('structure', [dx0 + 13, top + 2.25, dz0 + 9], [18, 4.5, 12])
  label('facility', 'Gym', [dx1 - 11, top + 6, dz0 + 9])
  label('facility', 'Hall', [dx0 + 13, top + 6, dz0 + 9])

  // Two BBQ pavilions on the front edge.
  for (const end of [-1, 1]) {
    const x = end < 0 ? dx0 + 9 : dx1 - 9
    add('structure', [x, top + 3, dz1 - 5], [5, 0.3, 4])
    for (const [px, pz] of [
      [-2.2, -1.7],
      [2.2, -1.7],
      [-2.2, 1.7],
      [2.2, 1.7]
    ] as const)
      add('structure', [x + px, top + 1.5, dz1 - 5 + pz], [0.25, 3, 0.25])
  }
  label('facility', 'BBQ', [dx0 + 9, top + 4, dz1 - 5])

  // Lawn and playground in the gaps between towers, or on the front deck when
  // there are none.
  const gaps = towers.towers.slice(1).map((t, i) => {
    const a = towers.towers[i]!
    const left = a.center[0] + a.size[0] / 2
    const right = t.center[0] - t.size[0] / 2
    return {
      x: (left + right) / 2,
      z: Math.min(a.center[2], t.center[2]),
      width: right - left
    }
  })
  const lawnAt: Vec3 =
    gaps[0] && gaps[0].width > 17
      ? [gaps[0].x, top + 0.1, gaps[0].z]
      : [dcx - 30, top + 0.1, dcz]
  const playAt: Vec3 =
    gaps[1] && gaps[1].width > 12
      ? [gaps[1].x, top + 0.1, gaps[1].z]
      : gaps[0] && gaps[0].width > 17
        ? [dcx - 30, top + 0.1, dcz]
        : [dcx + 36, top + 0.1, dcz]
  add('lawn', lawnAt, [15, 0.2, 20])
  add('lawn', playAt, [10, 0.2, 12])
  for (const [px, pz, h] of [
    [-3, -3, 2.5],
    [2.5, 2, 1.6],
    [0, -1, 3.2]
  ] as const)
    add(
      'structure',
      [playAt[0] + px, top + h / 2, playAt[2] + pz],
      [1.2, h, 1.2]
    )
  label('facility', 'Lawn', [lawnAt[0], top + 1, lawnAt[2]])
  label('facility', 'Playground', [playAt[0], top + 4, playAt[2]])

  // The covered walkway in front of the towers, linking their lobbies.
  const first = towers.towers[0]!
  const last = towers.towers[towers.towers.length - 1]!
  const span = last.center[0] - first.center[0]
  if (span > 0) {
    const wz = dz0 - 1.5
    add(
      'structure',
      [(first.center[0] + last.center[0]) / 2, top + 3, wz],
      [span, 0.3, 3]
    )
    for (let x = first.center[0]; x <= last.center[0] + 1e-6; x += 8)
      add('structure', [x, top + 1.5, wz + 1.2], [0.25, 3, 0.25])
  }

  // Trees: shade trees round the site boundary, street trees across the road,
  // a few on the deck and palms at the arrival.
  let n = 0
  const shade = (x: number, z: number, y = 0.1) => {
    trees.push({
      at: [x, y, z],
      canopy: 2.2 + vary(n, 1) * 1.2,
      trunk: 3 + vary(n, 2),
      kind: 'shade'
    })
    n++
  }
  const clearOfArrival = (x: number) => Math.abs(x - ex) > 10
  for (let x = sx0 + 5; x <= sx1 - 5; x += 9) {
    if (clearOfArrival(x)) shade(x, sz1 - 4)
    shade(x, sz0 + 4)
  }
  for (let z = sz0 + 13; z <= sz1 - 13; z += 9) {
    shade(sx0 + 4, z)
    if (z < pz1 - 40 || z > pz1) shade(sx1 - 4, z)
  }
  for (let x = x0 + 8; x <= x1 - 8; x += 12) shade(x, sz1 + MAIN_ROAD + 2.5)
  for (const [dx, dz] of [
    [-18, -9],
    [18, -9],
    [-18, 9],
    [18, 9]
  ] as const)
    shade(dcx + dx, dcz + dz, top)
  for (const [dx, dz] of [
    [-8, 10],
    [8, 10],
    [-8, -10],
    [8, -10]
  ] as const)
    trees.push({
      at: [ex + dx, 0.1, (dz > 0 ? pz1 : sz1) + dz * 0.6],
      canopy: 2.4,
      trunk: 7,
      kind: 'palm'
    })

  // Quiet neighbours: terrace rows across the main road, two blocks on the left.
  for (let x = x0 + 16; x <= x1 - 16; x += 30)
    add('neighbour', [x, 4, sz1 + MAIN_ROAD + 4 + 9], [24, 8, 12])
  for (const z of [sz0 + 30, sz0 + 80])
    add('neighbour', [x0 + LEFT / 2 - 2, 11, z], [16, 22, 36])

  label('nameplate', projectName, [(x0 + x1) / 2, -PLINTH / 2, z1])
  label('north', 'N', [x0 + 6, 0.3, z1 - 6])

  return {
    boxes,
    trees,
    labels,
    bounds: { min: [x0, -PLINTH, z0], max: [x1, towers.bounds.max[1], z1] },
    roads: [main, side],
    driveway,
    podium: { min: [px0, pz0], max: [px1, pz1] }
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `rtk bun run --cwd frontend test -- siteModel towerModel` Expected: PASS.
If `keeps trees off roads...` fails on a palm, move the palm row, never the
road.

- [ ] **Step 5: Commit**

```bash
rtk git add frontend/src/components/sales-chart/siteModel.ts frontend/src/components/sales-chart/__tests__/siteModel.test.ts frontend/src/components/sales-chart/towerModel.ts
rtk git commit -m "feat(sales-chart): model the showhouse site round the towers

Claude-Session: https://claude.ai/code/session_01W7s74co9WkbrhgkSJgxrZZ"
```

---

### Task 2: Draw The Site

**Files:**

- Modify: `frontend/src/globals.css` (site tokens in `:root` and `.dark`)
- Modify: `frontend/src/components/sales-chart/sceneColors.ts` and its test
- Modify: `frontend/src/components/sales-chart/SalesChartBuilding.tsx`
- Modify: `docs/DESIGN.md` (Building View), `docs/agents/notes.md`
- Modify: `docs/demo/mortar-pitch-deck.html` and
  `docs/demo/mortar-pitch-deck.pdf` (slide 7's screenshot)

**Interfaces:**

- Consumes: `siteModel`, `SiteModel`, `SiteMaterial` (Task 1).
- Produces: `SceneColors` gains one key per `SiteMaterial` except `structure`
  and `glass`, which reuse `structure` and `available`.

- [ ] **Step 1: Tokens and colours, test first**

Add to `vars` in `sceneColors.test.ts`:

```ts
    '--model-plinth': 'rgb(20, 20, 20)',
    '--model-ground': 'rgb(21, 21, 21)',
    '--model-paving': 'rgb(22, 22, 22)',
    '--model-stone': 'rgb(23, 23, 23)',
    '--model-road': 'rgb(24, 24, 24)',
    '--model-lane': 'rgb(25, 25, 25)',
    '--model-lawn': 'rgb(26, 26, 26)',
    '--model-water': 'rgb(27, 27, 27)',
    '--model-foliage': 'rgb(28, 28, 28)',
    '--model-track': 'rgb(29, 29, 29)',
    '--model-neighbour': 'rgb(30, 30, 30)',
    '--model-band': 'rgb(31, 31, 31)',
    '--model-trunk': 'rgb(32, 32, 32)',
```

and to the expectations:

```ts
      plinth: 'rgb(20, 20, 20)',
      ground: 'rgb(21, 21, 21)',
      paving: 'rgb(22, 22, 22)',
      stone: 'rgb(23, 23, 23)',
      road: 'rgb(24, 24, 24)',
      lane: 'rgb(25, 25, 25)',
      lawn: 'rgb(26, 26, 26)',
      water: 'rgb(27, 27, 27)',
      foliage: 'rgb(28, 28, 28)',
      track: 'rgb(29, 29, 29)',
      neighbour: 'rgb(30, 30, 30)',
      band: 'rgb(31, 31, 31)',
      trunk: 'rgb(32, 32, 32)',
```

Run: `rtk bun run --cwd frontend test -- sceneColors` — Expected: FAIL.

In `globals.css` `:root`, after the plan 5 model tokens, add:

```css
--model-plinth: #a98a63;
--model-ground: #ebe7e0;
--model-paving: #f2efe9;
--model-stone: #faf8f4;
--model-road: #a6a29a;
--model-lane: #f7f5f0;
--model-lawn: #c3cdb0;
--model-water: #b9d0d9;
--model-foliage: #9dad8c;
--model-track: #d2bfae;
--model-neighbour: #e4e1db;
--model-band: #8f8b84;
--model-trunk: #8a7a64;
```

and in `.dark`, after its model tokens:

```css
--model-plinth: #4a3b29;
--model-ground: #232220;
--model-paving: #2b2a27;
--model-stone: #33322f;
--model-road: #1a1a19;
--model-lane: #55534e;
--model-lawn: #2e3929;
--model-water: #2a3d45;
--model-foliage: #384833;
--model-track: #463a31;
--model-neighbour: #2a2927;
--model-band: #171716;
--model-trunk: #3a3128;
```

In `sceneColors.ts`, extend the `SceneColors` key union with
`'plinth' | 'ground' | 'paving' | 'stone' | 'road' | 'lane' | 'lawn' | 'water' | 'foliage' | 'track' | 'neighbour' | 'band' | 'trunk'`
and add to `TOKENS`:

```ts
  plinth: '--model-plinth',
  ground: '--model-ground',
  paving: '--model-paving',
  stone: '--model-stone',
  road: '--model-road',
  lane: '--model-lane',
  lawn: '--model-lawn',
  water: '--model-water',
  foliage: '--model-foliage',
  track: '--model-track',
  neighbour: '--model-neighbour',
  band: '--model-band',
  trunk: '--model-trunk',
```

Run: `rtk bun run --cwd frontend test -- sceneColors` — Expected: PASS.

- [ ] **Step 2: Draw the site**

In `SalesChartBuilding.tsx`:

1. Import the site:

```tsx
import { siteModel, type SiteMaterial, type SiteModel } from './siteModel'
```

2. Make `writeBoxMatrices` honour `tilt`:

```tsx
function writeBoxMatrices(m: THREE.InstancedMesh, boxes: Box[]) {
  const matrix = new THREE.Matrix4()
  const position = new THREE.Vector3()
  const scale = new THREE.Vector3()
  const rotation = new THREE.Quaternion()
  const euler = new THREE.Euler()
  boxes.forEach((box, i) => {
    rotation.setFromEuler(euler.set(box.tilt ?? 0, 0, 0))
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
}
```

3. Add the site components above `Scene`:

```tsx
const SITE_COLOR: Record<SiteMaterial, keyof SceneColors> = {
  plinth: 'plinth',
  ground: 'ground',
  paving: 'paving',
  stone: 'stone',
  road: 'road',
  lane: 'lane',
  lawn: 'lawn',
  water: 'water',
  foliage: 'foliage',
  track: 'track',
  structure: 'structure',
  glass: 'available',
  neighbour: 'neighbour',
  band: 'band'
}

/** One instanced mesh per material, so the whole site costs about a dozen draw calls. */
function SiteBoxes({ boxes, color }: { boxes: Box[]; color: string }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const invalidate = useThree((st) => st.invalidate)
  useLayoutEffect(() => {
    if (!mesh.current) return
    writeBoxMatrices(mesh.current, boxes)
    invalidate()
  }, [boxes, invalidate])
  if (boxes.length === 0) return null
  return (
    <instancedMesh
      key={boxes.length}
      ref={mesh}
      args={[UNIT_CUBE, undefined, boxes.length]}
      castShadow
      receiveShadow
      raycast={() => null}
    >
      <meshLambertMaterial color={color} />
    </instancedMesh>
  )
}

const TRUNK = new THREE.CylinderGeometry(0.18, 0.25, 1, 6)
const CANOPY = new THREE.IcosahedronGeometry(1, 0)
const FROND = new THREE.ConeGeometry(1, 0.5, 7)

/** Trunks, round canopies for shade trees and flat crowns for palms, each one instanced mesh. */
function Trees({
  trees,
  colors
}: {
  trees: SiteModel['trees']
  colors: SceneColors
}) {
  const parts = useMemo(() => {
    const trunk: Box[] = []
    const canopy: Box[] = []
    const frond: Box[] = []
    for (const t of trees) {
      trunk.push({
        center: [t.at[0], t.at[1] + t.trunk / 2, t.at[2]],
        size: [1, t.trunk, 1]
      })
      if (t.kind === 'palm')
        frond.push({
          center: [t.at[0], t.at[1] + t.trunk, t.at[2]],
          size: [t.canopy, t.canopy * 0.6, t.canopy]
        })
      else
        canopy.push({
          center: [t.at[0], t.at[1] + t.trunk + t.canopy * 0.55, t.at[2]],
          size: [t.canopy, t.canopy * 0.85, t.canopy]
        })
    }
    return { trunk, canopy, frond }
  }, [trees])
  return (
    <>
      <ShapeMesh geometry={TRUNK} boxes={parts.trunk} color={colors.trunk} />
      <ShapeMesh
        geometry={CANOPY}
        boxes={parts.canopy}
        color={colors.foliage}
      />
      <ShapeMesh geometry={FROND} boxes={parts.frond} color={colors.foliage} />
    </>
  )
}

function ShapeMesh({
  geometry,
  boxes,
  color
}: {
  geometry: THREE.BufferGeometry
  boxes: Box[]
  color: string
}) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const invalidate = useThree((st) => st.invalidate)
  useLayoutEffect(() => {
    if (!mesh.current) return
    writeBoxMatrices(mesh.current, boxes)
    invalidate()
  }, [boxes, invalidate])
  if (boxes.length === 0) return null
  return (
    <instancedMesh
      key={boxes.length}
      ref={mesh}
      args={[geometry, undefined, boxes.length]}
      castShadow
      receiveShadow
      raycast={() => null}
    >
      <meshLambertMaterial color={color} flatShading />
    </instancedMesh>
  )
}

function Site({ site, colors }: { site: SiteModel; colors: SceneColors }) {
  const groups = useMemo(() => {
    const byMaterial = new Map<SiteMaterial, Box[]>()
    for (const box of site.boxes)
      byMaterial.set(box.material, [
        ...(byMaterial.get(box.material) ?? []),
        box
      ])
    return [...byMaterial.entries()]
  }, [site])
  return (
    <>
      {groups.map(([material, boxes]) => (
        <SiteBoxes
          key={material}
          boxes={boxes}
          color={colors[SITE_COLOR[material]]}
        />
      ))}
      <Trees trees={site.trees} colors={colors} />
    </>
  )
}
```

4. In `Scene`, take a `site: SiteModel` prop, delete the podium `<mesh>` (the
   site's podium bands sit on the tower model's podium, so keep drawing that one
   podium box but colour it `colors.podium`), and render
   `<Site site={site} colors={colors} />` after `<Lights />`. Pass `site` to
   `Lights` and size the shadow from `site.bounds` instead of the tower bounds.

5. In `SalesChartBuilding`, build the site and pass it down:

```tsx
const site = useMemo(
  () => siteModel(model, props.projectName ?? 'The Project'),
  [model, props.projectName]
)
```

6. In `Framing`, frame All on the site: take a `site` prop and use `site.bounds`
   for the All frame (keep `modelKey(model)` as the reframe key; the site
   follows the model's shape).

7. In `labelAnchors`, add the site's labels when `focus === null`:

```tsx
const FACILITY_LABEL = 'text-[10px] font-medium text-muted-foreground'
const NAMEPLATE_LABEL =
  'rounded-sm border border-border bg-card px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground'
const NORTH_LABEL =
  'flex size-6 items-center justify-center rounded-full border border-border bg-card text-[10px] font-semibold text-foreground'
```

and append, only for `focus === null`,
`site.labels.map((l) => ({ key: l.key, text: l.kind === 'north' ? 'N' : l.text, at: l.at, className: l.kind === 'facility' ? FACILITY_LABEL : l.kind === 'nameplate' ? NAMEPLATE_LABEL : NORTH_LABEL }))`.
`labelAnchors` takes `site` as a fourth argument.

- [ ] **Step 3: Lint, types and tests**

Run: `rtk bun run check` Expected: PASS.

- [ ] **Step 4: Document the site**

In `docs/DESIGN.md`'s Building View section, after the **Scene** bullet, add:

```markdown
- **Site:** the towers stand on a timber plinth with a main road and a side
  road, lane markings and street trees; an arrival with a guardhouse between two
  barrier lanes, a drop-off canopy, a water feature and palms; a car park ramp
  up the podium's side; ventilation bands and a planted edge on the podium; a
  facility deck with a lap pool and a children's pool on a stone terrace, a lawn
  and a playground between the towers, two BBQ pavilions, a glass gym, a hall, a
  jogging loop and a covered walkway; shade trees round the boundary; and quiet
  neighbours across the road. Facility labels, the name plate and a north mark
  show in the All framing only. No cars or people.
```

and in **Colour**, after `--model-podium`, add: "the site reads the `--model-*`
landscape tokens (plinth, ground, paving, stone, road, lane, lawn, water,
foliage, track, neighbour, band, trunk), all muted below the status tones". In
`docs/agents/notes.md`'s Sales Chart row, add `siteModel.ts` (the plinth, roads,
arrival and deck).

- [ ] **Step 5: Check it in a real browser**

Build, serve on a local database, sign in as Robert Khoo and screenshot at
1440px: All (Front and Back), Block B, the closing-list filter, and dark mode.
Read the draw calls and triangles as plan 5 did (expect under 60 and 300k), and
confirm the Building chunk stays under 300 kB gzip.

- [ ] **Step 6: Refresh slide 7**

Replace the Sales Chart screenshot on slide 7 of
`docs/demo/mortar-pitch-deck.html` with a fresh 1440px capture of the All
framing (as a WebP data URI, the way the slide embeds its image today), then
rebuild `docs/demo/mortar-pitch-deck.pdf` with headless Chrome's
`--print-to-pdf` and check it still has 11 pages.

- [ ] **Step 7: Commit**

```bash
rtk git add -A frontend/src docs
rtk git commit -m "feat(sales-chart): set the towers on a landscaped showhouse site

Claude-Session: https://claude.ai/code/session_01W7s74co9WkbrhgkSJgxrZZ"
```
