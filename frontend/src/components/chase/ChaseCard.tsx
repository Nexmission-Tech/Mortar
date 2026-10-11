/**
 * Chase row — one stalled live booking in Today's worklist.
 *
 * Read across, it answers three questions in order: which booking (unit, buyer
 * and ID, which open the case panel), what blocks it (the first specific
 * reason, with the generic "No Update For N Days" set quietly when it is the
 * only one), and what to do next (the rule-based step from `ballInCourt`, the
 * desk that owns it, and the controls). Every fact and every blocker sits one
 * click away under Details.
 *
 * The step is always the rule-based move every screen leads with, so the same
 * click here, in Waiting On and in the table raises the same task. When Mortar
 * AI's cached answer names a different move, it gets one muted line with a
 * text action that raises it directly. No solid ink control sits in the row:
 * Create Task is outline, and the refresh and Details are ghost icons.
 */

import type { Booking, CaseSummary, Task } from '@mortar/core'
import { RiskChip, STAGE_LABELS, formatDate, formatRm } from '@/components/case'
import { DESK_LABELS, DESK_OF_ROLE, RoleLabel } from '@/components/people/RoleLabel'
import type { NextStep } from '@/components/case/nextStep'
import { Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusPill } from '@/components/ui/status-pill'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { blockerIcon, documentStepLabel } from './chase'
import { headlineBlocker } from './today'
import { ClockPill, RowBlocker, RowFacts, RowIdentity, WorklistRow, daysTitle, useDetails } from './worklist'

/** Days without a confirmed update before a row calls itself overdue. */
const OVERDUE_DAYS = 10

export function ChaseCard({
  tourTarget,
  actionsTarget,
  quickViewTarget,
  booking,
  summary,
  step,
  alternativeStep,
  openTask = null,
  suggesting,
  creating,
  onInspect,
  onSuggest,
  onCreateTask
}: {
  booking: Booking
  summary: CaseSummary
  /** The case's one next step, from `nextStepFor`. */
  step: NextStep
  /** Mortar AI's differing move, when there is one. */
  alternativeStep?: NextStep
  openTask?: Task | null
  suggesting?: boolean
  creating?: boolean
  tourTarget?: string
  actionsTarget?: string
  quickViewTarget?: string
  /** Opens the case's case panel over the worklist. */
  onInspect: () => void
  onSuggest: () => void
  /** Raises the task for the step the person picked. */
  onCreateTask: (step: NextStep) => void
}) {
  const headline = headlineBlocker(summary.stallReasons)
  const overdue = !openTask && summary.daysSinceEvidence >= OVERDUE_DAYS
  const highRisk = summary.risk.level === 'high'

  const { toggle, panel } = useDetails(
    booking.unit,
    <RowFacts
      facts={[
        { label: 'Stage', value: STAGE_LABELS[summary.stage] },
        { label: 'Booking Age', value: daysTitle(summary.bookingAgeDays), numeric: true },
        { label: 'Last Update', value: `${daysTitle(summary.daysSinceEvidence)} Ago`, numeric: true },
        { label: 'Booking Value', value: formatRm(booking.priceRm), numeric: true },
        { label: 'Financing Risk', value: <RiskChip risk={summary.risk} /> }
      ]}
      blockers={summary.stallReasons}
    />
  )

  return (
    <WorklistRow
      testId={`chase-card-${booking.id}`}
      tourTarget={tourTarget}
      identity={<RowIdentity booking={booking} onInspect={onInspect} tourTarget={quickViewTarget} />}
      blocker={
        <RowBlocker
          icon={blockerIcon(summary.stallReasons, step.document)}
          text={headline?.text ?? 'No Stall Recorded'}
          generic={headline?.generic ?? true}
          pills={
            overdue || highRisk ? (
              <>
                {overdue ? (
                  <ClockPill
                    tone="danger"
                    label={`Overdue ${daysTitle(summary.daysSinceEvidence)}`}
                    clock="Days Without A Confirmed Update, Counted From 10 Days."
                  />
                ) : null}
                {highRisk ? <RiskChip risk={summary.risk} /> : null}
              </>
            ) : null
          }
        />
      }
      action={
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm font-medium leading-5 text-foreground">
                {documentStepLabel(step.label, step.document)}
              </span>
              <RoleLabel desk={DESK_OF_ROLE[step.ownerRole]} />
            </span>
            <div
              data-tour={actionsTarget}
              className="ml-auto flex items-center gap-1 max-md:w-full max-md:justify-between max-md:pt-1"
            >
              {openTask ? (
                <p className="mr-auto flex min-w-0 items-center gap-2 text-[13px] text-muted-foreground md:mr-1">
                  <StatusPill tone="info" className="shrink-0">
                    Task Open
                  </StatusPill>
                  <span className="truncate">
                    Due {formatDate(openTask.dueOn)} · {openTask.ownerName}
                  </span>
                </p>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="max-md:mr-auto"
                  disabled={creating}
                  onClick={() => onCreateTask(step)}
                >
                  <Plus aria-hidden="true" />
                  {creating ? 'Creating…' : 'Create Task'}
                </Button>
              )}
              <span className="flex items-center gap-1">
                <AskAgain suggesting={suggesting} onSuggest={onSuggest} />
                {toggle}
              </span>
            </div>
          </div>
          {alternativeStep ? (
            <p className="text-[13px] leading-[18px] text-muted-foreground">
              Mortar AI Suggests {documentStepLabel(alternativeStep.label, alternativeStep.document)} ·{' '}
              {DESK_LABELS[DESK_OF_ROLE[alternativeStep.ownerRole]]} ·{' '}
              <button
                type="button"
                disabled={creating}
                onClick={() => onCreateTask(alternativeStep)}
                className="inline-flex min-h-6 items-center rounded-sm font-medium text-foreground underline underline-offset-4 outline-none hover:text-link focus-visible:ring-2 focus-visible:ring-ring disabled:text-disabled-foreground"
              >
                {creating ? 'Creating…' : 'Use This Action'}
              </button>
            </p>
          ) : null}
        </div>
      }
      details={panel}
    />
  )
}

/**
 * Ask Mortar AI Again as a 32px ghost icon button, with the note on when it
 * last checked in its tooltip rather than on every row.
 */
function AskAgain({ suggesting, onSuggest }: { suggesting?: boolean; onSuggest: () => void }) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Ask Mortar AI Again"
            disabled={suggesting}
            onClick={onSuggest}
          >
            <RefreshCw aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {suggesting ? 'Asking Mortar AI…' : 'Ask Mortar AI again. Mortar AI checked earlier.'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
