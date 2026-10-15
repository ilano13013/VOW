import { useLayoutEffect, useMemo, useRef } from 'react'
import { SculptureStage } from '@/components/three/SculptureStage'
import { createSceneController } from '@/components/three/controller'
import { ButtonLink } from '@/components/ui/Button'
import { ensureGsap } from '@/lib/motion'
import { prefersReducedMotion } from '@/lib/device'

export function Hero() {
  const controller = useMemo(() => createSceneController(), [])
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const { gsap } = ensureGsap()
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from('[data-hero-line]', { yPercent: 110, duration: 1.6, stagger: 0.12 }, 0.15)
        .from('[data-hero-fade]', { opacity: 0, y: 14, duration: 1.2, stagger: 0.08 }, 0.75)
        .fromTo(controller, { open: 0.9 }, { open: 0, duration: 2.6, ease: 'power3.out' }, 0)
      gsap.to(controller, {
        scroll: 1,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      })
    }, el)
    return () => ctx.revert()
  }, [controller])

  return (
    <section ref={root} className="grain relative flex min-h-[100svh] flex-col overflow-hidden" aria-labelledby="hero-title">
      <div className="absolute inset-0 md:left-[30%]">
        <SculptureStage controller={controller} offsetY={0.38} scale={0.95} portraitLift defer={false} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[64%] bg-gradient-to-t from-obsidian via-obsidian/90 to-transparent md:h-[40%]" aria-hidden="true" />

      <p data-hero-fade className="meta pointer-events-none absolute right-10 top-24 hidden !text-pearl-mute md:block" aria-hidden="true">
        Faites glisser la sculpture
      </p>

      <div className="relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-end px-5 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-28 md:px-10 md:pb-16">
        <h1 id="hero-title" className="display text-[clamp(3.3rem,min(12.5vw,18svh),12rem)]">
          <span className="block overflow-hidden pb-[0.06em]">
            <span data-hero-line className="block">Your moment.</span>
          </span>
          <span className="block overflow-hidden pb-[0.1em] md:pl-[6vw] lg:whitespace-nowrap">
            <span data-hero-line className="block italic">Another dimension.</span>
          </span>
        </h1>
        <div className="mt-8 grid gap-8 md:mt-12 md:grid-cols-[minmax(0,30rem)_auto] md:items-end md:justify-between">
          <p data-hero-fade className="text-pearl-dim">
            VOW. compose des invitations de mariage comme des œuvres d’art numériques : une sculpture de verre vivante, votre histoire mise en scène, et un RSVP privé pour chaque invité.
          </p>
          <div data-hero-fade className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/demo" arrow>Ouvrir l’invitation démo</ButtonLink>
            <ButtonLink to="/#offres" variant="ghost">Voir les offres</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}
