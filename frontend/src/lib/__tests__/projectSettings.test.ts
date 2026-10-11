import { describe, expect, test } from 'vitest'
import { DEFAULT_PROJECT_SETTINGS } from '@mortar/core'
import { formatUnitRangeDescription, generateProjectInventoryUnits, isUnitInRange } from '@/lib/projectSettings'

const plain = { ...DEFAULT_PROJECT_SETTINGS, numbering: 'plain' as const }

describe('skip-four inventory', () => {
  test('lists 3A, 13A and 23A floors and 03A units, never a plain 4', () => {
    const units = generateProjectInventoryUnits(DEFAULT_PROJECT_SETTINGS)
    expect(units).toHaveLength(936)
    expect(units).toContain('A-23A-02')
    expect(units).toContain('B-21-03A')
    expect(units).not.toContain('A-24-02')
    expect(units).not.toContain('B-21-04')
  })

  test('accepts the configured format and explains the others', () => {
    expect(isUnitInRange('B-21-03A', DEFAULT_PROJECT_SETTINGS)).toEqual({ inRange: true })
    expect(isUnitInRange('b-21-03a', DEFAULT_PROJECT_SETTINGS)).toEqual({ inRange: true })
    expect(isUnitInRange('A-24-02', DEFAULT_PROJECT_SETTINGS)).toEqual({
      inRange: false,
      reason: 'Choose A Unit In The Configured Format'
    })
    expect(isUnitInRange('D-05-01', DEFAULT_PROJECT_SETTINGS)).toEqual({
      inRange: false,
      reason: 'Choose A Unit In A, B, C'
    })
    expect(isUnitInRange('A-29-01', DEFAULT_PROJECT_SETTINGS)).toEqual({
      inRange: false,
      reason: 'Floor 29 Is Outside The Configured Range'
    })
  })

  test('plain numbering keeps accepting plain codes', () => {
    expect(isUnitInRange('A-24-02', plain)).toEqual({ inRange: true })
    expect(isUnitInRange('A-23A-02', plain).inRange).toBe(false)
  })

  test('describes the range with the configured labels', () => {
    expect(formatUnitRangeDescription(DEFAULT_PROJECT_SETTINGS)).toBe('A-03-01 to C-28-12 (936 units)')
    expect(formatUnitRangeDescription({ ...plain, blocks: ['A'], minFloor: 4, maxFloor: 14 })).toBe(
      'A-04-01 to A-14-12 (132 units)'
    )
  })
})
