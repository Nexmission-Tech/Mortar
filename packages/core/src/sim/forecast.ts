import type { Backtest, Dataset, Forecast, ForecastModel, IsoDate, IsoDateTime, StageRate } from '../types'
import { deriveCase, FUNNEL_STAGES, groupBy, type CaseFacts } from './cases'
import { dateOf, diffDays } from './dates'
import { HORIZON_DAYS } from './constants'

/** Wilson score interval at 95% (Brown, Cai and DasGupta 2001). */
export function wilsonInterval(signed: number, n: number, z = 1.96): { low: number; high: number } {
  if (n <= 0) return { low: 0, high: 1 }
  const p = signed / n
  const z2 = z * z
  const denom = 1 + z2 / n
  const centre = (p + z2 / (2 * n)) / denom
  const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denom
  return { low: Math.max(0, centre - half), high: Math.min(1, centre + half) }
}

const SMALL_SAMPLE = 8

interface RateCell {
  signed: number
  n: number
}

interface RateModel {
  /** Key `${stageRank}:${ageBucket}` — resolved bookings that occupied that stage during that age band. */
  groups: Map<string, RateCell>
  stages: RateCell[]
  overall: RateCell
}

/** Build a serializable, case-free aggregate from the complete dataset. */
export function buildForecastModel(
  data: Dataset,
  asOf: IsoDate,
  refreshedAt: IsoDateTime,
  nextRefreshAt: IsoDateTime
): ForecastModel {
  const { model } = buildModel(factsFor(data, asOf))
  return {
    version: 1,
    asOf,
    refreshedAt,
    nextRefreshAt,
    groups: Object.fromEntries(
      [...model.groups].map(([key, cell]) => [key, { signed: cell.signed, resolved: cell.n }])
    ),
    stages: model.stages.map((cell, i) => ({ stage: FUNNEL_STAGES[i]!, signed: cell.signed, resolved: cell.n })),
    overall: { signed: model.overall.signed, resolved: model.overall.n }
  }
}

function modelFromAggregate(aggregate: ForecastModel): RateModel {
  return {
    groups: new Map(
      Object.entries(aggregate.groups).map(([key, cell]) => [key, { signed: cell.signed, n: cell.resolved }])
    ),
    stages: FUNNEL_STAGES.map((stage) => {
      const cell = aggregate.stages.find((candidate) => candidate.stage === stage)
      return { signed: cell?.signed ?? 0, n: cell?.resolved ?? 0 }
    }),
    overall: { signed: aggregate.overall.signed, n: aggregate.overall.resolved }
  }
}

const bucketOf = (age: number) => (age < 10 ? 0 : age < 20 ? 1 : age < 30 ? 2 : -1)

/** Age when a resolved booking left stage `r`: its next funnel entry or its terminal age. */
function leftAge(f: CaseFacts, r: number): number {
  let left = f.terminalAge ?? Number.POSITIVE_INFINITY
  for (let r2 = r + 1; r2 < FUNNEL_STAGES.length; r2 += 1) {
    const e = f.enteredAges[r2]
    if (e !== null && e < left) left = e
  }
  return left
}

function buildModel(facts: CaseFacts[]): { model: RateModel; live: CaseFacts[] } {
  const groups = new Map<string, RateCell>()
  const stages: RateCell[] = FUNNEL_STAGES.map(() => ({ signed: 0, n: 0 }))
  const overall: RateCell = { signed: 0, n: 0 }
  const live: CaseFacts[] = []
  for (const f of facts) {
    if (!f.exists) continue
    if (f.live) {
      live.push(f)
      continue
    }
    const hit = f.signedWithinHorizon ? 1 : 0
    overall.n += 1
    overall.signed += hit
    for (let r = 0; r < FUNNEL_STAGES.length; r += 1) {
      const entry = f.enteredAges[r]
      if (entry === null) continue
      stages[r].n += 1
      stages[r].signed += hit
      const left = leftAge(f, r)
      // At the stage at the band's midpoint age (5, 15, 25): the comparison
      // set for a live booking is the resolved cases that were in the same
      // stage at a similar booking age.
      for (let b = 0; b < 3; b += 1) {
        if (entry > b * 10 + 5 || left <= b * 10 + 5) continue
        const cell = groups.get(`${r}:${b}`) ?? { signed: 0, n: 0 }
        cell.n += 1
        cell.signed += hit
        groups.set(`${r}:${b}`, cell)
      }
    }
  }
  return { model: { groups, stages, overall }, live }
}

/**
 * Share of resolved bookings that occupied this stage at a similar booking age
 * and signed within the horizon. Falls back to stage-only under 8 cases, then
 * the overall rate.
 */
function probability(f: CaseFacts, model: RateModel): number {
  const r = Math.max(0, f.funnelRank)
  const cell = model.groups.get(`${r}:${bucketOf(f.ageDays)}`)
  if (cell && cell.n >= SMALL_SAMPLE) return cell.signed / cell.n
  const stage = model.stages[r]
  if (stage.n >= SMALL_SAMPLE) return stage.signed / stage.n
  return model.overall.n > 0 ? model.overall.signed / model.overall.n : 0
}

function factsFor(data: Dataset, asOf: IsoDate): CaseFacts[] {
  const appsByBooking = groupBy(data.applications, (x) => x.bookingId)
  const eventsByBooking = groupBy(data.events, (x) => x.bookingId)
  return data.bookings.map((b) => deriveCase(b, appsByBooking.get(b.id) ?? [], eventsByBooking.get(b.id) ?? [], asOf))
}

/** Expected signings within the horizon for live bookings, with an exact independent-outcome count range. */
export function forecast(
  data: Dataset,
  asOf: IsoDate,
  options: { draws?: number; seed?: number; model?: ForecastModel } = {}
): Forecast {
  const local = buildModel(factsFor(data, asOf))
  const { live } = local
  const model = options.model ? modelFromAggregate(options.model) : local.model
  const perBooking = live.map((f) => ({ bookingId: f.booking.id, probability: probability(f, model) }))
  const expectedSignings = perBooking.reduce((s, p) => s + p.probability, 0)
  const [rangeLow, rangeHigh] = exactCountRange(perBooking.map((p) => p.probability))
  const stageRates: StageRate[] = FUNNEL_STAGES.map((stage, r) => {
    const { signed, n } = model.stages[r]
    const { low, high } = wilsonInterval(signed, n)
    return { stage, signed, resolved: n, rate: n > 0 ? signed / n : 0, low, high }
  })
  return {
    asOf,
    horizonDays: HORIZON_DAYS,
    liveBookings: live.length,
    expectedSignings,
    rangeLow,
    rangeHigh,
    stageRates,
    perBooking,
    support: model.overall.n > 0 ? 'supported' : 'insufficient-history'
  }
}

function exactCountRange(probabilities: number[]): [number, number] {
  if (probabilities.length === 0) return [0, 0]
  let mass = [1]
  for (const probability of probabilities) {
    const next = new Array<number>(mass.length + 1).fill(0)
    for (let count = 0; count < mass.length; count += 1) {
      next[count] += mass[count]! * (1 - probability)
      next[count + 1] += mass[count]! * probability
    }
    mass = next
  }
  const tolerance = Number.EPSILON * Math.max(1, probabilities.length) * 8
  const quantile = (q: number) => {
    let cumulative = 0
    for (let count = 0; count < mass.length; count += 1) {
      cumulative += mass[count]!
      if (cumulative >= q || q - cumulative <= tolerance) return count
    }
    return mass.length - 1
  }
  return [quantile(0.1), quantile(0.9)]
}

const CALIBRATION_BUCKETS = [
  { bucket: '0–25%', lo: 0, hi: 0.25 },
  { bucket: '25–50%', lo: 0.25, hi: 0.5 },
  { bucket: '50–75%', lo: 0.5, hi: 0.75 },
  { bucket: '75–100%', lo: 0.75, hi: 1.01 }
] as const

/** Cut the log at `cutoff`, estimate from what was known then, and score the next horizon. */
export function backtest(data: Dataset, cutoff: IsoDate): Backtest {
  const filtered: Dataset = {
    bookings: data.bookings,
    applications: data.applications,
    events: data.events.filter((e) => dateOf(e.recordedAt) <= cutoff)
  }
  const { model, live } = buildModel(factsFor(filtered, cutoff))
  const eventsByBooking = groupBy(data.events, (x) => x.bookingId)
  const observed = (f: CaseFacts): number => {
    const signed = (eventsByBooking.get(f.booking.id) ?? []).find(
      (e) => e.status === 'confirmed' && e.kind === 'spa_signed'
    )
    return signed !== undefined && diffDays(f.booking.bookingDate, dateOf(signed.occurredAt)) <= HORIZON_DAYS ? 1 : 0
  }
  const rows = live.map((f) => ({ p: probability(f, model), o: observed(f) }))
  const predicted = rows.reduce((s, r) => s + r.p, 0)
  const observedCount = rows.reduce((s, r) => s + r.o, 0)
  const brier = rows.length > 0 ? rows.reduce((s, r) => s + (r.p - r.o) * (r.p - r.o), 0) / rows.length : 0
  const calibration = CALIBRATION_BUCKETS.map(({ bucket, lo, hi }) => {
    const inBucket = rows.filter((r) => r.p >= lo && r.p < hi)
    return {
      bucket,
      n: inBucket.length,
      predicted: inBucket.length > 0 ? inBucket.reduce((s, r) => s + r.p, 0) / inBucket.length : 0,
      observed: inBucket.length > 0 ? inBucket.reduce((s, r) => s + r.o, 0) / inBucket.length : 0
    }
  })
  return {
    cutoff,
    predicted,
    observed: observedCount,
    brier,
    calibration,
    support: rows.length > 0 && model.overall.n > 0 ? 'validated' : 'insufficient-history'
  }
}
