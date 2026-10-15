import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { demoInvitation } from '@/data/demoInvitation'
import { InvitationExperience } from './InvitationExperience'
import { RsvpTeaser } from './sections/RsvpTeaser'

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
        rsvp={<RsvpTeaser deadline={demoInvitation.rsvpDeadline} />}
      />
    </main>
  )
}
