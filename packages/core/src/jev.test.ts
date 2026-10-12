import { describe, expect, it } from 'vitest'
import { JEV_REVIEW_THRESHOLD, playbookValidated, proposalFromExtraction, searchPlaybooks } from './jev'
import { PLAYBOOKS as SEEDED_PLAYBOOKS } from './fixtures/playbooks'
import type { CaseSummary, Extraction, Message, Playbook } from './types'

const playbook = (overrides: Partial<Playbook>): Playbook => ({
  id: 'PB-00',
  title: 'Untitled',
  situation: '',
  evidence: '',
  action: '',
  rationale: '',
  limits: '',
  outcome: '',
  author: 'A',
  reviewer: 'R',
  reviewedOn: '2026-09-01',
  status: 'approved',
  tags: [],
  ...overrides
})

const PLAYBOOKS: Playbook[] = [
  playbook({
    id: 'PB-01',
    title: 'Missing Income Documents',
    situation: 'The banker is waiting on payslips or income proof.',
    action: 'Request the outstanding documents from the buyer.',
    tags: ['payslip', 'slip gaji', 'income documents']
  }),
  playbook({
    id: 'PB-02',
    title: 'Second Bank Submission',
    situation: 'One bank rejected the application.',
    action: 'Prepare and submit to another bank.',
    tags: ['rejected', 'second bank']
  }),
  playbook({
    id: 'PB-03',
    title: 'Draft Booking-Fee Rules',
    situation: 'The buyer asks for the booking fee back.',
    action: 'Check refund eligibility.',
    status: 'draft',
    tags: ['refund', 'booking fee']
  })
]

const summary = (overrides: Partial<CaseSummary> = {}): CaseSummary => ({
  bookingId: 'BK-9001',
  stage: 'loan_applied',
  spaSigned: false,
  unknown: false,
  bookingAgeDays: 12,
  daysSinceEvidence: 6,
  daysSinceLoIssued: null,
  daysSinceSpaSet: null,
  applications: [
    { id: 'LA-1', bank: 'Bank A', status: 'documents_pending' },
    { id: 'LA-2', bank: 'Bank B', status: 'rejected' }
  ],
  outstandingDocuments: ['payslip'],
  buyerWithdrew: false,
  buyerConcern: false,
  valuationShortfall: false,
  risk: {
    level: 'low',
    loanRm: 450000,
    instalmentRm: 2000,
    debtServiceRatio: 0.3,
    marginOfFinancing: 0.9,
    reasons: []
  },
  stallReasons: ['Document Outstanding 5+ Days'],
  openTasks: 0,
  ...overrides
})

const message = (overrides: Partial<Message> = {}): Message => ({
  id: 'MSG-1',
  bookingId: 'BK-9001',
  senderRole: 'banker',
  senderName: 'Encik Farid',
  language: 'mixed',
  sentAt: '2026-09-17T14:00:00+08:00',
  body: 'Payslip tiga bulan masih belum sampai.',
  origin: 'fixture',
  ...overrides
})

const extraction = (overrides: Partial<Extraction> = {}): Extraction => ({
  messageId: 'MSG-1',
  event: { value: 'documents_received', probabilities: { documents_received: 0.94 }, confidence: 0.9 },
  document: { value: 'payslip', probabilities: { payslip: 0.9 }, confidence: 0.9 },
  owner: { value: 'loan_admin', probabilities: { loan_admin: 0.8 }, confidence: 0.7 },
  withdrawalRisk: 0.1,
  needsAction: 0.2,
  meta: { source: 'live', stale: false, latencyMs: 400 },
  ...overrides
})

describe('JEV_REVIEW_THRESHOLD', () => {
  it('is the spec confidence floor', () => {
    expect(JEV_REVIEW_THRESHOLD).toBe(0.6)
  })
})

describe('searchPlaybooks', () => {
  it('finds playbooks through Malay tags', () => {
    const results = searchPlaybooks(PLAYBOOKS, 'slip gaji')
    expect(results[0]?.playbook.id).toBe('PB-01')
  })

  it('matches on title and action text', () => {
    const results = searchPlaybooks(PLAYBOOKS, 'another bank')
    expect(results[0]?.playbook.id).toBe('PB-02')
  })

  it('puts approved playbooks before drafts', () => {
    const results = searchPlaybooks(PLAYBOOKS, 'documents refund')
    const lastApproved = results.map((r) => r.playbook.status).lastIndexOf('approved')
    const firstDraft = results.findIndex((r) => r.playbook.status !== 'approved')
    expect(firstDraft === -1 || lastApproved < firstDraft).toBe(true)
  })

  it('normalizes the best keyword score to 1', () => {
    const results = searchPlaybooks(PLAYBOOKS, 'payslip')
    expect(results[0]?.keywordScore).toBe(1)
  })

  it('honours the limit and returns approved playbooks for an empty query', () => {
    expect(searchPlaybooks(PLAYBOOKS, '', 1)).toHaveLength(1)
    expect(searchPlaybooks(PLAYBOOKS, '')[0]?.playbook.status).toBe('approved')
  })
})

// Issue #75: guidance shows its action and limits only once a named reviewer approves it.
describe('playbookValidated', () => {
  it('takes an approved playbook with a named reviewer, and nothing short of that', () => {
    const base = PLAYBOOKS[0]!
    expect(playbookValidated({ ...base, status: 'approved', reviewer: 'Arvind Raj' })).toBe(true)
    expect(playbookValidated({ ...base, status: 'approved', reviewer: '  ' })).toBe(false)
    for (const status of ['draft', 'superseded', 'retired'] as const)
      expect(playbookValidated({ ...base, status, reviewer: 'Arvind Raj' })).toBe(false)
  })

  it('keeps every seeded demo playbook illustrative until a real reviewer approves it', () => {
    expect(SEEDED_PLAYBOOKS.length).toBeGreaterThan(0)
    expect(SEEDED_PLAYBOOKS.filter(playbookValidated)).toEqual([])
  })
})

describe('proposalFromExtraction', () => {
  it('returns null for no_update', () => {
    const e = extraction({ event: { value: 'no_update', probabilities: { no_update: 0.9 }, confidence: 0.9 } })
    expect(proposalFromExtraction(e, message(), summary())).toBeNull()
  })

  it('maps a document update to a provisional loan-track event on the latest open application', () => {
    const proposal = proposalFromExtraction(extraction(), message(), summary())
    expect(proposal).toMatchObject({
      bookingId: 'BK-9001',
      applicationId: 'LA-1',
      track: 'loan',
      kind: 'documents_received',
      occurredAt: '2026-09-17T14:00:00+08:00',
      reportedBy: 'Jev',
      verifiedBy: null,
      status: 'provisional',
      source: 'jev',
      messageId: 'MSG-1',
      document: 'payslip',
      note: '94% Probability'
    })
  })

  it('maps buyer_withdrawing to the sales buyer_withdrew kind', () => {
    const e = extraction({
      event: { value: 'buyer_withdrawing', probabilities: { buyer_withdrawing: 0.5 }, confidence: 0.5 }
    })
    const proposal = proposalFromExtraction(e, message(), summary())
    expect(proposal?.track).toBe('sales')
    expect(proposal?.kind).toBe('buyer_withdrew')
    expect(proposal?.applicationId).toBeNull()
  })

  it('maps spa_appointment to the legal spa_appointment_set kind', () => {
    const e = extraction({ event: { value: 'spa_appointment', probabilities: { spa_appointment: 1 }, confidence: 1 } })
    const proposal = proposalFromExtraction(e, message(), summary())
    expect(proposal?.track).toBe('legal')
    expect(proposal?.kind).toBe('spa_appointment_set')
    expect(proposal?.note).toBe('100% Probability')
  })

  it('leaves the document null when none was identified', () => {
    const e = extraction({ document: { value: 'none', probabilities: {}, confidence: 0.5 } })
    expect(proposalFromExtraction(e, message(), summary())?.document).toBeNull()
  })

  // Issue #75: once approved, the approving bank's request clears only with a receipt that names it.
  it('puts a document update on the approving bank once no bank is deciding', () => {
    const approvedOnly = summary({
      applications: [
        { id: 'LA-1', bank: 'Bank A', status: 'approved' },
        { id: 'LA-2', bank: 'Bank B', status: 'rejected' }
      ]
    })
    expect(proposalFromExtraction(extraction(), message(), approvedOnly)?.applicationId).toBe('LA-1')
    // A decision is never guessed onto a bank that has already decided.
    const decision = extraction({
      event: { value: 'loan_approved', probabilities: { loan_approved: 0.9 }, confidence: 0.9 }
    })
    expect(proposalFromExtraction(decision, message(), approvedOnly)?.applicationId).toBeNull()
  })
})
