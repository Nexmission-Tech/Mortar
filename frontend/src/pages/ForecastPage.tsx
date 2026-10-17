import { useMemo } from 'react'
import { SearchX } from 'lucide-react'
import { forecastInsights, type Persona } from '@mortar/core'
import { datasetFor } from '@/components/forecast/forecast'
import { ForecastReports, type HistoryReach } from '@/components/forecast/ForecastReports'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderCard } from '@/components/layout/PageHeaderCard'
import { StatCard } from '@/components/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { RefreshErrorBanner } from '@/components/ui/RefreshErrorBanner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/components/case/format'
import { useSnapshot } from '@/lib/data'
import { usePersonaSafe } from '@/lib/persona'

/** The Manager sees every booking and a Sales Admin keeps their own; Loan and Legal hold a booking only while it is theirs to move. */
const REACH: Record<Persona, HistoryReach> = {
  manager: 'all',
  'sales-admin': 'own',
  'loan-admin': 'assigned',
  'legal-admin': 'assigned'
}

export function ForecastPage() {
  const { snapshot, loading, error, refresh } = useSnapshot()
  const { persona } = usePersonaSafe()

  const dataset = useMemo(() => (snapshot ? datasetFor(snapshot) : null), [snapshot])
  const insights = useMemo(() => {
    if (!snapshot || !dataset) return null
    return forecastInsights(dataset, snapshot.meta.referenceDate, { model: snapshot.forecastModel })
  }, [snapshot, dataset])

  return (
    <PageContainer>
      <PageHeaderCard>
        <h1 className="text-[32px] font-semibold leading-[1.16] tracking-[-0.02em] text-foreground">Forecast</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          SPA signing outlook from recorded bookings as of {formatDate(snapshot?.meta.referenceDate)}.
        </p>
      </PageHeaderCard>

      {error && !insights ? (
        <div className="mt-4 space-y-3">
          <EmptyState icon={SearchX} title="Could Not Load Your Bookings" description={error} />
          <div className="flex justify-center">
            <Button type="button" variant="outline" onClick={() => void refresh()}>
              Try Again
            </Button>
          </div>
        </div>
      ) : loading && !insights ? (
        <div className="mt-4 grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-72" />
        </div>
      ) : insights ? (
        <>
          {error ? <RefreshErrorBanner onRetry={() => void refresh()} /> : null}

          <section className="mt-5" aria-label="Forecast answer">
            {insights.forecast.support === 'insufficient-history' ? (
              <p role="status" className="mb-3 text-sm text-muted-foreground">
                The booking-day-30 estimate is unavailable because there is not enough resolved booking history.
                Operational reports remain available.
              </p>
            ) : null}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                label="Estimated SPAs By Booking Day 30"
                value={
                  insights.forecast.support === 'supported'
                    ? String(Math.round(insights.forecast.expectedSignings))
                    : '—'
                }
                info="The sum of recorded stage and booking-age chances for eligible bookings."
                exact={
                  insights.forecast.support === 'supported'
                    ? `${insights.forecast.expectedSignings.toFixed(1)} expected SPA signings`
                    : undefined
                }
              />
              <StatCard
                label="Estimated Signing Range"
                value={
                  insights.forecast.support === 'supported'
                    ? `${insights.forecast.rangeLow} – ${insights.forecast.rangeHigh}`
                    : '—'
                }
                info="A range of counts using the same historical chances, not a promise."
              />
              <StatCard
                label="Bookings In The Estimate"
                value={String(insights.forecast.liveBookings)}
                info="Unsigned and unclosed bookings less than 30 days from booking."
              />
            </div>
            {insights.open.olderCount > 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {insights.open.olderCount} older unsigned booking{insights.open.olderCount === 1 ? ' is' : 's are'}{' '}
                outside this estimate and remain in the reports.
              </p>
            ) : null}
          </section>

          <ForecastReports insights={insights} dataset={dataset} reach={REACH[persona]} />

          {insights.history.scope === 'project' ? (
            <p className="mt-3 text-[13px] text-muted-foreground">
              Your accessible bookings appear in the report case rows. Project-wide historical rates use records through{' '}
              {formatDate(insights.history.asOf)}.
            </p>
          ) : null}
        </>
      ) : null}
    </PageContainer>
  )
}
