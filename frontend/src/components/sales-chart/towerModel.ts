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
  /** Radians about the x axis; positive tips the +z end down. */
  tilt?: number
}
export interface UnitBox extends Box {
  code: string
  block: string
  side: 'front' | 'back'
  /** The unit's balcony: drawn in the unit's own colour, so a held unit reads at a distance. */
  balcony: Box
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
export const RECESS = 0.25
export const PROJECTION = 1.2
export const BALCONY_DEPTH = 1
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
  /**
   * Where a row's units start, outward from the tower's centre line: the
   * corridor's edge, or the plate's back when a floor has one row.
   */
  const inner = backCount > 0 ? CORRIDOR / 2 : -BAY_DEPTH / 2
  const roof = PODIUM_HEIGHT + storeys * FLOOR_HEIGHT
  const unitHeight = FLOOR_HEIGHT - SLAB
  const top = roof + OVERRUN + FLOOR_HEIGHT
  const step = plateWidth + TOWER_GAP
  const setBackMiddle = blocks.length >= 3 && blocks.length % 2 === 1
  const plateDepth = backCount > 0 ? CORRIDOR + 2 * BAY_DEPTH : BAY_DEPTH
  const crown: [number, number] = [Math.min(CROWN[0], plateWidth - 1), Math.min(CROWN[1], plateDepth - 1)]

  const slotOf = (n: number) =>
    n <= frontCount
      ? { side: 'front' as const, slot: n - 1, count: frontCount }
      : { side: 'back' as const, slot: n - frontCount - 1, count: backCount }
  const projects = (count: number, slot: number) => count >= 3 && (slot === 0 || slot === count - 1)
  const xOf = (side: 'front' | 'back', slot: number) =>
    side === 'front' ? -plateWidth / 2 + (slot + 0.5) * BAY_WIDTH : plateWidth / 2 - (slot + 0.5) * BAY_WIDTH
  /** A bay boundary's x: boundaries run left to right along the front, right to left along the back. */
  const boundaryX = (side: 'front' | 'back', b: number) =>
    side === 'front' ? -plateWidth / 2 + b * BAY_WIDTH : plateWidth / 2 - b * BAY_WIDTH
  const sign = (side: 'front' | 'back') => (side === 'front' ? 1 : -1)
  /** A unit's outward face, from the centre line. A projecting end unit is deeper, not moved, so no floor has a hole. */
  const faceOf = (count: number, slot: number) => inner + BAY_DEPTH + (projects(count, slot) ? PROJECTION : 0)
  /** How far a row reaches, balconies included. */
  const reachOf = (count: number) => inner + BAY_DEPTH + (count >= 3 ? PROJECTION : 0) + RECESS + SLAB + BALCONY_DEPTH
  const yOf = (i: number) => PODIUM_HEIGHT + i * FLOOR_HEIGHT + SLAB + unitHeight / 2

  const unitBoxes = new Map<string, UnitBox>()
  const structure: Box[] = []
  const towers: TowerFrame[] = []
  const box = (center: Vec3, size: Vec3) => structure.push({ center, size })
  /** A box spanning `from` to `to` outward from the centre line, on one side. */
  const zSpan = (oz: number, s: number, from: number, to: number) => oz + (s * (from + to)) / 2

  blocks.forEach((block, i) => {
    const ox = (i - (blocks.length - 1) / 2) * step
    const oz = setBackMiddle && i === (blocks.length - 1) / 2 ? -MIDDLE_SETBACK : 0
    const rows = (['front', 'back'] as const).filter((side) => (side === 'front' ? frontCount : backCount) > 0)

    for (const unit of units) {
      if (unit.block !== block) continue
      const { side, slot, count } = slotOf(unit.unit)
      const s = sign(side)
      const face = faceOf(count, slot)
      const level = floorIndex.get(unit.floor)!
      const x = ox + xOf(side, slot)
      unitBoxes.set(unit.code, {
        code: unit.code,
        block,
        side,
        center: [x, yOf(level), zSpan(oz, s, inner, face)],
        size: [BAY_WIDTH - SLAB, unitHeight, face - inner],
        balcony: {
          center: [
            x,
            PODIUM_HEIGHT + level * FLOOR_HEIGHT + SLAB / 2,
            oz + s * (face + RECESS + SLAB + BALCONY_DEPTH / 2)
          ],
          size: [BAY_WIDTH * 0.7, SLAB / 2, BALCONY_DEPTH]
        }
      })
    }

    for (const side of rows) {
      const count = side === 'front' ? frontCount : backCount
      const s = sign(side)
      for (let slot = 0; slot < count; slot++) {
        const x = ox + xOf(side, slot)
        const face = faceOf(count, slot)
        const edge = face + RECESS + SLAB
        // A slab under every bay at every level, roof included, from the corridor to 0.3m proud of the frame.
        for (let level = 0; level <= storeys; level++)
          box(
            [x, PODIUM_HEIGHT + level * FLOOR_HEIGHT + SLAB / 2, zSpan(oz, s, inner, edge)],
            [BAY_WIDTH, SLAB, edge - inner]
          )
        // The parapet along the bay's outward edge.
        box([x, roof + PARAPET / 2, oz + s * (face + RECESS + SLAB / 2)], [BAY_WIDTH, PARAPET, SLAB])
      }
      // A fin at every bay boundary, at the frame plane of the further-out neighbour; the row's end fins sit inside it.
      for (let b = 0; b <= count; b++) {
        const out = Math.max(b > 0 ? faceOf(count, b - 1) : 0, b < count ? faceOf(count, b) : 0)
        const inward = b === 0 ? 1 : b === count ? -1 : 0
        const x = boundaryX(side, b) + inward * (side === 'front' ? 1 : -1) * (SLAB / 2)
        box(
          [ox + x, PODIUM_HEIGHT + (storeys * FLOOR_HEIGHT) / 2, oz + s * (out + RECESS / 2)],
          [SLAB, storeys * FLOOR_HEIGHT, RECESS]
        )
      }
      // The roof's end walls at the row's two ends, from the centre line (or the plate's back) to the end bay's edge.
      const from = backCount > 0 ? 0 : inner
      for (const [b, slot] of [
        [0, 0],
        [count, count - 1]
      ] as const) {
        const edge = faceOf(count, slot) + RECESS + SLAB
        const inward = b === 0 ? 1 : -1
        const x = boundaryX(side, b) + inward * (side === 'front' ? 1 : -1) * (SLAB / 2)
        box([ox + x, roof + PARAPET / 2, zSpan(oz, s, from, edge)], [SLAB, PARAPET, edge - from])
      }
    }

    if (backCount > 0) {
      // The corridor's slab at every level.
      for (let level = 0; level <= storeys; level++)
        box([ox, PODIUM_HEIGHT + level * FLOOR_HEIGHT + SLAB / 2, oz], [plateWidth, SLAB, CORRIDOR])
      // A short back row leaves its left end open: close it with a blank wall up the corridor's edge.
      const open = (frontCount - backCount) * BAY_WIDTH
      if (open > 0) {
        const x = -plateWidth / 2 + open / 2
        box(
          [ox + x, PODIUM_HEIGHT + (storeys * FLOOR_HEIGHT) / 2, oz - CORRIDOR / 2 - SLAB / 2],
          [open, storeys * FLOOR_HEIGHT, SLAB]
        )
        box([ox + x, roof + PARAPET / 2, oz - CORRIDOR / 2 - SLAB / 2], [open, PARAPET, SLAB])
      }
    } else {
      // One row: a parapet along the plate's back.
      box([ox, roof + PARAPET / 2, oz + inner + SLAB / 2], [plateWidth, PARAPET, SLAB])
    }

    // The core's overrun with two water tanks on it, and a crown frame one floor tall round them.
    box([ox, roof + OVERRUN / 2, oz], CORE)
    for (const end of [-1, 1]) box([ox + end * 2, roof + OVERRUN + TANK[1] / 2, oz], TANK)
    const [cw, cd] = crown
    const crownBase = roof + OVERRUN
    for (const [dx, dz] of [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1]
    ] as const)
      box([ox + (dx * cw) / 2, crownBase + FLOOR_HEIGHT / 2, oz + (dz * cd) / 2], [BEAM, FLOOR_HEIGHT, BEAM])
    for (const dz of [-1, 1]) box([ox, crownBase + FLOOR_HEIGHT - BEAM / 2, oz + (dz * cd) / 2], [cw, BEAM, BEAM])
    for (const dx of [-1, 1]) box([ox + (dx * cw) / 2, crownBase + FLOOR_HEIGHT - BEAM / 2, oz], [BEAM, BEAM, cd])

    const frontReach = reachOf(frontCount)
    const backReach = backCount > 0 ? reachOf(backCount) : -inner
    towers.push({
      block,
      center: [ox, top / 2, oz + (frontReach - backReach) / 2],
      size: [plateWidth, top, frontReach + backReach],
      roof,
      left: ox - plateWidth / 2,
      front: oz + inner + BAY_DEPTH + RECESS
    })
  })

  const minX = Math.min(...towers.map((t) => t.center[0] - t.size[0] / 2)) - PODIUM_MARGIN
  const maxX = Math.max(...towers.map((t) => t.center[0] + t.size[0] / 2)) + PODIUM_MARGIN
  const minZ = Math.min(...towers.map((t) => t.center[2] - t.size[2] / 2)) - PODIUM_MARGIN
  const maxZ = Math.max(...towers.map((t) => t.center[2] + t.size[2] / 2)) + PODIUM_MARGIN + DECK_DEPTH
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
