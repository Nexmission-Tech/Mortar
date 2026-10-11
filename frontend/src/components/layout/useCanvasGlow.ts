/**
 * The pointer bloom on the signed-in page ground, the same as the landing
 * hero's: the dots under the pointer brighten inside a soft circle that trails
 * it. Writes `--canvas-spot-x` / `--canvas-spot-y` (pixels inside the canvas)
 * once per animation frame and sets `data-spot="on"` while the pointer is over
 * it; globals.css draws the light. Only for a fine pointer with motion allowed.
 */
import { useEffect, type RefObject } from 'react'

export function useCanvasGlow(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const canvas = ref.current
    if (!canvas || typeof window.matchMedia !== 'function') return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let primed = false
    let clientX = 0
    let clientY = 0
    let targetX = 0
    let targetY = 0
    let spotX = 0
    let spotY = 0

    const write = () => {
      raf = 0
      spotX += (targetX - spotX) * 0.22
      spotY += (targetY - spotY) * 0.22
      canvas.style.setProperty('--canvas-spot-x', `${spotX.toFixed(1)}px`)
      canvas.style.setProperty('--canvas-spot-y', `${spotY.toFixed(1)}px`)
      if (Math.abs(targetX - spotX) > 0.5 || Math.abs(targetY - spotY) > 0.5) raf = requestAnimationFrame(write)
    }
    // The spot lives in the canvas's own coordinates, so a scroll re-aims it
    // at the pointer rather than letting it ride away with the page.
    const aim = () => {
      const rect = canvas.getBoundingClientRect()
      targetX = clientX - rect.left
      targetY = clientY - rect.top
      if (!primed) {
        spotX = targetX
        spotY = targetY
        primed = true
      }
      if (!raf) raf = requestAnimationFrame(write)
    }
    const onMove = (event: PointerEvent) => {
      clientX = event.clientX
      clientY = event.clientY
      canvas.dataset.spot = 'on'
      aim()
    }
    const onLeave = () => {
      delete canvas.dataset.spot
    }
    const onScroll = () => {
      if (primed && canvas.dataset.spot === 'on') aim()
    }

    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [ref])
}
