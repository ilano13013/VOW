import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ButtonLink } from '@/components/ui/Button'
import { RouteFallback } from '@/app/RouteFallback'
import { RsvpForm } from '@/features/rsvp/RsvpForm'
import { RsvpSection, isRsvpClosed } from '@/features/rsvp/RsvpSection'
import { useBackend } from '@/services/backend'
import type { InvitationPayload } from '@/services/types'
import { InvitationExperience } from './InvitationExperience'

type State = { kind: 'loading' } | { kind: 'missing' } | { kind: 'error' } | { kind: 'ready'; data: InvitationPayload }

/** A guest's personal invitation, reached through /i/<token>. */
export default function GuestInvitationPage() {
  const { token = '' } = useParams()
  const [params] = useSearchParams()
  const backend = useBackend()
  const [state, setState] = useState<State>({ kind: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    setState({ kind: 'loading' })
    backend
      .getInvitation(token)
      .then((data) => alive && setState(data ? { kind: 'ready', data } : { kind: 'missing' }))
      .catch(() => alive && setState({ kind: 'error' }))
    return () => {
      alive = false
    }
  }, [backend, token, attempt])

  useEffect(() => {
    if (state.kind !== 'ready') return
    const prev = document.title
    const c = state.data.content
    document.title = `${c.partnerOne} & ${c.partnerTwo} — Invitation`
    return () => {
      document.title = prev
    }
  }, [state])

  if (state.kind === 'loading') return <RouteFallback />
  if (state.kind !== 'ready') {
    return (
      <main id="main" className="flex min-h-[100svh] items-center px-5 md:px-10">
        <div className="mx-auto w-full max-w-[1200px]">
          <h1 className="display max-w-[14ch] text-[clamp(3rem,9vw,7rem)]">
            {state.kind === 'missing' ? 'Cette invitation est introuvable.' : 'L’invitation ne s’est pas chargée.'}
          </h1>
          <p className="mt-6 max-w-[48ch] text-pearl-dim">
            {state.kind === 'missing'
              ? 'Le lien est peut-être incomplet, ou l’invitation n’est plus en ligne. Vérifiez que vous avez copié le lien en entier, ou demandez un nouveau lien aux mariés.'
              : 'Vérifiez votre connexion, puis réessayez.'}
          </p>
          {state.kind === 'error' && (
            <button type="button" onClick={() => setAttempt((n) => n + 1)} className="mt-10 min-h-12 rounded-full bg-pearl px-7 text-[0.8125rem] font-medium uppercase tracking-[0.08em] text-obsidian">
              Réessayer
            </button>
          )}
          {state.kind === 'missing' && (
            <div className="mt-10">
              <ButtonLink to="/" variant="ghost">Découvrir VOW.</ButtonLink>
            </div>
          )}
        </div>
      </main>
    )
  }

  const { guest, content, rsvp } = state.data
  const closed = isRsvpClosed(content.rsvpDeadline)
  return (
    <main id="main">
      <InvitationExperience
        content={content}
        startOpen={params.get('open') === '1'}
        rsvp={
          <RsvpSection deadline={content.rsvpDeadline || undefined}>
            <RsvpForm guestName={guest.name} maxCompanions={guest.maxCompanions} initial={rsvp} closed={closed} onSubmit={(v) => backend.submitRsvp(token, v)} />
          </RsvpSection>
        }
      />
    </main>
  )
}
