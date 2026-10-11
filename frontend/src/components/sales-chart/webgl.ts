/**
 * Whether this browser can draw the Building view. three.js asks for WebGL 2
 * only, so WebGL 1 is not enough. The probe context is released straight away.
 * Never throws.
 */
export function canUseWebGL(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2')
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}
