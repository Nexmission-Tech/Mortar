/**
 * The Building view's colours, read from the same CSS custom properties the
 * rest of the app paints with, so the scene follows light and dark mode and no
 * colour value lives outside `globals.css`.
 */
import type { UnitState } from '@mortar/core'

export type SceneColors = Record<UnitState | 'ghost' | 'podium' | 'selected' | 'hovered', string>

const TOKENS: Record<keyof SceneColors, string> = {
  // White blocks vanish against the white card in 3D, so stock reads in the border grey.
  available: '--border',
  booked: '--status-info',
  loan_approved: '--status-positive',
  needs_action: '--status-warning',
  release_review: '--status-danger',
  signed: '--status-signed',
  ghost: '--muted',
  podium: '--muted',
  selected: '--foreground',
  hovered: '--muted-foreground'
}

/** Each scene colour from `read(variable)`; an empty variable falls back to a neutral. */
export function sceneColors(read: (name: string) => string): SceneColors {
  return Object.fromEntries(
    Object.entries(TOKENS).map(([key, token]) => [key, read(token).trim() || 'gray'])
  ) as SceneColors
}
