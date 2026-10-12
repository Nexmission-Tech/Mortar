# Does Mortar Help Bookings Reach A Signed SPA?

## Verdict

As built, Mortar mainly makes delay visible and follow-up accountable, with a
credible mechanism for shortening avoidable waits; it has not established that
more bookings reach a signed SPA sooner. Its document chasing, named tasks and
legal queue can move real work, but financing rescue and the hand-off from loan
approval to an executable SPA remain incomplete. Refine those existing
workflows, then prove the change on one project's booking cohort; another screen
will not turn the answer into an unambiguous yes.

## Where Bookings Really Die

### What The Evidence Supports

The sponsor asks, verbatim: “How might you improve booking-to-SPA conversion and
give the business a clearer view of which bookings are likely to convert?” Its
success test is equally clear: “Success should be measured through one number
that can be read within one quarter. It must represent a real business outcome,
behaviour, or cash movement — not a dashboard or a report that someone has to
open.” Visibility fulfils only part of that mission. **Source: Sponsor
Challenge, Your Mission And How Do You Know It Worked?**

The practitioner interview is an unanswered template, not interview evidence.
The survey has eight self-selected respondents; only one covers loan
administration and legal. Its counts rank investigation priorities, not shares
of Chin Hin's failed bookings. Four respondents report typical booking-to-SPA
times of three to four weeks; three report seven weeks or longer. **Source:
Practitioner Survey, Respondents, Typical Time And Limitations.**

The ranking below combines that evidence with **industry knowledge and
operational judgement**, explicitly identified. The delay ranges are rough
planning estimates for an affected case, not measured Malaysian medians or
promised savings. Days mean calendar days unless stated. Causes overlap: a
valuation gap can become a withdrawal, and a single-bank strategy magnifies a
rejection. Do not add these rows into a national leakage rate.

| Rank | Cause                                                                               | How Common And Evidence                                                                                                                                                                     | Typical Operational Cost To Test                                                                                                                                      | Mortar Today                                                                                                                                                                                                                                                                                                                                                          |
| ---- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Rejection or insufficient finance, including valuation and buyer cash shortfall     | Strongest supplied signal: financing is the biggest cause for 7 of 8 and a top-three cause for all 8. Valuation shortfall appears in 3 of 8 top threes. **Survey: Leakage Causes.**         | Roughly 7–21 days for a viable rework; the whole booking is lost if the funding gap cannot be met.                                                                    | **Detects And Partly Prompts.** Separate bank decisions, an advisory affordability flag, another-bank action and Forecast's Financing Reviews exist. A confirmed valuation shortfall does not itself create a specific stall or funding-gap calculation. A fresh final rejection need not enter Today. **Code: `ballInCourt`, `summarizeCases`, `forecastInsights`.** |
| 2    | Incomplete, unsuitable or unforwarded loan documents                                | Named in the top three by 5 of 8. **Survey: Leakage Causes.** Repeated requests for the correct month, complete pages or usable income evidence are **industry knowledge**.                 | Roughly 3–10 days per document loop; repeated loops can consume the whole signing window.                                                                             | **Detects And Prompts After A Request.** Named requests, receipts, per-bank scope and a five-day stall help. No recorded request is not proof of a complete pack. Receipt does not separately prove bank acknowledgement. **Code: `documentLedger`, `deriveApplication`.**                                                                                            |
| 3    | Buyer hesitation, changed circumstances or withdrawal                               | Top-three cause for 5 of 8; buyer responsiveness is a useful signal for 4 of 8. **Survey: Leakage Causes And Useful Signals.**                                                              | Roughly 2–14 days of drift before a decision; outright withdrawal loses the booking.                                                                                  | **Records, But Acts Late.** Hesitation events and Mortar AI readings exist. Confirmed hesitation does not drive the default next move or an immediate Today entry. Withdrawal does move responsibility to the developer for release review. **Code: `ballInCourt`, `summarizeCases`; Case Page.**                                                                     |
| 4    | Bank processing delay after a genuinely complete submission                         | Credit assessment is the stuck stage for 5 of 8. Slow processing is the biggest cause for the sole respondent covering loan and legal. **Survey: Stage And Dissenting Expert.**             | Several working days, potentially weeks when queries or escalation remain unresolved. The benchmark starts with complete information, not the first WhatsApp message. | **Detects And Prompts.** The bank clock pauses for bank-specific document requests and restarts on receipt; the stall threshold is nine working days. Manager escalation is later. The calendar skips weekends but not Malaysian public holidays. **Code: `deriveApplication`, `managerSuggestions`, `workDaysBetween`.**                                             |
| 5    | Reliance on one bank without a considered fallback                                  | Frequency is unmeasured in the supplied survey. **Industry knowledge:** this increases exposure to one bank's appetite and turnaround; it is not a separate borrower defect.                | One further assessment cycle plus hand-over time, roughly 5–15 working days where a second application is viable.                                                     | **Supports, But Does Not Ensure.** Multiple applications and second-bank outcomes are real features. One live bank normally means Call The Banker; no deterministic early fallback review exists. Two rejections can show Release Review on the chart while the case still suggests another bank. **Code: `ballInCourt`, `releaseReview`, `forecastInsights`.**       |
| 6    | Letter Of Offer not accepted, unacceptable terms or an approaching expiry           | One of eight names LO/loan documentation as the stuck stage. Exact acceptance-window prevalence is unknown. **Survey: Stage; industry knowledge.**                                          | Roughly 2–7 days to settle terms or acceptance; expiry may require renewal or reapplication and jeopardise the sale. The actual letter governs.                       | **Does Not Detect The Specific Problem.** `loan_approved` becomes `lo_issued` and routes the next move towards the solicitor. There is no distinct LO receipt, acceptance or expiry fact. **Code: event types, `deriveCase`, `ballInCourt`.**                                                                                                                         |
| 7    | SPA drafting, buyer/co-buyer availability, solicitor appointment and missed signing | Routine coordination friction, but not quantified by this survey. **Industry knowledge.**                                                                                                   | Roughly 3–14 days; an outstation buyer or missed appointment can cost another slot.                                                                                   | **Detects And Partly Prompts.** Legal separates unscheduled and scheduled-but-unsigned cases and records dates inline. A just-missed appointment can still miss Today because its signing stall is measured from when the appointment was recorded. There is no structured joint confirmation of readiness. **Code: Legal, `summarizeCases`.**                        |
| 8    | Buyer not ready for the required contribution, applicable fees or duties            | Unmeasured here. **Industry knowledge:** liability, promotions, exemptions and when each amount falls due vary.                                                                             | Roughly 3–14 days to arrange funds; an unaffordable contribution can lose the booking.                                                                                | **Does Not Detect.** Estimated financing risk is not cash readiness. No actual approved loan amount, required cash schedule or payment-readiness confirmation supports the signing decision. Notes can describe it, but rules cannot act on it. **Code: booking and event types.**                                                                                    |
| 9    | Developer-side package, purchaser-detail, approval or execution hold                | Project-dependent; prevalence is **to verify** with Chin Hin. **Industry knowledge.** Do not assume every consent must precede SPA signing.                                                 | Roughly 2–10 days for ordinary internal clearance; statutory or title issues can take longer and need separate diagnosis.                                             | **Mostly Does Nothing Specific.** The developer can be the next party, but there is no explicit developer-approval blocker. After loan approval the default points at the solicitor even if our own desk owes the missing decision. **Code: `ballInCourt`.**                                                                                                          |
| 10   | Reservation validity, extension or release decision left unresolved                 | The sponsor describes units held for “[six to twelve] weeks”. Survey release windows range from up to two weeks to over twelve. **Sponsor: Problem Overview; Survey: Unit Release Window.** | A missed valid deadline may lose a recoverable booking; indecision can hold stock for weeks. These are different losses.                                              | **Partly Detects, Without The Actual Deadline.** Release Review uses withdrawal, two rejections with nothing live, or age 30+ with nothing live. Cancellation/lapse must be recorded by staff. No case-specific authorised expiry or extension is stored. **Code: `releaseReview`, Record An Update.**                                                                |

### Malaysian Practice That Needs Care

Mortar's nine-working-day threshold comes from ABM's **2017** statement of two
to nine working days with complete documents. ABM's published revised customer
charter instead lists five working days for an individual mortgage application
from receipt of full documents and information. These are reference points, not
a verified Chin Hin panel SLA or a credit-approval promise; agree the current
bank commitment and working calendar in the pilot.
[ABM's 2017 Statement](https://www.abm.org.my/press-releases/commercial-banks-housing-loan-applications-processed-on-timely-basis/),
[ABM Customer Service Charter, Commitment 2.5](https://www.abm.org.my/wp-content/uploads/2022/11/Revised-Customer-Service-Charter-EN.pdf).

KPKT's enforcement FAQ states that housing developers may not collect payment
before the SPA is signed under Regulation 11(2). Do not present collecting a
booking fee as a required lawful first step for an HDA project. Project
coverage, jurisdiction, refund treatment, lawful reservation terms and any
claimed signing deadline remain **to verify** with the project's solicitor.
Mortar's 30-day measurement horizon and 45–95-day simulated lapse assumptions
are not Malaysian statutory deadlines.
[KPKT Enforcement FAQ, Questions 1 And 5](https://ehome.kpkt.gov.my/index.php/pages/view/220).

ABM lists legal fees, stamp duties and other incidental costs, but their timing
cannot be collapsed into one universal “pay everything before SPA” rule. Obtain
the actual buyer contribution and solicitor's advice for this project. Any LAD
exposure, stamp-duty exemption, quota/consent prerequisite or mandatory 14-day
signing claim is **to verify**; none should become an automatic release rule.
[ABM Housing 101, Other Costs Involved](https://www.abm.org.my/for-banking-customer/individual/housing-101/).

## What Mortar Already Does That Truly Moves A Booking

| Existing Mechanism                                          | Why It Can Change The Outcome                                                                                                                                                                                                                                                       | Practical Limit                                                                                                                                        |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| One evidence-led case and one default next move             | `deriveCase` uses confirmed events; `ballInCourt` and `nextStepFor` connect the external wait to an internal desk. Today and the case panel can create the same owned task. Staff need not reconstruct the file across three departments.                                           | Staff must still act. Creating a task does not contact anyone or complete the next milestone.                                                          |
| Specific document chasing and independent bank applications | `documentLedger` tracks requests by bank and document. A receipt scoped to one bank need not clear another bank's request. A rejection does not close a viable parallel application. These are useful safeguards against chasing the wrong party or abandoning a recoverable buyer. | The ledger tracks recorded obligations, not a verified complete underwriting pack.                                                                     |
| Reviewable message extraction plus Record An Update         | Mortar AI turns pasted messages into proposals that staff can confirm, dispute or dismiss. The manual route records submissions, decisions, appointments and signings without waiting for AI.                                                                                       | A staff confirmation establishes a recorded fact; it is not independent proof that a document is usable or an SPA fully executed.                      |
| Legal's two queues and the Sales Chart's direct case access | Unscheduled approvals and scheduled-but-unsigned cases require different calls. Older open cases remain visible beyond day 30. An appointment changes the appointment list; only a confirmed signing establishes the SPA milestone.                                                 | The “Loan Approved, No SPA Appointment” filter identifies an absence of scheduling evidence, not verified readiness to sign.                           |
| Manager follow-ups and existing outcome reports             | Manager requests create or flag internal work. Completed follow-ups without later confirmed evidence remain visible. Forecast already reports completed booking-to-signing and approval-to-signing medians, exits and observed second-bank outcomes.                                | Follow-ups labelled Answered can mean task completion without an external reply. Reports describe recorded outcomes, not Mortar's causal contribution. |

The recent Today and Case Page designs put the booking, blocker, owner and
action together. Preserve that improvement. The Sales Chart is a familiar way
into a case; its visual polish is not the intervention. **Sources: Today Design,
Ranking And Time; Case Page Design, Information Architecture; Sales Chart
Design, Figures And Filters; inspected page implementations.**

## Gaps, Ranked By SPA Impact

Rank means expected contribution to additional or earlier signings, not visual
importance. Effects below are **pilot hypotheses on affected cases**, not
observed gains; they overlap and must not be added. Cost: **S** means a focused
rule, copy or report refinement; **M** means coordinated form, evidence and rule
changes; **L** means a new subsystem. No recommendation needs L.

| Rank | Gap And Evidence                                                                                                                                                                                                                                                                                                                                          | One Smallest Change In The Existing App                                                                                                                                                                                                                                                                                                                                                                                                       | Expected Effect To Test                                                                                                                                                                                             | Cost | New Data Needed?                                                                                                                                                                                                                                                             |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **Financing Problems Lack An Immediate Owned Recovery Decision.** Financing dominates the survey. Forecast already lists rejected cases for review, but Today admits only stalled cases. A rejection recorded today can reset silence to zero and leave no stall. The default another-bank action does not establish whether the rejection is remediable. | Put an immediate **Financing Review** next step on Today and the Case Page when confirmed rejection leaves no viable application or staff confirm a new valuation shortfall. Loan Admin records one justified recovery decision using the existing applications, note and task controls. Make the chart's Release Review open that same decision, rather than treating two rejections as proof that recovery is exhausted.                    | Remove up to the seven-day generic silence wait where no other stall fires; preserve salvageable bookings through a prompt, reasoned next attempt. No claim that another bank will approve.                         | S    | Yes: the evidenced rejection reason, funding gap and buyer decision. Existing notes can hold these for a manual first version; the trigger uses existing events. Missing imported commitments currently become zero, so the advisory flag cannot substitute for this review. |
| 2    | **A Receipt Is Not A Bank-Ready Pack.** Documents are a top-three cause for 5 of 8. The ledger starts with requests, and a general receipt can clear requests across banks. The demo buyer reply says documents went to Loan Admin, not that the bank accepted a complete pack.                                                                           | Turn the Case Page's document update into a **Per-Bank Pack Handover**: use the current document list, distinguish received by staff from acknowledged complete by the selected bank, and start the bank decision clock only on the latter. Keep the missing item and its due task visible until hand-over.                                                                                                                                   | Avoid roughly 3–7 days of internal forwarding or repeat-document delay per affected case; make bank escalation credible.                                                                                            | M    | Yes: bank acknowledgement and its date, plus the applicable pack requirements. Existing receipts, application IDs, event dates and tasks are reusable. No document-storage system is needed.                                                                                 |
| 3    | **Loan Approval Is Mistaken For Signing Readiness.** `loan_approved` becomes `lo_issued`; `ballInCourt` sends the case to the solicitor even when the approving bank still has a recorded document request. LO acceptance, cash readiness and developer clearance are absent.                                                                             | Add one compact **Signing Readiness** block to the existing case panel and Legal row: accepted offer and acceptance deadline, buyer's required funds readiness, solicitor's draft/appointment confirmation, and any outstanding developer clearance. Keep unknowns explicit and route the next move to the actual unresolved item. This is an operational checklist, not a universal legal prerequisite; preparation can proceed in parallel. | Avoid roughly 3–10 days of false hand-offs and failed appointments; prevent an offer expiring while the screen says only to chase Legal.                                                                            | M    | Yes: the actual acceptance/deadline and readiness confirmations. The current approval event and legal-firm name do not supply them. Use evidence notes for rehearsal; do not present an unbuilt checklist as shipped.                                                        |
| 4    | **Urgency Follows Silence More Than A Real Commitment.** Today sorts provisional evidence, silence, price and age. Defaults are documents five days, bank nine working days, scheduling ten days and signing fourteen days from appointment entry. Manager uses 1.5 times the relevant threshold. A newly missed appointment can trigger neither queue.   | Make one shared **Next Commitment Due** rule drive Today and Manager priority: missed appointments and recorded deadlines first, then the oldest unresolved obligation. Use the actual appointment date and task due date; a routine contact update must not reset the unresolved milestone's clock. Add LO/reservation dates only when evidenced and applicable.                                                                             | Remove the avoidable interval after a missed appointment or broken promise; prevent cases missing a known acceptance or authorised reservation deadline. Measure overdue days avoided, not a guaranteed SPA uplift. | M    | Existing appointment notes, task dates and event dates cover the first version. LO expiry comes from rank 3; an authorised reservation expiry/extension is new project data. Malaysian holidays and bank commitments must be agreed.                                         |
| 5    | **Task Completion Does Not Close The Follow-Up Loop.** Complete writes `done` and a completion time without an outcome or next promise. Matching open tasks suppress recommendations. Manager's Answered state can persist without new evidence.                                                                                                          | Replace bare **Complete** with a short **Record Follow-Up Result** close-out in Your Tasks: record the result and either link the verified milestone or leave a next dated task with an owner. A call attempt can be complete while the booking remains blocked.                                                                                                                                                                              | Reduce repeated unanswered chasing and forgotten callbacks, plausibly 1–3 days per broken hand-off; measure time to the next verified milestone.                                                                    | M    | Yes: a task result and link to supporting evidence. Owner, due date, completion time and event history already exist. Never fabricate an external reply from a checked task.                                                                                                 |
| 6    | **Buyer Doubt Is Visible But Not A Reliable Action Trigger.** `buyer_hesitant` is recorded, but it neither creates a stall nor makes `call_buyer` the default. Mortar AI can suggest a call, but that is not guaranteed to reach Today.                                                                                                                   | Make an unresolved **Confirmed Buyer Concern** create a same-day Sales Admin call in Today, with the outcome recorded on the case. The call establishes the objection and the buyer's next commitment; bank processing continues alongside it.                                                                                                                                                                                                | Shorten response to a real concern from days to the same day; test withdrawal/lapse reduction without assuming every buyer can be retained.                                                                         | M    | Existing hesitation events support the trigger. A resolved-concern outcome is new structured data; sentiment scores alone must not open or close it.                                                                                                                         |
| 7    | **“Approved” Guidance Contains Synthetic Authority.** The seeded playbooks include invented case outcomes, precise recovery figures and broad bank/legal claims. For example, the joint-applicant and SPA-window guidance asserts restrictions that the supplied evidence does not establish.                                                             | Show only a **Project-Validated Action And Limits** excerpt beside each next step. Keep unvalidated examples explicitly illustrative until the named Loan/Legal reviewer checks the actual panel policy.                                                                                                                                                                                                                                      | No defensible day saving yet. This prevents wrong resubmissions, false promises and avoidable lost bookings caused by following unsuitable guidance.                                                                | S    | Yes: real policy sources and genuine reviewer approval. Existing playbook author, reviewer, date, status and limits fields suffice.                                                                                                                                          |
| 8    | **The Sponsor's Outcome Is Not A Fixed-Cohort Result.** Forecast has useful medians and exits, but its model rates use resolved history and its estimate covers unsigned cases under 30 days. Sales Chart's Units Booked excludes cancellations/lapses. Neither denominator is the pilot cohort.                                                          | Add a **Cohort Result** selection inside Forecast's existing Conversion And Turnaround report: show the enrolled denominator, audited day-30 signings, exits and still-unsigned cases for the same intake dates. Keep the signing estimate separate.                                                                                                                                                                                          | No direct days saved; makes a genuine conversion gain distinguishable from faster logging, easier case selection or excluding failures.                                                                             | S    | Booking and event dates already support the calculation. Pilot eligibility, comparison assignment and solicitor audit results are new information, initially held in a controlled pilot register.                                                                            |

### What To Refine Before Next Week

Protect the current screen structure. Prioritise rank 1's immediate financing
cue and rank 4's missed-appointment rule, then rehearse them against explicit
case examples. Ranks 2 and 3 are the next product work: use honest, manually
recorded evidence in the current panel until the structured checks are built. Do
not attempt all eight refinements during pitch week.

The demo should end one synthetic case at **SPA Signed**, using the existing
Record An Update action and naming the solicitor's simulated execution
confirmation. Replace a secondary navigation step with this endpoint. Clearing a
document or removing a unit from the appointment filter is progress; neither is
the sponsor's result.

## Proving It Worked

### One Primary Number, With Guardrails

Use **30-Day Verified SPA Rate**: bookings with a legally audited, fully
executed SPA by booking day 30, divided by every eligible booking enrolled in
that intake cohort. Agree the meaning of fully executed with Legal, including
all required parties; a buyer's attendance or signature alone must not be
silently counted as completion. Use the agreed reservation/booking date, not the
import date or an assumed lawful fee date.

Keep rejected, withdrawn, cancelled and lapsed bookings in the denominator. Show
cohorts awaiting their full 30-day observation separately. A day-31 signing
misses this timing measure but remains a successful later conversion. Keep
working older bookings; a measurement horizon is not a release instruction.

| Measure                                              | What A Director Should See                                                                                                             | What Existing Data Can Support, And Its Limit                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Primary: Day-30 Verified SPA Rate**                | Numerator, denominator, intake dates and assisted-versus-comparison percentage-point difference.                                       | `bookingDate` and confirmed `spa_signed.occurredAt` support dates. Freeze the evidence cut-off with `recordedAt`; reconcile execution evidence with Legal. Existing confirmation can be self-entered with an optional note, so the app alone does not perform the legal audit. Cohort membership must be added.                                                          |
| **Speed: Median Booking-To-SPA And Approval-To-SPA** | Medians with sample sizes, the same cohort definition and the still-unsigned count beside them.                                        | Forecast already calculates both from actual confirmed signing and approval events. Its current view covers accessible completed cases, not a controlled cohort. A lower median among winners alone can hide worse conversion; report it beside the primary rate.                                                                                                        |
| **Conversion And Losses Beyond Day 30**              | Mature-cohort conversion, cancellations and lapses separately; track day-60 conversion when follow-up has matured.                     | Existing signing and exit events support counts and elapsed days. Lost Bookings already lists exits. Do not label a recent unresolved case a final failure or divide by today's standing bookings. Cancellation reason and authorised physical stock-release date need separate confirmation if absent.                                                                  |
| **Time Waiting On Each Party**                       | Buyer, bank, solicitor and developer intervals, including open waits and hand-offs, with explicit unknown periods.                     | Replay confirmed events through `deriveCase` and `ballInCourt` at each change. Existing Forecast groups today's holder and time in stage; that is not cumulative time with that party. The result remains a rule-based proxy until the missing readiness facts are captured. Report parallel-bank intervals separately; do not double-count them as calendar days saved. |
| **Recovery And Inventory Guardrails**                | Rejection-to-next-submission time, observed later signings, and cancellation-to-authorised-release time; watch staff minutes per case. | Submission, rejection, task and signing timestamps already support much of the first measure. Forecast already shows second-bank outcomes, which are descriptive and selection-biased. Actual inventory release/rebooking evidence and staff effort are not fully recorded. Booking-to-cancellation days are not proof of inventory days saved.                          |

### A Twelve-Week Pilot On One Project

1. **Days 1–14 — Establish The Baseline.** Name one Sales Admin coordinator and
   existing Loan/Legal counterparts. Audit the same project's preceding
   comparable intake with at least 30 days of follow-up. Rebuild cause counts
   from closed files and distinguish overlapping causes. Agree eligibility,
   legal proof, panel commitments and a worthwhile uplift before seeing results.
   Start with mortgage-financed bookings; cash and specialist cases need an
   explicit workflow and must be reported outside this pilot's claim.
2. **Days 15–44 — Enrol Prospectively.** Allocate eligible new bookings by a
   pre-agreed lottery within booking-week and financing-profile groups to
   Mortar-assisted or ordinary follow-up. Retain ordinary service for both.
   Freeze the register at entry; never exclude a later rejection or a buyer who
   stops responding. Do not compare staff-selected “rescue candidates” with
   every other buyer.
3. **Days 15–74 — Run The Intervention.** Hold a 15-minute daily chase review:
   confirm the blocker, owner, promised next date and subsequent evidence. Log
   whether the Mortar action was actually used, including missed follow-ups.
   Keep the same promotions and record bank, staff or policy changes. Log
   spill-over where staff apply Mortar's process to comparison cases.
4. **Days 75–84 — Reconcile And Compare.** Legal checks execution evidence for
   every claimed signing and audits a sample of unsigned/exited files. All
   day-44 entrants have reached day 30 by day 74. Present the historical
   before/after result beside the simultaneous comparison; use the latter to
   separate the intervention from launch phase or bank turnaround changes.
5. **Day 84 — Decide On Evidence.** Publish counts, rates, the percentage-point
   difference and a 95% interval. Estimate additional timely SPAs as assisted
   bookings multiplied by the comparison-adjusted rate difference, with its
   uncertainty. Analyse by original allocation, including cases staff did not
   chase. A small or imbalanced sample is inconclusive, not permission to call
   the forecast a result.

Read longer-term conversion at a common follow-up age. At day 84, only pilot
entrants booked by day 24 have a complete 60-day window; do not compare their
day-60 result with the whole younger cohort. If the sponsor cannot support a
credible comparison, report before/after as an association and explain the
remaining confounding.

### What The Demo Can And Cannot Claim

The demo can show a functioning chain from evidence to a named action, updated
bank/document state, an appointment and a recorded signing. Five read-only
behaviour checks also reproduced the important gaps: fresh rejection and
hesitation without a stall, approval taking precedence over an outstanding
approving-bank document, a missed appointment absent from Today/Manager, and an
older unsigned booking remaining actionable outside the forecast horizon.

It cannot claim recovered Chin Hin sales, fewer lapses, days saved, real-world
forecast accuracy or cash brought forward. The forecast sums stage-and-age
probabilities, falls back to broader rates with fewer than eight comparable
cases, and estimates signing **by each booking's day 30**, not during the next
30 calendar days. Its 10th–90th percentile count range assumes independent
outcomes and does not include all model or common bank-delay uncertainty.
**Sources: `forecast`, `probability`, `exactCountRange`; Pitch, Evidence And
Assumptions.**

The existing example of 40 stalled bookings improving from 20% to 40% gives
eight additional timely SPAs: `40 × (0.40 − 0.20) = 8`. This is assumption-led
planning arithmetic. A five-point improvement would give two. Neither figure is
a finding, and multiplying either by unit price does not establish cash
received. **Source: Product Overview, Illustrative Impact, Not A Finding.**

## The Pitch, Sharpened

### Say These Four Lines

> “Mortar helps your existing teams turn a recorded blocker into an owned, dated
> next move, while keeping the booking open until its outcome is known.”

> “We can show the document request, the bank hand-over and the signing record;
> the bank still decides credit, and Legal verifies execution.”

> “These records are simulated. Today we demonstrate the workflow, not extra
> Chin Hin sales.”

> “Give us one project and a comparable cohort: in twelve weeks, judge the
> change in the 30-day verified SPA rate, with cancellations kept in the count.”

Use the bank hand-over line only with explicit acknowledgement evidence in the
case note; the present receipt event does not prove that step by itself. Keep
the chart opening to about 45 seconds, then spend the demo on the action and its
evidence. Show Your Tasks in its current tab, not the retired right rail.

### Stop Or Replace These Three Claims

| Current Script Line, Quoted Exactly                                                   | Why A Sales Director Would Challenge It                                                                                                                | Say Instead                                                                                                                                     |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| “These seven have their loan and only need a signing date.”                           | The filter proves approval plus no recorded appointment. It does not prove accepted terms, available funds, completed drafting or developer clearance. | “These seven have recorded loan approval and no appointment. Legal checks what still prevents signing, then owns the next move.”                |
| “Mortar makes sure every booking has a named person on its next step until it signs.” | The rules recommend a desk, but Today does not admit every fresh risk and an owned task still depends on staff action. Some bookings properly exit.    | “Mortar shows who should act next and lets staff assign dated work. Our pilot will test whether that follow-through produces more timely SPAs.” |
| “Nobody retypes WhatsApp into Mortar, and a person confirms with one click.”          | Staff must select, paste and review messages. Confirmation records an interpretation; the real document or signing still needs evidence.               | “Staff paste the message. Mortar AI proposes the update, and staff check it against the evidence before confirming.”                            |

The script already disclaims conversion uplift and cash claims; retain those
boundaries. Correct any remaining “cash forecast” description to “SPA signing
outlook”. Align Team's “Expected Signings In 30 Days” label with the actual
booking-day-30 horizon already stated in Forecast and Sales Chart.

## Do Not Build

| Tempting Work                                                                             | Decision And Reason                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A broader mortgage rescue or eligibility engine                                           | Do not build before the pilot. A justified Loan Admin review uses existing bank attempts and guidance. Product matching, universal DSR cut-offs and automatic borrower restructuring require verified bank-specific facts; they can mislead or impede launch bookings.   |
| A 48-hour automatic exit, refund-letter engine or LAD burn clock                          | Keep Release Review advisory. It already exists. Two rejections do not establish that all recovery paths have failed. Automatic lapse, forfeiture or daily damages amounts would import unverified policy/legal assumptions and can sacrifice recoverable sales.         |
| Learned bank/solicitor league tables or a more elaborate forecast                         | Start with actual promised dates and measured outcomes. The current data is synthetic and partner mix matters. A better-looking probability or more charts does not obtain a missing document or a signature. Keep cash collection and accounting out of this SPA pilot. |
| Full ERP write-back, automatic WhatsApp outreach, OCR pipelines or external-party portals | Defer to a demonstrated pilot bottleneck. Spreadsheet intake and selective pasted evidence already test the process. Extra integration and adoption dependencies are poor pitch-week work under the sponsor's time and authority limits.                                 |
| More 3D polish, journey illustrations, new dashboards or another closing screen           | Freeze the visual structure. Today, the case panel, Legal and Forecast already provide the required places. Invest the remaining effort in the correctness of the next move and its evidence.                                                                            |

These decisions follow the parked Feature Ideas while recognising what has since
shipped: advisory financing risk, Release Review, multi-bank tracking and
outcome reports already exist. The missing work is dependable follow-through and
proof of impact, not another catalogue of features.
