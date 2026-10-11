import { describe, expect, it } from 'vitest'
import { TOUR_STEPS } from '@/tour/tourSteps'

describe('tour copy', () => {
  it('says a Sales Chart unit opens its overview, not its case', () => {
    const captions = Object.values(TOUR_STEPS)
      .flat()
      .filter((step) => step.route === '/sales-chart')
      .map((step) => step.caption)
    expect(captions.length).toBeGreaterThan(0)
    for (const caption of captions) {
      expect(caption).not.toMatch(/open its case/i)
      expect(caption).toMatch(/overview/i)
    }
  })
})
