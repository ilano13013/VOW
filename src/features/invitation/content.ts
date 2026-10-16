import type { InvitationContent, Memory, PracticalInfo, ScheduleItem, StoryMoment, Venue } from './types'

const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback)
const arr = <T>(v: unknown, map: (x: Record<string, unknown>, i: number) => T): T[] =>
  Array.isArray(v) ? v.filter((x) => x && typeof x === 'object').map((x, i) => map(x as Record<string, unknown>, i)) : []

function venue(v: unknown, label: string): Venue {
  const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>
  return {
    label: str(o.label, label),
    name: str(o.name),
    time: str(o.time),
    description: str(o.description),
    mapsQuery: str(o.mapsQuery),
  }
}

const SHAPES: Memory['shape'][] = ['tall', 'wide', 'square']

/**
 * Turns stored JSON (possibly partial, possibly from an older version) into
 * renderable content. Never throws.
 */
export function normalizeContent(raw: unknown): InvitationContent {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return {
    isDemo: o.isDemo === true,
    partnerOne: str(o.partnerOne),
    partnerTwo: str(o.partnerTwo),
    dateIso: str(o.dateIso),
    locationLabel: str(o.locationLabel),
    openingLine: str(o.openingLine, 'Some moments deserve another dimension.'),
    intro: str(o.intro),
    story: arr<StoryMoment>(o.story, (x, i) => ({ year: str(x.year), title: str(x.title), text: str(x.text), art: typeof x.art === 'number' ? x.art : [3, 11, 17, 23][i % 4] })),
    ceremony: venue(o.ceremony, 'Cérémonie'),
    reception: venue(o.reception, 'Réception'),
    schedule: arr<ScheduleItem>(o.schedule, (x) => ({ time: str(x.time), title: str(x.title), detail: str(x.detail) || undefined })),
    practical: arr<PracticalInfo>(o.practical, (x) => ({ title: str(x.title), text: str(x.text) })),
    memories: arr<Memory>(o.memories, (x, i) => ({
      title: str(x.title),
      caption: str(x.caption),
      art: typeof x.art === 'number' ? x.art : [5, 13, 7, 29, 31, 41][i % 6],
      shape: SHAPES.includes(x.shape as Memory['shape']) ? (x.shape as Memory['shape']) : SHAPES[i % 3],
    })),
    rsvpDeadline: str(o.rsvpDeadline),
  }
}

/** Is the date usable? (Empty or malformed dates hide the date-dependent blocks.) */
export function isValidIso(iso: string): boolean {
  return !!iso && !Number.isNaN(new Date(iso).getTime())
}

/** Starting point for a newly created invitation. */
export function starterContent(partnerOne: string, partnerTwo: string, date: string): InvitationContent {
  const d = new Date(`${date}T12:00:00Z`)
  const deadline = new Date(d.getTime() - 42 * 86400000).toISOString().slice(0, 10)
  return {
    partnerOne,
    partnerTwo,
    dateIso: `${date}T16:00:00+02:00`,
    locationLabel: '',
    openingLine: 'Some moments deserve another dimension.',
    intro: '',
    story: [],
    ceremony: { label: 'Cérémonie', name: '', time: '16:00', description: '', mapsQuery: '' },
    reception: { label: 'Réception', name: '', time: '19:00', description: '', mapsQuery: '' },
    schedule: [],
    practical: [],
    memories: [],
    rsvpDeadline: deadline,
  }
}

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, '-et-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
}

export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])$/
