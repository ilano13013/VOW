import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { RouteFallback } from '@/app/RouteFallback'
import { InvitationExperience } from '@/features/invitation/InvitationExperience'
import { RsvpForm } from '@/features/rsvp/RsvpForm'
import { RsvpSection } from '@/features/rsvp/RsvpSection'
import { useBackend, useSession } from '@/services/backend'
import type { EventRecord } from '@/services/types'

/** Organizer-only preview: the full experience, with a non-submitting RSVP form. */
export default function PreviewPage() {
  const { id = '' } = useParams()
  const backend = useBackend()
  const session = useSession()
  const [event, setEvent] = useState<EventRecord | null | undefined>(undefined)

  useEffect(() => {
    if (!session) return
    backend.getEvent(id).then(setEvent).catch(() => setEvent(null))
  }, [backend, id, session])

  if (session === null) return <Navigate to="/organizer/login" replace />
  if (session === undefined || event === undefined) return <RouteFallback />
  if (event === null) return <Navigate to="/organizer" replace />

  return (
    <main id="main">
      <div role="note" className="fixed inset-x-0 top-0 z-[70] flex justify-center px-4 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <span className="meta rounded-full border border-iris/40 bg-obsidian/90 px-4 py-2 !text-iris backdrop-blur">
          Prévisualisation — visible par vous seul
        </span>
      </div>
      <InvitationExperience
        content={event.content}
        rsvp={
          <RsvpSection deadline={event.content.rsvpDeadline || undefined} note="Prévisualisation : le formulaire ne s’envoie pas.">
            <RsvpForm guestName="Nom de l’invité" maxCompanions={1} initial={null} onSubmit={async () => ({ ok: true })} />
          </RsvpSection>
        }
      />
    </main>
  )
}
