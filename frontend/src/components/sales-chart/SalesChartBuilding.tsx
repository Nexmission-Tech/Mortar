/**
 * The Sales Chart's Building view: the project as a sales-gallery scale model.
 * Each block is a real tower (a double-loaded plate, slab edges, fins,
 * balconies, a core and a roof) on a podium, every unit a box in its state's
 * tone. It takes the same props as the Grid, so filters, the readout and the
 * unit island work the same way.
 *
 * DESIGN.md names this the one 3D surface in the product. Colours come from
 * CSS tokens; a hemisphere light and one soft-shadowed sun shade it; with a
 * filter on, the units it does not light and all structure turn see-through.
 * The scene renders on demand, never in a loop.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { ChartUnit } from '@mortar/core'
import { cn } from '@/lib/utils'
import { modelKey, towerModel, type Box, type TowerModel, type Vec3 } from './towerModel'
import { sceneColors, type SceneColors } from './sceneColors'

type SalesChartBuildingProps = {
  units: ChartUnit[]
  /** Units the active filter lights; `null` when no filter is on. */
  lit: ReadonlySet<string> | null
  selected: string | null
  onSelect: (unit: ChartUnit) => void
  onHover: (unit: ChartUnit | null) => void
  /** Read out to screen readers in place of the canvas. */
  projectName?: string
}

type Side = 'front' | 'back'

/** The camera starts from the front left, about 30° above the deck. */
const START_AZIMUTH = -0.6
const START_POLAR = Math.PI / 2 - 0.52
const FOV = 30
const FIT_MARGIN = 1.06
const TWEEN_MS = 200
/** A click that travelled further than this since pointer down was a drag. */
const DRAG_PX = 4
const GHOST_OPACITY = 0.1
const STRUCTURE_GHOST_OPACITY = 0.16
/** The camera stays between 15° and 75° above the deck. */
const MIN_POLAR = (15 * Math.PI) / 180
const MAX_POLAR = (75 * Math.PI) / 180

/** The colours, re-read whenever the theme class on `<html>` changes. */
function useSceneColors(): SceneColors {
  const read = useCallback(() => {
    const style = getComputedStyle(document.documentElement)
    return sceneColors((name) => style.getPropertyValue(name))
  }, [])
  const [colors, setColors] = useState(read)
  useEffect(() => {
    const observer = new MutationObserver(() => setColors(read()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style']
    })
    return () => observer.disconnect()
  }, [read])
  return colors
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * The distance from `size`'s centre at which every corner of the box fits the
 * canvas, seen along `direction` (from the target towards the camera).
 */
function fitDistance(size: Vec3, direction: THREE.Vector3, aspect: number): number {
  const toCamera = direction.clone().normalize()
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), toCamera).normalize()
  const up = new THREE.Vector3().crossVectors(toCamera, right)
  const tanV = Math.tan((FOV * Math.PI) / 360)
  const tanH = tanV * aspect
  let distance = 0
  for (const sx of [-1, 1])
    for (const sy of [-1, 1])
      for (const sz of [-1, 1]) {
        const corner = new THREE.Vector3((sx * size[0]) / 2, (sy * size[1]) / 2, (sz * size[2]) / 2)
        const depth = corner.dot(toCamera)
        distance = Math.max(
          distance,
          depth + Math.abs(corner.dot(right)) / tanH,
          depth + Math.abs(corner.dot(up)) / tanV
        )
      }
  return distance * FIT_MARGIN
}

type OrbitLike = { target: THREE.Vector3; update: () => void }

/**
 * Frames the model, or one tower, from the front or the back at the starting
 * height: on mount, when the canvas or the model's shape changes, and on every
 * preset click. It turns the short way round, so Front to Back never swings
 * through the building. A data refresh that only recolours units leaves the
 * camera where the viewer put it.
 */
function Framing({
  model,
  focus,
  side,
  nonce
}: {
  model: TowerModel
  focus: string | null
  side: Side
  nonce: number
}) {
  const shape = modelKey(model)
  const latest = useRef(model)
  useEffect(() => {
    latest.current = model
  }, [model])
  const width = useThree((s) => s.size.width)
  const height = useThree((s) => s.size.height)
  const get = useThree((s) => s.get)
  const first = useRef(true)

  useEffect(() => {
    const { camera, invalidate } = get()
    const controls = get().controls as unknown as OrbitLike | null
    const current = latest.current
    const tower = focus ? current.towers.find((t) => t.block === focus) : undefined
    const { min, max } = current.bounds
    const frame = tower ?? {
      center: [(min[0] + max[0]) / 2, max[1] / 2, (min[2] + max[2]) / 2] as Vec3,
      size: [max[0] - min[0], max[1], max[2] - min[2]] as Vec3
    }
    const toTarget = new THREE.Vector3(...frame.center)
    const to = new THREE.Spherical(1, START_POLAR, START_AZIMUTH + (side === 'back' ? Math.PI : 0))
    to.radius = fitDistance(frame.size, new THREE.Vector3().setFromSpherical(to), width / Math.max(1, height))
    const fromTarget = controls ? controls.target.clone() : toTarget.clone()
    const from = new THREE.Spherical().setFromVector3(camera.position.clone().sub(fromTarget))
    // The short way round.
    let turn = to.theta - from.theta
    turn = Math.atan2(Math.sin(turn), Math.cos(turn))
    const fromZoom = camera.zoom

    const apply = (t: number) => {
      const target = fromTarget.clone().lerp(toTarget, t)
      const spherical = new THREE.Spherical(
        from.radius + (to.radius - from.radius) * t,
        from.phi + (to.phi - from.phi) * t,
        from.theta + turn * t
      )
      camera.position.copy(target.clone().add(new THREE.Vector3().setFromSpherical(spherical)))
      camera.zoom = fromZoom + (1 - fromZoom) * t
      camera.updateProjectionMatrix()
      if (controls) {
        controls.target.copy(target)
        controls.update()
      } else camera.lookAt(target)
      invalidate()
    }

    if (first.current || prefersReducedMotion()) {
      first.current = false
      apply(1)
      return
    }
    let raf = 0
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / TWEEN_MS)
      apply(1 - (1 - t) * (1 - t))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [shape, focus, side, nonce, width, height, get])

  return null
}

/** The unit cube every box is scaled from: one per scene, disposed with it, so a remount leaks no renderer. */
function useUnitCube(): THREE.BoxGeometry {
  const cube = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  useEffect(() => () => cube.dispose(), [cube])
  return cube
}

/** Writes each box's position and size into an instanced mesh's matrices. */
function writeBoxMatrices(m: THREE.InstancedMesh, boxes: Box[]) {
  const matrix = new THREE.Matrix4()
  const position = new THREE.Vector3()
  const scale = new THREE.Vector3()
  const rotation = new THREE.Quaternion()
  boxes.forEach((box, i) => {
    m.setMatrixAt(i, matrix.compose(position.set(...box.center), rotation, scale.set(...box.size)))
  })
  m.instanceMatrix.needsUpdate = true
  m.computeBoundingSphere()
}

/** The units the active filter keeps solid, and the rest. */
function splitUnits(units: ChartUnit[], lit: ReadonlySet<string> | null) {
  const solid: number[] = []
  const ghost: number[] = []
  units.forEach((unit, i) => (lit && !lit.has(unit.code) ? ghost : solid).push(i))
  return { solid, ghost }
}

function UnitMesh({
  units,
  indices,
  model,
  colors,
  ghost,
  part,
  onTop = false,
  cube,
  onHoverIndex,
  onPick
}: {
  units: ChartUnit[]
  indices: number[]
  model: TowerModel
  colors: SceneColors
  ghost: boolean
  /** The unit's body, or its balcony, which wears the same colour. */
  part: 'body' | 'balcony'
  /** A filter's lit units draw over the see-through building, so they show from any side. */
  onTop?: boolean
  cube: THREE.BoxGeometry
  onHoverIndex?: (index: number | null) => void
  onPick?: (index: number) => void
}) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const material = useRef<THREE.MeshLambertMaterial>(null)
  const invalidate = useThree((s) => s.invalidate)
  const boxes = useMemo(
    () =>
      indices.map((i) => {
        const box = model.units.get(units[i]!.code)!
        return part === 'body' ? box : box.balcony
      }),
    [indices, model, units, part]
  )
  useLayoutEffect(() => {
    if (!mesh.current) return
    writeBoxMatrices(mesh.current, boxes)
    invalidate()
  }, [boxes, invalidate])

  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    const hadColors = Boolean(m.instanceColor)
    const color = new THREE.Color()
    indices.forEach((unitIndex, i) => {
      const unit = units[unitIndex]!
      m.setColorAt(i, color.set(ghost ? colors.ghost : colors[unit.state]))
    })
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    // The first instance colours change the shader the material needs.
    if (!hadColors && material.current) material.current.needsUpdate = true
    invalidate()
  }, [indices, units, colors, ghost, invalidate])

  if (indices.length === 0) return null
  return (
    <instancedMesh
      key={`${part}-${ghost}-${onTop}-${indices.length}`}
      ref={mesh}
      args={[cube, undefined, indices.length]}
      castShadow={!ghost && !onTop}
      receiveShadow={!ghost && !onTop}
      renderOrder={onTop ? 2 : ghost ? 1 : 0}
      // A see-through unit takes no clicks: the lit ones behind it do.
      raycast={ghost ? () => null : undefined}
      onPointerMove={
        onHoverIndex
          ? (event: ThreeEvent<PointerEvent>) => {
              event.stopPropagation()
              onHoverIndex(event.instanceId === undefined ? null : indices[event.instanceId]!)
            }
          : undefined
      }
      onPointerOut={onHoverIndex ? () => onHoverIndex(null) : undefined}
      onClick={
        onPick
          ? (event: ThreeEvent<MouseEvent>) => {
              event.stopPropagation()
              if (event.delta > DRAG_PX || event.instanceId === undefined) return
              onPick(indices[event.instanceId]!)
            }
          : undefined
      }
    >
      <meshLambertMaterial
        ref={material}
        // In the see-through pass with the ghosts, so its later render order draws it over them.
        transparent={ghost || onTop}
        opacity={ghost ? GHOST_OPACITY : 1}
        depthWrite={!ghost}
      />
    </instancedMesh>
  )
}

function Structure({
  model,
  colors,
  ghost,
  cube
}: {
  model: TowerModel
  colors: SceneColors
  ghost: boolean
  cube: THREE.BoxGeometry
}) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const invalidate = useThree((st) => st.invalidate)
  useLayoutEffect(() => {
    if (!mesh.current) return
    writeBoxMatrices(mesh.current, model.structure)
    invalidate()
  }, [model, invalidate])
  if (model.structure.length === 0) return null
  return (
    <instancedMesh
      key={model.structure.length}
      ref={mesh}
      args={[cube, undefined, model.structure.length]}
      castShadow={!ghost}
      receiveShadow={!ghost}
      raycast={() => null}
    >
      {/* Keyed by mode: three bakes opacity into the shader and never recompiles it when only transparent changes. */}
      <meshLambertMaterial
        key={ghost ? 'glass' : 'solid'}
        color={colors.structure}
        transparent={ghost}
        opacity={ghost ? STRUCTURE_GHOST_OPACITY : 1}
        depthWrite={!ghost}
      />
    </instancedMesh>
  )
}

/** The edges drawn round a hovered or selected unit; one per scene, disposed with it. */
function useOutlineGeometry(size: Vec3, scale: number): THREE.EdgesGeometry {
  const [w, h, d] = size
  const geometry = useMemo(() => {
    const box = new THREE.BoxGeometry(w * scale, h * scale, d * scale)
    const edges = new THREE.EdgesGeometry(box)
    box.dispose()
    return edges
  }, [w, h, d, scale])
  useEffect(() => () => geometry.dispose(), [geometry])
  return geometry
}

function Outline({ at, color, geometry }: { at: Vec3 | undefined; color: string; geometry: THREE.EdgesGeometry }) {
  if (!at) return null
  return (
    <lineSegments position={at} geometry={geometry} raycast={() => null}>
      <lineBasicMaterial color={color} />
    </lineSegments>
  )
}

/** A text label pinned to a point in the scene, drawn in the DOM so it stays crisp Geist. */
interface Anchor {
  key: string
  text: string
  at: Vec3
  className: string
}

const FLOOR_LABEL = 'font-mono text-[10px] text-muted-foreground'
const BLOCK_LABEL =
  'rounded-sm border border-border bg-card/90 px-1.5 py-0.5 text-xs font-semibold text-foreground shadow-card'

/**
 * A pill above each roof; with a block framed, every fifth floor and the top
 * one up the corner that sits leftmost on screen from that side.
 */
function labelAnchors(model: TowerModel, focus: string | null, side: Side): Anchor[] {
  const blocks = model.towers.map((tower) => ({
    key: `block-${tower.block}`,
    text: `Block ${tower.block}`,
    at: [tower.center[0], tower.size[1] + 4, tower.center[2]] as Vec3,
    className: BLOCK_LABEL
  }))
  const tower = model.towers.find((t) => t.block === focus)
  const top = model.floors[model.floors.length - 1]
  const corner = (y: number): Vec3 | null =>
    tower
      ? side === 'front'
        ? [tower.left - 2, y, tower.center[2] - tower.size[2] / 2]
        : [tower.left + tower.size[0] + 2, y, tower.front]
      : null
  const floors = tower
    ? model.floors
        .filter((floor, i) => i % 5 === 0 || floor === top)
        .map((floor) => ({
          key: `floor-${floor.label}`,
          text: floor.label,
          at: corner(floor.y)!,
          className: FLOOR_LABEL
        }))
    : []
  return [...blocks, ...floors]
}

/** Moves each label to its anchor's place on screen whenever the scene draws; hides labels behind the camera. */
function LabelProjector({ anchors, labels }: { anchors: Anchor[]; labels: RefObject<Map<string, HTMLSpanElement>> }) {
  const point = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera, size }) => {
    for (const anchor of anchors) {
      const el = labels.current.get(anchor.key)
      if (!el) continue
      point.set(...anchor.at).project(camera)
      if (point.z > 1) {
        el.style.transform = 'translate(-9999px, -9999px)'
        continue
      }
      const x = ((point.x + 1) / 2) * size.width
      const y = ((1 - point.y) / 2) * size.height
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
    }
  })
  return null
}

const MIN_ZOOM = 0.7
const MAX_ZOOM = 8

/**
 * Zooms only with Ctrl or ⌘ held (a trackpad pinch sends the same), so a plain
 * scroll over the canvas still scrolls the page, as a presenter expects.
 */
function WheelZoom() {
  const get = useThree((s) => s.get)
  const element = useThree((s) => s.gl.domElement)
  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      const { camera, invalidate } = get()
      camera.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, camera.zoom * Math.exp(-event.deltaY * 0.002)))
      camera.updateProjectionMatrix()
      invalidate()
    }
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [element, get])
  return null
}

/** Draws again once the browser hands back a lost GPU context; on demand, nothing else would. */
function ContextRestore() {
  const invalidate = useThree((s) => s.invalidate)
  const element = useThree((s) => s.gl.domElement)
  useEffect(() => {
    const redraw = () => invalidate()
    element.addEventListener('webglcontextrestored', redraw)
    return () => element.removeEventListener('webglcontextrestored', redraw)
  }, [element, invalidate])
  return null
}

/** A hemisphere light and one sun from the upper left front, its shadow sized to the model. */
function Lights({ model, colors }: { model: TowerModel; colors: SceneColors }) {
  const { min, max } = model.bounds
  const span = Math.max(max[0] - min[0], max[2] - min[2], max[1]) * 0.75
  const sun = useRef<THREE.DirectionalLight>(null)
  useLayoutEffect(() => {
    const light = sun.current
    if (!light) return
    const camera = light.shadow.camera
    camera.left = -span
    camera.right = span
    camera.top = span
    camera.bottom = -span
    camera.near = 1
    camera.far = span * 6
    camera.updateProjectionMatrix()
  }, [span])
  return (
    <>
      {/* Intensities are in units of π, so a lit top face shows its token's own colour. */}
      <hemisphereLight args={[colors.sky, colors.skyGround, 0.72 * Math.PI]} />
      <directionalLight
        ref={sun}
        position={[-span * 1.2, span * 2, span]}
        intensity={0.3 * Math.PI}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
        shadow-radius={4}
      />
    </>
  )
}

function Scene({
  units,
  model,
  lit,
  selected,
  focus,
  side,
  onSelect,
  onHover,
  nonce,
  anchors,
  labels
}: SalesChartBuildingProps & {
  model: TowerModel
  focus: string | null
  side: Side
  nonce: number
  anchors: Anchor[]
  labels: RefObject<Map<string, HTMLSpanElement>>
}) {
  const colors = useSceneColors()
  const cube = useUnitCube()
  const unitSize = model.units.values().next().value?.size ?? ([1, 1, 1] as Vec3)
  const outline = useOutlineGeometry(unitSize, 1.04)
  const outerRing = useOutlineGeometry(unitSize, 1.12)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const { solid, ghost } = useMemo(() => splitUnits(units, lit), [units, lit])
  const indexOf = useMemo(() => new Map(units.map((unit, i) => [unit.code, i])), [units])
  const selectedUnit = selected !== null ? units[indexOf.get(selected) ?? -1] : undefined
  const hoveredUnit = hoverIndex !== null ? units[hoverIndex] : undefined
  const filtering = lit !== null
  const hovered = useRef<number | null>(null)

  const hover = (index: number | null) => {
    if (hovered.current === index) return
    hovered.current = index
    document.body.style.cursor = index === null ? '' : 'pointer'
    setHoverIndex(index)
    onHover(index === null ? null : (units[index] ?? null))
  }
  useEffect(() => () => void (document.body.style.cursor = ''), [])

  return (
    <>
      <Lights model={model} colors={colors} />

      <mesh position={model.podium.center} receiveShadow raycast={() => null}>
        <boxGeometry args={model.podium.size} />
        <meshLambertMaterial color={colors.podium} />
      </mesh>

      <Structure model={model} colors={colors} ghost={filtering} cube={cube} />
      {(['body', 'balcony'] as const).map((part) => (
        <UnitMesh
          key={part}
          units={units}
          indices={solid}
          model={model}
          colors={colors}
          ghost={false}
          part={part}
          onTop={filtering}
          cube={cube}
          onHoverIndex={hover}
          onPick={(index) => {
            const unit = units[index]
            if (unit) onSelect(unit)
          }}
        />
      ))}
      {(['body', 'balcony'] as const).map((part) => (
        <UnitMesh
          key={`ghost-${part}`}
          units={units}
          indices={ghost}
          model={model}
          colors={colors}
          ghost
          part={part}
          cube={cube}
        />
      ))}

      {hoveredUnit && hoveredUnit.code !== selected ? (
        <Outline at={model.units.get(hoveredUnit.code)?.center} color={colors.hovered} geometry={outline} />
      ) : null}
      {/* A card-coloured ring inside an ink ring, as the Grid's ring offset, so the
          selection shows on every state, black SPA Signed units included. */}
      {selectedUnit ? (
        <>
          <Outline at={model.units.get(selectedUnit.code)?.center} color={colors.selectedInner} geometry={outline} />
          <Outline at={model.units.get(selectedUnit.code)?.center} color={colors.selected} geometry={outerRing} />
        </>
      ) : null}

      <LabelProjector anchors={anchors} labels={labels} />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping={false}
        enableZoom={false}
        minPolarAngle={MIN_POLAR}
        maxPolarAngle={MAX_POLAR}
      />
      <WheelZoom />
      <ContextRestore />
      <Framing model={model} focus={focus} side={side} nonce={nonce} />
    </>
  )
}

function Segmented<T extends string | null>({
  label,
  options,
  value,
  onPick
}: {
  label: string
  options: { id: T; label: string }[]
  value: T
  onPick: (id: T) => void
}) {
  return (
    <div role="group" aria-label={label} className="flex rounded-md bg-muted p-0.5">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onPick(option.id)}
          className={cn(
            'h-7 min-w-8 rounded-sm px-2.5 text-xs font-medium outline-none transition-colors duration-[var(--motion-fast)] focus-visible:ring-2 focus-visible:ring-ring',
            value === option.id ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function SalesChartBuilding(props: SalesChartBuildingProps) {
  const model = useMemo(() => towerModel(props.units), [props.units])
  const [focus, setFocus] = useState<string | null>(null)
  const [side, setSide] = useState<Side>('front')
  const anchors = useMemo(() => labelAnchors(model, focus, side), [model, focus, side])
  const labels = useRef(new Map<string, HTMLSpanElement>())
  // Every click reframes, even on the preset already pressed.
  const [nonce, setNonce] = useState(0)
  const reframe = () => setNonce((n) => n + 1)
  const blocks = [{ id: null, label: 'All' }, ...model.towers.map((t) => ({ id: t.block, label: `Block ${t.block}` }))]

  return (
    <div className="relative">
      <div className="absolute left-0 top-0 z-[1] flex flex-wrap gap-2">
        <Segmented
          label="Frame the building"
          options={blocks}
          value={focus}
          onPick={(id) => {
            setFocus(id)
            reframe()
          }}
        />
        <Segmented
          label="Side of the building"
          options={[
            { id: 'front' as Side, label: 'Front' },
            { id: 'back' as Side, label: 'Back' }
          ]}
          value={side}
          onPick={(id) => {
            setSide(id)
            reframe()
          }}
        />
      </div>
      <p className="absolute right-0 top-0 z-[1] flex h-8 items-center rounded-md bg-muted px-2.5 text-xs text-muted-foreground max-sm:hidden">
        Drag To Turn · Ctrl Or ⌘ And Scroll To Zoom
      </p>
      <p className="sr-only">
        Building View Of {props.projectName ?? 'The Project'}. Use The Grid View To Move Between Units By Keyboard.
      </p>
      <div aria-hidden="true" className="relative h-[620px] w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-[1] select-none">
          {anchors.map((anchor) => (
            <span
              key={anchor.key}
              ref={(node) => {
                if (node) labels.current.set(anchor.key, node)
                else labels.current.delete(anchor.key)
              }}
              className={cn('absolute left-0 top-0 whitespace-nowrap', anchor.className)}
              style={{ transform: 'translate(-9999px, -9999px)' }}
            >
              {anchor.text}
            </span>
          ))}
        </div>
        <Canvas
          flat
          shadows="soft"
          frameloop="demand"
          dpr={[1, 2]}
          camera={{ fov: FOV, near: 1, far: 5000, position: [-300, 220, 400] }}
        >
          <Scene {...props} model={model} focus={focus} side={side} nonce={nonce} anchors={anchors} labels={labels} />
        </Canvas>
      </div>
    </div>
  )
}

export default SalesChartBuilding
