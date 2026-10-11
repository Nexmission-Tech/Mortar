# Illustrated Booking Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the case page's five-bar journey strip with the approved
illustrated roadmap: five ink drawings on one road, You Are Here at the awaited
stop, a bank-rejection detour, factual details on hover, focus or tap, and a
stacked phone layout.

**Architecture:** Presentation over plan 1's `bookingJourney()` model. Three
pure helpers (`journeyRoute.ts` road geometry, `details.ts` copy,
`useMediaQuery`) and three view files (`MilestoneIllustrations.tsx`,
`BookingJourney.tsx`, `journey.css`). Desktop details use the existing Radix
`Tooltip`, controlled so a click pins it; phones use an inline disclosure. The
page swaps `CaseJourney` for `BookingJourney`; the full layout redesign is
plan 3.

**Tech Stack:** React 19, Radix Tooltip, Vitest + Testing Library, plain CSS
with theme tokens.

**Spec:** `docs/research/case-page/README.md` §5 (Booking Journey), §10B
(component tree) and `mockup.html` (the journey markup and CSS this ports).

## Global Constraints

- Geometry from the spec: viewBox `0 0 1168 240`, nodes at x = 104, 320, 558,
  804, 1064 on y = 100, stations at top 32px, 64px drawings (40px on phones),
  map 240px (260px at 720–959px), phones below 720px.
- Colours only through tokens (`--foreground`, `--card`, `--muted`, `--input`,
  `--muted-foreground`, `--border`, `--card-border`, `--status-danger-fg`,
  `--color-ink-800`). No raw hex in components or CSS.
- No illustration class named `outline`; every drawing class starts
  `journey-art`.
- Only a filled, checked node means confirmed. The check needs
  `state === 'done'` and no current wait on that stop.
- The travelled road draws once on mount over 560ms; never on refresh, hover or
  tab change; not at all under reduced motion.

## Review Focus

1. **Detour must not open the Documents details:** pinned in Task 4
   (`opens loan history from the detour without opening the Documents details`).
2. **Pinning:** a click keeps details open after the pointer leaves; a second
   click closes them. Pinned in Task 4.
3. **Phone semantics:** `aria-expanded` and a `region` labelled by its trigger,
   no tooltip role. Pinned in Task 4.
4. **Closed case:** a cap at the last reached stop, no You Are Here. Pinned in
   Tasks 1 and 4.

---

### Task 1: Road Geometry And Case Age

**Files:**

- Create: `frontend/src/components/bookings/journey/journeyRoute.ts`
- Create:
  `frontend/src/components/bookings/journey/__tests__/journeyRoute.test.ts`
- Modify: `frontend/src/components/bookings/bookingJourney.ts` (add `ageDays`)
- Modify: `frontend/src/components/bookings/__tests__/bookingJourney.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest'
import {
  ROAD_BED,
  routePaths
} from '@/components/bookings/journey/journeyRoute'

describe('routePaths', () => {
  it('travels to the awaited stop and dashes the rest', () => {
    const road = routePaths(3, 'open')
    expect(road.travelled).toBe(
      'M54 100H104C176 100 248 88 320 100C392 112 486 100 558 100C640 100 722 88 804 100'
    )
    expect(road.ahead).toBe('M804 100C886 112 972 100 1064 100H1114')
    expect(road.cap).toBeNull()
  })

  it('travels the whole road once the SPA is signed', () => {
    const road = routePaths(4, 'complete')
    expect(road.travelled).toBe(ROAD_BED)
    expect(road.ahead).toBeNull()
  })

  it('caps a closed case just past its last reached stop', () => {
    const road = routePaths(2, 'closed')
    expect(road.travelled).toMatch(/558 100h16$/)
    expect(road.cap).toBe('M574 94v12')
    expect(road.ahead).toMatch(/^M558 100C/)
  })

  it('draws nothing travelled before the booking is on the log', () => {
    expect(routePaths(-1, 'open')).toEqual({
      travelled: null,
      ahead: ROAD_BED,
      cap: null
    })
  })
})
```

Add to the BK-9002 case in `bookingJourney.test.ts`, after
`expect(model.resolution).toBe('open')`:

```ts
expect(model.ageDays).toBe(17)
```

- [ ] **Step 2: Run to verify they fail**

Run: `rtk bun run --cwd frontend test -- journeyRoute bookingJourney` Expected:
FAIL (missing module; `ageDays` undefined).

- [ ] **Step 3: Implement**

`journeyRoute.ts`:

```ts
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
export function routePaths(
  through: number,
  ending: 'open' | 'complete' | 'closed'
): RoutePaths {
  if (through < 0) return { travelled: null, ahead: ROAD_BED, cap: null }
  const x = NODE_X[through]!
  const complete = ending === 'complete' && through === NODE_X.length - 1
  return {
    travelled:
      START +
      BENDS.slice(1, through + 1).join('') +
      (complete ? TAIL : ending === 'closed' ? 'h16' : ''),
    ahead: complete
      ? null
      : `M${x} 100${BENDS.slice(through + 1).join('')}${TAIL}`,
    cap: ending === 'closed' ? `M${x + 16} 94v12` : null
  }
}
```

In `bookingJourney.ts`, add to `BookingJourneyModel` after `referenceDate`:

```ts
/** Calendar days from the booking date to the reference date. */
ageDays: number
```

and to the returned object after `referenceDate: ref,`:

```ts
    ageDays: ordinal(ref) - ordinal(booking.bookingDate),
```

- [ ] **Step 4: Run to verify they pass**

Run: `rtk bun run --cwd frontend test -- journeyRoute bookingJourney` Expected:
PASS (12 tests).

- [ ] **Step 5: Commit**

```bash
rtk git add frontend/src/components/bookings
rtk git commit -m "feat(case): add the journey road geometry and case age"
```

### Task 2: Drawings, Copy And The Media Hook

**Files:**

- Create: `frontend/src/components/bookings/journey/MilestoneIllustrations.tsx`
- Create: `frontend/src/components/bookings/journey/details.ts`
- Create: `frontend/src/hooks/useMediaQuery.ts`
- Create: `frontend/src/components/bookings/journey/__tests__/details.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { REFERENCE_DATE, STORIES, summarizeCases } from '@mortar/core'
import { bookingJourney } from '@/components/bookings/bookingJourney'
import {
  journeyDetails,
  stopStatus
} from '@/components/bookings/journey/details'
import { MilestoneIllustration } from '@/components/bookings/journey/MilestoneIllustrations'

const story = STORIES.find((s) => s.booking.id === 'BK-9002')!
const summary = summarizeCases(
  {
    bookings: [story.booking],
    applications: story.applications,
    events: story.events,
    tasks: []
  },
  REFERENCE_DATE
)[0]!
const model = bookingJourney({
  booking: story.booking,
  summary,
  events: story.events,
  applications: story.applications,
  referenceDate: REFERENCE_DATE
})
const stop = (id: string) => model.stops.find((s) => s.id === id)!

describe('journeyDetails', () => {
  it('words the awaited approval without claiming it happened', () => {
    const copy = journeyDetails(stop('loan_approved'), model)
    expect(copy.title).toBe('Loan Approved · Awaiting Decision')
    expect(copy.lines).toContain('Approval Date: —')
    expect(
      copy.lines.some(
        (l) => l.startsWith('Banker: ') && l.includes('Crestline Bank')
      )
    ).toBe(true)
    expect(copy.lines.some((l) => l.startsWith('Desk: '))).toBe(false)
    expect(copy.rule).toMatch(
      /^8 calendar days since submission\..*Approval has not been confirmed\.$/
    )
  })

  it('lists the rejected first bank under the resubmission', () => {
    const copy = journeyDetails(stop('loan_submitted'), model)
    expect(copy.title).toBe('Loan Submitted · Done')
    expect(copy.lines).toContain(
      'Malayan Trust Bank: 3 Sep → rejected 8 Sep (5 calendar days).'
    )
  })

  it('says how long a settled stop took and quotes its update', () => {
    const copy = journeyDetails(stop('booked'), model)
    expect(copy.lines).toContain('Update: Booking confirmed')
    expect(copy.rule).toBe('2 calendar days to the first bank submission.')
  })

  it('names the desk and the missing receipt for an unproven stop', () => {
    const docs = stop('documents')
    expect(stopStatus(docs)).toBe('Receipt Not Recorded')
    const copy = journeyDetails(docs, model)
    expect(copy.lines).toContain(`Desk: ${story.booking.loanOwner}`)
    expect(copy.rule).toBe(
      'Later work is recorded, but no document receipt is on the log.'
    )
  })
})

describe('MilestoneIllustration', () => {
  it.each([
    'booked',
    'documents',
    'loan_submitted',
    'loan_approved',
    'spa_signed'
  ] as const)('draws %s as a decorative, namespaced SVG', (id) => {
    const { container } = render(<MilestoneIllustration id={id} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.getAttribute('viewBox')).toBe('0 0 96 96')
    expect(container.querySelectorAll('.journey-art-ground')).toHaveLength(1)
    expect(container.querySelector('.outline')).toBeNull()
  })
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `rtk bun run --cwd frontend test -- details` Expected: FAIL (missing
modules).

- [ ] **Step 3: Implement**

`details.ts`:

```ts
/**
 * The words in one station's details: a title, factual lines and one closing
 * sentence, composed from the journey model. Copy only: the model owns which
 * facts exist, so a missing fact reads "—" and nothing is inferred here.
 */
import type {
  BookingJourneyModel,
  JourneyDuration,
  JourneyStop,
  JourneyStopId
} from '../bookingJourney'
import { DOCUMENT_LABELS } from '../labels'

export interface JourneyDetailCopy {
  title: string
  lines: string[]
  rule: string | null
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]
const shortDate = (iso: string) =>
  `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`
export const calendarDays = (n: number) =>
  `${n} calendar day${n === 1 ? '' : 's'}`

const SPANS: Partial<Record<JourneyStopId, (d: JourneyDuration) => string>> = {
  booked: (d) =>
    `${calendarDays(d.calendarDays)} to the first bank submission.`,
  documents: (d) => `${calendarDays(d.calendarDays)} from request to receipt.`,
  loan_approved: (d) =>
    `Approved ${calendarDays(d.calendarDays)} after submission.`,
  spa_signed: (d) =>
    `Signed ${calendarDays(d.calendarDays)} after loan approval.`
}

/** The word after a station's name: its wait when current, otherwise its state. */
export function stopStatus(stop: JourneyStop): string {
  if (stop.state === 'outstanding') return 'Outstanding'
  if (stop.current) return stop.caption
  return stop.state === 'done' ? 'Done' : stop.caption
}

export function journeyDetails(
  stop: JourneyStop,
  model: BookingJourneyModel
): JourneyDetailCopy {
  const settled = stop.state === 'done' && !stop.current
  const lines = stop.facts.map((f) => `${f.label}: ${f.value}`)
  if (!settled && !stop.facts.some((f) => f.label === 'Banker'))
    lines.push(
      `${stop.id === 'spa_signed' ? 'Panel Firm' : 'Desk'}: ${stop.responsible.join(', ')}`
    )
  if (stop.outstandingDocuments.length > 0)
    lines.push(
      `Outstanding: ${stop.outstandingDocuments.map((d) => DOCUMENT_LABELS[d]).join(', ')}`
    )
  if (stop.id === 'loan_submitted')
    for (const a of model.applications)
      if (a.decision?.kind === 'loan_rejected' && a.submitted && a.duration)
        lines.push(
          `${a.bank}: ${shortDate(a.submitted.occurredAt)} → rejected ${shortDate(a.decision.occurredAt)} (${calendarDays(a.duration.calendarDays)}).`
        )
  if (settled && stop.note) lines.push(`Update: ${stop.note}`)
  const span =
    stop.duration?.kind === 'completed'
      ? SPANS[stop.id]?.(stop.duration)
      : undefined
  const rule = [span, settled ? null : stop.note].filter(Boolean).join(' ')
  return {
    title: `${stop.label} · ${stopStatus(stop)}`,
    lines,
    rule: rule || null
  }
}
```

`MilestoneIllustrations.tsx`: the five drawings from
`docs/research/case-page/assets/*-light.svg`, one shared frame.

```tsx
/**
 * The five journey drawings: a booking form with a key and unit tag, a
 * document folder, a bank, a letter of offer with a stamp, and a signed
 * agreement with a pen. One 2-unit stroke in a 96-unit box over a faint ground
 * mark; journey.css colours them from theme tokens. Decorative: the station's
 * name, node and caption carry the meaning.
 */
import type { ReactNode } from 'react'
import type { JourneyStopId } from '../bookingJourney'

const PAPER = 'journey-art-paper journey-art-line'
const SHADE = 'journey-art-shade journey-art-line'
const LINE = 'journey-art-line'

const DRAWINGS: Record<JourneyStopId, ReactNode> = {
  booked: (
    <>
      <path className={PAPER} d="M21 12h34l11 11v56H21z" />
      <path className={SHADE} d="M55 12v12h11" />
      <path className={LINE} d="M30 31h22M30 43h26M30 51h19M30 65h13" />
      <path className={SHADE} d="m60 63 12-7 14 18-12 9-14-15z" />
      <circle className={LINE} cx="69" cy="65" r="2" />
      <circle className={PAPER} cx="65" cy="49" r="9" />
      <path className={LINE} d="m61 57-9 18m4-8 5 3m-8 3 5 3" />
    </>
  ),
  documents: (
    <>
      <path className={SHADE} d="M13 31h24l6 6h39v43H13z" />
      <path className={PAPER} d="M26 14h35l10 11v38H26z" />
      <path className={SHADE} d="M61 14v11h10" />
      <path className={LINE} d="M35 32h23M35 41h23" />
      <path className={PAPER} d="M12 46h27l7 6h38l-7 29H18z" />
      <rect className={SHADE} x="27" y="58" width="19" height="8" rx="1" />
    </>
  ),
  loan_submitted: (
    <>
      <path className={PAPER} d="m13 31 35-20 35 20z" />
      <path className={SHADE} d="M16 31h64v8H16z" />
      <path className={SHADE} d="M21 39h54v31H21z" />
      <path
        className={PAPER}
        d="M22 39h10v31H22zM43 39h10v31H43zM64 39h10v31H64z"
      />
      <path className={PAPER} d="M18 70h60v6H18zM12 76h72v7H12z" />
      <path className={LINE} d="M41 26h14" />
    </>
  ),
  loan_approved: (
    <>
      <path className={PAPER} d="M20 12h34l11 11v57H20z" />
      <path className={SHADE} d="M54 12v12h11" />
      <path className={LINE} d="M29 32h22M29 44h26M29 53h18M29 68h12" />
      <path className={SHADE} d="M50 70h34v11H50z" />
      <path
        className={PAPER}
        d="M61 70V59c0-6-5-7-5-13a11 11 0 0 1 22 0c0 6-5 7-5 13v11z"
      />
      <path className={LINE} d="M61 62h12" />
    </>
  ),
  spa_signed: (
    <>
      <path className={SHADE} d="M25 16h32l12 12v55H25z" />
      <path className={PAPER} d="M19 12h33l11 11v56H19z" />
      <path className={SHADE} d="M52 12v11h11" />
      <path
        className={LINE}
        d="M28 32h23M28 44h25M28 53h18M28 68c9-11 12-11 8-3s8-4 9-1-2 5 8 0"
      />
      <g transform="rotate(23 75 47)">
        <path className={PAPER} d="M71 16h8v47l-4 14-4-14z" />
        <path className={SHADE} d="M71 16h8v29h-8z" />
        <path className={LINE} d="M71 63h8M75 67v7" />
      </g>
    </>
  )
}

export function MilestoneIllustration({ id }: { id: JourneyStopId }) {
  return (
    <svg
      className="journey-art"
      viewBox="0 0 96 96"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse className="journey-art-ground" cx="48" cy="89" rx="34" ry="3" />
      {DRAWINGS[id]}
    </svg>
  )
}
```

`useMediaQuery.ts`:

```ts
import { useSyncExternalStore } from 'react'

/** Whether a media query matches, kept in step with the viewport; false where matchMedia is missing (jsdom). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia?.(query)
      list?.addEventListener('change', onChange)
      return () => list?.removeEventListener('change', onChange)
    },
    () => window.matchMedia?.(query).matches ?? false,
    () => false
  )
}
```

- [ ] **Step 4: Run to verify they pass**

Run: `rtk bun run --cwd frontend test -- details` Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
rtk git add frontend/src/components/bookings/journey frontend/src/hooks/useMediaQuery.ts
rtk git commit -m "feat(case): draw the five journey milestones and word their details"
```

### Task 3: The Journey Styles

**Files:**

- Create: `frontend/src/components/bookings/journey/journey.css`

No unit test: jsdom does not lay out CSS. Task 5 checks it in a browser.

- [ ] **Step 1: Write the stylesheet**

```css
/*
 * The illustrated booking journey (docs/research/case-page/README.md §5):
 * road, stations, details and the bank detour. Geometry follows the 1168 × 240
 * map; every colour is a theme token.
 */
.journey {
  --art-ink: var(--foreground);
  --art-paper: var(--card);
  --art-shade: var(--muted);
  --art-ground: 0.07;
}
.dark .journey {
  --art-shade: var(--color-ink-800);
  --art-ground: 0.1;
}
.journey-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
}
.journey-map {
  position: relative;
  height: 240px;
  isolation: isolate;
}

/* Road */
.journey-road {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 240px;
  overflow: visible;
  pointer-events: none;
}
.journey-road path {
  fill: none;
  vector-effect: non-scaling-stroke;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.journey-road-bed {
  stroke: var(--muted);
  stroke-width: 8;
}
.journey-road-ahead {
  stroke: var(--input);
  stroke-width: 1.5;
  stroke-dasharray: 3 6;
}
.journey-road-travelled {
  stroke: var(--foreground);
  stroke-width: 1.75;
  stroke-dasharray: 1;
  animation: journey-trace 560ms ease-out both;
}
.journey-road-cap {
  stroke: var(--foreground);
  stroke-width: 2;
}
.journey-road-detour {
  stroke: var(--muted-foreground);
  stroke-width: 1;
}
.journey-road-detour-narrow {
  display: none;
}
@keyframes journey-trace {
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
}

/* Stations */
.journey-stops {
  position: relative;
  height: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}
.journey-stop {
  position: absolute;
  top: 32px;
  width: 20%;
  text-align: center;
  transform: translateX(-50%);
}
.journey-stop:nth-child(1) {
  left: 8.9041%;
}
.journey-stop:nth-child(2) {
  left: 27.3973%;
}
.journey-stop:nth-child(3) {
  left: 47.774%;
}
.journey-stop:nth-child(4) {
  left: 68.8356%;
}
.journey-stop:nth-child(5) {
  left: 91.0959%;
}
.journey-trigger {
  position: relative;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  padding: 0 4px 6px;
  border-radius: 4px;
  cursor: pointer;
}
.journey-trigger:focus-visible,
.journey-detour-flag:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
.journey-station {
  position: relative;
  display: block;
  width: 64px;
  height: 64px;
  flex: none;
  transition: opacity 120ms ease-out;
}
.journey-art {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.journey-art .journey-art-line {
  fill: none;
  stroke: var(--art-ink);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.journey-art .journey-art-paper {
  fill: var(--art-paper);
}
.journey-art .journey-art-shade {
  fill: var(--art-shade);
}
.journey-art .journey-art-ground {
  fill: var(--art-ink);
  opacity: var(--art-ground);
}
.journey-stop[data-state='record_missing'] .journey-station {
  opacity: 0.68;
}
.journey-stop[data-state='record_missing'] .journey-art-line {
  stroke-dasharray: 3.5 3;
}
.journey-stop[data-state='upcoming'] .journey-station,
.journey-stop[data-state='not_reached'] .journey-station {
  opacity: 0.4;
}
.journey-stop[data-current='true'] .journey-station {
  opacity: 1;
}

/* Route nodes: only a filled, checked node means confirmed */
.journey-node {
  display: grid;
  place-items: center;
  width: 12px;
  height: 12px;
  margin-top: -2px;
  flex: none;
  border: 1.5px solid var(--foreground);
  border-radius: 50%;
  background: var(--card);
}
.journey-node svg {
  width: 8px;
  height: 8px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
}
.journey-stop[data-checked='true'] .journey-node {
  background: var(--foreground);
  color: var(--card);
}
.journey-stop[data-state='record_missing'] .journey-node {
  border-style: dashed;
  border-color: var(--muted-foreground);
}
.journey-stop[data-state='upcoming'] .journey-node,
.journey-stop[data-state='not_reached'] .journey-node {
  border-color: var(--input);
}
.journey-stop[data-current='true'] .journey-node {
  border-width: 3px;
  border-color: var(--foreground);
  outline: 1px solid var(--foreground);
  outline-offset: 4px;
}
.journey-here {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--foreground);
  color: var(--card);
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  white-space: nowrap;
}
.journey-here::after {
  content: '';
  position: absolute;
  top: 100%;
  left: calc(50% - 3px);
  border: 3px solid transparent;
  border-top-color: var(--foreground);
}

/* Labels: both rows share baselines across stations */
.journey-name {
  margin-top: 18px;
  color: var(--foreground);
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
}
.journey-meta {
  margin-top: 4px;
  color: var(--muted-foreground);
  font-size: 12px;
  line-height: 16px;
}
.journey-stop[data-stalled='true'] .journey-meta {
  color: var(--status-danger-fg);
}
.journey-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  margin-right: 4px;
  border-radius: 50%;
  background: currentColor;
  vertical-align: middle;
}

/* The bank detour, under Documents */
.journey-detour {
  position: absolute;
  top: 148px;
  left: 97.9452%;
  z-index: 1;
  width: max-content;
  transform: translateX(-50%);
}
.journey-detour-flag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--card);
  font-size: 12px;
  line-height: 16px;
  text-align: left;
  cursor: pointer;
}
.journey-detour-flag:hover {
  border-color: var(--muted-foreground);
}
.journey-detour-flag svg {
  width: 12px;
  height: 12px;
  flex: none;
}
.journey-rejected {
  color: var(--status-danger-fg);
  white-space: nowrap;
}
.journey-phone-rail,
.journey-phone-detour {
  display: none;
}

/* Details: the desktop tooltip and the phone panel share this body */
.journey-tip-title {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}
.journey-tip-line {
  display: block;
  margin-top: 4px;
}
.journey-tip-title + .journey-tip-line {
  margin-top: 0;
}
.journey-tip-rule {
  display: block;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--muted-foreground);
}
.journey-panel {
  margin: 0 0 16px 44px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--muted);
  color: var(--foreground);
  font-size: 13px;
  line-height: 18px;
  text-align: left;
}
.journey-panel .journey-tip-rule {
  border-color: var(--border);
}
.journey-foot {
  display: flex;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--card-border);
}

@media (min-width: 720px) and (max-width: 959px) {
  .journey-map {
    height: 260px;
  }
  .journey-name {
    display: flex;
    min-height: 36px;
    align-items: flex-start;
    justify-content: center;
    font-size: 13px;
    line-height: 18px;
  }
  .journey-meta {
    max-width: 108px;
  }
  .journey-detour {
    top: 170px;
    left: 101.3699%;
  }
  .journey-road-detour-wide {
    display: none;
  }
  .journey-road-detour-narrow {
    display: block;
  }
}

@media (max-width: 719px) {
  .journey-heading {
    margin-bottom: 12px;
  }
  .journey-map {
    height: auto;
  }
  .journey-road {
    display: none;
  }
  .journey-stops {
    display: flex;
    height: auto;
    flex-direction: column;
  }
  .journey-stop:nth-child(n) {
    position: relative;
    top: auto;
    left: auto;
    width: 100%;
    min-height: 72px;
    transform: none;
    text-align: left;
  }
  .journey-phone-rail {
    position: absolute;
    top: 34px;
    left: 0;
    z-index: -1;
    display: block;
    width: 36px;
    height: 100%;
    overflow: visible;
    pointer-events: none;
  }
  .journey-phone-rail path {
    fill: none;
    vector-effect: non-scaling-stroke;
    stroke-linecap: round;
  }
  .journey-rail-bed {
    stroke: var(--muted);
    stroke-width: 8;
  }
  .journey-rail-line {
    stroke: var(--foreground);
    stroke-width: 1.5;
  }
  .journey-phone-rail[data-ahead='true'] .journey-rail-line {
    stroke: var(--input);
    stroke-dasharray: 3 6;
  }
  .journey-trigger {
    display: grid;
    height: 72px;
    grid-template-columns: 80px 1fr;
    grid-template-rows: 34px 38px;
    column-gap: 12px;
    padding: 0;
    text-align: left;
  }
  .journey-station {
    position: absolute;
    top: 14px;
    left: 36px;
    width: 40px;
    height: 40px;
  }
  .journey-node {
    position: absolute;
    top: 28px;
    left: 6px;
    margin: 0;
  }
  .journey-name {
    grid-column: 2;
    grid-row: 1;
    align-self: end;
    margin: 0;
  }
  .journey-meta {
    grid-column: 2;
    grid-row: 2;
    align-self: start;
    margin-top: 4px;
  }
  .journey-here {
    top: -4px;
    left: 92px;
    transform: none;
    padding: 1px 6px;
  }
  .journey-here::after {
    left: 8px;
  }
  .journey-stop[data-current='true'] {
    margin-top: 8px;
  }
  .journey-stop:has(+ .journey-stop[data-current='true'])
    > .journey-phone-rail {
    height: calc(100% + 8px);
  }
  .journey-detour {
    position: relative;
    top: auto;
    left: auto;
    display: flex;
    width: 100%;
    height: 64px;
    align-items: center;
    padding-left: 44px;
    transform: none;
  }
  .journey-phone-detour {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    display: block;
    width: 104px;
    height: 64px;
    fill: none;
    stroke: var(--muted-foreground);
    stroke-width: 1;
  }
  .journey-detour-flag {
    width: 100%;
    min-height: 32px;
    justify-content: space-between;
  }
  .journey-foot {
    margin-top: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .journey-road-travelled {
    animation: none;
    stroke-dashoffset: 0;
  }
  .journey-station {
    transition: none;
  }
}
```

- [ ] **Step 2: Commit with Task 4** (the stylesheet is imported there).

### Task 4: The Journey Component

**Files:**

- Create: `frontend/src/components/bookings/BookingJourney.tsx`
- Create: `frontend/src/components/bookings/__tests__/BookingJourney.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import {
  REFERENCE_DATE,
  STORIES,
  summarizeCases,
  type CaseEvent
} from '@mortar/core'
import { bookingJourney } from '@/components/bookings/bookingJourney'
import { BookingJourney } from '@/components/bookings/BookingJourney'

const story = STORIES.find((s) => s.booking.id === 'BK-9002')!

function modelFor(events: CaseEvent[] = story.events) {
  const summary = summarizeCases(
    {
      bookings: [story.booking],
      applications: story.applications,
      events,
      tasks: []
    },
    REFERENCE_DATE
  )[0]!
  return bookingJourney({
    booking: story.booking,
    summary,
    events,
    applications: story.applications,
    referenceDate: REFERENCE_DATE
  })
}

/** Pretend the viewport is a phone. */
function asPhone() {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('max-width: 719px'),
    addEventListener: () => {},
    removeEventListener: () => {}
  }))
}
afterEach(() => vi.unstubAllGlobals())

const station = (name: RegExp) => screen.getByRole('button', { name })

describe('BookingJourney', () => {
  it('lists the five milestones and marks only the awaited one', () => {
    render(<BookingJourney model={modelFor()} onShowHistory={() => {}} />)
    const list = screen.getByRole('list', { name: /Booking journey/ })
    expect(within(list).getAllByRole('listitem')).toHaveLength(5)
    expect(screen.getByText('17 Days Since Booking')).toBeInTheDocument()
    const current = list.querySelectorAll('[aria-current="step"]')
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveAccessibleName(
      /^Loan Approved\. Current milestone, Awaiting Decision, stalled/
    )
    expect(screen.getByText('You Are Here')).toBeInTheDocument()
    expect(station(/^Documents\. Receipt Not Recorded/)).toBeInTheDocument()
    expect(list.querySelectorAll('[data-checked="true"]')).toHaveLength(2)
  })

  it('shows a station’s facts on focus and hides them on Escape', async () => {
    render(<BookingJourney model={modelFor()} onShowHistory={() => {}} />)
    fireEvent.focus(station(/^Loan Approved/))
    const tip = await screen.findByRole('tooltip')
    expect(tip).toHaveTextContent('Loan Approved · Awaiting Decision')
    expect(tip).toHaveTextContent('Approval Date: —')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('pins a station’s facts on click until clicked again', async () => {
    render(<BookingJourney model={modelFor()} onShowHistory={() => {}} />)
    const booked = station(/^Booked/)
    fireEvent.pointerDown(booked)
    fireEvent.click(booked)
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Booked · Done'
    )
    fireEvent.pointerLeave(booked)
    fireEvent.blur(booked)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    fireEvent.pointerDown(booked)
    fireEvent.click(booked)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('opens loan history from the detour without opening the Documents details', () => {
    const onShowHistory = vi.fn()
    render(<BookingJourney model={modelFor()} onShowHistory={onShowHistory} />)
    const flag = screen.getByRole('button', {
      name: /Malayan Trust, Rejected 8 Sep\. View loan history/
    })
    fireEvent.pointerMove(flag)
    fireEvent.click(flag)
    expect(onShowHistory).toHaveBeenCalledWith('loan')
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('caps a closed case and drops You Are Here', () => {
    const cancelled = [
      ...story.events,
      {
        ...story.events[0]!,
        id: 'EV-9002-X',
        kind: 'cancelled',
        occurredAt: '2026-09-15T10:00:00+08:00',
        recordedAt: '2026-09-15T10:05:00+08:00',
        note: 'Buyer cancelled'
      } satisfies CaseEvent
    ]
    const { container } = render(
      <BookingJourney model={modelFor(cancelled)} onShowHistory={() => {}} />
    )
    expect(screen.queryByText('You Are Here')).toBeNull()
    expect(container.querySelector('.journey-road-cap')).not.toBeNull()
    expect(station(/^SPA Signed\. Not Reached/)).toBeInTheDocument()
  })

  it('opens one stop’s facts inline on a phone', () => {
    asPhone()
    render(<BookingJourney model={modelFor()} onShowHistory={() => {}} />)
    const approved = station(/^Loan Approved/)
    expect(approved).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(approved)
    expect(approved).toHaveAttribute('aria-expanded', 'true')
    const panel = screen.getByRole('region', { name: /^Loan Approved/ })
    expect(panel).toHaveTextContent('Approval Date: —')
    expect(screen.queryByRole('tooltip')).toBeNull()
    fireEvent.click(station(/^Booked/))
    expect(approved).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getAllByRole('region')).toHaveLength(1)
    fireEvent.keyDown(station(/^Booked/), { key: 'Escape' })
    expect(screen.queryByRole('region')).toBeNull()
  })
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `rtk bun run --cwd frontend test -- BookingJourney` Expected: FAIL (missing
module).

- [ ] **Step 3: Implement**

```tsx
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
import type {
  BookingJourneyModel,
  JourneyStop,
  JourneyStopId
} from './bookingJourney'
import { journeyDetails } from './journey/details'
import { MilestoneIllustration } from './journey/MilestoneIllustrations'
import { ROAD_BED, routePaths } from './journey/journeyRoute'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
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

function DetailBody({
  stop,
  model
}: {
  stop: JourneyStop
  model: BookingJourneyModel
}) {
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
        {stop.stalled ? (
          <span className="journey-dot" aria-hidden="true" />
        ) : null}
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

  const through = model.routeThrough
    ? model.stops.findIndex((s) => s.id === model.routeThrough)
    : -1
  const road = routePaths(
    through,
    model.closure
      ? 'closed'
      : model.resolution === 'signed'
        ? 'complete'
        : 'open'
  )
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
          if (triggers.current.get(stop.id)?.contains(event.target as Node))
            event.preventDefault()
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
          <h2 className="text-xs font-medium text-muted-foreground">
            Booking Journey
          </h2>
          <span className="text-[13px] leading-[18px] tabular-nums text-muted-foreground">
            {model.ageDays} {model.ageDays === 1 ? 'Day' : 'Days'} Since Booking
          </span>
        </div>
        <div className="journey-map">
          <svg
            className="journey-road"
            viewBox="0 0 1168 240"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path className="journey-road-bed" d={ROAD_BED} />
            {road.ahead ? (
              <path className="journey-road-ahead" d={road.ahead} />
            ) : null}
            {road.travelled ? (
              <path
                className="journey-road-travelled"
                pathLength={1}
                d={road.travelled}
              />
            ) : null}
            {road.cap ? (
              <path className="journey-road-cap" d={road.cap} />
            ) : null}
            {detour ? (
              <>
                <path
                  className="journey-road-detour journey-road-detour-wide"
                  d="M410 104V204Q410 218 424 218H440Q454 218 454 204V103"
                />
                <path
                  className="journey-road-detour journey-road-detour-wide"
                  d="m450 110 4-7 4 7"
                />
                <path
                  className="journey-road-detour journey-road-detour-narrow"
                  d="M440 104V214m-3-6 3 6 3-6"
                />
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
                data-checked={
                  (stop.state === 'done' && !stop.current) || undefined
                }
              >
                {i < model.stops.length - 1 ? (
                  <svg
                    className="journey-phone-rail"
                    data-ahead={i + 1 > through || undefined}
                    viewBox="0 0 36 72"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      className="journey-rail-bed"
                      d="M12 0C12 24 26 42 12 72"
                    />
                    <path
                      className="journey-rail-line"
                      d="M12 0C12 24 26 42 12 72"
                    />
                  </svg>
                ) : null}
                {phone ? phoneStation(stop) : desktopStation(stop)}
                {stop.id === 'documents' && detour ? (
                  <div className="journey-detour">
                    <svg
                      className="journey-phone-detour"
                      viewBox="0 0 104 64"
                      aria-hidden="true"
                    >
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
                            {flagHead}{' '}
                            <span className="journey-rejected">
                              · {flagTail}
                            </span>
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
          <span className="text-[13px] leading-[18px] text-muted-foreground">
            Select A Milestone For Details
          </span>
        </div>
      </section>
    </TooltipProvider>
  )
}
```

- [ ] **Step 4: Run to verify they pass**

Run: `rtk bun run --cwd frontend test -- BookingJourney` Expected: PASS (6
tests). If the pin test fails on the second click, check the order Radix runs
`onPointerDownOutside` against the trigger's own handlers before changing the
assertion.

- [ ] **Step 5: Typecheck, lint, commit**

```bash
rtk bun run --cwd frontend typecheck
rtk bunx eslint frontend/src/components/bookings frontend/src/hooks
rtk git add frontend/src/components/bookings
rtk git commit -m "feat(case): draw the booking journey as an illustrated road"
```

### Task 5: Put It On The Case Page

**Files:**

- Modify: `frontend/src/pages/BookingDetailPage.tsx`
- Modify: `frontend/src/pages/__tests__/BookingDetailPage.test.tsx`

- [ ] **Step 1: Write the failing test**

Add to `BookingDetailPage.test.tsx`:

```tsx
it('draws the illustrated journey with You Are Here on the awaited stop', async () => {
  renderDetail('BK-9002')
  const list = await screen.findByRole('list', { name: /Booking journey/ })
  expect(within(list).getAllByRole('listitem')).toHaveLength(5)
  expect(list.querySelector('[aria-current="step"]')).toHaveAccessibleName(
    /^Loan Approved/
  )
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `rtk bun run --cwd frontend test -- BookingDetailPage` Expected: FAIL (no
list named "Booking journey").

- [ ] **Step 3: Implement**

In `BookingDetailPage.tsx`:

1. Replace the `CaseJourney, WaitingOnPanel` import with `WaitingOnPanel`, drop
   `ballInCourt` and `EventKind` from the core import, and import
   `bookingJourney` and `BookingJourney`.
2. Add
   `journey: bookingJourney({ booking, summary, events, applications, referenceDate: snapshot.meta.referenceDate })`
   to the `data` memo, using the filtered `events` and `applications` it already
   builds.
3. In the first card, render `WaitingOnPanel` first, then
   `<div className="border-t border-border pt-4"><BookingJourney key={data.booking.id} model={data.journey} onShowHistory={showLoanHistory} /></div>`,
   then the `RecordUpdateForm`.
4. Give the `TrackTimelines` wrapper `id="case-tracks"` and add
   `const showLoanHistory = useCallback(() => document.getElementById('case-tracks')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }), [])`.
   Plan 3 replaces this with the History view.

- [ ] **Step 4: Run to verify it passes, then the full check**

Run: `rtk bun run --cwd frontend test -- BookingDetailPage` then
`rtk bun run check`. Expected: PASS; the full check is green.

- [ ] **Step 5: Look at it in a browser**

Run the local stack, open `/bookings/BK-9002` at 1440, 960, 760, 390 and 320 px
in light and dark. Check: one shared ground line and label baselines, the detour
clear of every label, You Are Here above Loan Approved, the tooltip below the
labels, the phone panel pushing later stops down, and the road drawing once on
load.

- [ ] **Step 6: Commit**

```bash
rtk git add frontend/src/pages
rtk git commit -m "feat(case): show the illustrated journey on the case page"
```
