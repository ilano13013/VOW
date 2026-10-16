import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useOutletContext, useParams } from 'react-router-dom'
import { Button, ButtonLink } from '@/components/ui/Button'
import { RouteFallback } from '@/app/RouteFallback'
import { isValidIso } from '@/features/invitation/content'
import { useBackend } from '@/services/backend'
import { BackendError } from '@/services/types'
import { cn } from '@/lib/cn'
import { ArrowIcon } from '@/components/ui/Icon'
import { StatusPill } from './ui'
import { useEventData, type EventData } from './useEventData'

export interface EventOutlet {
  data: EventData
  reload: () => Promise<void>
  setData: (d: EventData) => void
}

export function useEventOutlet() {
  return useOutletContext<EventOutlet>()
}

const TABS = [
  { to: '', label: 'Vue d’ensemble', end: true },
  { to: 'guests', label: 'Invités' },
  { to: 'content', label: 'Contenu' },
]

export default function EventPage() {
  const { id = '' } = useParams()
  const backend = useBackend()
  const { data, state, reload, setData } = useEventData(id)
  const [publishing, setPublishing] = useState(false)
  const [notice, setNotice] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null)
  const { pathname } = useLocation()

  // Answers arrive while the organizer works: refresh on tab change and when the window regains focus.
  useEffect(() => {
    if (!pathname.endsWith('/content')) reload()
  }, [pathname, reload])
  useEffect(() => {
    const onFocus = () => document.visibilityState === 'visible' && !window.location.pathname.endsWith('/content') && reload()
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [reload])

  if (state === 'loading' && !data) return <RouteFallback />
  if (state === 'missing') {
    return (
      <div>
        <h1 className="display text-[3rem]">Invitation introuvable</h1>
        <p className="mt-4 text-pearl-dim">Elle a peut-être été supprimée, ou elle appartient à un autre compte.</p>
        <div className="mt-8"><ButtonLink to="/organizer" variant="ghost">Retour à vos invitations</ButtonLink></div>
      </div>
    )
  }
  if (state === 'error' || !data) return <p role="alert" className="text-danger">Chargement impossible. Vérifiez votre connexion, puis rechargez la page.</p>

  const { event } = data
  const c = event.content
  const missing = [!c.partnerOne.trim() && 'les prénoms', !c.partnerTwo.trim() && 'les prénoms', !isValidIso(c.dateIso) && 'la date'].filter(Boolean)
  const canPublish = missing.length === 0

  async function togglePublish() {
    setNotice(null)
    setPublishing(true)
    try {
      const next = await backend.updateEvent(event.id, { status: event.status === 'published' ? 'draft' : 'published' })
      setData({ ...data!, event: next })
      setNotice({ kind: 'ok', text: next.status === 'published' ? 'Invitation en ligne : vos invités peuvent ouvrir leur lien.' : 'Invitation retirée : les liens invités affichent désormais « introuvable ».' })
    } catch (err) {
      setNotice({ kind: 'error', text: err instanceof BackendError ? err.message : 'Action impossible. Réessayez.' })
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div>
      <Link to="/organizer" className="meta inline-flex min-h-10 items-center gap-3 hover:!text-pearl">
        <ArrowIcon dir="left" />
        Vos invitations
      </Link>
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="display break-words text-[clamp(2.6rem,6vw,4.75rem)]">
            {c.partnerOne || '—'} & {c.partnerTwo || '—'}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <StatusPill status={event.status} />
            <span className="meta">Offre {event.plan} · {event.guestLimit} invitations</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink to={`/organizer/events/${event.id}/preview`} variant="ghost" target="_blank">Prévisualiser</ButtonLink>
          <Button onClick={togglePublish} disabled={publishing || (event.status === 'draft' && !canPublish)} aria-busy={publishing} variant={event.status === 'published' ? 'ghost' : 'primary'}>
            {event.status === 'published' ? 'Retirer de la ligne' : 'Publier'}
          </Button>
        </div>
      </div>
      {event.status === 'draft' && !canPublish && (
        <p className="mt-4 text-[0.9375rem] text-pearl-mute">Pour publier, renseignez d’abord {[...new Set(missing)].join(' et ')} dans l’onglet Contenu.</p>
      )}
      {notice && (
        <p role={notice.kind === 'error' ? 'alert' : 'status'} className={cn('mt-6 rounded-[1rem] border p-4', notice.kind === 'error' ? 'border-danger/50 text-danger' : 'border-success/40 text-success')}>
          {notice.text}
        </p>
      )}

      <nav aria-label="Sections de l’invitation" className="mt-12 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <NavLink
            key={t.label}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              cn('relative min-h-12 whitespace-nowrap px-4 py-3 text-[0.9375rem] transition-colors', isActive ? 'text-pearl after:absolute after:inset-x-3 after:-bottom-px after:h-px after:bg-iris' : 'text-pearl-mute hover:text-pearl')
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <div className="pt-10">
        <Outlet context={{ data, reload, setData } satisfies EventOutlet} />
      </div>
    </div>
  )
}
