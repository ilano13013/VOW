import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SculptureCanvas from '@/components/three/SculptureCanvas'
import { createSceneController } from '@/components/three/controller'

/**
 * DEV ONLY (not routed in production builds). Renders one deterministic still of the
 * real sculpture so `scripts/render-plates.mjs` can capture it as a raster plate.
 */
export default function PlateRenderPage() {
  const [params] = useSearchParams()
  const seed = Number(params.get('seed') ?? 1)
  const controller = useMemo(() => createSceneController(), [])
  const [ready, setReady] = useState(false)
  return (
    <div className="fixed inset-0 bg-obsidian" data-plate-ready={ready ? 'true' : 'false'}>
      <SculptureCanvas controller={controller} tier="high" reducedMotion={false} active still={seed} onReady={() => setReady(true)} />
    </div>
  )
}
