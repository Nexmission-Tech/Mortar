/**
 * Sales Chart: every unit of the project by how far its booking has got
 * towards a signed SPA. Four figures, three filters, the legend, the chart,
 * and a readout of the unit under the pointer. Clicking a unit the viewer may
 * open brings up the same side sheet Today and Bookings use.
 */
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { DEFAULT_PROJECT_SETTINGS, forecast, type ChartUnit } from '@mortar/core'
import { useCases, useSnapshot } from '@/lib/data'
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
  activeUnsigned,
  CHART_FILTERS,
  legendCounts,
  litUnits,
  STATE_LABELS,
  UNIT_STATES,
  unitsForSnapshot,
  type ChartFilter
} from '@/components/sales-chart/salesChart'
import { UNIT_FILL } from '@/components/sales-chart/unitTone'

export function SalesChartPage() {
  const { snapshot, loading, error, refresh } = useSnapshot()
  const cases = useCases()
  const [params, setParams] = useSearchParams()
  const filter = CHART_FILTERS.find((f) => f.id === params.get('filter'))?.id ?? null
  const [hovered, setHovered] = useState<ChartUnit | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [inspecting, setInspecting] = useState<string | null>(null)

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
  const shown = hovered ?? units.find((u) => u.code === selected) ?? null

  const select = (unit: ChartUnit) => {
    setSelected(unit.code)
    if (unit.bookingId) setInspecting(unit.bookingId)
  }

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
              label="Active Unsigned"
              value={String(activeUnsigned(cases))}
              info="Your Live Bookings Without A Signed SPA."
            />
            {outlook && outlook.support !== 'insufficient-history' ? (
              <StatCard
                label="Expected SPAs In 30 Days"
                value={String(Math.round(outlook.expectedSignings))}
                exact={outlook.expectedSignings.toFixed(1)}
                caption={`Range ${outlook.rangeLow}–${outlook.rangeHigh}`}
                info="The Forecast's Expected Signings From Your Live Bookings."
              />
            ) : (
              <StatCard label="Expected SPAs In 30 Days" value="—" caption="Not Enough History Yet" />
            )}
            <StatCard
              label="Needs Action"
              value={String(counts.needs_action)}
              info="Units Whose Booking The Stall Rule Flagged, Release Reviews Aside. Click To Show Them."
              onClick={() => toggle('needs_action')}
            />
            <StatCard
              label="Release Reviews"
              value={String(counts.release_review)}
              info="Units Whose Recovery Paths Look Spent. A Person Decides; Mortar Never Cancels."
              onClick={() => toggle('release_review')}
            />
          </section>

          <section className="mt-4 rounded-md bg-card p-4 shadow-card" aria-label="Units">
            <div className="flex flex-wrap items-center justify-between gap-3">
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
                      {f.label} · <span className="tabular-nums">{counts[f.id]}</span>
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

            {lit && lit.size === 0 ? (
              <p role="status" className="mt-3 text-sm text-muted-foreground">
                No Units Match This Filter.
              </p>
            ) : null}

            <Readout unit={shown} />

            <div className="mt-3">
              <SalesChartGrid units={units} lit={lit} selected={selected} onSelect={select} onHover={setHovered} />
            </div>
          </section>
        </>
      )}

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
              ? 'Available To Sell'
              : unit.bookingId
                ? `Held By ${unit.heldBy} · Click To Open The Case`
                : `Held By ${unit.heldBy}’s Desk · Ask Them To Open It`}
          </span>
        </>
      ) : (
        <span className="text-muted-foreground">Hover Or Select A Unit To See Its State.</span>
      )}
    </div>
  )
}
