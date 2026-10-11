import { describe, expect, test } from 'vitest'
import { DEFAULT_PROJECT_SETTINGS, normalizeProjectSettings } from './projectSettings'
import type { Booking } from './types'
import { labelNumber, numberLabel, parseUnitCode, projectUnits, uniqueUnits, unitCode } from './units'

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
