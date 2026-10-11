import { afterEach, describe, expect, test, vi } from 'vitest'
import { canUseWebGL } from '../webgl'

const original = HTMLCanvasElement.prototype.getContext

afterEach(() => {
  HTMLCanvasElement.prototype.getContext = original
})

function stub(kinds: Record<string, object | null>) {
  HTMLCanvasElement.prototype.getContext = vi.fn((kind: string) => kinds[kind] ?? null) as never
}

describe('canUseWebGL', () => {
  test('needs WebGL 2, which three.js now requires', () => {
    stub({ webgl: {} })
    expect(canUseWebGL()).toBe(false)
  })

  test('passes with WebGL 2 and releases the probe context', () => {
    const loseContext = vi.fn()
    stub({ webgl2: { getExtension: (name: string) => (name === 'WEBGL_lose_context' ? { loseContext } : null) } })
    expect(canUseWebGL()).toBe(true)
    expect(loseContext).toHaveBeenCalledOnce()
  })

  test('never throws', () => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => {
      throw new Error('blocked')
    }) as never
    expect(canUseWebGL()).toBe(false)
  })
})
