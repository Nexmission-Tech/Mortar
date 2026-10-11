/**
 * The desktop road's geometry in the journey map's 1168 × 240 viewBox: the
 * gentle bends between the five stations and how much of the road is
 * travelled. Every station meets the road at y = 100.
 */
export const NODE_X = [104, 320, 558, 804, 1064] as const
const START = 'M54 100H104'
/** BENDS[i] runs from station i − 1 to station i; none moves 6px off the line. */
const BENDS = [
  '',
  'C176 100 248 88 320 100',
  'C392 112 486 100 558 100',
  'C640 100 722 88 804 100',
  'C886 112 972 100 1064 100'
]
const TAIL = 'H1114'

export const ROAD_BED = START + BENDS.join('') + TAIL

export interface RoutePaths {
  travelled: string | null
  ahead: string | null
  cap: string | null
}

/**
 * The travelled road up to station `through` (−1 for none), the dashed road
 * after it, and the cross-road cap where a closed case stopped.
 */
export function routePaths(through: number, ending: 'open' | 'complete' | 'closed'): RoutePaths {
  if (through < 0) return { travelled: null, ahead: ROAD_BED, cap: null }
  const x = NODE_X[through]!
  const complete = ending === 'complete' && through === NODE_X.length - 1
  return {
    travelled: START + BENDS.slice(1, through + 1).join('') + (complete ? TAIL : ending === 'closed' ? 'h16' : ''),
    ahead: complete ? null : `M${x} 100${BENDS.slice(through + 1).join('')}${TAIL}`,
    cap: ending === 'closed' ? `M${x + 16} 94v12` : null
  }
}
