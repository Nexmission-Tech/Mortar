/**
 * Today (`/chase`) — every persona's home desk, the Manager's included. One
 * strip of figures, then named views: Actions, Your Tasks and Recent Bookings
 * (Decisions and Follow-Ups for the Manager). Actions is one ordered worklist,
 * a row per booking, read across as which booking, what blocks it, and what
 * to do next. Every list is complete; nothing folds behind a Show More.
 *
 * Sales Admin coordinates every booking to a signed SPA, so their home opens
 * on the whole chase — every desk, every owner. Loan Admin and Legal Admin open
 * on their own desk. The first figure follows the desk filter rather than the
 * persona, so choosing a desk relabels it with the list it counts.
 *
 * Each row's next step is the rule-based move from `ballInCourt` — the same
 * move Waiting On and the table's Task column raise, so one click anywhere
 * creates one task. Mortar AI's cached answer appears only where it differs,
 * as one muted line. Clicking the unit and buyer opens the same case panel a
 * row opens on the ledger.
 */
import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { AlertTriangle, Banknote, BellRing, SearchX, SlidersHorizontal, Users } from 'lucide-react'
import { teamSummary } from '@mortar/core'
import type { Booking, CaseSummary, EventKind, NextActionSuggestion, OwnerRole, RiskLevel, Task } from '@mortar/core'
import { useCases, useSnapshot } from '@/lib/data'
import { ApiError, fetchNextAction, postTask, updateTask } from '@/lib/api'
import { notify } from '@/components/ui/toastConfig'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { Button } from '@/components/ui/button'
import { RefreshErrorBanner } from '@/components/ui/RefreshErrorBanner'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CaseQuickView } from '@/components/bookings/CaseQuickView'
import type { BookingRow } from '@/components/bookings/BookingsTable'
import { quickViewRow } from '@/components/bookings/quickViewRow'
import { ChaseCard } from '@/components/chase/ChaseCard'
import {
  BusiestDesk,
  FollowUpsSent,
  RecentBookings,
  TasksShortcut,
  TodayOverview,
  ViewHeader,
  YourTasks
} from '@/components/chase/TodayRail'
import { Worklist } from '@/components/chase/worklist'
import {
  assignedTasksFor,
  defaultOwnerFilter,
  dueTodayCount,
  headlineFor,
  missedAppointment
} from '@/components/chase/today'
import { ManagerCard } from '@/components/manager/ManagerCard'
import { managerQueue } from '@/components/manager/managerQueue'
import { NEXT_ACTION_LABELS, ownerName as resolveOwnerName } from '@/components/chase/chase'
import { formatRm, formatRmCompact } from '@/components/case'
import { nextStepFor, stepToTask, type NextStep } from '@/components/case/nextStep'
import { PERSONA_DESK_ROLE, usePersona } from '@/lib/persona'

const RISK_OPTIONS: { value: 'all' | RiskLevel; label: string }[] = [
  { value: 'all', label: 'All Risk' },
  { value: 'low', label: 'Low Risk' },
  { value: 'medium', label: 'Medium Risk' },
  { value: 'high', label: 'High Risk' }
]

const OWNER_OPTIONS: { value: 'all' | OwnerRole; label: string }[] = [
  { value: 'all', label: 'All Desks' },
  { value: 'sales', label: 'Sales' },
  { value: 'sales_admin', label: 'Sales Admin' },
  { value: 'loan_admin', label: 'Loan Admin' },
  { value: 'legal', label: 'Legal Admin' }
]

/** The Manager's desks: a follow-up always goes to a person on one of these. */
const MANAGER_DESK_OPTIONS: { value: 'all' | OwnerRole; label: string }[] = [
  { value: 'all', label: 'All Desks' },
  { value: 'sales_admin', label: 'Sales Admin' },
  { value: 'loan_admin', label: 'Loan Admin' },
  { value: 'legal', label: 'Legal Admin' }
]

/** Creation time is optional for old/imported rows. Booking dates are not a substitute. */
function createdWithinLastSevenDays(createdAt: string | null | undefined, referenceDate: string): boolean {
  if (!createdAt || !/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(createdAt)) return false
  const createdDate = createdAt.slice(0, 10)
  const reference = new Date(`${referenceDate}T00:00:00Z`)
  const created = new Date(`${createdDate}T00:00:00Z`)
  if (Number.isNaN(reference.getTime()) || Number.isNaN(created.getTime())) return false
  const firstDate = new Date(reference)
  firstDate.setUTCDate(firstDate.getUTCDate() - 6)
  return created >= firstDate && created <= reference
}

function matchesSuggestedTask(task: Task, booking: Booking, step: NextStep): boolean {
  const normalizeRole = (role: OwnerRole) => (role === 'sales' ? 'sales_admin' : role)
  return (
    task.bookingId === booking.id &&
    task.action === step.action &&
    task.ownerName === resolveOwnerName(step.ownerRole, booking) &&
    normalizeRole(task.ownerRole) === normalizeRole(step.ownerRole)
  )
}

/**
 * After a write removes a row, focus moves to the next row's matching control,
 * or to the list's heading when no row is left, so a keyboard user keeps
 * their place instead of starting again at the top of the page.
 */
function focusAfterWrite(nextRowTestId: string | null, control: string, headingId: string) {
  requestAnimationFrame(() => {
    const row = nextRowTestId ? document.querySelector(`[data-testid="${nextRowTestId}"]`) : null
    const target =
      row?.querySelector<HTMLElement>(`button[aria-label^="${control}"]`) ?? document.getElementById(headingId)
    target?.focus()
  })
}

function AdminToday() {
  const { snapshot, loading, error, refresh } = useSnapshot()
  const cases = useCases()
  const { persona, profile } = usePersona()
  // The persona's own desk, as the owner role its staff member works under.
  const deskRole = PERSONA_DESK_ROLE[persona]
  const [riskFilter, setRiskFilter] = useState<'all' | RiskLevel>('all')
  const [ownerFilter, setOwnerFilter] = useState<'all' | OwnerRole>(() => defaultOwnerFilter(persona))
  const [view, setView] = useState<AdminView>('actions')
  const [mineOnly, setMineOnly] = useState(true)
  const [inspecting, setInspecting] = useState<string | null>(null)

  const applyFilters = (risk: 'all' | RiskLevel, owner: 'all' | OwnerRole) => {
    setRiskFilter(risk)
    setOwnerFilter(owner)
  }
  const [live, setLive] = useState<Record<string, NextActionSuggestion>>({})
  const [suggesting, setSuggesting] = useState<ReadonlySet<string>>(new Set())
  const [creating, setCreating] = useState<ReadonlySet<string>>(new Set())
  const [completing, setCompleting] = useState<ReadonlySet<string>>(new Set())

  const bookings = useMemo(() => new Map((snapshot?.bookings ?? []).map((b) => [b.id, b])), [snapshot])
  const suggestions = useMemo(() => {
    const map = new Map((snapshot?.nextActions ?? []).map((s) => [s.bookingId, s]))
    for (const [id, s] of Object.entries(live)) map.set(id, s)
    return map
  }, [snapshot, live])

  const steps = useMemo(() => {
    const map = new Map<string, ReturnType<typeof nextStepFor>>()
    for (const summary of cases) {
      const booking = bookings.get(summary.bookingId)
      if (!booking) continue
      map.set(summary.bookingId, nextStepFor(booking, summary, NEXT_ACTION_LABELS, suggestions.get(summary.bookingId)))
    }
    return map
  }, [cases, bookings, suggestions])

  /** Bookings with evidence waiting for a person to confirm it. One
   * confirmation can clear a stall outright, so they lead the queue. */
  const awaitingReview = useMemo(
    () => new Set((snapshot?.events ?? []).filter((e) => e.status === 'provisional').map((e) => e.bookingId)),
    [snapshot]
  )

  /** The queue ranks by what clears a stall soonest: a missed SPA appointment
   * first, since its slot is already lost, then evidence awaiting review, then
   * how long each case has sat still, then by booking price, then by age.
   * Jev's urgency score is not in it — asking Jev must never move a card, or
   * the queue reshuffles under the person reading it. */
  const stalled = useMemo(() => {
    // The owner filter's match for a case is the desk that makes its next step.
    const ownerFor = (c: CaseSummary): OwnerRole | undefined => steps.get(c.bookingId)?.defaultStep.ownerRole
    return cases
      .filter((c) => c.stallReasons.length > 0)
      .filter((c) => riskFilter === 'all' || c.risk.level === riskFilter)
      .filter((c) => ownerFilter === 'all' || ownerFor(c) === ownerFilter)
      .sort(
        (a, b) =>
          Number(missedAppointment(b.stallReasons)) - Number(missedAppointment(a.stallReasons)) ||
          Number(awaitingReview.has(b.bookingId)) - Number(awaitingReview.has(a.bookingId)) ||
          b.daysSinceEvidence - a.daysSinceEvidence ||
          (bookings.get(b.bookingId)?.priceRm ?? 0) - (bookings.get(a.bookingId)?.priceRm ?? 0) ||
          b.bookingAgeDays - a.bookingAgeDays
      )
  }, [cases, riskFilter, ownerFilter, steps, bookings, awaitingReview])

  const allStalled = useMemo(() => cases.filter((c) => c.stallReasons.length > 0), [cases])
  const openTasks = useMemo(() => (snapshot?.tasks ?? []).filter((t) => t.status === 'open'), [snapshot])
  const assignedTasks = useMemo(() => assignedTasksFor(openTasks, profile), [openTasks, profile])

  const headline = headlineFor(ownerFilter, deskRole, stalled.length)
  const dueToday = snapshot ? dueTodayCount(assignedTasks, snapshot.meta.referenceDate) : 0

  /** Each booking's open task due soonest. */
  const openTaskByBooking = useMemo(() => {
    const map = new Map<string, Task>()
    for (const task of openTasks) {
      const held = map.get(task.bookingId)
      if (!held || task.dueOn < held.dueOn) map.set(task.bookingId, task)
    }
    return map
  }, [openTasks])

  /** A recommendation is useful only if the same action is not already open. */
  const recommended = useMemo(
    () =>
      stalled.filter((c) => {
        const proposed = steps.get(c.bookingId)?.defaultStep
        const booking = bookings.get(c.bookingId)
        return proposed && booking && !openTasks.some((task) => matchesSuggestedTask(task, booking, proposed))
      }),
    [stalled, steps, openTasks, bookings]
  )

  const recentBookings = useMemo(() => {
    if (!snapshot) return []
    return snapshot.bookings
      .filter((b) => createdWithinLastSevenDays(b.createdAt, snapshot.meta.referenceDate))
      .sort((a, b) => {
        const dateA = a.createdAt ?? ''
        const dateB = b.createdAt ?? ''
        return dateB.localeCompare(dateA) || a.id.localeCompare(b.id)
      })
  }, [snapshot])

  const valueAtRisk = allStalled.reduce((sum, c) => sum + (bookings.get(c.bookingId)?.priceRm ?? 0), 0)

  /** The confirmed evidence kinds per booking, for the case panel's journey. */
  const confirmedKinds = useMemo(() => {
    const map = new Map<string, Set<EventKind>>()
    for (const event of snapshot?.events ?? []) {
      if (event.status !== 'confirmed') continue
      const set = map.get(event.bookingId) ?? new Set<EventKind>()
      set.add(event.kind)
      map.set(event.bookingId, set)
    }
    return map
  }, [snapshot])

  /** The row the case panel shows, built the way `/bookings` builds it. */
  const quickViewCase = useMemo((): BookingRow | null => {
    if (!inspecting) return null
    const booking = bookings.get(inspecting)
    const summary = cases.find((c) => c.bookingId === inspecting)
    if (!booking || !summary) return null
    return {
      booking,
      summary,
      signals: null,
      confirmedKinds: confirmedKinds.get(booking.id) ?? new Set<EventKind>(),
      openTask: openTaskByBooking.get(booking.id) ?? null
    }
  }, [inspecting, bookings, cases, confirmedKinds, openTaskByBooking])

  const setFlag = (set: Dispatch<SetStateAction<ReadonlySet<string>>>, id: string, on: boolean) =>
    set((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  const suggest = async (bookingId: string) => {
    setFlag(setSuggesting, bookingId, true)
    try {
      const suggestion = await fetchNextAction(bookingId)
      setLive((prev) => ({ ...prev, [bookingId]: suggestion }))
      if (suggestion.meta.source === 'unavailable')
        notify.warning('Mortar AI could not check. The usual next step is shown.')
    } catch (e) {
      notify.error(e instanceof ApiError ? e.message : 'Could not reach Mortar AI. Try again.')
    } finally {
      setFlag(setSuggesting, bookingId, false)
    }
  }

  /** Raises whichever step the person picked — the default or Jev's alternative. */
  const createTask = async (bookingId: string, step: NextStep) => {
    const booking = bookings.get(bookingId)
    if (!booking || !snapshot) return
    if (openTasks.some((task) => matchesSuggestedTask(task, booking, step))) return
    setFlag(setCreating, bookingId, true)
    const at = recommended.findIndex((c) => c.bookingId === bookingId)
    const next = recommended[at + 1]?.bookingId ?? null
    try {
      await postTask(
        stepToTask(step, booking, snapshot.meta.referenceDate, {
          daysUntilDue: 0,
          origin: suggestions.get(bookingId)?.action.value === step.action ? 'jev' : 'staff'
        })
      )
      notify.success(`Task created for ${bookingId}: ${step.label}`)
      await refresh()
      focusAfterWrite(next ? `chase-card-${next}` : null, 'Create Task', 'today-queue-heading')
    } catch (e) {
      notify.error(e instanceof ApiError ? e.message : 'Could Not Create The Task. Try Again.')
    } finally {
      setFlag(setCreating, bookingId, false)
    }
  }

  const completeTask = async (task: Task) => {
    setFlag(setCompleting, task.id, true)
    try {
      await updateTask(task.id, 'done')
      notify.success(`Completed: ${task.title}`)
      await refresh()
    } catch (e) {
      notify.error(e instanceof ApiError ? e.message : 'Could Not Complete The Task. Try Again.')
    } finally {
      setFlag(setCompleting, task.id, false)
    }
  }

  const queueCount = recommended.length
  const covered = stalled.length - queueCount
  const queueDetail = `${queueCount} ${queueCount === 1 ? 'Action' : 'Actions'} To Assign${
    covered > 0 ? ` · ${covered} Already Covered By ${covered === 1 ? 'An Open Task' : 'Open Tasks'}` : ''
  }`
  const first = recommended[0]

  return (
    <TodayLayout
      lead="Move Bookings Towards A Signed SPA"
      loading={loading && !snapshot}
      failed={error && !snapshot ? error : null}
      refreshFailed={!!error && !!snapshot}
      onRetry={() => void refresh()}
      overview={
        <TodayOverview
          figures={[
            {
              label: headline.label,
              icon: AlertTriangle,
              value: String(headline.count),
              caption: 'Matching These Filters',
              info: headline.info,
              action: `${headline.count} ${headline.label}. Show all desks and risk levels.`,
              onClick: () => {
                applyFilters('all', 'all')
                setView('actions')
              }
            },
            {
              label: 'Value At Risk',
              icon: Banknote,
              value: formatRmCompact(valueAtRisk),
              exact: formatRm(valueAtRisk),
              caption: 'All Accessible Bookings',
              info: `${formatRm(valueAtRisk)}. Booking value held by stalled cases, not collected revenue.`
            }
          ]}
          third={<TasksShortcut count={dueToday} onOpen={() => setView('tasks')} />}
        />
      }
    >
      <TodayViews
        value={view}
        onValueChange={setView}
        views={[
          { id: 'actions', label: 'Actions', count: String(queueCount) },
          { id: 'tasks', label: 'Your Tasks', count: String(assignedTasks.length), tourTarget: 'open-tasks' },
          { id: 'recent', label: 'Recent Bookings', count: String(recentBookings.length) }
        ]}
        panels={{
          actions: (
            <section aria-label="Work queue" className="flex flex-col gap-3">
              <ViewHeader
                title="Recommended Actions"
                headingId="today-queue-heading"
                detail={queueDetail}
                info="Missed SPA appointments first, then updates awaiting review, then longest without an update, booking value and age."
              >
                <Filters>
                  <FilterSelect
                    label="Risk"
                    ariaLabel="Filter by risk"
                    icon={SlidersHorizontal}
                    value={riskFilter}
                    options={RISK_OPTIONS}
                    onChange={(v) => applyFilters(v as 'all' | RiskLevel, ownerFilter)}
                  />
                  <FilterSelect
                    label="Desk"
                    ariaLabel="Filter by desk"
                    icon={Users}
                    value={ownerFilter}
                    options={OWNER_OPTIONS}
                    onChange={(v) => applyFilters(riskFilter, v as 'all' | OwnerRole)}
                  />
                </Filters>
              </ViewHeader>
              {queueCount === 0 ? (
                allStalled.length === 0 ? (
                  <QueueEmpty
                    title="Nothing To Chase"
                    description="No Accessible Booking Is Stalled"
                    action="Your Tasks"
                    onAction={() => setView('tasks')}
                  />
                ) : stalled.length === 0 ? (
                  <QueueEmpty
                    title="No Bookings Match These Filters"
                    description="Try Another Risk Level Or Desk"
                    action="Clear Filters"
                    onAction={() => applyFilters('all', 'all')}
                  />
                ) : (
                  <QueueEmpty
                    title="All Recommended Actions Have Tasks"
                    description="Your Open Tasks Are In Your Tasks"
                    action="Your Tasks"
                    onAction={() => setView('tasks')}
                  />
                )
              ) : (
                <Worklist label="Recommended actions">
                  {recommended.map((summary) => {
                    const booking = bookings.get(summary.bookingId)
                    const next = steps.get(summary.bookingId)
                    if (!booking || !next) return null
                    const lead = summary === first
                    return (
                      <ChaseCard
                        key={summary.bookingId}
                        tourTarget={lead ? 'today-card' : undefined}
                        actionsTarget={lead ? 'today-actions' : undefined}
                        quickViewTarget={lead ? 'today-quick-view' : undefined}
                        booking={booking}
                        summary={summary}
                        step={next.defaultStep}
                        alternativeStep={next.alternativeStep}
                        openTask={openTaskByBooking.get(summary.bookingId) ?? null}
                        suggesting={suggesting.has(summary.bookingId)}
                        creating={creating.has(summary.bookingId)}
                        onInspect={() => setInspecting(summary.bookingId)}
                        onSuggest={() => void suggest(summary.bookingId)}
                        onCreateTask={(step) => void createTask(summary.bookingId, step)}
                      />
                    )
                  })}
                </Worklist>
              )}
            </section>
          ),
          tasks: (
            <YourTasks
              mine={assignedTasks}
              everyone={openTasks}
              mineOnly={mineOnly}
              onMineOnly={setMineOnly}
              profile={profile}
              referenceDate={snapshot?.meta.referenceDate ?? ''}
              completing={completing}
              onComplete={(t) => void completeTask(t)}
            />
          ),
          recent: (
            <RecentBookings
              bookings={recentBookings}
              canOpen={(id) => cases.some((c) => c.bookingId === id)}
              onOpen={setInspecting}
            />
          )
        }}
      />

      {/* The same case panel a row opens on the ledger, so what happened
          can be recorded from Today without leaving it. A save in here
          refreshes the worklist behind it, as it does there. */}
      <CaseQuickView
        row={quickViewCase}
        referenceDate={snapshot?.meta.referenceDate ?? ''}
        suggestion={inspecting ? suggestions.get(inspecting) : undefined}
        onClose={() => setInspecting(null)}
        onChanged={refresh}
      />
    </TodayLayout>
  )
}

/**
 * The Manager's Today: the same page, with Decisions For You as its worklist
 * (the overdue cases no follow-up covers yet) and Follow-Ups as its second
 * view, under a strip of the overdue count, value at risk across every desk
 * and the busiest desk.
 */
function ManagerToday() {
  const { snapshot, loading, error, refresh } = useSnapshot()
  const cases = useCases()
  const { profile } = usePersona()
  const [riskFilter, setRiskFilter] = useState<'all' | RiskLevel>('all')
  const [deskFilter, setDeskFilter] = useState<'all' | OwnerRole>('all')
  const [view, setView] = useState<ManagerView>('decisions')
  const [inspecting, setInspecting] = useState<string | null>(null)

  const queue = useMemo(
    () => (snapshot ? managerQueue(snapshot, cases) : { decisions: [], sent: [] }),
    [snapshot, cases]
  )
  const team = useMemo(() => (snapshot ? teamSummary(snapshot, cases) : null), [snapshot, cases])
  const inspected = useMemo(
    () => (snapshot && inspecting ? quickViewRow(snapshot, cases, inspecting) : null),
    [snapshot, cases, inspecting]
  )

  const applyFilters = (risk: 'all' | RiskLevel, desk: 'all' | OwnerRole) => {
    setRiskFilter(risk)
    setDeskFilter(desk)
  }

  const decisions = queue.decisions
    .filter((c) => riskFilter === 'all' || c.summary.risk.level === riskFilter)
    .filter((c) => deskFilter === 'all' || c.ownerRole === deskFilter)
  const overdue = queue.decisions.length + queue.sent.length
  const awaiting = queue.sent.filter((c) => c.followUp?.status === 'open').length
  const busiest = team?.rows.find((r) => r.overdue > 0 || r.stalled > 0)

  return (
    <TodayLayout
      lead="Unblock The Cases Waiting On Your Team"
      loading={loading && !snapshot}
      failed={error && !snapshot ? error : null}
      refreshFailed={!!error && !!snapshot}
      onRetry={() => void refresh()}
      overview={
        <TodayOverview
          figures={[
            {
              label: 'Overdue Cases',
              icon: AlertTriangle,
              value: String(overdue),
              caption: 'Across All Desks',
              tone: overdue > 0 ? 'alert' : 'default',
              info: 'Open cases waiting at least half as long again as the step should take, across every desk.',
              action: `${overdue} Overdue Cases. Show all desks and risk levels.`,
              onClick: () => {
                applyFilters('all', 'all')
                setView('decisions')
              }
            },
            {
              label: 'Value At Risk',
              icon: Banknote,
              value: formatRmCompact(team?.valueAtRisk ?? 0),
              exact: formatRm(team?.valueAtRisk ?? 0),
              caption: 'Across All Desks',
              info: `${formatRm(team?.valueAtRisk ?? 0)}. Booking value held by stalled cases, not collected revenue.`,
              to: '/team'
            }
          ]}
          third={<BusiestDesk row={busiest} />}
        />
      }
    >
      <TodayViews
        value={view}
        onValueChange={setView}
        views={[
          { id: 'decisions', label: 'Decisions', count: String(decisions.length) },
          { id: 'followups', label: 'Follow-Ups', count: `${awaiting} Awaiting Reply` }
        ]}
        panels={{
          decisions: (
            <section aria-label="Work queue" className="flex flex-col gap-3">
              <ViewHeader
                title="Decisions For You"
                headingId="today-queue-heading"
                detail={`${decisions.length} ${decisions.length === 1 ? 'Case Needs' : 'Cases Need'} A Follow-Up`}
                info="Cases beyond their expected wait, in the existing priority order."
              >
                <Filters>
                  <FilterSelect
                    label="Risk"
                    ariaLabel="Filter by risk"
                    icon={SlidersHorizontal}
                    value={riskFilter}
                    options={RISK_OPTIONS}
                    onChange={(v) => applyFilters(v as 'all' | RiskLevel, deskFilter)}
                  />
                  <FilterSelect
                    label="Desk"
                    ariaLabel="Filter by desk"
                    icon={Users}
                    value={deskFilter}
                    options={MANAGER_DESK_OPTIONS}
                    onChange={(v) => applyFilters(riskFilter, v as 'all' | OwnerRole)}
                  />
                </Filters>
              </ViewHeader>
              {decisions.length === 0 ? (
                queue.decisions.length === 0 ? (
                  queue.sent.length > 0 ? (
                    <QueueEmpty
                      title="No Decisions Waiting"
                      description="Every Overdue Case Already Has A Follow-Up."
                      action="Follow-Ups"
                      onAction={() => setView('followups')}
                    />
                  ) : (
                    <QueueEmpty
                      title="No Decisions Waiting"
                      description="No Case Has Reached The Follow-Up Threshold"
                    />
                  )
                ) : (
                  <QueueEmpty
                    title="No Decisions Waiting"
                    description="No Overdue Case Matches These Filters."
                    action="Clear Filters"
                    onAction={() => applyFilters('all', 'all')}
                  />
                )
              ) : (
                <Worklist label="Decisions for you">
                  {decisions.map((item, i) => (
                    <ManagerCard
                      key={item.booking.id}
                      tourTarget={i === 0 ? 'today-card' : undefined}
                      item={item}
                      referenceDate={snapshot?.meta.referenceDate ?? ''}
                      managerName={profile.name}
                      onSent={async (sent) => {
                        await refresh()
                        if (sent) {
                          const next = decisions[i + 1]?.booking.id
                          focusAfterWrite(
                            next ? `manager-card-${next}` : null,
                            'Request Follow-Up',
                            'today-queue-heading'
                          )
                        }
                      }}
                      onInspect={() => setInspecting(item.booking.id)}
                    />
                  ))}
                </Worklist>
              )}
            </section>
          ),
          followups: <FollowUpsSent cases={queue.sent} onOpen={setInspecting} />
        }}
      />

      <CaseQuickView
        row={inspected}
        referenceDate={snapshot?.meta.referenceDate ?? ''}
        onClose={() => setInspecting(null)}
        onChanged={refresh}
      />
    </TodayLayout>
  )
}

type AdminView = 'actions' | 'tasks' | 'recent'
type ManagerView = 'decisions' | 'followups'

/**
 * Today's named views. Every panel stays mounted and is only hidden when
 * inactive, so filters, the Mine/Everyone switch and in-flight saves survive
 * a switch.
 */
function TodayViews<V extends string>({
  value,
  onValueChange,
  views,
  panels
}: {
  value: V
  onValueChange: (view: V) => void
  views: { id: V; label: string; count: string; tourTarget?: string }[]
  panels: Record<V, ReactNode>
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as V)} className="gap-0">
      <div className="rounded-md border border-card-border bg-card px-4 shadow-card">
        <TabsList
          variant="line"
          aria-label="Today Views"
          className="h-12 w-full justify-start gap-5 overflow-x-auto md:gap-7"
        >
          {views.map((v) => (
            <TabsTrigger
              key={v.id}
              value={v.id}
              data-tour={v.tourTarget}
              className="h-full flex-none px-0 text-[13px] focus-visible:outline-offset-[-2px] md:text-sm"
            >
              {v.label}
              <span className="text-xs tabular-nums text-muted-foreground">{v.count}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {views.map((v) => (
        <TabsContent key={v.id} value={v.id} forceMount className="mt-5 data-[state=inactive]:hidden">
          {panels[v.id]}
        </TabsContent>
      ))}
    </Tabs>
  )
}

/** Title, lead line, the figures strip, then the views. */
function TodayLayout({
  lead,
  loading,
  failed,
  refreshFailed,
  onRetry,
  overview,
  children
}: {
  lead: string
  loading: boolean
  /** The first load failed: there is nothing to show. */
  failed: string | null
  /** A refresh after a save failed: the page stays, with a way to retry. */
  refreshFailed: boolean
  onRetry: () => void
  overview: ReactNode
  children: ReactNode
}) {
  return (
    <PageContainer>
      <PageHeaderCard tourTarget="today-header">
        <h1 className="text-[32px] font-semibold leading-[1.16] tracking-[-0.02em] text-foreground">Today</h1>
        {!failed ? <p className="mt-1 text-sm text-muted-foreground">{lead}</p> : null}
      </PageHeaderCard>

      {failed ? (
        <div className="mt-4 flex flex-col items-center gap-3">
          <QueueEmpty icon={SearchX} title="Could Not Load Your Bookings" description={failed} />
          <Button variant="secondary" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      ) : loading ? (
        <div className="mt-5 flex flex-col gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-12" />
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-4">
          {refreshFailed ? <RefreshErrorBanner onRetry={onRetry} /> : null}
          {overview}
          <div className="min-w-0">{children}</div>
        </div>
      )}
    </PageContainer>
  )
}

/** The Risk and Desk selects, side by side, a row of their own on phones. */
function Filters({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-2 max-sm:w-full sm:flex">{children}</div>
}

function FilterSelect({
  label,
  ariaLabel,
  icon: Icon,
  value,
  options,
  onChange
}: {
  label: string
  ariaLabel: string
  icon: typeof Users
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span aria-hidden="true" className="text-xs leading-4 text-muted-foreground">
        {label}
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={ariaLabel} className="w-full bg-card sm:w-44">
          <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate text-left">
            <SelectValue />
          </span>
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/** An empty view: what is true, and the one move that helps. */
function QueueEmpty({
  icon: Icon = BellRing,
  title,
  description,
  action,
  onAction
}: {
  icon?: typeof BellRing
  title: string
  description: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-card-border bg-card px-4 py-12 text-center shadow-card">
      <div className="flex size-10 items-center justify-center rounded-md bg-muted">
        <Icon aria-hidden="true" className="size-5 text-muted-foreground" />
      </div>
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && onAction ? (
        <Button type="button" variant="outline" size="sm" className="mt-1" onClick={onAction}>
          {action}
        </Button>
      ) : null}
    </div>
  )
}

export function ChasePage() {
  const { persona } = usePersona()
  return persona === 'manager' ? <ManagerToday /> : <AdminToday />
}
