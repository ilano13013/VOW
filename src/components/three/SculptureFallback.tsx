import { cn } from '@/lib/cn'

/**
 * Pure-CSS sculpture. Shown instantly as a poster while the WebGL chunk loads,
 * and permanently when WebGL is unavailable, data-saver is on, or the context is lost.
 */
export function SculptureFallback({ className, static: isStatic = false }: { className?: string; static?: boolean }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      <div className="absolute left-1/2 top-1/2 aspect-square w-[min(68vw,520px)] -translate-x-1/2 -translate-y-1/2">
        {/* halo */}
        <div className="absolute inset-[-30%] rounded-full bg-[radial-gradient(closest-side,rgb(196_181_253/0.18),transparent_70%)]" />
        {/* body */}
        <div
          className={cn(
            'absolute inset-[8%] rounded-[46%_54%_58%_42%/52%_44%_56%_48%]',
            'bg-[conic-gradient(from_210deg_at_42%_38%,#0b0b12,#2a2540_12%,#c4b5fd_22%,#ede9e4_27%,#b9c8d3_34%,#1c1a2b_48%,#0b0b12_60%,#4a4370_76%,#c4b5fd_86%,#0b0b12)]',
            'shadow-[inset_-30px_-40px_80px_rgb(11_11_18/0.9),inset_20px_24px_60px_rgb(237_233_228/0.25)]',
            !isStatic && 'animate-drift',
          )}
        />
        {/* specular */}
        <div className="absolute left-[26%] top-[20%] h-[18%] w-[30%] rotate-[-24deg] rounded-full bg-[radial-gradient(closest-side,rgb(237_233_228/0.75),transparent)] blur-md" />
        {/* chrome orbit */}
        <div className="absolute inset-[-6%] rotate-[-18deg] rounded-[50%] border border-chrome/40 [transform:rotateX(68deg)]" />
      </div>
      {/* static constellation */}
      <svg className="absolute inset-0 h-full w-full opacity-70" viewBox="0 0 100 100" preserveAspectRatio="none">
        {STARS.map(([x, y, r, o], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={i % 3 ? '#EDE9E4' : '#C4B5FD'} opacity={o} />
        ))}
      </svg>
    </div>
  )
}

const STARS: [number, number, number, number][] = Array.from({ length: 60 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453
  const b = Math.sin(i * 78.233) * 12345.6789
  const fx = a - Math.floor(a)
  const fy = b - Math.floor(b)
  return [fx * 100, fy * 100, 0.08 + (i % 5) * 0.04, 0.25 + (i % 4) * 0.18]
})
