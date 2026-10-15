import { ButtonLink } from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <section className="flex min-h-[80svh] items-center px-5 pt-24 md:px-10" aria-labelledby="nf-title">
      <div className="mx-auto w-full max-w-[1200px]">
        <h1 id="nf-title" className="display text-[clamp(3rem,10vw,8rem)]">
          Cette page <em className="text-iris">n’existe pas.</em>
        </h1>
        <p className="mt-6 max-w-[44ch] text-pearl-dim">Le lien est peut-être incomplet. Si vous avez reçu une invitation, vérifiez que le lien a été copié en entier.</p>
        <div className="mt-10">
          <ButtonLink to="/" arrow>Retour à l’accueil</ButtonLink>
        </div>
      </div>
    </section>
  )
}
