import { describe, expect, test } from 'vitest'
import type { CaseSummary, ChartUnit } from '@mortar/core'
import { DEFAULT_PROJECT_SETTINGS, summarizeCases } from '@mortar/core'
import { buildSnapshot } from '@/components/bookings/__tests__/snapshotFixture'
import {
  activeUnsigned,
  bookedAndSigned,
  highlightedUnits,
  legendCounts,
  litUnits,
  matchesFilter,
  salesOwners,
  soldByUnits,
  STATE_LABELS,
  unitsForSnapshot,
  UNIT_STATES
} from '../salesChart'

const snapshot = buildSnapshot()
const cases = summarizeCases(snapshot, snapshot.meta.referenceDate)
const FILTERS = ['needs_action', 'awaiting_appointment', 'release_review'] as const

describe('unitsForSnapshot', () => {
  test('uses the server units when present', () => {
    const units = unitsForSnapshot(
      { ...snapshot, units: [{ code: 'A-03-01', state: 'signed', bookingId: null, heldBy: 'Farah Izzati' }] },
      cases
    )
    expect(units).toHaveLength(936)
    expect(units[0]).toMatchObject({ code: 'A-03-01', state: 'signed', heldBy: 'Farah Izzati' })
    expect(units.filter((u) => u.state !== 'available')).toHaveLength(1)
  })

  test('falls back to the viewer’s own bookings when the server sent none', () => {
    const units = unitsForSnapshot({ ...snapshot, units: undefined }, cases)
    const held = units.filter((u) => u.state !== 'available')
    expect(held.length).toBeGreaterThan(0)
    expect(held.every((u) => u.bookingId !== null)).toBe(true)
    expect(units.find((u) => u.code === 'A-12-03')?.bookingId).toBe('BK-9001')
  })

  test('uses the snapshot’s project settings for the layout', () => {
    const small = { ...DEFAULT_PROJECT_SETTINGS, blocks: ['A'], minFloor: 3, maxFloor: 3, unitsPerFloor: 2 }
    expect(unitsForSnapshot({ ...snapshot, projectSettings: small, units: [] }, cases).map((u) => u.code)).toEqual([
      'A-03-01',
      'A-03-02'
    ])
  })
})

describe('filters and counts', () => {
  const units = unitsForSnapshot({ ...snapshot, units: undefined }, cases)
  const byId = new Map(cases.map((c) => [c.bookingId, c]))

  test('a filter lights exactly the units whose case matches', () => {
    for (const filter of FILTERS) {
      const lit = litUnits(units, cases, filter)
      const expected = units.filter((u) => matchesFilter(filter, u, u.bookingId ? byId.get(u.bookingId) : undefined))
      expect([...lit].sort()).toEqual(expected.map((u) => u.code).sort())
    }
    expect(litUnits(units, cases, 'awaiting_appointment').size).toBeGreaterThan(0)
  })

  test('the state filters agree with the legend', () => {
    const counts = legendCounts(units)
    expect(litUnits(units, cases, 'needs_action').size).toBe(counts.needs_action)
    expect(litUnits(units, cases, 'release_review').size).toBe(counts.release_review)
  })

  test('never lights a unit the viewer cannot open', () => {
    const foreign: ChartUnit[] = units.map((u) => (u.bookingId ? { ...u, bookingId: null } : u))
    for (const filter of FILTERS) expect(litUnits(foreign, cases, filter).size).toBe(0)
  })

  test('legend counts every unit once', () => {
    const counts = legendCounts(units)
    expect(UNIT_STATES.reduce((sum, state) => sum + counts[state], 0)).toBe(units.length)
  })

  test('active unsigned counts live bookings without a signed SPA', () => {
    const live = cases.filter((c) => c.stage !== 'cancelled' && c.stage !== 'lapsed' && !c.spaSigned).length
    expect(activeUnsigned(cases)).toBe(live)
    expect(activeUnsigned([] as CaseSummary[])).toBe(0)
  })

  test('units booked counts every standing booking, signed or not; signed counts the signed ones', () => {
    const standing = cases.filter((c) => c.stage !== 'cancelled' && c.stage !== 'lapsed')
    expect(bookedAndSigned(cases)).toEqual({
      booked: standing.length,
      signed: standing.filter((c) => c.spaSigned).length
    })
    expect(bookedAndSigned(cases).booked).toBe(activeUnsigned(cases) + bookedAndSigned(cases).signed)
  })

  test('the early booking state reads In Progress, so it never clashes with Units Booked', () => {
    expect(STATE_LABELS.booked).toBe('In Progress')
  })
})

describe('Sold By owners', () => {
  const unitAt = (
    n: number,
    state: ChartUnit['state'],
    bookingId: string | null,
    heldBy: string | null
  ): ChartUnit => ({
    code: `A-03-0${n}`,
    block: 'A',
    floor: 3,
    unit: n,
    floorLabel: '03',
    unitLabel: `0${n}`,
    state,
    bookingId,
    heldBy
  })
  const units: ChartUnit[] = [
    unitAt(1, 'signed', 'BK-9001', '  Zara  '),
    unitAt(2, 'booked', null, 'Amir'),
    unitAt(3, 'needs_action', null, ' zARA '),
    unitAt(4, 'available', null, null)
  ]

  test('sorts owners, counts their codes, and merges trimmed case variants using the first spelling', () => {
    expect(salesOwners(units)).toEqual([
      { name: 'Amir', count: 1 },
      { name: 'Zara', count: 2 }
    ])
    expect(salesOwners([])).toEqual([])
    expect(salesOwners([unitAt(4, 'available', null, null)])).toEqual([])
    expect(salesOwners([...units, units[0]!])).toEqual(salesOwners(units))
  })

  test('lights all held codes by owner key, including signed and inaccessible units', () => {
    expect([...soldByUnits(units, ' ZARA ')]).toEqual(['A-03-01', 'A-03-03'])
    expect([...soldByUnits(units, 'Amir')]).toEqual(['A-03-02'])
    expect(soldByUnits(units, 'Missing').size).toBe(0)
    expect(soldByUnits(units, '').size).toBe(0)
  })

  test('combines the person set with the unchanged scoped filter set', () => {
    const held: ChartUnit[] = [
      unitAt(1, 'needs_action', 'BK-9001', '  Zara  '),
      unitAt(2, 'needs_action', 'BK-9001', 'Amir'),
      units[2]!,
      units[3]!
    ]
    expect(highlightedUnits(held, cases, null, null)).toBeNull()
    expect([...highlightedUnits(held, cases, 'needs_action', null)!]).toEqual(['A-03-01', 'A-03-02'])
    expect([...highlightedUnits(held, cases, null, 'Zara')!]).toEqual(['A-03-01', 'A-03-03'])
    expect([...highlightedUnits(held, cases, 'needs_action', 'Zara')!]).toEqual(['A-03-01'])
    expect(highlightedUnits(held, cases, 'release_review', 'Zara')!.size).toBe(0)
  })
})
