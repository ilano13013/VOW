/**
 * Invitation content model. Stored as JSONB (`events.content`) in Supabase and
 * rendered by the invitation experience. Personal guest data never lives here.
 */
export interface StoryMoment {
  year: string
  title: string
  text: string
  /** Seed for the generated artwork plate. */
  art: number
}

export interface Venue {
  label: string
  name: string
  time: string
  description: string
  /** Free-text maps query. Keep region-level for demos; never a fabricated street address. */
  mapsQuery: string
}

export interface ScheduleItem {
  time: string
  title: string
  detail?: string
}

export interface PracticalInfo {
  title: string
  text: string
}

export interface Memory {
  title: string
  caption: string
  art: number
  /** Layout hint for the gallery. */
  shape: 'tall' | 'wide' | 'square'
}

export interface InvitationContent {
  partnerOne: string
  partnerTwo: string
  /** ISO 8601 with offset, e.g. 2027-07-18T16:00:00+02:00 */
  dateIso: string
  locationLabel: string
  openingLine: string
  intro: string
  story: StoryMoment[]
  ceremony: Venue
  reception: Venue
  schedule: ScheduleItem[]
  practical: PracticalInfo[]
  memories: Memory[]
  /** ISO date (YYYY-MM-DD) after which RSVPs close. */
  rsvpDeadline: string
  /** Whether this content is fictional demonstration material. */
  isDemo?: boolean
}
