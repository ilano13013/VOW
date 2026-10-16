import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { demoInvitation } from '@/data/demoInvitation'
import { RsvpForm } from '@/features/rsvp/RsvpForm'
import { RsvpSection } from '@/features/rsvp/RsvpSection'
import { DEMO_GUEST, loadDemoRsvp, submitDemoRsvp } from '@/features/rsvp/demoRsvp'
import { InvitationExperience } from './InvitationExperience'

export default function DemoInvitationPage() {
  const [params] = useSearchParams()
  useEffect(() => {
    const prev = document.title
    document.title = `${demoInvitation.partnerOne} & ${demoInvitation.partnerTwo} — Invitation démo VOW.`
    return () => {
      document.title = prev
    }
  }, [])
  return (
    <main id="main">
      <InvitationExperience
        content={demoInvitation}
        startOpen={params.get('open') === '1'}
        rsvp={
          <RsvpSection
            deadline={demoInvitation.rsvpDeadline}
            note="Démonstration : votre réponse reste dans ce navigateur et n’est envoyée à personne."
          >
            <RsvpForm guestName={DEMO_GUEST.name} maxCompanions={DEMO_GUEST.maxCompanions} initial={loadDemoRsvp()} onSubmit={(v) => submitDemoRsvp(v)} />
          </RsvpSection>
        }
      />
    </main>
  )
}
