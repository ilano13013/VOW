import { cn } from '@/lib/cn'

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('display inline-flex items-baseline text-[1.6rem] leading-none tracking-[-0.04em]', className)}>
      VOW<span className="text-iris">.</span>
    </span>
  )
}
