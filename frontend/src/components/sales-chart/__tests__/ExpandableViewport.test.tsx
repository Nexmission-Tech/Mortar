import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { ExpandableViewport } from '@/components/sales-chart/ExpandableViewport'

function Harness({
  escapeEnabled = true,
  onZoom = () => {}
}: {
  escapeEnabled?: boolean
  onZoom?: (f: number) => void
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <ExpandableViewport
      label="Building View"
      expanded={expanded}
      onExpandedChange={setExpanded}
      escapeEnabled={escapeEnabled}
      onZoom={onZoom}
    >
      {(mode) => <p>Scene {mode}</p>}
    </ExpandableViewport>
  )
}

describe('ExpandableViewport', () => {
  it('zooms in and out from the controls at its bottom right', () => {
    const onZoom = vi.fn()
    render(<Harness onZoom={onZoom} />)
    fireEvent.click(screen.getByRole('button', { name: 'Zoom In' }))
    fireEvent.click(screen.getByRole('button', { name: 'Zoom Out' }))
    expect(onZoom.mock.calls.map(([f]) => f > 1)).toEqual([true, false])
  })

  it('expands into a modal over the whole page, and collapses back', () => {
    render(<Harness />)
    expect(screen.getByText('Scene inline')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Expand' }))
    const dialog = screen.getByRole('dialog', { name: 'Building View' })
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.textContent).toContain('Scene expanded')
    expect(dialog.parentElement?.parentElement).toBe(document.body)
    expect(screen.queryByText('Scene inline')).toBeNull()
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent.click(screen.getByRole('button', { name: 'Collapse' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByText('Scene inline')).toBeTruthy()
    expect(document.body.style.overflow).toBe('')
  })

  it('collapses on Escape or a backdrop click, and gives focus back to Expand', () => {
    render(<Harness />)
    const expand = screen.getByRole('button', { name: 'Expand' })
    fireEvent.click(expand)
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Collapse' }))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Expand' }))
    fireEvent.click(screen.getByRole('button', { name: 'Expand' }))
    fireEvent.click(screen.getByTestId('viewport-backdrop'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('leaves Escape to whatever handled it first, or to a selected unit', () => {
    const { rerender } = render(<Harness escapeEnabled={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Expand' }))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.getByRole('dialog')).toBeTruthy()
    rerender(<Harness escapeEnabled />)
    const handled = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
    handled.preventDefault()
    window.dispatchEvent(handled)
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('makes the app behind the modal inert while expanded, so Tab stays out from under the backdrop', () => {
    const root = document.createElement('div')
    root.id = 'root'
    document.body.appendChild(root)
    try {
      render(<Harness />, { container: root })
      fireEvent.click(screen.getByRole('button', { name: 'Expand' }))
      expect(root.hasAttribute('inert')).toBe(true)
      fireEvent.click(screen.getByRole('button', { name: 'Collapse' }))
      expect(root.hasAttribute('inert')).toBe(false)
    } finally {
      root.remove()
    }
  })
})
