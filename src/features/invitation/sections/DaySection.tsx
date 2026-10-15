import type { InvitationContent, Venue } from '../types'
import { formatLongDate, mapsLinks } from '../format'
import { Countdown } from './Countdown'

function VenueBlock({ v, isDemo }: { v: Venue; isDemo?: boolean }) {
  const links = mapsLinks(v.mapsQuery)
  return (
    <div className="border-t border-line-strong pt-8">
      <p className="meta">{v.label}</p>
      <p className="display tnum mt-6 text-[clamp(3.4rem,7vw,6rem)] leading-none">{v.time}</p>
      <h3 className="display mt-6 text-[2rem] leading-tight">{v.name}</h3>
      {isDemo && <p className="mt-1 text-[0.9375rem] text-pearl-mute">Lieu fictif — l’adresse exacte est communiquée par les mariés.</p>}
      <p className="mt-4 max-w-[38ch] text-pearl-dim">{v.description}</p>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem]">
        <a href={links.apple} target="_blank" rel="noopener noreferrer" className="text-pearl underline decoration-line-strong hover:decoration-iris">
          Itinéraire Plans<span className="sr-only"> pour {v.name} (nouvel onglet)</span>
        </a>
        <a href={links.google} target="_blank" rel="noopener noreferrer" className="text-pearl underline decoration-line-strong hover:decoration-iris">
          Itinéraire Google Maps<span className="sr-only"> pour {v.name} (nouvel onglet)</span>
        </a>
      </div>
    </div>
  )
}

export function DaySection({ content }: { content: InvitationContent }) {
  return (
    <section id="the-day" className="scroll-mt-10 bg-obsidian-2 px-5 py-32 md:px-10 md:py-48" aria-labelledby="day-title">
      <div className="mx-auto max-w-[1440px]">
        <h2 id="day-title" className="display text-[clamp(3.2rem,10vw,9rem)]" data-reveal="mask-block">
          The <em>Day</em>
        </h2>
        <p className="mt-6 text-[1.25rem] capitalize text-pearl">
          <time dateTime={content.dateIso}>{formatLongDate(content.dateIso)}</time>
          <span className="normal-case text-pearl-dim"> — {content.locationLabel}</span>
        </p>

        <div className="mt-16">
          <Countdown dateIso={content.dateIso} />
        </div>

        <div className="mt-28 grid gap-16 md:grid-cols-2 md:gap-20">
          <VenueBlock v={content.ceremony} isDemo={content.isDemo} />
          <VenueBlock v={content.reception} isDemo={content.isDemo} />
        </div>

        <div className="mt-32 grid gap-16 md:grid-cols-12">
          <h3 className="display text-[clamp(2.4rem,4.6vw,4rem)] leading-none md:col-span-4">Programme</h3>
          <ol className="md:col-span-7 md:col-start-6">
            {content.schedule.map((s) => (
              <li key={s.time + s.title} className="grid grid-cols-[6.5rem_1fr] gap-6 border-b border-line py-6 first:pt-0 md:grid-cols-[9rem_1fr]">
                <span className="tnum text-chrome">{s.time}</span>
                <span>
                  <span className="block text-[1.1875rem] text-pearl">{s.title}</span>
                  {s.detail && <span className="mt-1 block text-pearl-dim">{s.detail}</span>}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-32 grid gap-16 md:grid-cols-12">
          <h3 className="display text-[clamp(2.4rem,4.6vw,4rem)] leading-none md:col-span-4">Informations pratiques</h3>
          <dl className="grid gap-x-12 gap-y-12 sm:grid-cols-2 md:col-span-7 md:col-start-6">
            {content.practical.map((p) => (
              <div key={p.title}>
                <dt className="display text-[1.6rem]">{p.title}</dt>
                <dd className="mt-3 text-pearl-dim">{p.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
