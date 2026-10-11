# Mortar Case Page — A Decision, Then The Record

**Recommendation:** Make `/bookings/:id` a case summary with four working views.
Lead with the external party holding the case and the internal person who acts
next. Put an illustrated, evidence-aware journey directly below that decision.
Default to Overview; keep Messages, History and Tasks one click away.

This is a design handoff and a static preview, not a change to the Mortar
repository. The supplied brief authorizes both artifacts. `mockup.html` is the
review surface for this proposal. All proposed departures from `docs/DESIGN.md`
are named below; none is silently applied to the production system.

## 1. What The Previous Rounds Teach Us

I read `docs/DESIGN.md`, `docs/PRODUCT.md`, `docs/research/ui-triage/README.md`,
`BookingDetailPage.tsx`, its bookings/case components and their local
dependencies, and the page history. Paths below are relative to
`/home/user/Documents/Mortar`.

| Revision                            | What Actually Changed                                                                                                                                                    | What To Preserve / What Remains                                                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `07880c4` — Rebalance The Case Page | Moved applications into the right rail; reduced no-update AI readings; exposed rerun on hover/focus; folded low-fit guidance; put buyer certainty in a tooltip.          | Preserve concise readings and progressive disclosure. Balancing column heights did not establish a reading order.                                                         |
| `0f17ec0` — A Quieter Case Page     | Replaced header pills with one sentence; collapsed both forms; removed probability bars; showed one guidance result; folded full history; added recording to quick view. | Preserve closed forms, words instead of scores, and the history audit. A long sentence still contains several competing questions. The track card still pushes work down. |
| `213b309` — One Shared Case Sheet   | Shared the default next action and its differing AI alternative across contexts; changed document action labels; connected the open case to the assistant.               | Preserve `nextStepFor`, `stepToTask` and shared case context. Do not create a second action engine for this redesign.                                                     |

The earlier triage explicitly kept all tracks visible and deferred phones. This
brief supersedes both decisions. Keeping the three tracks permanently expanded
is the biggest remaining layout cost. This round changes the page hierarchy,
while keeping their records intact.

### Ranked Critique Of The Supplied Screenshots

| Rank | Visible Problem                                                                                                                                           | Consequence                                                                                          | Decision                                                                                                                                                              |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | The desktop has a full-width track card from roughly y=505–877 before messages or bank applications. Its right half says only “No Events Yet.”            | Historical events occupy the prime working area; the active bank appears below the fold.             | Move tracks into History. Show both bank applications immediately under the case summary.                                                                             |
| 2    | The same wait appears in the header, “Waiting On,” explanatory copy and the red “No Update For 8 Days” pill.                                              | Readers reconcile repeated statements instead of finding the next move.                              | One current-state block: “Crestline Bank’s Decision,” “Stalled,” and one sentence naming the eight-day silence.                                                       |
| 3    | The 32px unit/buyer heading, four lines of metadata and a separate risk chip compete above the first card. The phone wraps the heading aggressively.      | Identity dominates action, and owners read like another status.                                      | Restore Display/Page 24/32 for the buyer. Put the unit in Mono/Data; move the owner directory and financing risk to Case Details.                                     |
| 4    | Five thin bars have tiny labels. “Loan Approved” is red even though no loan is approved.                                                                  | The highlighted destination can be mistaken for a recorded achievement.                              | Give each stop an icon station, explicit state text and a details surface. The current stop reads “Awaiting Decision”; completed stops get checks.                    |
| 5    | The journey implies Documents is complete because a later loan submission exists. The supplied history has no confirmed document receipt.                 | A visually complete path overstates the evidence.                                                    | Add an explicit “Receipt Not Recorded” state. Submission is recorded; document receipt is not retroactively invented.                                                 |
| 6    | “Loan Rejected” then “Loan Submitted” appear as equal timeline bullets, while the application statuses live far below.                                    | The user must reconstruct the rescue attempt across sections.                                        | Show a compact return path with “1 Rejection · Resubmitted To Crestline Bank,” supported by active-bank-first application rows.                                       |
| 7    | Each message includes a large bordered AI block and repeated certainty/name text. The oldest message leads.                                               | Settled material has the same weight as a new decision; the latest bank reply is last.               | Newest first in Messages; use a separated reading line. Full review actions remain beside a real pending proposal. Show only the latest original message on Overview. |
| 8    | Bank applications, guidance, buyer response and zero tasks each have their own card, eyebrow and padding.                                                 | Container count becomes the hierarchy. Empty tasks spend as much visual structure as real bank work. | Two support surfaces: applications and Case Details. Guidance opens from the next action; tasks get a named tab with a count.                                         |
| 9    | On the phone, all desktop sections stack. Banker information, guidance and tasks appear only after every message. Tiny journey labels compress further.   | A daily tool becomes several screens of scrolling before basic context is reachable.                 | Same four views on both sizes. Vertical journey on phones, with actions before it. No horizontal micro-roadmap.                                                       |
| 10   | The dot grid runs behind all content; repeated uppercase eyebrows and green “Confirmed” chips add texture everywhere. “Jev” appears on numerous readings. | Small contrast signals accumulate into noise and expose inconsistent AI branding.                    | Remove the grid on this route only; use Title Case 12/16 labels. Quiet settled states where a decision is not required. Name the assistant Mortar AI everywhere.      |

## 2. The First Five Seconds

| Persona                   | Why They Open A Full Case                                    | The First Answer For BK-9002                                                                                                                     | Next Reach                                                                                                           |
| ------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Sales Admin — Nurul Aina  | A buyer asks for progress, or the Today queue flags a stall. | This is Hafiz’s B-08-05. Crestline is deciding. No update for eight days. Tan Mei Ling owns the bank follow-up.                                  | Record An Update or Paste A Message; Buyer Response on Overview.                                                     |
| Loan Admin — Tan Mei Ling | A banker replies, or a pending application needs chasing.    | Crestline is the live application; Bernard Lim is the banker. Malayan Trust rejected the first attempt. Call the banker.                         | Add Task; Messages for the actual wording and proposal review.                                                       |
| Legal Admin — Arvind Raj  | Check readiness for handoff, schedule or record signing.     | Loan approval has not been confirmed. Zainal & Co is assigned. No legal event is recorded.                                                       | Record An Update; History, with Legal available as a track filter.                                                   |
| Manager — Robert Khoo     | Understand the blockage and who will move it.                | RM 620,000 remains booked, not signed. The case is 17 days old, with eight days of silence. Loan Admin owns the next action; no task exists yet. | Add Task under existing permissions; History for the audit. Financing risk is a separate fact, not the stall itself. |

Keep the same structure for all personas. Do not make tabs jump when the profile
changes. Respect existing access scoping and task-status permissions. If a
persona cannot perform an action, preserve the context and explain that specific
restriction beside the action; do not claim buyer-data masking that does not
exist.

## 3. Information Architecture

**Primary:** identity, current wait, stall reason, owner, next action, Record An
Update and Paste A Message. All are on the surface. Add Task remains the only
filled page action.

**Secondary:** the journey, active bank application, latest message, assigned
team, risk and buyer response. These explain the primary decision. Overview is
the default for a fresh case visit.

**Tertiary:** complete message history and AI readings, all case events, task
history, and the guidance library. Named tabs or a direct button reveal each in
one click. A full case is still auditable; it is no longer an expanded audit by
default.

### Every Existing Capability Has A Home

| Current Section / Capability                          | New Home                                                                        | Clicks From Default | Behavior Preserved                                                                                                                                        |
| ----------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit, buyer, project, price, booking date             | Case header                                                                     | 0                   | Exact unit/ID and RM/date formats; no truncation of buyer name.                                                                                           |
| Stage                                                 | Small With Bank pill beside unit                                                | 0                   | Existing derived stage; closed/signed variants below.                                                                                                     |
| Case age                                              | Journey heading                                                                 | 0                   | 17 Days Since Booking; source is reference date, not browser clock.                                                                                       |
| Waiting On, stalled flag, stall reason                | First part of case summary                                                      | 0                   | Same `ballInCourt` and `summary.stallReasons`.                                                                                                            |
| Next Step / owner / AI alternative                    | Second part of case summary                                                     | 0                   | Same `nextStepFor`; alternative appears only if different.                                                                                                |
| Add Task                                              | Filled action beside the next step                                              | 1                   | `stepToTask`; existing due-date and owner rules. No telephone call is initiated.                                                                          |
| Record An Update                                      | Header button → floating case panel                                             | 1                   | All event kinds and conditional fields; confirmed writes; existing destructive confirmations.                                                             |
| Paste A Message                                       | Header button → floating case panel                                             | 1                   | Sender role/name, sent date/time, raw text; review after extraction.                                                                                      |
| Journey strip                                         | Illustrated Booking Journey inside summary                                      | 0                   | Five milestones; richer state and per-stop details.                                                                                                       |
| Loan Track                                            | History → All Tracks includes all loan events                                   | 1                   | Loan filter is optional; the events are already visible after one click.                                                                                  |
| Legal Track                                           | History → All Tracks and Legal filter                                           | 1                   | No-events state; overlapping work is not blocked by loan stage.                                                                                           |
| Sales Events                                          | History → All Tracks includes all sales events                                  | 1                   | Original dates, notes, review states and authors.                                                                                                         |
| Full Case History                                     | History tab, full records expanded                                              | 1                   | Occurred/recorded times, track, event/document, full note, reporter, verifier, source, status, IDs and message links. No second “Show Full History” gate. |
| Messages                                              | Messages tab                                                                    | 1                   | All four originals, newest first; role and sent time retained.                                                                                            |
| Review AI proposals                                   | Messages, actions visible per eligible message                                  | 1 to view           | Confirm / Dispute / Dismiss; reading and supporting message together; existing review rules unchanged. The decision itself is the next action.            |
| Ask AI Again                                          | Each message’s visible secondary action                                         | 1 to view           | Per-message busy state, refresh, stale/conflict handling. Never hover-only on touch.                                                                      |
| Bank Applications                                     | Overview, first support block                                                   | 0                   | Every application and banker; active first, then decided.                                                                                                 |
| What To Do search                                     | Direct action beside the next step → floating panel                             | 1                   | Search prefilled from current blocker, full top guidance open, remaining matches, fit and lifecycle status.                                               |
| Buyer Response                                        | Case Details on Overview                                                        | 0                   | Prompt Replies / Committed and source note; certainty, stale/unavailable states accessible.                                                               |
| Financing Risk / outstanding documents                | Risk in Case Details; outstanding documents in current-state block when present | 0                   | Risk at every level. Document obligations never disappear into a tooltip.                                                                                 |
| Owner directory                                       | Case Details → Assigned Team                                                    | 0                   | Nurul Aina, Tan Mei Ling, Zainal & Co. Active owner also appears next to the action.                                                                      |
| Open and completed tasks                              | Tasks tab, total count                                                          | 1                   | Open first, due-date order, owner, due date, origin, manager flag and permitted Complete action.                                                          |
| Global assistant, notifications, theme, profile, help | Existing shell                                                                  | 0 / 1               | Preserve production shell and help. Preview shell buttons are illustrative.                                                                               |

The journey return-path control is an additional shortcut: it opens History with
Loan already selected. It does not add another layer. Switching a tab preserves
form drafts and scroll within that case; changing booking resets local state. A
link to a message selects Messages and focuses the relevant item. Support
shareable `?view=messages#message-ID` / `?view=history&track=loan` in
production.

## 4. Layout And Measured Rules

The mockup uses existing semantic colors as custom properties. Tailwind CDN and
Google Fonts are for this artifact only. Production continues to use local
tokens and existing components. No marketing typography, gradient, illustration
wash or arbitrary accent.

### Desktop — 1440px

```text
      64px fixed sidebar              56px fixed top bar
┌──────┬──────────────────────────────────────────────────────────────────────┐
│ Mark │ Bookings  ›  BK-9002                 Ask AI / Bell / Theme / Profile │
│      ├──────────────────────────────────────────────────────────────────────┤
│ Nav  │  48px outer + 32px inner gutter   CONTENT 1216px                    │
│      │  B-08-05 │ Aster Heights [With Bank]                               │
│      │  Mohd Hafiz bin Razak       [Record An Update] [Paste A Message]    │
│      │  RM 620,000 · Booked 1 Sep 2026                                    │
│      │                         24px                                      │
│      │ ┌────────────────────────────────────────────────────────────────┐ │
│      │ │ 24px pad                       │ 32px gap / divider            │ │
│      │ │ [bank] Waiting On              │ Next Step                     │ │
│      │ │ Crestline Bank’s Decision      │ Call The Banker   [+ Add Task] │ │
│      │ │ Bernard Lim · Panel Banker     │ Loan Admin · Tan Mei Ling     │ │
│      │ │ [Stalled] No update for 8 days. │ What To Do ›    No Open Tasks │ │
│      │ ├────────────────────────────────────────────────────────────────┤ │
│      │ │ Booking Journey                           17 Days Since Booking│ │
│      │ │                                                                │ │
│      │ │                                      [You Are Here]          │ │
│      │ │ FORM+KEY     FOLDER       BANK       OFFER+STAMP     CONTRACT  │ │
│      │ │    ● ╲___╱── ◌ ──╲___╱── ● ──╲___╱── ◎ · · ╲___╱── ○     │ │
│      │ │ Booked       Documents    Loan        Loan           SPA      │ │
│      │ │ 1 Sep 2026   Receipt Not  Submitted   Approved       Signed   │ │
│      │ │              Recorded    10 Sep      Awaiting       Upcoming │ │
│      │ │                    ╰─╮               Decision                │ │
│      │ │            Malayan Trust · Rejected 8 Sep                     │ │
│      │ │                                      ┌─ Detail Below ───┐    │ │
│      │ │                                      │ Dates / Evidence │    │ │
│      │ │ Select A Milestone For Details       └──────────────────┘    │ │
│      │ └────────────────────────────────────────────────────────────────┘ │
│      │ 16px                                                            │
│      │ Overview     Messages 4     History 5     Tasks 0   (56px tabs)   │
│      │ ━━━━━━━━───────────────────────────────────────────────────────── │
│      │ 24px                                                            │
│      │ ┌────────── 848px ────────────────────┐ 24px ┌──── 344px ──────┐ │
│      │ │ Bank Applications   1 Active / 2    │      │ Case Details     │ │
│      │ │ Crestline / Bernard     [Submitted] │      │ Assigned Team    │ │
│      │ │ Malayan / Faridah       [Rejected]  │      │ Sales  Nurul     │ │
│      │ │ Reason in one sentence              │      │ Loan   Mei Ling  │ │
│      │ └─────────────────────────────────────┘      │ Legal  Zainal    │ │
│      │ 24px                                        │ ──────────────── │ │
│      │ Latest Message              View All ›      │ Financing Risk   │ │
│      │ BL  Bernard · 10 Sep 2026, 16:15             │ [High Risk]      │ │
│      │ Original banker message                     │ ──────────────── │ │
│      │ View Mortar AI’s Reading ›                  │ Buyer Response   │ │
│      │                                             │ Replies / Intent │ │
│      │                                             └──────────────────┘ │
└──────┴──────────────────────────────────────────────────────────────────────┘
```

The container calculation is: remaining canvas = 1376; centered container =
1280; outer margins = 48 each; container padding = 32 each; usable width =
**1216**, beginning at viewport x=144 and ending at x=1360. The support grid is
**848 + 24 + 344 = 1216**.

The ASCII drawing is schematic vertically. Exact sizing is content-driven.
Header: 24px identity gap to summary. Summary: 24px padding and 32px
inter-column gap. Journey: 20px top / 24px sides / 16px bottom. The 1166px inner
map is 240px tall. Five 64px drawings share one ground line; both text rows
share fixed baselines. Road bends remain between stations. A 44px-wide return
branch passes through the gap between the Documents and Loan Submitted labels;
its single-line flag sits below those labels. The journey footer has 12px top
padding. At 720–959px reserve a two-line station-name row and use a 260px map;
art stays 64px. Below 720px the journey uses normal document flow. When the
review URL pins desktop details below a station, the mockup reserves their
measured height, so they do not cover the next view. No fixed card height and no
vertical blank space reserved for an empty track.

### Phone — 390px

```text
┌──────────────────────────────────────┐
│ ☰  BK-9002          AI  Bell  Profile│ 56px top bar
├──────────────────────────────────────┤
│ 16px gutter             16px gutter │ content = 358px
│ B-08-05 · Aster Heights [With Bank] │ Mono 13/18; labels 12/16
│ Mohd Hafiz bin Razak                │ Display/Page 24/32; wrap naturally
│ RM 620,000 · Booked 1 Sep 2026       │ Body/Small 13/18
│                                    │ 16px
│ [Record An Update] [Paste A Message]│ equal columns; 8px gap
│                                    │ 20px
│ ┌────────────────────────────────┐ │
│ │ [bank] Waiting On              │ │ 16px padding
│ │        Crestline Bank’s Decision│ │ Heading/Section 16/24
│ │        Bernard Lim · Banker    │ │
│ │        [Stalled] No update     │ │
│ │                  for 8 days.   │ │
│ │ ────────────────────────────── │ │
│ │ Next Step                      │ │
│ │ Call The Banker    [+ Add Task]│ │
│ │ [Loan Admin]                   │ │
│ │ Tan Mei Ling                   │ │
│ │ What To Do ›     No Open Tasks │ │
│ ├────────────────────────────────┤ │
│ │ Booking Journey      17 Days… │ │
│ │ ●  FORM+KEY   Booked           │ │
│ │ ╰╮            1 Sep 2026       │ │ 72px full-row target
│ │ ◌  FOLDER     Documents        │ │ 40px illustration
│ │ │             Receipt Not      │ │
│ │ │             Recorded         │ │
│ │ ├─ Malayan Trust · Rejected…  │ │ 64px indented branch
│ │ ●  BANK       Loan Submitted   │ │
│ │ │             10 Sep · Resub… │ │
│ │ │             [You Are Here]  │ │
│ │ ◎  OFFER      Loan Approved   │ │
│ │ │             Awaiting Decision│ │
│ │ │  ┌─ Approval Details ─────┐ │ │ in flow; only when expanded
│ │ │  │ Dates, people, evidence│ │ │ pushes later stops down
│ │ │  └───────────────────────┘ │ │
│ │ ○  CONTRACT   SPA Signed      │ │
│ │               Upcoming         │ │
│ │ Select A Milestone For Details│ │
│ └────────────────────────────────┘ │
│ Overview  Messages 4 History 5 Tasks│ 48px sticky tab row; no overflow
│ ━━━━━━━━────────────────────────── │
│ Bank Applications                  │ each bank keeps its full name
│ Crestline / Bernard    [Submitted] │ state right, date below
│ Malayan / Faridah      [Rejected]  │
│ Latest Message          View All › │ original text wraps; no truncation
│ Case Details                       │ team, risk, response; same order
└──────────────────────────────────────┘
```

At 390px: 358px page content; card inner width 324px after borders and 16px
padding. The closed phone roadmap has five 72px rows, a 64px indented branch
after Documents, and 8px extra space before the current stop: 432px total.
Opening a stop adds its natural detail height plus 16px bottom margin. The route
connectors grow with those rows; no absolute y positions are used for phone
stops. Both header actions remain visible. The complete next-action block
precedes the journey. No fixed bottom action bar covers the case. Tapping a
phone stop expands its factual details directly below that stop; desktop hover
and focus open a tooltip below the station.

### Type, Spacing And Breakpoints

| Element                               | Existing Type / Geometry                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Buyer title                           | Display/Page, Geist 600, 24/32, −2% tracking. Never 32px.                                                                      |
| Section / blocker / next-action title | Heading/Section, Geist 600, 16/24, −1%.                                                                                        |
| Body / station names                  | Body/Default 14/20; station name and buttons Label/Default 500.                                                                |
| Metadata / dates / notes              | Body/Small 13/18. Dates retain four-digit year.                                                                                |
| Labels, pills, station sublabels      | Label/Small 12/16, 500. Title Case labels; sentence case for actual prose.                                                     |
| Unit, booking ID, event references    | Mono/Data, Geist Mono 500, 13/18. No Mono hero-size exception.                                                                 |
| Panels / fields                       | 6px radius. Status pills / tooltips 4px. All card surfaces use card border and card shadow.                                    |
| Buttons / targets                     | 36px visible buttons. Journey artwork 64px desktop / 40px phone; phone full row 72px hit area. Tabs 56px desktop / 48px phone. |
| ≤719px                                | Sidebar becomes existing mobile navigation; 16px page gutters; stacked summary; vertical roadmap.                              |
| 720–959px                             | 24px gutters; summary remains two columns; Overview support blocks stack.                                                      |
| 960–1279px                            | 24px gutters; support rail 304px and 16px gap. Bank dates can move to metadata/detail; never hide bank/status.                 |
| ≥1280px                               | Max 1280px container including 32px padding; 344px support rail and 24px gap.                                                  |

## 5. Booking Journey Specification

### Meaning Before Decoration

The journey is **milestones, not percent complete and not five exclusive
workflow stages**. Loan and legal work can overlap. The active marker means “the
milestone we are currently waiting to confirm.” It does not mean that milestone
happened. `aria-current="step"` and the accessible name say this explicitly.

Do not build this from `progressFromKinds` alone. That function is intentionally
a coarse count and paints earlier milestones complete when a later event exists.
The new view model needs individual confirmed events, per-application histories,
outstanding documents, derived case state, reference date and `ballInCourt`. It
is a presentation derivation, not a replacement business rules engine.

### Anatomy — Final Illustrated Roadmap

The road stays gently drawn, but its stations now share one ground line. Both
label rows are aligned for scanning. The rejection branch is a narrow return off
the road, with no stroke passing through a station label.

| Piece             | Final Specification                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Map               | Desktop `viewBox="0 0 1168 240"`, 1166px inner width at 1440. Default height 240px; 260px at 720–959px. Phone uses content height, not a fixed SVG canvas.                                                                                                                                                                                                                                                                                                                                                                                                                |
| Road              | 8px muted road bed; 1.75px foreground travelled centerline; future line 1.5px input, dash 3 / gap 6. Control points move at most 12 SVG units from y=100; actual curve displacement is under 6px. All five stations meet y=100.                                                                                                                                                                                                                                                                                                                                           |
| Station           | A 64×64 SVG at desktop, 40×40 on phone. The five drawings use one 2-unit stroke weight in a 96-unit viewBox (1.33px rendered at 64). No hatch textures. The contour, paper fold and one or two interior details identify the subject.                                                                                                                                                                                                                                                                                                                                     |
| Ground            | One flat ellipse per illustration: `cx=48 cy=89 rx=34 ry=3`, foreground at 7% light / 10% dark. No blur, gradient, filter or ambient shadow. This small ground mark is explicitly sanctioned for this component.                                                                                                                                                                                                                                                                                                                                                          |
| Desktop Alignment | Node centers: x=`104, 320, 558, 804, 1064`, all y=100. Every list item starts at y=32. Artwork 64px high; node follows at −2px margin; name row begins y=124; date/state row begins y=148. Road curves do not change those baselines.                                                                                                                                                                                                                                                                                                                                     |
| Detour            | Branch leaves at `(410,104)`, descends through the clear gap between label blocks, rounds at y=218, and returns at `(454,103)`. Stroke 1px muted foreground, visibly lighter than the main road. The flag is centered at x=432 / y=180, one row: Malayan Trust · Rejected 8 Sep. No separate resubmission line; the submission date already says Resubmitted. At 720–959px the narrow label gutter uses one 1px stem at x=440 instead of two legs; the flag moves to y=202, below the two-line labels. This keeps the branch out of text at the narrow horizontal layout. |
| Phone Flow        | Five 72px full-row buttons; 40px illustration at x=36; route node x=12; label x=92. The 64px indented branch is **inside the Documents list item, after its details and before Loan Submitted**. It uses the same clickable bank flag. A per-row SVG connector stretches to the next row when details expand.                                                                                                                                                                                                                                                             |
| Current Location  | You Are Here above the awaited station; static ink flag with a small pointer. It describes the wait, not achievement. Awaiting Decision remains visible.                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Details           | Desktop: inverse factual tooltip below the station’s label rows, 12px gap, 280px max width, 16px viewport collision padding; flip above only when below will not fit and above will. Phone: one inline disclosure at a time, muted solid fill, default border, 12px padding, 44px left indent.                                                                                                                                                                                                                                                                            |
| Review URL        | `?tip=approved` opens the approval tooltip on desktop or the approval disclosure on phone. `?theme=dark` selects the dark palette. SVG is the sole renderer; no format switch.                                                                                                                                                                                                                                                                                                                                                                                            |

The ink road means the case has reached this part of the journey. **Only a
checked route node means a milestone is confirmed.** Passing Documents does not
assert a receipt. Its dashed folder, dashed unfilled node and Receipt Not
Recorded label remain. The active approval node is unfilled; the letter and
stamp name its subject, not its status.

### All States And Precedence

| State                 | Visual / Words                                                                                                                                                                                    | Data / Behavior                                                                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Done                  | Full ink illustration; filled 12px route node with white/card check; actual date below. Tooltip says Done.                                                                                        | Matching confirmed event. A rejected application is still a completed submission attempt.                                                                                               |
| Current               | Full illustration; unfilled node with double ink ring and You Are Here flag; explicit Awaiting Decision / Collecting Documents / Awaiting Signing.                                                | The next unresolved operational milestone, derived from the case’s current wait. Only one `aria-current`.                                                                               |
| Stalled / overdue     | Current drawing and marker remain ink and still. Current sublabel can use danger text; one Stalled pill and full reason in the summary.                                                           | Use existing stall reasons. Show “Overdue N Working Days” only when there is an actual threshold and that calculation exists. Eight calendar days of silence is not eight overdue days. |
| Upcoming              | Illustration at 40% opacity; unfilled input-outline node; Upcoming in readable muted text. Dashed onward road. No check.                                                                          | No confirmed achievement and not current. Still focusable for details.                                                                                                                  |
| Record Missing        | SVG lines dashed 3.5 / 3 at 68% opacity; dashed unfilled node and explicit Receipt Not Recorded / Date Not Recorded. All text stays fully readable.                                               | Later work exists but direct evidence for this stop is absent. Do not infer a receipt date or “all documents complete.” This can coexist with progress farther ahead.                   |
| Reopened obligation   | Documents station says Documents Outstanding; requirement(s) appear in the summary, even if earlier receipts exist.                                                                               | New confirmed document requests after a receipt. The tooltip retains earlier receipts; the current target follows `ballInCourt`.                                                        |
| Unconfirmed / queried | Excluded from milestone advancement. Message/History retains Unconfirmed, Queried or Replaced.                                                                                                    | All pending/disputed records stay accessible and do not fill the route.                                                                                                                 |
| Cancelled / lapsed    | Freeze achievements; header gets Cancelled / Lapsed pill. Summary says case closed with recorded date, author and reason. Show a small terminal cap at the exit; remaining stops say Not Reached. | No running wait/overdue timer or Add Task. Hide Record An Update, matching current closed-case restrictions. Keep evidence/messages/history access and existing message permissions.    |
| SPA signed            | SPA stop completed, signed label in signed tone; no active target. Summary says SPA Signed with actual date and verifier.                                                                         | `summary.spaSigned`, not merely a later loan-agreement stage. Keep permitted post-SPA Loan Agreement Signed and Disbursed updates.                                                      |

Precedence: confirmed closure or signed SPA resolves the active wait; otherwise
use `ballInCourt` for the owner/action and determine the waiting milestone.
Independently render each achievement’s evidence. Closure does not erase
history. Replaced events cannot advance or rewind the displayed journey. Ties
follow the existing `byOccurred` ordering.

### BK-9002: Exact Stop Details

The frozen case reference date is **18 Sep 2026**, inferred consistently from 1
Sep + 17 days and 10 Sep + 8 days. All fixture timestamps are MYT (+08:00). The
preview must not age itself to the browser’s October date.

| Stop           | Surface                           | Hover / Focus / Tap Details                                                                                                                                                                                                                                                 |
| -------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Booked         | Done; 1 Sep 2026                  | Event `EV-9002-1`; occurred 1 Sep 11:00, recorded 11:05; Nurul Aina reported and verified; note “Booking confirmed”; linked `MSG-9002-1` at 14:10. Two calendar days to first submission. The later message time is not silently made the booking time.                     |
| Documents      | Receipt Not Recorded              | No confirmed `documents_received` event or date. Tan Mei Ling owns the loan paperwork. Buyer’s 1 Sep message mentions payslips and bank statement. Extraction proposes a payslip receipt but has no matching recorded receipt event. Duration is —.                         |
| Loan Submitted | Done; 10 Sep 2026 · Resubmitted   | Crestline, `APP-9002-2`; `EV-9002-4`, occurred 10 Sep 16:15, recorded 16:30; Tan Mei Ling reported and verified; linked Bernard Lim message. First submission: Malayan Trust, 3 Sep 10:00; rejection 8 Sep 11:20, five calendar days; resubmission two calendar days later. |
| Loan Approved  | Current target; Awaiting Decision | No approval date. Bernard Lim at Crestline holds decision; Tan Mei Ling follows up. Last confirmed event 10 Sep. Eight calendar days since second submission; stall reason is No Update For 8 Days. Do not label it approved or nine working days late.                     |
| SPA Signed     | Upcoming                          | No appointment, signing date or legal event. Assigned firm Zainal & Co. Reporter, verifier and duration — until recorded. Legal activity can still be logged before bank approval.                                                                                          |

### Loops And Parallel Applications

Treat each bank application as an attempt, not as a new sixth milestone. For
this case, the ordered story is **Malayan Trust submitted → rejected → Crestline
submitted → awaiting decision**. Draw a real detour attached to the submission
road, with its bank/date flag on the loop. Keep the original rejected bank
visible in Overview. Desktop path departs at x=410, turns at y=218 and returns
at x=454, both before the submission station. Both legs run through the gap
between labels. On phone the branch occupies its own indented row between
Documents and Loan Submitted, after any open document details. A small return
arrow makes the attempt sequence clear without suggesting another stage. Do not
rewind Booked or silently replace the bank name.

For up to three parallel applications, list each independently, active first.
The route says “2 Applications With Banks” if two are pending; it must not call
parallel submissions a resubmission unless the event sequence supports it. For
repeated rejections, use one aggregate detour and a flag reading “2 Rejections ·
1 Application With Bank”; opening it reveals all attempts. Never add an extra
illustrated station per bank. Multiple concurrent pending banks do not receive a
rejection loop unless a confirmed rejection exists. The shortcut opens the full
attempt list. One bank’s rejection never closes the booking or makes an approved
application disappear.

After all banks reject, keep their completed submission history and move the
action to the developer’s next step from `ballInCourt`; display “Another Bank
Needed” at the submission target. A buyer withdrawal uses the existing
release-review state until an actual cancellation/lapse is confirmed. Do not
draw a terminal cap for one bank rejection or a proposed withdrawal.

### Tooltip, Focus And Motion

Desktop Journey Tooltip uses the inverse surface, 280px maximum width, 12px
padding, Body/Small and no arrow. It contains factual rows with no controls.
Position below the complete station label block with a 12px gap; clamp to 16px
from the viewport edges. Flip above only when there is insufficient room below
and sufficient room above. Production uses the existing Radix `TooltipContent`
with `side="bottom"`, `sideOffset={12}`, `collisionPadding={16}` and collision
avoidance. This changes only journey tooltips, not global tooltip defaults.

Tab reaches each station button. On desktop, focus opens immediately and hover
waits 300ms; hovering the tooltip keeps it open, including across the 12px
pointer bridge. Escape dismisses without moving focus. The separate rejection
flag opens Loan history and **must not trigger the Documents tooltip** merely
because it sits in that list item. Clicking can pin the detail; outside tap or
Escape dismisses it. Position is updated on scroll and resize. `?tip=approved`
pins details on load without moving focus. The mockup reserves the pinned
panel’s height under the road for a clear review screenshot; normal hover
remains an overlay and does not reflow the page.

Below 720px, tapping or pressing Enter/Space on a station toggles a single
inline disclosure directly below its 72px row. The button has `aria-expanded`
and `aria-controls`; its factual panel has `role="region"` and `aria-labelledby`
referencing the trigger. Remove `aria-describedby`/`role="tooltip"` in this
mode. One panel is open at a time. Focus alone does not expand it. Escape closes
it and leaves focus at the trigger. Outside taps do not collapse inline content.
The panel uses muted/card ledger styling, rather than a floating inverse block.
It grows normally and pushes every later station and the view tabs down. On
breakpoint changes, preserve the selected stop while switching the presentation
and ARIA semantics.

The ordered list contains exactly five milestones. Illustrations, ground marks
and route paths are `aria-hidden`. The detour is part of Documents’ list item
after its disclosure, so keyboard and reading order match the phone layout. No
dates, blockers, deadlines or required action exist only in these supplementary
details.

On first load only, draw the already-travelled centerline once over 560ms with
ease-out (hard maximum 600ms), using normalized `pathLength=1` and
stroke-dashoffset 1→0. Its endpoints and state are final from first paint; this
is an entrance, not simulated operational progress. Do not replay it on hover,
tab changes or opening a panel. `prefers-reduced-motion: reduce` disables the
entrance completely and renders the final route immediately. Marker, artwork,
detour and future road remain static. Interaction opacity changes may use 120ms.
Never pulse, bounce or loop. On a saved update, change the specific affected
state and announce a brief `aria-live="polite"` sentence. The floating panel
uses 250ms entry; reduced motion removes translation and keeps at most a 120ms
fade.

### Exact Visual Assets — Chosen Ink Family

**Choose the ink-drawing direction, rendered as inline SVG in production.**
Round 2 used the image generation tool to create a three-direction board: Ink
Engravings, Flat Duotone and Matte Objects. The first direction best fits the
ledger: it gives each milestone a tangible subject while remaining monochrome.
The duotone direction makes low-value objects too emphatic; matte clay imports a
lighting/material system the rest of Mortar does not use. The selected final
drawings simplify the board’s line work and remove its background, lettering and
ambient shadows.

The final five are hand-drawn inline SVG, refined for 64px. They use one 2-unit
stroke in a `0 0 96 96` viewBox, round joins/caps, clean paper planes and sparse
interior lines. Booked pairs a form with a key and unit tag. Approved pairs a
letter of offer with a physical rubber stamp; it has no completed-approval
check. The other subjects are a document folder, a three-column bank and a
signed agreement with a pen. All share comparable bounds and the same faint
grounding ellipse. No raster milestone assets ship.

**Avoid the class name `outline`.** Tailwind defines `.outline` as a CSS outline
utility. In Round 2 it drew rectangles around individual SVG path bounds, making
the illustrations look overprinted. Final artwork classes are scoped:
`journey-art-line`, `journey-art-paper`, `journey-art-shade`,
`journey-art-ground`. Every SVG line is stroke-width 2; state comes from the
wrapper, route node and explicit label.

| Subject                                       | Light SVG                    | Dark SVG                                | Size                             |
| --------------------------------------------- | ---------------------------- | --------------------------------------- | -------------------------------- |
| Booking form, key and unit tag                | `assets/booked-light.svg`    | `assets/booked-dark.svg`                | 64×64 intrinsic; 96×96 viewBox   |
| Document folder                               | `assets/documents-light.svg` | `assets/documents-dark.svg`             | Same                             |
| Bank                                          | `assets/submitted-light.svg` | `assets/submitted-dark.svg`             | Same                             |
| Letter of offer and stamp                     | `assets/approved-light.svg`  | `assets/approved-dark.svg`              | Same                             |
| Signed agreement and pen                      | `assets/signed-light.svg`    | `assets/signed-dark.svg`                | Same                             |
| Three-direction concept board, reference only | `assets/style-board.png`     | No dark board; never loaded by the page | 1536×1024                        |
| Generation provenance                         | `assets/image-generation.md` | Theme-independent text                  | Exact prompt and final selection |

The handoff contains **12 asset files**: ten SVG exports and two reference
files. The ten previous milestone PNGs are deleted. The mockup embeds the five
adaptive SVG bodies, using semantic CSS variables for both themes. Light/dark
exported files are standalone review assets; production uses one theme-adaptive
component per subject, not ten components. Render at 64px desktop and 40px
phone. The generated PNG style board remains documentation only.

| Plane              | Light                      | Dark                                           |
| ------------------ | -------------------------- | ---------------------------------------------- |
| Ink / main outline | Foreground `#0A0A0A`       | Foreground `#FAFAFA`                           |
| Paper              | Card `#FFFFFF`             | Card `#141414`                                 |
| Quiet plane        | Muted `#F5F5F5`            | Ink/800 `#262626` (existing neutral primitive) |
| Fine detail        | Muted foreground `#6B6B6B` | Muted foreground `#A1A1A1`                     |

Dark SVG exports use the deliberate token palette; inline SVG recolors from the
same variables. The low-opacity Signed illustration identifies an upcoming
contract; the full-color label still says Upcoming. The approval stamp is a
subject drawing, not proof of approval. A completed node always requires the
existing confirmed-event rule.

For closed cases, terminate the travelled route immediately after the last
reached node with a 12px cross-road ink cap; remove You Are Here and stop
elapsed-wait wording. Retain the future road and quiet illustrations with Not
Reached labels. The Cancelled / Lapsed reason and timestamp stay in the summary.
No illustration changes into a red failure mascot; cancellation is a case state,
not a failed bank attempt.

## 6. Component Specifications

These entries use DESIGN.md’s Purpose / Anatomy / States And Tokens / Rules
structure.

### Case Header — Revised

- **Purpose:** Identify the record and expose the two ways staff add
  information.
- **Anatomy:** Unit in Mono/Data and project in Body/Small; stage pill; buyer
  Display/Page 24/32; price/date Body/Small. Right-aligned pair of 36px
  Secondary buttons. 24px separation from summary.
- **States And Tokens:** Existing stage tones. Long names wrap. Closed cases
  retain identity and replace current-state wording. Use `.case-header h1` at
  24px/32px, weight 600: class specificity must win over the CDN/reset’s
  `h1 { font-size: inherit }` rule. Unit and stage remain on the line above,
  price/date below. Error refresh banners keep the last good data visible.
- **Rules:** No owner paragraph, repeated stall sentence or 32px title. Keep the
  production header’s outstanding-document functionality in the summary, not in
  hidden details. Currency in a header sentence uses tabular numerals; numeric
  ledger columns remain right-aligned.

### Case Summary — Revised WaitingOnPanel

- **Purpose:** Answer who holds the case, what they owe, and who must act
  internally.
- **Anatomy:** One Card. First row: two equal areas, 24px padding, 32px gap.
  Left has 40px neutral bank plate and wait text. Right has next-step label,
  16/24 action, Role Label, Add Task, What To Do and open-task count. Journey is
  the lower region, separated by a 1px border.
- **States And Tokens:** Stalled uses a danger pill and the actual reason.
  Normal wait uses neutral prose. An outstanding document uses warning only for
  the obligation. Add Task follows existing idle / adding / added / error
  behavior.
- **Rules:** `nextStepFor` and `stepToTask` remain the sources. In the API
  implementation, prevent duplicate submissions while adding; show an existing
  matching open task rather than creating duplicates. A differing AI alternative
  remains one muted sentence, attributed to Mortar AI, with a Secondary “Use
  This Action” control. Do not make it a second large recommendation card. On
  phones, the person’s name sits below the Role Label rather than disappearing.

### Booking Journey — New Full Variant

- **Purpose:** Explain achieved, awaited and unrecorded milestones, including
  bank attempts.
- **Anatomy:** Five 64px illustrated stations with aligned name/date baselines,
  a low-amplitude road, a static You Are Here flag, semantic nodes, and the
  narrow pre-submission detour. Phone details expand in flow. No boxed icon
  plates or renderer switch.
- **States And Tokens:** Done / Current / Stalled / Upcoming / Record Missing /
  Reopened / Closed / Signed. Ink paths; status words use the existing tones.
- **Rules:** Compact table tracker remains unchanged. No percentages. Never
  convert the highest achieved milestone into fictitious dates or receipts at
  earlier stops.

### Case Views — New

- **Purpose:** Separate work modes without removing access to the record.
- **Anatomy:** Overview / Messages N / History N / Tasks N. Label/Default 14/20
  desktop; Body/Small 13/18 medium weight on phones. 2px ink active underline,
  56px desktop / 48px phone row. Sticky below 56px app bar. Neutral 12/16
  counts.
- **States And Tokens:** Active ink; inactive muted; focus standard ring. If
  real pending proposals exist, Messages gains an explicit “N To Review” notice
  in the summary linking directly to them; do not hide an obligation behind an
  unlabeled dot.
- **Rules:** ARIA tablist/tabs/panels, one tab in the keyboard sequence;
  Left/Right/Home/End move and activate. No reload on tab selection. Focused
  controls cannot be covered by sticky chrome. Counts are authoritative, not
  inferred from cached extractions.

### Bank Applications — Revised

- **Purpose:** Show each bank’s current position and make the fallback attempt
  understandable.
- **Anatomy:** One card with 20px vertical / 24px horizontal header, 24px
  horizontal row padding. 80px minimum two-line rows; date/elapsed column
  right-aligned; status at right. Active applications precede rejected/withdrawn
  attempts. Phone rows use explicit grid placement: bank identity column 1 / row
  1, status column 2 / row 1 with `justify-self:end`, `align-self:start`,
  `width:max-content`; date/elapsed metadata column 1 / -1, row 2. Use 12px
  vertical padding and 4px row gap. Status never stretches across the full row.
- **States And Tokens:** Submitted info, Documents Pending warning, Approved
  positive, Rejected danger, Withdrawn neutral. No row tint.
- **Rules:** Derive from `summary.applications`, join labels/contact by
  application ID. Joint Application in this fixture is supported by the banker’s
  message, not a structured field. In production distinguish source-derived
  detail from confirmed update facts; do not make a new persisted application
  type for this label. Keep all parallel applications and full bank names. A
  total of zero uses No Applications Yet.

### Case Details — New Grouping

- **Purpose:** Keep team, financing and buyer context available without three
  extra cards.
- **Anatomy:** 344px desktop rail, 24px padding; 20px vertical separation with
  hairlines. Team is a two-column definition list. Financing Risk uses existing
  RiskChip; Buyer Response uses existing signal semantics.
- **States And Tokens:** Risk at low / medium / high. Buyer response has known /
  reading / unavailable / stale / needs review. No green positive reading when
  there is no buyer-message input.
- **Rules:** Show source attribution once per response block. Keep actual risk
  figures in the tooltip: on fixture defaults repayments 58% of income, 90%
  financing margin, estimated monthly repayment RM 2,571, tenure 34 years. These
  are calculated screening values, not the bank’s underwriting result. Source is
  `financingRiskFor` with the fixture and default assumptions. Preserve
  warning/error explanation when AI did not check.

### Messages And Proposal Review — Revised

- **Purpose:** Let staff compare a raw message with a proposed event and decide.
- **Anatomy:** Newest-first messages with sender, role, sent timestamp and full
  original text. A 1px separator introduces the Mortar AI reading, document,
  owner and verbal certainty. Review actions sit immediately underneath; no
  nested gray card for every settled reading.
- **States And Tokens:** Pending shows Confirm (Secondary), Dispute and Dismiss
  (Ghost). Queried keeps Confirm and Dismiss. Confirmed shows status/verifier;
  Replaced is muted. Confidence below `JEV_REVIEW_THRESHOLD` adds Needs Review.
  No-update reading is one line.
- **Rules:** Keep the current `currentProposal` matching by message, kind and
  document. **For BK-9002, only Faridah’s rejection has a matching confirmed
  proposal event. The other three cached readings do not have corresponding
  receipt/rejection proposal events.** Show Not Recorded, offer rerun and Record
  An Update; do not fabricate three pending proposals or enable Confirm on a
  nonexistent event. Retain conflict refresh, errors and per-message mutual
  exclusion of rerun/review. Sender role for Tan Mei Ling’s historical message
  remains Sales Agent because that is what the fixture records, even though her
  assigned desk is Loan Admin.

### Case History / Tracks — Consolidated

- **Purpose:** One complete auditable story, optionally narrowed to a desk.
- **Anatomy:** Default All Tracks, optional Loan / Legal / Sales filters.
  Newest-first entries, each showing event, occurrence, full note, reporter,
  verifier, recorded-at, source, review state, application/message references.
  Minimum 44px for compact rows; expanded records size to content.
- **States And Tokens:** Confirmed is quiet but labeled; Unconfirmed warning,
  Queried danger, Replaced neutral. Legal empty state is one short section,
  never a reserved half-page.
- **Rules:** Every record appears when History opens. A filtered track can be
  changed in the same view. Do not truncate notes in the only full-history
  representation. A duplicate occurrence time is resolved with existing
  ordering. Keep original notes intact rather than rewriting audit evidence for
  copy polish.

### Floating Case Panel — New Shared Variant

- **Purpose:** Keep forms, guidance and longer milestone details in the current
  case context.
- **Anatomy:** Bottom centered; inset 16px; max width 720px; max height
  `calc(100dvh - 32px)` with safe-area allowance; solid card fill; 6px radius;
  Overlay shadow; existing scrim and 3px scrim blur. 24px desktop / 16px phone
  content padding. Fixed panel header has unit/ID, title and Close.
- **States And Tokens:** 250ms rise with opacity, no bounce. Reduced motion
  removes rise. Busy save prevents duplicate writes. Error remains beside the
  form and retains entered values. Form submit becomes the one Primary action
  while background is modal/inert.
- **Rules:** Reuse the new quick-view bottom-panel primitive described in the
  brief, rather than the current repository side-sheet geometry. Reuse the Sales
  Chart island’s inset/alignment, **not** translucent glass. Trap focus;
  background inert; Escape/backdrop/Close dismiss and return focus to the
  opener. Destructive update confirmation retains the existing explicit warning
  and Cancel focus. Date/select controls remain Mortar components in production.

### What To Do — Revised Placement

- **Purpose:** Provide reviewed instructions at the moment an action is chosen.
- **Anatomy:** Floating panel with visible Search Guidance label, 36px search
  input/action, the top match fully expanded, fit pill and Situation / Action /
  Limits. Show N More reveals full remaining guidance without navigation.
- **States And Tokens:** Applies positive; May Apply warning; Does Not Apply
  neutral; draft/retired/replaced labels preserved. Loading, no results and
  unavailable reads use plain text.
- **Rules:** Retain current-blocker query and existing stale-ranking fallback to
  keyword matches. Do not show prior-fit badges as current after the blocker
  changes. For BK-9002, PB-021 remains May Apply; nine-working-day escalation
  and acknowledged-complete documents are conditions, not established facts
  about this case.

## 7. Exact DESIGN.md Amendments

The final, paste-ready replacements are consolidated in **section 10C**. They
supersede the earlier A1–A5 wording. The scoped changes are: one assistant name;
the full case illustration, ground mark and motion exception; desktop details
below / phone details inline; the case canvas, header and views; and reuse of
the existing floating Sheet. Compact table trackers and the quick-view strip
stay outside the illustration exception.

## 8. Copy And Branding Audit

### Case Copy Decisions

| Current                                                                             | Proposed                                                                                       |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| B-08-05 · Mohd Hafiz bin Razak as one 32px title                                    | Unit on a metadata line; buyer alone at 24/32.                                                 |
| With Bank · Waiting On Crestline Bank To Decide On The Loan · 17 Days Old · Stalled | With Bank pill; wait/action block; 17 Days Since Booking in journey heading.                   |
| Waiting For Crestline Bank To Decide On The Loan.                                   | Crestline Bank’s Decision, under Waiting On.                                                   |
| No Update For 8 Days as a second danger pill                                        | “No update for 8 days.” beside Stalled.                                                        |
| Loan Approved highlighted as if reached                                             | Loan Approved / Awaiting Decision.                                                             |
| No Events Yet. in empty Legal column                                                | No Legal Updates Yet, inside History’s Legal view.                                             |
| Case History / Show Full History (5)                                                | History 5; full history opens immediately.                                                     |
| Jev’s repeated status at each reading                                               | Mortar AI Suggests; certainty stays local to the reading.                                      |
| Jev Is Sure / Fairly Sure / Not Sure                                                | Mortar AI Is Sure / Mortar AI Is Fairly Sure / Mortar AI Is Not Sure.                          |
| No Signal Read Yet.                                                                 | Buyer Response Has Not Been Checked Yet.                                                       |
| Responsiveness Confidence 98% · Hesitation Confidence 100%                          | “Mortar AI is sure about reply speed and commitment.” Keep existing numerical data internally. |
| Do That Instead                                                                     | Use This Action.                                                                               |

Dates, names and original messages keep their own case. Preserve raw quoted
messages, including “DSR” and “Credit underwriting,” rather than rewriting
evidence. Translate technical wording in UI summaries only. Labels use Title
Case; sentences in tooltips/toasts use sentence case with a full stop.

### Every User-Facing Jev Occurrence Found In UI Source

Line numbers are from the inspected checkout; paths remain the authoritative
handoff. Internal names and comments are not UI renames.

| File                                                         | Occurrences / Exact Replacement Direction                                                                                                                                                                               |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `frontend/src/components/bookings/MessagesPanel.tsx:38–40`   | Three certainty outputs → Mortar AI Is Sure / Is Fairly Sure / Is Not Sure.                                                                                                                                             |
| `frontend/src/components/bookings/MessagesPanel.tsx:118`     | Jev Suggests: → Mortar AI Suggests:.                                                                                                                                                                                    |
| `frontend/src/components/bookings/MessagesPanel.tsx:206–208` | Toast → “Mortar AI checked this message again.” Asking Jev… / Ask Jev Again / Ask Jev → Asking Mortar AI… / Ask Mortar AI Again / Ask Mortar AI.                                                                        |
| `frontend/src/components/bookings/MessagesPanel.tsx:222`     | Jev Has Not Looked At This Yet. → Mortar AI Has Not Checked This Message Yet.                                                                                                                                           |
| `frontend/src/components/bookings/WaitingOn.tsx:257`         | Jev Suggests: … Instead → Mortar AI Suggests: …; secondary Use This Action.                                                                                                                                             |
| `frontend/src/components/bookings/EvidenceLog.tsx:31`        | Source label `jev: 'Jev'` → `jev: 'Mortar AI'`. Keep the stored source value.                                                                                                                                           |
| `frontend/src/components/bookings/PlaybooksPanel.tsx:155`    | Jev’s Ranking May Be Out Of Date — Keyword Matches For… → “Mortar AI’s suggestions may be out of date. Showing matches for ‘…’.”                                                                                        |
| `frontend/src/components/bookings/TasksPanel.tsx:64`         | Visible origin Jev → Mortar AI. Keep `origin === 'jev'`.                                                                                                                                                                |
| `frontend/src/components/case/JevTag.tsx:24`                 | Tooltip and accessible copy → “Mortar AI read this before the latest update. Ask Mortar AI again to refresh.”                                                                                                           |
| `frontend/src/components/case/JevTag.tsx:28–29`              | Jev Could Not Check / Jev Checked Just Now → Mortar AI Could Not Check / Mortar AI Checked Just Now.                                                                                                                    |
| `frontend/src/components/case/SignalChips.tsx:28`            | Source tooltip → “Mortar AI’s reading of this buyer’s messages: reply speed and any doubts. Add messages to update it.”                                                                                                 |
| `frontend/src/components/chase/ChaseCard.tsx:144`            | Alternative-action prefix → Mortar AI Suggests:.                                                                                                                                                                        |
| `frontend/src/components/chase/ChaseCard.tsx:198,205`        | aria-label Ask Jev Again, loading Asking Jev…, tooltip Ask Jev Again. Jev Checked Earlier. → corresponding Mortar AI strings; tooltip sentence case.                                                                    |
| `frontend/src/pages/ChasePage.tsx:256,258`                   | “Jev is unavailable…” / Could Not Reach Jev → “Mortar AI could not check. The usual next step is shown.” / “Could not reach Mortar AI. Try again.”                                                                      |
| `frontend/src/components/settings/DemoDataCard.tsx:60`       | Jev Answers → Mortar AI Answers.                                                                                                                                                                                        |
| `frontend/src/components/settings/HealthCard.tsx:40,47`      | Tooltip Jev fallback name → Mortar AI; row Jev → Mortar AI Readings; provider-key explanation → “Whether message readings are configured.”                                                                              |
| `frontend/src/pages/FaqPage.tsx:42,53,55,57`                 | All Jev mentions → Mortar AI; What Does Jev Do? → What Does Mortar AI Do? Preserve the person-confirms boundary. Rewrite “forecast is statistics, not Jev” as “The forecast is calculated from recorded case outcomes.” |
| `frontend/src/components/landing/LandingFaq.tsx:32,36,38,39` | Same FAQ replacements as above, including every repeated mention inside answer strings.                                                                                                                                 |
| `frontend/src/components/landing/HowItWorks.tsx:29,38–40`    | Jev’s suggested action, read by Jev, Jev’s proposed reading in alt text, and image caption → Mortar AI equivalents.                                                                                                     |
| `frontend/src/components/landing/Pricing.tsx:16`             | Jev proposals, each confirmed by a person → “Mortar AI proposals, each confirmed by a person”.                                                                                                                          |
| `frontend/src/components/landing/WhyMortar.tsx:47,50`        | Jev Proposes. People Decide. → Mortar AI Proposes. People Decide.; body Jev reads → Mortar AI reads.                                                                                                                    |
| `frontend/src/tour/tourSteps.ts:108,114`                     | Jev’s alternative / message here for Jev to read → Mortar AI’s alternative / message here for Mortar AI to read.                                                                                                        |

`AddMessageForm`, `SignalsPanel` and `PlaybooksPanel` also render the shared
`JevTag`; changing its labels covers those occurrences. `TrackTimelines` and
`EvidenceLog` consume `displayNote` from MessagesPanel; updating `certainty()`
covers their generated confidence wording. `BookingDetailPage`, `CaseQuickView`,
`RecordUpdateForm`, `nextStep.ts` and `case/index.ts` contain internal Jev
references but no additional directly rendered Jev string beyond these shared
components.

### Gemini And MortarAI Spelling

| File                                                         | Required Change                                                                                                                                                                                          |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `frontend/src/components/settings/HealthCard.tsx:51`         | Visible tooltip “Whether A Gemini Key Is Configured” → “Whether assistant answers are configured.” Row Ask MortarAI → Ask Mortar AI. This is the user-facing Gemini mention found in the UI source scan. |
| `frontend/src/components/brain/AskPanel.tsx:295`             | Dialog title Ask MortarAI → Ask Mortar AI.                                                                                                                                                               |
| `frontend/src/components/brain/AskTrigger.tsx:66,73`         | aria-label and tooltip Ask MortarAI → Ask Mortar AI.                                                                                                                                                     |
| `frontend/src/components/forecast/ForecastDocuments.tsx:155` | Action label Ask MortarAI → Ask Mortar AI.                                                                                                                                                               |
| `frontend/src/lib/api.ts:281`                                | Error → “Mortar AI could not check. Try again.”                                                                                                                                                          |
| `frontend/src/pages/FaqPage.tsx:56`                          | Ask MortarAI in explanation → Ask Mortar AI.                                                                                                                                                             |
| `frontend/src/tour/tourSteps.ts:26,29,84,87,144,147`         | All tour labels and captions Ask MortarAI → Ask Mortar AI.                                                                                                                                               |

Do not rename service directories, JSON keys, `JevMeta`, stored `origin`, API
routes, internal function names, cache fixtures or imports as part of this
visual task. Update UI assertions and run a case-insensitive rendered-string
audit, including tooltips, alt text and ARIA labels. Server-supplied error text
and assistant fallback answers also need a presentation-boundary audit before
claiming the whole product is free of provider names; the table above covers the
inspected UI source.

## 9. Data Integrity And Acceptance

Source of case identity, applications, original messages and five confirmed
events: `packages/core/src/fixtures/stories.ts`, BK-9002, lines 128–286. Source
of the four AI readings and buyer response: `server/fixtures/jev-cache.json`,
records with subject IDs MSG-9002-1 through MSG-9002-4 and BK-9002. Source of
top guidance: `packages/core/src/fixtures/playbooks.ts`, PB-021. Risk values
were checked by executing `financingRiskFor` against the actual fixture and
default assumptions. Reference date and zero tasks are frozen to the supplied
screenshots.

### Review Checklist

| Check                     | Pass Condition                                                                                                                                                                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| First five seconds        | A reviewer can name Crestline, the eight-day silence, Call The Banker and Tan Mei Ling without opening anything.                                                                                                                                                                                                         |
| Honest journey            | No document-receipt date/check fabricated; no loan approval claimed; rejected bank remains in history; reference date does not use wall clock.                                                                                                                                                                           |
| Daily reach               | Record, paste, task creation and guidance each open in one click; messages, complete history and tasks each use one tab. All track events visible on opening History.                                                                                                                                                    |
| Review safety             | Confirm / Dispute / Dismiss only target a real matching eligible event. Low-certainty and concurrency/refusal states remain. No AI proposal advances the route without confirmation.                                                                                                                                     |
| Accessibility / rendering | Desktop 1440 and 1280; phone 390 and 320; keyboard tab/arrow/Escape; tooltip hover/focus persistence; modal focus return; no horizontal page overflow; reduced motion; 200% zoom. Verify both light and dark themes, aligned labels, a non-crossing branch, desktop bottom/flip positioning and expanding phone details. |

### Artifact Scope

`mockup.html` contains the real case content and local interactions for tabs,
track filters, full records, tooltips, a floating guidance panel, forms and an
in-memory task. No action writes to Mortar. Form controls inside the preview
demonstrate layout; production must reuse the complete existing RecordUpdateForm
/ AddMessageForm, including every field and event kind. The seeded case has no
actionable pending proposal, so the preview does not invent one to showcase
review buttons; their exact placement and states are specified above.

### Round 3 Preview Controls And Verification

Open `mockup.html?tip=approved` for light mode with approval details open. Use
`mockup.html?theme=dark&tip=approved` for dark. Desktop details prefer below;
phone details expand inline. SVG is the only artwork renderer. The `assets`
query parameter is no longer used.

The supplied Round 2 screenshots verified the header and bank-row fixes and
exposed the label alignment, tooltip placement and SVG class collision addressed
in this round. Local browser rendering remains unavailable: the browser
connector requires unavailable approval, and the local headless browser fails
its sandbox-host check. New browser screenshots are still required; structural
checks are not a substitute for rendered layout and
keyboard/assistive-technology verification.

Round 3 verification passed **12 structural/interaction checks** covering five
SVG stations, private artwork classes, valid IDs/ARIA, branch placement/order,
real data, retained actions, theme/query presets, inline toggle behavior,
breakpoint state transfer, Escape, bottom/flip/clamp logic, shared label offsets
and reduced motion. All ten SVG files parse at 64×64 with the common 96×96
viewBox and 2-unit stroke. The PNG milestone set is absent; the 12-file manifest
matches disk. The proposed TypeScript contract was extracted from this document
and passed `tsc --noEmit --strict` against the actual domain types. This
validates the contract only; the production function and its table-driven tests
are implementation work. Final HTML/Markdown pass Prettier. The light/dark
artwork was visually inspected as vector exports; browser pixel layout remains
unverified.

## 10. Build Plan

### 10A. Pure View Model And Evidence Rules

Implement `frontend/src/components/bookings/bookingJourney.ts`. This is a
frontend presentation derivation over the existing domain contract, not a new
stage engine. Read `CaseSummary`, `CaseEvent` and `LoanApplication` from
`@mortar/core`; use `ballInCourt` and exported `byOccurred`. Do not use
`progressFromKinds`, `STAGE_PROGRESS` or the highest event rank to fill earlier
stops.

The input deliberately includes **`booking: Booking`**: `CaseSummary` does not
contain sales/loan owner names, legal firm or booking date. `LoanApplication`
has `id`, `bookingId`, `bank`, `banker` and **no status or dates**. Application
statuses come from `summary.applications`; submission/decision dates come from
confirmed events. These distinctions are required by
`packages/core/src/types.ts` and the current `WaitingOn.tsx` implementation.

Return one model rather than only a stop array. Closure, attempt history, the
branch and a release review belong to the whole journey. The `declare` below
specifies the implementation contract; it does not claim an implementation
already exists.

```ts
import type {
  ApplicationStatus,
  Booking,
  CaseEvent,
  CaseSummary,
  DocumentKind,
  IsoDate,
  IsoDateTime,
  LoanApplication
} from '@mortar/core'

export type JourneyStopId =
  'booked' | 'documents' | 'loan_submitted' | 'loan_approved' | 'spa_signed'

// Evidence/obligation and the current wait are independent dimensions.
export type JourneyStopState =
  'done' | 'upcoming' | 'record_missing' | 'outstanding' | 'not_reached'

export type JourneyEvidence = Pick<
  CaseEvent,
  | 'id'
  | 'kind'
  | 'applicationId'
  | 'occurredAt'
  | 'recordedAt'
  | 'reportedBy'
  | 'verifiedBy'
  | 'messageId'
  | 'document'
  | 'note'
>

export interface JourneyDuration {
  kind: 'completed' | 'elapsed'
  from: IsoDate
  through: IsoDate
  calendarDays: number
}

export interface JourneyStop {
  id: JourneyStopId
  label: string
  state: JourneyStopState
  current: boolean
  stalled: boolean
  // Prior receipt exists, and documents are outstanding again.
  // This does not assert that the same named file was requested twice.
  reopened: boolean
  confirmedAt: IsoDateTime | null
  caption: string
  responsible: readonly string[]
  outstandingDocuments: readonly DocumentKind[]
  evidence: readonly JourneyEvidence[]
  duration: JourneyDuration | null
  facts: readonly { label: string; value: string }[]
}

export interface JourneyApplication {
  applicationId: LoanApplication['id']
  bank: string
  banker: string | null
  // Read CaseSummary.applications. Null means absent, not Submitted.
  status: ApplicationStatus | null
  submitted: JourneyEvidence | null
  decision: JourneyEvidence | null
  duration: JourneyDuration | null
}

export interface JourneyRejection {
  applicationId: LoanApplication['id']
  bank: string
  rejection: JourneyEvidence
  // Only a different application submitted after this rejection qualifies.
  nextSubmission: {
    applicationId: LoanApplication['id']
    evidence: JourneyEvidence
  } | null
}

export interface JourneyDetour {
  id: 'bank-rejections'
  attachBefore: 'loan_submitted'
  flag: string
  rejections: readonly JourneyRejection[]
  target: { view: 'history'; track: 'loan' }
}

export interface BookingJourneyModel {
  bookingId: Booking['id']
  referenceDate: IsoDate
  resolution: 'open' | 'signed' | 'cancelled' | 'lapsed'
  releaseReview: boolean
  // Exact fixed order: booked, documents, submitted, approved, signed.
  stops: readonly [
    JourneyStop,
    JourneyStop,
    JourneyStop,
    JourneyStop,
    JourneyStop
  ]
  applications: readonly JourneyApplication[]
  detour: JourneyDetour | null
  // The road's location, independent of which earlier nodes have proof.
  routeThrough: JourneyStopId | null
  closure: {
    kind: 'cancelled' | 'lapsed'
    evidence: JourneyEvidence | null
  } | null
}

export interface BookingJourneyInput {
  booking: Booking
  summary: CaseSummary
  events: readonly CaseEvent[]
  applications: readonly LoanApplication[]
  referenceDate: IsoDate
}

// Signature to implement in frontend/src/components/bookings/bookingJourney.ts.
export declare function bookingJourney(
  input: BookingJourneyInput
): BookingJourneyModel
```

**Deterministic input boundary.** The page passes booking, summary, events,
applications and `snapshot.meta.referenceDate` from one snapshot. Require
`booking.id === summary.bookingId`; reject mismatched inputs in development
rather than merge cases. Filter events/applications to that booking. Accept
events only when `status === 'confirmed'` and both `occurredAt.slice(0, 10)` and
`recordedAt.slice(0, 10)` are on/before `referenceDate`, matching `deriveCase`.
Sort a copy with `byOccurred`; never mutate supplied arrays. The existing
comparator uses occurrence, `seq`, recording time and ID. Ignore provisional,
disputed and superseded records for route state; History still shows all of
them.

**Calendar arithmetic.** No `Date.now()`, browser timezone or network access.
Derive calendar dates with the same date-prefix convention as core. Subtract UTC
day ordinals of those date-only strings for durations; do not subtract timestamp
milliseconds and round across local timezones. `diffDays`/`dateOf` live under
`packages/core/src/sim/dates.ts` and are not public exports; do not deep-import
them from frontend. A tiny local date-only helper with equivalent behavior is
sufficient; its tests cover month boundaries. Return null for an unknown start
date, not zero. This model does not calculate working-day overdue thresholds.
`stalled` and reasons come from `ballInCourt(summary)` / `summary.stallReasons`.

| Stop           | Matching Evidence / Display Date                                                                                                                                                                                                 | Visible State And Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Booked         | First eligible `booked`; actual occurrence timestamp.                                                                                                                                                                            | Done only with that event. `booking.bookingDate` can remain header metadata; it never becomes a fabricated verified event. Sales owner is `booking.salesOwner`.                                                                                                                                                                                                                                                                                                            |
| Documents      | All eligible `documents_requested` / `documents_received`; latest receipt as `confirmedAt`, if any.                                                                                                                              | A receipt means a receipt was recorded, not that every document is complete. Outstanding named documents come from summary; unnamed requests are represented by application `documents_pending`. With outstanding documents, state is Outstanding and caption Documents Outstanding. If a prior receipt exists, `reopened=true`; retain its proof. With later confirmed progress but no receipt, Record Missing / Receipt Not Recorded. Loan owner is `booking.loanOwner`. |
| Loan Submitted | One earliest `loan_submitted` per application, ordered with `byOccurred`; use the latest such event among live submitted/documents-pending applications, otherwise the latest confirmed submission. Keep all attempts in detail. | A rejected attempt still proves a submission happened. Use Resubmitted only when a **different** application's confirmed rejection precedes the displayed submission. Concurrent live banks show the count, never a fictitious resubmission. Unlinked submission events can prove the milestone but cannot invent an application or banker.                                                                                                                                |
| Loan Approved  | First eligible `loan_approved` as date; retain all confirmed approval evidence.                                                                                                                                                  | No approval event means no Done node, even if a summary label is later. A current target says Awaiting Decision. Banker names join on application ID; loan follow-up owner is `booking.loanOwner`.                                                                                                                                                                                                                                                                         |
| SPA Signed     | First eligible `spa_signed`; `spa_appointment_set` is supplementary evidence only.                                                                                                                                               | An appointment, loan agreement or disbursement never proves signing. Use `summary.spaSigned` to resolve the case; the event supplies the date and verifier. Missing signed-event detail stays unknown and is flagged by the same-snapshot contract test. Legal firm is `booking.legalFirm`.                                                                                                                                                                                |

**Current location is independent of achievement.** Evaluate
`ballInCourt(summary)` once. This preserves its exact priority, including
`summary.buyerWithdrew` triggering release review and an approved loan
outranking a different bank’s document request. The current marker is the next
obligation; the node’s historic evidence does not invent its outcome.

| `ball.nextMove` / Case Condition                   | Current Stop / Behavior                                                                                                                       |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `request_document`                                 | Documents; caption Collecting Documents if no request exists, otherwise Documents Outstanding. Prior receipts remain in detail.               |
| `chase_banker`                                     | Loan Approved; Awaiting Decision, or “2 Banks Reviewing” for two live banks.                                                                  |
| `submit_another_bank`                              | Loan Submitted; Another Bank Needed. Retain previous submissions but use a hollow current node for the new obligation.                        |
| `schedule_spa` / `escalate_legal`                  | SPA Signed; Awaiting Appointment / Awaiting Signing. An appointment alone does not move the loan wait.                                        |
| `review_release`                                   | No current milestone; `releaseReview=true`, summary says Release Review. Preserve reached route. Buyer withdrawal alone is not a closed case. |
| Closed / `summary.spaSigned` / `nextMove === null` | No current marker or elapsed wait. Closure takes precedence over a signed summary when `stage` is cancelled/lapsed.                           |

The model's `state`, `current`, `stalled` and `reopened` are orthogonal on
purpose. A previously achieved submission can be the current location for
another attempt. A prior document receipt can coexist with an outstanding
obligation. Render priority: closed Not Reached → current marker and hollow node
→ outstanding document state → confirmed check → missing outline → upcoming.
`stalled` may be true only on the current stop. `reopened` means the documents
phase has prior receipts and a current outstanding obligation; it does not
assert that a particular file was requested twice. `outstandingDocuments` is
copied from summary, without recreating core’s private document ledger.

**Gaps and closed cases.** A missing event before the furthest individually
evidenced stop uses Record Missing; an unachieved later stop uses Upcoming. A
current stop always shows the awaited wording, even if its underlying state is
Upcoming. For Cancelled/Lapsed, locate the first eligible terminal event in core
order and freeze milestone achievements at that event’s occurrence/order.
Records that occurred later remain in History but do not extend the route.
Unknown closure dates remain null. Preserve earlier gaps as Record Missing; only
genuinely unreached later stops say Not Reached. Draw a terminal cap after
`routeThrough`. Signed cases retain gaps, complete the evidenced SPA node and
have no live wait. Do not treat `loan_agreement` or `disbursed` alone as signed;
use `summary.spaSigned`.

**Attempts and detours.** Join application metadata and derived summary statuses
by ID. Keep a null status or banker when missing, never default to Submitted.
Select the first confirmed decision (`loan_approved`/`loan_rejected`) per
application in core order, matching `deriveApplication`. A rejected decision
creates one `JourneyRejection`; extra rejection messages for the same
application do not add attempts. Pick the earliest later submission of a
different application as `nextSubmission`; a bank already live before the
rejection is parallel, not a resubmission. With no confirmed rejection,
`detour=null`, even if two banks are live. Multiple rejected applications
produce one aggregated branch, e.g. “2 Rejections”; opening it filters History
to Loan and exposes every application. One rejected bank never closes the
booking. A rejected outcome with missing submission evidence may still appear on
the branch, but the missing submission/date remains explicit.

For the compact singular flag, the view may omit only a trailing generic “ Bank”
from the bank label (Malayan Trust Bank → Malayan Trust); full names remain in
`JourneyRejection`, Applications and details. Dates use the existing case date
formatter. Both desktop and phone detour activation call the same
`onShowHistory('loan')`; it does not navigate to a new stage.

**Durations and sources.** Booked → first submission is a completed interval. An
application’s confirmed submission → first decision is a completed interval; a
still-live submission → reference date is elapsed. BK-9002 gives 2, 5 and 8
calendar days respectively. Resubmission gap is 8 Sep → 10 Sep, 2 days. No
document receipt means document duration null. No signed date means signing
duration null. Never turn silence into overdue days. Copy event IDs, timestamps,
reporter, nullable verifier, message ID and notes into `JourneyEvidence`; format
null detail as — / Not Recorded. Do not extract new facts from message prose in
this function. Model `facts` are deterministic labels and formatted values from
that evidence, not AI narration.

#### View-Model Test Cases

Use real `STORIES` data for BK-9002 and constructed domain objects for edge
cases. A test must check values and evidence IDs, not just count rendered nodes.
Place tests in
`frontend/src/components/bookings/__tests__/bookingJourney.test.ts` and use the
repository's existing test runner.

| Case / Input                                                          | Exact Expected Result                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BK-9002 as of 18 Sep 2026                                             | Booked Done, 1 Sep; Documents Record Missing, no receipt/date; Submitted Done, 10 Sep, Resubmitted; Approved current+stalled, Awaiting Decision, no approved date; SPA Upcoming. One Malayan Trust rejection dated 8 Sep, next submission Crestline 10 Sep. Applications 1 live / 1 rejected; intervals 2/5/8 days; one current marker. |
| Signed case with confirmed Booked, Receipt, Submission, Approval, SPA | All five Done; `resolution='signed'`; no current/stalled flag; no elapsed timer; signed date/verifier from SPA event. A variant with no receipt keeps Documents Record Missing even though signed.                                                                                                                                      |
| Cancelled after submission                                            | `resolution='cancelled'`; same freeze date as confirmed cancellation; only proved achievements through that point checked; no current/stalled flag; Approved/SPA Not Reached; closure reason/reporter retained. A later-occurring approval must not advance the route. Repeat for Lapsed.                                               |
| Two parallel live banks, no rejection                                 | `detour=null`; Approved current; two live applications preserved with distinct banker/date; no Resubmitted wording. A later rejection of one bank retains the other pending bank and adds one branch without claiming that existing bank was submitted after rejection.                                                                 |
| Two rejected application IDs; third submitted later                   | One detour with two distinct rejections, flag 2 Rejections; latest live submission displayed; Approved current; exact next-submission relationships. Duplicate rejection evidence on one ID does not inflate the count.                                                                                                                 |
| Reopened documents request                                            | Confirm receipt on 2 Sep, submit 3 Sep, request named payslip on 12 Sep; summary says payslip outstanding. Documents Outstanding, current, `reopened=true`; retain the 2 Sep receipt; no fabricated new receipt. Previous submission remains evidenced. Variant with no prior receipt gives `reopened=false`.                           |
| Approved bank plus another bank asking for documents                  | Use core’s `ballInCourt` priority: SPA is current, not Documents; keep the other bank’s request in history/application detail. Do not reconstruct a conflicting document wait.                                                                                                                                                          |
| Buyer withdrew, no confirmed cancellation                             | `releaseReview=true`, resolution Open, no terminal cap and no current milestone; retained attempts/history; no assertion that the unit is released.                                                                                                                                                                                     |
| Unconfirmed, disputed, superseded and future evidence                 | None advances a node. Include one occurred-before-reference but recorded-after-reference event and exclude it too. Reversing input arrays gives the same output; input arrays remain unchanged.                                                                                                                                         |
| Timestamp tie / missing proof                                         | Match `byOccurred` including seq. Missing metadata leaves banker/status null; missing submission leaves dates/duration null. Appointment, loan agreement or disbursement without `spa_signed` never fills SPA.                                                                                                                          |

### 10B. Component Tree, Ownership And Deletions

Keep the approved four-view architecture. The page owns fetching, permissions
and coordination; the journey owns presentation only. Use existing Radix Tabs,
Tooltip and floating `SheetContent side="floating"` primitives.
`CaseQuickView.tsx` already uses that floating Sheet; do not build another
overlay primitive.

```text
BookingDetailPage
├─ CaseHeader                           identity + Record / Paste triggers
├─ Card
│  ├─ WaitingOnPanel                    existing owner/action/task rules
│  └─ BookingJourney(model)
│     ├─ JourneyRoad                    responsive SVG route + terminal cap
│     └─ ol → JourneyStation × 5
│        ├─ MilestoneIllustration       exactly one of five SVG subjects
│        ├─ JourneyDetails              desktop Tooltip / phone disclosure
│        └─ JourneyDetour               under Documents, if present
├─ CaseViews                            existing Tabs primitive
│  ├─ Overview: ApplicationsCard + LatestMessage + CaseDetails
│  ├─ Messages: MessagesPanel           existing proposals/review machinery
│  ├─ History: CaseHistory → EvidenceLog (All / Loan / Legal / Sales)
│  └─ Tasks: TasksPanel
└─ CaseActionSheet                      existing floating Sheet
   ├─ RecordUpdateForm
   ├─ AddMessageForm
   └─ PlaybooksPanel                    What To Do
```

| File Under `frontend/src`                                                                | Work / Ownership                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages/BookingDetailPage.tsx`                                                            | Keep snapshot, persona, error/refresh guards, signal fetch, onChanged and all mutation callbacks. Derive `bookingJourney` in memo from one snapshot. Own `view`, History track, and open action-sheet kind; reset these on booking ID change. Place WaitingOnPanel above BookingJourney. Move forms to the sheet and content into the four views. Keep tour anchors on the relevant view/triggers. |
| `components/bookings/CaseHeader.tsx`                                                     | Replace combined 32px unit/buyer h1 with unit/project/stage row, buyer 24/32 h1, then price/booked metadata. Add `onRecordUpdate`, `onPasteMessage` callbacks and the same closed-case permission logic. Remove duplicate wait, owner paragraph and risk row; obligations move to summary and owners/risk to CaseDetails.                                                                          |
| `components/bookings/bookingJourney.ts`                                                  | Create the pure contract above; no React imports, API calls, DOM or clock. Small private helpers for eligible evidence, attempts, current target and calendar intervals.                                                                                                                                                                                                                           |
| `components/bookings/BookingJourney.tsx`                                                 | Create the illustrated full journey. Own selected mobile disclosure / desktop detail state and reduced-motion entrance lifetime. Accept `model: BookingJourneyModel` and `onShowHistory: (track: 'loan') => void`. No business-rule derivation or mutations. Key lifetime by booking ID; never replay entrance on a snapshot refresh.                                                              |
| `components/bookings/journey/JourneyRoad.tsx`                                            | Create the desktop path and per-row mobile connectors. Accept route target/closure only. Branch route is decoration; the sibling button supplies meaning. Non-scaling strokes and CSS variables; no per-frame layout loop.                                                                                                                                                                         |
| `components/bookings/journey/JourneyStation.tsx`                                         | Create one semantic list item with full trigger, subject SVG, node and aligned label rows. Current marker depends on `current`; check requires proven achievement and no active replacement obligation. Include the single detour in the Documents item.                                                                                                                                           |
| `components/bookings/journey/JourneyDetails.tsx`                                         | Shared factual content rendered once for the active responsive mode. Desktop composes existing Tooltip, bottom-first with collision handling. Phone uses disclosure semantics and natural height, preserving selected stop on breakpoint changes. Centralize focus/Escape handling; never create hidden duplicate tabbable triggers.                                                               |
| `components/bookings/journey/JourneyDetour.tsx`                                          | One compact bank flag and branch, no separate stage. It calls `onShowHistory('loan')`. Stop propagation is not a substitute for correct hover targeting: only the station trigger opens station details.                                                                                                                                                                                           |
| `components/bookings/journey/MilestoneIllustrations.tsx`                                 | Export `BookedIllustration`, `DocumentsIllustration`, `LoanSubmittedIllustration`, `LoanApprovedIllustration`, `SpaSignedIllustration`, plus a typed ID→component map. Copy SVG paths from the final handoff; private class names only. All use one shared frame, stroke weight and ground ellipse. Theme CSS supplies ink/paper/shade. No PNG or external image fetch.                            |
| `components/bookings/journey/journey.css`                                                | Component-scoped geometry, state classes, label tracks, artwork palette aliases and reduced motion. Namespace every illustration class; do not use generic `outline`, `detail` or `signature` utility names. All raw palette values stay in existing tokens; only ellipse opacity and geometry are new.                                                                                            |
| `components/bookings/WaitingOn.tsx`                                                      | Keep WaitingOnCell, waitingOnTask, nextStepFor/stepToTask, loading/added/error states and cached alternative behavior. Refine the wide summary layout and add a What To Do trigger. Rename visible assistant copy. Remove **the full route's use** of CaseJourney, but retain its existing export for CaseQuickView until that separate compact consumer changes.                                  |
| `components/bookings/CaseViews.tsx`                                                      | Create the four tab labels/counts using `ui/tabs.tsx`. Page is source of selected view; expose `onValueChange`. Force-mount expensive/stateful panels and hide inactive ones with the primitive so unsaved review/form state is not lost and repeated tab switches do not issue redundant AI reads.                                                                                                |
| `components/bookings/ApplicationsCard.tsx`                                               | Render active-first attempt rows with confirmed dates from the model; add an `attempts` input for the full page. Preserve existing fallback API for other consumers until usage audit allows simplification. Explicit mobile grid cells keep the pill at right; full bank names wrap.                                                                                                              |
| `components/bookings/LatestMessage.tsx`                                                  | Create a small Overview excerpt using the latest original message, sender, role and time; View All / View Mortar AI’s Reading select Messages and focus the relevant message. No rewriting of evidence text.                                                                                                                                                                                       |
| `components/bookings/CaseDetails.tsx`                                                    | Create team definition list, RiskChip plus explanation, and buyer signals. Reuse SignalsPanel data/empty/loading semantics through an `embedded` body variant; do not duplicate signal fetching or infer signals from UI text.                                                                                                                                                                     |
| `components/bookings/CaseHistory.tsx` and `EvidenceLog.tsx`                              | Create track filters and compose the complete evidence ledger in an always-open embedded variant. Preserve reporter/verifier, occurrence/recording times, original note, source, application/message links and every evidence status. Detour selects Loan directly; opening History normally selects All.                                                                                          |
| `components/bookings/CaseActionSheet.tsx`                                                | Create the thin coordinator around existing `SheetContent side="floating"`, 16px inset / max720. Host complete existing RecordUpdateForm, AddMessageForm and PlaybooksPanel. Preserve every form field, event kind, permission, concurrency/error state and callback. Return focus to its opening trigger; retain drafts when switching views.                                                     |
| Existing `MessagesPanel.tsx`, `PlaybooksPanel.tsx`, `SignalsPanel.tsx`, `TasksPanel.tsx` | Adjust embedding/layout only where required; retain data/review behavior. Apply the visible Mortar AI copy audit from section 8. No stored origin, API or provider identifier renames.                                                                                                                                                                                                             |

**Delete or retire:** Remove the full page's `confirmedKinds` Set and
`CaseJourney` call; remove its always-visible TrackTimelines block, footer-only
EvidenceLog wrapper, stacked secondary card rail and inline collapsible form
wrappers. `TrackTimelines.tsx` can be deleted only after confirming no other
imports/tests need it; its records are now in CaseHistory. Remove raster
imports, PNG milestone assets and renderer controls. **Do not delete
`WaitingOn.tsx`’s `CaseJourney` export yet:** `CaseQuickView.tsx` imports it.
`StageTracker.tsx`, `SEGMENTS`, `STAGE_PROGRESS` and `progressFromKinds` remain
for their compact consumers; the new full journey does not call them. Reuse the
existing floating Sheet rather than replacing its focus/portal machinery.

**Build sequence and acceptance:**

1. Implement the pure model and the table-driven cases above. Verify frozen
   as-of filtering, closed/reopened behavior and distinct application attempts
   before styling.
2. Build the five SVGs, station/road and responsive detail behavior against
   model fixtures. Check 1440, 960, 720, 390 and 320px; identical desktop label
   baselines; no branch/label intersection; phone panels push all later nodes
   down. Inspect light/dark at 100% and 200% zoom.
3. Wire the header, summary, four views, CaseDetails and existing floating
   Sheet. Verify every capability in section 3 remains one click away; preserve
   unknown/error/loading, closed-case restrictions, proposal review and task
   mutation states.
4. Verify keyboard focus, Enter/Space disclosure, Escape, viewport flip/clamp,
   tooltip hover persistence, no detour-triggered document tooltip, breakpoint
   state transfer and reduced motion. Check route animation plays once per
   booking entry and never on tab changes or refresh.
5. Apply the documentation/copy changes below, run frontend typecheck and the
   repository’s existing relevant component tests, then capture final light/dark
   screenshots with and without open details. Remove mockup-only query plumbing
   from product code unless retained in a development story.

### 10C. Final DESIGN.md Amendment Text

Apply these targeted replacements to `docs/DESIGN.md`. The code blocks are the
final text, ready to paste. These supersede the earlier A1–A5 proposals; they do
not introduce another font, chromatic palette or global icon set.

**Plain Language:** replace the user-facing Jev paragraph and its naming
exceptions with:

```md
Mortar AI is the only user-facing assistant name. Write “Mortar AI Suggests,”
“Ask Mortar AI Again,” and “Mortar AI could not check. Try again.” Provider and
model names never appear in visible copy, tooltips, accessible names, alt text
or toasts. Internal service identifiers and stored origins do not change. Use
“Ask Mortar AI,” with a space, throughout the shell, help and tours. The
assistant names its sources and never changes a case without an explicit
supported staff action.
```

Apply this vocabulary to the named labels in Icons, Ask Panel, Manager Card, App
Shell and Do And Do Not; remove the Ask Panel's obsolete scripted-only claim.
Section 8 lists the inspected source strings.

**Decisions → Look:** append “The full Booking Journey on `/bookings/:id` is the
one scoped ink-illustration surface; see Full Case Journey Illustration
Exception.” **Decisions → Icons:** append “Except the five subject drawings in
that named component.” **Icons:** replace the opening exclusivity sentence and
Approved Components lead-in, then add the exception:

```md
Controls and general-purpose icons use Lucide (`lucide-react`). The approved
glyph list applies to controls and chrome. The five subject drawings below
belong only to Full Case Journey and are not a general-purpose icon set.

### Full Case Journey Illustration Exception

Only the full Booking Journey on `/bookings/:id` may use bespoke ink drawings:
booking form with unit key tag, document folder, bank, letter of offer with
stamp, and signed agreement with pen. Use one 2-unit stroke in a 96×96 viewBox,
flat paper planes, clean silhouettes and sparse interior lines. Render at
64×64px desktop and 40×40px below 720px. Use inline SVG with foreground, card,
muted and existing neutral tokens; provide both themes.

One unblurred ground ellipse per drawing is permitted: cx48 cy89 rx34 ry3,
foreground at 7% in light mode and 10% in dark mode. No other illustration
shadow, glow, gradient, lighting effect, hatch texture or raster asset is
permitted. Use component-scoped class names; generic utility names such as
`outline` must not be applied to drawing paths.

This exception does not apply to navigation, tables, compact trackers, quick
view, forms, empty states or other cards. It does not widen the Sales Chart's
separate Building View 3D exception. All other icons remain Lucide.
```

Append to **Do And Do Not → Do Not** after the secondary-icon-set prohibition:
“The five subject drawings and faint ground ellipses in Full Case Journey are
governed only by their named exception.”

**Stage Tracker:** preserve the compact tracker bullet. Replace its shared “Five
equal segments” anatomy line with “Five milestones. Compact trackers use equal
segments; the full case uses the roadmap below.” Replace the full tracker bullet
with “Full tracker: use Full Case Journey.” Add under **Components**:

```md
### Full Case Journey

- **Purpose:** Show confirmed, awaited and missing case milestones, including
  repeated bank attempts, without treating the journey as percent complete.
- **Anatomy:** Five illustrated stations on a gently curved neutral road. All
  desktop station nodes share one ground line; names share one baseline and
  dates/states share a second baseline. Curves remain between stations, with no
  more than 6px visible displacement. Use an 8px muted road bed, a 1.75px
  foreground travelled centerline and a 1.5px dashed input future line. A static
  You Are Here flag marks the awaited outcome, not a completed one.
- **States:** Confirmed achievements get a checked route node. Current waits get
  a hollow ring and explicit awaited wording. Missing records have a dashed
  illustration/node and literal missing-record text. Upcoming drawings use 40%
  opacity; missing drawings use 68%; labels remain fully readable. Reopened
  documents retain prior receipt evidence and show the outstanding obligation.
  Stalled uses the existing summary reason and status tone.
- **Attempts:** Rejected applications form one compact return branch before Loan
  Submitted, with a bank/outcome/date flag opening Loan history. Keep every
  branch stroke clear of label bounds. On phones, place the indented branch
  between Documents and Loan Submitted, after any open document detail. Parallel
  submissions are attempts, never additional stages.
- **Rules:** Each node requires its own confirmed evidence. Later progress
  cannot fill an earlier receipt or date. Paths and drawings stay neutral;
  status words carry status color. Closure freezes achievements, removes the
  current marker and wait clock, caps the reached route and labels remaining
  stops Not Reached. A signed SPA uses its own evidence, not an appointment or a
  later loan-agreement label. Do not calculate overdue working days from
  calendar silence.
```

**Tooltip:** retain the standard tooltip rules; append:

```md
### Journey Details

Full Case Journey may use factual multi-row tooltips: maximum width 280px,
padding 12px, Body/Small, inverse fill, radius 4px, no caret or controls. Place
them below the full station label block with a 12px gap and 16px viewport
clearance; flip above only when below cannot fit. Hover opens after 300ms, focus
immediately. Details stay open under the pointer; Escape dismisses without
moving focus. A detour flag does not open station details.

Below 720px, use a disclosure instead of a tooltip. Each 72px station button has
aria-expanded and aria-controls. Its factual region follows it in normal flow
with 44px left indent, 12px padding, muted fill, default border and 4px radius.
One region may be open. Enter/Space or tap toggles; Escape closes. Later
stations move down, and route connectors grow with their rows. Keep the selected
station when switching between desktop and phone presentations. All essential
blockers, dates and required actions stay visible outside supplementary details.
```

**Motion:** replace “There are no decorative entrance flourishes” with “The sole
exception is Full Case Journey's one-time route entrance.” Append:

```md
Full Case Journey may draw its already-travelled line once on initial case
entry, over 560ms ease-out, never more than 600ms. Do not replay on hover, tab
changes, panel opening, saved updates or snapshot refresh. Future route,
drawings, detour and current marker stay still. No pulsing or looping. Under
prefers-reduced-motion: reduce, render the final line immediately; disable the
entrance entirely. Phone detail expansion uses normal flow without height
animation.
```

**App Shell / Screen Density:** append this route-specific block:

```md
### Full Case Page

`/bookings/:id` uses a solid page ground. Keep unit/project/stage above a
Display/Page buyer h1 (Geist 600, 24/32, -2%); price and booking date follow.
The current wait and next action lead the summary, followed by the roadmap. The
four work views are Overview, Messages, History and Tasks. All loan, legal and
sales events remain in one filterable History view; do not place empty track
cards before operational detail. Group team, financing risk and buyer response
in Case Details. Keep required document obligations visible in the summary and
preserve closed-case restrictions.

Below 720px, use 16px page gutters, a stacked summary, 48px tab row with 13/18
medium labels, and the vertical roadmap/disclosures. Keep Record An Update and
Paste A Message visible when permitted. Bank rows place identity in column 1,
status in column 2 with intrinsic width, and dates beneath; status pills never
stretch across a row. Every daily capability is at most one action away. Verify
390px and 320px without page-level horizontal scroll. Phone form fields may use
the existing 16/24 step at regular weight to avoid input zoom; this introduces
no new type size.
```

**Floating Panel:** add the case use to the existing component rather than
defining another overlay:

```md
Case actions reuse the floating Sheet: inset 16px, maximum width 720px, 6px
radius, solid card fill, Overlay elevation and existing scrim/blur. It hosts
full record-update, message-intake and What To Do interfaces. Retain every form
field, permission and error state. Keep long content scrollable inside; trap
focus and return it to the opening trigger. Use motion/slow entry; remove
translation under reduced motion. No new glass treatment or separate case-modal
primitive is introduced.
```
