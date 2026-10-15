import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'

export function SiteFooter() {
  return (
    <footer className="border-t border-line px-5 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-16 md:px-10">
      <div className="mx-auto grid max-w-[1440px] gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo className="text-5xl" />
          <p className="mt-4 max-w-xs text-sm text-pearl-dim">Your moment. Another dimension.</p>
        </div>
        <div>
          <p className="meta">Maison</p>
          <ul className="mt-4 space-y-2 text-sm text-pearl-dim">
            <li><Link className="hover:text-pearl" to="/#maison">Manifeste</Link></li>
            <li><Link className="hover:text-pearl" to="/demo">Invitation démo</Link></li>
            <li><Link className="hover:text-pearl" to="/#fonctionnalites">Fonctionnalités</Link></li>
          </ul>
        </div>
        <div>
          <p className="meta">Offres</p>
          <ul className="mt-4 space-y-2 text-sm text-pearl-dim">
            <li><Link className="hover:text-pearl" to="/commander/essential">Essential</Link></li>
            <li><Link className="hover:text-pearl" to="/commander/signature">Signature</Link></li>
            <li><Link className="hover:text-pearl" to="/commander/couture">Couture</Link></li>
          </ul>
        </div>
        <div>
          <p className="meta">Compte</p>
          <ul className="mt-4 space-y-2 text-sm text-pearl-dim">
            <li><Link className="hover:text-pearl" to="/organizer">Espace organisateur</Link></li>
            <li><Link className="hover:text-pearl" to="/#faq">Questions fréquentes</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-16 flex max-w-[1440px] flex-col justify-between gap-3 border-t border-line pt-6 text-xs text-pearl-mute md:flex-row">
        <p>© {new Date().getFullYear()} VOW. — Maison d’invitations numériques.</p>
        <p>MVP 1.0 · Les contenus de démonstration sont fictifs.</p>
      </div>
    </footer>
  )
}
