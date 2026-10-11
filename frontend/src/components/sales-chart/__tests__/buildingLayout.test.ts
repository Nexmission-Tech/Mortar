import { describe, expect, test } from 'vitest'
import { chartUnits, DEFAULT_PROJECT_SETTINGS } from '@mortar/core'
import { buildingLayout, FLOOR_HEIGHT, PODIUM_HEIGHT, UNIT_SIZE } from '../buildingLayout'

const units = chartUnits(DEFAULT_PROJECT_SETTINGS, [])

describe('buildingLayout', () => {
  const layout = buildingLayout(units)

  test('places every unit once, never two in the same spot', () => {
    expect(layout.positions.size).toBe(936)
    const spots = new Set([...layout.positions.values()].map((p) => p.map((v) => v.toFixed(3)).join(',')))
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
    expect(z6).toBeCloseTo(z1)
    expect(z7).toBeLessThan(0)
    expect(x6).toBeGreaterThan(x1)
    expect(x7).toBeCloseTo(x6)
    expect(x12).toBeCloseTo(x1)
    expect(z12).toBeCloseTo(z7)
  })

  test('puts the blocks side by side, centred on the origin', () => {
    expect(layout.towers.map((t) => t.block)).toEqual(['A', 'B', 'C'])
    expect(layout.towers[0]!.center[0]).toBeLessThan(layout.towers[1]!.center[0])
    expect(layout.towers[1]!.center[0]).toBeCloseTo(0)
    expect(layout.floors[0]).toMatchObject({ label: '03' })
    expect(layout.floors[layout.floors.length - 1]).toMatchObject({ label: '28' })
  })

  test('copes with a single narrow tower and an odd unit count', () => {
    const one = buildingLayout(
      chartUnits({ ...DEFAULT_PROJECT_SETTINGS, blocks: ['T'], minFloor: 1, maxFloor: 40, unitsPerFloor: 3 }, [])
    )
    expect(one.positions.size).toBe(120)
    expect(one.towers).toHaveLength(1)
    expect(one.towers[0]!.center[0]).toBeCloseTo(0)
    const spots = new Set([...one.positions.values()].map((p) => p.map((v) => v.toFixed(3)).join(',')))
    expect(spots.size).toBe(120)
  })

  test('an empty layout gives an empty building', () => {
    const none = buildingLayout([])
    expect(none.positions.size).toBe(0)
    expect(none.towers).toEqual([])
  })
})
