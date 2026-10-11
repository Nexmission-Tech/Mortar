/**
 * The illustrated booking journey: five milestone drawings on one gently
 * drawn road, the stop the case is waiting on marked You Are Here, and a
 * detour flag when a bank rejected the loan. On desktop, hovering or focusing
 * a station shows its facts and a click pins them; on phones the stations
 * stack and a tap opens the facts inline. Presentation only: every state comes
 * from bookingJourney().
 */
import { useRef, useState, type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import type { BookingJourneyModel, JourneyStop, JourneyStopId } from './bookingJourney'
import { journeyDetails } from './journey/details'
import { MilestoneIllustration } from './journey/MilestoneIllustrations'
import { ROAD_BED, routePaths } from './journey/journeyRoute'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import './journey/journey.css'

/** The spoken name of a station: its milestone, then what the log says about it. */
function stationName(stop: JourneyStop): string {
  const status = stop.current
    ? `Current milestone, ${stop.caption}${stop.stalled ? ', stalled' : ''}`
    : stop.state === 'done'
      ? `Done, ${stop.caption}`
      : stop.caption
  return `${stop.label}. ${status}`
}

function DetailBody({ stop, model }: { stop: JourneyStop; model: BookingJourneyModel }) {
  const copy = journeyDetails(stop, model)
  return (
    <>
      <strong className="journey-tip-title">{copy.title}</strong>
      {copy.lines.map((line) => (
        <span key={line} className="journey-tip-line">
          {line}
        </span>
      ))}
      {copy.rule ? <span className="journey-tip-rule">{copy.rule}</span> : null}
    </>
  )
}

/** The drawing, node, name and caption inside a station's button. */
function StationFace({ stop }: { stop: JourneyStop }) {
  return (
    <>
      {stop.current ? <span className="journey-here">You Are Here</span> : null}
      <span className="journey-station" aria-hidden="true">
        <MilestoneIllustration id={stop.id} />
      </span>
      <span className="journey-node" aria-hidden="true">
        {stop.state === 'done' && !stop.current ? (
          <svg viewBox="0 0 8 8">
            <path d="m1.5 4 1.5 1.5L6.5 2" />
          </svg>
        ) : null}
      </span>
      <span className="journey-name">{stop.label}</span>
      <span className="journey-meta">
        {stop.stalled ? <span className="journey-dot" aria-hidden="true" /> : null}
        {stop.caption}
      </span>
    </>
  )
}

export function BookingJourney({
  model,
  onShowHistory
}: {
  model: BookingJourneyModel
  onShowHistory: (track: 'loan') => void
}) {
  const phone = useMediaQuery('(max-width: 719px)')
  /** The open station: hovered, focused or pinned on desktop; expanded on a phone. */
  const [open, setOpen] = useState<JourneyStopId | null>(null)
  const pinned = useRef<JourneyStopId | null>(null)
  const pressing = useRef<JourneyStopId | null>(null)
  const triggers = useRef(new Map<JourneyStopId, HTMLButtonElement>())

  const through = model.routeThrough ? model.stops.findIndex((s) => s.id === model.routeThrough) : -1
  const road = routePaths(through, model.closure ? 'closed' : model.resolution === 'signed' ? 'complete' : 'open')
  const current = model.stops.find((s) => s.current)
  const listName = current
    ? `Booking journey. ${current.label} is the milestone being waited on.`
    : model.closure
      ? 'Booking journey. The case is closed.'
      : model.resolution === 'signed'
        ? 'Booking journey. The SPA is signed.'
        : 'Booking journey.'

  const desktopStation = (stop: JourneyStop): ReactNode => (
    <Tooltip
      open={open === stop.id}
      onOpenChange={(next) => {
        if (next) {
          if (pinned.current !== stop.id) pinned.current = null
          setOpen(stop.id)
        } else if (pinned.current !== stop.id && pressing.current !== stop.id) {
          setOpen((o) => (o === stop.id ? null : o))
        }
      }}
    >
      <TooltipTrigger asChild>
        <button
          ref={(el) => {
            if (el) triggers.current.set(stop.id, el)
            else triggers.current.delete(stop.id)
          }}
          type="button"
          className="journey-trigger"
          aria-label={stationName(stop)}
          aria-current={stop.current ? 'step' : undefined}
          onPointerDown={() => {
            pressing.current = stop.id
          }}
          onPointerLeave={() => {
            pressing.current = null
          }}
          onClick={() => {
            pressing.current = null
            pinned.current = pinned.current === stop.id ? null : stop.id
            setOpen(pinned.current)
          }}
        >
          <StationFace stop={stop} />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        sideOffset={12}
        collisionPadding={16}
        className="w-[280px] max-w-[calc(100vw-32px)] p-3"
        onEscapeKeyDown={() => {
          pinned.current = null
        }}
        onPointerDownOutside={(event) => {
          // A press on this station's own button is the second click of a pin
          // toggle; the click handler decides.
          if (triggers.current.get(stop.id)?.contains(event.target as Node)) event.preventDefault()
          else pinned.current = null
        }}
      >
        <DetailBody stop={stop} model={model} />
      </TooltipContent>
    </Tooltip>
  )

  const phoneStation = (stop: JourneyStop): ReactNode => (
    <>
      <button
        type="button"
        id={`journey-${stop.id}`}
        className="journey-trigger"
        aria-label={stationName(stop)}
        aria-current={stop.current ? 'step' : undefined}
        aria-expanded={open === stop.id}
        aria-controls={`journey-${stop.id}-details`}
        onClick={() => setOpen((o) => (o === stop.id ? null : stop.id))}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && open === stop.id) {
            event.preventDefault()
            setOpen(null)
          }
        }}
      >
        <StationFace stop={stop} />
      </button>
      {open === stop.id ? (
        <div
          id={`journey-${stop.id}-details`}
          role="region"
          aria-labelledby={`journey-${stop.id}`}
          className="journey-panel"
        >
          <DetailBody stop={stop} model={model} />
        </div>
      ) : null}
    </>
  )

  const detour = model.detour
  const [flagHead, flagTail] = detour ? detour.flag.split(' · ') : []

  return (
    <TooltipProvider delayDuration={300}>
      <section className="journey" aria-label="Booking Journey">
        <div className="journey-heading">
          <h2 className="text-xs font-medium text-muted-foreground">Booking Journey</h2>
          <span className="text-[13px] leading-[18px] tabular-nums text-muted-foreground">
            {model.ageDays} {model.ageDays === 1 ? 'Day' : 'Days'} Since Booking
          </span>
        </div>
        <div className="journey-map">
          <svg className="journey-road" viewBox="0 0 1168 240" preserveAspectRatio="none" aria-hidden="true">
            <path className="journey-road-bed" d={ROAD_BED} />
            {road.ahead ? <path className="journey-road-ahead" d={road.ahead} /> : null}
            {road.travelled ? <path className="journey-road-travelled" pathLength={1} d={road.travelled} /> : null}
            {road.cap ? <path className="journey-road-cap" d={road.cap} /> : null}
            {detour ? (
              <>
                <path
                  className="journey-road-detour journey-road-detour-wide"
                  d="M410 104V204Q410 218 424 218H440Q454 218 454 204V103"
                />
                <path className="journey-road-detour journey-road-detour-wide" d="m450 110 4-7 4 7" />
                <path className="journey-road-detour journey-road-detour-narrow" d="M440 104V214m-3-6 3 6 3-6" />
              </>
            ) : null}
          </svg>
          <ol className="journey-stops" aria-label={listName}>
            {model.stops.map((stop, i) => (
              <li
                key={stop.id}
                className="journey-stop"
                data-state={stop.state}
                data-current={stop.current || undefined}
                data-stalled={stop.stalled || undefined}
                data-checked={(stop.state === 'done' && !stop.current) || undefined}
              >
                {i < model.stops.length - 1 ? (
                  <svg
                    className="journey-phone-rail"
                    data-ahead={i + 1 > through || undefined}
                    viewBox="0 0 36 72"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path className="journey-rail-bed" d="M12 0C12 24 26 42 12 72" />
                    <path className="journey-rail-line" d="M12 0C12 24 26 42 12 72" />
                  </svg>
                ) : null}
                {phone ? phoneStation(stop) : desktopStation(stop)}
                {stop.id === 'documents' && detour ? (
                  <div className="journey-detour">
                    <svg className="journey-phone-detour" viewBox="0 0 104 64" aria-hidden="true">
                      <path d="M12 2C12 17 24 20 44 20H82V44H44C24 44 12 49 12 62" />
                      <path d="m8 56 4 6 4-6" />
                    </svg>
                    <button
                      type="button"
                      className="journey-detour-flag"
                      aria-label={`${detour.flag.replace(' · ', ', ')}. View loan history`}
                      onClick={() => onShowHistory('loan')}
                    >
                      <span>
                        {flagTail ? (
                          <>
                            {flagHead} <span className="journey-rejected">· {flagTail}</span>
                          </>
                        ) : (
                          <span className="journey-rejected">{flagHead}</span>
                        )}
                      </span>
                      <ChevronRight aria-hidden="true" />
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
        <div className="journey-foot">
          <span className="text-[13px] leading-[18px] text-muted-foreground">Select A Milestone For Details</span>
        </div>
      </section>
    </TooltipProvider>
  )
}
