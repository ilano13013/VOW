import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { perfTier, prefersSaveData, supportsWebGL, type PerfTier } from '@/lib/device'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/cn'
import { SculptureFallback } from './SculptureFallback'
import type { SceneController } from './controller'

const SculptureCanvas = lazy(() => import('./SculptureCanvas'))

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.warn('[VOW] 3D scene disabled:', error)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export interface SculptureStageProps {
  controller: SceneController
  className?: string
  offsetX?: number
  offsetY?: number
  scale?: number
  /** Delay mounting the WebGL chunk until the browser is idle (keeps first paint fast). */
  defer?: boolean
}

type Mode = 'probing' | 'webgl' | 'fallback'

/**
 * Progressive 3D: CSS poster first → WebGL scene fades in when its first frame is ready.
 * Falls back permanently on no-WebGL, save-data, render error or context loss.
 */
export function SculptureStage({ controller, className, offsetX, offsetY, scale, defer = true }: SculptureStageProps) {
  const reducedMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const [mode, setMode] = useState<Mode>('probing')
  const [tier, setTier] = useState<PerfTier>('mid')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!supportsWebGL() || prefersSaveData()) {
      setMode('fallback')
      return
    }
    setTier(perfTier())
    if (!defer) return setMode('webgl')
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setMode('webgl'), { timeout: 600 })
      return () => (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id)
    }
    const t = window.setTimeout(() => setMode('webgl'), 120)
    return () => window.clearTimeout(t)
  }, [defer])

  const fallback = <SculptureFallback static={reducedMotion} />

  return (
    <div
      ref={ref}
      className={cn('absolute inset-0', className)}
      data-scene-mode={mode}
      data-scene-ready={ready ? 'true' : 'false'}
    >
      <div className={cn('absolute inset-0 transition-opacity duration-[1400ms] ease-[var(--ease-couture)]', ready && 'opacity-0')}>
        {fallback}
      </div>
      {mode === 'webgl' && (
        <SceneBoundary fallback={null}>
          <Suspense fallback={null}>
            <div className={cn('absolute inset-0 opacity-0 transition-opacity duration-[1400ms] ease-[var(--ease-couture)]', ready && 'opacity-100')}>
              <SculptureCanvas
                controller={controller}
                tier={tier}
                reducedMotion={reducedMotion}
                active={inView}
                offsetX={offsetX}
                offsetY={offsetY}
                scale={scale}
                onReady={() => setReady(true)}
                onContextLost={() => {
                  setReady(false)
                  setMode('fallback')
                }}
              />
            </div>
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  )
}
