# Mortar Notes For Agents

Working notes for coding agents. `package.json` `scripts` is the command
reference; `docs/README.md` is the human quickstart. This file holds what
neither shows: conventions, the file map, and the gotchas.

## Conventions

- Formatting comes from the repo root `.prettierrc.json` (no semicolons, single
  quotes, 120 columns). Run `bun run format` before finishing.
- `bun run check` (ESLint, `tsc`, Vitest across workspaces) must pass before any
  task is called done. There is no e2e suite.
- Bun workspaces: `frontend` plus `packages/*`. Run a workspace script with
  `bun run --filter <name-or-glob> <script>` from the root (e.g.
  `bun run --filter frontend dev`).
- Tests sit next to the code under `src/**/__tests__/` (or `*.test.ts(x)`
  siblings). Frontend tests run in jsdom via the `test` block in
  `frontend/vite.config.ts`.
- New UI primitives come from `bunx shadcn add <component>` run inside
  `frontend/` (config: `frontend/components.json`), not hand-written.
- Import shared types from `@mortar/core` (`packages/core`), which resolves
  straight to `src/index.ts` — no build step.

## File Map

The guided walkthrough lives in `frontend/src/tour/`, mounted by `AppLayout`.
Keep `tourSteps.ts` selectors aligned with the pages' `data-tour` anchors and
their tests. Its keyboard controls must leave inputs and dialogs usable.

Demo data actions live in `server/db/reset.ts`: startup applies the schema
without seeding. Add/Delete Demo Data use `demo_seed` provenance; deletion
removes every demo booking with the rows attached to it, the demo playbooks and
the demo `meta` keys, and touches nothing a visitor created. Test these paths
only with `TEST_DATABASE_URL` pointing at a disposable database. Recording
requires an explicit disposable `DEMO_WEB`; demo deletion no longer restores a
clean recording seed.

| Area           | Files                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App shell      | `frontend/src/App.tsx` (routes), `frontend/src/main.tsx` (providers), `frontend/src/components/layout/` (sidebar, nav, `PersonaRoute.tsx` (guard), `AppFooter`, `PublicShell` (footer layout route for `/` and `/faq`), `AppShell`, `PageContainer`, `PageHeaderCard`, `AppErrorBoundary`, `ThemeToggle`, `PersonaSwitch`)                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Assistant      | `server/src/assistant/` (`index.ts`, `gemini.ts`, `guardrails.ts`, `prompt.ts`, `tools.ts`, `live-check.ts` — `POST /api/assistant`), `packages/core/src/brain/` (`askBrain`, `buildAskContext`, scripted fallback), `frontend/src/components/brain/` (`AskTrigger` in `AppNav`, `AskPanel` in a Dialog), `frontend/public/ai-mascot*.png`                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Import         | `packages/core/src/import.ts` (`parseCsv`, `readBookingSheet`, `checkBookingDraft`), `frontend/src/components/import/` (`DropZone`, `readSheetFile`, `SheetReview`), `frontend/src/pages/ImportPage.tsx`, `POST /api/bookings/import` in `server/src/app.ts`, `frontend/public/booking-sheet-template.xlsx` (written by `frontend/scripts/booking-template.mjs`) and `.csv`                                                                                                                                                                                                                                                                                                                                                                                                            |
| Units          | `packages/core/src/units.ts` (`numberLabel`, `parseUnitCode`, `projectUnits`, `uniqueUnits`, `releaseReview`, `heldUnits`, `chartUnits`: the project layout and each unit's Sales Chart state), `scopeSnapshot` in `packages/core/src/profiles.ts` (adds `snapshot.units`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Sales Chart    | `frontend/src/pages/SalesChartPage.tsx` (route `/sales-chart`, figures, filters, Booking Owner picker (`?soldBy=`), legend, readout), `frontend/src/components/sales-chart/` (`SalesChartGrid.tsx` (the grid), `salesChart.ts` (state labels, filters, counts), `unitTone.tsx` (cell fills and marks), `UnitIsland.tsx` (the selected unit's floating overview), `unitOverview.ts` (the island's facts)), `frontend/src/components/bookings/quickViewRow.ts` (the case panel's row for a unit's booking), `SalesChartBuilding.tsx` (3D view, lazy chunk), `ExpandableViewport.tsx` (the 3D view's zoom and expand controls, and its expanded modal), `towerModel.ts` (the towers in metres), `siteModel.ts` (the plinth, roads, arrival, deck and trees), `sceneColors.ts`, `webgl.ts` |
| Waiting On     | `packages/core/src/ball.ts` (`ballInCourt`: who holds a case and the next move), `frontend/src/components/case/nextStep.ts` (rule-based move default, Jev alternative, `stepToTask`), `frontend/src/components/case/ball.ts` (labels, icons, move owners), `frontend/src/components/bookings/WaitingOn.tsx` (cell, journey, panel), `CaseQuickView.tsx` (case panel from Today and Bookings)                                                                                                                                                                                                                                                                                                                                                                                           |
| Record Update  | `frontend/src/components/bookings/RecordUpdateForm.tsx` (case-page hand entry of booking events, grouped by track, with date, note, and bank/document where relevant; posts `POST /api/applications` for a bank submission, `POST /api/events` for everything else)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Case Page      | `frontend/src/pages/BookingDetailPage.tsx` (header with the two actions, the summary card with the journey, `CaseViews` tabs with `?view=` and `&track=`, `CaseActionSheet` for record, message and guidance), `frontend/src/components/bookings/` (`bookingJourney.ts`, the journey view model from confirmed evidence; `BookingJourney.tsx` and `journey/` for drawings, road geometry, details copy and CSS; `CaseHistory.tsx`, `CaseDetails.tsx`, `LatestMessage.tsx`)                                                                                                                                                                                                                                                                                                             |
| Date Picker    | `frontend/src/components/bookings/DateField.tsx` (the shared Mortar date field: trigger plus a Calendar in a Popover, `YYYY-MM-DD` strings, `min`/`max` bounds, a `today` marker separate from the wall clock; used by `RecordUpdateForm.tsx` and `AddMessageForm.tsx`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Closed Export  | `frontend/src/components/bookings/closedExport.ts` (`buildClosedExportRows`, pure and DOM/network-free; `downloadClosedExport` lazy-loads `write-excel-file/browser` so the writer stays out of every other page's bundle; never includes IC or phone)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Jev Proxy      | `packages/jev/src/proxyClient.ts` (`createProxySystemOne`: adapts a local Anthropic-Messages-compatible proxy such as CLIProxyAPI to the `systemOne` surface `createJevService` expects, so Jev runs without a TypeSafe key; wired in `server/src/index.ts` when `TYPESAFE_API_KEY` is unset and `JEV_PROXY_URL` is set)                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Persona        | `frontend/src/lib/persona.tsx` (context, `PERSONAS`, `PERSONA_PAGES`, `canPersonaOpen`, `mortar.persona` localStorage key, the retired-id migration), `frontend/src/components/layout/PersonaRoute.tsx` (route guard), `packages/core/src/types.ts` (`Persona` type)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Pages          | `frontend/src/pages/` — one file per route (`LandingPage` with `components/HeroFilm`, `SignInPage`, `BookingsPage`, `BookingDetailPage`, `ChasePage`, `LegalPage`, `ForecastPage`, `ImportPage`, `NotFoundPage`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| UI primitives  | `frontend/src/components/ui/` (shadcn: button, calendar, card, checkbox, dialog, drawer, sheet, DropdownMenu, input, label, popover, radio-group, select, separator, skeleton, table, tabs, tooltip + status-pill, EmptyState, InfoTooltip, LoadingOverlay, NotificationPopover, toastConfig, `RefreshErrorBanner` (non-blocking, with Try Again, shown on a `useSnapshot` page that has both data and a refresh error), `SortHeader` (shared sortable column header))                                                                                                                                                                                                                                                                                                                 |
| Charts         | `frontend/src/components/charts/ChartTooltipContent.tsx` (recharts tooltip shell), `frontend/src/lib/formatters.ts` (MYR/number Intl formatters)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Hooks / stores | `frontend/src/hooks/useTheme.tsx`, `frontend/src/lib/notificationStore.ts`, `frontend/src/lib/utils.ts` (`cn`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Theme          | `frontend/src/globals.css` (Tailwind 4 `@theme` tokens from `docs/DESIGN.md`, light/dark, global scrollbar), `frontend/public/media/` (hero clip), `frontend/index.html` (fonts, FOUC theme script)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Tests          | `frontend/src/lib/__tests__/`, `frontend/src/pages/__tests__/`, `frontend/src/components/layout/__tests__/`, `packages/core/src/index.test.ts`, `packages/core/src/sim/order.test.ts` (same-day event ordering), `packages/core/src/sim/stage.test.ts` (SPA-gated stage progression), `packages/core/src/banks.test.ts` (withdrawal reversal, document ledger, bank clocks), `server/db/__tests__/integration.test.ts` (`TEST_DATABASE_URL` suite)                                                                                                                                                                                                                                                                                                                                     |
| Tooling        | root `package.json`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc.json`, `.husky/pre-commit`, `frontend/vite.config.ts` (dev server + Vitest), `frontend/tsconfig.json`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| CI             | `.github/workflows/ci.yml`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

## Recipe: Add A Route

1. Create `frontend/src/pages/<Name>Page.tsx` (heading + one-line description
   inside `PageHeaderCard`, `EmptyState` below — copy `ChasePage.tsx`).
2. Add the `<Route>` inside `<Route element={<AppShell />}>` in `App.tsx`.
3. If it is a top-level nav item, add it to `NAV_ITEMS` in `AppSidebar.tsx` and
   `ROUTE_LABELS` in `AppNav.tsx` (breadcrumbs). If it also belongs in the
   footer's Product column, add it to `LINK_COLUMNS` in `AppFooter.tsx`.

## Recipe: Add Shared Domain Types Or Logic

1. Export from `packages/core/src/index.ts`; the frontend imports it as
   `@mortar/core` — no build step, no path mapping needed.
2. Cover it with a `*.test.ts` next to the code; `bun run test` picks it up.

## Gotchas

- **The Building view needs WebGL, which jsdom lacks.** Tests mock
  `@/components/sales-chart/SalesChartBuilding` and `webgl.ts`; check the scene
  in a real browser. It renders on demand: after changing anything the scene
  draws from, call `invalidate()`.

- **Forecast Rates Refresh Weekly; Booking State Stays Live (#79).** The server
  builds a case-free aggregate from the full resolved booking history before
  profile scoping. Counts and refresh dates travel with the scoped snapshot;
  other profiles' case records do not. The aggregate is persisted in `meta`
  under `forecast_model_v1` and refreshed on the next read after seven days of
  wall-clock time. Demo-data changes invalidate it. Forecast, the Manager's
  Today and both assistant paths use those rates against the selected profile's
  current authorized bookings and confirmed events. Missing history is
  unavailable, rather than a supported zero; a measured zero remains valid.
  Historical backtests train only on evidence available at their cutoff.
- **Booking Imports Require Sales Admin Or Manager (#80).** The import API
  checks the signed session's profile before processing or writing a batch. Loan
  and Legal Admin receive 403 even when a request body claims another role;
  hiding the Add Bookings page is not the authorization boundary.
- **Task Status Changes Require The Named Assignee Or Manager (#81).**
  `canManageTaskStatus` requires the exact owner name and matching department,
  with a Manager override. The task's booking must still be accessible.
  Completion, cancellation and reopening use the same server check. Today and
  the case task panel show completion controls only to permitted profiles.

- **`/` Is The Landing; `/app` Is Persona-Relative.** `/app` sends the active
  persona to their home. `/`, `/faq` and `/sign-in` sit outside `AppShell`.
  `PublicShell` wraps `/` and `/faq` only, and it is the one thing that mounts
  the footer — the desks, `/app`, the 404 and `/sign-in` carry none.
- **The Sidebar Puts The Persona's Home First.** `AppSidebar` hoists the active
  persona's home route above `NAV_ITEMS`' canonical order; keep new routes in
  canonical order in `NAV_ITEMS`.
- **Forecast Reports Read One Calculation.** `forecastInsights()` in
  `packages/core/src/sim/insights.ts` supplies the page and both assistant
  paths. Current rows use only authorized bookings and confirmed events whose
  occurrence and recording dates are known by the report date. Historical rates
  may use the case-free project aggregate. The estimate ends at each booking's
  day 30; its range is an exact independent-outcome count range, not a
  confidence interval. Operational queues retain older open cases. Second-bank
  outcomes require a confirmed distinct-bank submission after rejection, never
  just an application row. Their observed sample is not a promise of recoverable
  sales.
- **`open` Is Not `live`.** `deriveCase` computes both. `live` adds
  `ageDays < HORIZON_DAYS` (30) and is what the forecast counts; `open` is just
  unsigned and not exited. Stall reasons derive from `open`, because gating them
  on `live` hid every case that had sat longest — the ones most worth chasing.
  Anything that reads `stallReasons` must filter on `open` (`isOpen` in
  `brain/helpers.ts`), never `isLive`; `brain.test.ts` pins Ask's stalled set to
  Today's so the two cannot drift apart again.
- **MortarAI Is The AI Layer: Jev Classifies, Gemini Answers.** MortarAI names
  both engines together. Jev (`packages/jev/`) turns messages into typed
  proposals, next actions and playbook ranks; Gemini (`server/src/assistant/`)
  answers staff questions in Ask MortarAI, the sparkle-button panel. Ask
  MortarAI is the Gemini engine's surface. Say MortarAI for the layer, and name
  the engine where behaviour differs: Jev proposes within 3 seconds and waits
  for a person to confirm; Gemini reads with a 30-second budget and never
  writes. Product wording lives in
  [Where AI Helps](../PRODUCT.md#where-ai-helps-and-where-people-decide).
- **Ask MortarAI Calls Gemini With Five Read-Only Tools.**
  `server/src/assistant/` handles `POST /api/assistant` using `fetch` against
  Google's Gemini API (`GEMINI_API_KEY`; model `GEMINI_MODEL`, default
  `gemini-3.5-flash-lite`). Five read-only tools query the live snapshot
  (`find_bookings`, `get_case`, `get_my_queue`, `get_forecast_summary`,
  `search_playbooks`) under a 30-second budget (max 4 rounds). Messages reach
  the model fenced as untrusted data. When `GEMINI_API_KEY` is unset or an API
  call fails, the route returns 503 `{ fallback: true }` and `AskPanel` falls
  back to the scripted `askBrain` answers in `packages/core/src/brain/`. The
  key, images, and message bodies are never logged. Data caveat: Gemini's free
  tier may use prompts to train products; Ask MortarAI is strictly for simulated
  data, while real buyer data requires a paid tier or Vertex AI under a PDPA
  agreement.
- **Persona Pages Drive The Sidebar And Route Guard.**
  `frontend/src/lib/persona.tsx` (`PERSONA_PAGES`) maps the exact pages visible
  to each persona and their groups (Primary, More).
  `frontend/src/components/layout/PersonaRoute.tsx` guards these routes; an
  unauthorized visit redirects to the persona's home with a warning toast. The
  case page (`/bookings/:id`), `/app`, `/faq`, and public pages are never
  guarded. Switching persona in the top bar redirects to the new persona's home.
- **Named Profiles Define Data Access.** The synthetic demo offers named sales
  staff, shared loan/legal desks, and Manager. A server session determines
  access: sales gets only its owned bookings and linked records; departmental
  desks see current assignments or exact-name/role open tasks, with no
  historical entitlement after assignment ends; Manager covers every department.
  Direct case APIs, writes, Ask MortarAI tools, forecasts and scripted fallback
  use the same boundary. The profile id header must match the session,
  preventing a second browser tab's role switch from widening the first tab's
  response. The public demo selector is not production credential
  authentication.
- **Profile Switches Clear The Workspace.** `ProfileWorkspace` keys the snapshot
  provider and routed app by profile id. Ask MortarAI cancels pending streams on
  unmount and its panel is also keyed by profile. Notifications have a separate
  browser storage namespace per profile.
- **Manager Workflows.** The Manager's home is Today (`/chase`), the same page
  every other persona gets. Its queue is "Decisions For You": the overdue cases
  not yet followed up, drawn as Today worklist rows with an "Overdue N Days"
  pill, the blocker, and Request Follow-Up; the unit opens the case panel. No
  percentages and no Jev scores appear anywhere. Overdue means at or beyond 150%
  of the expected duration, using the existing stall-wait assumptions, with
  working days for bank decisions; a missed SPA appointment counts from its own
  date against a one-working-day grace (`SPA_MISSED_AFTER_WORK_DAYS`). The
  figures strip carries Overdue Cases, Stalled Booking Value and the Busiest
  Desk; Follow-Ups You Sent is its own view, where a closed follow-up reads
  Closed, No Update Yet, never Answered, until a confirmed update recorded after
  the Manager sent it (`managerQueue.ts`), so one recorded just before the
  close-out counts. Money beside a name is always Stalled Booking Value with its
  definition one hover away (`STALLED_VALUE_DEFINITION` in `TodayRail.tsx`).
  `/team` replaces `/manager` (which redirects), with four figures and a desks
  table, one row per staff profile, whose row opens Bookings filtered to the
  bookings waiting on that person. "Follow-Up Owner" uses the same
  responsibility rule the server uses for follow-ups. Flagged department tasks
  persist and appear in the recipient's notification bell, refreshed every 30
  seconds while visible. The server resolves recipients using
  `currentCaseAssignee` and revalidates before sending; manager flags reuse
  equivalent ordinary open tasks. Today opens on a figures strip and named views
  (Actions, Your Tasks, Recent Bookings), with rows built from
  `components/chase/worklist.tsx`. Recent Bookings uses `Booking.createdAt`,
  never `bookingDate`.
- **Forecast Documents Follow The Figures.** `ForecastDocuments` owns selection,
  shuffle motion, the reading dialog and its focus return. Covers and details
  read the same calculated findings. The five report definitions and their
  presentation rules live in [Design](../DESIGN.md#forecast-document-stack);
  alternate-data runs and placeholder assumptions are not business reports.
- **Shared Settings And Inventory.** Project settings live on the server and
  only Manager can change them. `blocks` supports multiple blocks while old
  `blockPrefix` records remain readable. The inventory API exposes held
  project/unit pairs across all owners without buyer names or booking ids.
  Upload A Sheet opens first; direct entry is the Demo Entry tab, because it
  fills in made-up buyer finances. All nonempty forms must be valid before
  submission. Both manual and sheet imports retain atomic duplicate-unit
  protection. Unit codes follow the settings' `numbering`. Add Bookings, sheet
  imports and `POST /api/bookings/import` pass units through `layoutUnit`: a
  unit in the layout is written its way (`a-12-3` becomes `A-12-03`, so
  held-unit checks compare like with like), and a label the numbering would not
  write is refused with the unit it may mean (`A-24-02` under skip-four: "Did
  You Mean A-23A-02?"). Demo units come from `DEFAULT_PROJECT_SETTINGS`, and Add
  Demo Data rewrites the stored settings to that layout, so a visitor's own
  settings return after a demo reset only if they save them again.
- **One Next Step Per Case (`nextStep.ts`).**
  `frontend/src/components/case/nextStep.ts` makes the rule-based move from
  `ballInCourt` the default everywhere (Today, Bookings table, and
  `CaseQuickView` case panel). When Jev's cached suggestion differs, an extra
  line displays "Jev Suggests: <Step> Instead". Create Task and Add Task buttons
  always raise the step the person selected, avoiding duplicate tasks across
  staff.
- **Some Stalls Cannot Wait A Week (#75).** A confirmed buyer concern, a
  rejection that leaves no bank deciding and a valuation shortfall stall the day
  they are confirmed (`buyerConcern` and `valuationShortfall` on `CaseSummary`);
  a missed SPA appointment stalls from the next working day, counted from the
  appointment's own date. `ballInCourt` makes the concern a Call The Buyer and
  the other two a `review_financing` step, and `currentCaseAssignee` gives those
  moves to the booking's Sales Admin and Loan Admin whoever holds the case.
  Access follows the assignee, so `canAccessBooking` also checks who would hold
  the case without the concern or shortfall: the Loan or Legal Admin doing the
  bank or solicitor work keeps it meanwhile. A later Buyer Contacted, withdrawal
  or SPA appointment answers a concern; a submission, any approval or that
  bank's own rejection settles a shortfall. A receipt not for one bank clears no
  bank's request while two or more banks are deciding at its time
  (`documentLedger`); with fewer it clears the matching bank requests, as
  receipts saved before #75 expect. With two banks deciding, a receipt must name
  one, and once none is deciding the form and Mortar AI put it on the approving
  bank.
- **Closing A Task Records What Happened.** `PATCH /api/tasks/:id` takes
  `result` and `followUpOn` with `status: 'done'`; a `followUpOn` raises the
  same task again for that day, in the same transaction (`updateTaskStatus`'s
  `followUp`). A task closes out once (409 after), and a repeated plain `done`
  returns it unchanged. `TaskCloseOut` is the one form for Your Tasks and the
  case's Tasks view; `YourTasks.onComplete` resolves `true` once closed, so the
  form goes even if the refresh fails. Radix's radio group needs
  `ResizeObserver`, so a test that opens it stubs one, and the tour leaves arrow
  keys alone inside `[role="radiogroup"]`.
- **Playbooks Are Illustrative Until Validated.** `playbookValidated` (approved
  with a named reviewer) gates a playbook's action and limits in What To Do and
  in Ask MortarAI's `search_playbooks`. The seeded playbooks are drafts.
- **Forecast's Cohort And Accuracy Need The Dataset.** `ForecastReports` takes
  the page's `dataset` for Cohort Result (`cohortResult`) and the accuracy check
  (`backtest` at the report date minus 30 days); without it, both stay hidden.
  Its `reach` (`HistoryReach`, set from the persona in `ForecastPage`) hides
  both on Loan and Legal views, whose scope drops a booking as it signs, and
  labels a Sales Admin's as their own bookings.
- **Database Integration Tests Require `TEST_DATABASE_URL`.**
  `server/db/__tests__/integration.test.ts` reads
  `process.env.TEST_DATABASE_URL` and skips entirely when unset; it never reads
  `DATABASE_URL` (which often points at production). An empty test database is
  seeded once on first boot. NEVER point `TEST_DATABASE_URL` at production. The
  team test database is the separate Neon project `mortar-test`; CI runs the
  suite against its own Postgres container instead.
- **The Snapshot Is Cached; Raw SQL Writers Must Forget It.** `createDatabase`
  shares one built snapshot until a write, and treats every `Database` method
  not listed in `SNAPSHOT_READS` (`server/db/index.ts`) as a write that drops
  it. A new read method belongs on that list, or it drops the cache needlessly.
  Code that writes with its own SQL, as Add and Delete Demo Data do, must call
  `db.forgetSnapshot()` afterwards, or its change stays hidden for up to 10
  seconds.
- **Keyword Score Alone Does Not Gate A Question.** "What is the weather"
  out-scores a correct paraphrase, so `matchQuestion` ranks on how much of the
  query was covered and treats the score as a floor. Widen `tags` rather than
  lowering `MIN_COVERAGE`.
- **Imported Bookings Are Born `booked`, Dated To The Desks' Today.** The import
  writes each booking with one confirmed `booked` event recorded at
  `simNow(REFERENCE_DATE)`, so a sheet row dated after the reference date is
  refused (the case could not exist yet). Ids continue `BK-nnnn` after the
  generator's run and stop before the stories' `BK-9001`.
- **Focus The Sheet, Not Its First Control.** A Radix dialog or sheet focuses
  its first tabbable element on open; in the quick view that was the risk chip,
  which popped its tooltip unasked (and ran for tens of seconds under jsdom).
  `CaseQuickView` focuses the sheet itself in `onOpenAutoFocus`.
- **localStorage Access Is Always Wrapped In try/catch** (`persona.tsx`,
  `notificationStore.ts`) because private-mode browsers can throw.
- **Radix Popover Stalls jsdom.** Radix positions popover content with
  floating-ui, whose measuring stalls jsdom's event loop for many seconds on
  every open — a bare popover holding one button held a `setTimeout(0)` back 14
  to 24s (3s even with collision handling off). Tests that render a date field
  mock `@/components/ui/popover` with
  `vi.mock('@/components/ui/popover', () => import('.../inlinePopover'))`,
  pointing at `frontend/src/components/bookings/__tests__/inlinePopover.tsx`,
  which keeps open, close, and show-content behaviour and drops the positioning;
  the `Calendar` inside stays real.
- **`grid-cols-1` Is Required On Every Responsive Grid.** A bare
  `grid ... sm:grid-cols-N` container has no base column count, so its one
  implicit column sizes to its widest child's `max-content` and the page scrolls
  sideways on a phone. Always pair a responsive `grid` with an explicit
  `grid-cols-1` base.
- **Radix Popovers Need `z-[80]` To Clear A Dialog.** `DialogContent` sits at
  `z-[71]`; a `Popover`, `Select` or `DropdownMenu` that can open while a dialog
  is open (a date field or select inside `AddBookingDialog`, say) must sit at
  `z-[80]` or it renders underneath the dialog instead of above it.
- **`mock.module` Leaks Across The Rest Of A Bun Test Process.** Bun's
  `mock.module` rewrites a module namespace's bindings in place for the whole
  process, not just the file that called it; `server/src/__tests__/app.test.ts`
  mocking `@mortar/core` this way then bled into every other server test file
  that ran after it in the same process. `server`'s `test` script now runs `src`
  and `db` as two separate `bun test` invocations
  (`bun test src && bun test db`) so the mock never reaches the DB test process;
  do not merge them back into one `bun test` call.
- **`JEV_PROXY_MODEL` Falls Back On `||`, Not `??`.** `.env.example` ships the
  variable empty rather than commented out, and an empty string is falsy, so
  `server/src/index.ts` reads it with
  `process.env.JEV_PROXY_MODEL || DEFAULT_JEV_PROXY_MODEL` — `??` would let the
  empty string through and send it to the proxy as the model name.
- **`bun run --filter '*' <script>` Is How Root Scripts Fan Out** to workspaces;
  add the script name to a new package's `package.json` to join `check`.

## Docs

- `docs/PRODUCT.md`: product context, problem, personas, business case, and
  12-week pilot.
- `docs/PRD.md`: functional requirements, user stories, acceptance criteria, and
  screen specifications.
- `docs/TRD.md`: system architecture, data model, APIs, simulation engine, Jev
  integration, and deployment.
- `docs/DESIGN.md`: the visual spec — follow it for any UI work.
- `docs/markdown-style.md`: house Markdown style — follow it when editing docs.
- `docs/research/company-brain/simulation.md`: scope, seed values and rules for
  the front-end simulation — read it before generating synthetic bookings.
