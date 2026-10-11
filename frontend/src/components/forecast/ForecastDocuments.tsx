/**
 * Forecast documents — the detail behind the forecast as a stack of documents
 * (#54). The chips above the stack pick a document; the front card shows its
 * title and summary beside a square motif, and the cards behind it peek out
 * underneath. Previous and next buttons, the arrow keys and a swipe move
 * through the stack. Open Document reads it in a centred dialog; Ask MortarAI
 * opens the assistant with a question about it already sent.
 */

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject
} from 'react'
import { LazyMotion, domAnimation, m } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { askMortarAI } from '@/components/brain/askBus'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export interface ForecastDocument {
  id?: string
  title: string
  summary: string
  dataNote?: string
  /** A square monochrome illustration, served from `public/forecast/`. */
  motif: string
  /** What Ask MortarAI is asked about this document. */
  question: string
  content: ReactNode
  finding?: { value: string; label: string; detail?: string }
}

type Direction = -1 | 1
type OutgoingPhase = 'lift' | 'settle'

interface OutgoingDocument {
  document: ForecastDocument
  index: number
  total: number
  direction: Direction
  sequence: number
  phase: OutgoingPhase
}

interface DocumentStackState {
  selectedId: string | null
  outgoing: OutgoingDocument | null
  sequence: number
  documentSetKey: string
}

interface PointerStart {
  pointerId: number
  clientX: number
  clientY: number
}

const SWIPE = 48
const PHASE_DURATION = 0.18
const REDUCED_DURATION = 0.1
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function documentKey(document: ForecastDocument) {
  return document.id ?? document.title
}

function transitionTo(
  current: DocumentStackState,
  documents: ForecastDocument[],
  requestedIndex: number,
  direction?: Direction
): DocumentStackState {
  if (documents.length < 2) return current

  const foundIndex = documents.findIndex((document) => documentKey(document) === current.selectedId)
  const sourceIndex = foundIndex < 0 ? 0 : foundIndex
  const targetIndex = ((requestedIndex % documents.length) + documents.length) % documents.length
  const source = documents[sourceIndex]
  const target = documents[targetIndex]
  if (!source || !target) return current

  if (targetIndex === sourceIndex) {
    if (current.selectedId === documentKey(target)) return current
    return {
      ...current,
      selectedId: documentKey(target),
      outgoing: null,
      sequence: current.sequence + 1
    }
  }

  const sequence = current.sequence + 1
  return {
    selectedId: documentKey(target),
    outgoing: {
      document: source,
      index: sourceIndex,
      total: documents.length,
      direction: direction ?? (targetIndex > sourceIndex ? 1 : -1),
      sequence,
      phase: 'lift'
    },
    sequence,
    documentSetKey: current.documentSetKey
  }
}

interface DocumentCoverProps {
  document: ForecastDocument
  index: number
  total: number
  interactive: boolean
  openDocumentRef?: RefObject<HTMLButtonElement | null>
  onOpen?: () => void
}

function DocumentCover({ document, index, total, interactive, openDocumentRef, onOpen }: DocumentCoverProps) {
  const actions = (
    <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {interactive ? (
        <>
          <button
            ref={openDocumentRef}
            type="button"
            onClick={onOpen}
            className="flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            Open Document
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => askMortarAI(document.question)}
            className="flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            Ask Mortar AI
            <Sparkles aria-hidden="true" className="size-4" />
          </button>
        </>
      ) : (
        <>
          <span className="flex items-center gap-1 text-sm font-medium text-foreground">
            Open Document
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-foreground">
            Ask Mortar AI
            <Sparkles aria-hidden="true" className="size-4" />
          </span>
        </>
      )}
    </span>
  )

  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-6">
        <span className="text-[11px] font-semibold uppercase leading-[14px] tracking-[0.08em] text-muted-foreground">
          Document {index + 1} Of {total}
        </span>
        <span className="forecast-document-copy flex min-w-0 flex-col gap-2">
          <span className="break-words text-2xl font-semibold leading-8 tracking-[-0.02em] text-foreground">
            {document.title}
          </span>
          <span className="max-w-[60ch] break-words text-sm leading-6 text-muted-foreground">{document.summary}</span>
          {document.finding && (
            <span className="mt-1 flex min-w-0 flex-col gap-0.5">
              <span className="break-words text-3xl font-semibold leading-9 tracking-[-0.03em] tabular-nums text-foreground">
                {document.finding.value}
              </span>
              <span className="break-words text-sm font-medium leading-5 text-foreground">
                {document.finding.label}
              </span>
              {document.finding.detail && (
                <span className="break-words text-sm leading-5 text-muted-foreground">{document.finding.detail}</span>
              )}
            </span>
          )}
        </span>
        {actions}
      </div>
      <img
        src={document.motif}
        alt=""
        draggable={false}
        className="hidden aspect-square h-auto shrink-0 select-none self-center rounded-md object-cover sm:block sm:w-[46%] sm:max-w-[426px] dark:invert-[0.9]"
      />
    </>
  )
}

export function ForecastDocuments({ documents }: { documents: ForecastDocument[] }) {
  const documentSetKey = JSON.stringify(documents.map(documentKey))
  const [deck, setDeck] = useState<DocumentStackState>(() => ({
    selectedId: documents[0] ? documentKey(documents[0]) : null,
    outgoing: null,
    sequence: 0,
    documentSetKey
  }))
  const [open, setOpen] = useState(false)
  const openDocumentRef = useRef<HTMLButtonElement>(null)
  const pointerStartRef = useRef<PointerStart | null>(null)
  const suppressClickRef = useRef(false)
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
    return window.matchMedia(REDUCED_MOTION_QUERY).matches
  })
  const reducedMotionRef = useRef(reducedMotion)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return

    const preference = window.matchMedia(REDUCED_MOTION_QUERY)
    const updatePreference = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches
      setReducedMotion(event.matches)
    }
    preference.addEventListener('change', updatePreference)
    return () => preference.removeEventListener('change', updatePreference)
  }, [])

  if (deck.documentSetKey !== documentSetKey) {
    const selectionStillPresent = documents.some((document) => documentKey(document) === deck.selectedId)
    setDeck({
      selectedId: selectionStillPresent ? deck.selectedId : documents[0] ? documentKey(documents[0]) : null,
      outgoing: null,
      sequence: deck.sequence + 1,
      documentSetKey
    })
  }

  const { selectedId, outgoing } = deck
  const selectedIndex = documents.findIndex((document) => documentKey(document) === selectedId)
  const index = documents.length === 0 ? -1 : selectedIndex < 0 ? 0 : selectedIndex
  const active = documents[index]

  const navigateTo = (requestedIndex: number, direction?: Direction) => {
    setDeck((current) => transitionTo(current, documents, requestedIndex, direction))
  }

  const move = (direction: Direction) => {
    if (documents.length < 2) return
    setDeck((current) => {
      const foundIndex = documents.findIndex((document) => documentKey(document) === current.selectedId)
      return transitionTo(current, documents, (foundIndex < 0 ? 0 : foundIndex) + direction, direction)
    })
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.nativeEvent.isComposing ||
      !(event.target instanceof Element) ||
      event.target.closest('button, input, textarea, select, [contenteditable="true"], [role="dialog"]')
    ) {
      return
    }

    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    if (documents.length < 2) return

    event.preventDefault()
    move(event.key === 'ArrowRight' ? 1 : -1)
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    suppressClickRef.current = false
    pointerStartRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY
    }
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current
    if (!start || event.pointerId !== start.pointerId) return

    pointerStartRef.current = null
    const deltaX = event.clientX - start.clientX
    const deltaY = event.clientY - start.clientY
    if (Math.abs(deltaX) < SWIPE || Math.abs(deltaX) <= Math.abs(deltaY)) return

    if (
      event.target instanceof Element &&
      event.target.closest('button, a, input, select, textarea, [role="button"]')
    ) {
      suppressClickRef.current = true
    }
    move(deltaX < 0 ? 1 : -1)
  }

  const onPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerStartRef.current?.pointerId === event.pointerId) pointerStartRef.current = null
  }

  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current || event.detail === 0) return
    suppressClickRef.current = false
    event.preventDefault()
    event.stopPropagation()
  }

  const stepper = (direction: Direction, className?: string) => (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={direction < 0 ? 'Previous document' : 'Next document'}
      onClick={() => move(direction)}
      className={cn('size-9 shrink-0 rounded-full', className)}
    >
      {direction < 0 ? <ChevronLeft aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
    </Button>
  )

  if (!active) return null

  const completeOutgoing = (sequence: number, expectedPhase: OutgoingPhase) => {
    setDeck((current) => {
      const outgoingDocument = current.outgoing
      if (
        current.sequence !== sequence ||
        outgoingDocument?.sequence !== sequence ||
        outgoingDocument.phase !== expectedPhase
      ) {
        return current
      }

      if (reducedMotionRef.current || expectedPhase === 'settle') return { ...current, outgoing: null }
      return { ...current, outgoing: { ...outgoingDocument, phase: 'settle' } }
    })
  }

  return (
    <LazyMotion features={domAnimation}>
      <section className="mt-10" aria-labelledby="forecast-documents-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="forecast-documents-heading" className="text-lg font-semibold text-foreground">
              Forecast Documents
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Pick a document to read the detail, or ask about it.</p>
          </div>
          <p
            className="shrink-0 whitespace-nowrap text-[13px] tabular-nums text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {index + 1} / {documents.length}
            <span className="sr-only">: {active.title}</span>
          </p>
        </div>

        <div
          className="mt-5 flex min-w-0 flex-wrap justify-center gap-2"
          role="group"
          aria-label="Choose a forecast document"
        >
          {documents.map((document, documentIndex) => (
            <Button
              key={documentKey(document)}
              type="button"
              variant={documentIndex === index ? 'default' : 'outline'}
              size="sm"
              aria-pressed={documentIndex === index}
              onClick={() => navigateTo(documentIndex)}
              className="max-w-full whitespace-normal text-center"
            >
              {document.title}
            </Button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 lg:gap-6">
          {documents.length > 1 && stepper(-1, 'max-sm:hidden')}
          <div
            className="forecast-document-stack relative isolate grid w-full min-w-0 max-w-[980px] flex-1 touch-pan-y overflow-x-clip pb-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            role="group"
            aria-roledescription="carousel"
            aria-label="Forecast documents"
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onClickCapture={onClickCapture}
          >
            {[2, 1].map((depth) => (
              <div
                key={depth}
                aria-hidden="true"
                inert
                className="pointer-events-none absolute inset-x-3 bottom-0 top-6 rounded-md border border-card-border bg-muted shadow-card"
                style={{ transform: `translateY(${depth * 10 - 20}px) scale(${1 - depth * 0.025})` }}
              />
            ))}

            {outgoing && (
              <m.article
                key={`outgoing-${outgoing.sequence}`}
                aria-hidden="true"
                inert
                className="forecast-document-layer pointer-events-none relative col-start-1 row-start-1 flex flex-col gap-6 rounded-md border border-card-border bg-card p-6 shadow-card sm:flex-row sm:items-stretch sm:p-8 xl:aspect-[2/1]"
                style={{ zIndex: outgoing.phase === 'lift' ? 20 : 5 }}
                initial={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
                animate={
                  reducedMotion
                    ? { x: 0, y: 0, rotate: 0, scale: 1, opacity: 0 }
                    : outgoing.phase === 'lift'
                      ? {
                          x: outgoing.direction * 96,
                          y: -6,
                          rotate: outgoing.direction * 2,
                          scale: 1,
                          opacity: 1
                        }
                      : { x: 0, y: 20, rotate: 0, scale: 0.975, opacity: 1 }
                }
                transition={{
                  ...(reducedMotion
                    ? {
                        x: { duration: 0 },
                        y: { duration: 0 },
                        rotate: { duration: 0 },
                        scale: { duration: 0 },
                        opacity: { duration: REDUCED_DURATION, ease: 'easeOut' as const }
                      }
                    : { duration: PHASE_DURATION, ease: 'easeOut' as const })
                }}
                onAnimationComplete={() => completeOutgoing(outgoing.sequence, outgoing.phase)}
              >
                <DocumentCover
                  document={outgoing.document}
                  index={outgoing.index}
                  total={outgoing.total}
                  interactive={false}
                />
              </m.article>
            )}

            <m.article
              key={documentKey(active)}
              aria-roledescription="slide"
              aria-label={`Document ${index + 1} of ${documents.length}: ${active.title}`}
              className="forecast-document-layer relative col-start-1 row-start-1 flex flex-col gap-6 rounded-md border border-card-border bg-card p-6 shadow-card sm:flex-row sm:items-stretch sm:p-8 xl:aspect-[2/1]"
              style={{
                zIndex: outgoing ? (reducedMotion ? 10 : outgoing.phase === 'lift' ? 10 : 15) : 10
              }}
              initial={
                outgoing
                  ? reducedMotion
                    ? { x: 0, y: 0, rotate: 0, scale: 1, opacity: 0.6 }
                    : { x: 0, y: 16, rotate: 0, scale: 0.975, opacity: 1 }
                  : false
              }
              animate={
                reducedMotion || !outgoing || outgoing.phase === 'settle'
                  ? { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
                  : { x: 0, y: 16, rotate: 0, scale: 0.975, opacity: 1 }
              }
              transition={
                reducedMotion
                  ? {
                      x: { duration: 0 },
                      y: { duration: 0 },
                      rotate: { duration: 0 },
                      scale: { duration: 0 },
                      opacity: { duration: REDUCED_DURATION, ease: 'easeOut' }
                    }
                  : { duration: PHASE_DURATION, ease: 'easeOut' }
              }
            >
              <DocumentCover
                document={active}
                index={index}
                total={documents.length}
                interactive
                openDocumentRef={openDocumentRef}
                onOpen={() => setOpen(true)}
              />
            </m.article>
          </div>
          {documents.length > 1 && stepper(1, 'max-sm:hidden')}
        </div>
        {documents.length > 1 && (
          <div className="mt-3 flex justify-center gap-3 sm:hidden">
            {stepper(-1)}
            {stepper(1)}
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            onCloseAutoFocus={(event) => {
              event.preventDefault()
              openDocumentRef.current?.focus()
            }}
            className="flex max-h-[min(90vh,900px)] w-[min(860px,calc(100vw-2rem))] max-w-none flex-col gap-0 overflow-hidden rounded-md bg-card p-0 shadow-[var(--shadow-overlay)]"
          >
            <div className="border-b border-border px-8 pb-5 pt-8 sm:px-12 sm:pt-10">
              <DialogHeader>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Forecast Document {index + 1} Of {documents.length}
                </p>
                <DialogTitle className="pt-2 text-2xl">{active.title}</DialogTitle>
                <DialogDescription>{active.summary}</DialogDescription>
                {active.dataNote && <p className="text-sm leading-5 text-muted-foreground">{active.dataNote}</p>}
              </DialogHeader>
            </div>
            <div className="min-h-0 max-h-[calc(min(90vh,900px)-150px)] space-y-4 overflow-y-auto px-6 py-6 sm:px-12 sm:py-8">
              {active.content}
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </LazyMotion>
  )
}
