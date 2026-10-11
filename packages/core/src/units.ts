/**
 * The project's units: how floors and units are numbered, and every unit code
 * the configured layout holds.
 */
import type { ProjectSettings, UnitNumbering } from './projectSettings'
import type { ApplicationStatus, Booking, CaseSummary } from './types'

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

export type UnitState = 'available' | 'signed' | 'release_review' | 'needs_action' | 'loan_approved' | 'booked'

/** Release Review triggers, after the 48-Hour Clean Exit idea. */
export const RELEASE_REVIEW_AGE_DAYS = 30
export const RELEASE_REVIEW_REJECTIONS = 2

const LIVE_APPLICATIONS: ReadonlySet<ApplicationStatus> = new Set(['submitted', 'documents_pending', 'approved'])

const terminal = (s: CaseSummary) => s.stage === 'cancelled' || s.stage === 'lapsed'
const liveUnsigned = (s: CaseSummary) => !terminal(s) && !s.spaSigned

/**
 * Advisory: a live, unsigned booking whose recovery paths look spent, so an
 * authorised person should decide whether to cancel and re-release the unit.
 * Mortar never cancels.
 */
export function releaseReview(summary: CaseSummary): boolean {
  if (!liveUnsigned(summary)) return false
  if (summary.buyerWithdrew) return true
  if (summary.applications.some((a) => LIVE_APPLICATIONS.has(a.status))) return false
  const rejections = summary.applications.filter((a) => a.status === 'rejected').length
  return rejections >= RELEASE_REVIEW_REJECTIONS || summary.bookingAgeDays >= RELEASE_REVIEW_AGE_DAYS
}

/** A live, unsigned booking the stall rule flagged: the same rule that fills Today. */
export function needsAction(summary: CaseSummary): boolean {
  return liveUnsigned(summary) && summary.stallReasons.length > 0
}

const loanApproved = (s: CaseSummary) =>
  liveUnsigned(s) && s.stage === 'lo_issued' && s.daysSinceLoIssued !== null && !s.buyerWithdrew

/** Loan through, no SPA appointment on record: the Legal desk's No Appointment Yet rows. */
export function awaitingSpaAppointment(summary: CaseSummary): boolean {
  return loanApproved(summary) && summary.daysSinceSpaSet === null
}

/** The state of a unit a booking holds, first match wins. */
export function unitState(summary: CaseSummary): Exclude<UnitState, 'available'> {
  if (summary.spaSigned) return 'signed'
  if (releaseReview(summary)) return 'release_review'
  if (needsAction(summary)) return 'needs_action'
  if (loanApproved(summary)) return 'loan_approved'
  return 'booked'
}

/** A unit some booking holds. Every other unit in the layout is available. */
export interface HeldUnit {
  /** The layout's code for the unit, whichever numbering the booking used. */
  code: string
  state: Exclude<UnitState, 'available'>
  /** `null` on a scoped snapshot when the viewer may not open the booking. */
  bookingId: string | null
  /** The holding booking's sales owner: whose desk to ask. */
  heldBy: string
}

/** Case-blind position key: `parseUnitCode` upper-cases blocks, settings may not. */
const slot = (p: UnitPosition) => `${p.block.toUpperCase()}|${p.floor}|${p.unit}`

/**
 * The units bookings hold in this project. A cancelled or lapsed booking frees
 * its unit; when two live bookings share one, the later booking holds it.
 * Bookings in other projects, on units outside the layout, or without a
 * summary are not on the chart.
 */
export function heldUnits(settings: ProjectSettings, bookings: Booking[], summaries: CaseSummary[]): HeldUnit[] {
  const byBooking = new Map(summaries.map((s) => [s.bookingId, s]))
  const layout = new Map(projectUnits(settings).map((u) => [slot(u), u]))
  const project = settings.projectName.trim().toUpperCase()
  const holders = new Map<string, { booking: Booking; summary: CaseSummary }>()
  for (const booking of bookings) {
    if (booking.project.trim().toUpperCase() !== project) continue
    const summary = byBooking.get(booking.id)
    const position = parseUnitCode(booking.unit)
    const key = position ? slot(position) : null
    if (!summary || !key || !layout.has(key) || terminal(summary)) continue
    const seen = holders.get(key)
    const later =
      !seen ||
      booking.bookingDate > seen.booking.bookingDate ||
      (booking.bookingDate === seen.booking.bookingDate && booking.id > seen.booking.id)
    if (later) holders.set(key, { booking, summary })
  }
  return [...layout].flatMap(([key, unit]) => {
    const held = holders.get(key)
    if (!held) return []
    return [
      { code: unit.code, state: unitState(held.summary), bookingId: held.booking.id, heldBy: held.booking.salesOwner }
    ]
  })
}

export interface ChartUnit extends ProjectUnit {
  state: UnitState
  bookingId: string | null
  heldBy: string | null
}

/** The whole layout in order, each unit with its state: held units as given, the rest available. */
export function chartUnits(settings: ProjectSettings, held: HeldUnit[]): ChartUnit[] {
  const byCode = new Map(held.map((h) => [h.code, h]))
  return projectUnits(settings).map((unit) => {
    const h = byCode.get(unit.code)
    return h
      ? { ...unit, state: h.state, bookingId: h.bookingId, heldBy: h.heldBy }
      : { ...unit, state: 'available', bookingId: null, heldBy: null }
  })
}
