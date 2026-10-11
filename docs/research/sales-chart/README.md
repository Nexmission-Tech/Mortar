# Sales Chart: Design

The Sales Chart puts every unit of the project on one screen, coloured by how
far its booking has got towards a signed SPA. It is the sales department's own
artefact, the floor-by-unit chart a sales gallery already keeps, joined to the
loan and legal evidence Mortar holds. It answers the brief's sharpest line,
"nobody in the group can say how many live bookings will sign", in one picture.

This document is the design. It was agreed on 11 October 2026 for the Chin Hin
preliminary pitch, an online live demo in front of sales staff and top
management.

Contents:

1.  [Why](#why)
1.  [What It Shows](#what-it-shows)
1.  [The Project Layout](#the-project-layout)
1.  [Unit States](#unit-states)
1.  [Figures And Filters](#figures-and-filters)
1.  [The Two Views](#the-two-views)
1.  [Data Flow](#data-flow)
1.  [Access And Peer Visibility](#access-and-peer-visibility)
1.  [Design System Exception](#design-system-exception)
1.  [Pitch Use](#pitch-use)
1.  [Out Of Scope](#out-of-scope)
1.  [Acceptance](#acceptance)
1.  [Delivery](#delivery)
1.  [Sources](#sources)

## Why

- **Sales thinks in units, not booking IDs.** A sales director reads a tower as
  floors and stacks. Mortar today shows bookings as rows and cards, which suits
  the admin desks and not the people who sold the units.
- **Booked is not sold.** The thesis of the pitch becomes visible: a tower that
  looks full of bookings, with far fewer units actually signed.
- **One picture, then the existing workflow.** Clicking a unit opens the same
  case side sheet that Today and Bookings use. The chart adds a way in, not a
  new workflow.
- **Two references pointed the same way.** A three.js warehouse digital twin
  (floating figures over a clickable scene, a side panel for the selection) and
  a Singapore condo viewer (blocks with coloured unit stacks, click a unit for
  its details) both make a building the interface.
- **A domain consult agreed, with a warning.** The actionable chart is worth it;
  free-flight cameras, scenery, eight competing colours and floating cards are
  not. Separate inventory, progress and attention, and keep a 2D grid.

## What It Shows

One page, **Sales Chart** at `/sales-chart`:

1.  A header: "Sales Chart", then "Aster Heights · 936 units · Simulated data ·
    as of <reference date>".
1.  Four figures: Active Unsigned, Expected SPAs In 30 Days (with its range),
    Needs Action, Release Reviews. A note says they overlap.
1.  A toolbar: the view switch (Building, Grid), three filter chips, and in the
    Building view the tower presets (All, A, B, C).
1.  The chart, with a legend rail on the right that names each state and its
    count.
1.  Clicking a unit opens `CaseQuickView` for its booking. Clicking an available
    unit shows a small panel with the unit code and "Available".

## The Project Layout

The layout is the existing project settings (Settings, Project): blocks, floor
range and units per floor, plus a new numbering choice. Add Bookings already
validates units against them, so the chart and intake share one inventory. The
demo default becomes **Aster Heights**:

| Setting       | Demo Value          |
| ------------- | ------------------- |
| Blocks        | A, B, C             |
| Floors        | 3 to 28 (26 floors) |
| Units A Floor | 12                  |
| Numbering     | Skip Four           |
| Units         | 936                 |

- **Malaysian numbering.** Under Skip Four, a floor or unit number that contains
  a 4 takes the number below with an A: 3A, 13A, 23A, and unit 03A. The story
  fixtures already use this (`A-23A-02`, `B-21-03A`), and sales staff will
  recognise it. Records saved before the field existed read as plain.
- **Unit code.** `<block>-<floor label>-<unit label>`, for example `A-12-03`,
  `A-13A-05`, `B-21-03A`. A plain-numbered code such as `A-24-02` lands on the
  same unit as `A-23A-02`.
- **One name.** The generator's project becomes Aster Heights, matching the
  story fixtures and the product docs. `Residensi Cahaya Muda` goes, and the old
  default of one block with 35 floors, the source of the "35 floors" figure,
  goes with it.
- **Unique units.** The generator draws unit codes at random, and the canonical
  demo has ten codes held by two bookings. A post-pass gives each duplicate the
  next free code in layout order, never consuming the random stream, so every
  other value in the dataset stays the same. Story fixture units are reserved.
- **Demo reset.** Add Demo Data rewrites the stored project settings to the demo
  layout, so the bookings always sit inside the chart.
- **Take-up.** 148 demo bookings over 936 units is about 16%. It is a property
  of the simulation, never a finding.

## Unit States

Each unit has exactly one state, chosen in this order. Each maps to one of the
six status tones, and every rendering shows the word.

| Order | State          | Rule                                                         | Tone       |
| ----- | -------------- | ------------------------------------------------------------ | ---------- |
| 1     | Available      | No live booking and no signed booking holds the unit         | (outline)  |
| 2     | SPA Signed     | The holding booking has a confirmed `spa_signed`             | `signed`   |
| 3     | Release Review | Live, unsigned, and a release trigger holds (below)          | `danger`   |
| 4     | Needs Action   | Live, unsigned, and the stall rule gives at least one reason | `warning`  |
| 5     | Loan Approved  | Live, unsigned, a confirmed `loan_approved` is on the log    | `positive` |
| 6     | Booked         | Any other live booking                                       | `info`     |

- **The holding booking** is the live booking on the unit, or else the latest
  signed one. A cancelled or lapsed booking frees its unit, which reads
  Available.
- **Release Review triggers** (advisory, after the 48-Hour Clean Exit idea): the
  buyer's last word is a withdrawal; or two or more bank rejections with no
  application still live; or the booking is 30 days old with no application
  submitted, pending documents or approved. Copy: "An authorised person decides
  whether to cancel and re-release. Mortar never cancels."
- **Needs Action** reuses `stallReasons` from `summarizeCases`, the same rule
  that fills Today. It already covers "No Update For N Days".
- **Available is a simulation fact.** In production the inventory comes from the
  developer's unit register; without it a unit reads Unknown, never Available.
  The pitch says this.

## Figures And Filters

The four figures, computed over the bookings the viewer may see:

| Figure                   | Definition                                                 |
| ------------------------ | ---------------------------------------------------------- |
| Active Unsigned          | Live bookings without a signed SPA                         |
| Expected SPAs In 30 Days | The forecast page's 30-day expected signings and its range |
| Needs Action             | The Needs Action filter's count                            |
| Release Reviews          | The Release Review filter's count                          |

The three filters. One is active at a time; selecting it again clears it. A
filter lights only units the viewer may open, so its count is always the number
of units lit. Units that do not match fade to a pale neutral; matching units
keep their colour. The legend, by contrast, counts every unit in the project.

| Filter                            | Matches                                                     |
| --------------------------------- | ----------------------------------------------------------- |
| Needs Action                      | Live, unsigned bookings with stall reasons                  |
| Loan Approved, No SPA Appointment | Live, unsigned, loan approved, no SPA appointment on record |
| Release Review                    | Units in Release Review                                     |

The second filter is the sales closing list: buyers whose loan is through and
who only need a signing date. It is the same split the Legal desk's "No
Appointment Yet" section uses.

## The Two Views

### Building

- **Library:** three.js through `@react-three/fiber`, loaded only when the
  Building view first renders, so no other page pays for it.
- **Scene:** the towers side by side on a flat podium slab, each floor laid out
  as two rows of units (6 × 2 for the demo's 12 a floor). Each unit is a box
  with a small gap. Floor labels every five floors and the tower letters are DOM
  labels in Geist, not canvas text.
- **Shading:** flat. Each face is the unit's tone at one of three fixed
  lightness steps (top, left, right) from an ambient light plus one directional
  light with flat shading. No gradients, glow, transparency, shadows or
  textures.
- **Colours** are read at runtime from the CSS custom properties in
  `globals.css`, so the scene follows light and dark mode and no hex value lives
  outside `globals.css`.
- **Camera:** orthographic and isometric. Dragging rotates within limits;
  scrolling zooms within limits; panning is off. Tower presets frame one tower
  or all three over the base motion duration, instantly under reduced motion.
- **Rendering on demand.** The scene renders when something changes and never
  runs an animation loop, which keeps a shared screen sharp and the laptop
  quiet.
- **Hover** shows the unit code and state in a tooltip. **Selection** outlines
  the unit in ink and opens the side sheet.
- **Fallback:** without WebGL the page shows the Grid view and says why. Below
  720px the Grid view is the default.

### Grid

- One table per tower, side by side: floors top to bottom (28 to 3), units left
  to right, each cell a small square in the state's tone.
- Attention states also carry a mark, so state never relies on colour alone.
  Every cell has an accessible name: "B-12-03, Needs Action".
- The grid is one tab stop with arrow-key movement (roving tab index); Enter
  opens the unit.
- The Grid view is the accessible representation of the chart and the one the
  tests drive.

The chosen view is remembered per browser under `mortar.salesChart.view`.

## Data Flow

```text
Dataset ──► summarizeCases ──► heldUnits(settings, bookings, summaries)
                                        │
          scopeSnapshot(profile) ──► snapshot.units  (held units, scoped ids)
                                        │
             chartUnits(settings, units) ──► /sales-chart: Building or Grid
                                        │
                              CaseQuickView (in-scope bookings only)
```

- `@mortar/core` gains `units.ts`: the numbering rules, `projectUnits`, the
  duplicate pass, `releaseReview`, `heldUnits` and `chartUnits`. All are pure
  and tested.
- The snapshot gains `projectSettings` and `units`: only the units bookings
  hold, each with its code, state, sales owner and, only when the viewer may
  open it, the booking ID. `scopeSnapshot` computes them from the full dataset
  before it filters bookings. The client fills in every other unit as Available
  with `chartUnits`, so the payload stays small.
- The page reads `snapshot.units` for colour and `useCases()` for the figures
  and filters, so the chart and Today never disagree.

## Access And Peer Visibility

- Every persona can open the Sales Chart. It is primary in the sidebar for Sales
  Admin and Manager, and under More for Loan Admin and Legal Admin.
- A unit's state is project inventory, not buyer data, so everyone sees the
  whole tower. Clicking a unit held by another desk opens nothing private; it
  says whose desk holds it, which keeps peer visibility a real feature.
- Figures and filters count only the viewer's own bookings, matching Today.

## Design System Exception

`DESIGN.md` gains one named exception in its usual style: the Sales Chart's
Building view is the one 3D surface in the product. It is scoped to
`/sales-chart`, uses only the six status tones at three fixed face steps, has no
gradient, glow, glass, texture, shadow, autoplay or looping motion, and moves
only on user input. No other surface may use three.js or its tokens. The Grid
view follows the ordinary rules.

## Pitch Use

The live walkthrough opens on the chart for about 45 seconds:

1.  As Robert Khoo (Manager), open Sales Chart. "This is Aster Heights the way
    your sales gallery sees it, except every unit is joined to its loan and its
    SPA."
1.  Read two figures. "We booked this many. This many are signed."
1.  Click **Loan Approved, No SPA Appointment**. A handful of units stay lit.
    "These buyers have their loan. They only need a signing date."
1.  Click one. The side sheet names the solicitor, the wait and the owner.
    Record the appointment, and the unit's state changes in front of the room.
1.  Continue with the existing walkthrough from BK-9001.

The deck's walkthrough slide and the script change to match. Online, keep the
camera still while talking; move it only to frame a tower.

## Out Of Scope

- Walking inside units, floor plans, prices or psf on the blocks.
- Scenery, roads, trees, free-flight cameras, auto-rotation.
- The LAD Burn Clock and automatic cancellation of any kind.
- A new persona or a new queue; the chart routes into existing desks.
- Real inventory import. The pitch names it as the production step.

## Acceptance

1.  `/sales-chart` renders 936 units for the canonical demo with no duplicate
    codes, and every story fixture keeps its unit code.
1.  Each unit's state follows the order in [Unit States](#unit-states); core
    tests cover every state and every Release Review trigger.
1.  A Sales Admin sees the whole tower; the booking ID appears only for her own
    bookings, and her figures count only her bookings.
1.  Each filter's count equals the number of units it lights, and the Loan
    Approved, No SPA Appointment count equals the Legal desk's No Appointment
    Yet count for the same viewer.
1.  Clicking an in-scope unit opens `CaseQuickView`; recording an update there
    changes the unit's state without a reload.
1.  The Building view loads in its own chunk, renders on demand, and falls back
    to the Grid view without WebGL.
1.  The Grid view meets the design system's acceptance rules: every state has a
    word, contrast passes, and it works by keyboard.
1.  `bun run check` and `bun run build` pass.

## Delivery

Four pull requests, each merged when CI is green:

1.  **Core and server:** layout, numbering, duplicate pass, project name, unit
    states, `snapshot.units`, tests, TRD.
1.  **Page and Grid:** route, navigation, figures, filters, legend, Grid view,
    side sheet, tour step, PRD, PRODUCT, DESIGN component entry.
1.  **Building view:** three.js dependencies, the scene, fallback, the
    `DESIGN.md` exception.
1.  **Pitch:** script, deck walkthrough slide, notes.

## Sources

- The three.js "WareTrack" post, 4 October 2026, read with `lurk`.
- Instagram reel by @aaron.oon, "Game-ifying Real Estate in Singapore", read as
  frames through a mirror; the audio was not heard.
- A domain consult on Malaysian developer sales departments, run with Codex on
  11 October 2026. Its practice claims are unverified for Chin Hin.
- [Feature Ideas](../feature-ideas/README.md), for the 48-Hour Clean Exit
  triggers.
- [Practitioner Survey](../practitioner-survey/README.md) and
  [PRODUCT.md](../../PRODUCT.md) for the REHDA take-up figure.
