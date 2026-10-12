/**
 * Every card, bar and control is solid or glass: never a see-through fill that
 * lets the dotted ground show through it. A translucent fill is allowed only
 * with a backdrop blur in the same class list (glass), and on hover states
 * that sit inside a solid surface it is not allowed at all.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = join(__dirname, '..')

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sources(path)
    return path.endsWith('.tsx') ? [path] : []
  })
}

/** A surface fill at partial opacity, such as `bg-card/85` or `hover:bg-accent/40`. */
const TRANSLUCENT =
  /(?:^|[\s'"`:])bg-(?:card|background|muted|popover|accent|secondary|white|black|primary|sidebar)\/\d+/
const TRANSPARENT_FILL = /disabled:bg-transparent/

describe('surfaces', () => {
  it('never leaves a card, bar or control see-through without a blur', () => {
    const offenders: string[] = []
    for (const file of sources(SRC)) {
      const code = readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
      for (const string of code.match(/(['"`])(?:(?!\1)[^\\\n]|\\.)*\1/g) ?? []) {
        const glass = string.includes('backdrop-blur')
        if ((TRANSLUCENT.test(string) && !glass) || TRANSPARENT_FILL.test(string))
          offenders.push(`${relative(SRC, file)}: ${string.slice(0, 90)}`)
      }
    }
    expect(offenders).toEqual([])
  })
})
