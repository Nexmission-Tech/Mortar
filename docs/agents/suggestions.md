# Suggestions Issue (#75)

Issue [#75][i75] is Mortar's standing suggestion box. Anyone posts one idea per
comment, and the team records a decision for each one in the same thread. This
page is the standard procedure for any agent or person who triages, fixes or
reports on a suggestion from #75. Follow it in order every time.

Contents:

1.  [Rules](#rules)
1.  [Terms](#terms)
1.  [Procedure](#procedure)
1.  [Templates](#templates)
1.  [Checklist Before You Finish](#checklist-before-you-finish)

## Rules

- **Keep #75 Open:** it is the intake for every future idea. Do not close it
  when a round of suggestions is answered; post the outcome instead.
- **Read Before You Act:** read the issue body and every comment, with
  pagination, before deciding anything. Earlier comments may already decide,
  link or fix the same suggestion.
- **Every Suggestion Gets An Outcome:** Accepted, Already Tracked, Needs
  Clarification or Declined, as the issue body promises, recorded in #75 with a
  reason.
- **One Accepted Suggestion, One Issue, One Pull Request:** open a focused issue
  for each accepted suggestion, and fix it in its own pull request that says
  `Closes #<issue>` and `Refs #75`. Merge duplicate suggestions into one issue
  and link every source comment.
- **Post An Update In #75 When The Fix Is Opened:** as soon as a pull request
  that fixes, or partly fixes, a suggestion exists, post the
  [Fix Update](#fix-update) comment in #75 in the same session. A fix is not
  finished until that comment is posted. See [step 8](#8-post-the-fix-update).
- **Show Before And After:** every suggestion pull request says what the app did
  before and what it does now, per suggestion, with screenshots for anything
  visible. "Screenshots are available on request" is not enough.
- **Do Not Edit Other People's Comments:** never edit or delete a suggestion.
  Quote it by link.
- **Synthetic Data Only:** no real buyer names, IC numbers, phone numbers or
  bank details in comments, issues or screenshots. See
  [Data Retention](/docs/TRD.md#data-retention).

## Terms

- **Suggestion:** one comment in #75 that proposes a change. A comment with
  several independent ideas holds several suggestions; number each.
- **Suggestion Number:** a running number that names a suggestion in every
  record, in posting order. Numbers 1 to 22 belong to the first round, answered
  by #122 to #125. Continue from the highest number already recorded in #75.
- **Decision Record:** a comment in #75 that gives one or more suggestions their
  outcome. It starts with `<!-- mortar-75:decision -->`.
- **Fix Update:** a comment in #75 that says a pull request for one or more
  suggestions is open, and later that it merged. It starts with
  `<!-- mortar-75:fix -->`.

## Procedure

### 1. Read The Thread

```bash
gh issue view 75 --comments
gh api repos/Nexmission-Tech/Mortar/issues/75/comments --paginate \
  --jq '.[] | {id, user: .user.login, created_at, updated_at, html_url, body}'
```

- List every suggestion with its comment link, author and `updated_at`.
- Find every Decision Record and Fix Update (search for `mortar-75:`) and the
  first round's reconciliation table. A suggestion is new when no record names
  its comment, or when the comment was edited after its latest record.
- Then follow [GitHub Issues And Pull Requests](/docs/agents/github.md): search
  open and closed issues and pull requests for the same change.

### 2. Number Each New Suggestion

Give each new suggestion the next Suggestion Number. Use that number in the
Decision Record, the issue, the pull request and the Fix Update, always together
with the comment link, so a reader can follow one idea end to end.

### 3. Decide The Outcome

Judge each suggestion against the booking-to-SPA workflow and current scope, its
value, its feasibility and dependencies, privacy and access controls, and
overlap with existing issues and pull requests, as the #75 issue body sets out.

| Outcome             | Use It When                                                | What You Do                           |
| ------------------- | ---------------------------------------------------------- | ------------------------------------- |
| Accepted            | The change is clear, fits Mortar and can be checked        | Open a focused issue (step 5)         |
| Already Tracked     | An open or closed issue or pull request covers it          | Link it                               |
| Needs Clarification | A decision or a fact is missing before anyone can build it | Ask for exactly what is missing       |
| Declined            | It conflicts with scope or rests on a false premise        | Give the concrete reason, with a link |

Do not invent requirements to make a vague suggestion buildable. When the
outcome depends on a product decision, ask a maintainer and record the
suggestion as Needs Clarification until they answer.

### 4. Post The Decision Record

Post one [Decision Record](#decision-record) per triage session in #75, covering
every suggestion you decided. Mention each suggester with `@` so they are
notified.

### 5. Open A Focused Issue For Each Accepted Suggestion

Use the **Feature Or Change** form's sections (or **Bug Report** for something
broken). With `gh issue create`, write the body to a file and pass
`--body-file`, keeping the form's headings:

- **Title:** `Feature: <the change>`, or `Bug: <what is broken>`.
- **The Problem:** the suggestion's problem in plain words, with the comment
  link and Suggestion Number on the first line, and `Refs #75`.
- **The Change:** the agreed change, including anything the decision narrowed.
- **Done When:** a checklist a reviewer can tick, taken from the suggestion's
  success check.
- **Area** and **Pitch Priority:** as the form offers.

Then edit the Decision Record's row to link the new issue.

### 6. Build The Fix

Follow [Contributing](/.github/CONTRIBUTING.md): one branch per issue from fresh
`main`, small commits, `bun run check` and `bun run format`, and the Graphify
refresh as the last commit. When one fix must build on another, stack the pull
requests and say the merge order in each one.

### 7. Write The Pull Request

Fill in the template. For a suggestion pull request, also:

- **Why:** `Closes #<issue>` and `Refs #75`, with the Suggestion Number and the
  comment link.
- **Before And After:** under What Changed, one table per suggestion:

  ```markdown
  ### 23. Short Title

  [Suggestion 23](<comment link>)

  |                    | Before                     | After                      |
  | ------------------ | -------------------------- | -------------------------- |
  | What The User Sees | The exact old label or row | The exact new label or row |
  | Rule Or Logic      | What the old code decided  | What the new code decides  |
  | Where In The Code  |                            | `path/file.ts` (`name`)    |
  ```

  Take Before from the removed lines of the diff, and After from the added
  lines. Quote on-screen labels exactly. List anything found and fixed along the
  way in its own Before and After table.

- **Screenshots:** for every visible change, a before and after pair from the
  same persona, page, booking and seeded demo data. Commit them under
  `docs/verification/<issue-or-topic>/` before the Graphify refresh commit, and
  embed them with
  `https://github.com/Nexmission-Tech/Mortar/blob/<branch>/<path>?raw=true`. For
  a docs-only change, show the changed slide or section instead, or say "No
  visible change."
- **Not Done:** anything the suggestion asked for that this pull request leaves
  out, with the reason and the follow-up issue.

### 8. Post The Fix Update

Right after `gh pr create` succeeds, post a [Fix Update](#fix-update) in #75:

- **When:** for every pull request that fixes or partly fixes a suggestion,
  including each pull request in a stack and any pull request that replaces
  another. Post it before you report the work as done.
- **Who:** mention the suggester with `@`, so they hear their idea was taken.
- **What:** the Suggestion Numbers with their comment links, the issue, the pull
  request, one line of Before and After per suggestion, what is left out, the
  merge order, and one step to check it.
- **When A Pull Request Is Replaced Or Closed:** post a new Fix Update naming
  the replacement, or saying the fix stopped and why.

### 9. After The Merge

Edit the Fix Update's Status column to **Merged** and add anything staff must do
on the live site, such as resetting the demo data. Editing does not notify
anyone, so post a short new comment only when the suggester needs to act.

## Templates

Copy these into a file and post with `gh issue comment 75 --body-file <file>`.

### Decision Record

```markdown
<!-- mortar-75:decision -->

**Decisions for suggestions 23 to 25**

| #   | Suggestion          | By         | Outcome             | Reason Or Link                       |
| --- | ------------------- | ---------- | ------------------- | ------------------------------------ |
| 23  | [Short title](link) | @suggester | Accepted            | #140                                 |
| 24  | [Short title](link) | @suggester | Already Tracked     | #131                                 |
| 25  | [Short title](link) | @suggester | Needs Clarification | Which report should show it, A or B? |

Source comments read up to <latest updated_at, UTC>.
```

### Fix Update

```markdown
<!-- mortar-75:fix -->

**Fix opened for suggestion 23: Short title**

@suggester your suggestion was taken, and a fix is open for review.

| #   | Suggestion          | Issue | Pull Request | Status                |
| --- | ------------------- | ----- | ------------ | --------------------- |
| 23  | [Short title](link) | #140  | #141         | Open, awaiting review |

- **Before:** what the app did.
- **After:** what it does once #141 merges.
- **Left Out:** anything not covered, with its issue, or "Nothing."
- **Merge Order:** "Independent", or "After #139".
- **Check It:** one step on the live demo after the merge.
```

## Checklist Before You Finish

- [ ] I read every comment in #75 and every earlier record.
- [ ] Every new suggestion has a number and an outcome in a Decision Record.
- [ ] Each accepted suggestion has its own issue, linked from the record.
- [ ] Each pull request closes one issue, refers to #75, and shows Before And
      After with committed screenshots.
- [ ] A Fix Update is posted in #75 for every pull request I opened.
- [ ] #75 is still open.

[i75]: https://github.com/Nexmission-Tech/Mortar/issues/75
