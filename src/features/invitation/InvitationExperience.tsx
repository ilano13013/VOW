import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { SculptureStage } from '@/components/three/SculptureStage'
import { createSceneController } from '@/components/three/controller'
import { ensureGsap } from '@/lib/motion'
import { prefersReducedMotion } from '@/lib/device'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import type { InvitationContent } from './types'
import { OpeningSequence } from './sections/OpeningSequence'
import { InvitationHero } from './sections/InvitationHero'
import { StorySection } from './sections/StorySection'
import { DaySection } from './sections/DaySection'
import { MemoriesSection } from './sections/MemoriesSection'
import { InvitationFooter } from './sections/InvitationFooter'

type Phase = 'closed' | 'opening' | 'open'

interface Props {
  content: InvitationContent
  /** RSVP block (teaser in Phase A, real form once a guest token is present). */
  rsvp?: ReactNode
  /** Skip the opening gate (organizer preview, deep links). */
  startOpen?: boolean
}

export function InvitationExperience({ content, rsvp, startOpen = false }: Props) {
  const controller = useMemo(() => createSceneController(), [])
  const [phase, setPhase] = useState<Phase>(startOpen ? 'open' : 'closed')
  const root = useRef<HTMLDivElement>(null)
  const flash = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)

  useScrollReveal(root, [phase === 'open'])

  // Lock scrolling while the gate is closed.
  useEffect(() => {
    if (phase === 'open') return
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    window.scrollTo(0, 0)
    return () => {
      html.style.overflow = prev
    }
  }, [phase])

  // Hide names until the reveal (only when the gate is shown and motion is allowed).
  useLayoutEffect(() => {
    if (startOpen || prefersReducedMotion() || !root.current) return
    const { gsap } = ensureGsap()
    gsap.set(root.current.querySelectorAll('[data-name], [data-hero-meta]'), { opacity: 0 })
  }, [startOpen])

  const open = useCallback(() => {
    if (phase !== 'closed') return
    const el = root.current
    const finish = () => {
      setPhase('open')
      requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }))
    }
    if (!el || prefersReducedMotion()) {
      finish()
      return
    }
    setPhase('opening')
    const { gsap } = ensureGsap()
    const names = el.querySelectorAll('[data-name]')
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    tl.to('[data-opening-fade]', { opacity: 0, y: -16, filter: 'blur(8px)', duration: 0.7, stagger: 0.05, ease: 'power2.in' }, 0)
      .to(controller, { open: 1, duration: 1.15, ease: 'power2.in' }, 0)
      .to(flash.current, { opacity: 0.92, duration: 0.32, ease: 'power2.in' }, 0.85)
      .add(finish, 1.17)
      .to(flash.current, { opacity: 0, duration: 1.6, ease: 'power2.out' }, 1.2)
      .to(controller, { open: 0.12, duration: 2.4 }, 1.2)
      .fromTo(
        names,
        { opacity: 0, scale: 1.18, filter: 'blur(22px)', yPercent: 12 },
        { opacity: 1, scale: 1, filter: 'blur(0px)', yPercent: 0, duration: 2.1, stagger: 0.14, clearProps: 'filter,scale' },
        1.25,
      )
      .to('[data-hero-meta]', { opacity: 1, duration: 1.2 }, 2.1)
      .fromTo('[data-hero-beam]', { opacity: 1, xPercent: 0 }, { xPercent: 420, duration: 2.2, ease: 'power2.inOut' }, 1.9)
  }, [phase, controller])

  const names = `${content.partnerOne} & ${content.partnerTwo}`
  const gated = phase !== 'open'

  return (
    <div ref={root} className="relative">
      <section className="grain relative overflow-hidden" aria-label={names}>
        <div className="absolute inset-0">
          <SculptureStage controller={controller} offsetY={0.25} scale={1.05} defer={false} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-obsidian to-transparent" aria-hidden="true" />
        <div inert={gated || undefined}>
          <InvitationHero ref={heading} content={content} />
        </div>
      </section>

      <div inert={gated || undefined}>
        <StorySection story={content.story} isDemo={content.isDemo} />
        <DaySection content={content} />
        {rsvp}
        <MemoriesSection memories={content.memories} isDemo={content.isDemo} />
        <InvitationFooter isDemo={content.isDemo} names={names} />
      </div>

      {gated && <OpeningSequence line={content.openingLine} isDemo={content.isDemo} onOpen={open} opening={phase === 'opening'} />}
      <div
        ref={flash}
        className="pointer-events-none fixed inset-0 z-[60] bg-[radial-gradient(circle_at_50%_45%,#EDE9E4_0%,#C4B5FD_38%,rgb(11_11_18/0)_75%)] opacity-0"
        aria-hidden="true"
      />
    </div>
  )
}
