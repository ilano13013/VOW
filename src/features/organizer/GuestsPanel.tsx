import { useState, type FormEvent } from 'react'
import { Field } from '@/components/form/Field'
import { Button } from '@/components/ui/Button'
import { useBackend } from '@/services/backend'
import { BackendError, type GuestInput, type GuestRecord } from '@/services/types'
import { cn } from '@/lib/cn'
import { useEventOutlet } from './EventPage'
import { guestLink, guestStatus, toCsv } from './stats'
import { ActionButton, GuestStatusChip } from './ui'

const EMPTY: GuestInput = { name: '', maxCompanions: 0, email: '', note: '' }

export default function GuestsPanel() {
  const backend = useBackend()
  const { data, setData } = useEventOutlet()
  const { event, guests, rsvps } = data
  const [editing, setEditing] = useState<GuestRecord | null>(null)
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  const replaceGuest = (g: GuestRecord) => setData({ ...data, guests: guests.map((x) => (x.id === g.id ? g : x)) })

  async function save(input: GuestInput): Promise<string | null> {
    try {
      if (editing) {
        replaceGuest(await backend.updateGuest(editing.id, input))
        setEditing(null)
        setMessage({ kind: 'ok', text: `${input.name.trim()} a été modifié·e.` })
      } else {
        const g = await backend.addGuest(event.id, input)
        setData({ ...data, guests: [...guests, g] })
        setMessage({ kind: 'ok', text: `${g.name} a été ajouté·e. Copiez son lien pour le lui envoyer.` })
      }
      return null
    } catch (err) {
      return err instanceof BackendError ? err.message : 'Enregistrement impossible. Réessayez.'
    }
  }

  function exportCsv() {
    const blob = new Blob([toCsv(guests, rsvps)], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${event.slug}-reponses.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="grid gap-16 lg:grid-cols-12">
      <section className="min-w-0 lg:col-span-8" aria-labelledby="guests-title">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="guests-title" className="display text-[2.2rem]">
            Invités <span className="tnum text-pearl-mute">{guests.length} / {event.guestLimit}</span>
          </h2>
          {guests.length > 0 && <ActionButton onClick={exportCsv}>Exporter en CSV</ActionButton>}
        </div>
        {message && (
          <p role={message.kind === 'error' ? 'alert' : 'status'} className={cn('mt-6 text-[0.9375rem]', message.kind === 'error' ? 'text-danger' : 'text-success')}>
            {message.text}
          </p>
        )}
        {event.status === 'draft' && guests.length > 0 && (
          <p className="mt-4 text-[0.9375rem] text-pearl-mute">L’invitation est en brouillon : les liens fonctionneront dès sa publication.</p>
        )}
        {guests.length === 0 ? (
          <p className="mt-8 text-pearl-dim">Ajoutez votre premier invité avec le formulaire.</p>
        ) : (
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {guests.map((g) => (
              <GuestRow
                key={g.id}
                guest={g}
                rsvp={rsvps.find((r) => r.guestId === g.id)}
                onEdit={() => setEditing(g)}
                onChanged={replaceGuest}
                onDeleted={() => {
                  setData({ ...data, guests: guests.filter((x) => x.id !== g.id), rsvps: rsvps.filter((r) => r.guestId !== g.id) })
                  setMessage({ kind: 'ok', text: `${g.name} a été retiré·e de la liste.` })
                }}
                onError={(text) => setMessage({ kind: 'error', text })}
              />
            ))}
          </ul>
        )}
      </section>
      <aside className="lg:col-span-4" aria-labelledby="guest-form-title">
        <GuestForm key={editing?.id ?? 'new'} initial={editing} onSave={save} onCancel={editing ? () => setEditing(null) : undefined} full={!editing && guests.length >= event.guestLimit} />
      </aside>
    </div>
  )
}

function GuestRow({ guest, rsvp, onEdit, onChanged, onDeleted, onError }: {
  guest: GuestRecord
  rsvp?: { companions: number; attending: boolean }
  onEdit: () => void
  onChanged: (g: GuestRecord) => void
  onDeleted: () => void
  onError: (t: string) => void
}) {
  const backend = useBackend()
  const [confirm, setConfirm] = useState<'delete' | 'rotate' | null>(null)
  const [copied, setCopied] = useState(false)
  const link = guestLink(guest.token)
  const status = guestStatus(guest.id, rsvp ? [{ guestId: guest.id, ...rsvp, respondentName: '', dietary: null, message: null }] : [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.getElementById(`link-${guest.id}`) as HTMLInputElement | null
      input?.select()
    }
  }

  async function run(action: 'delete' | 'rotate') {
    try {
      if (action === 'delete') {
        await backend.deleteGuest(guest.id)
        onDeleted()
      } else {
        const token = await backend.regenerateGuestToken(guest.id)
        onChanged({ ...guest, token })
      }
    } catch (err) {
      onError(err instanceof BackendError ? err.message : 'Action impossible. Réessayez.')
    } finally {
      setConfirm(null)
    }
  }

  return (
    <li className="py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-[1.0625rem] text-pearl">{guest.name}</p>
          <p className="text-[0.875rem] text-pearl-mute">
            {guest.maxCompanions === 0 ? 'Sans accompagnant' : `Jusqu’à ${guest.maxCompanions} accompagnant${guest.maxCompanions > 1 ? 's' : ''}`}
            {guest.email && <> · {guest.email}</>}
          </p>
        </div>
        <GuestStatusChip status={status} companions={rsvp?.attending ? rsvp.companions : 0} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label htmlFor={`link-${guest.id}`} className="sr-only">Lien personnel de {guest.name}</label>
        <input id={`link-${guest.id}`} readOnly value={link} className="min-w-0 flex-1 basis-56 truncate rounded-full border border-line bg-transparent px-4 py-2 text-[0.8125rem] text-pearl-mute" onFocus={(e) => e.currentTarget.select()} />
        <ActionButton onClick={copy} aria-live="polite">{copied ? 'Lien copié' : 'Copier le lien'}</ActionButton>
        <ActionButton onClick={onEdit}>Modifier</ActionButton>
        <ActionButton onClick={() => setConfirm('rotate')}>Nouveau lien</ActionButton>
        <ActionButton onClick={() => setConfirm('delete')} className="hover:!border-danger hover:!text-danger">Supprimer</ActionButton>
      </div>
      {confirm && (
        <div role="alertdialog" aria-labelledby={`confirm-${guest.id}`} className="mt-4 flex flex-wrap items-center gap-3 rounded-[1rem] border border-line-strong p-4">
          <p id={`confirm-${guest.id}`} className="min-w-0 flex-1 basis-64 text-[0.9375rem] text-pearl-dim">
            {confirm === 'delete'
              ? `Retirer ${guest.name} ? Son lien cessera de fonctionner et sa réponse sera effacée.`
              : `Créer un nouveau lien pour ${guest.name} ? L’ancien lien cessera de fonctionner.`}
          </p>
          <ActionButton onClick={() => run(confirm)} className={confirm === 'delete' ? '!border-danger !text-danger' : ''} autoFocus>
            {confirm === 'delete' ? 'Retirer' : 'Créer le lien'}
          </ActionButton>
          <ActionButton onClick={() => setConfirm(null)}>Annuler</ActionButton>
        </div>
      )}
    </li>
  )
}

function GuestForm({ initial, onSave, onCancel, full }: { initial: GuestRecord | null; onSave: (g: GuestInput) => Promise<string | null>; onCancel?: () => void; full: boolean }) {
  const [v, setV] = useState<GuestInput>(initial ? { name: initial.name, maxCompanions: initial.maxCompanions, email: initial.email ?? '', note: initial.note ?? '' } : EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!v.name.trim()) {
      setNameError('Indiquez le nom de l’invité.')
      document.getElementById('guest-name')?.focus()
      return
    }
    setNameError(null)
    setBusy(true)
    const err = await onSave(v)
    setBusy(false)
    if (err) setError(err)
    else if (!initial) {
      setV(EMPTY)
      document.getElementById('guest-name')?.focus()
    }
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-7 rounded-[1.5rem] border border-line p-7 lg:sticky lg:top-8">
      <h2 id="guest-form-title" className="display text-[1.9rem] leading-tight">{initial ? `Modifier ${initial.name}` : 'Ajouter un invité'}</h2>
      {full && <p className="text-pearl-dim">Vous avez atteint le nombre d’invitations de votre offre.</p>}
      {error && <p role="alert" className="text-danger">{error}</p>}
      <Field label="Nom" id="guest-name" hint="Tel qu’il apparaîtra sur l’invitation, par exemple « Claire et Thomas »." error={nameError}>
        <input className="field" value={v.name} maxLength={120} onChange={(e) => setV({ ...v, name: e.target.value })} autoComplete="off" disabled={full} />
      </Field>
      <Field label="Accompagnants autorisés" id="guest-companions">
        <select className="field appearance-none" value={v.maxCompanions} onChange={(e) => setV({ ...v, maxCompanions: Number(e.target.value) })} disabled={full}>
          {Array.from({ length: 11 }, (_, i) => (
            <option key={i} value={i} className="bg-obsidian">{i === 0 ? 'Aucun' : i}</option>
          ))}
        </select>
      </Field>
      <Field label="E-mail" id="guest-email" optional hint="Pour vous seulement : VOW. n’envoie pas d’e-mail.">
        <input className="field" type="email" inputMode="email" value={v.email ?? ''} onChange={(e) => setV({ ...v, email: e.target.value })} disabled={full} />
      </Field>
      <Field label="Note privée" id="guest-note" optional>
        <input className="field" value={v.note ?? ''} maxLength={500} onChange={(e) => setV({ ...v, note: e.target.value })} disabled={full} />
      </Field>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={busy || full} aria-busy={busy}>{initial ? 'Enregistrer' : 'Ajouter'}</Button>
        {onCancel && <Button variant="ghost" onClick={onCancel}>Annuler</Button>}
      </div>
    </form>
  )
}
