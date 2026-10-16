import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { normalizeContent } from '@/features/invitation/content'
import type { PlanId } from '@/features/pricing/plans'
import {
  BackendError,
  type AuthResult,
  type Backend,
  type EventRecord,
  type GuestInput,
  type GuestRecord,
  type InvitationPayload,
  type RsvpErrorCode,
  type RsvpInput,
  type RsvpRecord,
  type Session,
} from './types'

/* Row shapes returned by PostgREST */
interface EventRow {
  id: string
  slug: string
  status: 'draft' | 'published'
  plan: PlanId
  guest_limit: number
  payment_status: 'unpaid' | 'paid'
  content: unknown
  published_at: string | null
  updated_at: string
}
interface GuestRow {
  id: string
  event_id: string
  name: string
  email: string | null
  max_companions: number
  note: string | null
  token: string
  created_at: string
}
interface RsvpRow {
  guest_id: string
  attending: boolean
  respondent_name: string
  companions: number
  dietary: string | null
  message: string | null
  updated_at: string
}

const toEvent = (r: EventRow): EventRecord => ({
  id: r.id,
  slug: r.slug,
  status: r.status,
  plan: r.plan,
  guestLimit: r.guest_limit,
  paymentStatus: r.payment_status,
  content: normalizeContent(r.content),
  publishedAt: r.published_at,
  updatedAt: r.updated_at,
})
const toGuest = (r: GuestRow): GuestRecord => ({
  id: r.id,
  eventId: r.event_id,
  name: r.name,
  email: r.email,
  maxCompanions: r.max_companions,
  note: r.note,
  token: r.token,
  createdAt: r.created_at,
})
const toRsvp = (r: RsvpRow): RsvpRecord => ({
  guestId: r.guest_id,
  attending: r.attending,
  respondentName: r.respondent_name,
  companions: r.companions,
  dietary: r.dietary,
  message: r.message,
  updatedAt: r.updated_at,
})

const EVENT_COLUMNS = 'id, slug, status, plan, guest_limit, payment_status, content, published_at, updated_at'
const GUEST_COLUMNS = 'id, event_id, name, email, max_companions, note, token, created_at'

function fail(error: { message: string; code?: string } | null, fallback: string): never {
  const msg = error?.message ?? fallback
  if (msg.includes('VOW_GUEST_LIMIT_REACHED')) throw new BackendError('Vous avez atteint le nombre d’invitations de votre offre.', 'guest_limit')
  if (error?.code === '23505') throw new BackendError('Cette adresse d’invitation est déjà prise. Choisissez-en une autre.', 'conflict')
  if (error?.code === '23514') throw new BackendError('Une valeur ne respecte pas le format attendu.', 'invalid')
  throw new BackendError(fallback, error?.code)
}

const AUTH_ERRORS: Record<string, string> = {
  invalid_credentials: 'E-mail ou mot de passe incorrect.',
  email_not_confirmed: 'Confirmez d’abord votre adresse e-mail grâce au lien reçu.',
  user_already_exists: 'Un compte existe déjà avec cette adresse. Connectez-vous.',
  weak_password: 'Mot de passe trop faible : 8 caractères au moins.',
  over_email_send_rate_limit: 'Trop de tentatives. Réessayez dans quelques minutes.',
}

export class SupabaseBackend implements Backend {
  readonly mode = 'supabase' as const
  private sb: SupabaseClient

  constructor(url: string, anonKey: string) {
    this.sb = createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  }

  async getInvitation(token: string): Promise<InvitationPayload | null> {
    const { data, error } = await this.sb.rpc('get_invitation', { p_token: token })
    if (error) throw new BackendError('Impossible de charger l’invitation.', 'network')
    if (!data) return null
    const d = data as { guest: InvitationPayload['guest']; content: unknown; rsvp: InvitationPayload['rsvp'] }
    return { guest: d.guest, content: normalizeContent(d.content), rsvp: d.rsvp }
  }

  async submitRsvp(token: string, input: RsvpInput) {
    const { data, error } = await this.sb.rpc('submit_rsvp', {
      p_token: token,
      p_attending: input.attending,
      p_name: input.respondentName,
      p_companions: input.companions,
      p_dietary: input.dietary,
      p_message: input.message,
    })
    if (error || !data) return { ok: false as const, error: 'network' as const }
    const d = data as { ok: boolean; error?: RsvpErrorCode }
    return d.ok ? { ok: true as const } : { ok: false as const, error: d.error ?? 'network' }
  }

  async getSession(): Promise<Session | null> {
    const { data } = await this.sb.auth.getSession()
    const u = data.session?.user
    return u ? { userId: u.id, email: u.email ?? '' } : null
  }

  onAuthChange(cb: (s: Session | null) => void) {
    const { data } = this.sb.auth.onAuthStateChange((_e, s) => cb(s?.user ? { userId: s.user.id, email: s.user.email ?? '' } : null))
    return () => data.subscription.unsubscribe()
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await this.sb.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: AUTH_ERRORS[error.code ?? ''] ?? 'Connexion impossible. Réessayez.' }
    return { ok: true, session: { userId: data.user.id, email: data.user.email ?? email } }
  }

  async signUp(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await this.sb.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/organizer` },
    })
    if (error) return { ok: false, error: AUTH_ERRORS[error.code ?? ''] ?? 'Création du compte impossible. Réessayez.' }
    if (!data.session) return { ok: true, session: null, needsConfirmation: true }
    return { ok: true, session: { userId: data.session.user.id, email } }
  }

  async signOut() {
    await this.sb.auth.signOut()
  }

  async listEvents() {
    const { data, error } = await this.sb.from('events').select(EVENT_COLUMNS).order('created_at', { ascending: false })
    if (error) fail(error, 'Impossible de charger vos invitations.')
    return (data as EventRow[]).map(toEvent)
  }

  async getEvent(id: string) {
    const { data, error } = await this.sb.from('events').select(EVENT_COLUMNS).eq('id', id).maybeSingle()
    if (error) fail(error, 'Impossible de charger cette invitation.')
    return data ? toEvent(data as EventRow) : null
  }

  async createEvent(input: { slug: string; content: EventRecord['content'] }) {
    const { data, error } = await this.sb.from('events').insert({ slug: input.slug, content: input.content }).select(EVENT_COLUMNS).single()
    if (error) fail(error, 'Création de l’invitation impossible.')
    return toEvent(data as EventRow)
  }

  async updateEvent(id: string, patch: Partial<Pick<EventRecord, 'slug' | 'content' | 'status'>>) {
    const { data, error } = await this.sb.from('events').update(patch).eq('id', id).select(EVENT_COLUMNS).single()
    if (error) fail(error, 'Enregistrement impossible.')
    return toEvent(data as EventRow)
  }

  async listGuests(eventId: string) {
    const { data, error } = await this.sb.from('guests').select(GUEST_COLUMNS).eq('event_id', eventId).order('created_at')
    if (error) fail(error, 'Impossible de charger les invités.')
    return (data as GuestRow[]).map(toGuest)
  }

  private guestRow(input: GuestInput) {
    return {
      name: input.name.trim(),
      email: input.email?.trim() || null,
      max_companions: input.maxCompanions,
      note: input.note?.trim() || null,
    }
  }

  async addGuest(eventId: string, input: GuestInput) {
    const { data, error } = await this.sb.from('guests').insert({ event_id: eventId, ...this.guestRow(input) }).select(GUEST_COLUMNS).single()
    if (error) fail(error, 'Ajout de l’invité impossible.')
    return toGuest(data as GuestRow)
  }

  async updateGuest(id: string, input: GuestInput) {
    const { data, error } = await this.sb.from('guests').update(this.guestRow(input)).eq('id', id).select(GUEST_COLUMNS).single()
    if (error) fail(error, 'Modification de l’invité impossible.')
    return toGuest(data as GuestRow)
  }

  async deleteGuest(id: string) {
    const { error } = await this.sb.from('guests').delete().eq('id', id)
    if (error) fail(error, 'Suppression impossible.')
  }

  async regenerateGuestToken(id: string) {
    const { data, error } = await this.sb.rpc('regenerate_guest_token', { p_guest_id: id })
    if (error) fail(error, 'Nouveau lien impossible.')
    return data as string
  }

  async listRsvps(eventId: string) {
    const { data, error } = await this.sb
      .from('rsvps')
      .select('guest_id, attending, respondent_name, companions, dietary, message, updated_at')
      .eq('event_id', eventId)
    if (error) fail(error, 'Impossible de charger les réponses.')
    return (data as RsvpRow[]).map(toRsvp)
  }
}
