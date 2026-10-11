/**
 * Case header — which booking this is and the two ways staff add to it: the
 * unit, project and stage on one line, the buyer as the title, price and
 * booking date beneath, and Record An Update and Paste A Message at the right.
 * The wait, owners, risk and outstanding documents are said once, in the
 * summary and Case Details below.
 */

import type { Booking, CaseSummary } from '@mortar/core'
import { MessageSquarePlus, Plus } from 'lucide-react'
import { StagePill } from '@/components/case/StagePill'
import { formatDate, formatRm } from '@/components/case/format'
import { Button } from '@/components/ui/button'

export function CaseHeader({
  booking,
  summary,
  onRecordUpdate,
  onPasteMessage
}: {
  booking: Booking
  summary: CaseSummary
  onRecordUpdate?: () => void
  onPasteMessage?: () => void
}) {
  // A closed case takes no more updates; its messages can still be added and read.
  const closed = summary.stage === 'cancelled' || summary.stage === 'lapsed'
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-[18px] text-muted-foreground">
          <span className="font-mono font-medium text-foreground">{booking.unit}</span>
          <span aria-hidden="true">·</span>
          <span>{booking.project}</span>
          <StagePill stage={summary.stage} />
        </p>
        <h1 className="mt-1 text-2xl font-semibold leading-8 tracking-[-0.02em]">{booking.buyer.name}</h1>
        <p className="mt-1 text-[13px] leading-[18px] tabular-nums text-muted-foreground">
          {formatRm(booking.priceRm)} · Booked {formatDate(booking.bookingDate)}
        </p>
      </div>
      {onRecordUpdate || onPasteMessage ? (
        <div className="grid shrink-0 grid-cols-2 gap-2 md:flex">
          {!closed && onRecordUpdate ? (
            <Button type="button" variant="secondary" onClick={onRecordUpdate}>
              <Plus aria-hidden="true" />
              Record An Update
            </Button>
          ) : null}
          {onPasteMessage ? (
            <Button type="button" variant="secondary" onClick={onPasteMessage} data-tour="case-message">
              <MessageSquarePlus aria-hidden="true" />
              Paste A Message
            </Button>
          ) : null}
        </div>
      ) : null}
    </header>
  )
}
