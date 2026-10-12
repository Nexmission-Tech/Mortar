/**
 * The parts every Today worklist row shares, admin and Manager alike: the grid,
 * the unit and buyer that open the case panel, the blocker line, the Details
 * disclosure, and a pill that explains its own clock.
 *
 * One raised list holds the rows, divided by rules, with no per-row card,
 * shadow or lift. From 1024px a row reads across three columns, Booking,
 * Blocker and Next Step; from 720px identity and blocker stack beside the step;
 * below that a row is a compact card in the same order.
 */

import { useId, useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import type { Booking } from '@mortar/core'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { StatusPill } from '@/components/ui/status-pill'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

/** The row grid. Column labels sit in `WorklistHead`, which shares it. */
export const ROW_GRID =
  'grid grid-cols-1 gap-x-3 gap-y-1.5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:grid-cols-[minmax(0,24fr)_minmax(0,23fr)_minmax(0,53fr)]'

/** The one raised surface the rows sit on, as an ordered list. */
export function Worklist({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-md border border-card-border bg-card shadow-card">
      <div
        aria-hidden="true"
        className={cn(ROW_GRID, 'hidden border-b border-border px-4 py-2 text-xs text-muted-foreground lg:grid')}
      >
        <span>Booking</span>
        <span>Blocker</span>
        <span>Next Step</span>
      </div>
      <ol aria-label={label} className="divide-y divide-border">
        {children}
      </ol>
    </div>
  )
}

/** One row: identity, blocker, action group, and Details spanning the row when open. */
export function WorklistRow({
  testId,
  tourTarget,
  identity,
  blocker,
  action,
  details
}: {
  testId: string
  tourTarget?: string
  identity: ReactNode
  blocker: ReactNode
  action: ReactNode
  /** The open Details panel, or null. */
  details: ReactNode
}) {
  return (
    <li>
      <article
        data-testid={testId}
        data-tour={tourTarget}
        className={cn(ROW_GRID, 'min-h-14 px-3 py-2.5 lg:items-center lg:px-4 lg:py-1.5')}
      >
        <div className="min-w-0">{identity}</div>
        <div className="min-w-0 md:col-start-1 lg:col-start-2">{blocker}</div>
        <div className="min-w-0 md:col-start-2 md:row-span-2 md:row-start-1 lg:col-start-3 lg:row-span-1">{action}</div>
        {details ? <div className="col-span-full">{details}</div> : null}
      </article>
    </li>
  )
}

/** Unit and buyer on one line, booking ID below; the pair opens the case panel. */
export function RowIdentity({
  booking,
  onInspect,
  tourTarget
}: {
  booking: Booking
  onInspect: () => void
  tourTarget?: string
}) {
  return (
    <button
      data-tour={tourTarget}
      type="button"
      onClick={onInspect}
      aria-label={`Quick View ${booking.unit}: ${booking.id} · ${booking.buyer.name}`}
      className="-mx-1 flex max-w-full flex-col items-start rounded-sm px-1 py-0.5 text-left transition-colors duration-[var(--motion-fast)] hover:bg-accent"
    >
      <span className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-mono text-[13px] font-medium leading-[18px] text-foreground underline decoration-border underline-offset-4">
          {booking.unit}
        </span>
        <span className="text-sm leading-5 text-foreground">{booking.buyer.name}</span>
      </span>
      <span className="font-mono text-[13px] leading-[18px] text-muted-foreground">{booking.id}</span>
    </button>
  )
}

/** The headline blocker: one line, quiet when it is the generic no-update reason, pills beneath. */
export function RowBlocker({
  icon: Icon,
  text,
  generic,
  pills
}: {
  icon: LucideIcon
  text: string
  generic: boolean
  pills?: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="flex min-w-0 items-center gap-2" title={text}>
        <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <span
          className={cn(
            'truncate text-sm leading-5',
            generic ? 'text-muted-foreground' : 'font-medium text-foreground'
          )}
        >
          {text}
        </span>
      </p>
      {pills ? <div className="flex flex-wrap items-center gap-1.5 pl-6">{pills}</div> : null}
    </div>
  )
}

/** A status pill whose tooltip says which clock it counts. */
export function ClockPill({ tone, label, clock }: { tone: 'danger' | 'warning'; label: string; clock: string }) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <StatusPill tone={tone}>{label}</StatusPill>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">{clock}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/** "14 Days", in Title Case for pills and facts. */
export function daysTitle(days: number): string {
  return `${days} ${days === 1 ? 'Day' : 'Days'}`
}

/**
 * The Details disclosure: a 32px chevron at the row's right end, and the panel
 * it controls. The row renders `panel` across its full width when open.
 */
export function useDetails(unit: string, facts: ReactNode) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const label = `${open ? 'Hide Details' : 'Details'} For ${unit}`
  const toggle = (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={label}
            aria-expanded={open}
            aria-controls={id}
            onClick={() => setOpen((v) => !v)}
          >
            <ChevronDown
              aria-hidden="true"
              className={cn('transition-transform duration-[var(--motion-fast)]', open && 'rotate-180')}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">{open ? 'Hide Details' : 'Details'}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
  const panel = open ? (
    <div id={id} className="mt-2 border-t border-border pt-3">
      {facts}
    </div>
  ) : null
  return { toggle, panel }
}

/** The Details facts: four columns on desktop, two on phones, then every blocker. */
export function RowFacts({
  facts,
  blockers
}: {
  facts: { label: string; value: ReactNode; numeric?: boolean }[]
  blockers: readonly string[]
}) {
  return (
    <div className="flex flex-col gap-3 pb-1">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 lg:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-xs leading-4 text-muted-foreground">{fact.label}</dt>
            <dd className={cn('text-[13px] leading-[18px] text-foreground', fact.numeric && 'tabular-nums')}>
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs leading-4 text-muted-foreground">All Blockers</span>
        {blockers.length > 0 ? (
          <ul className="flex flex-col text-[13px] leading-[18px] text-foreground">
            {blockers.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ) : (
          <span className="text-[13px] leading-[18px] text-muted-foreground">—</span>
        )}
      </div>
    </div>
  )
}
