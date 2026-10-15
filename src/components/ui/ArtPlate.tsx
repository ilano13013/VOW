import { useId, useMemo } from 'react'
import { cn } from '@/lib/cn'

const PALETTE = ['#C4B5FD', '#B9C8D3', '#EDE9E4', '#8B7AE6', '#F3D9FF', '#9FB4C4']

function rng(seed: number) {
  let s = (seed * 9301 + 49297) % 233280 || 1
  return () => ((s = (s * 16807) % 2147483647) / 2147483647)
}

/**
 * Procedurally generated abstract artwork (SVG). Stands in for photography in
 * demos: zero image weight, crisp at any DPR, deterministic per seed.
 */
export function ArtPlate({ seed, className, label }: { seed: number; className?: string; label?: string }) {
  const uid = useId().replace(/:/g, '')
  const shapes = useMemo(() => {
    const r = rng(seed)
    const blobs = Array.from({ length: 4 }, () => ({
      cx: 10 + r() * 80,
      cy: 10 + r() * 80,
      rx: 18 + r() * 34,
      ry: 14 + r() * 30,
      rot: r() * 180,
      color: PALETTE[Math.floor(r() * PALETTE.length)],
      o: 0.35 + r() * 0.5,
    }))
    const arc = { r: 22 + r() * 30, cx: 20 + r() * 60, cy: 30 + r() * 50, rot: r() * 360 }
    const rings = Array.from({ length: 5 }, (_, i) => ({ r: arc.r * (0.35 + i * 0.16), o: 0.12 + i * 0.05 }))
    const freq = (0.006 + r() * 0.01).toFixed(4)
    return { blobs, arc, rings, freq, angle: Math.floor(r() * 360) }
  }, [seed])

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={cn('h-full w-full', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <linearGradient id={`bg-${uid}`} gradientTransform={`rotate(${shapes.angle} .5 .5)`}>
          <stop offset="0" stopColor="#0B0B12" />
          <stop offset="1" stopColor="#1A1A27" />
        </linearGradient>
        <filter id={`f-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency={shapes.freq} numOctaves="2" seed={seed} />
          <feDisplacementMap in="SourceGraphic" scale="18" />
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <linearGradient id={`arc-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EDE9E4" stopOpacity=".9" />
          <stop offset=".5" stopColor="#C4B5FD" stopOpacity=".6" />
          <stop offset="1" stopColor="#B9C8D3" stopOpacity=".1" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#bg-${uid})`} />
      <g filter={`url(#f-${uid})`} style={{ mixBlendMode: 'screen' }}>
        {shapes.blobs.map((b, i) => (
          <ellipse key={i} cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} fill={b.color} opacity={b.o} transform={`rotate(${b.rot} ${b.cx} ${b.cy})`} />
        ))}
      </g>
      {shapes.rings.map((ring, i) => (
        <circle key={i} cx={shapes.arc.cx} cy={shapes.arc.cy} r={ring.r} fill="none" stroke="#EDE9E4" strokeOpacity={ring.o} strokeWidth=".18" />
      ))}
      <circle
        cx={shapes.arc.cx}
        cy={shapes.arc.cy}
        r={shapes.arc.r}
        fill="none"
        stroke={`url(#arc-${uid})`}
        strokeWidth=".35"
        transform={`rotate(${shapes.arc.rot} ${shapes.arc.cx} ${shapes.arc.cy})`}
      />
    </svg>
  )
}
