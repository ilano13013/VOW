import { Link } from 'react-router-dom'
import { computeStats } from './stats'
import { useEventOutlet } from './EventPage'

export default function OverviewPanel() {
  const { data } = useEventOutlet()
  const s = computeStats(data.guests, data.rsvps)

  if (s.invitations === 0) {
    return (
      <div className="max-w-[56ch]">
        <h2 className="display text-[2.2rem] leading-tight">Aucun invité pour l’instant</h2>
        <p className="mt-4 text-pearl-dim">
          Ajoutez vos invités un par un : chacun reçoit un lien personnel, et ses réponses apparaîtront ici.
        </p>
        <Link to="guests" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-pearl px-7 text-[0.8125rem] font-medium uppercase tracking-[0.08em] text-obsidian hover:bg-iris">
          Ajouter des invités
        </Link>
      </div>
    )
  }

  const items: [string, string | number, string?][] = [
    ['Réponses reçues', `${s.responded} / ${s.invitations}`, `${s.responseRate} %`],
    ['Personnes attendues', s.expectedPeople, 'invités présents et accompagnants'],
    ['Absents', s.declinedGuests],
    ['En attente', s.pending],
  ]

  return (
    <div className="flex flex-col gap-16">
      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">Statistiques des réponses</h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-10 border-y border-line py-8 md:grid-cols-4">
          {items.map(([k, v, sub]) => (
            <div key={k} className="min-w-0">
              <dt className="meta">{k}</dt>
              <dd className="display tnum mt-3 text-[clamp(2.4rem,5vw,3.5rem)] leading-none">{v}</dd>
              {sub && <dd className="mt-2 text-[0.875rem] text-pearl-mute">{sub}</dd>}
            </div>
          ))}
        </dl>
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-obsidian-3" role="img" aria-label={`${s.attendingGuests} présents, ${s.declinedGuests} absents, ${s.pending} en attente`}>
          <div className="flex h-full">
            <span className="bg-success" style={{ width: `${(s.attendingGuests / s.invitations) * 100}%` }} />
            <span className="bg-pearl-mute" style={{ width: `${(s.declinedGuests / s.invitations) * 100}%` }} />
          </div>
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[0.8125rem] text-pearl-mute" aria-hidden="true">
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success" />Présents</li>
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-pearl-mute" />Absents</li>
          <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-obsidian-3 ring-1 ring-line-strong" />En attente</li>
        </ul>
      </section>

      <div className="grid gap-16 lg:grid-cols-2">
        <section aria-labelledby="diet-title">
          <h2 id="diet-title" className="display text-[1.9rem]">Régimes alimentaires</h2>
          {s.dietary.length ? (
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {s.dietary.map((d) => (
                <li key={d.guest} className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
                  <span className="text-pearl">{d.guest}</span>
                  <span className="min-w-0 break-words text-pearl-dim">{d.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-pearl-mute">Aucune restriction signalée pour l’instant.</p>
          )}
        </section>
        <section aria-labelledby="msg-title">
          <h2 id="msg-title" className="display text-[1.9rem]">Messages</h2>
          {s.messages.length ? (
            <ul className="mt-6 space-y-6">
              {s.messages.map((m) => (
                <li key={m.guest + m.at}>
                  <blockquote className="display break-words text-[1.35rem] italic leading-snug">« {m.text} »</blockquote>
                  <p className="mt-2 text-[0.875rem] text-pearl-mute">{m.guest}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-pearl-mute">Les mots de vos invités apparaîtront ici.</p>
          )}
        </section>
      </div>
    </div>
  )
}
