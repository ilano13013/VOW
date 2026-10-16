import { forwardRef, useEffect, useRef } from 'react'
import type { InvitationContent } from '../types'
import { formatDotDate, formatLongDate } from '../format'
import { isValidIso } from '../content'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/** Monumental names with pointer-driven depth (layers drift at different rates). */
export const InvitationHero = forwardRef<HTMLHeadingElement, { content: InvitationContent }>(function InvitationHero({ content }, ref) {
  const root = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = root.current
    if (!el || reduced) return
    let raf = 0
    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    const move = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2
      ty = (e.clientY / window.innerHeight - 0.5) * 2
    }
    const loop = () => {
      cx += (tx - cx) * 0.06
      cy += (ty - cy) * 0.06
      el.style.setProperty('--px', cx.toFixed(4))
      el.style.setProperty('--py', cy.toFixed(4))
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', move, { passive: true })
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  return (
    <div ref={root} className="relative flex min-h-[100svh] flex-col justify-end px-5 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-24 md:px-10 md:pb-14 [--px:0] [--py:0]">
      <div data-hero-beam className="pointer-events-none absolute inset-y-0 left-[-40%] w-[40%] -skew-x-12 bg-[linear-gradient(90deg,transparent,rgb(237_233_228/0.07),transparent)] opacity-0" aria-hidden="true" />
      <h1
        ref={ref}
        tabIndex={-1}
        className="display relative mx-auto w-full max-w-[1440px] text-[clamp(4.2rem,min(19vw,25svh),17rem)] outline-none"
        aria-label={`${content.partnerOne} et ${content.partnerTwo}`}
      >
        <span data-name className="block will-change-transform [transform:translate3d(calc(var(--px)*-14px),calc(var(--py)*-8px),0)]">
          {content.partnerOne}
        </span>
        <span data-name className="block pl-[22vw] text-[0.42em] italic leading-[1.1] text-chrome [transform:translate3d(calc(var(--px)*-6px),calc(var(--py)*-3px),0)] md:pl-[30vw]">
          &amp;
        </span>
        <span data-name className="block text-right will-change-transform [transform:translate3d(calc(var(--px)*-22px),calc(var(--py)*-12px),0)]">
          {content.partnerTwo}
        </span>
      </h1>
      <div data-hero-meta className="relative mx-auto mt-10 flex w-full max-w-[1440px] flex-col gap-2 border-t border-line pt-5 sm:flex-row sm:items-baseline sm:justify-between">
        <p className="tnum text-[1.0625rem] text-pearl">
          {isValidIso(content.dateIso) && (
            <>
              <time dateTime={content.dateIso}>{formatDotDate(content.dateIso)}</time>
              <span className="sr-only"> — {formatLongDate(content.dateIso)}</span>
            </>
          )}
        </p>
        <p className="meta">{content.locationLabel}</p>
      </div>
    </div>
  )
})
