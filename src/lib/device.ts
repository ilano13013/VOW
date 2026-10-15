/**
 * Capability detection used to decide how much of the immersive layer to load.
 * Kept dependency-free and side-effect free so it can run before any 3D chunk is fetched.
 */

let webglCache: boolean | null = null

export function supportsWebGL(): boolean {
  if (webglCache !== null) return webglCache
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return (webglCache = false)
    const canvas = document.createElement('canvas')
    const gl =
      (canvas.getContext('webgl2') as WebGLRenderingContext | null) ??
      (canvas.getContext('webgl') as WebGLRenderingContext | null)
    webglCache = !!gl
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webglCache = false
  }
  return webglCache
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

type NavigatorWithHints = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string }
  deviceMemory?: number
}

export function prefersSaveData(): boolean {
  if (typeof navigator === 'undefined') return false
  const c = (navigator as NavigatorWithHints).connection
  return !!c?.saveData || c?.effectiveType === '2g' || c?.effectiveType === 'slow-2g'
}

export type PerfTier = 'low' | 'mid' | 'high'

/** Coarse performance tier — phones get lighter geometry and fewer particles. */
export function perfTier(): PerfTier {
  if (typeof window === 'undefined') return 'mid'
  const n = navigator as NavigatorWithHints
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const small = Math.min(window.innerWidth, window.innerHeight) < 600
  const mem = n.deviceMemory ?? 8
  const cores = n.hardwareConcurrency ?? 8
  if (mem <= 2 || cores <= 2) return 'low'
  if (coarse || small) return 'mid'
  return 'high'
}

/** Test-only reset of the memoized WebGL probe. */
export function __resetDeviceCache() {
  webglCache = null
}
