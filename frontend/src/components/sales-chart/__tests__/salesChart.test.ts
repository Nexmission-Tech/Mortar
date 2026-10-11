import { describe, expect, test } from 'vitest'
import type { CaseSummary, ChartUnit } from '@mortar/core'
import { DEFAULT_PROJECT_SETTINGS, summarizeCases } from '@mortar/core'
import { buildSnapshot } from '@/components/bookings/__tests__/snapshotFixture'
import { activeUnsigned, legendCounts, litUnits, matchesFilter, unitsForSnapshot, UNIT_STATES } from '../salesChart'

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
      const expected = units.filter((u) => u.bookingId && matchesFilter(filter, byId.get(u.bookingId)!))
      expect([...lit].sort()).toEqual(expected.map((u) => u.code).sort())
    }
    expect(litUnits(units, cases, 'awaiting_appointment').size).toBeGreaterThan(0)
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
})
