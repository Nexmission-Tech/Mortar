import { describe, expect, it } from 'vitest'
import { summarizeCases, type CaseSummary, type ChartUnit } from '@mortar/core'
import { buildSnapshot } from '@/components/bookings/__tests__/snapshotFixture'
import { quickViewRow } from '@/components/bookings/quickViewRow'
import { formatDate, formatRm } from '@/components/case/format'
import { unitsForSnapshot } from '@/components/sales-chart/salesChart'
import { loanPosition, unitLocation, unitOverview } from '@/components/sales-chart/unitOverview'

const SNAP = buildSnapshot()
const CASES = summarizeCases(SNAP, SNAP.meta.referenceDate)
const UNITS = unitsForSnapshot(SNAP, CASES)
const unit = (code: string) => UNITS.find((u) => u.code === code)!
const summary = (patch: Partial<CaseSummary>): CaseSummary => ({
  ...CASES[0]!,
  ...patch
})

describe('unitLocation', () => {
  it('names the block, floor and unit in words', () => {
    expect(unitLocation(unit('A-12-03'))).toBe('Block A · Floor 12 · Unit 03')
  })

  it('leaves the block out when the project has none', () => {
    expect(unitLocation({ ...unit('A-12-03'), block: '' })).toBe('Floor 12 · Unit 03')
  })
})

describe('loanPosition', () => {
  it('reads a closed case as closed, whatever its loans say', () => {
    expect(loanPosition(summary({ stage: 'cancelled' }))).toBe('Booking Cancelled')
    expect(loanPosition(summary({ stage: 'lapsed' }))).toBe('Booking Lapsed')
  })

  it('reads a signed SPA first', () => {
    expect(loanPosition(summary({ spaSigned: true }))).toBe('SPA Signed')
  })

  it('names the approving bank and whether the SPA appointment is set', () => {
    const approved = [{ id: 'A1', bank: 'Crestline Bank', status: 'approved' as const }]
    expect(
      loanPosition(
        summary({
          spaSigned: false,
          applications: approved,
          daysSinceSpaSet: null
        })
      )
    ).toBe('Loan Approved By Crestline Bank · No SPA Appointment Yet')
    expect(
      loanPosition(
        summary({
          spaSigned: false,
          applications: approved,
          daysSinceSpaSet: 3
        })
      )
    ).toBe('Loan Approved By Crestline Bank · SPA Appointment Set')
  })

  it('names the bank still deciding, the latest one first', () => {
    const apps = [
      { id: 'A1', bank: 'Malayan Trust Bank', status: 'rejected' as const },
      { id: 'A2', bank: 'Crestline Bank', status: 'submitted' as const }
    ]
    expect(loanPosition(summary({ spaSigned: false, applications: apps }))).toBe('Waiting On Crestline Bank To Decide')
    const pending = [{ id: 'A1', bank: 'Crestline Bank', status: 'documents_pending' as const }]
    expect(loanPosition(summary({ spaSigned: false, applications: pending }))).toBe(
      'Crestline Bank Waiting On Documents'
    )
  })

  it('names every bank still deciding, whatever order they are stored in', () => {
    const apps = [
      { id: 'A2', bank: 'Crestline Bank', status: 'submitted' as const },
      { id: 'A1', bank: 'Apex Bank', status: 'submitted' as const }
    ]
    expect(loanPosition(summary({ spaSigned: false, applications: apps }))).toBe(
      'Waiting On Crestline Bank And Apex Bank To Decide'
    )
  })

  it('says when no loan is live or none was submitted', () => {
    const declined = [{ id: 'A1', bank: 'Malayan Trust Bank', status: 'rejected' as const }]
    expect(loanPosition(summary({ spaSigned: false, applications: declined }))).toBe('No Live Loan Application')
    expect(loanPosition(summary({ spaSigned: false, applications: [] }))).toBe('No Loan Submitted Yet')
  })
})

describe('unitOverview', () => {
  it('gives a case on the viewer’s desk its buyer, price, loan line and next step', () => {
    const row = quickViewRow(SNAP, CASES, 'BK-9001')!
    const overview = unitOverview(unit('A-12-03'), row)
    expect(overview.kind).toBe('case')
    if (overview.kind !== 'case') return
    expect(overview.code).toBe('A-12-03')
    expect(overview.location).toBe('Block A · Floor 12 · Unit 03')
    expect(overview.buyer).toBe(row.booking.buyer.name)
    expect(overview.bookingId).toBe('BK-9001')
    expect(overview.price).toBe(formatRm(row.booking.priceRm))
    expect(overview.bookedOn).toBe(formatDate(row.booking.bookingDate))
    expect(overview.age).toMatch(/^\d+ Days? Old$/)
    expect(overview.position).toBe(loanPosition(row.summary))
    expect(overview.nextStep === null || / · /.test(overview.nextStep)).toBe(true)
  })

  it('names the desk holding a unit the viewer cannot open', () => {
    const held: ChartUnit = {
      ...unit('C-03-01'),
      state: 'needs_action',
      bookingId: null,
      heldBy: 'Farah Izzati'
    }
    expect(unitOverview(held, null)).toEqual({
      kind: 'held',
      code: 'C-03-01',
      location: 'Block C · Floor 03 · Unit 01',
      state: 'needs_action',
      heldBy: 'Farah Izzati'
    })
  })

  it('says an available unit is not booked', () => {
    const free: ChartUnit = {
      ...unit('C-03-01'),
      state: 'available',
      bookingId: null,
      heldBy: null
    }
    expect(unitOverview(free, null)).toEqual({
      kind: 'available',
      code: 'C-03-01',
      location: 'Block C · Floor 03 · Unit 01',
      state: 'available'
    })
  })
})
