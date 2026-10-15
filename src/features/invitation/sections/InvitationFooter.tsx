import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'

export function InvitationFooter({ isDemo, names }: { isDemo?: boolean; names: string }) {
  return (
    <footer className="px-5 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-24 text-center md:px-10">
      <p className="display text-[clamp(2.4rem,7vw,5rem)] italic">{names}</p>
      {isDemo && (
        <p className="mx-auto mt-6 max-w-[52ch] text-[0.9375rem] text-pearl-mute">
          Invitation de démonstration. Les personnes, lieux, récits et visuels présentés sont fictifs.
        </p>
      )}
      <Link to="/" className="mt-14 inline-flex items-baseline gap-2 text-pearl-dim hover:text-pearl">
        <span className="meta">Créée avec</span> <Logo className="text-[1.4rem]" />
      </Link>
      {isDemo && (
        <p className="mt-6">
          <Link to="/#offres" className="text-[0.9375rem] text-iris underline decoration-iris/40 hover:decoration-iris">
            Créer la vôtre
          </Link>
        </p>
      )}
    </footer>
  )
}
