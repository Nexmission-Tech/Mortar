import { describe, expect, it } from 'vitest'
import { dueOrOverduePhrase, headlineBlocker, missedAppointment } from '@/components/chase/today'

describe('missedAppointment', () => {
  it('spots a missed SPA appointment, and nothing else', () => {
    expect(missedAppointment(['No Update For 9 Days', 'SPA Appointment Missed 1 Day Ago'])).toBe(true)
    expect(missedAppointment(['SPA Set 21 Days Ago, Still Unsigned', 'SPA Not Scheduled 12 Days After LO'])).toBe(false)
    expect(missedAppointment([])).toBe(false)
  })
})

describe('headlineBlocker', () => {
  it('leads with the first specific reason over the generic no-update one', () => {
    expect(
      headlineBlocker([
        'No Update For 12 Days',
        'Payslip Still Outstanding After 15 Days',
        'SPA Set 9 Days Ago, Still Unsigned'
      ])
    ).toEqual({ text: 'Payslip Still Outstanding After 15 Days', generic: false })
  })

  it('falls back to the generic reason, marked generic, when it is the only one', () => {
    expect(headlineBlocker(['No Update For 8 Days'])).toEqual({ text: 'No Update For 8 Days', generic: true })
  })

  it('treats one day without an update as generic too', () => {
    expect(headlineBlocker(['No Update For 1 Day'])?.generic).toBe(true)
  })

  it('returns nothing for a case with no stall reasons', () => {
    expect(headlineBlocker([])).toBeNull()
  })
})

describe('dueOrOverduePhrase', () => {
  it('reads in the singular and the plural', () => {
    expect(dueOrOverduePhrase(1)).toBe('1 Task Due Or Overdue')
    expect(dueOrOverduePhrase(0)).toBe('0 Tasks Due Or Overdue')
    expect(dueOrOverduePhrase(3)).toBe('3 Tasks Due Or Overdue')
  })
})
