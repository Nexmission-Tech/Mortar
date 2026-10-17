/**
 * The Sales Chart's unit island: the selected unit's overview, floating at the
 * bottom centre while the chart stays live behind it. Not a modal: nothing
 * dims, focus stays where it was, and clicking another unit swaps it. Glass,
 * like the Bookings bulk-action island.
 */
import { createPortal } from 'react-dom'
import { useEffect, useRef, type Ref } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { STATE_LABELS } from './salesChart'
import type { UnitOverview } from './unitOverview'
import { UNIT_FILL } from './unitTone'

/** A clause after the state, behind a middot the screen reader skips. */
function Aside({ children, className }: { children: string; className?: string }) {
  return (
    <>
      <span aria-hidden="true" className="text-muted-foreground">
        ·
      </span>
      <span className={className ?? 'text-muted-foreground'}>{children}</span>
    </>
  )
}

function Fact({ term, wide, children }: { term: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn('min-w-0', wide && 'max-sm:col-span-2')}>
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd className="text-sm text-pretty text-foreground">{children}</dd>
    </div>
  )
}

export function UnitIsland({
  overview,
  onOpenCase,
  onClose,
  onHeight,
  elevated = false,
  ref
}: {
  overview: UnitOverview
  onOpenCase: () => void
  onClose: () => void
  /** Called with the island's height whenever it changes, so the page can leave room for it. */
  onHeight?: (height: number) => void
  /** Above the expanded Building view's modal (z 62–63), still under the case panel (70–71). */
  elevated?: boolean
  ref?: Ref<HTMLElement>
}) {
  const own = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const node = own.current
    if (!node || !onHeight || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => {
      const height = entry?.borderBoxSize?.[0]?.blockSize ?? node.getBoundingClientRect().height
      onHeight(height)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [onHeight])
  // Portalled to the body, so it can rise above the expanded Building view's modal.
  return createPortal(
    <section
      ref={(node) => {
        own.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      aria-label="Selected Unit"
      // Under the app shell's scrims and popovers; clear of the tour button by its offset, not its layer.
      className={cn(
        'fixed inset-x-4 bottom-4 mx-auto max-md:right-16 max-w-[560px] rounded-md border border-border bg-card/85 p-4 shadow-[var(--shadow-overlay)] backdrop-blur-md duration-[var(--motion-base)] animate-in fade-in-0 motion-safe:slide-in-from-bottom-4',
        // Raised over the expanded view, it stays left of that view's zoom and collapse column.
        elevated ? 'z-[64] md:right-[calc(10%+5rem)] max-md:right-[5.5rem]' : 'z-40'
      )}
    >
      <div className="flex items-start gap-3 pr-8">
        <div className="min-w-0">
          <p className="font-mono text-base font-semibold text-foreground">{overview.code}</p>
          <p className="text-sm text-muted-foreground">{overview.location}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-sm text-muted-foreground outline-none transition-colors duration-[var(--motion-fast)] hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-4" aria-hidden="true" />
      </button>

      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground">
        <span aria-hidden="true" className={cn('size-2.5 rounded-[2px]', UNIT_FILL[overview.state])} />
        <span>{overview.kind === 'available' ? 'Available · Not Booked' : STATE_LABELS[overview.state]}</span>
        {overview.kind === 'case' ? <Aside>{overview.age}</Aside> : null}
        {overview.kind === 'case' && overview.stalled ? <Aside className="text-status-danger-fg">Stalled</Aside> : null}
        {overview.kind === 'held' ? <Aside>{`Held By ${overview.heldBy}’s Desk`}</Aside> : null}
      </p>

      {overview.kind === 'case' ? (
        <>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
            <Fact term="Buyer">
              {overview.buyer} · {overview.bookingId}
            </Fact>
            <Fact term="Booking Price">{overview.price}</Fact>
            <Fact term="Booked On">{overview.bookedOn}</Fact>
            <Fact term="Loan And SPA" wide>
              {overview.position}
            </Fact>
            <Fact term="Next Step" wide>
              {overview.nextStep ?? 'Nobody Owes A Move'}
            </Fact>
          </dl>
          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={onOpenCase}>
              Open Case
            </Button>
          </div>
        </>
      ) : null}
    </section>,
    document.body
  )
}
