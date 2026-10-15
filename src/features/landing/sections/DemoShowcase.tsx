import { ButtonLink } from '@/components/ui/Button'
import { DemoBadge } from '@/components/ui/DemoBadge'

const SPECS = [
  ['Couple', 'Camille & Gabriel'],
  ['Date', '18 juillet 2027'],
  ['Lieu', 'Provence, France'],
  ['Chapitres', 'Ouverture, Our Story, The Day, RSVP, Memories'],
]

export function DemoShowcase() {
  return (
    <section id="demo" className="relative scroll-mt-20 overflow-hidden bg-obsidian-2 px-5 py-28 md:px-10 md:py-40" aria-labelledby="demo-title">
      <div className="mx-auto grid max-w-[1440px] items-center gap-16 md:grid-cols-12">
        <div className="relative mx-auto w-full max-w-[320px] md:col-span-4 md:col-start-2">
          <div className="relative aspect-[393/852] overflow-hidden rounded-[2.6rem] border border-chrome/30 bg-obsidian p-2 shadow-[0_50px_100px_-40px_rgb(0_0_0/0.9)]">
            <div className="relative h-full overflow-hidden rounded-[2.1rem]">
              <img
                src={`${import.meta.env.BASE_URL}plates/demo-phone.webp`}
                width={720}
                height={1558}
                loading="lazy"
                decoding="async"
                alt="Capture de l’invitation démo de Camille et Gabriel sur iPhone, après l’ouverture"
                className="block h-auto w-full"
              />
              <div className="absolute inset-x-0 top-0 flex justify-center pt-3" aria-hidden="true">
                <span className="h-6 w-24 rounded-full bg-obsidian" />
              </div>
            </div>
          </div>
        </div>
        <div className="md:col-span-5 md:col-start-7">
          <h2 id="demo-title" className="display text-[clamp(2.6rem,5.6vw,5.5rem)]" data-reveal="mask-block">
            Une invitation s’ouvre <em>comme un écrin.</em>
          </h2>
          <p className="mt-8 max-w-[44ch] text-pearl-dim">
            Écran noir, sculpture de verre en lévitation, particules de lumière. Puis l’ouverture — et vos prénoms apparaissent en majesté. Découvrez l’expérience complète, telle que la recevront vos invités.
          </p>
          <dl className="mt-10 divide-y divide-line border-y border-line">
            {SPECS.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-3.5">
                <dt className="meta self-center">{k}</dt>
                <dd className="text-right text-pearl">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 flex flex-col items-start gap-6">
            <ButtonLink to="/demo" arrow className="whitespace-nowrap">Vivre la démonstration</ButtonLink>
            <DemoBadge className="whitespace-nowrap" />
          </div>
        </div>
      </div>
    </section>
  )
}
