/**
 * Ball in court: who has to move next on a case — the buyer, a panel bank, the
 * solicitor, or the developer's own staff — and the move that unblocks it.
 * Read from the same `CaseSummary` the chase queue and the stall rules use, so
 * the answer cannot drift from them. Confirmed updates only, like the summary.
 */
import type { CaseSummary, NextAction } from './types'
import { DOCUMENT_LABELS } from './sim/cases'

export type BallHolder = 'buyer' | 'bank' | 'solicitor' | 'developer'

export interface BallInCourt {
  /** `null` once the SPA is signed or the booking has closed: nobody owes a move. */
  holder: BallHolder | null
  /** What the case is waiting for, as a Title Case phrase: `Maybank To Decide On The Loan`. */
  waitingFor: string
  /** The move that unblocks it; `null` when there is nothing left to chase. */
  nextMove: NextAction | null
  /** A stall rule has fired on the case. */
  stalled: boolean
}

/** `Payslip`, `Payslip And EPF Statement`, `Payslip, IC Copy And EPF Statement`. */
function listOf(items: string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} And ${items[items.length - 1]}`
}

/**
 * First match wins, in the order a desk would unblock the case: a buyer who
 * withdrew or raised a concern comes first; then a valuation shortfall needs
 * the loan desk's financing review; documents the buyer still owes (once a
 * loan is approved, only those the approving bank or nobody in particular
 * asked for) hold the case before anything else; an approved loan then waits
 * on the solicitor for the SPA, whatever another bank still wants; a bank
 * holding an application owes a decision; every bank declining needs a
 * financing review; and with no bank yet the documents are still to collect.
 */
export function ballInCourt(summary: CaseSummary): BallInCourt {
  const stalled = summary.stallReasons.length > 0
  if (summary.stage === 'cancelled' || summary.stage === 'lapsed') {
    return { holder: null, waitingFor: 'Nothing, The Booking Has Closed', nextMove: null, stalled: false }
  }
  // The signed SPA itself, not a stage label: a loan agreement or disbursement
  // recorded without one leaves the case waiting on the SPA.
  if (summary.spaSigned) {
    return { holder: null, waitingFor: 'Nothing, The SPA Is Signed', nextMove: null, stalled: false }
  }

  // A buyer who has walked away outranks everything else: documents they still
  // owe and a bank's decision, approval included, no longer matter, and the unit
  // is the developer's to release. Read the summary's flag, not the applications:
  // an application the bank already decided is never marked withdrawn, and the
  // flag clears once a bank is submitted after the withdrawal (the buyer is back).
  if (summary.buyerWithdrew) {
    return { holder: 'developer', waitingFor: 'A Decision To Release The Unit', nextMove: 'review_release', stalled }
  }

  // A confirmed concern is a same-day call, until its outcome is recorded. The
  // banks keep processing alongside; only the next move changes hands.
  if (summary.buyerConcern) {
    return { holder: 'buyer', waitingFor: 'The Buyer To Settle Their Concern', nextMove: 'call_buyer', stalled }
  }

  // A valuation below the price is a funding gap: whether the buyer tops up,
  // the bank lends less or another bank is tried is the loan desk's decision.
  if (summary.valuationShortfall) {
    return {
      holder: 'developer',
      waitingFor: 'A Financing Review After The Valuation Shortfall',
      nextMove: 'review_financing',
      stalled
    }
  }

  // Before an approved loan goes to the solicitor: the approving bank cannot
  // release a loan it is still waiting on a document for, so the case stays
  // with the buyer until it arrives. Once approved, the summary lists only
  // the approving bank's requests and those not for one bank. Once every bank
  // has declined, a document is no next step: the financing review comes first.
  const declined =
    summary.applications.length > 0 &&
    summary.applications.every((a) => a.status === 'rejected' || a.status === 'withdrawn')
  if (summary.outstandingDocuments.length > 0 && !declined) {
    const documents = listOf(summary.outstandingDocuments.map((d) => DOCUMENT_LABELS[d]))
    return { holder: 'buyer', waitingFor: `${documents} From The Buyer`, nextMove: 'request_document', stalled }
  }

  // A real letter of offer, not an SPA appointment alone: an appointment set
  // while a bank is still deciding leaves the case with that bank.
  if (summary.stage === 'lo_issued' && summary.daysSinceLoIssued !== null) {
    return summary.daysSinceSpaSet !== null
      ? { holder: 'solicitor', waitingFor: 'The Solicitor To Get The SPA Signed', nextMove: 'escalate_legal', stalled }
      : { holder: 'solicitor', waitingFor: 'The Solicitor To Schedule The SPA', nextMove: 'schedule_spa', stalled }
  }

  const awaitingDocuments = summary.applications.find((a) => a.status === 'documents_pending')
  if (awaitingDocuments) {
    return {
      holder: 'buyer',
      waitingFor: `Documents For ${awaitingDocuments.bank} From The Buyer`,
      nextMove: 'request_document',
      stalled
    }
  }

  const withBank = summary.applications.filter((a) => a.status === 'submitted')
  if (withBank.length > 0) {
    return {
      holder: 'bank',
      waitingFor: `${listOf(withBank.map((a) => a.bank))} To Decide On The Loan`,
      nextMove: 'chase_banker',
      stalled
    }
  }

  // Every bank declined: a rejection does not say whether it can be remedied,
  // so the loan desk reviews the financing before anyone resubmits or releases.
  if (summary.applications.length > 0) {
    return {
      holder: 'developer',
      waitingFor: 'A Financing Review After The Rejection',
      nextMove: 'review_financing',
      stalled
    }
  }
  return {
    holder: 'developer',
    waitingFor: 'The Loan Documents To Be Collected',
    nextMove: 'request_document',
    stalled
  }
}
