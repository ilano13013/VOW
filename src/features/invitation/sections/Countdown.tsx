import { useCountdown } from '@/hooks/useCountdown'

const UNITS = [
  ['days', 'jours'],
  ['hours', 'heures'],
  ['minutes', 'minutes'],
  ['seconds', 'secondes'],
] as const

export function Countdown({ dateIso }: { dateIso: string }) {
  const c = useCountdown(dateIso)
  if (c.done) {
    return <p className="display text-[clamp(2.4rem,6vw,4.5rem)] italic">Le grand jour est arrivé.</p>
  }
  return (
    <div>
      <p className="sr-only">
        Plus que {c.days} jours avant le mariage.
      </p>
      <dl className="grid grid-cols-4 gap-3 md:gap-10" aria-hidden="true">
        {UNITS.map(([k, label]) => (
          <div key={k} className="flex flex-col-reverse">
            <dt className="meta mt-3">{label}</dt>
            <dd className="display tnum text-[clamp(2.6rem,9vw,7.5rem)] leading-none">
              {String(c[k]).padStart(k === 'days' ? 1 : 2, '0')}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
