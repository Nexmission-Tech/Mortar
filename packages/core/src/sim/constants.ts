import type { IsoDate } from '../types'

/** The canonical demo seed. */
export const DEFAULT_SEED = 20260918
/** "Today" on every screen, so screenshots match the pitch video. */
export const REFERENCE_DATE: IsoDate = '2026-09-18'
/** Conversion means an SPA signed within this many days of booking. */
export const HORIZON_DAYS = 30
/**
 * An SPA appointment whose day has passed with no confirmed signing counts as
 * missed this many working days later: the next working day.
 */
export const SPA_MISSED_AFTER_WORK_DAYS = 1
/** Staff names per persona, used for reviews and tasks. */
export const PERSONA_STAFF: Record<
  'sales-admin' | 'loan-admin' | 'legal-admin' | 'manager',
  { name: string; role: string }
> = {
  'sales-admin': { name: 'Nurul Aina', role: 'sales_admin' },
  'loan-admin': { name: 'Tan Mei Ling', role: 'loan_admin' },
  'legal-admin': { name: 'Arvind Raj', role: 'legal' },
  manager: { name: 'Robert Khoo', role: 'manager' }
}
