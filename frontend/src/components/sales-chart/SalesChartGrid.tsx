/**
 * The Sales Chart's Grid view: one table per block, top floor first, a cell per
 * unit in its state's tone. The whole chart is one tab stop; arrow keys move
 * between cells and across blocks, Enter selects. It is the chart's accessible
 * form and the fallback when the Building view cannot draw.
 */
import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { ChartUnit } from '@mortar/core'
import { cn } from '@/lib/utils'
import { STATE_LABELS } from './salesChart'
import { UNIT_FILL, UnitMark } from './unitTone'

type SalesChartGridProps = {
  units: ChartUnit[]
  /** Units the active filter lights; `null` when no filter is on. */
  lit: ReadonlySet<string> | null
  selected: string | null
  onSelect: (unit: ChartUnit) => void
  onHover: (unit: ChartUnit | null) => void
}

interface BlockGrid {
  block: string
  unitLabels: string[]
  /** Rows top floor first; each row's cells unit 1 first. */
  rows: { floorLabel: string; cells: ChartUnit[] }[]
}

const STEPS: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1]
}

function toBlocks(units: ChartUnit[]): BlockGrid[] {
  const blocks = new Map<string, Map<number, ChartUnit[]>>()
  for (const unit of units) {
    const floors = blocks.get(unit.block) ?? new Map<number, ChartUnit[]>()
    const row = floors.get(unit.floor) ?? []
    row.push(unit)
    floors.set(unit.floor, row)
    blocks.set(unit.block, floors)
  }
  return [...blocks].map(([block, floors]) => {
    const rows = [...floors.entries()]
      .sort(([a], [b]) => b - a)
      .map(([, cells]) => ({ floorLabel: cells[0]!.floorLabel, cells: [...cells].sort((a, b) => a.unit - b.unit) }))
    return { block, unitLabels: rows[0]?.cells.map((cell) => cell.unitLabel) ?? [], rows }
  })
}

export function SalesChartGrid({ units, lit, selected, onSelect, onHover }: SalesChartGridProps) {
  const blocks = useMemo(() => toBlocks(units), [units])
  const [focus, setFocus] = useState<string | null>(null)
  const refs = useRef(new Map<string, HTMLButtonElement>())
  const focusCode = focus ?? blocks[0]?.rows[0]?.cells[0]?.code ?? null

  const move = (b: number, r: number, c: number, event: KeyboardEvent) => {
    const delta = STEPS[event.key]
    if (!delta) return
    event.preventDefault()
    let [block, col] = [b, c + delta[1]]
    const row = r + delta[0]
    const width = (i: number) => blocks[i]?.unitLabels.length ?? 0
    if (col < 0 && block > 0) [block, col] = [block - 1, width(block - 1) - 1]
    if (col >= width(block) && block < blocks.length - 1) [block, col] = [block + 1, 0]
    const target = blocks[block]?.rows[row]?.cells[col]
    if (!target) return
    setFocus(target.code)
    refs.current.get(target.code)?.focus()
  }

  return (
    <div className="flex gap-8 overflow-x-auto pb-2">
      {blocks.map((grid, b) => (
        <table key={grid.block} className="shrink-0 border-separate border-spacing-[2px]">
          <caption className="pb-2 text-left text-xs font-semibold text-foreground">
            Block {grid.block}
            <span className="ml-1.5 font-normal tabular-nums text-muted-foreground">
              {grid.rows.length * grid.unitLabels.length} Units
            </span>
          </caption>
          <thead>
            <tr>
              <td>
                <span className="sr-only">Floor</span>
              </td>
              {grid.unitLabels.map((label) => (
                <th
                  key={label}
                  scope="col"
                  className="w-[18px] pb-0.5 text-center font-mono text-[9px] font-normal text-muted-foreground"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.rows.map((row, r) => (
              <tr key={row.floorLabel}>
                <th
                  scope="row"
                  className="pr-1.5 text-right font-mono text-[10px] font-normal tabular-nums text-muted-foreground"
                >
                  {row.floorLabel}
                </th>
                {row.cells.map((unit, c) => {
                  const ghost = lit !== null && !lit.has(unit.code)
                  return (
                    <td key={unit.code} className="p-0">
                      <button
                        ref={(node) => {
                          if (node) refs.current.set(unit.code, node)
                          else refs.current.delete(unit.code)
                        }}
                        type="button"
                        tabIndex={unit.code === focusCode ? 0 : -1}
                        aria-label={`${unit.code}, ${STATE_LABELS[unit.state]}`}
                        aria-pressed={unit.code === selected}
                        data-lit={lit === null ? undefined : String(!ghost)}
                        onClick={() => onSelect(unit)}
                        onFocus={() => {
                          setFocus(unit.code)
                          onHover(unit)
                        }}
                        onBlur={() => onHover(null)}
                        onMouseEnter={() => onHover(unit)}
                        onMouseLeave={() => onHover(null)}
                        onKeyDown={(event) => move(b, r, c, event)}
                        className={cn(
                          'flex size-[18px] items-center justify-center rounded-[3px] outline-none transition-colors duration-[var(--motion-fast)] focus-visible:ring-2 focus-visible:ring-ring',
                          ghost ? 'bg-muted' : UNIT_FILL[unit.state],
                          unit.code === selected && 'ring-2 ring-foreground ring-offset-1 ring-offset-card'
                        )}
                      >
                        {!ghost && <UnitMark state={unit.state} />}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  )
}
