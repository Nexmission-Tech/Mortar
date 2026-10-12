import { describe, expect, test } from 'vitest'
import { DEFAULT_PROJECT_SETTINGS, normalizeProjectSettings } from './projectSettings'
import type { Booking, CaseSummary } from './types'
import {
  awaitingSpaAppointment,
  chartUnits,
  heldUnits,
  labelNumber,
  layoutUnit,
  needsAction,
  numberLabel,
  parseUnitCode,
  projectUnits,
  releaseReview,
  uniqueUnits,
  unitCode,
  unitState
} from './units'

describe('numbering', () => {
  test('skip-four renames every number containing a 4', () => {
    expect([3, 4, 12, 13, 14, 24, 28].map((n) => numberLabel(n, 'skip-four'))).toEqual([
      '03',
      '03A',
      '12',
      '13',
      '13A',
      '23A',
      '28'
    ])
  })

  test('plain numbering only pads', () => {
    expect(numberLabel(4)).toBe('04')
    expect(numberLabel(24, 'plain')).toBe('24')
  })

  test('labels read back to their numbers', () => {
    expect(labelNumber('23A')).toBe(24)
    expect(labelNumber('03a')).toBe(4)
    expect(labelNumber('07')).toBe(7)
    expect(labelNumber('7B')).toBeNull()
    expect(labelNumber('')).toBeNull()
  })

  test('unit codes match the story fixtures', () => {
    expect(unitCode('A', 24, 2, 'skip-four')).toBe('A-23A-02')
    expect(unitCode('B', 21, 4, 'skip-four')).toBe('B-21-03A')
    expect(unitCode('', 5, 11, 'plain')).toBe('05-11')
  })

  test('codes parse to positions, plain and skip-four alike', () => {
    expect(parseUnitCode('A-23A-02')).toEqual({ block: 'A', floor: 24, unit: 2 })
    expect(parseUnitCode('a-24-02')).toEqual({ block: 'A', floor: 24, unit: 2 })
    expect(parseUnitCode('B-21-03A')).toEqual({ block: 'B', floor: 21, unit: 4 })
    expect(parseUnitCode('05-11')).toEqual({ block: '', floor: 5, unit: 11 })
    expect(parseUnitCode('TOWER-1-12-03')).toEqual({ block: 'TOWER-1', floor: 12, unit: 3 })
    expect(parseUnitCode('A-12')).toBeNull()
    expect(parseUnitCode('garbage')).toBeNull()
  })
})

describe('the demo layout', () => {
  const units = projectUnits(DEFAULT_PROJECT_SETTINGS)

  test('is Aster Heights: three blocks, floors 3 to 28, twelve units a floor', () => {
    expect(DEFAULT_PROJECT_SETTINGS.projectName).toBe('Aster Heights')
    expect(units).toHaveLength(3 * 26 * 12)
    expect(units[0]).toEqual({ code: 'A-03-01', block: 'A', floor: 3, unit: 1, floorLabel: '03', unitLabel: '01' })
    expect(units[units.length - 1]?.code).toBe('C-28-12')
  })

  test('holds every story fixture unit, once each', () => {
    const codes = new Set(units.map((u) => u.code))
    expect(codes.size).toBe(units.length)
    for (const code of ['A-12-03', 'B-08-05', 'A-05-11', 'B-15-08', 'A-18-07', 'A-23A-02', 'B-21-03A', 'A-28-01'])
      expect(codes.has(code)).toBe(true)
  })

  test('never shows a plain 4 in a floor or unit label', () => {
    expect(units.some((u) => /-\d?4(-|$)/.test(u.code))).toBe(false)
  })

  test('is empty past the inventory cap', () => {
    expect(
      projectUnits({ ...DEFAULT_PROJECT_SETTINGS, blocks: ['A'], minFloor: 0, maxFloor: 200, unitsPerFloor: 100 })
    ).toEqual([])
  })
})

describe('normalizeProjectSettings', () => {
  test('keeps skip-four and reads a missing or unknown numbering as plain', () => {
    expect(normalizeProjectSettings(DEFAULT_PROJECT_SETTINGS)?.numbering).toBe('skip-four')
    const legacy: Partial<typeof DEFAULT_PROJECT_SETTINGS> = { ...DEFAULT_PROJECT_SETTINGS }
    delete legacy.numbering
    expect(normalizeProjectSettings(legacy)?.numbering).toBe('plain')
    expect(normalizeProjectSettings({ ...legacy, numbering: 'roman' })?.numbering).toBe('plain')
  })
})

const tiny = {
  ...DEFAULT_PROJECT_SETTINGS,
  blocks: ['A'],
  minFloor: 1,
  maxFloor: 1,
  unitsPerFloor: 3,
  numbering: 'plain' as const
}
const at = (id: string, unit: string) => ({ id, unit }) as Booking

describe('uniqueUnits', () => {
  test('moves a duplicate to the next free unit, leaving the first in place', () => {
    const out = uniqueUnits([at('x', 'A-01-01'), at('y', 'A-01-01')], tiny)
    expect(out.map((b) => b.unit)).toEqual(['A-01-01', 'A-01-02'])
  })

  test('skips reserved units and wraps at the end of the layout', () => {
    const out = uniqueUnits([at('x', 'A-01-03'), at('y', 'A-01-03')], tiny, ['A-01-01'])
    expect(out.map((b) => b.unit)).toEqual(['A-01-03', 'A-01-02'])
  })

  test('returns unique input untouched, by reference', () => {
    const input = [at('x', 'A-01-01'), at('y', 'A-01-02')]
    const out = uniqueUnits(input, tiny)
    expect(out[0]).toBe(input[0])
    expect(out[1]).toBe(input[1])
  })

  test('leaves the duplicate when the layout is full', () => {
    const full = [at('a', 'A-01-01'), at('b', 'A-01-02'), at('c', 'A-01-03'), at('d', 'A-01-01')]
    expect(uniqueUnits(full, tiny).map((b) => b.unit)).toEqual(['A-01-01', 'A-01-02', 'A-01-03', 'A-01-01'])
  })
})

const summary = (patch: Partial<CaseSummary> = {}): CaseSummary => ({
  bookingId: 'BK-1',
  stage: 'loan_applied',
  spaSigned: false,
  unknown: false,
  bookingAgeDays: 10,
  daysSinceEvidence: 1,
  daysSinceLoIssued: null,
  daysSinceSpaSet: null,
  applications: [{ id: 'LA-1', bank: 'Apex Bank', status: 'submitted' }],
  outstandingDocuments: [],
  buyerWithdrew: false,
  buyerConcern: false,
  valuationShortfall: false,
  risk: {
    level: 'low',
    loanRm: 432_000,
    instalmentRm: 2_000,
    debtServiceRatio: 0.3,
    marginOfFinancing: 0.9,
    reasons: []
  },
  stallReasons: [],
  openTasks: 0,
  ...patch
})

const rejected = (id: string) => ({ id, bank: 'X', status: 'rejected' as const })

describe('releaseReview', () => {
  test('flags a withdrawn buyer', () => {
    expect(releaseReview(summary({ buyerWithdrew: true }))).toBe(true)
  })

  test('flags two rejections with nothing live', () => {
    expect(releaseReview(summary({ applications: [rejected('a'), rejected('b')] }))).toBe(true)
  })

  test('flags 30 days with no live application', () => {
    expect(releaseReview(summary({ bookingAgeDays: 30, applications: [] }))).toBe(true)
    expect(releaseReview(summary({ bookingAgeDays: 29, applications: [] }))).toBe(false)
  })

  test('spares a booking with a live or approved application', () => {
    expect(releaseReview(summary({ bookingAgeDays: 60 }))).toBe(false)
    expect(
      releaseReview(
        summary({ applications: [rejected('a'), rejected('b'), { id: 'c', bank: 'Z', status: 'approved' }] })
      )
    ).toBe(false)
  })

  test('spares one rejection inside 30 days', () => {
    expect(releaseReview(summary({ applications: [rejected('a')] }))).toBe(false)
  })

  test('never flags a signed, cancelled or lapsed booking', () => {
    expect(releaseReview(summary({ buyerWithdrew: true, spaSigned: true, stage: 'spa_signed' }))).toBe(false)
    expect(releaseReview(summary({ buyerWithdrew: true, stage: 'cancelled' }))).toBe(false)
    expect(releaseReview(summary({ buyerWithdrew: true, stage: 'lapsed' }))).toBe(false)
  })
})

describe('unitState', () => {
  test('follows the spec order', () => {
    expect(unitState(summary({ spaSigned: true, stage: 'spa_signed', stallReasons: ['x'] }))).toBe('signed')
    expect(unitState(summary({ buyerWithdrew: true, stallReasons: ['x'] }))).toBe('release_review')
    expect(unitState(summary({ stallReasons: ['No Update For 12 Days'] }))).toBe('needs_action')
    expect(unitState(summary({ stage: 'lo_issued', daysSinceLoIssued: 3 }))).toBe('loan_approved')
    expect(unitState(summary())).toBe('booked')
  })

  test('awaitingSpaAppointment matches the Legal desk split', () => {
    expect(awaitingSpaAppointment(summary({ stage: 'lo_issued', daysSinceLoIssued: 3 }))).toBe(true)
    expect(awaitingSpaAppointment(summary({ stage: 'lo_issued', daysSinceLoIssued: 3, daysSinceSpaSet: 1 }))).toBe(
      false
    )
    expect(awaitingSpaAppointment(summary({ stage: 'lo_issued', daysSinceLoIssued: 3, buyerWithdrew: true }))).toBe(
      false
    )
    expect(awaitingSpaAppointment(summary({ stage: 'lo_issued', daysSinceLoIssued: null }))).toBe(false)
  })

  test('needsAction is a live, unsigned booking with stall reasons', () => {
    expect(needsAction(summary({ stallReasons: ['x'] }))).toBe(true)
    expect(needsAction(summary({ stallReasons: ['x'], spaSigned: true }))).toBe(false)
    expect(needsAction(summary({ stallReasons: ['x'], stage: 'cancelled' }))).toBe(false)
  })
})

describe('heldUnits and chartUnits', () => {
  const settings = { ...DEFAULT_PROJECT_SETTINGS, blocks: ['A'], minFloor: 24, maxFloor: 24, unitsPerFloor: 2 }
  const booking = (id: string, unit: string, bookingDate = '2026-09-01', project = 'Aster Heights') =>
    ({ id, unit, bookingDate, project, salesOwner: 'Nurul Aina' }) as Booking

  test('a live booking holds its unit; a cancelled one frees it', () => {
    const held = heldUnits(
      settings,
      [booking('BK-1', 'A-23A-01'), booking('BK-2', 'A-23A-02')],
      [summary({ bookingId: 'BK-1' }), summary({ bookingId: 'BK-2', stage: 'cancelled' })]
    )
    expect(held).toEqual([{ code: 'A-23A-01', state: 'booked', bookingId: 'BK-1', heldBy: 'Nurul Aina' }])
  })

  test('plain-numbered codes land on their skip-four slot', () => {
    const held = heldUnits(settings, [booking('BK-1', 'A-24-02')], [summary({ bookingId: 'BK-1' })])
    expect(held[0]?.code).toBe('A-23A-02')
  })

  test('a lower-case block in settings still matches', () => {
    const held = heldUnits(
      { ...settings, blocks: ['a'] },
      [booking('BK-1', 'A-23A-02')],
      [summary({ bookingId: 'BK-1' })]
    )
    expect(held[0]?.code).toBe('a-23A-02')
  })

  test('the latest live booking wins a shared unit', () => {
    const held = heldUnits(
      settings,
      [booking('BK-1', 'A-23A-01', '2026-08-01'), booking('BK-2', 'A-23A-01', '2026-09-01')],
      [summary({ bookingId: 'BK-1' }), summary({ bookingId: 'BK-2' })]
    )
    expect(held.map((h) => h.bookingId)).toEqual(['BK-2'])
  })

  test('other projects, unknown units and unsummarised bookings are ignored', () => {
    const held = heldUnits(
      settings,
      [booking('BK-1', 'A-23A-01', '2026-09-01', 'Elsewhere'), booking('BK-2', 'Z-99-99'), booking('BK-3', 'A-23A-02')],
      [summary({ bookingId: 'BK-1' }), summary({ bookingId: 'BK-2' })]
    )
    expect(held).toEqual([])
  })

  test('chartUnits fills the rest of the layout as available', () => {
    const units = chartUnits(settings, [{ code: 'A-23A-02', state: 'signed', bookingId: null, heldBy: 'Farah Izzati' }])
    expect(units.map((u) => [u.code, u.state, u.heldBy])).toEqual([
      ['A-23A-01', 'available', null],
      ['A-23A-02', 'signed', 'Farah Izzati']
    ])
  })
})

describe('layoutUnit', () => {
  const plain = { ...DEFAULT_PROJECT_SETTINGS, numbering: 'plain' as const }

  test('pads and upper-cases a layout unit', () => {
    expect(layoutUnit(' a-12-3 ', DEFAULT_PROJECT_SETTINGS)).toEqual({ code: 'A-12-03' })
    expect(layoutUnit('b-21-03a', DEFAULT_PROJECT_SETTINGS)).toEqual({ code: 'B-21-03A' })
  })

  test('refuses a label the numbering would not write, naming the unit it may mean', () => {
    expect(layoutUnit('A-24-02', DEFAULT_PROJECT_SETTINGS)).toEqual({
      problem: "Unit A-24-02 Is Not In This Project's Numbering; Did You Mean A-23A-02?"
    })
    expect(layoutUnit('A-23A-02', plain)).toEqual({
      problem: "Unit A-23A-02 Is Not In This Project's Numbering; Did You Mean A-24-02?"
    })
  })

  test('leaves a unit outside the layout as written', () => {
    expect(layoutUnit('Z-01-01', DEFAULT_PROJECT_SETTINGS)).toEqual({ code: 'Z-01-01' })
    expect(layoutUnit('A-40-01', DEFAULT_PROJECT_SETTINGS)).toEqual({ code: 'A-40-01' })
    expect(layoutUnit('Lot 7', DEFAULT_PROJECT_SETTINGS)).toEqual({ code: 'Lot 7' })
  })
})
