import type { InvitationContent } from '@/features/invitation/types'
import type { PlanId } from '@/features/pricing/plans'

export type EventStatus = 'draft' | 'published'

export interface EventRecord {
  id: string
  slug: string
  status: EventStatus
  plan: PlanId
  guestLimit: number
  paymentStatus: 'unpaid' | 'paid'
  content: InvitationContent
  publishedAt: string | null
  updatedAt: string
}

export interface GuestRecord {
  id: string
  eventId: string
  name: string
  email: string | null
  maxCompanions: number
  note: string | null
  token: string
  createdAt: string
}

export interface GuestInput {
  name: string
  email?: string | null
  maxCompanions: number
  note?: string | null
}

export interface RsvpAnswer {
  attending: boolean
  respondentName: string
  companions: number
  dietary: string | null
  message: string | null
  updatedAt?: string
}

export interface RsvpRecord extends RsvpAnswer {
  guestId: string
}

export interface InvitationPayload {
  guest: { name: string; maxCompanions: number }
  content: InvitationContent
  rsvp: RsvpAnswer | null
}

export interface RsvpInput {
  attending: boolean | null
  respondentName: string
  companions: number
  dietary: string
  message: string
}

/** Error codes shared with the SQL function `submit_rsvp`. */
export type RsvpErrorCode =
  | 'invalid_invitation'
  | 'rate_limited'
  | 'rsvp_closed'
  | 'attending_required'
  | 'invalid_name'
  | 'invalid_companions'
  | 'invalid_dietary'
  | 'invalid_message'
  | 'network'

export type RsvpResult = { ok: true } | { ok: false; error: RsvpErrorCode }

export interface Session {
  userId: string
  email: string
}

export type AuthResult = { ok: true; session: Session | null; needsConfirmation?: boolean } | { ok: false; error: string }

export class BackendError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message)
    this.name = 'BackendError'
  }
}

export interface Backend {
  /** 'local' stores everything in this browser; it is a demo mode with no real security. */
  readonly mode: 'supabase' | 'local'

  // Guests (token-scoped, no account)
  getInvitation(token: string): Promise<InvitationPayload | null>
  submitRsvp(token: string, input: RsvpInput): Promise<RsvpResult>

  // Organizer auth
  getSession(): Promise<Session | null>
  onAuthChange(cb: (s: Session | null) => void): () => void
  signIn(email: string, password: string): Promise<AuthResult>
  signUp(email: string, password: string): Promise<AuthResult>
  signOut(): Promise<void>

  // Organizer data (owner-scoped)
  listEvents(): Promise<EventRecord[]>
  getEvent(id: string): Promise<EventRecord | null>
  createEvent(input: { slug: string; content: InvitationContent }): Promise<EventRecord>
  updateEvent(id: string, patch: Partial<Pick<EventRecord, 'slug' | 'content' | 'status'>>): Promise<EventRecord>
  listGuests(eventId: string): Promise<GuestRecord[]>
  addGuest(eventId: string, input: GuestInput): Promise<GuestRecord>
  updateGuest(id: string, input: GuestInput): Promise<GuestRecord>
  deleteGuest(id: string): Promise<void>
  regenerateGuestToken(id: string): Promise<string>
  listRsvps(eventId: string): Promise<RsvpRecord[]>
}
