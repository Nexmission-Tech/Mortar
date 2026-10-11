import { describe, expect, test } from 'vitest'
import { chartUnits, DEFAULT_PROJECT_SETTINGS } from '@mortar/core'
import { buildingLayout, FLOOR_HEIGHT, layoutKey, PODIUM_HEIGHT, UNIT_SIZE } from '../buildingLayout'

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

  test('runs each floor’s units left to right in one row facing the viewer', () => {
    const [x1, , z1] = layout.positions.get('A-03-01')!
    const [x2] = layout.positions.get('A-03-02')!
    const [x12, , z12] = layout.positions.get('A-03-12')!
    expect(x2 - x1).toBeCloseTo(1)
    expect(x12 - x1).toBeCloseTo(11)
    expect(z1).toBe(0)
    expect(z12).toBe(0)
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

  test('keys the framing on the building’s shape, not on unit states', () => {
    const recoloured = chartUnits(DEFAULT_PROJECT_SETTINGS, [
      { code: 'A-03-01', state: 'signed', bookingId: 'BK-1', heldBy: 'Nurul Aina' }
    ])
    expect(layoutKey(buildingLayout(recoloured))).toBe(layoutKey(layout))
    const smaller = chartUnits({ ...DEFAULT_PROJECT_SETTINGS, blocks: ['A', 'B'] }, [])
    expect(layoutKey(buildingLayout(smaller))).not.toBe(layoutKey(layout))
  })
})
