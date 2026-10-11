/**
 * Where each unit sits in the Building view, in scene units. Each block is a
 * slab two units deep: units 1 to half run left to right along the front row,
 * the rest come back right to left along the rear, as numbers wrap a corridor
 * on a real floor plate. Pure, so it is tested without WebGL.
 */
import type { ChartUnit } from '@mortar/core'

export const UNIT_SIZE = { w: 0.9, h: 0.72, d: 0.9 } as const
export const FLOOR_HEIGHT = 0.8
export const TOWER_GAP = 2
export const PODIUM_HEIGHT = 0.6

export type Vec3 = [number, number, number]

export interface TowerFrame {
  block: string
  center: Vec3
  size: Vec3
}

export interface BuildingLayout {
  positions: Map<string, Vec3>
  towers: TowerFrame[]
  size: Vec3
  floors: { label: string; y: number }[]
}

export function buildingLayout(units: ChartUnit[]): BuildingLayout {
  if (units.length === 0) return { positions: new Map(), towers: [], size: [0, 0, 0], floors: [] }
  const blocks = [...new Set(units.map((u) => u.block))]
  const floorLabels = new Map(units.map((u) => [u.floor, u.floorLabel]))
  const floorNumbers = [...floorLabels.keys()].sort((a, b) => a - b)
  const lowest = floorNumbers[0]!
  const highest = floorNumbers[floorNumbers.length - 1]!
  const perFloor = Math.max(...units.map((u) => u.unit))
  const cols = Math.ceil(perFloor / 2)
  const totalWidth = blocks.length * cols + (blocks.length - 1) * TOWER_GAP
  const yOf = (floor: number) => PODIUM_HEIGHT + (floor - lowest) * FLOOR_HEIGHT + UNIT_SIZE.h / 2
  const towerLeft = (i: number) => -totalWidth / 2 + i * (cols + TOWER_GAP)

  const positions = new Map<string, Vec3>()
  for (const unit of units) {
    const i = blocks.indexOf(unit.block)
    const front = unit.unit <= cols
    // The rear row runs back from the far end, so unit `perFloor` sits behind unit 1.
    const col = front ? unit.unit - 1 : perFloor - unit.unit
    positions.set(unit.code, [towerLeft(i) + col + 0.5, yOf(unit.floor), front ? 0.5 : -0.5])
  }
  const height = yOf(highest) + UNIT_SIZE.h / 2
  return {
    positions,
    towers: blocks.map((block, i) => ({
      block,
      center: [towerLeft(i) + cols / 2, height / 2, 0],
      size: [cols, height, 2]
    })),
    size: [totalWidth, height, 2],
    floors: floorNumbers.map((floor) => ({ label: floorLabels.get(floor)!, y: yOf(floor) }))
  }
}
