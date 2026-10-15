import { ButtonLink } from '@/components/ui/Button'
import { PLANS, formatPrice } from '@/features/pricing/plans'
import { cn } from '@/lib/cn'

export function Pricing() {
  return (
    <section id="offres" className="scroll-mt-20 bg-obsidian-2 px-5 py-32 md:px-10 md:py-44" aria-labelledby="pricing-title">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <h2 id="pricing-title" className="display text-[clamp(2.6rem,6vw,6rem)] md:col-span-7" data-reveal="mask-block">
            Trois offres. <em className="text-iris">Un seul paiement.</em>
          </h2>
          <p className="text-pearl-dim md:col-span-4 md:col-start-9">
            Pas d’abonnement, pas de frais cachés. Votre invitation reste en ligne pendant toute la durée de l’offre choisie.
          </p>
        </div>
        <div className="mt-20 grid gap-4 md:grid-cols-3 md:gap-0">
          {PLANS.map((p) => (
            <article
              key={p.id}
              aria-labelledby={`plan-${p.id}`}
              className={cn(
                'relative flex flex-col rounded-[1.5rem] p-8 md:rounded-none md:p-10',
                p.highlighted ? 'bg-obsidian-3 ring-1 ring-iris/40 md:-my-6 md:rounded-[1.5rem] md:py-16' : 'border border-line md:border-0 md:border-l md:first:border-l-0',
              )}
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 id={`plan-${p.id}`} className="display text-[2.4rem] leading-none">{p.name}</h3>
                {p.highlighted && <span className="meta !text-iris">Recommandée</span>}
              </div>
              <p className="mt-3 text-pearl-dim">{p.tagline}</p>
              <p className="display tnum mt-10 text-[4.5rem] leading-none">
                {formatPrice(p.priceEur)}
              </p>
              <p className="meta mt-3">Paiement unique · TTC</p>
              <ul className="mt-10 flex-1 space-y-3.5 text-[0.9875rem]">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <svg className="mt-[0.45em] shrink-0" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                      <path d="M1 5.5 4 8.5 9 1.5" fill="none" stroke="var(--color-iris)" strokeWidth="1.3" />
                    </svg>
                    <span className="text-pearl-dim">{f}</span>
                  </li>
                ))}
              </ul>
              <ButtonLink to={`/commander/${p.id}`} variant={p.highlighted ? 'primary' : 'ghost'} arrow className="mt-12 w-full" aria-label={`Commander l’offre ${p.name}, ${formatPrice(p.priceEur)}`}>
                Commander
              </ButtonLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
