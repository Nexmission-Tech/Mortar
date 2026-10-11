/**
 * Manager row — one overdue case in the Manager's Decisions For You, drawn as
 * a Today worklist row: unit and buyer (which open the case panel), the
 * blocker and how far past its expected wait the case is, then the next step,
 * the person it waits on and Request Follow-Up. No percentages and no Mortar
 * AI scores: the blocker says why the case is here.
 *
 * Request Follow-Up raises the next step as a task for the person holding the
 * case, flagged as the Manager's; the server reuses an equivalent open task
 * rather than adding a second one.
 */

import { useState } from 'react'
import { Send } from 'lucide-react'
import { RiskChip, STAGE_LABELS, formatRm } from '@/components/case'
import { stepToTask } from '@/components/case/nextStep'
import { blockerIcon, documentStepLabel } from '@/components/chase/chase'
import { headlineBlocker } from '@/components/chase/today'
import {
  ClockPill,
  RowBlocker,
  RowFacts,
  RowIdentity,
  WorklistRow,
  daysTitle,
  useDetails
} from '@/components/chase/worklist'
import { DESK_OF_PERSONA, RoleLabel } from '@/components/people/RoleLabel'
import { Button } from '@/components/ui/button'
import { notify } from '@/components/ui/toastConfig'
import { postTask } from '@/lib/api'
import { overdueBy, type ManagerCase } from './managerQueue'

export function ManagerCard({
  item,
  referenceDate,
  managerName,
  onSent,
  onInspect,
  tourTarget
}: {
  item: ManagerCase
  referenceDate: string
  managerName: string
  /** Called once the follow-up is saved, to refresh the queue. */
  onSent: () => Promise<void> | void
  /** Opens the case's case panel over the worklist. */
  onInspect: () => void
  tourTarget?: string
}) {
  const { booking, summary, wait, recipient, ownerRole, step } = item
  const [saving, setSaving] = useState(false)
  const headline = headlineBlocker(summary.stallReasons) ?? { text: wait.reason, generic: false }
  const late = overdueBy(wait)
  const unit = wait.unit === 'working days' ? (late === 1 ? 'Working Day' : 'Working Days') : late === 1 ? 'Day' : 'Days'

  const send = async () => {
    if (!recipient || saving) return
    setSaving(true)
    try {
      await postTask({
        ...stepToTask(step, booking, referenceDate, { daysUntilDue: 0 }),
        ownerRole,
        ownerName: recipient.name,
        managerFlaggedBy: managerName
      })
      notify.success(`Follow-up sent to ${recipient.name}.`)
      await onSent()
    } catch (e) {
      notify.error(e instanceof Error ? e.message : 'Could not send the follow-up. Try again.')
      await onSent()
    } finally {
      setSaving(false)
    }
  }

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
      blockers={summary.stallReasons.length > 0 ? summary.stallReasons : [wait.reason]}
    />
  )

  return (
    <WorklistRow
      testId={`manager-card-${booking.id}`}
      tourTarget={tourTarget}
      identity={<RowIdentity booking={booking} onInspect={onInspect} />}
      blocker={
        <RowBlocker
          icon={blockerIcon(summary.stallReasons, step.document)}
          text={headline.text}
          generic={headline.generic}
          pills={
            <>
              <ClockPill
                tone="danger"
                label={`Overdue ${late} ${unit}`}
                clock={`${late} ${unit.toLowerCase()} beyond this step's expected wait.`}
              />
              {summary.risk.level === 'high' ? <RiskChip risk={summary.risk} /> : null}
            </>
          }
        />
      }
      action={
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm font-medium leading-5 text-foreground">
                {documentStepLabel(step.label, step.document)}
              </span>
              {recipient ? <RoleLabel desk={DESK_OF_PERSONA[recipient.persona]} /> : null}
            </span>
            <span className="text-[13px] leading-[18px] text-muted-foreground">
              {recipient ? recipient.name : 'No One On The Team'}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1 max-md:w-full max-md:justify-between max-md:pt-1">
            {recipient ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="max-md:mr-auto"
                disabled={saving}
                onClick={() => void send()}
              >
                <Send aria-hidden="true" />
                {saving ? 'Sending…' : 'Request Follow-Up'}
              </Button>
            ) : null}
            {toggle}
          </div>
        </div>
      }
      details={panel}
    />
  )
}
