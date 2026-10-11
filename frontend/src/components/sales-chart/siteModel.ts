/**
 * The sales-gallery model round the towers, in metres: a timber plinth, a main
 * and a side road, an arrival with a guardhouse, drop-off and water feature, a
 * car park ramp, the podium's ventilation bands and planted edge, a facility
 * deck on its roof (lap and children's pools, lawn, playground, BBQ pavilions,
 * gym, hall, jogging loop, covered walkway), trees, quiet neighbours and the
 * labels. Pure and deterministic, so it is tested without WebGL.
 */
import { PODIUM_HEIGHT, type Box, type TowerModel, type Vec3 } from './towerModel'

export type SiteMaterial =
  | 'plinth'
  | 'ground'
  | 'paving'
  | 'stone'
  | 'road'
  | 'lane'
  | 'lawn'
  | 'water'
  | 'foliage'
  | 'track'
  | 'structure'
  | 'glass'
  | 'neighbour'
  | 'band'
export interface SiteBox extends Box {
  material: SiteMaterial
}
export interface Tree {
  at: Vec3
  canopy: number
  trunk: number
  kind: 'shade' | 'palm'
}
export interface SiteLabel {
  key: string
  text: string
  at: Vec3
  kind: 'facility' | 'nameplate' | 'north'
}
export type Rect = { min: [number, number]; max: [number, number] }
type Spot = [number, number]
/** A facility's footprint on the podium, claimed so nothing else lands on it. */
export interface DeckSpot {
  key: string
  rect: Rect
}
export interface SiteModel {
  boxes: SiteBox[]
  trees: Tree[]
  labels: SiteLabel[]
  bounds: { min: Vec3; max: Vec3 }
  roads: Rect[]
  driveway: Rect
  podium: Rect
  deck: DeckSpot[]
}

const STRIP = 18
const MAIN_ROAD = 14
const SIDE_ROAD = 12
const VERGE = 5
const ACROSS = 30
const LEFT = 34
const PLINTH = 2.5
const DECK = PODIUM_HEIGHT

/** A small, stable 0–1 variation from an index, so nothing moves between renders. */
const vary = (i: number, salt: number) => (((i + 1) * 9301 + salt * 49297) % 233280) / 233280
const overlaps = (a: Rect, b: Rect) =>
  a.min[0] < b.max[0] && b.min[0] < a.max[0] && a.min[1] < b.max[1] && b.min[1] < a.max[1]
const NONE: Rect = { min: [0, 0], max: [0, 0] }
const EMPTY_SITE: SiteModel = {
  boxes: [],
  trees: [],
  labels: [],
  bounds: { min: [0, 0, 0], max: [0, 0, 0] },
  roads: [],
  driveway: NONE,
  podium: NONE,
  deck: []
}

export function siteModel(towers: TowerModel, projectName: string): SiteModel {
  if (towers.towers.length === 0) return EMPTY_SITE
  const boxes: SiteBox[] = []
  const trees: Tree[] = []
  const labels: SiteLabel[] = []
  const add = (material: SiteMaterial, center: Vec3, size: Vec3, tilt?: number) =>
    boxes.push(tilt === undefined ? { material, center, size } : { material, center, size, tilt })
  const label = (kind: SiteLabel['kind'], text: string, at: Vec3) =>
    labels.push({ key: `${kind}-${text}`, text, at, kind })

  const { center: pc, size: ps } = towers.podium
  const px0 = pc[0] - ps[0] / 2
  const px1 = pc[0] + ps[0] / 2
  const pz0 = pc[2] - ps[2] / 2
  const pz1 = pc[2] + ps[2] / 2

  // The site boundary, the roads and the plinth round them.
  const sx0 = px0 - STRIP
  const sx1 = px1 + STRIP
  const sz0 = pz0 - STRIP
  const sz1 = pz1 + STRIP
  const x0 = sx0 - LEFT
  const x1 = sx1 + SIDE_ROAD + VERGE
  const z0 = sz0 - VERGE
  const z1 = sz1 + MAIN_ROAD + ACROSS
  const W = x1 - x0
  const D = z1 - z0
  add('plinth', [(x0 + x1) / 2, -PLINTH / 2, (z0 + z1) / 2], [W, PLINTH, D])
  add('ground', [(x0 + x1) / 2, 0.05, (z0 + z1) / 2], [W, 0.1, D])
  add('lawn', [(sx0 + sx1) / 2, 0.12, (sz0 + sz1) / 2], [sx1 - sx0, 0.04, sz1 - sz0])

  const main: Rect = { min: [x0, sz1], max: [x1, sz1 + MAIN_ROAD] }
  const side: Rect = { min: [sx1, z0], max: [sx1 + SIDE_ROAD, sz1 + MAIN_ROAD] }
  for (const road of [main, side])
    add(
      'road',
      [(road.min[0] + road.max[0]) / 2, 0.16, (road.min[1] + road.max[1]) / 2],
      [road.max[0] - road.min[0], 0.04, road.max[1] - road.min[1]]
    )
  // Dashed centre lines, stopping short of the junction.
  for (let x = x0 + 4; x < sx1 - 4; x += 7) add('lane', [x + 1.5, 0.2, sz1 + MAIN_ROAD / 2], [3, 0.02, 0.25])
  for (let z = z0 + 4; z < sz1 - 4; z += 7) add('lane', [sx1 + SIDE_ROAD / 2, 0.2, z + 1.5], [0.25, 0.02, 3])

  // The arrival: a driveway off the main road, a guardhouse between two barrier
  // lanes, a drop-off canopy at the podium front and a water feature beside it.
  const ex = px1 - 26
  const driveway: Rect = { min: [ex - 5.5, pz1], max: [ex + 5.5, sz1] }
  add('paving', [ex, 0.18, (pz1 + sz1) / 2], [11, 0.06, sz1 - pz1])
  add('structure', [ex, 1.6, sz1 - 5], [4, 3.2, 6])
  add('structure', [ex, 3.35, sz1 - 5], [5, 0.3, 7])
  for (const lane of [-1, 1]) add('band', [ex + lane * 3.75, 1, sz1 - 2.5], [3.5, 0.15, 0.15])
  add('structure', [ex, 4.6, pz1 + 4], [15, 0.4, 8])
  for (const post of [-1, 1]) add('structure', [ex + post * 7, 2.2, pz1 + 7.5], [0.4, 4.4, 0.4])
  add('stone', [ex - 15, 0.25, pz1 + 6], [9, 0.3, 4])
  add('water', [ex - 15, 0.45, pz1 + 6], [8, 0.2, 3])
  // Set apart, so the two labels never sit on each other from the front left.
  label('facility', 'Guardhouse', [ex + 16, 2, sz1 - 5])
  label('facility', 'Drop-Off', [ex - 16, 6, pz1 + 4])

  // The car park ramp up the podium's right side, low end to the front, into an
  // opening in the podium face at its top.
  const rampLength = 30
  add('paving', [px1 + 3.5, 2, pz1 - rampLength / 2 - 4], [7, 0.6, rampLength], Math.atan2(4, rampLength))
  add('band', [px1 + 0.1, 4.3, pz1 - rampLength], [0.2, 2.4, 8])

  // The podium: ventilation bands on its faces and a planted edge round its roof.
  for (const y of [2.6, 6]) {
    add('band', [pc[0], y, pz1 + 0.05], [ps[0] - 2, 0.8, 0.1])
    add('band', [pc[0], y, pz0 - 0.05], [ps[0] - 2, 0.8, 0.1])
    add('band', [px0 - 0.05, y, pc[2]], [0.1, 0.8, ps[2] - 2])
    add('band', [px1 + 0.05, y, pc[2]], [0.1, 0.8, ps[2] - 2])
  }
  add('paving', [pc[0], DECK + 0.05, pc[2]], [ps[0] - 0.2, 0.1, ps[2] - 0.2])
  add('foliage', [pc[0], DECK + 0.4, pz1 - 0.7], [ps[0], 0.7, 1.4])
  add('foliage', [pc[0], DECK + 0.4, pz0 + 0.7], [ps[0], 0.7, 1.4])
  add('foliage', [px0 + 0.7, DECK + 0.4, pc[2]], [1.4, 0.7, ps[2]])
  add('foliage', [px1 - 0.7, DECK + 0.4, pc[2]], [1.4, 0.7, ps[2]])

  // The deck in front of the towers, inside the planted edge.
  const towerFront = Math.max(...towers.towers.map((t) => t.center[2] + t.size[2] / 2))
  const dz0 = towerFront + 3
  const dz1 = pz1 - 2.5
  const dx0 = px0 + 2.5
  const dx1 = px1 - 2.5
  const dcx = (dx0 + dx1) / 2
  const dcz = (dz0 + dz1) / 2
  const top = DECK + 0.1

  // A lawn across the front deck, under everything else on it, ringed by the
  // jogging loop.
  add('lawn', [dcx, top + 0.02, dcz], [dx1 - dx0 - 4, 0.04, dz1 - dz0 - 4])
  add('track', [dcx, top + 0.03, dz0 + 1], [dx1 - dx0, 0.06, 2])
  add('track', [dcx, top + 0.03, dz1 - 1], [dx1 - dx0, 0.06, 2])
  add('track', [dx0 + 1, top + 0.03, dcz], [2, 0.06, dz1 - dz0])
  add('track', [dx1 - 1, top + 0.03, dcz], [2, 0.06, dz1 - dz0])

  // Facilities claim space inside the loop in priority order: the gym and hall
  // take the back corners, then the pools, pavilions, lawn and playground. Each
  // tries its usual place, then any free spot; one that fits nowhere is left out
  // rather than overlapping another, so a small podium gets fewer, not crowded,
  // facilities.
  const deck: DeckSpot[] = []
  const ix0 = dx0 + 2.5
  const ix1 = dx1 - 2.5
  const iz0 = dz0 + 2.5
  const iz1 = dz1 - 2.5
  const anywhere: Spot[] = []
  for (let z = iz0; z <= iz1; z += 2) for (let x = ix0; x <= ix1; x += 2) anywhere.push([x, z])
  const claim = (key: string, w: number, d: number, preferred: Spot[]): Spot | null => {
    for (const [x, z] of [...preferred, ...anywhere]) {
      const rect: Rect = { min: [x - w / 2, z - d / 2], max: [x + w / 2, z + d / 2] }
      const onDeck = rect.min[0] >= ix0 && rect.max[0] <= ix1 && rect.min[1] >= iz0 && rect.max[1] <= iz1
      if (onDeck && !deck.some((s) => overlaps(s.rect, rect))) {
        deck.push({ key, rect })
        return [x, z]
      }
    }
    return null
  }

  // Gym in glass, hall in white, at the back corners of the front deck.
  const gym = claim('gym', 16, 13, [[dx1 - 11, dz0 + 9]])
  if (gym) {
    add('glass', [gym[0], top + 2, gym[1]], [15, 4, 12])
    add('structure', [gym[0], top + 4.15, gym[1]], [16, 0.3, 13])
    label('facility', 'Gym', [gym[0], top + 6, gym[1]])
  }
  const hall = claim('hall', 18, 12, [[dx0 + 13, dz0 + 9]])
  if (hall) {
    add('structure', [hall[0], top + 2.25, hall[1]], [18, 4.5, 12])
    label('facility', 'Hall', [hall[0], top + 6, hall[1]])
  }

  // Lap pool on its terrace, compact on a small deck; the children's pool beside it.
  const lap = claim('lap-pool', 33, 16, [[dcx, dcz]])
  const pool = lap ?? claim('lap-pool', 21, 12, [[dcx, dcz]])
  const poolWidth = lap ? 33 : 21
  if (pool) {
    add('stone', [pool[0], top + 0.08, pool[1]], [poolWidth, 0.15, lap ? 16 : 12])
    add('water', [pool[0], top + 0.2, pool[1]], [lap ? 25 : 15, 0.12, lap ? 8 : 6])
    label('facility', 'Lap Pool', [pool[0], top + 1, pool[1]])
  }
  const besidePool: Spot[] = pool
    ? [
        [pool[0] + poolWidth / 2 + 5.5, pool[1]],
        [pool[0] - poolWidth / 2 - 5.5, pool[1]]
      ]
    : []
  const kids = claim('children-pool', 10, 10, besidePool)
  if (kids) {
    add('stone', [kids[0], top + 0.08, kids[1]], [10, 0.15, 10])
    add('water', [kids[0], top + 0.2, kids[1]], [6, 0.12, 6])
    label('facility', 'Children’s Pool', [kids[0], top + 1, kids[1]])
  }

  // Two BBQ pavilions on the front edge.
  let bbqLabelled = false
  for (const x of [dx0 + 9, dx1 - 9]) {
    const bbq = claim('bbq', 5, 4, [[x, dz1 - 5]])
    if (!bbq) continue
    add('structure', [bbq[0], top + 3, bbq[1]], [5, 0.3, 4])
    for (const [px, pz] of [
      [-2.2, -1.7],
      [2.2, -1.7],
      [-2.2, 1.7],
      [2.2, 1.7]
    ] as const)
      add('structure', [bbq[0] + px, top + 1.5, bbq[1] + pz], [0.25, 3, 0.25])
    if (!bbqLabelled) label('facility', 'BBQ', [bbq[0], top + 4, bbq[1]])
    bbqLabelled = true
  }

  // Lawn and playground in the gaps between towers when they are wide enough,
  // otherwise on the deck.
  const gaps = towers.towers.slice(1).map((t, i) => {
    const a = towers.towers[i]!
    const left = a.center[0] + a.size[0] / 2
    const right = t.center[0] - t.size[0] / 2
    return {
      x: (left + right) / 2,
      z: Math.min(a.center[2], t.center[2]),
      width: right - left
    }
  })
  const inGap = (key: string, gap: (typeof gaps)[number] | undefined, minWidth: number, w: number, d: number) => {
    if (!gap || gap.width <= minWidth) return null
    deck.push({ key, rect: { min: [gap.x - w / 2, gap.z - d / 2], max: [gap.x + w / 2, gap.z + d / 2] } })
    return [gap.x, gap.z] satisfies Spot
  }
  const lawn = inGap('lawn', gaps[0], 17, 15, 20) ?? claim('lawn', 15, 20, [[dcx - 30, dcz]])
  const play =
    inGap('playground', gaps[1], 12, 10, 12) ??
    claim('playground', 10, 12, [
      [dcx - 30, dcz],
      [dcx + 36, dcz]
    ])
  if (lawn) {
    add('lawn', [lawn[0], top + 0.1, lawn[1]], [15, 0.2, 20])
    label('facility', 'Lawn', [lawn[0], top + 1, lawn[1]])
  }
  if (play) {
    add('lawn', [play[0], top + 0.1, play[1]], [10, 0.2, 12])
    for (const [px, pz, h] of [
      [-3, -3, 2.5],
      [2.5, 2, 1.6],
      [0, -1, 3.2]
    ] as const)
      add('structure', [play[0] + px, top + h / 2, play[1] + pz], [1.2, h, 1.2])
    label('facility', 'Playground', [play[0], top + 4, play[1]])
  }

  // The covered walkway in front of the towers, linking their lobbies, with
  // posts evenly spaced from the first lobby to the last.
  const first = towers.towers[0]!
  const last = towers.towers[towers.towers.length - 1]!
  const span = last.center[0] - first.center[0]
  if (span > 0) {
    const wz = dz0 - 1.5
    add('structure', [(first.center[0] + last.center[0]) / 2, top + 3, wz], [span, 0.3, 3])
    const posts = Math.max(1, Math.round(span / 8))
    for (let i = 0; i <= posts; i++)
      add('structure', [first.center[0] + (span * i) / posts, top + 1.5, wz + 1.2], [0.25, 3, 0.25])
  }

  // Trees: shade trees round the site boundary, street trees across the road,
  // a few on the deck and palms at the arrival.
  let n = 0
  const shade = (x: number, z: number, y = 0.1) => {
    trees.push({
      at: [x, y, z],
      canopy: 2.2 + vary(n, 1) * 1.2,
      trunk: 3 + vary(n, 2),
      kind: 'shade'
    })
    n++
  }
  const clearOfArrival = (x: number) => Math.abs(x - ex) > 10
  for (let x = sx0 + 5; x <= sx1 - 5; x += 9) {
    if (clearOfArrival(x)) shade(x, sz1 - 4)
    shade(x, sz0 + 4)
  }
  for (let z = sz0 + 13; z <= sz1 - 13; z += 9) {
    shade(sx0 + 4, z)
    if (z < pz1 - 40 || z > pz1) shade(sx1 - 4, z)
  }
  for (let x = x0 + 8; x <= x1 - 8; x += 12) shade(x, sz1 + MAIN_ROAD + 2.5)
  // Deck trees wherever a facility leaves room: a row along its front and four
  // round the pool.
  const roomFor = (x: number, z: number, margin: number) =>
    x >= ix0 &&
    x <= ix1 &&
    z >= iz0 &&
    z <= iz1 &&
    !deck.some(
      (s) =>
        x > s.rect.min[0] - margin &&
        x < s.rect.max[0] + margin &&
        z > s.rect.min[1] - margin &&
        z < s.rect.max[1] + margin
    )
  for (let x = dx0 + 6; x <= dx1 - 6; x += 12) if (roomFor(x, dz1 - 4.5, 3)) shade(x, dz1 - 4.5, top)
  for (const [dx, dz] of [
    [-18, -9],
    [18, -9],
    [-18, 9],
    [18, 9]
  ] as const)
    if (roomFor(dcx + dx, dcz + dz, 1.5)) shade(dcx + dx, dcz + dz, top)
  for (const [dx, dz] of [
    [-8, 10],
    [8, 10],
    [-8, -10],
    [8, -10]
  ] as const)
    trees.push({
      at: [ex + dx, 0.1, (dz > 0 ? pz1 : sz1) + dz * 0.6],
      canopy: 2.4,
      trunk: 7,
      kind: 'palm'
    })

  // Quiet neighbours: terrace rows across the main road, two blocks on the left.
  for (let x = x0 + 16; x <= x1 - 16; x += 30) add('neighbour', [x, 4, sz1 + MAIN_ROAD + 4 + 9], [24, 8, 12])
  for (const z of [sz0 + 30, sz0 + 80]) add('neighbour', [x0 + LEFT / 2 - 2, 11, z], [16, 22, 36])

  label('nameplate', projectName, [(x0 + x1) / 2, -PLINTH / 2, z1])
  label('north', 'N', [x0 + 6, 0.3, z1 - 6])

  return {
    boxes,
    trees,
    labels,
    bounds: { min: [x0, -PLINTH, z0], max: [x1, towers.bounds.max[1], z1] },
    roads: [main, side],
    driveway,
    podium: { min: [px0, pz0], max: [px1, pz1] },
    deck
  }
}
