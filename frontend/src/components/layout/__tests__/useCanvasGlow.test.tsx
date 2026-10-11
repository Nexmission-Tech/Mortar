import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import { useRef } from 'react'
import { useCanvasGlow } from '@/components/layout/useCanvasGlow'

function Canvas() {
  const ref = useRef<HTMLElement>(null)
  useCanvasGlow(ref)
  return <main ref={ref} data-testid="canvas" />
}

/** A browser with a mouse, optionally asking for reduced motion. */
function stubPointer(reducedMotion = false) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('reduce') ? reducedMotion : true,
    addEventListener: () => {},
    removeEventListener: () => {}
  }))
}

afterEach(() => vi.unstubAllGlobals())

describe('useCanvasGlow', () => {
  it('lights the dots under the pointer and lets them fade when it leaves', async () => {
    stubPointer()
    const { getByTestId } = render(<Canvas />)
    const canvas = getByTestId('canvas')
    fireEvent.pointerMove(canvas, { clientX: 120, clientY: 80 })
    expect(canvas.dataset.spot).toBe('on')
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    expect(canvas.style.getPropertyValue('--canvas-spot-x')).toMatch(/px$/)
    expect(canvas.style.getPropertyValue('--canvas-spot-y')).toMatch(/px$/)
    fireEvent.pointerLeave(canvas)
    expect(canvas.dataset.spot).toBeUndefined()
  })

  it('stays dark for people who ask for reduced motion', () => {
    stubPointer(true)
    const { getByTestId } = render(<Canvas />)
    const canvas = getByTestId('canvas')
    fireEvent.pointerMove(canvas, { clientX: 120, clientY: 80 })
    expect(canvas.dataset.spot).toBeUndefined()
  })
})
