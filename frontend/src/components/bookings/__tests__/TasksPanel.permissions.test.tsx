import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Task } from '@mortar/core'
import { TasksPanel } from '../TasksPanel'
import { PersonaProvider } from '@/lib/persona'
import { updateTask } from '@/lib/api'

vi.mock('@/lib/api', async (importOriginal) => ({
  ApiError: (await importOriginal<typeof import('@/lib/api')>()).ApiError,
  updateTask: vi.fn(async () => ({}))
}))
vi.mock('@/components/ui/toastConfig', () => ({ notify: { success: vi.fn(), error: vi.fn() } }))
// The close-out's date field opens inline: Radix's popover positioning stalls jsdom (see inlinePopover).
vi.mock('@/components/ui/popover', () => import('@/components/bookings/__tests__/inlinePopover'))
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
)

const task: Task = {
  id: 'TSK-1',
  bookingId: 'BK-1',
  action: 'call_buyer',
  title: 'Call Buyer',
  ownerRole: 'loan_admin',
  ownerName: 'Tan Mei Ling',
  dueOn: '2026-09-19',
  status: 'open',
  origin: 'staff',
  createdAt: '2026-09-18T09:00:00+08:00',
  completedAt: null
}

describe('TasksPanel task status permissions', () => {
  it('shows completion to the named owner and Manager, hiding it from other profiles', () => {
    render(
      <PersonaProvider initialPersona="loan-admin">
        <TasksPanel tasks={[task]} referenceDate="2026-09-18" onChanged={async () => {}} />
      </PersonaProvider>
    )
    expect(screen.getByRole('button', { name: 'Complete' })).toBeTruthy()
    cleanup()

    render(
      <PersonaProvider initialPersona="sales-admin">
        <TasksPanel tasks={[task]} referenceDate="2026-09-18" onChanged={async () => {}} />
      </PersonaProvider>
    )
    expect(screen.queryByRole('button', { name: 'Complete' })).toBeNull()
    cleanup()

    render(
      <PersonaProvider initialPersona="manager">
        <TasksPanel tasks={[task]} referenceDate="2026-09-18" onChanged={async () => {}} />
      </PersonaProvider>
    )
    expect(screen.getByRole('button', { name: 'Complete' })).toBeTruthy()
  })
})

// Issue #75: the case's Tasks view closes a task out the way Your Tasks does.
describe('TasksPanel close-out', () => {
  it('closes a task out with a next date, then shows what it said', async () => {
    const onChanged = vi.fn(async () => {})
    const view = render(
      <PersonaProvider initialPersona="loan-admin">
        <TasksPanel tasks={[task]} referenceDate="2026-09-18" onChanged={onChanged} />
      </PersonaProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Complete' }))
    fireEvent.change(screen.getByLabelText('What Happened'), { target: { value: 'No answer, try Tuesday' } })
    fireEvent.click(screen.getByRole('radio', { name: 'Follow Up On' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close Task' }))

    await waitFor(() =>
      expect(vi.mocked(updateTask)).toHaveBeenCalledWith('TSK-1', 'done', {
        result: 'No answer, try Tuesday',
        followUpOn: '2026-09-22'
      })
    )
    await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1))
    view.unmount()

    render(
      <PersonaProvider initialPersona="loan-admin">
        <TasksPanel
          tasks={[
            { ...task, status: 'done', completedAt: '2026-09-18T12:00:00+08:00', result: 'No answer, try Tuesday' }
          ]}
          referenceDate="2026-09-18"
          onChanged={onChanged}
        />
      </PersonaProvider>
    )
    expect(screen.getByText('No answer, try Tuesday')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Complete' })).toBeNull()
  })
})
