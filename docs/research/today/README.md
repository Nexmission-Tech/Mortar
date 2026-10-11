# Today: One Worklist, One Next Step

**Recommendation:** Replace the two-column card wall and permanent rail with one
ordered worklist. Keep the two workload figures and a compact third figure above
it. Put Your Tasks and Recent Bookings in named views beside Actions, available
in one click on every screen size. Manager uses the same structure with
Decisions and Follow-Ups.

The worklist answers three questions in order: which booking, what blocks it,
and what to do next. Its default action and owner remain visible. Details expand
in place; a unit opens the existing centred case panel.

[Open The Mockup](mockup.html). Use `?theme=dark`, `?persona=manager`, or both.
The profile control switches the two preview personas; the moon switches theme.
These are review controls, not a proposed change to the live profile menu.

## 1. What Is Overloading Today

The following observations refer to the supplied **Sales Admin Desktop**,
**Manager Desktop**, **Loan Admin Desktop**, and **Sales Admin Phone** captures.
Positions are approximate source-image coordinates, not measurements of a live
session. The interpretation is a design diagnosis; no user testing has yet
established the five-second outcome.

| Rank | Screenshot Evidence                                                                                                                                                                                                               | Cost To The Reader                                                                                                                                                                     | Redesign Decision                                                                                                                                                                                                                                                  |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | All three desktop captures show eight similarly weighted cards in two columns. Each starts a new visual scan: unit, buyer, blocker, metadata, action and footer. Sales pairs A-23A-02 with A-05-11; the next pair restarts below. | The reader chooses between neighbouring cards before understanding the queue. Black buttons, bold blockers and small labels repeat across both sightlines.                             | One raised worklist, one row per booking, one top-to-bottom order. Three aligned desktop columns: Booking, Blocker, Next Step. All rows offer the same outline action.                                                                                             |
| 2    | On Sales Admin Phone, figures, both task rows, Recent Bookings and two stacked filters precede A-23A-02. The first booking begins roughly 700px down the capture.                                                                 | A page for deciding the next move first asks the person to process other lists. The phone inherits the rail's priority rather than the queue's purpose.                                | Identical named views at every size. Default to Actions. Keep the due-task shortcut in the third figure; show the first booking immediately after the compact figures and filters.                                                                                 |
| 3    | Sales C-03-09 says Overdue 57 d, No Update For 57 Days, SPA Set 57 Days Ago, Still Unsigned, and Last Update 57 days Ago. Manager shows the same case as Overdue 50 d.                                                            | Several clocks appear to describe the same deadline. Long blocker paragraphs dominate action labels. The two personas' overdue numbers appear contradictory without their definitions. | Lead with the specific blocker when there is one; preserve every original reason under Details. Keep the existing overdue calculation per persona and explain it explicitly. Metadata becomes a four-field definition list, one click away.                        |
| 4    | Sales shows 21 stalled but eight cards plus Show 12 More: 20 recommendations. Loan shows 19 needing a move, but 18 recommendations; its RM 11.0m figure uses all accessible stalled cases.                                        | The reader cannot tell whether a filter lost a case. Stalled cases, recommendations, tasks and monetary scope have different denominators.                                             | Name the actionable count beside the worklist. Show the covered-by-task count. Keep Matching These Filters under the count and All Accessible Bookings under the money. Manager's scopes explicitly say Across All Desks.                                          |
| 5    | Loan A-05-11 presents Call The Banker, Mortar AI Suggests: Call The Buyer, Use This Action, a refresh glyph and Create Task. The person must also scan tasks and recent bookings beside it.                                       | Recommendation choice and execution mix together. Repeated uppercase microheadings and card boundaries add scanning work without adding meaning.                                       | Put the default step, owner and Create Task together. Keep a differing Mortar AI alternative on one muted line, with its direct Use This Action button. Use Title Case 12/16 column labels and 16/24 section titles. Remove the rail and per-booking card shadows. |

**What Already Works:** Preserve the flat ledger palette, unit links, familiar
Create Task action, plain-language blockers, role labels, two figures and
rule-based next step. Keep existing access rules and the distinction between a
recommendation, an assigned task and a manager follow-up.

**Source Conflicts Resolved:** The running implementation shows eight initial
cards and Mine selected for Sales Admin. The written requirements still mention
nine cards and Everyone for Sales. This proposal keeps **Mine** and replaces the
card preview limit with an ordinary scrolling list. It does not restore obsolete
Snooze or Log Follow-Up actions described in the older card guidance. The
requested handoff is the authority for this consultation's scope.

## 2. The First Five Seconds

Each table describes the opening state, before any filter or disclosure. The
first answer is a design target, not a measured research finding.

### Sales Admin

| Why They Open Today                                                          | First Answer                                                                                                                                            | Next Reach                                                                                                                   |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Nurul Aina coordinates the stalled bookings she can access across all desks. | 21 are stalled; 20 still need a task. A-23A-02 is Chen Jia Hao's BK-9006. It has no update for eight days. Book The SPA Signing belongs to Legal Admin. | Create Task beside that step, or the unit to inspect the case. The 1 Task Due Or Overdue shortcut opens Your Tasks directly. |

### Loan Admin

| Why They Open Today | First Answer | Next Reach | | Tan Mei Ling checks which
accessible bookings need a move from Loan Admin. Bookings remains her home
route. | Desk starts at Loan Admin. The supplied capture has 19 needing a move
and 18 recommendations. A-05-11 / BK-9003, Siti Nurhaliza binti Osman, needs
Call The Banker after eight days without an update. | Create Task, Use This
Action for the differing Call The Buyer suggestion, or Your Tasks for the two
due-or-overdue tasks. |

### Legal Admin

| Why They Open Today | First Answer | Next Reach | | Arvind Raj checks stalled
signing work across cases accessible to him. Legal remains his home route. |
Desk starts at Legal Admin. The first booking names the signing blocker and the
legal next step, with Legal Admin as owner. A-23A-02 demonstrates Book The SPA
Signing; it is not asserted to be first in an unseen legal capture. | Create
Task or the unit to record progress in the existing case panel. Your Tasks
starts on Mine. |

### Manager

| Why They Open Today | First Answer | Next Reach | | Robert Khoo intervenes
where a case is overdue and no standing follow-up covers it. | 10 overdue cases;
RM 17.1m held in stalled bookings across the accessible portfolio. C-03-09 /
BK-0024, Nur Aisyah, has an unsigned SPA and is 50 days beyond the relevant
expected wait. Arvind Raj is the recipient. | Request Follow-Up. The case then
appears under Follow-Ups You Sent. Open Team beside Busiest Desk goes directly
to Team. |

Do not imply that All Desks grants broader access. Filters run only within the
server-scoped data. Everyone means open tasks on accessible bookings, not every
task in the company. Completion still checks the active named profile.

## 3. Information Architecture

**Primary:** The active queue, booking identity, decisive blocker, next step,
owner role and direct action. Sales, Loan and Legal default to Actions. Manager
defaults to Decisions. No selected booking or enlarged first-row hero is needed.

**Secondary:** Two workload figures plus a compact third figure, Risk and Desk
controls, and named tabs. The third figure holds the admin due-task shortcut or
Manager Busiest Desk, with Open Team. On phones it spans both figure columns
inside the same strip. Your Tasks or Follow-Ups replaces the worklist when
selected. Manager's Follow-Ups tab carries the Awaiting Reply count.

**Tertiary:** Stage, booking age, last update, exact booking value, financing
risk and full blocker text in Details. Recent Bookings is its own named view.
Mortar AI's differing suggestion stays in the row because hiding its action
behind Details would add a second step to execution.

### Every Capability Has A Home

**Click Convention:** “0” means present in normal page flow; scrolling is not a
click. “1” means one direct control opens the complete content or starts the
action. Selecting an item inside a newly opened view is a subsequent action, not
another disclosure. The Action column distinguishes discovery from writes. No
view has an additional Show More gate. Do not virtualize this demo-sized list in
a way that breaks browser find, keyboard navigation or anchor focus.

| Current Capability                                                   | New Home                                                                   | Clicks From Default | Action And Preservation                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recommended-actions queue                                            | Actions, the default view                                                  | 0                   | Render all recommendations in existing stable priority order. No pagination or card expansion gate.                                                                                                                                                              |
| Unit, booking ID, full buyer name                                    | Booking column of every row                                                | 0                   | Mono unit/ID; buyer wraps without ellipsis.                                                                                                                                                                                                                      |
| Floating case panel                                                  | Every unit button                                                          | 1                   | Reuse the centred modal; preserve filter, selected view and scroll position on close. Includes Manager units.                                                                                                                                                    |
| Blocker                                                              | Blocker column                                                             | 0                   | Prefer a specific existing reason to the generic no-update reason. Never fabricate a shorter diagnosis.                                                                                                                                                          |
| Every full blocker reason                                            | Row's Details                                                              | 1                   | Full original strings, same order, no line clamp. No second disclosure.                                                                                                                                                                                          |
| Stage, booking age, last update, exact booking value                 | Row's Details                                                              | 1                   | All four fields open together. Exact RM value uses separators and no sen.                                                                                                                                                                                        |
| Financing risk and overdue status                                    | High Risk and existing overdue pill in the row; all risk levels in Details | 0 / 1               | Financing risk remains separate from elapsed wait. Neither uses a tinted row.                                                                                                                                                                                    |
| Next step and owner role                                             | Next Step column                                                           | 0                   | Same shared step derivation. Always name the owner role, including the reader's own desk.                                                                                                                                                                        |
| Mortar AI alternative                                                | Secondary line below the default action when it differs                    | 0                   | Preserve exact alternative action/document. The default never changes silently.                                                                                                                                                                                  |
| Use This Action                                                      | Beside the differing alternative                                           | 1 To Create         | Posts the alternative directly. Does not first select it and require Create Task again.                                                                                                                                                                          |
| Create Task                                                          | Beside the default step on every eligible row                              | 1 To Create         | Existing owner resolution, payload, same-day due rule and duplicate checks.                                                                                                                                                                                      |
| Ask Mortar AI Again                                                  | Visible 32px refresh control beside Create Task                            | 1 To Run            | Accessible name and interactive tooltip; not hover-revealed. Keeps default action and order during refresh.                                                                                                                                                      |
| Risk filter                                                          | Labelled Risk control above queue                                          | 1 To Open           | All Risk, Low Risk, Medium Risk, High Risk; selecting an option applies it. No enclosing Filters menu.                                                                                                                                                           |
| Desk filter                                                          | Labelled Desk control beside Risk                                          | 1 To Open           | Preserve existing role values, including legacy Sales for admins; display legal as Legal Admin. Manager keeps its three staffed desks.                                                                                                                           |
| Stalled Bookings / Need A Move From You                              | First figure                                                               | 0                   | Count filtered stalled cases before task deduplication. Caption states scope. Click clears Risk and Desk and returns to queue.                                                                                                                                   |
| Value At Risk                                                        | Second figure                                                              | 0                   | Existing accessible-portfolio sum, independent of queue filters; visible scope. Exact amount opens in one click and appears on hover/focus. Admin's explicit View All Stalled shortcut clears filters; Manager's Open Team shortcut retains the old destination. |
| Your Tasks                                                           | Your Tasks tab; third-figure due shortcut                                  | 1                   | Complete list, Mine by default. All titles, booking IDs, due states and manager flags retained.                                                                                                                                                                  |
| Mine / Everyone                                                      | Visible segmented control in Your Tasks                                    | 1 To Reach          | Changing scope is one further selection. No nested task menu.                                                                                                                                                                                                    |
| Complete task                                                        | Each permitted row in Your Tasks                                           | 1 To Reach          | Once the view is open, one click completes it. Ownership permissions unchanged; no completion control on another desk's task.                                                                                                                                    |
| Task title opens case                                                | Each task title in Your Tasks                                              | 1 To Reach          | Preserve the current full-case destination for task titles. Unit links elsewhere use the floating panel.                                                                                                                                                         |
| Due states and manager-flagged ordering                              | Every task row                                                             | 1                   | Manager-flagged first, then due date, then title. Overdue / Due Today / Due date. No misleading promise that due date alone determines order.                                                                                                                    |
| Recent Bookings                                                      | Recent Bookings tab                                                        | 1                   | All eight Sales demo rows immediately visible; no extra Show then Show More sequence. Based on creation time in the last seven days.                                                                                                                             |
| Manager Decisions For You                                            | Decisions, default Manager view                                            | 0                   | Existing overdue threshold, order and standing-follow-up exclusion.                                                                                                                                                                                              |
| Manager Request Follow-Up                                            | 32px outline action on every eligible decision                             | 1 To Send           | Existing recipient, manager flag and task reuse. No extra confirmation step.                                                                                                                                                                                     |
| Manager Open Case                                                    | Unit button in each decision                                               | 1                   | Replaces the redundant footer link with the required shared floating case panel; its existing Open Full Case remains available.                                                                                                                                  |
| Follow-Ups You Sent                                                  | Follow-Ups tab with Awaiting Reply count                                   | 1                   | Full sent list, case, blocker, recipient and Awaiting Reply / Answered. Clicking a unit opens the same floating panel.                                                                                                                                           |
| Busiest Desk                                                         | Third figure in the shared overview strip                                  | 0                   | Same team calculation and named person. Keep stalled count, exact/compact value, and Open Team in one click.                                                                                                                                                     |
| Queue Show More / Show Fewer                                         | Replaced by ordinary scrolling                                             | 0                   | All data rendered. This removes disclosure cost without removing records.                                                                                                                                                                                        |
| Loading, empty, refresh failure and mutation errors                  | Existing view boundaries and affected controls                             | 0                   | Preserve prior data on refresh failure; never replace an error with zero.                                                                                                                                                                                        |
| Global assistant, notifications, theme, profile, navigation and tour | Existing app shell                                                         | 0                   | No shell redesign; keep anchors meaningful after tabs change.                                                                                                                                                                                                    |

### Counts And Scope

| Figure Or Count       | Definition                                                                                           | Sales Demo                        |
| --------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------- |
| Stalled Bookings      | Accessible stalled cases matching Risk and Desk, before matching-task suppression                    | 21 with default filters           |
| Actions               | Filtered stalled cases with a default next step not covered by an equivalent open task               | 20                                |
| Covered By Open Tasks | Filtered stalled count minus recommendation count, only where every omitted case has a matching task | 1                                 |
| Value At Risk         | Sum of prices for all accessible stalled cases using the existing admin calculation                  | RM 11,795,000, displayed RM 11.8m |
| Tasks Due Or Overdue  | Mine tasks whose due date is on or before the data's reference date                                  | 1; all open Mine tasks = 2        |

Manager's Overdue Cases remains `decisions + sent` before filters. Its Decisions
count is the filtered actionable list; sending a follow-up reduces Decisions and
increases Follow-Ups, but does **not** reduce overdue count or value at risk.
The Manager amount is RM 17,118,000; the busiest desk holds RM 10,609,000.

The Loan capture's 19 and RM 11.0m do not have identical scopes: the desk filter
applies to the count, while value includes every accessible stalled case. Keep
that difference explicit. Switching tabs never clears queue filters. Switching
profile resets tabs, filters, pending disclosures and task scope to that
profile's defaults; it must not flash another profile's data.

### Ranking And Time

Admin order remains: provisional update present, longest without a confirmed
update, highest price, oldest booking. Mortar AI refresh never changes rank. The
first five Sales examples remain BK-9006, BK-9003, BK-9005, BK-9001, BK-9004.
Explain this with Queue Order; do not call the order simply Most Overdue First.

The admin Overdue pill currently represents days without an update, once that
duration reaches ten days. Manager Overdue means elapsed wait minus the expected
wait, in the rule's own unit. The same BK-0024 therefore reads 57 Days for an
admin and 50 Days for Manager. Keep the contract for this PR, with an
interactive tooltip on each pill defining its clock; include Working Days when
applicable. Do not mix either with booking age or a task's due date.

## 4. Layout And Measured Rules

Use Mortar's existing shell, semantic tokens, Geist scale and dotted page
ground. Keep the ordered worklist, named views and existing demo data. Round 2
changes density and emphasis. These are CSS-derived estimates, not browser
measurements.

### Desktop, 1440px

```text
64px Sidebar · 56px Fixed Top Bar · 1216px Content

Today
Move Bookings Towards A Signed SPA
┌────────────────────────┬───────────────────────────┬────────────────────────────────┐
│ Stalled Bookings       │ Value At Risk             │ Your Tasks                     │
│ 21                     │ RM 11.8m                  │ 1 Task Due Or Overdue >         │
│ Matching These Filters │ All Accessible Bookings   │ Assigned To You                │
└────────────────────────┴───────────────────────────┴────────────────────────────────┘
Actions 20     Your Tasks 2     Recent Bookings 8

Recommended Actions                                                     Risk          Desk
20 Actions To Assign · 1 Already Covered By An Open Task                  [All Risk]   [All Desks]

Booking                             Blocker                    Next Step
──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
A-23A-02 Chen Jia Hao                No Update For 8 Days        Book The SPA Signing [Legal Admin]                    [Create Task] ↻ v
BK-9006
──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
A-05-11 Siti Nurhaliza binti Osman   No Update For 8 Days        Call The Banker [Loan Admin]                          [Create Task] ↻ v
BK-9003                                                        Mortar AI Suggests Call The Buyer · Sales Admin · Use This Action
──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
```

The schematic shows the two-line collapsed row. At 1440px, step, role and
controls share one line; the entire Mortar AI alternative is one line below it.
There is no header shortcut above the figures.

Manager uses the identical strip. Its third cell reads Busiest Desk, then the
Loan Admin chip beside Tan Mei Ling, then `19 Stalled · RM 10.6m` and Open Team.
There is no separate support card. Decisions follows the tabs directly.
Follow-Ups displays `{N} Awaiting Reply` in its tab and opens in one click.

**Horizontal Arithmetic:** Excluding any reserved scrollbar lane, 1440 − 64
sidebar = 1376px canvas. The centred 1280px container has 32px inner gutters,
leaving 1216px. The worklist has 1182px after borders and 16px side padding; two
12px gaps leave 1158px for **24% Booking / 23% Blocker / 53% Next Step and
actions**, approximately **278 / 266 / 614px**. Use
`minmax(0, 24fr) minmax(0, 23fr) minmax(0, 53fr)`. This gives the real long step
labels and alternatives room beside their controls. The blocker no longer owns
the largest column. Figures use 240px / 320px / remaining width.

**Vertical Budget At 1440 × 900:** The fixed bar is 56px, main top padding 24px,
heading 56px, heading gap 12px, figures about 90px, figure gap 12px, tabs 48px,
tab gap 12px, toolbar 56px, toolbar gap 8px and column heading including borders
about 30px. The first booking therefore starts around **y=404px**.

**Collapsed Rows:** 56px minimum, 4px vertical padding and a 1px separator.
Booking identity uses one line for unit and buyer, then one line for ID. The
blocker uses one 14/20 line, with Overdue and High Risk pills on a second line
when needed. Step, role and the 32px controls share the first action line. An
alternative adds one 24px line, including its text action, making that row about
65px. The current Sales fixture has four such alternatives: the first eight rows
total about **484px**, ending around **y=888px**. Collapsed desktop rows must
stay **at most 72px** with the supplied fonts and fixtures at 1440px.

**Expected Page Height:** All 20 Sales rows total about 1156px, plus the 404px
opening, 48px queue footer and 24px main bottom padding: approximately
**1630–1650px** at 1440px, compared with the reviewed 3880px. Manager's ten
collapsed decisions occupy about 560px, giving roughly **1040px** total. These
estimates assume default filters, no open Details and loaded Geist fonts. Long
names, narrower widths, font fallback or 200% zoom may grow rows rather than
clip buyer or action text; browser checks remain required.

One bordered/shadowed worklist replaces the card wall. Do not apply per-row
shadows or hover movement. Blank row space does nothing. The full original
blocker is retained in Details; only its collapsed headline may ellipsize.

### Phone, 390px

```text
Today
Move Bookings Towards A Signed SPA
┌──────────────────┬────────────────────┐
│ Stalled Bookings │ Value At Risk      │
│ 21               │ RM 11.8m           │
│ Matching These   │ All Accessible     │
│ Filters          │ Bookings           │
├──────────────────┴────────────────────┤
│ Your Tasks                            │
│ 1 Task Due Or Overdue >                │
│ Assigned To You                       │
└───────────────────────────────────────┘
Actions 20   Your Tasks 2   Recent Bookings 8
Recommended Actions
20 Actions To Assign · 1 Already Covered ...
Risk                   Desk
[All Risk]             [All Desks]
┌───────────────────────────────────────┐
│ A-23A-02  Chen Jia Hao                 │
│ BK-9006                               │
│ No Update For 8 Days                  │
│ Book The SPA Signing [Legal Admin]    │
│ [Create Task]                     ↻ v │
├───────────────────────────────────────┤
│ A-05-11  Siti Nurhaliza binti Osman    │
│ BK-9003                               │
│ No Update For 8 Days                  │
│ Call The Banker [Loan Admin]           │
│ Mortar AI Suggests Call The Buyer ·    │
│ Sales Admin · Use This Action         │
│ [Create Task]                     ↻ v │
└───────────────────────────────────────┘
```

**Phone Arithmetic:** 390 − 32px page gutters = 358px panel. Its interior is
332px after borders and 12px row side padding. Risk and Desk remain side by side
at 175px each, separated by 8px. The two workload figures remain two-up; the
third cell spans both below them, inside the same strip for both personas.
Manager shows Busiest Desk in that cell, before Decisions.

Rows use 10px vertical padding and 6px between booking, blocker and action
groups. Unit and buyer share a line, ID follows in muted mono. Long buyer names
wrap intact when needed. The blocker is one ellipsized line; its complete text
opens with the chevron. Status pills remain visible below it. The next step and
owner share a line when they fit, then the muted alternative wraps as one
continuous sentence when present, then a single row of 32px outline/ghost
actions. Details stays the rightmost chevron. No separator or stacked AI label
adds height. Expect about **152px** for the first card and **180–200px** with an
alternative or overdue status; unusual long text may grow. The first Create Task
should remain within 390 × 844; browser measurement is still an acceptance gate.

### Breakpoints, Type And Interaction Geometry

| Range Or Element                | Rule                                                                                                                                                                  |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ≥1280px                         | 1280px maximum container including 32px gutters; 24px main block padding. 24/23/53 worklist columns, 12px gaps, 16px row side padding.                                |
| 1024–1279px                     | 24px page gutters; same column proportions, 12px row side padding. Identity and step may wrap. Figures use 200px / 240px / remaining width.                           |
| 720–1023px                      | Two row columns in a 1:1.4 ratio. Identity and blocker stack left; step, alternative and controls stack right. Column labels disappear. Third figure spans the strip. |
| ≤719px                          | 16px page gutters; 10px × 12px row padding, 6px group gaps. Compact single-column cards in the same order.                                                            |
| 320px safety width              | Tabs stay visible and may wrap; Label/Small for tab labels and Display/Page for large figures below 360px. Full names and actions wrap, never overlap.                |
| Page title                      | Display/Page: Geist 600, 24/32, −2%.                                                                                                                                  |
| Figures                         | Display/Figure: Geist 600, 30/36, −3%; tabular. Third figure uses compact body text.                                                                                  |
| Section title                   | Heading/Section: Geist 600, 16/24, −1%.                                                                                                                               |
| Blocker                         | 14/20 foreground 500 for a specific reason; muted 400 for No Update For N Days. No bold heading style.                                                                |
| Buyer / next step               | Body/Default 14/20 / Label/Default 500.                                                                                                                               |
| Context / alternative           | Body/Small 13/18; alternative role is plain muted text, not another chip.                                                                                             |
| Column / role / figure captions | Label/Small 12/16; captions regular, all labels Title Case.                                                                                                           |
| Unit / ID                       | Mono/Data: Geist Mono 500, 13/18.                                                                                                                                     |
| Controls                        | Worklist actions and icon buttons 32px; inline Use This Action at least 24px. Filters and shell controls remain 36px. Icons 16px, stroke 2; tabs at least 48px.       |
| Details                         | Rightmost 32px chevron with name, tooltip, aria-expanded and aria-controls. All facts open in normal flow, four columns on desktop and two on phone.                  |

Only the existing shell is fixed. Tabs and filters scroll normally. Keep 120ms
hover/focus colour transitions, the focus ring and reduced-motion treatment.
Retain the shared modal's focus trap, Escape, backdrop dismissal and focus
return.

## 5. Component Specifications

### Today Overview

**Purpose:** Establish workload and financial scope without competing with the
next action.

**Anatomy:** Flat Today header and one lead phrase, with no floating shortcut.
One card holds two workload figures and a compact third cell. Admin's third cell
is Your Tasks, the direct due-or-overdue shortcut, and Assigned To You.
Manager's third cell is Busiest Desk, desk chip and person, stalled count and RM
value, and Open Team. On phones it spans both columns within the same card.
Manager's Follow-Ups tab keeps the Awaiting Reply shortcut and count.

**States And Tokens:** `--card`, `--card-border`, `--shadow-card`, 6px radius.
Figures use `--foreground`; Manager's overdue count may use `--status-danger-fg`
as the existing alert variant. Busy loading uses skeletons at the same geometry;
error never shows zero. Exact monetary value uses the shared interactive Tooltip
and a click-accessible explanation.

**Rules:** No repeated stalled count in the lead. Keep value-at-risk scope
independent of queue filters. The count clears both filters; label its tooltip
“Show all desks and risk levels.” Provide View All Stalled in the value
explanation for admins and Open Team for Manager, retaining the destinations.

### Today Views

**Purpose:** Let staff choose a kind of work without reading all kinds at once.

**Anatomy:** Admin tabs Actions, Your Tasks and Recent Bookings, with counts.
Manager tabs Decisions and Follow-Ups. Panels contain their full titles:
Recommended Actions, Your Tasks, Recent Bookings, Decisions For You and
Follow-Ups You Sent.

**States And Tokens:** Active label in `--foreground`, 2px ink underline;
inactive `--muted-foreground`. Underline belongs to navigation, never a card
edge or risk decoration. 48px minimum row; 14/20 desktop, 13/18 phone labels.

**Rules:** Reuse Tabs. Arrow keys move between tabs; Home/End reach endpoints;
Enter/Space work according to the existing primitive. Hidden panels have no
focusable descendants in the active accessibility tree. Preserve filters and
in-flight mutations when switching views. Entering Tasks reveals Mine and
Everyone plus every relevant completion control at once. No extra Show All.

### Queue Toolbar

**Purpose:** State what can be acted on and control its scope.

**Anatomy:** Heading and actionable count on the left; visible Risk and Desk
labels over two selects on the right. On phones the selects form one row below
the heading. Filtered empty state includes Clear Filters.

**States And Tokens:** Existing Select, 36px trigger, 6px radius, `--input`
border, card fill and normal focus ring. Options use the shared Menu.

**Rules:** Keep the existing risk and role enum values. A display rename from
Legal to Legal Admin must not migrate stored roles. Retain legacy Sales as a
separate filter value until an independent domain change authorizes merging.
Covered counts count actual matching tasks, not all suppressed cases. Queue
Order explains provisional-first ranking; no new sorting mode is introduced.

### Today Worklist Row

**Purpose:** Make one next action legible in one horizontal scan on desktop,
then the same order vertically on phones.

**Anatomy:** Unit and buyer on one line with ID below; blocker and selective
status; default action with inline owner chip and right-aligned controls.
Details is the rightmost chevron. A differing alternative is one muted line
below the step. One enclosing worklist surface; separators between rows. Rows
are semantic articles in an ordered list, not a clickable div pretending to be a
table.

**States And Tokens:** Rest on `--card`. Controls hover with `--accent`. No row
tint, lift, edge strip or independent shadow. Danger and high-risk pills are
restricted to their actual conditions. Use neutral text for an update awaiting
review, if surfaced; never invent a new urgency colour.

**Rules:** Full buyer names wrap. Select the first specific existing blocker
that does not match the generic `No Update For N Days` form; otherwise use the
first original reason. Retain all reasons in Details. Use the existing blocker
glyph selector, with legal using the approved Scale glyph. The next action is
always `nextStepFor`'s default, never an inferred action from the shortened
blocker. Collapsed rows use the 56–72px desktop budget in Section 4. All row
actions are outline or ghost; no solid ink control appears inside the worklist.
The generic blocker uses muted regular 14/20; a specific blocker uses foreground
medium 14/20. A long headline ellipsizes to one line, with full text in Details.
Do not truncate buyer names, next steps or alternatives.

### Booking Details Disclosure

**Purpose:** Keep the evidence for a decision available without making every row
an expanded case file.

**Anatomy:** A 32px ghost ChevronDown button at the right end of the action row.
Details / Hide Details appears in its tooltip and accessible name, with the unit
in the accessible name. The inline footer contains Stage, Booking Age, Last
Update, Booking Value, Financing Risk and All Blockers. It spans the row; it
does not cover another booking.

**States And Tokens:** Closed by default; open at natural height. Divider in
`--border`; label 12/16 muted; value 13/18 foreground. Money and durations use
tabular numerals. Right-align monetary fields at desktop and phone alike.

**Rules:** `aria-expanded` and a unique `aria-controls`. Enter/Space toggle;
focus stays on the same trigger. Multiple rows may remain open. Retain expansion
by booking ID when an unrelated case changes. Missing facts read “—”; do not
substitute zero or derive creation time from booking date.

### Action Group And Mortar AI Alternative

**Purpose:** Keep recommendation, owner and execution together.

**Anatomy:** Action in 14/20 medium with its Role Label inline. On desktop,
Create Task, refresh and Details share that line, right-aligned. A differing
suggestion is one muted 13/18 line below it: Mortar AI Suggests {Action} ·
{Role} · Use This Action. There is no separator, separate heading or alternative
chip. On phones, keep step and owner together, allow this sentence to wrap, then
put all outline/ghost controls in one row.

**States And Tokens:** Create Task is a 32px outline button using `--input` and
`--card`; refresh and Details are 32px ghost icons with proper tooltips. Use
This Action is a muted underlined text action with at least a 24px target and
visible focus. No filled ink buttons appear in the worklist. Busy labels remain
Creating… / Asking Mortar AI…. Use explicit disabled tokens, never opacity.

**Rules:** Use This Action immediately creates its own step. Both actions use
the existing payload builder and owner resolver. Disable both create controls
for that booking while a task write is pending. Show the alternative only when
the shared helper returns one. A matching open default task removes the default
recommendation after successful refresh; an alternative task must not pretend to
cover the default. If an unrelated open task exists, preserve Task Open, owner
and due date, and the existing restriction on creating a conflicting default
task. Do not call the bank, send buyer messages or cancel a unit.

An AI failure keeps the default visible. An unavailable or stale reading never
changes queue order or silently overwrites a human choice. After a successful
write, move focus to the next row's corresponding control; if no row remains,
focus the queue heading. Announce the result once, without stealing focus.

### Your Tasks

**Purpose:** Show work already assigned and let its owner close it.

**Anatomy:** Full task list in a worklist card; Mine / Everyone beside its
heading. Row has Complete target, task title, booking ID, due pill, manager flag
if present, and named role/owner in Everyone.

**States And Tokens:** Overdue danger, Due Today warning, future date neutral.
Complete retains the circular control exception. Completing… replaces the title
only while the request is pending. Failed completion leaves the task present.

**Rules:** Reuse profile-scoped assignment and `canManageTaskStatus`. Preserve
manager-flagged-first sorting. Everyone never grants completion permission. Do
not default Sales to Everyone just because an older requirement says so.
Completing a task does not mean the booking is unstalled. The third-figure
shortcut counts overdue plus due-today tasks; label it honestly.

### Recent Bookings

**Purpose:** Check new intake without crowding today's next actions.

**Anatomy:** Dedicated view with a simple complete list, newest first. Unit,
booking ID and buyer stay visible; exact price is optional supporting data
already present on the booking. The mockup includes price to show the list's
alignment.

**States And Tokens:** Shared worklist surface and standard unit links. Empty
state has no fabricated “0 RM” metric. Loading/error states follow the page.

**Rules:** Use the actual creation timestamp, inclusive reference-day window of
seven dates. Exclude missing, malformed and future creation dates. No second
Show control. Do not imply that the booking date is the intake date.

### Manager Decision Row And Support

**Purpose:** Make responsibility and escalation legible immediately.

**Anatomy:** Same compact row geometry, with the owner chip beside the step and
the recipient's name directly below. Request Follow-Up is a 32px outline button,
with Details at the right edge. Show the existing default step so the Manager
understands what task is being requested. Busiest Desk is the third compact
figure, with no separate card. Follow-Ups is a full separate view; its tab shows
the Awaiting Reply count.

**States And Tokens:** Existing overdue danger pill; standard Role Label;
Sending… during the request. Sent rows display Awaiting Reply or Answered with
their existing tones. No assistant scores or progress bars.

**Rules:** Preserve `managerQueue`, `overdueBy`, `teamSummary` and task reuse.
No recipient means No One On The Team and no send control; the case remains
inspectable. A standing follow-up moves the case out of Decisions. Completed
tasks without a later confirmed update remain Answered in Follow-Ups under the
existing rule. Do not describe Answered as a verified external reply. New
confirmed information can invalidate the standing follow-up and recompute the
queue. Keep the busiest desk's name, stalled count and RM value from one model.

## 6. Copy

New interface copy is listed below. Every word in headings, labels, empty states
and buttons is capitalized; data names keep their source spelling. Full-sentence
tooltips and toasts use the design system's sentence-case exception. Do not
mechanically title-case buyer names such as “binti” or “a/p”.

### Labels And Buttons

| Location                     | Exact Copy                                                                                                                                                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page                         | Today; Move Bookings Towards A Signed SPA                                                                                                                                                                            |
| Manager lead                 | Unblock The Cases Waiting On Your Team                                                                                                                                                                               |
| Third-figure shortcut        | {N} Task Due Or Overdue / {N} Tasks Due Or Overdue                                                                                                                                                                   |
| Manager Follow-Ups tab count | {N} Awaiting Reply                                                                                                                                                                                                   |
| Admin tabs                   | Actions; Your Tasks; Recent Bookings                                                                                                                                                                                 |
| Manager tabs                 | Decisions; Follow-Ups                                                                                                                                                                                                |
| Panels                       | Recommended Actions; Decisions For You; Follow-Ups You Sent                                                                                                                                                          |
| Queue count                  | {N} Action To Assign / {N} Actions To Assign                                                                                                                                                                         |
| Covered count                | {N} Already Covered By An Open Task / {N} Already Covered By Open Tasks                                                                                                                                              |
| Manager count                | {N} Case Needs A Follow-Up / {N} Cases Need A Follow-Up                                                                                                                                                              |
| Figures                      | Stalled Bookings; Need A Move From You; Need A Move From {Desk}; Overdue Cases; Value At Risk                                                                                                                        |
| Scope captions               | Matching These Filters; All Accessible Bookings; Across All Desks; Assigned To You                                                                                                                                   |
| Value explanation actions    | View All Stalled; Open Team; Close                                                                                                                                                                                   |
| Queue columns                | Booking; Blocker; Next Step                                                                                                                                                                                          |
| Filters                      | Risk; Desk; All Risk; Low Risk; Medium Risk; High Risk; All Desks; Sales; Sales Admin; Loan Admin; Legal Admin; Clear Filters                                                                                        |
| Row details and tooltips     | Details; Hide Details; Stage; Booking Age; Last Update; Booking Value; Financing Risk; All Blockers                                                                                                                  |
| Default step labels          | Ask For The Missing Document; Ask For {Document}; Call The Banker; Submit To Another Bank; Call The Buyer; Book The SPA Signing; Ask The Solicitor For A Date; Decide Whether To Release The Unit; Wait For The Bank |
| Documents                    | Payslip; EPF Statement; Bank Statement; IC Copy; Employment Letter; Tax Form                                                                                                                                         |
| Action controls              | Create Task; Creating…; Mortar AI Suggests {Action} · {Role} · Use This Action; Ask Mortar AI Again; Asking Mortar AI…                                                                                               |
| Manager controls             | Request Follow-Up; Sending…; Busiest Desk; {N} Stalled · RM {Compact Value}; Open Team; No One On The Team                                                                                                           |
| Status                       | Task Open; High Risk; Overdue {N} Days; Overdue {N} Working Days; Overdue; Due Today; Due {D Mon YYYY}; Awaiting Reply; Answered                                                                                     |
| Tasks                        | Mine; Everyone; Completing…; From {Manager}; {N} Open; Manager Follow-Ups First, Then Due Date                                                                                                                       |
| Recent context               | Added In The Last 7 Days; Newest First                                                                                                                                                                               |
| List explanation             | Queue Order                                                                                                                                                                                                          |

### Empty And Failure States

| Condition                                  | Heading / Message                                                             | Action                 |
| ------------------------------------------ | ----------------------------------------------------------------------------- | ---------------------- |
| No stalled cases at all                    | Nothing To Chase / No Accessible Booking Is Stalled                           | Your Tasks             |
| Filters match no stalled cases             | No Bookings Match These Filters / Try Another Risk Level Or Desk              | Clear Filters          |
| All matching default steps have open tasks | All Recommended Actions Have Tasks / Your Open Tasks Are In Your Tasks        | Your Tasks             |
| Mine empty                                 | No Open Tasks For You / Recommended Actions Are Ready When You Are            | Actions                |
| Everyone empty                             | No Open Tasks                                                                 | Actions                |
| No recent creation records in range        | No New Bookings This Week                                                     | Actions                |
| No Manager overdue cases                   | No Decisions Waiting / No Case Has Reached The Follow-Up Threshold            | Open Team              |
| All overdue cases covered                  | No Decisions Waiting / Every Overdue Case Already Has A Follow-Up             | Follow-Ups             |
| No sent follow-ups                         | No Follow-Ups Waiting On A Reply / Request A Follow-Up From Decisions For You | Decisions              |
| Initial load failed                        | Could Not Load Your Bookings / Try Again To Load Today                        | Try Again              |
| Refresh failed with prior data             | Could Not Refresh Today / Showing The Last Loaded Bookings                    | Try Again              |
| No manager recipient                       | No One On The Team                                                            | Unit Remains Clickable |

### Tooltips, Accessible Names And Toasts

| Use                      | Exact Copy Or Template                                                                |
| ------------------------ | ------------------------------------------------------------------------------------- |
| Queue Order, admin       | Updates awaiting review first, then longest without an update, booking value and age. |
| Queue Order, Manager     | Cases beyond their expected wait, in the existing priority order.                     |
| Admin overdue pill       | {N} days without an update. This is not a task deadline.                              |
| Manager overdue pill     | {N} {days / working days} beyond this step's expected wait.                           |
| Exact value              | RM {Exact Amount}. Booking value held by stalled cases, not collected revenue.        |
| Unit accessible name     | Open case {unit}, {buyer}.                                                            |
| Details accessible name  | Details for {unit} / Hide details for {unit}                                          |
| Refresh accessible name  | Ask Mortar AI Again for {unit}.                                                       |
| Complete accessible name | Complete: {task title}.                                                               |
| Task write success       | Task created for {owner}.                                                             |
| Follow-up success        | Follow-up sent to {recipient}.                                                        |
| Completion success       | Completed: {task title}.                                                              |
| Task failure             | Could not create the task. Try again.                                                 |
| Completion failure       | Could not complete the task. Try again.                                               |
| Follow-up failure        | Could not send the follow-up. Try again.                                              |
| AI unavailable           | Mortar AI could not check. The usual next step is still shown.                        |
| AI stale reading         | Mortar AI's answer may be out of date.                                                |

## 7. Build Plan

Keep this to one frontend PR. No API, database, scoring, forecast, case-page
layout or permission changes. Reuse the existing Select, Tabs, Tooltip, Button,
StatusPill, RoleLabel, EmptyState and centred case-panel primitives.

### Proposed Component Structure

```text
ChasePage
├─ TodayOverview                  two workload figures + compact third cell
│  └─ TasksDue / BusiestDesk        direct task or Team shortcut
├─ TodayViews                     active view, counts, keyboard handling
├─ Actions / Decisions
│  ├─ QueueHeader                 count + Risk + Desk
│  └─ TodayWorklist               single raised surface, ordered list
│     └─ ChaseCard / ManagerCard   row composition; existing action handlers
│        └─ BookingDetails        all metadata and full blockers
├─ YourTasks / FollowUpsSent       complete lists in their named views
├─ RecentBookings                 complete list in its named view
└─ CaseQuickView                  shared overlay for unit clicks
```

### Pure View Model

Create `components/chase/todayView.ts`. It consumes the already scoped booking
data; it does not import React, read localStorage, use the browser clock, fetch
suggestions or make task writes. Page-level state remains with the page.

```ts
type TodayViewInput = {
  snapshot: Snapshot // Already scoped by the existing data layer.
  cases: readonly CaseSummary[]
  profile: StaffProfile
  risk: 'all' | RiskLevel
  desk: 'all' | OwnerRole
  steps: ReadonlyMap<string, CaseNextStep>
  manager: { decisions: readonly ManagerCase[]; sent: readonly ManagerCase[] }
  team: TeamSummary | null
}

type TodayRowModel = {
  booking: Booking
  summary: CaseSummary
  headlineBlocker: string
  fullBlockers: readonly string[]
  step: NextStep
  alternativeStep?: NextStep
  openTask: Task | null
  awaitingReview: boolean
  managerCase?: ManagerCase
}

type TodayViewModel = {
  rows: readonly TodayRowModel[]
  stalledCount: number
  recommendationCount: number
  coveredByTaskCount: number
  valueAtRiskRm: number
  overdueCount: number
  awaitingReplyCount: number
  mine: readonly Task[]
  everyone: readonly Task[]
  dueOrOverdueCount: number
  recent: readonly Booking[]
  sent: readonly ManagerCase[]
  busiest: TeamRow | null
  emptyReason: 'none' | 'no-stalls' | 'filtered' | 'covered' | 'no-decisions'
}

function todayView(input: TodayViewInput): TodayViewModel
```

`TeamSummary` and the case/step types are existing domain or frontend types;
their exported names were checked against the current source. This is an
interface contract, not a second domain model. The page builds the `steps` map
with the shared helper so the pure view model does not gain a dependency on
React through the current label/icon module.

| Derivation      | Input → Output / Invariant                                                                                                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin rows      | `cases + bookings + steps + open tasks + filters` → current stall filter, order and default-step matching-task exclusion. Use action, normalized owner role and resolved owner name for equivalence. |
| Blocker lead    | `stallReasons` → first non-generic existing reason, else first reason; `fullBlockers` stays unchanged. For an empty Manager stall list, use `wait.reason`.                                           |
| Metadata        | Existing summary and booking → stage, age, days without update, exact price, risk. No new data requests.                                                                                             |
| Review priority | Provisional events → set of booking IDs. Keep current sort, including price and age tie-breakers. Do not let AI alternative or urgency reorder it.                                                   |
| Figures         | Admin filtered stalled count + all accessible stalled prices; Manager decisions + sent and current team value. Empty result does not erase portfolio value.                                          |
| Tasks           | Open tasks + named profile → Mine / Everyone, permission decisions at render boundary, manager-flagged-first order; reference date → due states and shortcut count.                                  |
| Recent          | Existing `createdAt` + reference date → inclusive seven-calendar-date window, newest timestamp then ID. Exclude invalid/missing/future dates.                                                        |
| Manager         | Existing queue and team output → filtered decisions, unfiltered sent, awaiting-reply count and first eligible busiest row. Do not rewrite the overdue threshold or standing-follow-up logic.         |

### File Changes Under `frontend/src`

| File                                                           | Change                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages/ChasePage.tsx`                                          | Own the selected view, filters, expanded detail IDs and quick-view booking. Preserve fetch/refresh, local AI overrides and per-booking saving flags. Compose the new layout and full lists. Connect Manager units and follow-up units to the existing panel.                                                                       |
| `components/chase/TodayOverview.tsx`                           | Three-cell strip with figures, captions and TasksDue/BusiestDesk in the third cell; move Awaiting Reply to the Follow-Ups tab. Reuse exact-value Tooltip; expose explicit navigation callbacks.                                                                                                                                    |
| `components/chase/TodayViews.tsx`                              | New thin wrapper around the existing tabs primitive. Counts and persona labels are inputs. View selection does not refetch data.                                                                                                                                                                                                   |
| `components/chase/TodayWorklist.tsx`                           | New ordered-list surface and shared responsive grid, including column headings and empty state slot. No data fetching or mutations.                                                                                                                                                                                                |
| `components/chase/BookingDetails.tsx`                          | New inline metadata definition list and full-blocker content. Disclosure state is keyed by booking ID in the page.                                                                                                                                                                                                                 |
| `components/chase/ChaseCard.tsx`                               | Retain the public component initially to avoid unrelated churn. Render a compact worklist row with 32px outline/ghost actions, inline owner, muted one-line alternative and right-edge Details chevron. Keep alternative, refresh, busy states and task restrictions. Replace own-desk label suppression with always-visible role. |
| `components/chase/TodayRail.tsx`                               | Retain and adapt YourTasks, RecentBookings, FollowUpsSent and BusiestDesk bodies. Remove their preview limits and nested open state. Move BusiestDesk into TodayOverview. Retire Rail/RailFigures wrappers once their consumers are gone. Do not rename the whole module just for aesthetics.                                      |
| `components/chase/todayView.ts`                                | Pure view model above; extract repeated sorting/filtering from the page without changing underlying rules.                                                                                                                                                                                                                         |
| `components/chase/today.ts`                                    | Keep shared profile-menu figure logic; change the displayed due phrase to Due Or Overdue where it counts `<= referenceDate`. Keep `defaultOwnerFilter` and named-profile assignment rules.                                                                                                                                         |
| `components/manager/ManagerCard.tsx`                           | Render the shared row geometry; add `onInspect`. Preserve Request Follow-Up, missing recipient, failure refresh and server task reuse. Place the default step and owner beside the outline action, with recipient below.                                                                                                           |
| Existing Today tour definition and `tour/tourAnchors.test.tsx` | Select the relevant tab before spotlighting tasks, recent rows or follow-ups; move first-card anchor to the first rendered recommendation, not a filtered-out stalled case. Reuse current tour infrastructure.                                                                                                                     |

Keep the shared next-step helper, action payload builder, manager queue, role
labels and case panel intact. No new global CSS token is necessary. Prefer
utilities at the existing breakpoint steps, with a narrowly scoped Today class
for the 719px composition change if needed.

### Tests And Acceptance

| Test Group                  | Cases That Must Pass                                                                                                                                                                                                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pure model                  | Default Sales all-desks vs Loan/Legal own desk; named-profile access stays upstream; provisional-first order and deterministic ties; AI refresh does not reorder; matching default task excluded; unrelated task retained with Task Open; alternative task does not falsely cover default; multiple-role normalization matches existing behavior. |
| Counts and dates            | Sales fixture 21 stalled / 20 recommendations / 1 covered; filter counts and money scopes remain distinct; Manager 10 overdue with 10 decisions then 9 decisions / 1 sent; due shortcut includes overdue; creation-time seven-day inclusivity, missing/invalid/future dates and ID tie-break.                                                     |
| Page and rows               | Each Details opens all fields in one click; complete names and one-click full reasons; same outline action on every row; AI alternative stays direct; double clicks produce one write; failure retains row/task; no recipient cannot send; unit opens centred shared panel in every relevant view and returns focus.                              |
| Task and follow-up behavior | Mine / Everyone preserved; another person's task cannot be completed; manager flag and due order retained; default task, alternative task and manager follow-up have correct owner/payload; standing completed follow-up stays Answered until new confirmed information changes it.                                                               |
| Layout and access           | Browser checks at 1440, 1280, 1024, 768, 390 and 320; both themes; 200% zoom; no page-level horizontal overflow; menus remain on-screen; tab/menu arrows, Enter/Space, Escape, focus trap/return and reduced motion.                                                                                                                              |

Extend the existing Today page, Manager page, ChaseCard and task rail tests. Add
table-driven tests for `todayView`; test behavior rather than classes or pixel
snapshots of every row. Preserve current API permission and duplicate tests. A
short browser review must confirm all collapsed rows are at most 72px and the
first eight bookings fit below the figures at 1440 × 900, with the current demo
data and loaded fonts. Check a roughly 1640px Sales page and 1040px Manager page
with Details closed. At 390 × 844, confirm the first Sales action is visible,
unit/buyer and step/owner stay compact, and long alternatives wrap without
covering controls. Check the one-click Details, TasksDue and Open Team paths.

**Five-Second Check:** Show each persona's default view for five seconds to one
representative staff member. Ask them to name the first booking, blocker, next
action and owner, then point to their own tasks or sent follow-ups. Record
correct answers and time to first correct click. The target is all four facts
without opening Details; do not claim success solely from lower element counts.

### Build Sequence And Deletions

1. Extract and test the pure model against current fixtures and current access
   rules. Preserve action payloads and exact figure denominators.
2. Build the three-cell overview, named views and compact shared worklist.
   Recompose admin and Manager rows with outline controls, the right-edge
   chevron and inline alternative; wire the existing centred case panel.
3. Move task, recent and sent lists into their views. Remove rail-first mobile
   order, nested Show controls, two-column card grid, per-row card shadows,
   duplicate metadata, floating header shortcuts, the separate Busiest Desk card
   and the redundant Manager Open Case footer link.
4. Add accessibility, busy/failure handling and tour continuity. Check all
   capability routes, including unavailable AI and empty filtered views.
5. Apply the paste-ready design guidance below in the implementation PR. Update
   obsolete written card-count/task-default requirements in that PR; run the
   repository checks, format, and capture the agreed viewport/theme matrix.

Do not delete shared task, next-step, role or case-panel modules. Retire unused
rail-only exports only after checking their remaining imports. Do not introduce
snoozing, bulk actions, suggested contact details, forecasts, new AI scores or
external notifications: none is needed to answer the brief.

### Mockup Scope And Data Integrity

The mockup is a standalone static file, with inline CSS, JavaScript and Lucide
SVGs. Google Fonts is its only external resource. It opens with `file://` and
has no install or build step. Reload resets all task and follow-up simulations.
It makes no API requests and changes no Mortar data.

All 20 Sales recommendations and 10 Manager decisions are present. The visible
examples match the supplied captures. Additional rows and all eight recent
bookings come from the same deterministic demo generator and story records. The
five leading Sales rows retain the captured order; BK-9002 is excluded from
recommendations because an existing matching task covers it in the capture.

Mine uses the two captured Sales tasks. Everyone demonstrates the captured tasks
on accessible Sales bookings; it is not a complete reconstruction of the
persisted task database. The captured overdue loan task has only a known due
state, not a known exact due date. The preview must not claim a specific date
for it. The Loan screenshot's task on an inaccessible Sales booking is not
copied into Sales Everyone.

Creating a task or sending a follow-up is an in-memory demonstration. The
assistant refresh demonstrates the unavailable state, not a live model result.
Case and Team overlays show factual context only; they stand in for the existing
live components and are not redesign proposals. The shell controls outside this
consultation indicate that their live destinations are outside the preview.

The token values follow the actual stylesheet where prose tables have drifted:
light hover `#ebebeb`, light selected `#e4e4e4`, dark hover `#262626`, dark
selected `#202020`. No new palette is introduced. The brand mark uses the design
system's neutral ink/grey treatment; no new orange token is added.

**Round 2 Verification:** 92 DOM and interaction checks passed across both
personas and themes. They cover script execution, queue counts, three overview
cells, icon-only disclosures, unique IDs and tooltip targets, full details,
case/Team access, task and recent views, default versus alternative writes and
follow-up movement/counts. The frozen demo data remains unchanged. Markup and
responsive rules were read against all seven review points; both deliverables
pass scoped formatting.

Desktop heights above are estimates from CSS geometry, not browser measurements.
Browser rendering, font wrapping, browser focus behavior and the five-second
staff test remain acceptance gates. No new screenshots are claimed.

`bun run check` was attempted but stopped in typechecking because `tsc` is
unavailable; this worktree has no installed dependencies. The full formatting
command would write outside the authorized directory, so only these two
deliverables were formatted. No app source or design-system file changes are
part of this revision. The superseded `round1/` copy is removed; this README
remains the single source of truth.

## 8. DESIGN.md Amendments

No new palette, font, gradient, illustration style or card radius is proposed.
The amendments change page composition, not visual identity. They also retire
obsolete Today behavior. Apply these exact replacements in the implementation
PR; this consultation does not edit the design system.

### Replace “Chase Card” With This Text

```md
### Today Worklist Row

- **Anatomy:** One ordered list in a shared card surface using --card,
  --card-border, --shadow-card and 6px radius. At 1280px and above use minmax(0,
  24fr) minmax(0, 23fr) minmax(0, 53fr), 12px column gaps, 16px side padding and
  4px vertical padding. At 1440px, collapsed rows are 56px minimum, about 65px
  with an alternative, and at most 72px for the demo fixtures. Below 1280px use
  12px side padding; permit wrapping. At 720–1023px use two columns in a 1:1.4
  ratio. Below 720px stack booking, blocker and action groups with 10px vertical
  / 12px side padding and 6px gaps. One separator per row; no independent
  shadows or hover lift.
- **Typography:** Unit and buyer share a line, ID follows. Full buyer names
  wrap. Unit/ID use Mono/Data; buyer uses Body/Default. Specific blocker uses
  14/20 medium foreground; No Update For N Days uses 14/20 regular muted text.
  Its collapsed headline may ellipsize to one line; all full reasons remain in
  Details. Keep Overdue and High Risk pills visible. Next step is Label/Default
  with an inline Role Label. Alternative is a continuous Body/Small muted line:
  Mortar AI Suggests {Action} · {Role} · Use This Action. On phones it may wrap;
  do not split it into labelled blocks or add a separator.
- **Disclosure:** Rightmost 32px ghost ChevronDown button, with Details / Hide
  Details tooltip, booking-specific accessible name, aria-expanded and unique
  aria-controls. Opens stage, age, last update, exact value, financing risk and
  all original reasons together. Four-column definition list on desktop, two on
  phone. No nested scrolling or animated height.
- **Actions:** Create Task is a 32px outline button on every eligible row.
  Refresh and Details are 32px ghost buttons. Use This Action is an underlined
  muted text button with at least a 24px target; it creates directly. No solid
  ink action appears inside this worklist. On desktop step, role and controls
  share a line with controls right-aligned; the alternative follows. On phones
  the controls form one row after the step and optional alternative. Preserve
  focus rings, tooltips, Task Open, disabled states and conflicting-task rules.
- **Behavior:** Keep the existing blocker selector, next-step helpers, payloads,
  order and permissions. AI refresh does not reorder. Failed writes retain the
  record. The unit opens the shared centred case panel. Render every row in
  normal flow; no Snooze, Show More or Log Follow-Up is introduced.
```

### Replace “Manager Card” With This Text

```md
### Manager Decision Row

Use Today Worklist Row geometry. Keep the owner chip inline beside the existing
step and recipient name below. Request Follow-Up is a repeated 32px outline
action, with Details as the rightmost chevron. Preserve the overdue pill and its
existing days/working-days rule. No recipient means No One On The Team and no
send action, with the unit still inspectable. Retain task reuse and manager
flagging; a standing follow-up moves the case into Follow-Ups You Sent. Do not
add a redundant Open Case footer link.
```

### Replace “Today Rail” With This Text

```md
### Today Overview And Views

- **Overview:** Today and one lead phrase, without a floating header shortcut. A
  single strip holds two workload figures and a compact third figure. At 1280px
  and above the cells are 240px / 320px / remaining width. Admin's third figure
  shows Your Tasks, {N} Task(s) Due Or Overdue and Assigned To You; its shortcut
  opens Your Tasks directly. Manager's third figure shows Busiest Desk, a desk
  chip beside the person, {N} Stalled · RM {Compact Value}, and Open Team. There
  is no separate Busiest Desk card.
- **Scope:** Stalled count follows Risk/Desk and says Matching These Filters.
  Value At Risk remains accessible-portfolio scoped and says All Accessible
  Bookings. Manager figures say Across All Desks. Exact money and the value
  explanation remain available on hover, focus and click. Task creation does not
  imply a booking is no longer stalled.
- **Views:** Actions, Your Tasks and Recent Bookings for admins; Decisions and
  Follow-Ups for Manager. Default to Actions/Decisions. Follow-Ups carries the
  Awaiting Reply count. Keep full panel headings, Mine as task default, access
  and completion permissions, queue filters and in-flight work. Lists open in
  full with no Show More. There is no permanent rail.
- **Supporting Work:** Retain task completion, booking ID, due state, named
  owner and manager flag. Keep recent intake's real seven-date creation window
  and follow-up recipient, Awaiting Reply / Answered state. Open Team and the
  task shortcut stay one click from every view.
- **Responsive And Access:** At desktop use 24px main block padding, 12px gaps
  after header, figures and tabs, then 8px before the worklist. Below 1024px the
  third figure spans both columns inside the same strip. Below 720px page
  gutters are 16px; keep the two workload figures and Risk/Desk two-up. Phone
  tabs use 13/18; below 360px permit Label/Small tabs and Display/Page figures.
  Tabs and filters scroll normally. Filters/shell remain 36px, tabs at least
  48px. Reuse the existing semantic tokens, fonts, icons, focus and modal rules.
```

### Amend The Repeated Primary Action And Control-Size Rules

```md
Today Worklist Row and Manager Decision Row are scoped exceptions to the
repeated Primary button rule: every row uses the same 32px outline action, with
32px ghost refresh/disclosure buttons. No row uses solid ink. Use This Action
has at least a 24px target within the compact alternative line. This exception
applies to the Button guidance, Acceptance item 6, the 36px control rule and the
instruction that every repeated primary action must be filled. Other views
retain their existing control sizes and primary-action treatment.
```

### Replace The Today Sentence In “Content Canvas”

```md
Today keeps the centred container and dotted ground. Two workload figures and
one compact task/desk figure share a strip above named views. The default
Actions or Manager Decisions worklist is one ordered list with compact rows.
Your Tasks, Recent Bookings and Follow-Ups remain one click away. See Today
Overview And Views for its scoped spacing, phone gutters and type steps.
```

### Append To The Approved Icon List

```md
Today reuses the shell's existing Lucide glyphs: BellRing, ClipboardList,
Building2, TrendingUp, Settings, Menu, House, Bell, Moon and X. X closes the
existing modal. No new icon family or custom pictogram is introduced. Use Scale
for the legal blocker, Clock for an update wait and FileWarning for an
outstanding document. Keep icon colour inherited from adjacent text; desk
colours remain confined to Role Label and profile avatar.
```

**Approved Direction:** Actions remains the opening admin view, with assigned
work reachable through the third-figure shortcut and Your Tasks. Manager keeps
Decisions and Follow-Ups. The five-second staff check validates comprehension;
it does not reopen this approved information architecture. No new backend data
is required.
