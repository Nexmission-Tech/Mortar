/**
 * The Sales Chart's Building view: the project's towers in an isometric 3D
 * scene, every unit a block in its state's tone. It takes the same props as
 * the Grid, so filters, the readout and the case panel work the same way.
 *
 * DESIGN.md names this the one 3D surface in the product: flat shading from
 * the status tokens at three face steps, no gradient, glow, texture, shadow or
 * transparency, and nothing moves unless the viewer moves it. The scene renders
 * on demand, never in a loop.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { ChartUnit } from '@mortar/core'
import { cn } from '@/lib/utils'
import { buildingLayout, layoutKey, PODIUM_HEIGHT, UNIT_SIZE, type BuildingLayout, type Vec3 } from './buildingLayout'
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

/** The camera starts a little left of square on and about 22° above, so blocks stand side by side. */
const START_AZIMUTH = 0.45
const VIEW_ELEVATION = 0.38
const VIEW_DIRECTION = new THREE.Vector3(
  Math.sin(START_AZIMUTH) * Math.cos(VIEW_ELEVATION),
  Math.sin(VIEW_ELEVATION),
  Math.cos(START_AZIMUTH) * Math.cos(VIEW_ELEVATION)
)
const CAMERA_DISTANCE = 120
const FIT_MARGIN = 1.15
const TWEEN_MS = 200
/** A click that travelled further than this since pointer down was a drag. */
const DRAG_PX = 4

/** The colours, re-read whenever the theme class on `<html>` changes. */
function useSceneColors(): SceneColors {
  const read = useCallback(() => {
    const style = getComputedStyle(document.documentElement)
    return sceneColors((name) => style.getPropertyValue(name))
  }, [])
  const [colors, setColors] = useState(read)
  useEffect(() => {
    const observer = new MutationObserver(() => setColors(read()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] })
    return () => observer.disconnect()
  }, [read])
  return colors
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** The zoom that fits a box of `size`, seen from the starting angle, inside the canvas. */
function fitZoom(size: Vec3, width: number, height: number): number {
  const [w, h, d] = size
  const across = w * Math.cos(START_AZIMUTH) + d * Math.sin(START_AZIMUTH)
  const deep = w * Math.sin(START_AZIMUTH) + d * Math.cos(START_AZIMUTH)
  const tall = h * Math.cos(VIEW_ELEVATION) + deep * Math.sin(VIEW_ELEVATION)
  return Math.max(1, Math.min(width / (across * FIT_MARGIN), height / (tall * FIT_MARGIN)))
}

type OrbitLike = { target: THREE.Vector3; update: () => void }

/**
 * Frames the building, or one tower, from the starting angle: on mount, when the
 * canvas or the building's shape changes, and on every preset click. A data
 * refresh that only recolours units leaves the camera where the viewer put it.
 */
function Framing({ layout, focus, nonce }: { layout: BuildingLayout; focus: string | null; nonce: number }) {
  const shape = layoutKey(layout)
  const latest = useRef(layout)
  // Declared before the framing effect, so it runs first in the same commit.
  useEffect(() => {
    latest.current = layout
  }, [layout])
  const width = useThree((s) => s.size.width)
  const height = useThree((s) => s.size.height)
  const get = useThree((s) => s.get)
  const first = useRef(true)

  useEffect(() => {
    // three.js objects are mutable by design; read them from the store, not from render.
    const { camera, invalidate } = get()
    const controls = get().controls as unknown as OrbitLike | null
    const current = latest.current
    const tower = focus ? current.towers.find((t) => t.block === focus) : undefined
    const frame = tower ?? { center: [0, current.size[1] / 2, 0] as Vec3, size: current.size }
    const toTarget = new THREE.Vector3(...frame.center)
    const toZoom = fitZoom(frame.size, width, height)
    const fromTarget = controls ? controls.target.clone() : toTarget.clone()
    const fromZoom = camera.zoom
    // Back to the starting angle, so a preset always recovers a turned building.
    const fromOffset = controls ? camera.position.clone().sub(controls.target) : null
    const toOffset = VIEW_DIRECTION.clone().multiplyScalar(CAMERA_DISTANCE)

    const apply = (t: number) => {
      const target = fromTarget.clone().lerp(toTarget, t)
      const offset = fromOffset ? fromOffset.clone().lerp(toOffset, t).setLength(CAMERA_DISTANCE) : toOffset
      camera.position.copy(target.clone().add(offset))
      camera.zoom = fromZoom + (toZoom - fromZoom) * t
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
  }, [shape, focus, nonce, width, height, get])

  return null
}

function Units({
  units,
  layout,
  lit,
  colors,
  onHoverIndex,
  onPick
}: {
  units: ChartUnit[]
  layout: BuildingLayout
  lit: ReadonlySet<string> | null
  colors: SceneColors
  onHoverIndex: (index: number | null) => void
  onPick: (index: number) => void
}) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const material = useRef<THREE.MeshLambertMaterial>(null)
  const invalidate = useThree((s) => s.invalidate)
  const hovered = useRef<number | null>(null)

  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    const matrix = new THREE.Matrix4()
    units.forEach((unit, i) => {
      const [x, y, z] = layout.positions.get(unit.code) ?? [0, -1000, 0]
      m.setMatrixAt(i, matrix.makeTranslation(x, y, z))
    })
    m.instanceMatrix.needsUpdate = true
    m.computeBoundingSphere()
    invalidate()
  }, [units, layout, invalidate])

  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    const hadColors = Boolean(m.instanceColor)
    const color = new THREE.Color()
    units.forEach((unit, i) => {
      m.setColorAt(i, color.set(lit && !lit.has(unit.code) ? colors.ghost : colors[unit.state]))
    })
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    // The first instance colours change the shader the material needs.
    if (!hadColors && material.current) material.current.needsUpdate = true
    invalidate()
  }, [units, lit, colors, invalidate])

  const hover = (index: number | null) => {
    if (hovered.current === index) return
    hovered.current = index
    document.body.style.cursor = index === null ? '' : 'pointer'
    onHoverIndex(index)
  }

  useEffect(() => () => void (document.body.style.cursor = ''), [])

  return (
    <instancedMesh
      key={units.length}
      ref={mesh}
      args={[undefined, undefined, units.length]}
      onPointerMove={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        hover(event.instanceId ?? null)
      }}
      onPointerOut={() => hover(null)}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation()
        if (event.delta > DRAG_PX || event.instanceId === undefined) return
        onPick(event.instanceId)
      }}
    >
      <boxGeometry args={[UNIT_SIZE.w, UNIT_SIZE.h, UNIT_SIZE.d]} />
      <meshLambertMaterial ref={material} />
    </instancedMesh>
  )
}

/** The edges drawn round a hovered or selected unit; one per scene, disposed with it. */
function useOutlineGeometry(scale = 1.1): THREE.EdgesGeometry {
  const geometry = useMemo(() => {
    const box = new THREE.BoxGeometry(UNIT_SIZE.w * scale, UNIT_SIZE.h * (scale + 0.04), UNIT_SIZE.d * scale)
    const edges = new THREE.EdgesGeometry(box)
    box.dispose()
    return edges
  }, [scale])
  useEffect(() => () => geometry.dispose(), [geometry])
  return geometry
}

function Outline({ at, color, geometry }: { at: Vec3 | undefined; color: string; geometry: THREE.EdgesGeometry }) {
  if (!at) return null
  return (
    <lineSegments position={at} geometry={geometry}>
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
const BLOCK_LABEL = 'text-xs font-semibold text-foreground'

/** Block names under each tower, and floor numbers up the first tower's left edge. */
function labelAnchors(layout: BuildingLayout): Anchor[] {
  const first = layout.towers[0]
  const top = layout.floors[layout.floors.length - 1]
  const blocks = layout.towers.map((tower) => ({
    key: `block-${tower.block}`,
    text: `Block ${tower.block}`,
    at: [tower.center[0], -0.2, tower.size[2] / 2 + 1] as Vec3,
    className: BLOCK_LABEL
  }))
  const floors = first
    ? layout.floors
        .filter((floor, i) => i % 5 === 0 || floor === top)
        .map((floor) => ({
          key: `floor-${floor.label}`,
          text: floor.label,
          at: [first.center[0] - first.size[0] / 2 - 0.8, floor.y, first.size[2] / 2] as Vec3,
          className: FLOOR_LABEL
        }))
    : []
  return [...blocks, ...floors]
}

/** Moves each label to its anchor's place on screen whenever the scene draws. */
function LabelProjector({ anchors, labels }: { anchors: Anchor[]; labels: RefObject<Map<string, HTMLSpanElement>> }) {
  const point = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera, size }) => {
    for (const anchor of anchors) {
      const el = labels.current.get(anchor.key)
      if (!el) continue
      point.set(...anchor.at).project(camera)
      const x = ((point.x + 1) / 2) * size.width
      const y = ((1 - point.y) / 2) * size.height
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
    }
  })
  return null
}

const MIN_ZOOM = 4
const MAX_ZOOM = 90

/**
 * Zooms only with Ctrl or ⌘ held (a trackpad pinch sends the same), so a plain
 * scroll over the 620px canvas still scrolls the page, as a presenter expects.
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

function Scene({
  units,
  layout,
  lit,
  selected,
  focus,
  onSelect,
  onHover,
  nonce,
  anchors,
  labels
}: SalesChartBuildingProps & {
  layout: BuildingLayout
  focus: string | null
  nonce: number
  anchors: Anchor[]
  labels: RefObject<Map<string, HTMLSpanElement>>
}) {
  const colors = useSceneColors()
  const outline = useOutlineGeometry()
  const outerRing = useOutlineGeometry(1.24)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const indexOf = useMemo(() => new Map(units.map((unit, i) => [unit.code, i])), [units])
  const selectedUnit = selected !== null ? units[indexOf.get(selected) ?? -1] : undefined
  const hoveredUnit = hoverIndex !== null ? units[hoverIndex] : undefined

  return (
    <>
      {/* Three fixed face steps: ambient lifts every face, one light from the
          upper left separates top, front and side. Intensities are in units of
          π, so the top face shows the token's own colour. */}
      <ambientLight intensity={0.78 * Math.PI} />
      <directionalLight position={[-6, 12, 8]} intensity={0.29 * Math.PI} />

      {layout.towers.map((tower) => (
        <mesh key={tower.block} position={[tower.center[0], PODIUM_HEIGHT / 2, 0]}>
          <boxGeometry args={[tower.size[0] + 0.6, PODIUM_HEIGHT, tower.size[2] + 0.6]} />
          <meshLambertMaterial color={colors.podium} />
        </mesh>
      ))}

      <Units
        units={units}
        layout={layout}
        lit={lit}
        colors={colors}
        onHoverIndex={(index) => {
          setHoverIndex(index)
          onHover(index === null ? null : (units[index] ?? null))
        }}
        onPick={(index) => {
          const unit = units[index]
          if (unit) onSelect(unit)
        }}
      />

      {hoveredUnit && hoveredUnit.code !== selected ? (
        <Outline at={layout.positions.get(hoveredUnit.code)} color={colors.hovered} geometry={outline} />
      ) : null}
      {/* A card-coloured ring inside an ink ring, as the Grid's ring offset, so the
          selection shows on every state, black SPA Signed units included. */}
      {selectedUnit ? (
        <>
          <Outline at={layout.positions.get(selectedUnit.code)} color={colors.selectedInner} geometry={outline} />
          <Outline at={layout.positions.get(selectedUnit.code)} color={colors.selected} geometry={outerRing} />
        </>
      ) : null}

      <LabelProjector anchors={anchors} labels={labels} />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping={false}
        minPolarAngle={Math.PI / 2 - VIEW_ELEVATION - 0.35}
        maxPolarAngle={Math.PI / 2 - VIEW_ELEVATION + 0.3}
        minAzimuthAngle={START_AZIMUTH - 1.2}
        maxAzimuthAngle={START_AZIMUTH + 1.2}
        enableZoom={false}
      />
      <WheelZoom />
      <ContextRestore />
      <Framing layout={layout} focus={focus} nonce={nonce} />
    </>
  )
}

export function SalesChartBuilding(props: SalesChartBuildingProps) {
  const layout = useMemo(() => buildingLayout(props.units), [props.units])
  const anchors = useMemo(() => labelAnchors(layout), [layout])
  const labels = useRef(new Map<string, HTMLSpanElement>())
  const [focus, setFocus] = useState<string | null>(null)
  // Every click reframes, even on the preset already pressed.
  const [nonce, setNonce] = useState(0)
  const presets = [{ id: null, label: 'All' }, ...layout.towers.map((t) => ({ id: t.block, label: t.block }))]
  const start = VIEW_DIRECTION.clone().multiplyScalar(CAMERA_DISTANCE)

  return (
    <div className="relative">
      <div
        role="group"
        aria-label="Frame the building"
        className="absolute left-0 top-0 z-[1] flex rounded-md bg-muted p-0.5"
      >
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            aria-pressed={focus === preset.id}
            onClick={() => {
              setFocus(preset.id)
              setNonce((n) => n + 1)
            }}
            className={cn(
              'h-7 min-w-8 rounded-sm px-2.5 text-xs font-medium outline-none transition-colors duration-[var(--motion-fast)] focus-visible:ring-2 focus-visible:ring-ring',
              focus === preset.id
                ? 'bg-card text-foreground shadow-card'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {preset.id ? `Block ${preset.label}` : preset.label}
          </button>
        ))}
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
          orthographic
          flat
          frameloop="demand"
          dpr={[1, 2]}
          camera={{ position: [start.x, start.y, start.z], zoom: 10, near: 0.1, far: 1000 }}
        >
          <Scene {...props} layout={layout} focus={focus} nonce={nonce} anchors={anchors} labels={labels} />
        </Canvas>
      </div>
    </div>
  )
}

export default SalesChartBuilding
