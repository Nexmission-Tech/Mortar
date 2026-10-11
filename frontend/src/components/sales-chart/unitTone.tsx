import type { UnitState } from '@mortar/core'
import { cn } from '@/lib/utils'

/** Cell fill per state: the six status solids, Available as a bordered card. */
export const UNIT_FILL: Record<UnitState, string> = {
  available: 'bg-card border border-border',
  booked: 'bg-status-info',
  loan_approved: 'bg-status-positive',
  needs_action: 'bg-status-warning',
  release_review: 'bg-status-danger',
  signed: 'bg-status-signed'
}

/**
 * The shape that tells the two attention states apart without colour: a dot
 * for Needs Action, a dash for Release Review.
 */
export function UnitMark({ state, className }: { state: UnitState; className?: string }) {
  if (state === 'needs_action')
    return <span aria-hidden="true" className={cn('size-1.5 rounded-full bg-status-warning-fg', className)} />
  if (state === 'release_review')
    return <span aria-hidden="true" className={cn('h-0.5 w-2 rounded-full bg-card', className)} />
  return null
}
