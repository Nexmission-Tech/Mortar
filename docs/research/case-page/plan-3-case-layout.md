# Case Page Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/bookings/:id` from one long stack of cards into "a decision,
then the record": identity and two actions, one summary card with the
illustrated journey, then four views (Overview, Messages, History, Tasks), with
forms and guidance in the floating case panel.

**Architecture:** The page keeps fetching, permissions and mutations. New thin
components compose existing ones: `CaseViews` (Radix Tabs, URL `?view=` and
`&track=`), `CaseHistory` (track filter over an always-open `EvidenceLog`),
`CaseDetails` (team, risk, embedded `SignalsPanel`), `LatestMessage`, and
`CaseActionSheet` (the floating `Sheet` hosting `RecordUpdateForm`,
`AddMessageForm` and `PlaybooksPanel`). `CaseHeader` is rewritten;
`WaitingOnPanel` gains a What To Do trigger. `TrackTimelines` is deleted once
nothing imports it.

**Tech Stack:** React 19, react-router 7, Radix Tabs and Sheet, Vitest.

**Spec:** `docs/research/case-page/README.md` §3 (every capability's new home),
§4 (layout), §6 (component specs), §10B (tree and deletions), §10C (DESIGN.md
text). Plan 2 (the journey) is merged into this branch's base.

## Global Constraints

- Every capability in spec §3 stays reachable in at most one click.
- No behaviour change in forms, proposal review, task mutations or permissions;
  only where they render.
- Closed cases (cancelled, lapsed) hide Record An Update, as today.
- Inactive tab panels stay mounted (`forceMount`), so drafts and review state
  survive a tab switch.
- Title Case labels; tokens only; existing components before new ones.

## Tasks

### Task 1: Case Header

Rewrite `components/bookings/CaseHeader.tsx`: unit (mono), project and
`StagePill` on one line; buyer as a 24/32 `h1`; price and booking date beneath;
Record An Update and Paste A Message as secondary buttons on the right (two
equal columns on phones). Remove the status sentence, owner line, risk and
document pills (they move to the summary and Case Details). Paste A Message
carries `data-tour="case-message"`.

Tests (`CaseHeader.test.tsx`, rewritten): identity rows render; both buttons
call their handlers; a cancelled case shows no Record An Update; no owner line
or "Stalled" sentence.

### Task 2: Case History

`EvidenceLog` gains `embedded`: no card, heading or toggle; the table always
shows; notes wrap instead of truncating. New `CaseHistory` renders a track
filter (All Tracks, Loan, Legal, Sales, each with its count, `aria-pressed`)
over the embedded log, and "No Legal Updates Yet." when a track is empty.

Tests (`CaseHistory.test.tsx`): all entries show with no extra click; Loan
narrows to loan entries; an empty track reads its empty line; a long note is not
truncated.

### Task 3: Case Details And Latest Message

`SignalsPanel` gains `embedded` (no card). New `CaseDetails`: Assigned Team as a
definition list, Financing Risk (`RiskChip`, or "Low Risk"), Buyer Response
(embedded `SignalsPanel`), split by hairlines. New `LatestMessage`: the newest
message's sender, role and time, its full text, and View All N, which opens
Messages.

Tests (`CaseDetails.test.tsx`): team names, the risk chip, the buyer response
empty line; the latest message is the newest by sent time; View All calls its
handler.

### Task 4: Case Action Sheet And What To Do

New `CaseActionSheet`: `Sheet side="floating"` with a header (title, unit and
buyer) and a scrolling body; `action: 'record' | 'message' | 'guidance' | null`.
`WaitingOnPanel` gains `onWhatToDo`, a ghost What To Do button beside Add Task.

Tests: the sheet shows its title and body only while open, and closes through
`onClose`; What To Do calls its handler.

### Task 5: Case Views And The Page

New `CaseViews` (Overview, Messages N, History N, Tasks N; sticky under the app
bar; panels force-mounted and hidden when inactive). The page:

1. Header with the two actions → `CaseActionSheet`.
2. One card: `WaitingOnPanel` (with What To Do), outstanding-document pills when
   present, then the journey. The card carries `data-tour="case-status"`.
3. `CaseViews`: Overview = applications and latest message beside Case Details;
   Messages = `MessagesPanel` (no inline form); History = `CaseHistory`; Tasks =
   `TasksPanel`.
4. `?view=` and `&track=` hold the view; the journey's bank detour opens History
   on Loan and scrolls to the views.
5. A recorded update closes the sheet; a pasted message keeps it open to show
   Mortar AI's reading.

Delete `TrackTimelines.tsx` and its test if nothing else imports them.

Tests (`BookingDetailPage.test.tsx`, updated): existing flows still pass through
the new homes (Record An Update and Paste A Message open the panel; proposals
confirm from Messages; the task completes from Tasks); the detour opens History
with Loan pressed; `?view=messages` opens Messages.

### Task 6: Docs And A Browser Pass

Apply spec §10C to DESIGN.md (Full Case Journey, Journey Details, Full Case
Page), update PRD acceptance and notes for the case page, then check
`/bookings/BK-9002` at 1440, 960, 760 and 390 px in light and dark: tab
switching, the panel opening and closing, the detour, and no sideways scroll.
