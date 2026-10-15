import { ButtonLink } from '@/components/ui/Button'

export function FinalCta() {
  return (
    <section className="grain relative overflow-hidden border-t border-line px-5 py-36 md:px-10 md:py-52" aria-labelledby="cta-title">
      <div className="pointer-events-none absolute left-1/2 top-full h-[70vh] w-[110vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(196_181_253/0.22),transparent)]" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center text-center">
        <h2 id="cta-title" className="display text-[clamp(3rem,10vw,9.5rem)]" data-reveal="mask-block">
          Your moment.
          <br />
          <em className="text-iris">Your VOW.</em>
        </h2>
        <p className="mt-10 max-w-[42ch] text-pearl-dim">
          Commandez votre invitation en quelques minutes, composez-la à votre rythme, publiez-la quand vous êtes prêts.
        </p>
        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/commander/signature" arrow>Créer mon invitation</ButtonLink>
          <ButtonLink to="/demo" variant="ghost">Revoir la démo</ButtonLink>
        </div>
      </div>
    </section>
  )
}
