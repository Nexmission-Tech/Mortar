/**
 * The `@mortar/core` surface: the domain contract, the seeded simulation and
 * case rules, who holds the ball on a case, booking sheet intake, the Jev
 * helpers, the Ask question set, and the demo fixtures.
 * Resolves straight to source — there is no build step.
 */
export type * from './types'
export * from './profiles'
export * from './projectSettings'
export * from './units'
export * from './manager'
export * from './sim'
export { forecastInsights } from './sim/insights'
export type { ForecastInsights, InsightBooking } from './sim/insights'
export { cohortResult } from './sim/cohort'
export type { CohortResult } from './sim/cohort'
export * from './ball'
export * from './import'
export * from './jev'
export * from './brain'
export { STORIES } from './fixtures/stories'
export { PLAYBOOKS } from './fixtures/playbooks'
export * from './team'
