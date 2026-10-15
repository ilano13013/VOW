import { formatShortDate } from '../format'

/**
 * Phase A placeholder: the RSVP form requires a personal guest token (Phase B).
 * Kept honest — it states what is not yet active.
 */
export function RsvpTeaser({ deadline }: { deadline: string }) {
  return (
    <section id="rsvp" className="scroll-mt-10 border-y border-line px-5 py-32 md:px-10 md:py-44" aria-labelledby="rsvp-title">
      <div className="mx-auto grid max-w-[1440px] gap-12 md:grid-cols-12">
        <h2 id="rsvp-title" className="display text-[clamp(3.2rem,10vw,9rem)] md:col-span-5" data-reveal="mask-block">
          RSVP
        </h2>
        <div className="md:col-span-6 md:col-start-7 md:pt-6">
          <p className="text-[1.25rem] text-pearl">Merci de répondre avant le {formatShortDate(deadline)}.</p>
          <p className="mt-4 max-w-[48ch] text-pearl-dim">
            La réponse se fait depuis le lien personnel reçu par chaque invité. Le formulaire de réponse de cette démonstration sera activé dans la prochaine étape de développement.
          </p>
        </div>
      </div>
    </section>
  )
}
