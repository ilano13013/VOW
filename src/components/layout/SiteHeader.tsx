import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { cn } from '@/lib/cn'

const NAV = [
  { href: '/#maison', label: 'La Maison' },
  { href: '/demo', label: 'Démo' },
  { href: '/#offres', label: 'Offres' },
  { href: '/#faq', label: 'FAQ' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => setOpen(false), [location.pathname, location.hash])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-[background-color,border-color] duration-700 ease-[var(--ease-couture)]',
        'pt-[env(safe-area-inset-top)]',
        scrolled || open ? 'border-b border-line bg-obsidian/85 backdrop-blur-md' : 'border-b border-transparent',
      )}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-pearl focus:px-4 focus:py-2 focus:text-obsidian">
        Aller au contenu
      </a>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:h-20 md:px-10">
        <Link to="/" aria-label="VOW. — accueil" className="relative z-10">
          <Logo />
        </Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-9 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} to={n.href} className="meta !text-pearl-dim transition-colors hover:!text-pearl">
              {n.label}
            </Link>
          ))}
          <Link to="/organizer" className="meta !text-pearl-dim transition-colors hover:!text-pearl">
            Espace organisateur
          </Link>
          <Link
            to="/commander/signature"
            className="meta rounded-full border border-line-strong px-5 py-2.5 !text-pearl transition-colors hover:border-iris hover:!text-iris"
          >
            Commander
          </Link>
        </nav>
        <button
          ref={toggleRef}
          type="button"
          className="relative z-10 -mr-2 flex h-11 w-11 items-center justify-center md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-3 w-6" aria-hidden="true">
            <span className={cn('absolute left-0 top-0 h-px w-6 bg-pearl transition-transform duration-500', open && 'translate-y-1.5 rotate-45')} />
            <span className={cn('absolute bottom-0 left-0 h-px w-6 bg-pearl transition-transform duration-500', open && '-translate-y-1.5 -rotate-45')} />
          </span>
        </button>
      </div>
      <div
        id="mobile-menu"
        hidden={!open}
        className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-obsidian px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-8 md:hidden"
      >
        <nav aria-label="Navigation mobile" className="flex flex-col">
          {[...NAV, { href: '/organizer', label: 'Espace organisateur' }].map((n) => (
            <Link key={n.href} to={n.href} className="border-b border-line py-5">
              <span className="display text-4xl">{n.label}</span>
            </Link>
          ))}
        </nav>
        <Link to="/commander/signature" className="mt-10 flex min-h-12 items-center justify-center rounded-full bg-pearl text-[0.8125rem] font-medium uppercase tracking-[0.08em] text-obsidian">
          Commander une invitation
        </Link>
      </div>
    </header>
  )
}
