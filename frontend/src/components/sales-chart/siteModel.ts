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
type Rect = { min: [number, number]; max: [number, number] }
export interface SiteModel {
  boxes: SiteBox[]
  trees: Tree[]
  labels: SiteLabel[]
  bounds: { min: Vec3; max: Vec3 }
  roads: Rect[]
  driveway: Rect
  podium: Rect
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

export function siteModel(towers: TowerModel, projectName: string): SiteModel {
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
  label('facility', 'Guardhouse', [ex, 4.5, sz1 - 5])
  label('facility', 'Drop-Off', [ex, 6, pz1 + 4])

  // The car park ramp up the podium's right side, low end to the front.
  const rampLength = 30
  add('paving', [px1 + 4.5, 2, pz1 - rampLength / 2 - 4], [7, 0.6, rampLength], Math.atan2(4, rampLength))

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

  // Lap pool on its terrace, the children's pool beside it.
  add('stone', [dcx, top + 0.08, dcz], [33, 0.15, 16])
  add('water', [dcx, top + 0.2, dcz], [25, 0.12, 8])
  add('stone', [dcx + 22, top + 0.08, dcz], [10, 0.15, 10])
  add('water', [dcx + 22, top + 0.2, dcz], [6, 0.12, 6])
  label('facility', 'Lap Pool', [dcx, top + 1, dcz])
  label('facility', 'Children’s Pool', [dcx + 22, top + 1, dcz])

  // The jogging loop round the front deck.
  add('track', [dcx, top + 0.03, dz0 + 1], [dx1 - dx0, 0.06, 2])
  add('track', [dcx, top + 0.03, dz1 - 1], [dx1 - dx0, 0.06, 2])
  add('track', [dx0 + 1, top + 0.03, dcz], [2, 0.06, dz1 - dz0])
  add('track', [dx1 - 1, top + 0.03, dcz], [2, 0.06, dz1 - dz0])

  // Gym in glass, hall in white, at the back corners of the front deck.
  add('glass', [dx1 - 11, top + 2, dz0 + 9], [15, 4, 12])
  add('structure', [dx1 - 11, top + 4.15, dz0 + 9], [16, 0.3, 13])
  add('structure', [dx0 + 13, top + 2.25, dz0 + 9], [18, 4.5, 12])
  label('facility', 'Gym', [dx1 - 11, top + 6, dz0 + 9])
  label('facility', 'Hall', [dx0 + 13, top + 6, dz0 + 9])

  // Two BBQ pavilions on the front edge.
  for (const end of [-1, 1]) {
    const x = end < 0 ? dx0 + 9 : dx1 - 9
    add('structure', [x, top + 3, dz1 - 5], [5, 0.3, 4])
    for (const [px, pz] of [
      [-2.2, -1.7],
      [2.2, -1.7],
      [-2.2, 1.7],
      [2.2, 1.7]
    ] as const)
      add('structure', [x + px, top + 1.5, dz1 - 5 + pz], [0.25, 3, 0.25])
  }
  label('facility', 'BBQ', [dx0 + 9, top + 4, dz1 - 5])

  // Lawn and playground in the gaps between towers, or on the front deck when
  // there are none.
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
  const lawnAt: Vec3 = gaps[0] && gaps[0].width > 17 ? [gaps[0].x, top + 0.1, gaps[0].z] : [dcx - 30, top + 0.1, dcz]
  const playAt: Vec3 =
    gaps[1] && gaps[1].width > 12
      ? [gaps[1].x, top + 0.1, gaps[1].z]
      : gaps[0] && gaps[0].width > 17
        ? [dcx - 30, top + 0.1, dcz]
        : [dcx + 36, top + 0.1, dcz]
  add('lawn', lawnAt, [15, 0.2, 20])
  add('lawn', playAt, [10, 0.2, 12])
  for (const [px, pz, h] of [
    [-3, -3, 2.5],
    [2.5, 2, 1.6],
    [0, -1, 3.2]
  ] as const)
    add('structure', [playAt[0] + px, top + h / 2, playAt[2] + pz], [1.2, h, 1.2])
  label('facility', 'Lawn', [lawnAt[0], top + 1, lawnAt[2]])
  label('facility', 'Playground', [playAt[0], top + 4, playAt[2]])

  // The covered walkway in front of the towers, linking their lobbies.
  const first = towers.towers[0]!
  const last = towers.towers[towers.towers.length - 1]!
  const span = last.center[0] - first.center[0]
  if (span > 0) {
    const wz = dz0 - 1.5
    add('structure', [(first.center[0] + last.center[0]) / 2, top + 3, wz], [span, 0.3, 3])
    for (let x = first.center[0]; x <= last.center[0] + 1e-6; x += 8)
      add('structure', [x, top + 1.5, wz + 1.2], [0.25, 3, 0.25])
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
  for (const [dx, dz] of [
    [-18, -9],
    [18, -9],
    [-18, 9],
    [18, 9]
  ] as const)
    shade(dcx + dx, dcz + dz, top)
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
    podium: { min: [px0, pz0], max: [px1, pz1] }
  }
}
