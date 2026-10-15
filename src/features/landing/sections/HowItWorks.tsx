// Numbering is kept here on purpose: it encodes a real sequence the reader follows.
const STEPS = [
  { t: 'Choisissez votre offre', d: 'Essential, Signature ou Couture. Paiement unique et sécurisé, sans abonnement.' },
  { t: 'Composez votre invitation', d: 'Depuis votre espace organisateur : prénoms, date, lieux, programme, récit et invités. Prévisualisez à chaque étape.' },
  { t: 'Publiez et suivez', d: 'Envoyez à chaque invité son lien personnel, puis suivez les réponses en temps réel.' },
]

export function HowItWorks() {
  return (
    <section id="fonctionnement" className="scroll-mt-20 px-5 py-32 md:px-10 md:py-44" aria-labelledby="how-title">
      <div className="mx-auto max-w-[1440px]">
        <h2 id="how-title" className="display text-[clamp(2.6rem,6.5vw,6rem)]" data-reveal="mask-block">
          Trois gestes. <em className="text-pearl-mute">Aucune contrainte.</em>
        </h2>
        <ol className="mt-20 grid gap-y-14 md:grid-cols-3 md:gap-x-12">
          {STEPS.map((s, i) => (
            <li key={s.t} className="md:even:mt-20 md:last:mt-40">
              <span className="display tnum block text-[6rem] leading-none text-transparent [-webkit-text-stroke:1px_var(--color-chrome)]" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="mt-6 text-xl font-normal">
                <span className="sr-only">Étape {i + 1} : </span>
                {s.t}
              </h3>
              <p className="mt-3 max-w-[36ch] text-pearl-dim">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
