import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { STORIES } from '@mortar/core'
import { CaseActionSheet } from '@/components/bookings/CaseActionSheet'

const booking = STORIES.find((s) => s.booking.id === 'BK-9002')!.booking

describe('CaseActionSheet', () => {
  it('shows its title, the case and its body only while open', () => {
    const { rerender } = render(
      <CaseActionSheet action={null} booking={booking} onClose={() => {}}>
        <p>Form Body</p>
      </CaseActionSheet>
    )
    expect(screen.queryByText('Form Body')).toBeNull()
    rerender(
      <CaseActionSheet action="record" booking={booking} onClose={() => {}}>
        <p>Form Body</p>
      </CaseActionSheet>
    )
    const dialog = screen.getByRole('dialog', { name: 'Record An Update' })
    expect(dialog.textContent).toContain(booking.unit)
    expect(screen.getByText('Form Body')).toBeTruthy()
  })

  it('closes through its close button', () => {
    const onClose = vi.fn()
    render(
      <CaseActionSheet action="guidance" booking={booking} onClose={onClose}>
        <p>Guidance</p>
      </CaseActionSheet>
    )
    expect(screen.getByRole('dialog', { name: 'What To Do' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Close/ }))
    expect(onClose).toHaveBeenCalled()
  })
})
