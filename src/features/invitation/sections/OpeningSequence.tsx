import { useEffect, useRef } from 'react'
import { DemoBadge } from '@/components/ui/DemoBadge'

interface Props {
  line: string
  isDemo?: boolean
  onOpen: () => void
  opening: boolean
}

/** Full-screen gate over the hero. The sculpture behind it is the hero's own scene. */
export function OpeningSequence({ line, isDemo, onOpen, opening }: Props) {
  const btn = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    btn.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div
      data-opening
      role="region"
      aria-label="Ouverture de l’invitation"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between px-6 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] text-center"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgb(11_11_18/0.85)_75%)]" aria-hidden="true" />
      <div className="relative" data-opening-fade>
        {isDemo && <DemoBadge />}
      </div>
      <div className="relative flex flex-col items-center" data-opening-fade>
        <p className="display max-w-[14ch] text-[clamp(2.1rem,6.5vw,4.6rem)] italic leading-[1.02]">{line}</p>
        <button
          ref={btn}
          type="button"
          onClick={onOpen}
          disabled={opening}
          className="group mt-12 inline-flex min-h-14 items-center gap-4 rounded-full border border-pearl/40 px-8 text-[0.8125rem] font-medium uppercase tracking-[0.2em] text-pearl transition-[background-color,color,border-color] duration-700 ease-[var(--ease-couture)] hover:border-pearl hover:bg-pearl hover:text-obsidian"
        >
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inset-0 animate-ping rounded-full bg-iris opacity-60" />
            <span className="relative h-2 w-2 rounded-full bg-iris" />
          </span>
          Open the invitation
        </button>
      </div>
      <p className="meta relative !text-pearl-mute" data-opening-fade>
        Invitation créée avec VOW.
      </p>
    </div>
  )
}
