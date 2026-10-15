import { useLayoutEffect, type RefObject } from 'react'
import { ensureGsap } from '@/lib/motion'
import { prefersReducedMotion } from '@/lib/device'

/**
 * One scroll grammar for the whole site: large headlines (`data-reveal="mask-block"`)
 * rise and sharpen as they enter the viewport. Everything else stays still.
 * Content is fully visible without JS or with reduced motion.
 */
export function useScrollReveal(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useLayoutEffect(() => {
    const root = scope.current
    if (!root || prefersReducedMotion()) return
    const { gsap, ScrollTrigger } = ensureGsap()
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>('[data-reveal="mask-block"]').forEach((el) => {
        // Starts from a still-legible state: if the trigger never fires, the headline is readable.
        gsap.from(el, {
          opacity: 0.3,
          y: 32,
          filter: 'blur(6px)',
          duration: 1.6,
          ease: 'expo.out',
          clearProps: 'opacity,filter,transform',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })
    }, root)
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {})
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
