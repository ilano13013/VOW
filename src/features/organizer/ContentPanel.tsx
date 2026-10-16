import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Field } from '@/components/form/Field'
import { Button } from '@/components/ui/Button'
import { isValidIso } from '@/features/invitation/content'
import { parisIso, splitParisIso } from '@/features/invitation/format'
import type { InvitationContent, Venue } from '@/features/invitation/types'
import { useBackend } from '@/services/backend'
import { BackendError } from '@/services/types'
import { cn } from '@/lib/cn'
import { useEventOutlet } from './EventPage'
import { ActionButton } from './ui'

type Errors = Partial<Record<'partnerOne' | 'partnerTwo' | 'date', string>>

export default function ContentPanel() {
  const backend = useBackend()
  const { data, setData } = useEventOutlet()
  const [c, setC] = useState<InvitationContent>(data.event.content)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const when = splitParisIso(c.dateIso)
  const [date, setDate] = useState(when.date)
  const [time, setTime] = useState(when.time || '16:00')

  const draft = useMemo<InvitationContent>(() => ({ ...c, dateIso: date ? parisIso(date, time) : '' }), [c, date, time])
  const dirty = JSON.stringify(draft) !== JSON.stringify(data.event.content)

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const set = <K extends keyof InvitationContent>(k: K, v: InvitationContent[K]) => setC((s) => ({ ...s, [k]: v }))
  const setVenue = (k: 'ceremony' | 'reception', patch: Partial<Venue>) => setC((s) => ({ ...s, [k]: { ...s[k], ...patch } }))

  async function save(e: FormEvent) {
    e.preventDefault()
    setStatus(null)
    const next: Errors = {}
    if (!draft.partnerOne.trim()) next.partnerOne = 'Indiquez le premier prénom.'
    if (!draft.partnerTwo.trim()) next.partnerTwo = 'Indiquez le second prénom.'
    if (!isValidIso(draft.dateIso)) next.date = 'Indiquez une date valide.'
    setErrors(next)
    if (Object.keys(next).length) {
      document.getElementById(next.partnerOne ? 'c-one' : next.partnerTwo ? 'c-two' : 'c-date')?.focus()
      return
    }
    setBusy(true)
    try {
      const event = await backend.updateEvent(data.event.id, { content: draft })
      setData({ ...data, event })
      setC(event.content)
      setStatus({ kind: 'ok', text: data.event.status === 'published' ? 'Enregistré. Vos invités voient déjà la nouvelle version.' : 'Enregistré.' })
    } catch (err) {
      setStatus({ kind: 'error', text: err instanceof BackendError ? err.message : 'Enregistrement impossible. Vos modifications sont conservées sur cette page : réessayez.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form noValidate onSubmit={save} className="flex flex-col gap-16 pb-28">
      <Section title="Le couple">
        <Field label="Premier prénom" id="c-one" error={errors.partnerOne}>
          <input className="field" value={c.partnerOne} maxLength={40} onChange={(e) => set('partnerOne', e.target.value)} />
        </Field>
        <Field label="Second prénom" id="c-two" error={errors.partnerTwo}>
          <input className="field" value={c.partnerTwo} maxLength={40} onChange={(e) => set('partnerTwo', e.target.value)} />
        </Field>
        <Field label="Phrase d’ouverture" id="c-opening" hint="Affichée sur l’écran noir, avant l’ouverture." className="md:col-span-2">
          <input className="field" value={c.openingLine} maxLength={90} onChange={(e) => set('openingLine', e.target.value)} />
        </Field>
      </Section>

      <Section title="Date et lieu">
        <Field label="Date" id="c-date" error={errors.date}>
          <input className="field [color-scheme:dark]" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Heure (Paris)" id="c-time">
          <input className="field [color-scheme:dark]" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
        <Field label="Lieu affiché" id="c-location" hint="Par exemple « Provence, France »." >
          <input className="field" value={c.locationLabel} maxLength={60} onChange={(e) => set('locationLabel', e.target.value)} />
        </Field>
        <Field label="Date limite de réponse" id="c-deadline">
          <input className="field [color-scheme:dark]" type="date" value={c.rsvpDeadline} onChange={(e) => set('rsvpDeadline', e.target.value)} />
        </Field>
      </Section>

      {(['ceremony', 'reception'] as const).map((k) => (
        <Section key={k} title={k === 'ceremony' ? 'Cérémonie' : 'Réception'}>
          <Field label="Nom du lieu" id={`c-${k}-name`} hint="Laissez vide pour masquer ce bloc.">
            <input className="field" value={c[k].name} maxLength={80} onChange={(e) => setVenue(k, { name: e.target.value })} />
          </Field>
          <Field label="Heure" id={`c-${k}-time`}>
            <input className="field [color-scheme:dark]" type="time" value={c[k].time} onChange={(e) => setVenue(k, { time: e.target.value })} />
          </Field>
          <Field label="Description" id={`c-${k}-desc`} optional className="md:col-span-2">
            <input className="field" value={c[k].description} maxLength={200} onChange={(e) => setVenue(k, { description: e.target.value })} />
          </Field>
          <Field label="Adresse pour l’itinéraire" id={`c-${k}-maps`} optional hint="Utilisée pour les liens Plans et Google Maps." className="md:col-span-2">
            <input className="field" value={c[k].mapsQuery} maxLength={200} onChange={(e) => setVenue(k, { mapsQuery: e.target.value })} />
          </Field>
        </Section>
      ))}

      <ListSection
        title="Programme"
        empty="Aucune étape. Ajoutez par exemple « 17:30 — Cocktail »."
        items={c.schedule}
        onChange={(v) => set('schedule', v)}
        make={() => ({ time: '', title: '', detail: '' })}
        render={(item, i, update) => (
          <>
            <Field label="Heure" id={`c-sch-${i}-time`}>
              <input className="field" value={item.time} maxLength={20} onChange={(e) => update({ ...item, time: e.target.value })} />
            </Field>
            <Field label="Étape" id={`c-sch-${i}-title`}>
              <input className="field" value={item.title} maxLength={60} onChange={(e) => update({ ...item, title: e.target.value })} />
            </Field>
            <Field label="Précision" id={`c-sch-${i}-detail`} optional className="md:col-span-2">
              <input className="field" value={item.detail ?? ''} maxLength={120} onChange={(e) => update({ ...item, detail: e.target.value })} />
            </Field>
          </>
        )}
      />

      <ListSection
        title="Informations pratiques"
        empty="Dress code, hébergement, transport…"
        items={c.practical}
        onChange={(v) => set('practical', v)}
        make={() => ({ title: '', text: '' })}
        render={(item, i, update) => (
          <>
            <Field label="Titre" id={`c-pr-${i}-title`}>
              <input className="field" value={item.title} maxLength={40} onChange={(e) => update({ ...item, title: e.target.value })} />
            </Field>
            <Field label="Texte" id={`c-pr-${i}-text`} className="md:col-span-2">
              <textarea className="field min-h-20 resize-y" value={item.text} maxLength={400} onChange={(e) => update({ ...item, text: e.target.value })} />
            </Field>
          </>
        )}
      />

      <ListSection
        title="Our Story"
        empty="Racontez quelques moments de votre histoire. Chaque chapitre est illustré par un rendu de la sculpture."
        items={c.story}
        onChange={(v) => set('story', v)}
        make={() => ({ year: '', title: '', text: '', art: [3, 11, 17, 23][c.story.length % 4] })}
        render={(item, i, update) => (
          <>
            <Field label="Année" id={`c-st-${i}-year`}>
              <input className="field" value={item.year} maxLength={10} inputMode="numeric" onChange={(e) => update({ ...item, year: e.target.value })} />
            </Field>
            <Field label="Titre" id={`c-st-${i}-title`}>
              <input className="field" value={item.title} maxLength={60} onChange={(e) => update({ ...item, title: e.target.value })} />
            </Field>
            <Field label="Récit" id={`c-st-${i}-text`} className="md:col-span-2">
              <textarea className="field min-h-24 resize-y" value={item.text} maxLength={600} onChange={(e) => update({ ...item, text: e.target.value })} />
            </Field>
          </>
        )}
      />

      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-30 border-t border-line bg-obsidian/95 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur-md md:px-10',
        )}
      >
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4">
          <p role={status?.kind === 'error' ? 'alert' : 'status'} className={cn('min-w-0 flex-1 text-[0.9375rem]', status?.kind === 'error' ? 'text-danger' : status ? 'text-success' : 'text-pearl-mute')}>
            {status ? status.text : dirty ? 'Modifications non enregistrées.' : 'Tout est enregistré.'}
          </p>
          <Button type="submit" disabled={busy || !dirty} aria-busy={busy}>
            {busy ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-8 border-t border-line pt-8 md:grid-cols-[14rem_1fr]">
      <legend className="sr-only">{title}</legend>
      <h2 className="display text-[1.75rem] leading-tight" aria-hidden="true">{title}</h2>
      <div className="grid min-w-0 gap-8 md:grid-cols-2">{children}</div>
    </fieldset>
  )
}

function ListSection<T>({ title, empty, items, onChange, make, render }: {
  title: string
  empty: string
  items: T[]
  onChange: (v: T[]) => void
  make: () => T
  render: (item: T, i: number, update: (v: T) => void) => ReactNode
}) {
  const move = (i: number, d: -1 | 1) => {
    const next = [...items]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    onChange(next)
  }
  return (
    <fieldset className="grid gap-8 border-t border-line pt-8 md:grid-cols-[14rem_1fr]">
      <legend className="sr-only">{title}</legend>
      <h2 className="display text-[1.75rem] leading-tight" aria-hidden="true">{title}</h2>
      <div className="min-w-0">
        {items.length === 0 && <p className="text-pearl-mute">{empty}</p>}
        <ol className="flex flex-col gap-8">
          {items.map((item, i) => (
            <li key={i} className="rounded-[1.25rem] border border-line p-5">
              <div className="grid gap-6 md:grid-cols-2">{render(item, i, (v) => onChange(items.map((x, j) => (j === i ? v : x))))}</div>
              <div className="mt-5 flex flex-wrap gap-2">
                <ActionButton onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Monter l’élément ${i + 1} de ${title}`}>Monter</ActionButton>
                <ActionButton onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Descendre l’élément ${i + 1} de ${title}`}>Descendre</ActionButton>
                <ActionButton onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Supprimer l’élément ${i + 1} de ${title}`} className="hover:!border-danger hover:!text-danger">Supprimer</ActionButton>
              </div>
            </li>
          ))}
        </ol>
        <ActionButton className="mt-6" onClick={() => onChange([...items, make()])}>Ajouter</ActionButton>
      </div>
    </fieldset>
  )
}
