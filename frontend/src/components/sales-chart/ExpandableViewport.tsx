/**
 * The Building view's frame: zoom in, zoom out and expand controls at its
 * bottom right, and an expanded mode that lifts the view into a modal covering
 * 80% of the screen over a dimmed, blurred backdrop. The expanded view is
 * portalled to the body at z 62–63: above the top bar and sidebar, and below
 * the unit island (raised to 64 while expanded), the case panel (70–71) and
 * tooltips (100), so nothing that opens from it is hidden underneath.
 */
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Maximize2, Minimize2, Minus, Plus } from 'lucide-react'

export type ViewportMode = 'inline' | 'expanded'

const ZOOM_STEP = 1.25

function ControlButton({
  label,
  onClick,
  children,
  buttonRef
}: {
  label: string
  onClick: () => void
  children: ReactNode
  buttonRef?: React.Ref<HTMLButtonElement>
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-[var(--shadow-card)] transition-colors duration-[var(--motion-fast)] hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:size-4"
    >
      {children}
    </button>
  )
}

export function ExpandableViewport({
  label,
  expanded,
  onExpandedChange,
  escapeEnabled = true,
  onZoom,
  children
}: {
  /** The modal's accessible name, e.g. "Building View". */
  label: string
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
  /** False while something inside owns Escape first, such as a selected unit. */
  escapeEnabled?: boolean
  /** Multiplies the view's zoom: above 1 zooms in, below 1 zooms out. */
  onZoom: (factor: number) => void
  /** Draws the view; called once, inline or expanded, never both. */
  children: (mode: ViewportMode) => ReactNode
}) {
  const expandButton = useRef<HTMLButtonElement>(null)
  const collapseButton = useRef<HTMLButtonElement>(null)
  const wasExpanded = useRef(false)

  // Focus follows the mode: Collapse when the modal opens, Expand when it closes.
  useEffect(() => {
    if (expanded) collapseButton.current?.focus()
    else if (wasExpanded.current) expandButton.current?.focus()
    wasExpanded.current = expanded
  }, [expanded])

  // The page behind stays still and out of the Tab order while the modal is open.
  // Layers portalled to the body (the unit island, the case panel) stay reachable.
  useEffect(() => {
    if (!expanded) return
    const body = document.body
    const before = body.style.overflow
    body.style.overflow = 'hidden'
    const root = document.getElementById('root')
    root?.setAttribute('inert', '')
    return () => {
      body.style.overflow = before
      root?.removeAttribute('inert')
    }
  }, [expanded])

  useEffect(() => {
    if (!expanded) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || !escapeEnabled) return
      onExpandedChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded, escapeEnabled, onExpandedChange])

  const controls = (mode: ViewportMode) => (
    <div className="absolute bottom-3 right-3 z-[2] flex flex-col gap-2">
      <ControlButton label="Zoom In" onClick={() => onZoom(ZOOM_STEP)}>
        <Plus aria-hidden="true" />
      </ControlButton>
      <ControlButton label="Zoom Out" onClick={() => onZoom(1 / ZOOM_STEP)}>
        <Minus aria-hidden="true" />
      </ControlButton>
      {mode === 'inline' ? (
        <ControlButton label="Expand" buttonRef={expandButton} onClick={() => onExpandedChange(true)}>
          <Maximize2 aria-hidden="true" />
        </ControlButton>
      ) : (
        <ControlButton label="Collapse" buttonRef={collapseButton} onClick={() => onExpandedChange(false)}>
          <Minimize2 aria-hidden="true" />
        </ControlButton>
      )}
    </div>
  )

  if (!expanded) {
    return (
      <div className="relative">
        {children('inline')}
        {controls('inline')}
      </div>
    )
  }

  return (
    <>
      {/* Keeps the page's height while the view is lifted out of it. */}
      <div className="flex h-[620px] items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
        The Building View Is Open In Its Own Window.
      </div>
      {createPortal(
        <div className="fixed inset-0 z-[62]">
          <div
            data-testid="viewport-backdrop"
            aria-hidden="true"
            className="absolute inset-0 bg-[var(--scrim)] backdrop-blur-[var(--scrim-blur)] duration-[var(--motion-base)] animate-in fade-in-0"
            onClick={() => onExpandedChange(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="absolute inset-3 z-[63] flex flex-col overflow-hidden rounded-md border border-border bg-card p-4 shadow-[var(--shadow-overlay)] duration-[var(--motion-slow)] animate-in fade-in-0 motion-safe:zoom-in-95 md:inset-[10%]"
          >
            <div className="relative min-h-0 flex-1">
              {children('expanded')}
              {controls('expanded')}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
