const PRINCIPLES = [
  { t: 'Une pièce, pas un modèle', d: 'Chaque invitation est une composition — typographie monumentale, lumière, matière. Rien ne ressemble à un faire-part en ligne.' },
  { t: 'Privée par construction', d: 'Chaque invité reçoit un lien personnel. La liste de vos proches n’est jamais publique, ni consultable par un autre invité.' },
  { t: 'Pensée pour l’iPhone', d: 'Vos invités l’ouvriront depuis un message. Tout y est fluide, rapide et lisible, même sur une connexion fragile.' },
]

export function Manifesto() {
  return (
    <section id="maison" className="relative scroll-mt-20 px-5 py-32 md:px-10 md:py-48" aria-labelledby="manifesto-title">
      <div className="mx-auto max-w-[1440px]">
        <h2 id="manifesto-title" className="display max-w-[16ch] text-[clamp(2.4rem,6vw,6rem)] leading-[0.98] md:ml-[16.66%]" data-reveal="mask-block">
          VOW. n’est pas un site de mariage. <span className="text-pearl-mute">C’est la première chose que vos invités verront de votre</span>{' '}
          <em>plus beau jour.</em>
        </h2>
        <div className="mt-24 grid gap-14 md:ml-[16.66%] md:grid-cols-3 md:gap-12">
          {PRINCIPLES.map((p) => (
            <div key={p.t}>
              <div className="h-px w-12 bg-chrome/60" aria-hidden="true" />
              <h3 className="display mt-6 text-[1.75rem] leading-tight">{p.t}</h3>
              <p className="mt-4 max-w-[34ch] text-pearl-dim">{p.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
