import { Link, useParams } from 'react-router-dom'
import { ButtonLink } from '@/components/ui/Button'
import { PLANS, formatPrice, getPlan } from '@/features/pricing/plans'
import { cn } from '@/lib/cn'
import NotFoundPage from '@/app/NotFoundPage'

export default function OrderPage() {
  const { plan: planId } = useParams()
  const plan = getPlan(planId)
  if (!plan) return <NotFoundPage />

  return (
    <section className="px-5 pb-32 pt-32 md:px-10 md:pt-44" aria-labelledby="order-title">
      <div className="mx-auto grid max-w-[1200px] gap-16 md:grid-cols-12">
        <div className="md:col-span-6">
          <h1 id="order-title" className="display text-[clamp(3rem,8vw,6rem)]">
            Offre <em>{plan.name}</em>
          </h1>
          <p className="mt-6 text-pearl-dim">{plan.tagline}</p>
          <p className="display tnum mt-10 text-[4.5rem] leading-none">{formatPrice(plan.priceEur)}</p>
          <p className="meta mt-3">Paiement unique · TTC</p>
          <ul className="mt-10 space-y-3 text-pearl-dim">
            {plan.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <div className="rounded-[1.5rem] border border-line-strong p-8" role="status">
            <h2 className="display text-[2rem] leading-tight">Le paiement en ligne n’est pas encore ouvert.</h2>
            <p className="mt-4 text-pearl-dim">
              Cette version de VOW. présente l’expérience. Le paiement sécurisé par Stripe sera activé dans la prochaine étape. Aucun paiement n’est demandé ni enregistré pour l’instant.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <ButtonLink to="/demo" arrow>Découvrir la démo</ButtonLink>
              <ButtonLink to="/#offres" variant="ghost">Comparer les offres</ButtonLink>
            </div>
          </div>
          <nav aria-label="Autres offres" className="mt-10 flex gap-6">
            {PLANS.map((p) => (
              <Link key={p.id} to={`/commander/${p.id}`} aria-current={p.id === plan.id ? 'page' : undefined} className={cn('meta hover:!text-pearl', p.id === plan.id && '!text-iris')}>
                {p.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  )
}
