import type { InvitationContent } from '@/features/invitation/types'

/**
 * FICTIONAL DEMONSTRATION CONTENT.
 * Camille & Gabriel do not exist. Venues are invented and deliberately carry no street address.
 */
export const DEMO_SLUG = 'camille-gabriel'

export const demoInvitation: InvitationContent = {
  isDemo: true,
  partnerOne: 'Camille',
  partnerTwo: 'Gabriel',
  dateIso: '2027-07-18T16:00:00+02:00',
  locationLabel: 'Provence, France',
  openingLine: 'Some moments deserve another dimension.',
  intro:
    "Sous la lumière dorée de juillet, entre lavandes et pierres blondes, nous vous invitons à partager le jour où nos deux histoires n'en feront plus qu'une.",
  story: [
    {
      year: '2019',
      title: 'Le premier regard',
      text: "Une galerie d'art contemporain à Marseille, une installation de verre soufflé, et deux inconnus qui s'arrêtent devant la même pièce au même moment.",
      art: 3,
    },
    {
      year: '2021',
      title: 'Lisbonne, en hiver',
      text: "Un voyage improvisé, des azulejos à perte de vue et la certitude tranquille que chaque route serait désormais partagée.",
      art: 11,
    },
    {
      year: '2024',
      title: 'Un atelier à deux',
      text: "Elle dessine des bijoux, il compose des lumières. Ils ouvrent ensemble un petit atelier où leurs deux métiers se répondent.",
      art: 17,
    },
    {
      year: '2026',
      title: 'La question',
      text: "Au sommet d'une colline du Luberon, au lever du soleil, une bague de verre et de platine dessinée par Camille elle-même. Gabriel a dit oui le premier.",
      art: 23,
    },
  ],
  ceremony: {
    label: 'Cérémonie',
    name: 'La Chapelle des Lumières',
    time: '16:00',
    description: 'Cérémonie laïque en plein air, au cœur des oliviers centenaires.',
    mapsQuery: 'Luberon, Provence, France',
  },
  reception: {
    label: 'Réception',
    name: 'Le Domaine des Iris',
    time: '19:00',
    description: 'Dîner sous les étoiles, puis la nuit sera longue.',
    mapsQuery: 'Luberon, Provence, France',
  },
  schedule: [
    { time: '15:30', title: 'Accueil des invités', detail: 'Rafraîchissements à la lavande' },
    { time: '16:00', title: 'Cérémonie', detail: 'Sous les oliviers' },
    { time: '17:30', title: 'Cocktail', detail: 'Terrasse du domaine' },
    { time: '19:30', title: 'Dîner', detail: 'Grande table sous les étoiles' },
    { time: '22:30', title: 'Première danse & soirée', detail: "Jusqu'à l'aube" },
    { time: 'J+1 · 11:00', title: 'Brunch', detail: 'Pour celles et ceux qui restent' },
  ],
  practical: [
    { title: 'Dress code', text: 'Élégance estivale. Les tons clairs et nacrés sont les bienvenus ; prévoyez des chaussures adaptées au gravier.' },
    { title: 'Hébergement', text: 'Une sélection de maisons d’hôtes partenaires sera communiquée aux invités ayant confirmé leur présence.' },
    { title: 'Transport', text: 'Navettes depuis la gare TGV la plus proche à 14:30, retour à 01:00 et 03:00.' },
    { title: 'Enfants', text: 'Un espace dédié avec animatrices accueillera les enfants pendant le dîner.' },
  ],
  memories: [
    { title: 'Atelier, été 2024', caption: 'Les premières esquisses de la bague.', art: 5, shape: 'tall' },
    { title: 'Lisbonne', caption: 'Le tram 28, à la tombée du jour.', art: 13, shape: 'wide' },
    { title: 'Marseille', caption: 'La galerie où tout a commencé.', art: 7, shape: 'square' },
    { title: 'Luberon', caption: 'Le matin de la demande.', art: 29, shape: 'square' },
    { title: 'Arles', caption: 'Rencontres photographiques, 2022.', art: 31, shape: 'wide' },
    { title: 'Collioure', caption: 'Un dimanche sans fin.', art: 41, shape: 'tall' },
  ],
  rsvpDeadline: '2027-05-31',
}
