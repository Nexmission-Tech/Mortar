/**
 * Tasks panel — the case's open and completed follow-up tasks, each with its
 * owner, due date and origin. Complete opens the task's close-out in place:
 * what happened, then the update recorded or a next date. A completed task
 * shows what its close-out said.
 */

import { useRef, useState } from 'react'
import { canManageTaskStatus, type Task } from '@mortar/core'
import { OwnerBadge } from '@/components/case/OwnerBadge'
import { formatDate } from '@/components/case/format'
import { TaskCloseOut } from '@/components/chase/TaskCloseOut'
import { NEXT_ACTION_LABELS } from './labels'
import { ApiError, updateTask, type TaskCloseOut as CloseOut } from '@/lib/api'
import { notify } from '@/components/ui/toastConfig'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { usePersonaSafe } from '@/lib/persona'

export function TasksPanel({
  tasks,
  referenceDate,
  onChanged
}: {
  tasks: Task[]
  /** The desks' today: a close-out's next date runs from it. */
  referenceDate: string
  onChanged: () => Promise<void>
}) {
  const { profile } = usePersonaSafe()
  const [pendingId, setPendingId] = useState<string | null>(null)
  /** The task whose close-out is open; one at a time. */
  const [closing, setClosing] = useState<string | null>(null)
  /** Each open task's Complete, to take focus back when its close-out is cancelled. */
  const completeButtons = useRef(new Map<string, HTMLButtonElement>())
  const ordered = [...tasks].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'open' ? -1 : 1
    return a.dueOn.localeCompare(b.dueOn) || a.id.localeCompare(b.id)
  })

  const complete = async (task: Task, closeOut: CloseOut) => {
    setPendingId(task.id)
    try {
      await updateTask(task.id, 'done', closeOut)
      notify.success(
        closeOut.followUpOn ? `Task completed. Follow-up due ${formatDate(closeOut.followUpOn)}.` : 'Task completed.'
      )
      setClosing(null)
      await onChanged()
    } catch (e) {
      // The server's own words for a refusal it wants read (4xx); a plain sentence
      // for anything else, never a raw status or technical wording (DESIGN.md).
      notify.error(e instanceof ApiError ? e.message : 'The Task Could Not Be Updated. Try Again.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Tasks</h2>
        {ordered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No Tasks Yet.</p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {ordered.map((task) => {
              const canComplete = task.status === 'open' && canManageTaskStatus(task, profile)
              return (
                <li key={task.id} className="flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          task.status !== 'open' && 'text-muted-foreground line-through'
                        )}
                      >
                        {task.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <OwnerBadge role={task.ownerRole} name={task.ownerName} />
                        <Badge variant="secondary">{NEXT_ACTION_LABELS[task.action]}</Badge>
                        <Badge variant="outline">{task.origin === 'jev' ? 'Mortar AI' : 'Staff'}</Badge>
                        {task.managerFlaggedBy && (
                          <span className="text-xs font-medium">Manager Flag · {task.managerFlaggedBy}</span>
                        )}
                        <span className="text-[13px] text-muted-foreground">Due {formatDate(task.dueOn)}</span>
                      </div>
                      {task.status === 'done' && task.result ? (
                        <p className="mt-1 text-[13px]">
                          <span className="text-muted-foreground">Result: </span>
                          {task.result}
                        </p>
                      ) : null}
                    </div>
                    {canComplete && (
                      <Button
                        ref={(node: HTMLButtonElement | null) => {
                          if (node) completeButtons.current.set(task.id, node)
                          else completeButtons.current.delete(task.id)
                        }}
                        size="sm"
                        variant="ghost"
                        className="shrink-0"
                        aria-expanded={closing === task.id}
                        disabled={pendingId === task.id}
                        onClick={() => setClosing(closing === task.id ? null : task.id)}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                  {canComplete && closing === task.id ? (
                    <TaskCloseOut
                      task={task}
                      referenceDate={referenceDate}
                      busy={pendingId === task.id}
                      onClose={(closeOut) => void complete(task, closeOut)}
                      onCancel={() => {
                        completeButtons.current.get(task.id)?.focus()
                        setClosing(null)
                      }}
                    />
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
