import { describe, expect, it } from 'bun:test'
import { profileFor, type Booking, type CaseEvent, type Snapshot } from '@mortar/core'
import type { Database } from '../../db/index'
import { runTool } from '../assistant/tools'

const AS_OF = '2026-10-11'

const records = [
  { id: 'BK-NURUL-01', unit: 'A-01-01', salesOwner: 'Nurul Aina', priceRm: 510000 },
  { id: 'BK-NURUL-02', unit: 'A-01-02', salesOwner: 'Nurul Aina', priceRm: 520000 },
  { id: 'BK-NURUL-03', unit: 'A-01-03', salesOwner: 'Nurul Aina', priceRm: 530000 },
  { id: 'BK-NURUL-04', unit: 'A-01-04', salesOwner: 'Nurul Aina', priceRm: 540000 },
  { id: 'BK-NURUL-05', unit: 'A-01-05', salesOwner: 'Nurul Aina', priceRm: 550000 },
  { id: 'BK-NURUL-06', unit: 'A-01-06', salesOwner: 'Nurul Aina', priceRm: 560000 },
  { id: 'BK-NURUL-07', unit: 'A-01-07', salesOwner: 'Nurul Aina', priceRm: 570000 },
  { id: 'BK-FARAH-01', unit: 'B-01-01', salesOwner: 'Farah Izzati', priceRm: 610000 },
  { id: 'BK-FARAH-02', unit: 'B-01-02', salesOwner: 'Farah Izzati', priceRm: 620000 },
  { id: 'BK-FARAH-03', unit: 'B-01-03', salesOwner: 'Farah Izzati', priceRm: 630000 },
  { id: 'BK-FARAH-04', unit: 'B-01-04', salesOwner: 'Farah Izzati', priceRm: 640000 },
  { id: 'BK-FARAH-05', unit: 'B-01-05', salesOwner: 'Farah Izzati', priceRm: 650000 },
  { id: 'BK-FARAH-06', unit: 'B-01-06', salesOwner: 'Farah Izzati', priceRm: 660000 }
] as const

function booking(record: (typeof records)[number]): Booking {
  return {
    id: record.id,
    project: 'Residensi Ujian',
    unit: record.unit,
    priceRm: record.priceRm,
    bookingDate: '2026-10-01',
    buyer: {
      name: 'Fixture Buyer',
      ic: '000000-00-0001',
      phone: '+60 00-000 0001',
      age: 34,
      grossMonthlyIncomeRm: 8500,
      monthlyCommitmentsRm: 1200,
      propertiesOwned: 0
    },
    salesOwner: record.salesOwner,
    loanOwner: 'Tan Mei Ling',
    legalFirm: 'Wong & Partners'
  }
}

function event(id: string, bookingId: string, kind: CaseEvent['kind'], applicationId: string | null = null): CaseEvent {
  return {
    id,
    bookingId,
    applicationId,
    track: kind === 'spa_signed' ? 'legal' : 'loan',
    kind,
    occurredAt: '2026-10-01T10:00:00+08:00',
    recordedAt: '2026-10-01T10:05:00+08:00',
    reportedBy: 'Fixture',
    verifiedBy: 'Fixture Reviewer',
    status: 'confirmed',
    source: 'staff',
    messageId: null,
    document: null,
    note: null
  }
}

const snapshot: Snapshot = {
  meta: { seed: 1, referenceDate: AS_OF, resetAt: null },
  bookings: records.map(booking),
  applications: [
    { id: 'APP-NURUL-APPROVED', bookingId: 'BK-NURUL-01', bank: 'Maybank', banker: 'Fixture Banker' },
    { id: 'APP-FARAH-REJECTED', bookingId: 'BK-FARAH-01', bank: 'RHB', banker: 'Fixture Banker' }
  ],
  events: [
    ...records.map((record) => event(`EV-${record.id}-BOOKED`, record.id, 'booked')),
    event('EV-NURUL-APPROVED', 'BK-NURUL-01', 'loan_approved', 'APP-NURUL-APPROVED'),
    event('EV-FARAH-REJECTED', 'BK-FARAH-01', 'loan_rejected', 'APP-FARAH-REJECTED')
  ],
  messages: [],
  playbooks: [],
  tasks: [],
  extractions: [],
  signals: [],
  nextActions: []
}

const database = { snapshot: async () => snapshot } as unknown as Database
const sales = profileFor('sales-nurul-aina')!
const manager = profileFor('manager')!

describe('get_forecast_summary', () => {
  it('returns operational reports when statistical history is unavailable and caps only row references', async () => {
    const result = await runTool('get_forecast_summary', {}, manager, database)

    expect(result).toContain('Booking-day-30 outlook: unavailable')
    expect(result).toContain('13 eligible bookings')
    expect(result).toContain(
      'Recorded appointments from 11 Oct 2026 through 10 Nov 2026: 0 upcoming, 0 overdue, 0 with a missing date.'
    )
    expect(result).toContain('Approved, awaiting SPA: 1 booking')
    expect(result).toContain('Unsigned waiting queue: 13 bookings')
    expect(result).toContain('Conversion history: 0 resolved bookings')
    expect(result).toContain('Recorded exits: 0 cancellations, 0 lapses')
    expect(result).toContain('Financing reviews: 1 open rejected booking')
    expect(result).toContain('Second-bank outcomes: 0 bookings that went to another bank after a rejection')
    expect(result).toContain('No completed bookings that went to another bank after a rejection are recorded.')
    expect(result).toContain('BK-NURUL-01')
    expect(result).toContain('BK-FARAH-06')

    const references = result.match(/BK-[A-Z0-9-]+/g) ?? []
    expect(references.length).toBeLessThanOrEqual(12)
  })

  it('uses the scoped snapshot for Sales Admin and the full authorized snapshot for Manager', async () => {
    const salesResult = await runTool('get_forecast_summary', {}, sales, database)
    const managerResult = await runTool('get_forecast_summary', {}, manager, database)

    expect(salesResult).toContain('Booking-day-30 outlook: unavailable')
    expect(salesResult).toContain('7 eligible bookings')
    expect(salesResult).toContain('Unsigned waiting queue: 7 bookings')
    expect(salesResult).toContain('BK-NURUL-07')
    expect(salesResult).not.toContain('BK-FARAH-01')
    expect(managerResult).toContain('Booking-day-30 outlook: unavailable')
    expect(managerResult).toContain('13 eligible bookings')
    expect(managerResult).toContain('BK-FARAH-01')
  })
})
