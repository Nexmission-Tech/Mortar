import { describe, expect, it } from 'vitest'
import { chartUnits, DEFAULT_PROJECT_SETTINGS, type ProjectSettings } from '@mortar/core'
import { siteModel, type SiteBox } from '@/components/sales-chart/siteModel'
import { towerModel, PODIUM_HEIGHT, type TowerModel } from '@/components/sales-chart/towerModel'

const towersFor = (patch: Partial<ProjectSettings> = {}): TowerModel =>
  towerModel(chartUnits({ ...DEFAULT_PROJECT_SETTINGS, ...patch }, []))

type Rect = { min: [number, number]; max: [number, number] }
const rectOf = (box: SiteBox): Rect => ({
  min: [box.center[0] - box.size[0] / 2, box.center[2] - box.size[2] / 2],
  max: [box.center[0] + box.size[0] / 2, box.center[2] + box.size[2] / 2]
})
const overlap = (a: Rect, b: Rect) =>
  a.min[0] < b.max[0] - 1e-6 && b.min[0] < a.max[0] - 1e-6 && a.min[1] < b.max[1] - 1e-6 && b.min[1] < a.max[1] - 1e-6
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
      for (const tower of towerRects(towers)) expect(overlap(rectOf(box), tower)).toBe(false)
  })

  it('puts every deck feature on the podium', () => {
    for (const box of deckFeatures(site.boxes)) {
      const r = rectOf(box)
      expect(inside(r.min, site.podium) && inside(r.max, site.podium)).toBe(true)
    }
  })

  it('builds the spec’s facilities', () => {
    const texts = site.labels.filter((l) => l.kind === 'facility').map((l) => l.text)
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
    const pool = site.boxes.find((b) => b.material === 'water' && b.size[0] === 25)
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
        for (const tower of towerRects(t)) expect(overlap(rectOf(box), tower)).toBe(false)
      expect(s.labels.filter((l) => l.kind === 'facility').length).toBeGreaterThanOrEqual(9)
    }
  })

  it('is the same every time', () => {
    expect(siteModel(towers, 'Aster Heights')).toEqual(site)
  })

  it('names the project on the plate', () => {
    expect(site.labels.find((l) => l.kind === 'nameplate')?.text).toBe('Aster Heights')
  })
})

describe('siteModel across project shapes', () => {
  const shapes = [1, 2, 3, 4].flatMap((count) =>
    [4, 7, 12].map((unitsPerFloor) => ({ blocks: ['A', 'B', 'C', 'D'].slice(0, count), unitsPerFloor }))
  )

  it.each(shapes)('places $blocks.length block(s) of $unitsPerFloor units without collisions', (shape) => {
    const towers = towersFor(shape)
    const site = siteModel(towers, 'Aster Heights')
    for (const spot of site.deck) {
      expect(inside(spot.rect.min, site.podium) && inside(spot.rect.max, site.podium)).toBe(true)
      for (const tower of towerRects(towers)) expect(overlap(spot.rect, tower), spot.key).toBe(false)
    }
    for (const [i, a] of site.deck.entries())
      for (const b of site.deck.slice(i + 1)) expect(overlap(a.rect, b.rect), `${a.key} / ${b.key}`).toBe(false)
    for (const box of deckFeatures(site.boxes)) {
      const r = rectOf(box)
      expect(inside(r.min, site.podium) && inside(r.max, site.podium)).toBe(true)
    }
    const deckTrees = site.trees.filter((t) => t.at[1] > PODIUM_HEIGHT)
    for (const tree of deckTrees)
      for (const spot of site.deck) expect(inside([tree.at[0], tree.at[2]], spot.rect), spot.key).toBe(false)
  })

  it('keeps the usual facilities on the default site', () => {
    const keys = siteModel(towersFor(), 'Aster Heights').deck.map((s) => s.key)
    for (const key of ['lap-pool', 'children-pool', 'gym', 'hall', 'bbq', 'lawn', 'playground'])
      expect(keys).toContain(key)
  })

  it('draws nothing for a project with no units', () => {
    const site = siteModel(towerModel([]), 'Aster Heights')
    expect(site.boxes).toEqual([])
    expect(site.labels).toEqual([])
  })
})
