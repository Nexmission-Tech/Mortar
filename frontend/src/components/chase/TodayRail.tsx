/**
 * Today's overview and view bodies.
 *
 * The overview is one strip: two workload figures (the first clears the
 * worklist's filters) and a compact third cell, Your Tasks' due shortcut for
 * admins or the busiest desk for the Manager. Below the tabs, each view holds
 * one complete list: Your Tasks, Recent Bookings, or the Manager's Follow-Ups
 * You Sent. No list folds behind a Show More.
 */

import { useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, ChevronRight, ListChecks } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Booking, StaffProfile, Task, TeamRow } from '@mortar/core'
import { canManageTaskStatus } from '@mortar/core'
import { OWNER_ROLE_LABELS, formatDate, formatRm, formatRmCompact } from '@/components/case'
import { DESK_OF_PERSONA, DESK_OF_ROLE, RoleLabel } from '@/components/people/RoleLabel'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { StatusPill } from '@/components/ui/status-pill'
import { cn } from '@/lib/utils'
import type { ManagerCase } from '@/components/manager/managerQueue'
import type { TaskCloseOut as TaskCloseOutValue } from '@/lib/api'
import { TaskCloseOut } from './TaskCloseOut'
import { dueOrOverduePhrase } from './today'

export const EYEBROW = 'text-[11px] font-semibold uppercase leading-[14px] tracking-[0.08em] text-muted-foreground'

const SURFACE = 'rounded-md border border-card-border bg-card shadow-card'
const LABEL = 'text-xs leading-4 text-muted-foreground'

export type TodayFigureCell = {
  label: string
  icon: LucideIcon
  value: string
  /** The scope the number covers, under it. */
  caption: string
  /** The exact figure, for a rounded one. */
  exact?: string
  info?: string
  tone?: 'default' | 'alert'
  /** Applies the filter behind the number. */
  onClick?: () => void
  /** Accessible name for the click, when the number does something. */
  action?: string
  to?: string
}

/** One strip: two figures, then the third cell (spanning both below 1024px). */
export function TodayOverview({ figures, third }: { figures: [TodayFigureCell, TodayFigureCell]; third: ReactNode }) {
  return (
    <section
      aria-label="Today's figures"
      className={cn(SURFACE, 'grid grid-cols-2 lg:grid-cols-[240px_320px_minmax(0,1fr)]')}
    >
      {figures.map((f, i) => {
        const body = (
          <>
            <span className="flex items-center gap-1.5">
              <f.icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-[13px] leading-[18px] text-muted-foreground">{f.label}</span>
            </span>
            <span
              title={f.exact}
              className={cn(
                'whitespace-nowrap text-2xl font-semibold leading-8 tracking-[-0.03em] tabular-nums sm:text-[30px] sm:leading-9',
                f.tone === 'alert' ? 'text-status-danger-fg' : 'text-foreground'
              )}
            >
              {f.value}
              {f.exact ? <span className="sr-only">, exactly {f.exact}</span> : null}
            </span>
            <span className={LABEL}>{f.caption}</span>
          </>
        )
        const className = cn(
          'flex grow flex-col items-start gap-1 text-left',
          (f.onClick || f.to) &&
            'rounded-sm outline-none transition-colors duration-[var(--motion-fast)] hover:text-link focus-visible:ring-2 focus-visible:ring-ring'
        )
        return (
          <div
            key={i}
            className={cn(
              'flex min-w-0 items-start gap-1 px-4 py-3 sm:px-5',
              i === 0 ? 'border-r border-border' : 'lg:border-r lg:border-border'
            )}
          >
            {f.to ? (
              <Link to={f.to} aria-label={f.action} className={className}>
                {body}
              </Link>
            ) : f.onClick ? (
              <button type="button" onClick={f.onClick} aria-label={f.action} className={className}>
                {body}
              </button>
            ) : (
              <div className={className}>{body}</div>
            )}
            {f.info ? (
              <span className="shrink-0">
                <InfoTooltip text={f.info} />
              </span>
            ) : null}
          </div>
        )
      })}
      <div className="col-span-2 min-w-0 border-t border-border px-4 py-3 sm:px-5 lg:col-span-1 lg:border-t-0">
        {third}
      </div>
    </section>
  )
}

/** The admin third cell: a direct way into Your Tasks, counting overdue ones honestly. */
export function TasksShortcut({ count, onOpen }: { count: number; onOpen: () => void }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="flex items-center gap-1.5">
        <ListChecks aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <span className="text-[13px] leading-[18px] text-muted-foreground">Your Tasks</span>
      </span>
      <button
        type="button"
        onClick={onOpen}
        className="-mx-1 flex items-center gap-1 rounded-sm px-1 text-sm font-medium leading-6 text-foreground outline-none transition-colors duration-[var(--motion-fast)] hover:text-link focus-visible:ring-2 focus-visible:ring-ring"
      >
        {dueOrOverduePhrase(count)}
        <ChevronRight aria-hidden="true" className="size-4" />
      </button>
      <span className={LABEL}>Assigned To You</span>
    </div>
  )
}

/** The Manager's third cell: the desk holding the most overdue work, with a way to Team. */
export function BusiestDesk({ row }: { row: TeamRow | undefined }) {
  if (!row)
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[13px] leading-[18px] text-muted-foreground">Busiest Desk</span>
        <span className="text-sm text-muted-foreground">No Desk Has Stalled Work</span>
      </div>
    )
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[13px] leading-[18px] text-muted-foreground">Busiest Desk</span>
        <span className="flex items-center gap-2">
          <RoleLabel desk={DESK_OF_PERSONA[row.persona]} />
          <span className="text-sm font-medium">{row.name}</span>
        </span>
        <span className={LABEL}>
          {row.stalled} Stalled ·{' '}
          <span className="tabular-nums" title={formatRm(row.valueAtRisk)}>
            {formatRmCompact(row.valueAtRisk)}
          </span>
        </span>
      </div>
      <Link
        to="/team"
        className="group flex items-center gap-1 rounded-sm text-[13px] font-medium outline-none hover:text-link focus-visible:ring-2 focus-visible:ring-ring"
      >
        Open Team
        <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  )
}

/** A view's heading: Title Case section title, a muted count line, and controls on the right. */
export function ViewHeader({
  title,
  headingId,
  detail,
  info,
  children
}: {
  title: string
  /** Lets focus land on the heading when the list under it empties. */
  headingId?: string
  detail?: string
  info?: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2
          id={headingId}
          tabIndex={headingId ? -1 : undefined}
          className="flex items-center gap-1 text-base font-semibold leading-6 tracking-[-0.01em] text-foreground outline-none"
        >
          {title}
          {info ? <InfoTooltip text={info} /> : null}
        </h2>
        {detail ? <p className="text-[13px] leading-[18px] text-muted-foreground">{detail}</p> : null}
      </div>
      {children}
    </div>
  )
}

/** A task's due date as one pill: overdue, due today, or the date. */
function DuePill({ dueOn, referenceDate }: { dueOn: string; referenceDate: string }) {
  if (dueOn < referenceDate) return <StatusPill tone="danger">Overdue</StatusPill>
  if (dueOn === referenceDate) return <StatusPill tone="warning">Due Today</StatusPill>
  return <StatusPill tone="neutral">Due {formatDate(dueOn)}</StatusPill>
}

/**
 * Your Tasks: every open task in scope, Manager follow-ups first, then by due
 * date, with a Mine/Everyone switch. Each row's circle opens the task's
 * close-out in place: what happened, then the update recorded or a next date.
 * The title opens the case.
 */
export function YourTasks({
  mine,
  everyone,
  mineOnly,
  onMineOnly,
  profile,
  referenceDate,
  completing,
  onComplete
}: {
  mine: readonly Task[]
  everyone: readonly Task[]
  mineOnly: boolean
  onMineOnly: (mineOnly: boolean) => void
  profile: StaffProfile
  referenceDate: string
  completing: ReadonlySet<string>
  /** Saves the close-out; `true` once the task is closed, so the form can go. */
  onComplete: (task: Task, closeOut: TaskCloseOutValue) => Promise<boolean>
}) {
  /** The task whose close-out is open; one at a time. */
  const [closing, setClosing] = useState<string | null>(null)
  /** Each row's completion circle, to take focus back when its close-out is cancelled. */
  const circles = useRef(new Map<string, HTMLButtonElement>())
  const tasks = [...(mineOnly ? mine : everyone)].sort(
    (a, b) =>
      Number(!!b.managerFlaggedBy) - Number(!!a.managerFlaggedBy) ||
      a.dueOn.localeCompare(b.dueOn) ||
      a.title.localeCompare(b.title)
  )
  return (
    <section aria-label="Your tasks" className="flex flex-col gap-3">
      <ViewHeader title="Your Tasks" detail={`${tasks.length} Open · Manager Follow-Ups First, Then Due Date`}>
        <div role="group" aria-label="Whose tasks" className="flex rounded-md bg-muted p-0.5">
          {[
            { label: 'Mine', on: mineOnly, value: true },
            { label: 'Everyone', on: !mineOnly, value: false }
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={option.on}
              onClick={() => onMineOnly(option.value)}
              className={cn(
                'h-8 rounded-sm px-3 text-[13px] font-medium outline-none transition-colors duration-[var(--motion-fast)] focus-visible:ring-2 focus-visible:ring-ring',
                option.on ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </ViewHeader>
      {tasks.length === 0 ? (
        <div className={cn(SURFACE, 'px-4 py-6 text-center')}>
          <p className="text-sm font-medium text-foreground">{mineOnly ? 'No Open Tasks For You' : 'No Open Tasks'}</p>
          {mineOnly ? (
            <p className="mt-1 text-[13px] text-muted-foreground">Recommended Actions Are Ready When You Are</p>
          ) : null}
        </div>
      ) : (
        <ul className={cn(SURFACE, 'divide-y divide-border')}>
          {tasks.map((task) => {
            const canComplete = canManageTaskStatus(task, profile)
            const busy = completing.has(task.id)
            return (
              <li key={task.id} className="flex items-start gap-3 px-4 py-3">
                {canComplete ? (
                  <button
                    ref={(node) => {
                      if (node) circles.current.set(task.id, node)
                      else circles.current.delete(task.id)
                    }}
                    type="button"
                    aria-label={`Complete: ${task.title}`}
                    aria-expanded={closing === task.id}
                    disabled={busy}
                    onClick={() => setClosing(closing === task.id ? null : task.id)}
                    className="group mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-muted-foreground/60 bg-card outline-none transition-colors duration-[var(--motion-fast)] hover:border-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    <Check
                      aria-hidden="true"
                      className="size-3 opacity-0 transition-opacity group-hover:opacity-100"
                      strokeWidth={3}
                    />
                  </button>
                ) : (
                  <span aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
                )}
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Link
                    to={`/bookings/${task.bookingId}`}
                    className="text-sm font-medium leading-5 text-foreground underline-offset-4 hover:underline"
                  >
                    {busy ? 'Completing…' : task.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-mono text-xs text-muted-foreground">{task.bookingId}</span>
                    <DuePill dueOn={task.dueOn} referenceDate={referenceDate} />
                    {task.managerFlaggedBy ? (
                      <span className="text-xs text-muted-foreground">From {task.managerFlaggedBy}</span>
                    ) : null}
                  </div>
                  {!mineOnly ? (
                    <RoleLabel desk={DESK_OF_ROLE[task.ownerRole]} className="w-fit">
                      {OWNER_ROLE_LABELS[task.ownerRole]} · {task.ownerName}
                    </RoleLabel>
                  ) : null}
                  {canComplete && closing === task.id ? (
                    <TaskCloseOut
                      task={task}
                      referenceDate={referenceDate}
                      busy={busy}
                      onClose={(closeOut) =>
                        void onComplete(task, closeOut).then((closed) => {
                          if (closed) setClosing(null)
                        })
                      }
                      onCancel={() => {
                        circles.current.get(task.id)?.focus()
                        setClosing(null)
                      }}
                    />
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

/** Every booking created in the last seven days, newest first; each opens the case panel. */
export function RecentBookings({
  bookings,
  canOpen,
  onOpen
}: {
  bookings: readonly Booking[]
  canOpen: (id: string) => boolean
  onOpen: (id: string) => void
}) {
  return (
    <section aria-label="Recent bookings" className="flex flex-col gap-3">
      <ViewHeader title="Recent Bookings" detail="Added In The Last 7 Days · Newest First" />
      {bookings.length === 0 ? (
        <div className={cn(SURFACE, 'px-4 py-6 text-center text-sm font-medium text-foreground')}>
          No New Bookings This Week
        </div>
      ) : (
        <ul className={cn(SURFACE, 'divide-y divide-border')}>
          {bookings.map((booking) => (
            <li key={booking.id}>
              {canOpen(booking.id) ? (
                <button
                  type="button"
                  onClick={() => onOpen(booking.id)}
                  aria-label={`Open ${booking.id} · ${booking.buyer.name}`}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-[var(--motion-fast)] hover:bg-accent"
                >
                  <RecentLine booking={booking} />
                </button>
              ) : (
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <RecentLine booking={booking} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function RecentLine({ booking }: { booking: Booking }) {
  return (
    <>
      <span className="flex min-w-0 flex-col">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-mono text-[13px] font-medium">{booking.unit}</span>
          <span className="text-sm">{booking.buyer.name}</span>
        </span>
        <span className="font-mono text-[13px] text-muted-foreground">{booking.id}</span>
      </span>
      <span className="ml-auto shrink-0 text-[13px] tabular-nums text-muted-foreground">
        {formatRm(booking.priceRm)}
      </span>
    </>
  )
}

/**
 * The Manager's follow-ups that still stand: case, blocker, recipient and where
 * the follow-up is. A follow-up stands only until a confirmed update follows it,
 * so a closed task listed here was closed without one: it never reads Answered,
 * and shows what its close-out said instead.
 */
export function FollowUpsSent({ cases, onOpen }: { cases: readonly ManagerCase[]; onOpen: (id: string) => void }) {
  return (
    <section aria-label="Follow-ups you sent" className="flex flex-col gap-3">
      <ViewHeader title="Follow-Ups You Sent" detail="Awaiting Reply Until The Desk Records New Information" />
      {cases.length === 0 ? (
        <div className={cn(SURFACE, 'px-4 py-6 text-center')}>
          <p className="text-sm font-medium text-foreground">No Follow-Ups Waiting On A Reply</p>
          <p className="mt-1 text-[13px] text-muted-foreground">Request A Follow-Up From Decisions For You</p>
        </div>
      ) : (
        <ul className={cn(SURFACE, 'divide-y divide-border')}>
          {cases.map(({ booking, summary, recipient, wait, followUp }) => (
            <li key={booking.id} className="flex flex-col gap-1.5 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onOpen(booking.id)}
                  aria-label={`Quick View ${booking.unit}: ${booking.id} · ${booking.buyer.name}`}
                  className="-mx-1 min-w-0 truncate rounded-sm px-1 text-left hover:bg-accent"
                >
                  <span className="font-mono text-[13px] font-medium">{booking.unit}</span>
                  <span className="text-sm"> {booking.buyer.name}</span>
                </button>
                {followUp?.status === 'open' ? (
                  <StatusPill tone="neutral" className="shrink-0">
                    Awaiting Reply
                  </StatusPill>
                ) : (
                  <StatusPill tone="warning" className="shrink-0">
                    Closed, No Update Yet
                  </StatusPill>
                )}
              </div>
              <span className="text-[13px] text-muted-foreground">{summary.stallReasons[0] ?? wait.reason}</span>
              {followUp?.status === 'done' && followUp.result ? (
                <span className="text-[13px]">
                  <span className="text-muted-foreground">Result: </span>
                  {followUp.result}
                </span>
              ) : null}
              {recipient ? (
                <span className="flex items-center gap-1.5 text-[13px]">
                  <span className="text-muted-foreground">To</span>
                  <RoleLabel desk={DESK_OF_PERSONA[recipient.persona]} />
                  <span className="font-medium">{recipient.name}</span>
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
