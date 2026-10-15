import { ButtonLink } from '@/components/ui/Button'

export default function OrganizerPlaceholder() {
  return (
    <section className="flex min-h-[80svh] items-center px-5 pb-24 pt-32 md:px-10" aria-labelledby="org-title">
      <div className="mx-auto w-full max-w-[1200px]">
        <h1 id="org-title" className="display max-w-[14ch] text-[clamp(3rem,8vw,6rem)]">
          Espace organisateur <em className="text-iris">en préparation.</em>
        </h1>
        <p className="mt-8 max-w-[52ch] text-pearl-dim" role="status">
          La connexion, le tableau de bord, la liste des invités et l’édition de l’invitation arrivent dans la prochaine étape de développement. Aucune donnée n’est collectée pour l’instant.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/demo" arrow>Voir l’invitation démo</ButtonLink>
          <ButtonLink to="/" variant="ghost">Retour à l’accueil</ButtonLink>
        </div>
      </div>
    </section>
  )
}
