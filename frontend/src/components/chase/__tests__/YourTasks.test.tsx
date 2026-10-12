import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { profileFor, type Task } from '@mortar/core'
import { YourTasks } from '@/components/chase/TodayRail'
import type { TaskCloseOut } from '@/lib/api'

// The close-out's date field opens inline: Radix's popover positioning stalls jsdom (see inlinePopover).
vi.mock('@/components/ui/popover', () => import('@/components/bookings/__tests__/inlinePopover'))
// Radix sizes each radio with a ResizeObserver, which jsdom lacks.
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
)

function LocationEcho() {
  return <div data-testid="location">{useLocation().pathname}</div>
}

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: 'TASK-1',
    bookingId: 'BK-9001',
    action: 'request_document',
    title: 'Request Payslip From Raymond Tan Wei Hong',
    ownerRole: 'sales',
    ownerName: 'Nurul Aina',
    dueOn: '2026-09-20',
    status: 'open',
    origin: 'jev',
    createdAt: '2026-09-16T00:00:00+08:00',
    completedAt: null,
    ...overrides
  }
}

function renderTasks(
  tasks: Task[],
  onComplete: (task: Task, closeOut: TaskCloseOut) => Promise<boolean>,
  profileId = 'sales-nurul-aina'
) {
  const profile = profileFor(profileId)!
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path="/"
          element={
            <YourTasks
              mine={tasks}
              everyone={tasks}
              mineOnly
              onMineOnly={vi.fn()}
              profile={profile}
              referenceDate="2026-09-18"
              completing={new Set()}
              onComplete={onComplete}
            />
          }
        />
        <Route path="/bookings/:id" element={<LocationEcho />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('YourTasks', () => {
  it('opens the booking case page when a task row title is clicked', () => {
    renderTasks(
      [task()],
      vi.fn(async () => true)
    )

    const link = document.querySelector('a[href="/bookings/BK-9001"]')!
    fireEvent.click(link)

    expect(screen.getByTestId('location').textContent).toBe('/bookings/BK-9001')
  })

  // Issue #75: Complete is a close-out, so "no answer" and "approved Friday" no longer read the same.
  it('closes a task out with what happened and a next date, without navigating away', () => {
    const onComplete = vi.fn(async () => true)
    const t = task({ action: 'chase_banker', title: 'Call The Banker About A-12-03' })
    renderTasks([t], onComplete)

    fireEvent.click(screen.getByRole('button', { name: `Complete: ${t.title}` }))
    expect(onComplete).not.toHaveBeenCalled()
    const form = screen.getByRole('form', { name: `Close Out: ${t.title}` })
    const close = within(form).getByRole('button', { name: 'Close Task' })
    expect(close.hasAttribute('disabled')).toBe(true)

    fireEvent.change(within(form).getByLabelText('What Happened'), { target: { value: 'No answer, try Tuesday' } })
    // A result alone is not enough: the close-out says what comes next.
    expect(close.hasAttribute('disabled')).toBe(true)
    fireEvent.click(within(form).getByRole('radio', { name: 'Follow Up On' }))
    fireEvent.click(close)

    // Two working days on: Friday 18 Sep to Tuesday 22 Sep, never a weekend.
    expect(onComplete).toHaveBeenCalledWith(t, { result: 'No answer, try Tuesday', followUpOn: '2026-09-22' })
    expect(screen.queryByTestId('location')).toBeNull()
  })

  it('closes a task out as Recorded An Update, with no next date', () => {
    const onComplete = vi.fn(async () => true)
    const t = task()
    renderTasks([t], onComplete)

    fireEvent.click(screen.getByRole('button', { name: `Complete: ${t.title}` }))
    fireEvent.change(screen.getByLabelText('What Happened'), { target: { value: 'Payslip received' } })
    fireEvent.click(screen.getByRole('radio', { name: 'Recorded An Update' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close Task' }))

    expect(onComplete).toHaveBeenCalledWith(t, { result: 'Payslip received' })
  })

  it('cancels a close-out without completing the task, by Cancel or Escape, back on its circle', () => {
    const onComplete = vi.fn(async () => true)
    const t = task()
    renderTasks([t], onComplete)
    const circle = screen.getByRole('button', { name: `Complete: ${t.title}` })

    fireEvent.click(circle)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('form')).toBeNull()
    expect(document.activeElement).toBe(circle)

    fireEvent.click(circle)
    fireEvent.keyDown(screen.getByLabelText('What Happened'), { key: 'Escape' })
    expect(screen.queryByRole('form')).toBeNull()
    expect(document.activeElement).toBe(circle)
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('takes the close-out away once the task is closed, and keeps it when closing fails', async () => {
    const t = task()
    const closeOut = async (onComplete: () => Promise<boolean>) => {
      const view = renderTasks([t], onComplete)
      fireEvent.click(screen.getByRole('button', { name: `Complete: ${t.title}` }))
      fireEvent.change(screen.getByLabelText('What Happened'), { target: { value: 'Payslip received' } })
      fireEvent.click(screen.getByRole('radio', { name: 'Recorded An Update' }))
      fireEvent.click(screen.getByRole('button', { name: 'Close Task' }))
      await waitFor(() => expect(onComplete).toHaveBeenCalled())
      return view
    }

    // Even if the list has not refreshed yet, a closed task's form goes, so it cannot be closed twice.
    const closed = await closeOut(vi.fn(async () => true))
    await waitFor(() => expect(screen.queryByRole('form')).toBeNull())
    closed.unmount()

    await closeOut(vi.fn(async () => false))
    expect(screen.getByRole('form', { name: `Close Out: ${t.title}` })).toBeTruthy()
    expect((screen.getByLabelText('What Happened') as HTMLInputElement).value).toBe('Payslip received')
  })

  it('hides completion from a profile who does not own the task', () => {
    renderTasks(
      [task()],
      vi.fn(async () => true),
      'sales-farah-izzati'
    )
    expect(screen.queryByRole('button', { name: /^Complete/ })).toBeNull()
  })

  it('puts manager flagged follow-ups before tasks ordered only by due date', () => {
    renderTasks(
      [
        task({ id: 'TASK-URGENT', title: 'Unflagged Urgent Task', dueOn: '2026-09-18' }),
        task({
          id: 'TASK-FLAGGED',
          title: 'Manager Flagged Task',
          dueOn: '2026-09-22',
          managerFlaggedBy: 'Robert Khoo'
        })
      ],
      vi.fn()
    )

    const rows = screen.getAllByRole('listitem')
    expect(rows[0]?.textContent).toContain('Manager Flagged Task')
    expect(rows[0]?.textContent).toContain('From Robert Khoo')
    expect(rows[1]?.textContent).toContain('Unflagged Urgent Task')
  })

  it('marks a task due today, an overdue one, and a later one', () => {
    renderTasks(
      [
        task({ id: 'T-1', title: 'Late', dueOn: '2026-09-17' }),
        task({ id: 'T-2', title: 'Now', dueOn: '2026-09-18' }),
        task({ id: 'T-3', title: 'Later', dueOn: '2026-09-25' })
      ],
      vi.fn()
    )
    const rows = screen.getAllByRole('listitem')
    expect(rows[0]?.textContent).toContain('Overdue')
    expect(rows[1]?.textContent).toContain('Due Today')
    expect(rows[2]?.textContent).toContain('Due 25 Sep')
  })
})
