import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Field } from '@/components/form/Field'
import { Button } from '@/components/ui/Button'
import { RouteFallback } from '@/app/RouteFallback'
import { SLUG_PATTERN, slugify, starterContent } from '@/features/invitation/content'
import { formatShortDate } from '@/features/invitation/format'
import { useBackend } from '@/services/backend'
import { BackendError, type EventRecord } from '@/services/types'
import { StatusPill } from './ui'

export default function DashboardPage() {
  const backend = useBackend()
  const [events, setEvents] = useState<EventRecord[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    backend
      .listEvents()
      .then(setEvents)
      .catch(() => setError('Impossible de charger vos invitations. Rechargez la page.'))
  }, [backend])

  if (error) return <p role="alert" className="text-danger">{error}</p>
  if (!events) return <RouteFallback />

  return (
    <div className="grid gap-16 lg:grid-cols-12">
      <section className="lg:col-span-7" aria-labelledby="events-title">
        <h1 id="events-title" className="display text-[clamp(2.6rem,5vw,4rem)]">Vos invitations</h1>
        {events.length === 0 ? (
          <p className="mt-6 max-w-[48ch] text-pearl-dim">Vous n’avez pas encore d’invitation. Commencez par les prénoms et la date : vous compléterez le reste ensuite.</p>
        ) : (
          <ul className="mt-10 divide-y divide-line border-y border-line">
            {events.map((e) => (
              <li key={e.id}>
                <Link to={`/organizer/events/${e.id}`} className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-6">
                  <span className="display text-[2rem] leading-tight group-hover:text-iris">
                    {e.content.partnerOne} & {e.content.partnerTwo}
                  </span>
                  <span className="flex items-center gap-4">
                    {e.content.dateIso && <span className="tnum text-pearl-dim">{formatShortDate(e.content.dateIso.slice(0, 10))}</span>}
                    <StatusPill status={e.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="lg:col-span-4 lg:col-start-9" aria-labelledby="create-title">
        <CreateEventForm />
      </section>
    </div>
  )
}

function CreateEventForm() {
  const backend = useBackend()
  const navigate = useNavigate()
  const [one, setOne] = useState('')
  const [two, setTwo] = useState('')
  const [date, setDate] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!one.trim()) next.one = 'Indiquez le premier prénom.'
    if (!two.trim()) next.two = 'Indiquez le second prénom.'
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) next.date = 'Indiquez la date du mariage.'
    setErrors(next)
    if (Object.keys(next).length) return
    const base = slugify(`${one} ${two} ${date.slice(0, 4)}`)
    const slug = SLUG_PATTERN.test(base) ? base : `vow-${Date.now().toString(36)}`
    setBusy(true)
    try {
      let created: EventRecord
      try {
        created = await backend.createEvent({ slug, content: starterContent(one.trim(), two.trim(), date) })
      } catch (err) {
        if (err instanceof BackendError && err.code === 'conflict') {
          created = await backend.createEvent({ slug: `${slug.slice(0, 52)}-${Math.random().toString(36).slice(2, 7)}`, content: starterContent(one.trim(), two.trim(), date) })
        } else throw err
      }
      navigate(`/organizer/events/${created.id}/content`)
    } catch (err) {
      setErrors({ form: err instanceof BackendError ? err.message : 'Création impossible. Réessayez.' })
      setBusy(false)
    }
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-7 rounded-[1.5rem] border border-line p-7">
      <h2 id="create-title" className="display text-[1.9rem] leading-tight">Nouvelle invitation</h2>
      {errors.form && <p role="alert" className="text-danger">{errors.form}</p>}
      <Field label="Premier prénom" id="new-one" error={errors.one}>
        <input className="field" value={one} onChange={(e) => setOne(e.target.value)} autoComplete="off" />
      </Field>
      <Field label="Second prénom" id="new-two" error={errors.two}>
        <input className="field" value={two} onChange={(e) => setTwo(e.target.value)} autoComplete="off" />
      </Field>
      <Field label="Date du mariage" id="new-date" error={errors.date}>
        <input className="field [color-scheme:dark]" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <Button type="submit" arrow disabled={busy} aria-busy={busy}>
        {busy ? 'Création…' : 'Créer l’invitation'}
      </Button>
    </form>
  )
}
