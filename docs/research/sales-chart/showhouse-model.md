# Sales Chart: Showhouse Model

The Building view today draws each block as a flat wall of 12 by 26 cubes. It
works as a chart, but it does not read as a building. This design rebuilds it as
the scale model a sales gallery keeps under acrylic: three real towers on a car
park podium, a landscaped facility deck, a timber plinth, roads and an arrival.
Every unit is still coloured by its state and still clickable. Clicking a unit
now raises a floating island with that unit's overview instead of the side
sheet, and the case quick view everywhere becomes a floating panel that rises
from the bottom.

This design was agreed on 11 October 2026 for the Chin Hin pitch. The owner
chose the look, the floor plate and the panel behaviour; the domain facts come
from a consult with a Malaysian sales-gallery and WebGL visualisation expert.
The reference is the Haio reel the owner shared, in which tower stacks are
coloured on a landscaped 3D site.

Contents:

1.  [Decisions](#decisions)
1.  [The Towers](#the-towers)
1.  [The Site](#the-site)
1.  [The Look](#the-look)
1.  [Interaction](#interaction)
1.  [The Unit Island](#the-unit-island)
1.  [The Floating Case Panel](#the-floating-case-panel)
1.  [Architecture](#architecture)
1.  [Design System Amendments](#design-system-amendments)
1.  [Testing](#testing)
1.  [Out Of Scope](#out-of-scope)
1.  [Acceptance](#acceptance)
1.  [Delivery](#delivery)

## Decisions

| Question                                                | Decision                                                                                                        |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| How the model looks                                     | A sales gallery model: white structure, units tinted in their state, muted landscape, a timber plinth           |
| How the towers are laid out                             | A real floor plate: units on both sides of a corridor round a lift core, numbered round the floor               |
| How it is built                                         | Procedurally from the project settings, so a change in Settings changes the model; no downloaded model or props |
| What a unit click shows on the Sales Chart              | A floating island with the unit's overview, neither a modal nor a panel; the model stays live behind it         |
| Where the floating bottom panel replaces the side sheet | Everywhere the case quick view opens: Bookings, Today and the Sales Chart's Open Case                           |

## The Towers

One scene unit is one metre. The numbers are concept-modelling values from the
consult, not a real building's plans.

- **Floor plate:** each block is a double-loaded slab. The first half of the
  floor's units, rounded up, sit along the front, left to right. The rest sit
  along the back, right to left, so unit 07 stands behind unit 06 and the
  numbers run round the floor as they do on a key plan. A floor with one unit
  has only the front row.
- **Sizes:** a unit bay is 9 m wide and 11 m deep. The corridor between the rows
  is 2.4 m. With 12 units a floor the plate is 54 m by 24.4 m. Floor to floor is
  3.15 m, so 26 residential floors stand 81.9 m above the podium.
- **Articulation:** on each row with three or more units, the two end units
  project 1.2 m, which gives the shallow H the consult recommends. Stacks stay
  vertically aligned.
- **Facade:** each unit's outward faces are one coloured panel in its state's
  tone, recessed 0.4 m behind a white frame. The frame is a continuous slab edge
  at every floor (0.3 m thick, 0.3 m proud) and a thin vertical fin between
  bays, so the panel fills about 70% of its bay. Each unit has a 1.5 m balcony
  slab across 70% of its frontage. End units show a panel on their end face as
  well, and every face of a unit selects the same unit.
- **Core:** a white lift and stair core in the middle of the corridor, rising 6
  m above the roof as the lift overrun.
- **Roof:** a 1.2 m parapet round the plate, two water tank boxes on the core,
  and a restrained crown: a white frame one floor tall over the core.
- **Floors 1 and 2:** not residential. They are the podium.
- **Arrangement:** the blocks stand in a row facing the front of the site, 30 m
  apart, with the middle block set back 12 m so the row reads as a gentle arc.
  With one or two blocks the row simply has fewer towers.

## The Site

- **Plinth:** a rectangular timber base, 2 m thick at model scale, with a darker
  edge band. The project name plate ("Aster Heights" from Settings) and a north
  arrow sit on its front edge as DOM labels.
- **Roads:** a main road along the front edge and a side road along the right
  edge, meeting at a junction, in warm grey with white dashed lane markings.
- **Arrival:** an entrance off the main road with a 4 by 6 m guardhouse between
  an entry and an exit barrier lane. A driveway leads to an 8 by 15 m drop-off
  canopy at the podium front, with a 3 by 8 m water feature beside it and palms
  either side. A ramp climbs the podium's right side to the car park.
- **Podium:** one block spanning all towers and the deck, 8 m tall (two levels),
  with horizontal ventilation bands on its faces and a planted edge along the
  top.
- **Facility deck**, on the podium roof in front of the towers:
  1.  A 25 by 8 m lap pool on the long axis, with a 4 m pool terrace round it.
  1.  A 6 by 6 m children's pool beside it.
  1.  A 15 by 20 m lawn between towers.
  1.  A 10 by 12 m playground, away from the water.
  1.  Two 4 by 5 m BBQ pavilions on the deck edge.
  1.  A 12 by 15 m glass gym overlooking the pool.
  1.  A 12 by 18 m multipurpose hall beside the middle block.
  1.  A 2 m jogging loop round the deck perimeter.
  1.  A covered walkway linking the tower lobbies.
  1.  Planter beds along the paths and deck edges.
- **Trees:** low-poly shade trees (4 to 7 m canopy) along the site boundary and
  in deck planters, and palms at the arrival, at true scale. Oversized trees are
  what make a model look cheap.
- **Context:** a few low white neighbour blocks across the main road and on the
  left, with no detail, so the site sits in a place without competing with it.
- **Facility labels:** small muted DOM labels on the deck and arrival (Lap Pool,
  Children's Pool, Lawn, Playground, Gym, Hall, Guardhouse, Drop-Off), shown in
  the All framing only.

## The Look

- **Palette:** new model tokens in `globals.css`, each with a light and a dark
  value: plinth timber, ground stone, road, lane marking, lawn sage, foliage
  grey-green, water pale grey-blue, structure white, glass for available units,
  and neighbour grey. Status colours stay the most saturated thing in the scene;
  the landscape is muted so a lit unit is never out-shouted.
- **Available units:** a pale cool glass tint, so the towers read as white frame
  and glazing with the held units standing out in colour.
- **Light:** a hemisphere light and one directional sun from the upper left
  front, with one soft shadow map. No tinted light, no reflections, no bloom.
  Tone mapping stays off, so a unit's lit face shows its token's own colour.
- **Camera:** perspective with a 30° field of view, starting at a three-quarter
  view from the front left, about 30° above the deck, like a visitor standing at
  the model.

## Interaction

- **Turning:** drag turns the model the whole way round. The camera stays
  between 15° and 75° above the deck. Panning stays off. Zoom needs Ctrl or ⌘
  with the wheel, or a trackpad pinch, as today.
- **Presets:** All, then one button per block, then a Front and Back switch.
  Back starts the framing from behind the towers, where units 07 to 12 face.
  Every click reframes over `motion/base`, or at once under reduced motion. A
  data refresh never moves the camera.
- **Filters:** a lit unit keeps its colour. Every other unit and all tower
  structure turn to see-through glass at low opacity and stop taking clicks, so
  the lit units show and click from any side of the building. The landscape
  stays solid.
- **Hover:** an outline round the unit and the readout line, as today.
- **Selection:** the card ring inside the ink ring, as today, and the unit
  island.
- **Block labels:** a pill above each roof reading "Block A".
- **Floor labels:** every fifth floor and the top floor up the left end of the
  focused block, or of the leftmost block in the All framing.

## The Unit Island

The island replaces the side sheet on the Sales Chart. It gives the overview a
sales manager wants first, and the model stays live behind it.

- **Placement:** fixed at the bottom centre of the window, 16 px above the
  bottom edge, up to 560 px wide and full width less 32 px on a phone. It uses
  the glass treatment of the Bookings bulk-action island.
- **Behaviour:** not a modal. Nothing dims, focus stays where it was, the model
  still turns, and clicking another unit swaps the island to it. ✕ or Esc closes
  it and clears the selection. It rises over `motion/base` when it opens.
- **Content, for a unit on the viewer's desk:**
  1.  The unit code in Geist Mono, then Block, Floor and Unit in words.
  1.  The state's swatch and word, the booking's age ("17 Days Old") and
      "Stalled" when the stall rule flags it, as the case header reads.
  1.  The buyer's name and the booking ID.
  1.  The price in RM.
  1.  The loan and SPA position in one line, such as "Loan Approved By Crestline
      Bank · No SPA Appointment Yet".
  1.  The next step and the desk that owns it.
  1.  Open Case, which opens the floating case panel.
- **Content, for a unit held on another desk:** the code, the location, the
  state and "Held By Nurul Aina's Desk", with no Open Case.
- **Content, for an available unit:** the code, the location and "Available ·
  Not Booked".
- **Access:** a region named "Selected Unit". The readout line keeps announcing
  hover and selection, so the island adds no live region of its own.

## The Floating Case Panel

The case quick view keeps its content and changes its container, on every page
that opens it.

- **Container:** a floating card 16 px in from the bottom and side edges, up to
  720 px wide and centred, at most 85% of the window tall, scrolling inside.
  Radius `--radius-lg`, `--card` fill and the overlay elevation.
- **Motion:** it rises from below the window over `motion/slow` (250 ms) and
  sinks on close; under reduced motion it fades.
- **Behaviour:** a modal, as the side sheet was. The scrim dims the page. Esc, a
  scrim click or ✕ closes it, and on touch it can be dragged down to close.
- **Built on:** the `vaul` drawer already in the repo, with background scaling
  off.

## Architecture

- `frontend/src/components/sales-chart/towerModel.ts` (new, pure): from the
  units and the project settings, each unit's box (centre, size, outward faces)
  and every structure instance (slab edges, fins, balconies, core, parapet,
  tanks, crown), plus each tower's footprint. Replaces `buildingLayout.ts`.
- `frontend/src/components/sales-chart/siteModel.ts` (new, pure): from the tower
  footprints, the plinth, roads, podium, deck features, trees, neighbours and
  label anchors.
- `frontend/src/components/sales-chart/sceneColors.ts`: gains the model tokens.
- `frontend/src/components/sales-chart/SalesChartBuilding.tsx`: composes
  `Towers`, `Site` and `Units` from instanced meshes, the labels, the camera and
  the presets.
- `frontend/src/components/sales-chart/UnitIsland.tsx` (new) and
  `unitOverview.ts` (new, pure): the island and the facts it shows.
- `frontend/src/components/ui/floating-panel.tsx` (new): the floating bottom
  panel primitive on `vaul`.
- `frontend/src/components/bookings/CaseQuickView.tsx`: moves from the Sheet to
  the floating panel.
- `frontend/src/pages/SalesChartPage.tsx`: shows the island on selection; Open
  Case opens the panel.

**Budgets:** under 60 draw calls and 300k triangles for a 936-unit project; the
lazily loaded Building chunk stays under 300 kB gzip (258 kB today) and the main
chunk grows by under 5 kB. The scene still renders on demand, never in a loop.

## Design System Amendments

`docs/DESIGN.md` changes with the work that needs it:

- **Building View:** rewritten for the model. Its "no shadow or transparency"
  rule becomes one soft sun shadow, and transparency only for filtered-out units
  and structure. The model tokens are listed. It stays the one 3D surface.
- **Look decision:** the glass treatment covers the two islands, bulk action and
  unit, instead of the one.
- **Unit Island:** a new component entry.
- **Floating Panel:** a new component entry; the Sheet entries that describe the
  case quick view point to it.

## Testing

- **Pure geometry** (Vitest): every unit gets one box and no two overlap; the
  numbers run left to right along the front and back along the rear; stacks
  align across floors; any units-per-floor from 1 to 60 and any block count lay
  out; end units project; the core sits inside the plate.
- **Site:** deck features sit inside the deck and clear of every tower
  footprint; trees sit on the plinth; the roads meet at the plinth edges.
- **Island and panel** (Testing Library): selecting a unit shows the island with
  the right facts for each of the three cases; clicking another unit swaps it;
  Esc closes it; Open Case opens the panel; the panel closes on Esc.
- **Pages:** the Bookings and Today tests that open the quick view still pass on
  the new container.
- **Browser:** screenshots of the All, Block and Back framings, a filter, the
  island and the panel, in light and dark and at phone width; a check of the
  draw calls and chunk sizes.

## Out Of Scope

- Floor plans, floor cutaways and the reel's walk-through inside a unit.
- Cars and people on the model.
- A real Chin Hin site plan or elevations; the model stays the fictional Aster
  Heights.

## Acceptance

1.  The Building view shows three towers with real floor plates, slab edges,
    balconies, cores and roofs, standing on a podium with a landscaped deck, on
    a plinth with roads, an arrival and trees.
1.  Every unit is one clickable box with its state's colour, and every unit can
    be reached by turning the model or with Front and Back.
1.  With the Loan Approved, No SPA Appointment filter on, its lit units show and
    can be clicked from both Front and Back.
1.  Clicking a unit raises the island with the overview above; clicking another
    unit swaps it; Esc closes it.
1.  Open Case opens the floating case panel, and recording an update there
    changes the unit's colour without a reload.
1.  Bookings and Today open the same floating case panel instead of the side
    sheet.
1.  Light, dark and phone widths all read well, and the budgets above hold.

## Delivery

Three pull requests, each merged when CI is green and its review is clean:

1.  **The panel and the island:** `floating-panel.tsx`, `CaseQuickView` on it,
    the unit island and its overview, the page wiring and the DESIGN.md entries.
1.  **The towers:** `towerModel.ts`, the facade, core and roof, the perspective
    camera, light and shadow, the presets with Front and Back, and the
    see-through filter.
1.  **The site:** `siteModel.ts`, the plinth, roads, arrival, podium, deck,
    trees, neighbours and labels, the Building View rewrite in DESIGN.md, and a
    fresh slide 7 screenshot for the deck.
