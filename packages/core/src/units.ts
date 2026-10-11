/**
 * The project's units: how floors and units are numbered, and every unit code
 * the configured layout holds.
 */
import type { ProjectSettings, UnitNumbering } from './projectSettings'
import type { Booking } from './types'

/** Matches the import screen's cap: a layout above it is refused, not drawn. */
export const MAX_PROJECT_UNITS = 10_000

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * A floor or unit number as staff write it. Under `skip-four`, a number that
 * contains a 4 takes the number below with an A: 4 → 03A, 14 → 13A, 24 → 23A.
 */
export function numberLabel(n: number, numbering: UnitNumbering = 'plain'): string {
  return numbering === 'skip-four' && String(n).includes('4') ? `${pad(n - 1)}A` : pad(n)
}

/** A label read back to its number: `23A` → 24, `07` → 7; `null` when it is not a label. */
export function labelNumber(label: string): number | null {
  const match = /^(\d{1,3})(A?)$/.exec(label.trim().toUpperCase())
  if (!match) return null
  return Number.parseInt(match[1]!, 10) + (match[2] ? 1 : 0)
}

export function unitCode(block: string, floor: number, unit: number, numbering: UnitNumbering = 'plain'): string {
  const tail = `${numberLabel(floor, numbering)}-${numberLabel(unit, numbering)}`
  return block ? `${block}-${tail}` : tail
}

export interface UnitPosition {
  block: string
  floor: number
  unit: number
}

/**
 * Block, floor and unit numbers from a code, whichever numbering wrote it, so
 * `A-24-02` and `A-23A-02` are the same unit. The block is upper-cased.
 */
export function parseUnitCode(code: string): UnitPosition | null {
  const parts = code.trim().toUpperCase().split('-')
  if (parts.length < 2) return null
  const unit = labelNumber(parts.pop()!)
  const floor = labelNumber(parts.pop()!)
  if (unit === null || floor === null) return null
  return { block: parts.join('-'), floor, unit }
}

export interface ProjectUnit extends UnitPosition {
  code: string
  floorLabel: string
  unitLabel: string
}

/** The configured blocks, falling back to the legacy single prefix, then to no block. */
export function projectBlocks(settings: ProjectSettings): string[] {
  if (settings.blocks?.length) return settings.blocks
  return settings.blockPrefix ? [settings.blockPrefix] : ['']
}

/** Every unit in the layout, block by block, lowest floor first, unit 1 first. Empty past the cap. */
export function projectUnits(settings: ProjectSettings): ProjectUnit[] {
  const blocks = projectBlocks(settings)
  const numbering = settings.numbering ?? 'plain'
  const size = blocks.length * (settings.maxFloor - settings.minFloor + 1) * settings.unitsPerFloor
  if (size > MAX_PROJECT_UNITS) return []
  const units: ProjectUnit[] = []
  for (const block of blocks)
    for (let floor = settings.minFloor; floor <= settings.maxFloor; floor += 1)
      for (let unit = 1; unit <= settings.unitsPerFloor; unit += 1)
        units.push({
          code: unitCode(block, floor, unit, numbering),
          block,
          floor,
          unit,
          floorLabel: numberLabel(floor, numbering),
          unitLabel: numberLabel(unit, numbering)
        })
  return units
}

/**
 * Gives every booking its own unit. A booking whose unit is already taken, by
 * an earlier booking or a reserved code, moves to the next free unit in layout
 * order, wrapping at the end. Nothing is mutated; untouched bookings keep
 * their reference. A full layout leaves the duplicate rather than invent one.
 */
export function uniqueUnits(
  bookings: Booking[],
  settings: ProjectSettings,
  reserved: Iterable<string> = []
): Booking[] {
  const codes = projectUnits(settings).map((u) => u.code)
  const index = new Map(codes.map((code, i) => [code, i]))
  const taken = new Set(reserved)
  return bookings.map((booking) => {
    if (!taken.has(booking.unit)) {
      taken.add(booking.unit)
      return booking
    }
    const start = (index.get(booking.unit) ?? -1) + 1
    for (let step = 0; step < codes.length; step += 1) {
      const code = codes[(start + step) % codes.length]!
      if (!taken.has(code)) {
        taken.add(code)
        return { ...booking, unit: code }
      }
    }
    return booking
  })
}
