import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { chartUnits, DEFAULT_PROJECT_SETTINGS } from '@mortar/core'
import { SalesChartGrid } from '../SalesChartGrid'

const settings = { ...DEFAULT_PROJECT_SETTINGS, blocks: ['A', 'B'], minFloor: 3, maxFloor: 4, unitsPerFloor: 2 }
const units = chartUnits(settings, [
  { code: 'A-03-01', state: 'needs_action', bookingId: 'BK-1', heldBy: 'Nurul Aina' },
  { code: 'B-03A-02', state: 'signed', bookingId: null, heldBy: 'Farah Izzati' }
])

const setup = (lit: ReadonlySet<string> | null = null) => {
  const onSelect = vi.fn()
  const onHover = vi.fn()
  render(<SalesChartGrid units={units} lit={lit} selected={null} onSelect={onSelect} onHover={onHover} />)
  return { onSelect, onHover }
}

describe('SalesChartGrid', () => {
  test('names every unit with its state, one table per block, top floor first', () => {
    setup()
    expect(screen.getAllByRole('table')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'A-03-01, Needs Action' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'B-03A-02, SPA Signed' })).toBeTruthy()
    const rows = screen.getAllByRole('rowheader').map((cell) => cell.textContent)
    expect(rows.slice(0, 2)).toEqual(['03A', '03'])
  })

  test('is one tab stop, moved with the arrow keys across blocks', () => {
    setup()
    const buttons = screen.getAllByRole('button')
    expect(buttons.filter((b) => b.tabIndex === 0)).toHaveLength(1)
    const first = buttons.find((b) => b.tabIndex === 0)!
    expect(first.getAttribute('aria-label')).toBe('A-03A-01, Available')
    first.focus()
    fireEvent.keyDown(first, { key: 'ArrowRight' })
    expect(document.activeElement?.getAttribute('aria-label')).toBe('A-03A-02, Available')
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' })
    expect(document.activeElement?.getAttribute('aria-label')).toBe('A-03-02, Available')
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' })
    expect(document.activeElement?.getAttribute('aria-label')).toBe('B-03-01, Available')
    expect(screen.getAllByRole('button').filter((b) => b.tabIndex === 0)).toHaveLength(1)
  })

  test('selects on click and reports hover', () => {
    const { onSelect, onHover } = setup()
    const cell = screen.getByRole('button', { name: 'A-03-01, Needs Action' })
    fireEvent.click(cell)
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ code: 'A-03-01' }))
    fireEvent.mouseEnter(cell)
    expect(onHover).toHaveBeenCalledWith(expect.objectContaining({ code: 'A-03-01' }))
    fireEvent.mouseLeave(cell)
    expect(onHover).toHaveBeenLastCalledWith(null)
  })

  test('ghosts units a filter leaves out', () => {
    setup(new Set(['A-03-01']))
    expect(screen.getByRole('button', { name: 'A-03-01, Needs Action' }).dataset.lit).toBe('true')
    expect(screen.getByRole('button', { name: 'B-03A-02, SPA Signed' }).dataset.lit).toBe('false')
  })

  test('marks the selected unit as current, not as a pressed toggle', () => {
    render(<SalesChartGrid units={units} lit={null} selected="A-03-01" onSelect={vi.fn()} onHover={vi.fn()} />)
    const cell = screen.getByRole('button', { name: 'A-03-01, Needs Action' })
    expect(cell.getAttribute('aria-current')).toBe('true')
    expect(cell.hasAttribute('aria-pressed')).toBe(false)
  })

  test('keeps one tab stop when the focused unit leaves the layout', () => {
    const { rerender } = render(
      <SalesChartGrid units={units} lit={null} selected={null} onSelect={vi.fn()} onHover={vi.fn()} />
    )
    const last = screen.getByRole('button', { name: 'B-03-02, Available' })
    last.focus()
    const smaller = units.filter((u) => u.block === 'A')
    rerender(<SalesChartGrid units={smaller} lit={null} selected={null} onSelect={vi.fn()} onHover={vi.fn()} />)
    expect(screen.getAllByRole('button').filter((b) => b.tabIndex === 0)).toHaveLength(1)
  })

  test('tells a phone that more blocks sit to the side', () => {
    setup()
    expect(screen.getByText('Swipe Sideways For More Blocks.')).toBeTruthy()
  })
})
