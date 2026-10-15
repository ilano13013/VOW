import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { PerfTier } from '@/lib/device'
import type { SceneController } from './controller'
import {
  particlesFragment,
  particlesVertex,
  sculptureFragment,
  sculptureVertex,
} from './shaders'

export interface SculptureCanvasProps {
  controller: SceneController
  tier: PerfTier
  reducedMotion: boolean
  active: boolean
  /** Horizontal offset in world units (asymmetric compositions). */
  offsetX?: number
  offsetY?: number
  scale?: number
  /** Raise and shrink the sculpture on portrait screens so it clears the copy below. */
  portraitLift?: boolean
  /**
   * Deterministic still for offline plate rendering (dev route /__plates only):
   * fixes time, pose, material mix and crop from the seed.
   */
  still?: number
  onReady?: () => void
  onContextLost?: () => void
}

const FROZEN_TIME = 14.0

function usePointer() {
  const p = useRef({ x: 0, y: 0, dragX: 0, velocity: 0, dragging: false, lastX: 0 })
  useEffect(() => {
    const move = (e: PointerEvent) => {
      p.current.x = (e.clientX / window.innerWidth) * 2 - 1
      p.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
      if (p.current.dragging) {
        const dx = e.clientX - p.current.lastX
        p.current.velocity = dx * 0.006
        p.current.lastX = e.clientX
      }
    }
    const up = () => (p.current.dragging = false)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    window.addEventListener('pointercancel', up, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [])
  return p
}

export function stillPose(seed: number) {
  const f = (k: number) => {
    const x = Math.sin(seed * 12.9898 + k * 78.233) * 43758.5453
    return x - Math.floor(x)
  }
  return {
    time: 4 + seed * 2.37,
    spin: f(1) * Math.PI * 2,
    tilt: (f(2) - 0.5) * 0.9,
    roll: (f(3) - 0.5) * 0.6,
    metal: seed % 4 === 1 ? 0.6 : 0,
    distort: 0.14 + f(4) * 0.16,
    // three framings: whole piece with air (0), macro detail (1), three-quarter (2)
    scale: seed % 3 === 0 ? 0.5 + f(5) * 0.15 : seed % 3 === 1 ? 1.7 + f(5) * 0.5 : 0.95 + f(5) * 0.3,
    x: (f(6) - 0.5) * (seed % 3 === 0 ? 0.8 : 1.4),
    y: (f(7) - 0.5) * (seed % 3 === 0 ? 0.6 : 1),
    ring: seed % 3 !== 1 || seed % 2 === 1,
    particles: seed % 2 === 1,
  }
}

function Sculpture({ controller, tier, reducedMotion, offsetX = 0, offsetY = 0, scale = 1, portraitLift, still }: SculptureCanvasProps) {
  const pose = still !== undefined ? stillPose(still) : null
  const group = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  const pointer = usePointer()
  const { gl, size } = useThree()
  const portrait = size.width < size.height

  const detail = tier === 'high' ? 72 : tier === 'mid' ? 44 : 24
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, detail), [detail])
  const ringGeometry = useMemo(
    () => new THREE.TorusGeometry(1.62, 0.016, 12, tier === 'low' ? 96 : 220),
    [tier],
  )

  const glassMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: sculptureVertex,
        fragmentShader: sculptureFragment,
        uniforms: {
          uTime: { value: FROZEN_TIME },
          uDistort: { value: 0.2 },
          uFreq: { value: 0.85 },
          uOpen: { value: 0 },
          uIrid: { value: 1 },
          uMetal: { value: 0 },
        },
      }),
    [],
  )
  const chromeMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: sculptureVertex,
        fragmentShader: sculptureFragment,
        uniforms: {
          uTime: { value: FROZEN_TIME },
          uDistort: { value: 0 },
          uFreq: { value: 1 },
          uOpen: { value: 0 },
          uIrid: { value: 0.2 },
          uMetal: { value: 1 },
        },
      }),
    [],
  )

  useEffect(
    () => () => {
      geometry.dispose()
      ringGeometry.dispose()
      glassMat.dispose()
      chromeMat.dispose()
    },
    [geometry, ringGeometry, glassMat, chromeMat],
  )

  // Drag-to-spin on the canvas element itself.
  useEffect(() => {
    const el = gl.domElement
    const down = (e: PointerEvent) => {
      pointer.current.dragging = true
      pointer.current.lastX = e.clientX
    }
    el.addEventListener('pointerdown', down)
    return () => el.removeEventListener('pointerdown', down)
  }, [gl, pointer])

  const spin = useRef(0)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20)
    const g0 = group.current
    if (pose && g0) {
      glassMat.uniforms.uTime.value = pose.time
      glassMat.uniforms.uDistort.value = pose.distort
      glassMat.uniforms.uMetal.value = pose.metal
      chromeMat.uniforms.uTime.value = pose.time
      g0.rotation.set(pose.tilt, pose.spin, pose.roll)
      g0.position.set(pose.x, pose.y, 0)
      g0.scale.setScalar(pose.scale)
      if (ring.current) {
        ring.current.visible = pose.ring
        ring.current.rotation.set(Math.PI / 2.35 + pose.tilt, pose.time * 0.18, 0)
      }
      return
    }
    const t = reducedMotion ? FROZEN_TIME : state.clock.elapsedTime + FROZEN_TIME
    const open = controller.open
    glassMat.uniforms.uTime.value = t
    glassMat.uniforms.uOpen.value = open
    glassMat.uniforms.uDistort.value = 0.2 * controller.energy
    chromeMat.uniforms.uTime.value = t
    chromeMat.uniforms.uOpen.value = open * 0.6

    const g = group.current
    if (!g) return
    const p = pointer.current
    if (!reducedMotion) {
      p.velocity *= Math.pow(0.04, dt) // inertia decay
      spin.current += dt * 0.12 + p.velocity
    }
    g.rotation.y = spin.current
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, p.y * 0.28, 3, dt)
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, -p.x * 0.12, 3, dt)
    g.position.x = THREE.MathUtils.damp(g.position.x, offsetX + p.x * 0.12, 2.5, dt)
    g.position.y = THREE.MathUtils.damp(
      g.position.y,
      offsetY + (portrait && portraitLift ? 0.62 : 0) + (reducedMotion ? 0 : Math.sin(t * 0.6) * 0.06) - controller.scroll * 0.8,
      2.5,
      dt,
    )
    const s = scale * (portrait ? (portraitLift ? 0.6 : 0.72) : 1) * (1 + open * 0.18)
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, s, 4, dt))

    if (ring.current) {
      ring.current.rotation.x = Math.PI / 2.35 + Math.sin(t * 0.3) * 0.08
      ring.current.rotation.y = t * 0.18
      const rs = 1 + open * 0.55
      ring.current.scale.setScalar(rs)
    }
  })

  return (
    <group ref={group} scale={scale}>
      <mesh geometry={geometry} material={glassMat} />
      <mesh ref={ring} geometry={ringGeometry} material={chromeMat} />
    </group>
  )
}

function Particles({ controller, tier, reducedMotion }: Pick<SculptureCanvasProps, 'controller' | 'tier' | 'reducedMotion'>) {
  const count = tier === 'high' ? 1400 : tier === 'mid' ? 700 : 280
  const { gl } = useThree()
  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    const sizes = new Float32Array(count)
    // Deterministic pseudo-random so every load composes the same constellation.
    let s = 1337
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    for (let i = 0; i < count; i++) {
      const r = 1.9 + Math.pow(rnd(), 0.7) * 4.6
      const th = rnd() * Math.PI * 2
      const ph = Math.acos(2 * rnd() - 1)
      positions[i * 3] = r * Math.sin(ph) * Math.cos(th) * 1.5
      positions[i * 3 + 1] = r * Math.cos(ph) * 0.9
      positions[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th) - 1.2
      seeds[i] = rnd()
      sizes[i] = 0.6 + Math.pow(rnd(), 3) * 3.2
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    const mat = new THREE.ShaderMaterial({
      vertexShader: particlesVertex,
      fragmentShader: particlesFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: FROZEN_TIME },
        uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
        uOpen: { value: 0 },
      },
    })
    return { geometry: geo, material: mat }
  }, [count, gl])

  useEffect(() => () => (geometry.dispose(), material.dispose()), [geometry, material])

  useFrame((state) => {
    material.uniforms.uTime.value = reducedMotion ? FROZEN_TIME : state.clock.elapsedTime + FROZEN_TIME
    material.uniforms.uOpen.value = controller.open
  })

  return <points geometry={geometry} material={material} />
}

function ReadySignal({ onReady, onContextLost }: Pick<SculptureCanvasProps, 'onReady' | 'onContextLost'>) {
  const { gl } = useThree()
  const fired = useRef(false)
  useFrame(() => {
    if (!fired.current) {
      fired.current = true
      // Wait one extra frame so the first visible frame is fully composed.
      requestAnimationFrame(() => onReady?.())
    }
  })
  useEffect(() => {
    const el = gl.domElement
    const lost = (e: Event) => {
      e.preventDefault()
      onContextLost?.()
    }
    el.addEventListener('webglcontextlost', lost)
    return () => el.removeEventListener('webglcontextlost', lost)
  }, [gl, onContextLost])
  return null
}

export default function SculptureCanvas(props: SculptureCanvasProps) {
  const { tier, reducedMotion, active } = props
  return (
    <Canvas
      dpr={tier === 'high' ? [1, 2] : tier === 'mid' ? [1, 1.6] : 1}
      frameloop={!active ? 'never' : reducedMotion ? 'demand' : 'always'}
      gl={{ antialias: tier !== 'low', alpha: true, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: 32, position: [0, 0, 6.2], near: 0.1, far: 50 }}
      style={{ touchAction: 'pan-y' }}
      aria-hidden="true"
    >
      <Sculpture {...props} />
      {(props.still === undefined || stillPose(props.still).particles) && (
        <Particles controller={props.controller} tier={tier} reducedMotion={reducedMotion || props.still !== undefined} />
      )}
      <ReadySignal onReady={props.onReady} onContextLost={props.onContextLost} />
    </Canvas>
  )
}
