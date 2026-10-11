import { describe, expect, it } from 'vitest'
import { ROAD_BED, routePaths } from '@/components/bookings/journey/journeyRoute'

describe('routePaths', () => {
  it('travels to the awaited stop and dashes the rest', () => {
    const road = routePaths(3, 'open')
    expect(road.travelled).toBe('M54 100H104C176 100 248 88 320 100C392 112 486 100 558 100C640 100 722 88 804 100')
    expect(road.ahead).toBe('M804 100C886 112 972 100 1064 100H1114')
    expect(road.cap).toBeNull()
  })

  it('travels the whole road once the SPA is signed', () => {
    const road = routePaths(4, 'complete')
    expect(road.travelled).toBe(ROAD_BED)
    expect(road.ahead).toBeNull()
  })

  it('caps a closed case just past its last reached stop', () => {
    const road = routePaths(2, 'closed')
    expect(road.travelled).toMatch(/558 100h16$/)
    expect(road.cap).toBe('M574 94v12')
    expect(road.ahead).toMatch(/^M558 100C/)
  })

  it('draws nothing travelled before the booking is on the log', () => {
    expect(routePaths(-1, 'open')).toEqual({ travelled: null, ahead: ROAD_BED, cap: null })
  })
})
