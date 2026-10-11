/**
 * Booking detail route — the case page for one unit booking, read as a
 * decision, then the record. The header names the booking and offers Record An
 * Update and Paste A Message. One summary card says who holds the case, the
 * next step and its owner, with the illustrated booking journey beneath. Four
 * views hold the record: Overview (bank applications, the latest message, Case
 * Details), Messages (with Mortar AI's readings to review), History (the whole
 * evidence log by track) and Tasks. Forms and guidance open in the floating
 * case panel.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { PERSONA_STAFF, type BuyerSignals } from '@mortar/core'
import { useCases, useSnapshot } from '@/lib/data'
import { usePersona } from '@/lib/persona'
import { fetchSignals } from '@/lib/api'
import { PageContainer } from '@/components/layout/PageContainer'
import { AddMessageForm } from '@/components/bookings/AddMessageForm'
import { ApplicationsCard } from '@/components/bookings/ApplicationsCard'
import { BookingJourney } from '@/components/bookings/BookingJourney'
import { bookingJourney } from '@/components/bookings/bookingJourney'
import { CaseActionSheet, type CaseAction } from '@/components/bookings/CaseActionSheet'
import { CaseDetails } from '@/components/bookings/CaseDetails'
import { CaseHeader } from '@/components/bookings/CaseHeader'
import { CaseHistory, type HistoryTrack } from '@/components/bookings/CaseHistory'
import { CASE_VIEWS, CaseViews, type CaseView } from '@/components/bookings/CaseViews'
import { LatestMessage } from '@/components/bookings/LatestMessage'
import { MessagesPanel } from '@/components/bookings/MessagesPanel'
import { PlaybooksPanel } from '@/components/bookings/PlaybooksPanel'
import { RecordUpdateForm } from '@/components/bookings/RecordUpdateForm'
import { TasksPanel } from '@/components/bookings/TasksPanel'
import { WaitingOnPanel } from '@/components/bookings/WaitingOn'
import { DOCUMENT_LABELS } from '@/components/bookings/labels'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/EmptyState'
import { RefreshErrorBanner } from '@/components/ui/RefreshErrorBanner'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusPill } from '@/components/ui/status-pill'

export function BookingDetailPage() {
  const { id } = useParams()
  const { snapshot, loading, error, refresh } = useSnapshot()
  const cases = useCases()
  const { persona, profile } = usePersona()
  const reviewer = profile?.name ?? PERSONA_STAFF[persona].name
  /** The desks' today, which every new update and message is dated against. */
  const referenceDate = snapshot?.meta.referenceDate ?? ''

  const [refreshKey, setRefreshKey] = useState(0)
  const [fetchedSignals, setFetchedSignals] = useState<BuyerSignals | null>(null)
  /** The booking id the last signals read settled for (success or failure); `loading` is
   * derived by comparing this to the current booking rather than set synchronously in the
   * effect below, so switching bookings without a remount still reads as loading. */
  const [signalsLoadedFor, setSignalsLoadedFor] = useState<string | null>(null)

  /** Mutations toast then re-fetch the snapshot; the bump re-runs cache-first reads. */
  const onChanged = useCallback(async () => {
    await refresh()
    setRefreshKey((k) => k + 1)
  }, [refresh])

  /** The open view and history track live in the URL, so a link can open a case on Messages or on its loan history. */
  const [params, setParams] = useSearchParams()
  const viewParam = params.get('view')
  const view: CaseView = CASE_VIEWS.includes(viewParam as CaseView) ? (viewParam as CaseView) : 'overview'
  const trackParam = params.get('track')
  const track: HistoryTrack = ['loan', 'legal', 'sales'].includes(trackParam ?? '')
    ? (trackParam as HistoryTrack)
    : 'all'
  const show = useCallback(
    (next: CaseView, nextTrack?: HistoryTrack) =>
      setParams(
        (current) => {
          const out = new URLSearchParams(current)
          if (next === 'overview') out.delete('view')
          else out.set('view', next)
          if (next === 'history' && nextTrack && nextTrack !== 'all') out.set('track', nextTrack)
          else out.delete('track')
          return out
        },
        { replace: true }
      ),
    [setParams]
  )
  /** The journey's bank detour opens the loan history and brings the views into sight. */
  const showLoanHistory = useCallback(() => {
    show('history', 'loan')
    document.getElementById('case-views')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  }, [show])
  const [action, setAction] = useState<CaseAction | null>(null)

  useEffect(() => {
    if (!id || !snapshot || !snapshot.bookings.some((b) => b.id === id)) return
    // No buyer messages means there is nothing for Jev to read; the route
    // guards the same way, so the panel shows the empty-history note instead.
    if (!snapshot.messages.some((m) => m.bookingId === id && m.senderRole === 'buyer')) return
    let live = true
    fetchSignals(id)
      .then((signals) => {
        if (live) setFetchedSignals(signals)
      })
      .catch(() => {})
      .finally(() => {
        if (live) setSignalsLoadedFor(id)
      })
    return () => {
      live = false
    }
  }, [id, refreshKey, snapshot])

  const data = useMemo(() => {
    if (!snapshot || !id) return null
    const booking = snapshot.bookings.find((b) => b.id === id)
    const summary = cases.find((c) => c.bookingId === id)
    if (!booking || !summary) return null
    const applications = snapshot.applications.filter((a) => a.bookingId === id)
    const events = snapshot.events.filter((e) => e.bookingId === id)
    return {
      booking,
      summary,
      applications,
      events,
      journey: bookingJourney({
        booking,
        summary,
        events,
        applications,
        referenceDate: snapshot.meta.referenceDate
      }),
      messages: snapshot.messages.filter((m) => m.bookingId === id),
      tasks: snapshot.tasks.filter((t) => t.bookingId === id),
      extractions: new Map(snapshot.extractions.map((e) => [e.messageId, e])),
      // The fetched read wins: it runs after each change, while the snapshot's
      // copy can predate the message that just arrived.
      signals:
        (fetchedSignals?.bookingId === id ? fetchedSignals : null) ??
        snapshot.signals.find((s) => s.bookingId === id) ??
        null,
      // Jev's cached answer for this case, so Waiting On can show the same
      // alternative Today does.
      suggestion: snapshot.nextActions.find((a) => a.bookingId === id),
      playbooks: snapshot.playbooks
    }
  }, [snapshot, cases, id, fetchedSignals])

  return (
    <PageContainer>
      {loading && !snapshot ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 rounded-md" />
          <div className="grid gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Skeleton className="h-96 rounded-md" />
            <Skeleton className="h-96 rounded-md" />
          </div>
        </div>
      ) : error && !snapshot ? (
        <div className="mt-4">
          <EmptyState icon={FileText} title="Booking Could Not Load" description={error} />
          <div className="mt-3 flex justify-center">
            <Button variant="secondary" onClick={() => void refresh()}>
              Try Again
            </Button>
          </div>
        </div>
      ) : !data ? (
        <div className="mt-4">
          <EmptyState
            icon={FileText}
            title="Booking Not Found"
            description={`No Booking Matches ${id ?? '—'}. Check The Reference And Try Again.`}
          />
          <div className="mt-3 flex justify-center">
            <Button variant="secondary" asChild>
              <Link to="/bookings">Back To Bookings</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* The save that just landed is real; only the follow-up read failed, so the
              case stays on screen with a way to retry rather than vanishing behind it. */}
          {error ? <RefreshErrorBanner onRetry={() => void refresh()} /> : null}
          <CaseHeader
            booking={data.booking}
            summary={data.summary}
            onRecordUpdate={() => setAction('record')}
            onPasteMessage={() => setAction('message')}
          />
          <Card className="mt-6" data-tour="case-status">
            <CardContent className="flex flex-col gap-5 p-4 md:p-6">
              <WaitingOnPanel
                key={data.booking.id}
                booking={data.booking}
                summary={data.summary}
                referenceDate={referenceDate}
                onChanged={onChanged}
                // Mortar AI's cached answer for this case, so its alternative
                // appears here as it does on Today and in the case panel.
                suggestion={data.suggestion}
                onWhatToDo={() => setAction('guidance')}
                wide
              />
              {data.summary.outstandingDocuments.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  {data.summary.outstandingDocuments.map((doc) => (
                    <StatusPill key={doc} tone="warning">
                      {DOCUMENT_LABELS[doc]} Outstanding
                    </StatusPill>
                  ))}
                </div>
              ) : null}
              <div className="border-t border-border pt-5">
                <BookingJourney key={data.booking.id} model={data.journey} onShowHistory={showLoanHistory} />
              </div>
            </CardContent>
          </Card>
          <div className="mt-4">
            <CaseViews
              value={view}
              onValueChange={(next) => show(next)}
              counts={{ messages: data.messages.length, history: data.events.length, tasks: data.tasks.length }}
              panels={{
                overview: (
                  <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_344px]">
                    <div className="flex min-w-0 flex-col gap-6">
                      <ApplicationsCard applications={data.applications} summary={data.summary} />
                      <LatestMessage messages={data.messages} onViewAll={() => show('messages')} />
                    </div>
                    <CaseDetails
                      booking={data.booking}
                      summary={data.summary}
                      signals={data.signals}
                      hasBuyerMessages={data.messages.some((m) => m.senderRole === 'buyer')}
                      signalsLoading={signalsLoadedFor !== data.booking.id}
                    />
                  </div>
                ),
                messages: (
                  <MessagesPanel
                    messages={data.messages}
                    extractions={data.extractions}
                    events={data.events}
                    reviewer={reviewer}
                    onChanged={onChanged}
                  />
                ),
                history: <CaseHistory events={data.events} track={track} onTrackChange={(t) => show('history', t)} />,
                tasks: <TasksPanel tasks={data.tasks} onChanged={onChanged} />
              }}
            />
          </div>
          <CaseActionSheet action={action} booking={data.booking} onClose={() => setAction(null)}>
            {action === 'record' ? (
              <RecordUpdateForm
                key={`record-${data.booking.id}`}
                booking={data.booking}
                applications={data.applications}
                summary={data.summary}
                referenceDate={referenceDate}
                reportedBy={reviewer}
                bare
                onRecorded={async () => {
                  await onChanged()
                  setAction(null)
                }}
              />
            ) : action === 'message' ? (
              // A pasted message stays open, so Mortar AI's reading of it shows here.
              <AddMessageForm
                key={data.booking.id}
                booking={data.booking}
                banker={data.applications[data.applications.length - 1]?.banker}
                referenceDate={referenceDate}
                bare
                onAdded={onChanged}
              />
            ) : action === 'guidance' ? (
              <PlaybooksPanel
                bookingId={data.booking.id}
                summary={data.summary}
                playbooks={data.playbooks}
                refreshKey={refreshKey}
                bare
              />
            ) : null}
          </CaseActionSheet>
        </>
      )}
    </PageContainer>
  )
}
