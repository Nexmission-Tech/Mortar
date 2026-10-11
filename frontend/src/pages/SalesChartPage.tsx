/**
 * Sales Chart: every unit of the project by how far its booking has got
 * towards a signed SPA. Four figures, three filters, the legend, the chart,
 * and a readout of the unit under the pointer. Clicking a unit raises the unit
 * island with its overview; Open Case brings up the same case panel Today and
 * Bookings use.
 */
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { DEFAULT_PROJECT_SETTINGS, forecast, type ChartUnit } from '@mortar/core'
import { useCases, useSnapshot } from '@/lib/data'
import { usePersona } from '@/lib/persona'
import { cn } from '@/lib/utils'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { StatCard } from '@/components/StatCard'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { RefreshErrorBanner } from '@/components/ui/RefreshErrorBanner'
import { Skeleton } from '@/components/ui/skeleton'
import { CaseQuickView } from '@/components/bookings/CaseQuickView'
import { quickViewRow } from '@/components/bookings/quickViewRow'
import { datasetFor } from '@/components/forecast/forecast'
import { SalesChartGrid } from '@/components/sales-chart/SalesChartGrid'
import {
  bookedAndSigned,
  CHART_FILTERS,
  legendCounts,
  litUnits,
  STATE_LABELS,
  UNIT_STATES,
  unitsForSnapshot,
  type ChartFilter
} from '@/components/sales-chart/salesChart'
import { UNIT_FILL } from '@/components/sales-chart/unitTone'
import { canUseWebGL } from '@/components/sales-chart/webgl'
import { BuildingBoundary } from '@/components/sales-chart/BuildingBoundary'
import { UnitIsland } from '@/components/sales-chart/UnitIsland'
import { unitOverview } from '@/components/sales-chart/unitOverview'

// three.js loads only when the Building view first draws.
const SalesChartBuilding = lazy(() => import('@/components/sales-chart/SalesChartBuilding'))

type ChartView = 'building' | 'grid'
const VIEW_KEY = 'mortar.salesChart.view'

/** The view to open on: the viewer's last choice, else Building where it can draw and fits. */
function initialView(webgl: boolean): ChartView {
  if (!webgl) return 'grid'
  try {
    const stored = window.localStorage.getItem(VIEW_KEY)
    if (stored === 'building' || stored === 'grid') return stored
  } catch {
    // Storage blocked: fall through to the default.
  }
  return window.innerWidth >= 720 ? 'building' : 'grid'
}

export function SalesChartPage() {
  const { snapshot, loading, error, refresh } = useSnapshot()
  const cases = useCases()
  const [params, setParams] = useSearchParams()
  const filter = CHART_FILTERS.find((f) => f.id === params.get('filter'))?.id ?? null
  const { persona } = usePersona()
  const [hoveredCode, setHoveredCode] = useState<string | null>(null)
  const clearHover = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [inspecting, setInspecting] = useState<string | null>(null)
  const [webgl, setWebgl] = useState(canUseWebGL)
  const [sceneFailed, setSceneFailed] = useState(false)
  const [view, setViewState] = useState<ChartView>(() => initialView(webgl))
  const setView = (next: ChartView) => {
    setViewState(next)
    try {
      window.localStorage.setItem(VIEW_KEY, next)
    } catch {
      // Storage blocked: the choice lasts for this visit only.
    }
  }

  const setFilter = (next: ChartFilter | null) =>
    setParams(
      (current) => {
        const copy = new URLSearchParams(current)
        if (next) copy.set('filter', next)
        else copy.delete('filter')
        return copy
      },
      { replace: true }
    )
  const toggle = (id: ChartFilter) => setFilter(filter === id ? null : id)

  const units = useMemo(() => (snapshot ? unitsForSnapshot(snapshot, cases) : []), [snapshot, cases])
  const counts = useMemo(
    () =>
      Object.fromEntries(CHART_FILTERS.map((f) => [f.id, litUnits(units, cases, f.id).size])) as Record<
        ChartFilter,
        number
      >,
    [units, cases]
  )
  const lit = useMemo(() => (filter ? litUnits(units, cases, filter) : null), [units, cases, filter])
  const legend = useMemo(() => legendCounts(units), [units])
  const outlook = useMemo(
    () =>
      snapshot
        ? forecast(datasetFor(snapshot), snapshot.meta.referenceDate, {
            seed: snapshot.meta.seed,
            model: snapshot.forecastModel
          })
        : null,
    [snapshot]
  )
  const settings = snapshot?.projectSettings ?? DEFAULT_PROJECT_SETTINGS
  const row = snapshot && inspecting ? quickViewRow(snapshot, cases, inspecting) : null
  const shown = units.find((u) => u.code === (hoveredCode ?? selected)) ?? null
  const selectedUnit = units.find((u) => u.code === selected) ?? null
  const overview = useMemo(
    () =>
      selectedUnit
        ? unitOverview(
            selectedUnit,
            snapshot && selectedUnit.bookingId ? quickViewRow(snapshot, cases, selectedUnit.bookingId) : null
          )
        : null,
    [selectedUnit, snapshot, cases]
  )
  const totals = useMemo(() => bookedAndSigned(cases), [cases])

  const select = useCallback((unit: ChartUnit) => setSelected(unit.code), [])
  // Leaving one cell for the next crosses a 2px gap; wait a beat before
  // clearing so the readout does not blink between them.
  const hover = useCallback((unit: ChartUnit | null) => {
    if (clearHover.current) clearTimeout(clearHover.current)
    if (unit) setHoveredCode(unit.code)
    else clearHover.current = setTimeout(() => setHoveredCode(null), 150)
  }, [])
  useEffect(() => () => void (clearHover.current && clearTimeout(clearHover.current)), [])
  // Esc clears the selection, but only while the case panel is shut: Esc on the
  // panel closes the panel alone.
  useEffect(() => {
    if (!selected || inspecting) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, inspecting])

  return (
    <PageContainer>
      <PageHeaderCard tourTarget="sales-chart-header">
        <h1 className="text-[32px] font-semibold leading-[1.16] tracking-[-0.02em] text-foreground">Sales Chart</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {settings.projectName} · {units.length.toLocaleString()} Units · Every Unit By How Far Its Booking Has Got
          Towards A Signed SPA.
        </p>
      </PageHeaderCard>

      {error && !snapshot ? (
        <div className="mt-4">
          <EmptyState icon={SearchX} title="Could Not Load Your Bookings" description={error} />
          <div className="mt-3 flex justify-center">
            <Button variant="secondary" onClick={() => void refresh()}>
              Try Again
            </Button>
          </div>
        </div>
      ) : loading && !snapshot ? (
        <div className="mt-4 grid gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-[560px]" />
        </div>
      ) : (
        <>
          {error ? <RefreshErrorBanner onRetry={() => void refresh()} /> : null}
          <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Sales figures">
            <StatCard
              label="Units Booked"
              value={String(totals.booked)}
              info="Your Bookings Still Standing, Signed Or Not. Cancelled And Lapsed Ones Are Back On Sale."
            />
            <StatCard
              label="SPA Signed"
              value={String(totals.signed)}
              info="Your Bookings With A Confirmed SPA Signing On The Evidence Log."
            />
            {outlook && outlook.support !== 'insufficient-history' ? (
              <StatCard
                label="Expected SPAs In 30 Days"
                value={String(Math.round(outlook.expectedSignings))}
                exact={outlook.expectedSignings.toFixed(1)}
                caption={`Range ${outlook.rangeLow}–${outlook.rangeHigh} · From ${outlook.liveBookings} Bookings Under 30 Days Old`}
                info="The Forecast's Expected Signings From Your Unsigned Bookings Under 30 Days Old."
              />
            ) : (
              <StatCard label="Expected SPAs In 30 Days" value="—" caption="Not Enough History Yet" />
            )}
            <StatCard
              label="Needs Action"
              value={String(counts.needs_action)}
              info="Your Units Whose Booking The Stall Rule Flagged, Release Reviews Aside. Click To Show Them."
              onClick={() => toggle('needs_action')}
            />
          </section>

          <section className="mt-4 rounded-md bg-card p-4 shadow-card" aria-label="Units">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div role="group" aria-label="Chart view" className="flex rounded-md bg-muted p-0.5">
                  {(['building', 'grid'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={view === option}
                      disabled={option === 'building' && !webgl}
                      onClick={() => setView(option)}
                      className={cn(
                        'h-7 rounded-sm px-2.5 text-xs font-medium outline-none transition-colors duration-[var(--motion-fast)] focus-visible:ring-2 focus-visible:ring-ring disabled:text-disabled-foreground',
                        view === option
                          ? 'bg-card text-foreground shadow-card'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {option === 'building' ? 'Building' : 'Grid'}
                    </button>
                  ))}
                </div>
                {!webgl ? <InfoTooltip text="This Browser Cannot Draw 3D. The Grid Shows The Same Units." /> : null}
              </div>
              <div role="group" aria-label="Filter units" className="flex flex-wrap items-center gap-2">
                {CHART_FILTERS.map((f) => (
                  <span key={f.id} className="inline-flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={filter === f.id ? 'default' : 'outline'}
                      aria-pressed={filter === f.id}
                      onClick={() => toggle(f.id)}
                    >
                      <span>
                        {f.label} · <span className="tabular-nums">{counts[f.id]}</span>
                      </span>
                    </Button>
                    <InfoTooltip text={f.info} />
                  </span>
                ))}
              </div>
              <ul aria-label="Unit states" className="flex flex-wrap items-center gap-x-4 gap-y-1">
                {UNIT_STATES.map((state) => (
                  <li key={state} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span aria-hidden="true" className={cn('size-2.5 rounded-[2px]', UNIT_FILL[state])} />
                    {STATE_LABELS[state]}
                    <span className="tabular-nums text-foreground">{legend[state]}</span>
                  </li>
                ))}
              </ul>
            </div>

            {sceneFailed ? (
              <p role="status" className="mt-3 text-sm text-muted-foreground">
                This Browser Could Not Draw The Building View. The Grid Shows The Same Units.
              </p>
            ) : null}
            {lit && lit.size === 0 ? (
              <p role="status" className="mt-3 text-sm text-muted-foreground">
                {persona === 'manager'
                  ? 'No Units Match This Filter.'
                  : 'None Of Your Bookings Match This Filter. Other Desks’ Units Stay Grey.'}
              </p>
            ) : null}

            <Readout unit={shown} />

            <div className="mt-3">
              {view === 'building' ? (
                <BuildingBoundary
                  onFail={() => {
                    setSceneFailed(true)
                    setWebgl(false)
                    setView('grid')
                  }}
                >
                  <Suspense fallback={<Skeleton className="h-[620px]" />}>
                    <SalesChartBuilding
                      units={units}
                      lit={lit}
                      selected={selected}
                      onSelect={select}
                      onHover={hover}
                      projectName={settings.projectName}
                    />
                  </Suspense>
                </BuildingBoundary>
              ) : (
                <SalesChartGrid units={units} lit={lit} selected={selected} onSelect={select} onHover={hover} />
              )}
            </div>
          </section>
        </>
      )}

      {overview ? (
        <>
          {/* Room below the chart, so the island never covers its last rows. */}
          <div data-island-spacer aria-hidden="true" className="h-48" />
          <UnitIsland
            overview={overview}
            onOpenCase={() => {
              if (selectedUnit?.bookingId) setInspecting(selectedUnit.bookingId)
            }}
            onClose={() => setSelected(null)}
          />
        </>
      ) : null}

      <CaseQuickView
        row={row}
        referenceDate={snapshot?.meta.referenceDate ?? ''}
        onClose={() => setInspecting(null)}
        onChanged={refresh}
      />
    </PageContainer>
  )
}

/** One line naming the unit under the pointer, or the one last selected. */
function Readout({ unit }: { unit: ChartUnit | null }) {
  return (
    <div
      aria-live="polite"
      className="mt-3 flex min-h-10 flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-muted px-3 py-2 text-sm"
    >
      {unit ? (
        <>
          <span className="font-mono font-medium text-foreground">{unit.code}</span>
          <span className="flex items-center gap-1.5 text-foreground">
            <span aria-hidden="true" className={cn('size-2.5 rounded-[2px]', UNIT_FILL[unit.state])} />
            {STATE_LABELS[unit.state]}
          </span>
          <span className="text-muted-foreground">
            {unit.state === 'available'
              ? 'No Booking Holds This Unit'
              : unit.bookingId
                ? `${unit.heldBy}’s Desk · Click To See Its Overview`
                : `${unit.heldBy}’s Desk · Ask Them To Open It`}
          </span>
        </>
      ) : (
        <span className="text-muted-foreground">Hover Or Select A Unit To See Its State.</span>
      )}
    </div>
  )
}
