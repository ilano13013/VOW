export type PlanId = 'essential' | 'signature' | 'couture'

export interface Plan {
  id: PlanId
  name: string
  priceEur: number
  tagline: string
  guestLimit: number
  features: string[]
  highlighted?: boolean
}

/** Single source of truth for offers. Server-side prices live in Stripe; amounts must match. */
export const PLANS: readonly Plan[] = [
  {
    id: 'essential',
    name: 'Essential',
    priceEur: 49,
    tagline: "L'essentiel, sublimé.",
    guestLimit: 80,
    features: [
      'Invitation immersive avec sculpture 3D',
      "Séquence d'ouverture animée",
      'Programme, lieux et compte à rebours',
      "Jusqu'à 80 invitations individuelles",
      'RSVP privé et tableau de bord',
      'En ligne 12 mois',
    ],
  },
  {
    id: 'signature',
    name: 'Signature',
    priceEur: 99,
    tagline: 'Votre histoire, mise en scène.',
    guestLimit: 200,
    highlighted: true,
    features: [
      'Tout Essential',
      'Chapitres « Our Story »',
      'Galerie « Memories »',
      "Jusqu'à 200 invitations individuelles",
      'Export CSV des réponses',
      'En ligne 18 mois',
    ],
  },
  {
    id: 'couture',
    name: 'Couture',
    priceEur: 179,
    tagline: 'Une pièce unique.',
    guestLimit: 500,
    features: [
      'Tout Signature',
      'Palette et sculpture personnalisées par notre studio',
      "Jusqu'à 500 invitations individuelles",
      'Accompagnement éditorial (textes & mise en page)',
      'Support prioritaire',
      'En ligne 24 mois',
    ],
  },
] as const

export function getPlan(id: string | undefined): Plan | undefined {
  return PLANS.find((p) => p.id === id)
}

export function formatPrice(eur: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(eur)
}
