/**
 * Where each unit sits in the Building view, in scene units. Each block is a
 * slab one unit deep with its units in a row, left to right, so every unit
 * faces the viewer as it does on a sales chart; the blocks stand side by side.
 * Pure, so it is tested without WebGL.
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
  const cols = Math.max(...units.map((u) => u.unit))
  const totalWidth = blocks.length * cols + (blocks.length - 1) * TOWER_GAP
  const yOf = (floor: number) => PODIUM_HEIGHT + (floor - lowest) * FLOOR_HEIGHT + UNIT_SIZE.h / 2
  const towerLeft = (i: number) => -totalWidth / 2 + i * (cols + TOWER_GAP)

  const positions = new Map<string, Vec3>()
  for (const unit of units) {
    const i = blocks.indexOf(unit.block)
    positions.set(unit.code, [towerLeft(i) + unit.unit - 0.5, yOf(unit.floor), 0])
  }
  const height = yOf(highest) + UNIT_SIZE.h / 2
  return {
    positions,
    towers: blocks.map((block, i) => ({
      block,
      center: [towerLeft(i) + cols / 2, height / 2, 0],
      size: [cols, height, 1]
    })),
    size: [totalWidth, height, 1],
    floors: floorNumbers.map((floor) => ({ label: floorLabels.get(floor)!, y: yOf(floor) }))
  }
}
