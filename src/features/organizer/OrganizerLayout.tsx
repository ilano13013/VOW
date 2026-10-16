import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { RouteFallback } from '@/app/RouteFallback'
import { useBackend, useSession } from '@/services/backend'

export function LocalModeNotice() {
  return (
    <div role="note" className="border-b border-iris/30 bg-obsidian-2 px-5 py-3 text-[0.875rem] text-pearl-dim md:px-10">
      <span className="text-iris">Mode démo local.</span> Aucun serveur n’est connecté : vos données restent dans ce navigateur, sans sécurité réelle ni partage entre appareils. Les liens invités ne fonctionnent que sur cet appareil.
    </div>
  )
}

/** Shell for every organizer screen. Redirects to the login page when signed out. */
export function OrganizerLayout() {
  const backend = useBackend()
  const session = useSession()
  const location = useLocation()
  const navigate = useNavigate()

  if (session === undefined) return <RouteFallback />
  if (session === null) return <Navigate to="/organizer/login" replace state={{ from: location.pathname }} />

  return (
    <div className="min-h-[100svh]">
      <header className="border-b border-line pt-[env(safe-area-inset-top)]">
        {backend.mode === 'local' && <LocalModeNotice />}
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-5 md:px-10">
          <div className="flex items-baseline gap-4">
            <Link to="/" aria-label="VOW. — accueil">
              <Logo className="text-[1.4rem]" />
            </Link>
            <Link to="/organizer" className="meta hidden hover:!text-pearl sm:inline">
              Espace organisateur
            </Link>
          </div>
          <div className="flex min-w-0 items-center gap-4">
            <span className="hidden truncate text-[0.875rem] text-pearl-mute md:inline">{session.email}</span>
            <button
              type="button"
              className="meta min-h-11 hover:!text-pearl"
              onClick={async () => {
                await backend.signOut()
                navigate('/organizer/login', { replace: true })
              }}
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-[1280px] px-5 pb-24 pt-10 md:px-10 md:pt-14">
        <Outlet />
      </main>
    </div>
  )
}
