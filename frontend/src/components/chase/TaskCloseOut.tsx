/**
 * The close-out a task's Complete opens, in place under the task: one line on
 * what happened, then either the update it led to was recorded, or the next
 * date to try again. A ticked box says nothing about the case; "called the
 * banker, no answer" and "banker confirmed approval Friday" must not read the
 * same. A next date raises the same task again on the same desk, so a chase
 * that produced nothing stays on its owner's Today.
 */

import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { addWorkDays, type Task } from '@mortar/core'
import { DateField } from '@/components/bookings/DateField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { TaskCloseOut as CloseOut } from '@/lib/api'

type Outcome = 'recorded' | 'follow_up'

export function TaskCloseOut({
  task,
  referenceDate,
  busy,
  onClose,
  onCancel
}: {
  task: Task
  /** The desks' today: the earliest next date, and the default two working days on. */
  referenceDate: string
  busy: boolean
  onClose: (closeOut: CloseOut) => void
  /** Closes the form unsaved; the caller returns focus to the control that opened it. */
  onCancel: () => void
}) {
  const [result, setResult] = useState('')
  const [outcome, setOutcome] = useState<Outcome | ''>('')
  const [followUpOn, setFollowUpOn] = useState(() => addWorkDays(referenceDate, 2))
  const id = (part: string) => `close-out-${part}-${task.id}`
  const ready = result.trim() !== '' && outcome !== '' && (outcome === 'recorded' || followUpOn !== '')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!ready || busy) return
    onClose(outcome === 'follow_up' ? { result: result.trim(), followUpOn } : { result: result.trim() })
  }

  // Escape cancels, as Cancel does; one pressed in the open calendar only closes the calendar.
  const escape = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Escape' || busy || !event.currentTarget.contains(event.target as Node)) return
    event.preventDefault()
    onCancel()
  }

  return (
    <form
      onSubmit={submit}
      onKeyDown={escape}
      aria-label={`Close Out: ${task.title}`}
      className="mt-2 flex flex-col gap-3 rounded-md border border-border bg-muted p-3"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id('result')}>What Happened</Label>
        <Input
          id={id('result')}
          value={result}
          onChange={(e) => setResult(e.target.value)}
          maxLength={300}
          autoComplete="off"
          autoFocus
          placeholder="e.g. No answer, try Tuesday"
        />
      </div>
      <RadioGroup
        value={outcome}
        onValueChange={(value) => setOutcome(value as Outcome)}
        aria-label="What Comes Next"
        className="gap-2"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="recorded" id={id('recorded')} />
          <Label htmlFor={id('recorded')} className="text-sm font-normal">
            Recorded An Update
          </Label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RadioGroupItem value="follow_up" id={id('follow-up')} />
          <Label htmlFor={id('follow-up')} className="text-sm font-normal">
            Follow Up On
          </Label>
          <div className="w-40">
            <DateField
              id={id('date')}
              label="Follow Up On"
              value={followUpOn}
              onChange={(next) => {
                setFollowUpOn(next)
                setOutcome('follow_up')
              }}
              min={referenceDate}
              today={referenceDate}
            />
          </div>
        </div>
      </RadioGroup>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" variant="secondary" disabled={!ready || busy}>
          {busy ? 'Closing…' : 'Close Task'}
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
