/**
 * Case Details — the context beside the work, in one card: the assigned team
 * by desk, the financing risk, and the buyer's response read from their
 * messages. Risk shows at every level, because a case that reads as carrying
 * no risk signal at all is a worse reading than one that reads Low.
 */

import type { Booking, BuyerSignals, CaseSummary } from '@mortar/core'
import { RiskChip } from '@/components/case/RiskChip'
import { SignalsPanel } from './SignalsPanel'
import { Card, CardContent } from '@/components/ui/card'

const LABEL = 'text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground'

export function CaseDetails({
  booking,
  summary,
  signals,
  hasBuyerMessages,
  signalsLoading = false
}: {
  booking: Booking
  summary: CaseSummary
  signals: BuyerSignals | null
  hasBuyerMessages: boolean
  signalsLoading?: boolean
}) {
  return (
    <Card>
      <CardContent className="flex flex-col p-0">
        <section className="flex flex-col gap-3 p-4 md:p-6">
          <h2 className={LABEL}>Assigned Team</h2>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Sales</dt>
            <dd>{booking.salesOwner}</dd>
            <dt className="text-muted-foreground">Loan</dt>
            <dd>{booking.loanOwner}</dd>
            <dt className="text-muted-foreground">Legal</dt>
            <dd>{booking.legalFirm}</dd>
          </dl>
        </section>
        <section className="flex flex-col gap-3 border-t border-border p-4 md:p-6">
          <h2 className={LABEL}>Financing Risk</h2>
          <div>
            {summary.risk.level === 'low' ? (
              <span className="text-[13px] text-muted-foreground">Low Risk</span>
            ) : (
              <RiskChip risk={summary.risk} />
            )}
          </div>
        </section>
        <section className="border-t border-border p-4 md:p-6">
          <SignalsPanel signals={signals} hasBuyerMessages={hasBuyerMessages} loading={signalsLoading} embedded />
        </section>
      </CardContent>
    </Card>
  )
}
