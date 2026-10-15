import { Plate } from '@/components/ui/Plate'
import { cn } from '@/lib/cn'
import type { StoryMoment } from '../types'

export function StorySection({ story, isDemo }: { story: StoryMoment[]; isDemo?: boolean }) {
  if (!story.length) return null
  return (
    <section id="story" className="scroll-mt-10 px-5 py-32 md:px-10 md:py-48" aria-labelledby="story-title">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 id="story-title" className="display text-[clamp(3.2rem,10vw,9rem)]" data-reveal="mask-block">
            Our <em>Story</em>
          </h2>
          {isDemo && <p className="meta md:pb-6">Récit fictif de démonstration</p>}
        </div>
        <ol className="mt-24 space-y-32 md:space-y-48">
          {story.map((m, i) => {
            const flip = i % 2 === 1
            return (
              <li key={m.year + m.title} className="grid items-center gap-10 md:grid-cols-12">
                <div className={cn('relative md:col-span-6', flip ? 'md:col-start-7' : 'md:col-start-1', i % 3 === 2 && 'md:col-span-5')}>
                  <div className={cn('overflow-hidden rounded-[1.25rem] border border-chrome/20', flip ? 'aspect-[4/5]' : 'aspect-[5/4]')}>
                    <Plate seed={m.art} label={isDemo ? `Rendu de la sculpture VOW. illustrant « ${m.title} »` : undefined} />
                  </div>
                  <span
                    className={cn(
                      'display tnum pointer-events-none absolute -bottom-10 text-[clamp(4.5rem,12vw,9rem)] leading-none text-transparent [-webkit-text-stroke:1px_var(--color-chrome)]',
                      flip ? 'left-3 md:-left-16' : 'right-3 md:-right-16',
                    )}
                    aria-hidden="true"
                  >
                    {m.year}
                  </span>
                </div>
                <div className={cn('mt-8 md:col-span-4 md:mt-0', flip ? 'md:col-start-2 md:row-start-1' : 'md:col-start-8')}>
                  <h3 className="display text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.02]">{m.title}</h3>
                  <p className="mt-6 max-w-[40ch] text-pearl-dim">{m.text}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
