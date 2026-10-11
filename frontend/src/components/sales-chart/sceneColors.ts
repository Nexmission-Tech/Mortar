/**
 * The Building view's colours, read from the same CSS custom properties the
 * rest of the app paints with, so the scene follows light and dark mode and no
 * colour value lives outside `globals.css`.
 */
import type { UnitState } from '@mortar/core'

export type SceneColors = Record<
  | UnitState
  | 'ghost'
  | 'podium'
  | 'structure'
  | 'sky'
  | 'skyGround'
  | 'plinth'
  | 'ground'
  | 'paving'
  | 'stone'
  | 'road'
  | 'lane'
  | 'lawn'
  | 'water'
  | 'foliage'
  | 'track'
  | 'neighbour'
  | 'band'
  | 'trunk'
  | 'selected'
  | 'selectedInner'
  | 'hovered',
  string
>

const TOKENS: Record<keyof SceneColors, string> = {
  // Available units are glazing: a pale cool tint against the white frame.
  available: '--model-glass',
  booked: '--status-info',
  loan_approved: '--status-positive',
  needs_action: '--status-warning',
  release_review: '--status-danger',
  signed: '--status-signed',
  ghost: '--muted',
  podium: '--model-podium',
  structure: '--model-structure',
  sky: '--model-sky',
  skyGround: '--model-sky-ground',
  plinth: '--model-plinth',
  ground: '--model-ground',
  paving: '--model-paving',
  stone: '--model-stone',
  road: '--model-road',
  lane: '--model-lane',
  lawn: '--model-lawn',
  water: '--model-water',
  foliage: '--model-foliage',
  track: '--model-track',
  neighbour: '--model-neighbour',
  band: '--model-band',
  trunk: '--model-trunk',
  selected: '--foreground',
  // The gap between the ink ring and the unit, as the Grid's ring offset: it shows on signed units too.
  selectedInner: '--card',
  hovered: '--muted-foreground'
}

/** Each scene colour from `read(variable)`; an empty variable falls back to a neutral. */
export function sceneColors(read: (name: string) => string): SceneColors {
  return Object.fromEntries(
    Object.entries(TOKENS).map(([key, token]) => [key, read(token).trim() || 'gray'])
  ) as SceneColors
}
