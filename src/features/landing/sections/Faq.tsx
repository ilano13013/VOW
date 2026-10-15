const QUESTIONS = [
  {
    q: 'Mes invités doivent-ils installer une application ?',
    a: 'Non. L’invitation s’ouvre dans le navigateur de leur téléphone ou de leur ordinateur, depuis le lien personnel que vous leur envoyez.',
  },
  {
    q: 'Comment fonctionnent les liens personnels ?',
    a: 'Chaque invité reçoit un lien unique contenant un jeton sécurisé. Il ne voit que sa propre invitation et ne peut répondre que pour lui et le nombre d’accompagnants que vous avez autorisé. La liste des invités n’est jamais publique.',
  },
  {
    q: 'Et si le téléphone de mon invité est ancien ?',
    a: 'L’expérience s’adapte : sans WebGL, ou avec le mode « réduire les animations » activé, une version élégante et allégée s’affiche, avec toutes les informations et le RSVP.',
  },
  {
    q: 'Puis-je modifier mon invitation après l’avoir publiée ?',
    a: 'Oui. Toute modification enregistrée depuis votre espace organisateur est visible immédiatement. Vous pouvez aussi dépublier l’invitation à tout moment.',
  },
  {
    q: 'Comment se passe le paiement ?',
    a: 'Le paiement unique est opéré par Stripe. Votre commande n’est validée qu’après confirmation du paiement par Stripe à nos serveurs. VOW. ne voit ni ne stocke jamais vos coordonnées bancaires.',
  },
  {
    q: 'Que comprend l’accompagnement Couture ?',
    a: 'Notre studio adapte la palette et la forme de la sculpture à votre univers, et vous accompagne sur les textes et la mise en page. Nous vous contactons après la commande pour démarrer.',
  },
  {
    q: 'Où sont stockées mes données ?',
    a: 'Dans une base de données sécurisée, avec un accès strictement cloisonné : vous seuls voyez la liste de vos invités, et chaque invité n’accède qu’à sa propre réponse.',
  },
]

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 px-5 py-32 md:px-10 md:py-44" aria-labelledby="faq-title">
      <div className="mx-auto grid max-w-[1440px] gap-16 md:grid-cols-12">
        <h2 id="faq-title" className="display text-[clamp(2.6rem,5vw,5rem)] md:col-span-4" data-reveal="mask-block">
          Questions <em>fréquentes</em>
        </h2>
        <div className="divide-y divide-line border-y border-line md:col-span-7 md:col-start-6">
          {QUESTIONS.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-[1.125rem] text-pearl transition-colors hover:text-iris [&::-webkit-details-marker]:hidden">
                {item.q}
                <span aria-hidden="true" className="relative h-3 w-3 shrink-0">
                  <span className="absolute left-0 top-1/2 h-px w-3 bg-current" />
                  <span className="absolute left-1/2 top-0 h-3 w-px bg-current transition-transform duration-500 group-open:rotate-90 group-open:scale-y-0" />
                </span>
              </summary>
              <p className="max-w-[62ch] pb-7 text-pearl-dim">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
