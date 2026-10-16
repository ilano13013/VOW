import { cn } from '@/lib/cn'
import type { EventStatus } from '@/services/types'
import type { GuestStatus } from './stats'

export function StatusPill({ status }: { status: EventStatus }) {
  return (
    <span className={cn('meta inline-flex items-center gap-2 rounded-full border px-3 py-1.5', status === 'published' ? 'border-success/50 !text-success' : 'border-line-strong')}>
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', status === 'published' ? 'bg-success' : 'bg-pearl-mute')} />
      {status === 'published' ? 'En ligne' : 'Brouillon'}
    </span>
  )
}

const GUEST_LABEL: Record<GuestStatus, string> = { pending: 'En attente', attending: 'Présent·e', declined: 'Absent·e' }

export function GuestStatusChip({ status, companions = 0 }: { status: GuestStatus; companions?: number }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.8125rem]',
        status === 'attending' && 'bg-success/10 text-success',
        status === 'declined' && 'bg-pearl/5 text-pearl-dim',
        status === 'pending' && 'border border-dashed border-line-strong text-pearl-mute',
      )}
    >
      {GUEST_LABEL[status]}
      {status === 'attending' && companions > 0 && <span className="tnum">+{companions}</span>}
    </span>
  )
}

/** Small action button used inside dense lists. */
export function ActionButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn('min-h-10 rounded-full border border-line-strong px-4 text-[0.8125rem] text-pearl transition-colors hover:border-iris hover:text-iris disabled:opacity-50', className)}
      {...props}
    />
  )
}
