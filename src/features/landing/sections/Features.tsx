import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { ArtPlate } from '@/components/ui/ArtPlate'
import { cn } from '@/lib/cn'

interface Feature {
  title: string
  text: string
  detail: string
  art: number
  soon?: boolean
}

const FEATURES: Feature[] = [
  {
    title: 'Sculpture vivante',
    text: 'Une forme de verre et de chrome, calculée en temps réel, qui répond au doigt de vos invités.',
    detail: 'Rendu WebGL optimisé pour iPhone, avec repli élégant sans WebGL et respect du mode « réduire les animations ».',
    art: 3,
  },
  {
    title: 'Séquence d’ouverture',
    text: 'L’écrin s’ouvre : la lumière traverse la sculpture et vos prénoms apparaissent en majesté.',
    detail: 'Une chorégraphie unique, pensée comme le premier instant de votre journée.',
    art: 11,
  },
  {
    title: 'RSVP individuel',
    text: 'Un lien personnel par invité : présence, accompagnants autorisés, régimes alimentaires, message.',
    detail: 'Jetons sécurisés, validation côté serveur, protection contre les envois abusifs. La liste des invités n’est jamais publique.',
    art: 17,
  },
  {
    title: 'Espace organisateur',
    text: 'Vos invités, leurs réponses et vos statistiques, en un regard.',
    detail: 'Édition des informations, prévisualisation, publication et dépublication à tout moment.',
    art: 23,
  },
  {
    title: 'Programme & lieux',
    text: 'Compte à rebours, cérémonie, réception, déroulé de la journée et informations pratiques.',
    detail: 'Liens d’itinéraire vers vos lieux, ouverts dans l’application de cartes de l’invité.',
    art: 29,
  },
  {
    title: 'Memories',
    text: 'Une galerie pour vos images, composée comme une exposition.',
    detail: 'Galerie disponible. L’envoi de photos par vos invités arrive dans une prochaine version.',
    art: 31,
    soon: true,
  },
]

export function Features() {
  const [active, setActive] = useState(0)
  const tabs = useRef<Array<HTMLButtonElement | null>>([])
  const base = useId()

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = FEATURES.length - 1
    const next = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? (i === last ? 0 : i + 1)
      : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? (i === 0 ? last : i - 1)
      : e.key === 'Home' ? 0 : e.key === 'End' ? last : null
    if (next === null) return
    e.preventDefault()
    setActive(next)
    tabs.current[next]?.focus()
  }

  const f = FEATURES[active]

  return (
    <section id="fonctionnalites" className="scroll-mt-20 border-t border-line px-5 py-32 md:px-10 md:py-44" aria-labelledby="features-title">
      <div className="mx-auto max-w-[1440px]">
        <h2 id="features-title" className="display max-w-[14ch] text-[clamp(2.6rem,6vw,6rem)]" data-reveal="mask-block">
          Tout ce qu’une invitation <em className="text-iris">devrait faire.</em>
        </h2>

        {/* Mobile: readable list. Desktop: index + plate. */}
        <ul className="mt-16 divide-y divide-line border-y border-line md:hidden">
          {FEATURES.map((x) => (
            <li key={x.title} className="py-7">
              <h3 className="display text-[2rem] leading-tight">
                {x.title}
                {x.soon && <SoonTag />}
              </h3>
              <p className="mt-3 text-pearl-dim">{x.text}</p>
              <p className="mt-2 text-[0.9375rem] text-pearl-mute">{x.detail}</p>
            </li>
          ))}
        </ul>

        <div className="mt-20 hidden grid-cols-12 gap-10 md:grid">
          <div role="tablist" aria-orientation="vertical" aria-label="Fonctionnalités" className="col-span-6 flex flex-col">
            {FEATURES.map((x, i) => (
              <button
                key={x.title}
                ref={(el) => {
                  tabs.current[i] = el
                }}
                role="tab"
                id={`${base}-tab-${i}`}
                aria-selected={i === active}
                aria-controls={`${base}-panel`}
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                onKeyDown={(e) => onKey(e, i)}
                className={cn(
                  'display group flex items-baseline justify-between border-b border-line py-4 text-left text-[clamp(2rem,3.4vw,3.4rem)] leading-none transition-colors duration-500',
                  i === active ? 'text-pearl' : 'text-pearl-mute hover:text-pearl-dim',
                )}
              >
                <span>
                  {x.title}
                  {x.soon && <SoonTag />}
                </span>
                <span aria-hidden="true" className={cn('h-2 w-2 rounded-full bg-iris transition-opacity duration-500', i === active ? 'opacity-100' : 'opacity-0')} />
              </button>
            ))}
          </div>
          <div id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-tab-${active}`} className="col-span-5 col-start-8 self-start">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem]">
              {FEATURES.map((x, i) => (
                <div key={x.title} className={cn('absolute inset-0 transition-[opacity,transform] duration-[900ms] ease-[var(--ease-couture)]', i === active ? 'scale-100 opacity-100' : 'scale-[1.04] opacity-0')} aria-hidden="true">
                  <ArtPlate seed={x.art} />
                </div>
              ))}
            </div>
            <p className="mt-8 text-[1.1875rem] text-pearl">{f.text}</p>
            <p className="mt-3 text-pearl-dim">{f.detail}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function SoonTag() {
  return <span className="meta ml-3 inline-block translate-y-[-0.4em] rounded-full border border-line-strong px-2.5 py-1 align-middle !text-[0.625rem]">Bientôt</span>
}
