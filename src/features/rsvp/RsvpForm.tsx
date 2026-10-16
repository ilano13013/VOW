import { useRef, useState, type FormEvent } from 'react'
import { Field, ErrorSummary } from '@/components/form/Field'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { RsvpAnswer, RsvpErrorCode, RsvpInput, RsvpResult } from '@/services/types'
import { RSVP_ERROR_FIELD, RSVP_LIMITS, rsvpErrorMessage, validateRsvp, type RsvpField } from './validation'

interface Props {
  guestName: string
  maxCompanions: number
  initial: RsvpAnswer | null
  closed?: boolean
  onSubmit: (input: RsvpInput) => Promise<RsvpResult>
}

const FIELD_ID: Record<RsvpField, string> = {
  attending: 'rsvp-attending-yes',
  respondentName: 'rsvp-name',
  companions: 'rsvp-companions',
  dietary: 'rsvp-dietary',
  message: 'rsvp-message',
}

export function RsvpForm({ guestName, maxCompanions, initial, closed, onSubmit }: Props) {
  const [values, setValues] = useState<RsvpInput>(() => ({
    attending: initial?.attending ?? null,
    respondentName: initial?.respondentName ?? guestName,
    companions: initial?.companions ?? 0,
    dietary: initial?.dietary ?? '',
    message: initial?.message ?? '',
  }))
  const [errors, setErrors] = useState<Partial<Record<RsvpField, RsvpErrorCode>>>({})
  const [formError, setFormError] = useState<RsvpErrorCode | null>(null)
  const [status, setStatus] = useState<'editing' | 'submitting' | 'done'>(initial ? 'done' : 'editing')
  const [saved, setSaved] = useState<RsvpInput | null>(initial ? values : null)
  const summaryRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef<HTMLDivElement>(null)

  const set = <K extends keyof RsvpInput>(k: K, v: RsvpInput[K]) => setValues((s) => ({ ...s, [k]: v }))
  const blurCheck = (field: RsvpField) => {
    const r = validateRsvp(values, maxCompanions)
    setErrors((e) => {
      const next = { ...e }
      if (!r.ok && r.errors[field]) next[field] = r.errors[field]
      else delete next[field]
      return next
    })
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const v = validateRsvp(values, maxCompanions)
    if (!v.ok) {
      setErrors(v.errors)
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    setErrors({})
    setStatus('submitting')
    const res = await onSubmit(values)
    if (res.ok) {
      setSaved(values)
      setStatus('done')
      requestAnimationFrame(() => doneRef.current?.focus())
      return
    }
    setStatus('editing')
    const field = RSVP_ERROR_FIELD[res.error]
    if (field) setErrors({ [field]: res.error })
    else setFormError(res.error)
    requestAnimationFrame(() => summaryRef.current?.focus())
  }

  if (status === 'done' && saved) {
    return (
      <div ref={doneRef} tabIndex={-1} className="outline-none" aria-live="polite">
        <p className="display text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02]">
          {saved.attending ? 'Merci, nous avons hâte de vous voir.' : 'Merci de nous avoir prévenus.'}
        </p>
        <dl className="mt-8 divide-y divide-line border-y border-line">
          <Row k="Réponse" v={saved.attending ? 'Présent·e' : 'Absent·e'} />
          <Row k="Nom" v={saved.respondentName.trim()} />
          {saved.attending && maxCompanions > 0 && <Row k="Accompagnants" v={String(saved.companions)} />}
          {saved.attending && saved.dietary.trim() && <Row k="Régime alimentaire" v={saved.dietary.trim()} />}
          {saved.message.trim() && <Row k="Message" v={saved.message.trim()} />}
        </dl>
        {!closed && (
          <Button variant="ghost" className="mt-8" onClick={() => setStatus('editing')}>
            Modifier ma réponse
          </Button>
        )}
      </div>
    )
  }

  if (closed) {
    return <p className="text-pearl-dim">{rsvpErrorMessage('rsvp_closed')}</p>
  }

  const summary = [
    ...(Object.entries(errors) as [RsvpField, RsvpErrorCode][]).map(([f, c]) => ({ fieldId: FIELD_ID[f], message: rsvpErrorMessage(c, maxCompanions) })),
    ...(formError ? [{ fieldId: 'rsvp-submit', message: rsvpErrorMessage(formError) }] : []),
  ]

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-10" aria-describedby="rsvp-intro">
      <p id="rsvp-intro" className="text-pearl-dim">
        Cette invitation est adressée à <span className="text-pearl">{guestName}</span>
        {maxCompanions > 0 ? ` et permet jusqu’à ${maxCompanions} accompagnant${maxCompanions > 1 ? 's' : ''}.` : '.'}
      </p>
      <ErrorSummary items={summary} summaryRef={summaryRef} />

      <fieldset aria-describedby={errors.attending ? 'rsvp-attending-error' : undefined}>
        <legend className="meta !text-pearl-dim">Serez-vous présent·e ?</legend>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { v: true, label: 'Avec joie', id: 'rsvp-attending-yes' },
            { v: false, label: 'Avec regret', id: 'rsvp-attending-no' },
          ].map((o) => (
            <label
              key={o.id}
              htmlFor={o.id}
              className={cn(
                'flex min-h-16 cursor-pointer items-center gap-4 rounded-full border px-6 transition-colors duration-500 has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-iris',
                values.attending === o.v ? 'border-pearl bg-pearl text-obsidian' : 'border-line-strong text-pearl hover:border-pearl-dim',
              )}
            >
              <input
                type="radio"
                id={o.id}
                name="attending"
                className="sr-only"
                checked={values.attending === o.v}
                onChange={() => {
                  set('attending', o.v)
                  setErrors(({ attending: _a, ...rest }) => (void _a, rest))
                }}
              />
              <span aria-hidden="true" className={cn('h-2.5 w-2.5 rounded-full border', values.attending === o.v ? 'border-obsidian bg-obsidian' : 'border-pearl-dim')} />
              <span className="display text-[1.6rem] leading-none">{o.label}</span>
            </label>
          ))}
        </div>
        {errors.attending && (
          <p id="rsvp-attending-error" role="alert" className="mt-2 text-[0.9375rem] text-danger">
            {rsvpErrorMessage(errors.attending)}
          </p>
        )}
      </fieldset>

      <Field label="Votre nom" id={FIELD_ID.respondentName} error={errors.respondentName && rsvpErrorMessage(errors.respondentName)}>
        <input
          className="field"
          autoComplete="name"
          maxLength={RSVP_LIMITS.name + 20}
          value={values.respondentName}
          onChange={(e) => set('respondentName', e.target.value)}
          onBlur={() => blurCheck('respondentName')}
        />
      </Field>

      {values.attending && maxCompanions > 0 && (
        <Field
          label="Nombre d’accompagnants"
          id={FIELD_ID.companions}
          hint={`Jusqu’à ${maxCompanions} personne${maxCompanions > 1 ? 's' : ''} en plus de vous.`}
          error={errors.companions && rsvpErrorMessage(errors.companions, maxCompanions)}
        >
          <select className="field appearance-none" value={values.companions} onChange={(e) => set('companions', Number(e.target.value))} onBlur={() => blurCheck('companions')}>
            {Array.from({ length: maxCompanions + 1 }, (_, i) => (
              <option key={i} value={i} className="bg-obsidian">
                {i === 0 ? 'Je viens seul·e' : `${i} accompagnant${i > 1 ? 's' : ''}`}
              </option>
            ))}
          </select>
        </Field>
      )}

      {values.attending && (
        <Field label="Restrictions alimentaires" id={FIELD_ID.dietary} optional hint="Allergies, régime végétarien, sans gluten… pour vous et vos accompagnants." error={errors.dietary && rsvpErrorMessage(errors.dietary)}>
          <textarea className="field min-h-24 resize-y" maxLength={RSVP_LIMITS.dietary} value={values.dietary} onChange={(e) => set('dietary', e.target.value)} onBlur={() => blurCheck('dietary')} />
        </Field>
      )}

      <Field label="Un mot pour les mariés" id={FIELD_ID.message} optional error={errors.message && rsvpErrorMessage(errors.message)}>
        <textarea className="field min-h-28 resize-y" maxLength={RSVP_LIMITS.message} value={values.message} onChange={(e) => set('message', e.target.value)} onBlur={() => blurCheck('message')} />
      </Field>

      <div>
        <Button id="rsvp-submit" type="submit" arrow disabled={status === 'submitting'} aria-busy={status === 'submitting'}>
          {status === 'submitting' ? 'Envoi…' : initial ? 'Mettre à jour ma réponse' : 'Envoyer ma réponse'}
        </Button>
      </div>
    </form>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-6 py-3.5">
      <dt className="meta self-center">{k}</dt>
      <dd className="min-w-0 break-words text-right text-pearl">{v}</dd>
    </div>
  )
}
