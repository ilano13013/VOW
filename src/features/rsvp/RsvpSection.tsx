import { formatShortDate } from '@/features/invitation/format'
import type { ReactNode } from 'react'

/** Invitation chapter that hosts the RSVP form (or a message when unavailable). */
export function RsvpSection({ deadline, note, children }: { deadline?: string; note?: ReactNode; children: ReactNode }) {
  return (
    <section id="rsvp" className="scroll-mt-10 border-y border-line px-5 py-32 md:px-10 md:py-44" aria-labelledby="rsvp-title">
      <div className="mx-auto grid max-w-[1440px] gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <h2 id="rsvp-title" className="display text-[clamp(3.2rem,10vw,9rem)]" data-reveal="mask-block">
            RSVP
          </h2>
          {deadline && <p className="mt-6 text-[1.125rem] text-pearl">Merci de répondre avant le {formatShortDate(deadline)}.</p>}
          {note && <div className="mt-4 max-w-[40ch] text-[0.9375rem] text-pearl-mute">{note}</div>}
        </div>
        <div className="min-w-0 md:col-span-6 md:col-start-7 md:pt-6">{children}</div>
      </div>
    </section>
  )
}

export function isRsvpClosed(deadline: string | undefined): boolean {
  if (!deadline) return false
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date())
  return today > deadline
}
