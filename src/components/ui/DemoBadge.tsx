import { cn } from '@/lib/cn'

/** Explicit marker for fictional content. Never remove from demo surfaces. */
export function DemoBadge({ children = 'Démonstration — contenu fictif', className }: { children?: string; className?: string }) {
  return (
    <span className={cn('meta inline-flex items-center gap-2 rounded-full border border-iris/40 px-3 py-1.5 !text-iris', className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-iris" aria-hidden="true" />
      {children}
    </span>
  )
}
