import { useEffect, useRef, useState } from 'react'
import { Plate } from '@/components/ui/Plate'
import { cn } from '@/lib/cn'
import { ArrowIcon } from '@/components/ui/Icon'
import type { Memory } from '../types'

const SHAPE: Record<Memory['shape'], string> = {
  tall: 'aspect-[3/4]',
  wide: 'aspect-[4/3]',
  square: 'aspect-square',
}

export function MemoriesSection({ memories, isDemo }: { memories: Memory[]; isDemo?: boolean }) {
  const [index, setIndex] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (index !== null && !d.open) d.showModal?.()
    if (index === null && d.open) d.close()
  }, [index])

  if (!memories.length) return null
  const current = index !== null ? memories[index] : null
  const go = (delta: number) => setIndex((i) => (i === null ? i : (i + delta + memories.length) % memories.length))

  return (
    <section id="memories" className="scroll-mt-10 px-5 py-32 md:px-10 md:py-48" aria-labelledby="memories-title">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 id="memories-title" className="display text-[clamp(3.2rem,10vw,9rem)]" data-reveal="mask-block">
            Memories
          </h2>
          {isDemo && <p className="meta max-w-[34ch] md:pb-6 md:text-right">Galerie de démonstration — rendus de la sculpture, sans photos réelles</p>}
        </div>
        <ul className="mt-20 columns-2 gap-3 md:columns-3 md:gap-6">
          {memories.map((m, i) => (
            <li key={m.title} className="mb-3 break-inside-avoid md:mb-6">
              <button
                type="button"
                className="group block w-full text-left"
                onClick={(e) => {
                  opener.current = e.currentTarget
                  setIndex(i)
                }}
                aria-label={`Agrandir : ${m.title}`}
              >
                <span className={cn('block overflow-hidden rounded-[1rem] border border-chrome/20', SHAPE[m.shape])}>
                  <span className="block h-full w-full transition-transform duration-[1200ms] ease-[var(--ease-couture)] group-hover:scale-[1.04]">
                    <Plate seed={m.art} />
                  </span>
                </span>
                <span className="mt-3 block text-[0.9375rem] text-pearl">{m.title}</span>
                <span className="block text-[0.875rem] text-pearl-mute">{m.caption}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <dialog
        ref={dialog}
        aria-labelledby="memory-title"
        className="m-auto w-[min(92vw,960px)] max-w-none bg-transparent p-0 text-pearl backdrop:bg-obsidian/92 backdrop:backdrop-blur-sm"
        onClose={() => {
          setIndex(null)
          opener.current?.focus()
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(1)
          if (e.key === 'ArrowLeft') go(-1)
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIndex(null)
        }}
      >
        {current && (
          <figure>
            <div className="max-h-[70vh] overflow-hidden rounded-[1.25rem]">
              <div className={cn('mx-auto max-h-[70vh]', SHAPE[current.shape], current.shape === 'tall' ? 'w-[min(100%,52vh)]' : 'w-full')}>
                <Plate seed={current.art} label={`Rendu de la sculpture VOW. : ${current.title}`} />
              </div>
            </div>
            <figcaption className="mt-5 flex flex-wrap items-baseline justify-between gap-4">
              <span>
                <span id="memory-title" className="display block text-[1.8rem]">{current.title}</span>
                <span className="text-pearl-dim">{current.caption}</span>
              </span>
              <span className="flex gap-2">
                <button type="button" onClick={() => go(-1)} className="min-h-11 rounded-full border border-line-strong px-5 hover:border-iris" aria-label="Souvenir précédent"><ArrowIcon dir="left" /></button>
                <button type="button" onClick={() => go(1)} className="min-h-11 rounded-full border border-line-strong px-5 hover:border-iris" aria-label="Souvenir suivant"><ArrowIcon /></button>
                <button type="button" onClick={() => setIndex(null)} className="min-h-11 rounded-full bg-pearl px-5 text-obsidian" autoFocus>
                  Fermer
                </button>
              </span>
            </figcaption>
          </figure>
        )}
      </dialog>
    </section>
  )
}
