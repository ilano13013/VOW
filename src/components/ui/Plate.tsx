import { cn } from '@/lib/cn'

/**
 * Raster plate: a still of the real VOW. sculpture rendered by `npm run plates`
 * (provenance in public/plates/PROVENANCE.json). Stands in for photography in demos.
 */
export const PLATE_SEEDS = [3, 5, 7, 11, 13, 17, 23, 29, 31, 41] as const

export function Plate({ seed, className, label, eager = false }: { seed: number; className?: string; label?: string; eager?: boolean }) {
  const s = (PLATE_SEEDS as readonly number[]).includes(seed) ? seed : PLATE_SEEDS[seed % PLATE_SEEDS.length]
  return (
    <img
      src={`/plates/plate-${s}.webp`}
      width={1200}
      height={1500}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={cn('h-full w-full bg-obsidian object-cover', className)}
    />
  )
}
