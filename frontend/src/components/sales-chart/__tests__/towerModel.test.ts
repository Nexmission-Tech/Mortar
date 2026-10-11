import { describe, expect, it } from 'vitest'
import { chartUnits, DEFAULT_PROJECT_SETTINGS, type ChartUnit, type ProjectSettings } from '@mortar/core'
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
  return [0, 1, 2].every((k) => Math.abs(a.center[k]! - b.center[k]!) < (a.size[k]! + b.size[k]!) / 2 - 1e-6)
}

function noOverlaps(boxes: Box[]): boolean {
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++) if (overlaps(boxes[i]!, boxes[j]!)) return false
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
    const floor = units.filter((u) => u.block === units[0]!.block && u.floor === units[0]!.floor)
    const boxes = floor.sort((a, b) => a.unit - b.unit).map((u) => model.units.get(u.code)!)
    const half = Math.ceil(floor.length / 2)
    const front = boxes.slice(0, half)
    const back = boxes.slice(half)
    expect(front.every((b) => b.side === 'front')).toBe(true)
    expect(back.every((b) => b.side === 'back')).toBe(true)
    for (let i = 1; i < front.length; i++) expect(front[i]!.center[0]).toBeGreaterThan(front[i - 1]!.center[0])
    for (let i = 1; i < back.length; i++) expect(back[i]!.center[0]).toBeLessThan(back[i - 1]!.center[0])
    // Unit 07 stands behind unit 06.
    expect(back[0]!.center[0]).toBeCloseTo(front[front.length - 1]!.center[0])
    expect(back[0]!.center[2]).toBeLessThan(front[front.length - 1]!.center[2])
  })

  it('keeps each stack in line from floor to floor', () => {
    const stack = units.filter((u) => u.block === units[0]!.block && u.unit === 2)
    const xs = new Set(stack.map((u) => model.units.get(u.code)!.center[0].toFixed(3)))
    const zs = new Set(stack.map((u) => model.units.get(u.code)!.center[2].toFixed(3)))
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
        expect(Math.abs(box.center[k]! - podium.center[k]!)).toBeLessThanOrEqual(podium.size[k]! / 2)
    for (const box of model.units.values()) expect(box.center[1]).toBeGreaterThan(podium.size[1])
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
        if (unitsPerFloor <= 12) expect(noOverlaps([...m.units.values()])).toBe(true)
        if (unitsPerFloor === 1) expect([...m.units.values()].every((b) => b.side === 'front')).toBe(true)
        // No setback: every tower stands at the same depth.
        if (blocks.length !== 3) expect(new Set(m.towers.map((t) => t.center[2].toFixed(3))).size).toBe(1)
      }
  })

  it('puts the core inside the plate, between the rows', () => {
    const tower = model.towers[0]!
    const core = model.structure.find((box) => box.size[0] === 8 && Math.abs(box.center[0] - tower.center[0]) < 1e-6)!
    expect(core).toBeTruthy()
    expect(Math.abs(core.center[2] - tower.center[2])).toBeLessThanOrEqual(CORRIDOR)
    expect(core.size[0]).toBeLessThan(BAY_WIDTH * 6)
  })

  it('modelKey ignores unit states', () => {
    const recoloured = units.map((u) => ({ ...u, state: 'signed' as const }))
    expect(modelKey(towerModel(recoloured))).toBe(modelKey(model))
    expect(modelKey(towerModel(project({ maxFloor: 20 })))).not.toBe(modelKey(model))
  })

  it('draws nothing for no units', () => {
    const empty = towerModel([])
    expect(empty.units.size).toBe(0)
    expect(empty.towers).toHaveLength(0)
    expect(empty.structure).toHaveLength(0)
  })
})
