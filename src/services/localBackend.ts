import { normalizeContent } from '@/features/invitation/content'
import { validateRsvp } from '@/features/rsvp/validation'
import {
  BackendError,
  type AuthResult,
  type Backend,
  type EventRecord,
  type GuestInput,
  type GuestRecord,
  type InvitationPayload,
  type RsvpInput,
  type RsvpRecord,
  type RsvpResult,
  type Session,
} from './types'

/**
 * LOCAL DEMO BACKEND — used when Supabase is not configured.
 * Everything lives in this browser's storage. It mirrors the database rules so
 * the product can be tried end to end, but it offers NO real security and no
 * sharing between devices. The UI says so wherever it is active.
 */

export interface KeyValueStore {
  get(key: string): string | null
  set(key: string, value: string): void
}

export const browserStore: KeyValueStore = {
  get: (k) => {
    try {
      return window.localStorage.getItem(k)
    } catch {
      return null
    }
  },
  set: (k, v) => {
    try {
      window.localStorage.setItem(k, v)
    } catch {
      /* storage full or blocked: keep running in memory */
    }
  },
}

export function memoryStore(): KeyValueStore {
  const m = new Map<string, string>()
  return { get: (k) => m.get(k) ?? null, set: (k, v) => void m.set(k, v) }
}

interface Account {
  id: string
  email: string
  passwordHash: string
}
interface StoredEvent extends EventRecord {
  ownerId: string
}
interface StoredRsvp extends RsvpRecord {
  eventId: string
}
interface Db {
  accounts: Account[]
  events: StoredEvent[]
  guests: GuestRecord[]
  rsvps: StoredRsvp[]
  attempts: { guestId: string; at: number }[]
  session: Session | null
}

const KEY = 'vow.local.v1'
const PLAN_LIMIT = { essential: 80, signature: 200, couture: 500 } as const

function uuid(): string {
  return crypto.randomUUID()
}

/** 24 random bytes → 32 URL-safe characters, same format as the SQL generator. */
export function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_')
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
}

const now = () => new Date().toISOString()
const parisToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date())

export class LocalBackend implements Backend {
  readonly mode = 'local' as const
  private listeners = new Set<(s: Session | null) => void>()

  constructor(private store: KeyValueStore = browserStore) {}

  private read(): Db {
    try {
      const raw = this.store.get(KEY)
      if (raw) return JSON.parse(raw) as Db
    } catch {
      /* corrupted: start fresh */
    }
    return { accounts: [], events: [], guests: [], rsvps: [], attempts: [], session: null }
  }
  private write(db: Db) {
    this.store.set(KEY, JSON.stringify(db))
  }
  private requireSession(db: Db): Session {
    if (!db.session) throw new BackendError('Session expirée. Reconnectez-vous.', 'unauthenticated')
    return db.session
  }
  private ownedEvent(db: Db, id: string): StoredEvent {
    const s = this.requireSession(db)
    const e = db.events.find((x) => x.id === id && x.ownerId === s.userId)
    if (!e) throw new BackendError('Invitation introuvable.', 'not_found')
    return e
  }
  private ownedGuest(db: Db, id: string): GuestRecord {
    const g = db.guests.find((x) => x.id === id)
    if (!g) throw new BackendError('Invité introuvable.', 'not_found')
    this.ownedEvent(db, g.eventId)
    return g
  }
  private publicEvent({ ownerId: _o, ...e }: StoredEvent): EventRecord {
    void _o
    return structuredClone(e)
  }

  // ---- guests (token) ----
  async getInvitation(token: string): Promise<InvitationPayload | null> {
    if (!/^[A-Za-z0-9_-]{32}$/.test(token)) return null
    const db = this.read()
    const g = db.guests.find((x) => x.token === token)
    const e = g && db.events.find((x) => x.id === g.eventId)
    if (!g || !e || e.status !== 'published') return null
    const r = db.rsvps.find((x) => x.guestId === g.id)
    return {
      guest: { name: g.name, maxCompanions: g.maxCompanions },
      content: normalizeContent(e.content),
      rsvp: r ? { attending: r.attending, respondentName: r.respondentName, companions: r.companions, dietary: r.dietary, message: r.message, updatedAt: r.updatedAt } : null,
    }
  }

  async submitRsvp(token: string, input: RsvpInput): Promise<RsvpResult> {
    const db = this.read()
    const g = /^[A-Za-z0-9_-]{32}$/.test(token) ? db.guests.find((x) => x.token === token) : undefined
    const e = g && db.events.find((x) => x.id === g.eventId)
    if (!g || !e || e.status !== 'published') return { ok: false, error: 'invalid_invitation' }
    const hourAgo = Date.now() - 3600_000
    db.attempts = db.attempts.filter((a) => a.at > Date.now() - 86400_000)
    db.attempts.push({ guestId: g.id, at: Date.now() })
    this.write(db)
    if (db.attempts.filter((a) => a.guestId === g.id && a.at > hourAgo).length > 10) return { ok: false, error: 'rate_limited' }
    const deadline = e.content.rsvpDeadline
    if (deadline && parisToday() > deadline) return { ok: false, error: 'rsvp_closed' }
    const v = validateRsvp(input, g.maxCompanions)
    if (!v.ok) return { ok: false, error: Object.values(v.errors)[0]! }
    const existing = db.rsvps.find((x) => x.guestId === g.id)
    const row: StoredRsvp = { guestId: g.id, eventId: e.id, ...v.value, updatedAt: now() }
    if (existing) Object.assign(existing, row)
    else db.rsvps.push(row)
    this.write(db)
    return { ok: true }
  }

  // ---- auth ----
  async getSession() {
    return this.read().session
  }
  onAuthChange(cb: (s: Session | null) => void) {
    this.listeners.add(cb)
    return () => void this.listeners.delete(cb)
  }
  private emit(s: Session | null) {
    this.listeners.forEach((l) => l(s))
  }
  async signIn(email: string, password: string): Promise<AuthResult> {
    const db = this.read()
    const hash = await sha256(password)
    const a = db.accounts.find((x) => x.email === email.trim().toLowerCase() && x.passwordHash === hash)
    if (!a) return { ok: false, error: 'E-mail ou mot de passe incorrect.' }
    db.session = { userId: a.id, email: a.email }
    this.write(db)
    this.emit(db.session)
    return { ok: true, session: db.session }
  }
  async signUp(email: string, password: string): Promise<AuthResult> {
    const db = this.read()
    const e = email.trim().toLowerCase()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return { ok: false, error: 'Adresse e-mail invalide.' }
    if (password.length < 8) return { ok: false, error: 'Mot de passe trop faible : 8 caractères au moins.' }
    if (db.accounts.some((x) => x.email === e)) return { ok: false, error: 'Un compte existe déjà avec cette adresse. Connectez-vous.' }
    const a: Account = { id: uuid(), email: e, passwordHash: await sha256(password) }
    db.accounts.push(a)
    db.session = { userId: a.id, email: a.email }
    this.write(db)
    this.emit(db.session)
    return { ok: true, session: db.session }
  }
  async signOut() {
    const db = this.read()
    db.session = null
    this.write(db)
    this.emit(null)
  }

  // ---- organizer ----
  async listEvents() {
    const db = this.read()
    const s = this.requireSession(db)
    return db.events.filter((e) => e.ownerId === s.userId).map((e) => this.publicEvent(e))
  }
  async getEvent(id: string) {
    const db = this.read()
    const s = this.requireSession(db)
    const e = db.events.find((x) => x.id === id && x.ownerId === s.userId)
    return e ? this.publicEvent(e) : null
  }
  async createEvent(input: { slug: string; content: EventRecord['content'] }) {
    const db = this.read()
    const s = this.requireSession(db)
    if (db.events.some((e) => e.slug === input.slug)) throw new BackendError('Cette adresse d’invitation est déjà prise. Choisissez-en une autre.', 'conflict')
    const e: StoredEvent = {
      id: uuid(),
      ownerId: s.userId,
      slug: input.slug,
      status: 'draft',
      plan: 'essential',
      guestLimit: PLAN_LIMIT.essential,
      paymentStatus: 'unpaid',
      content: normalizeContent(input.content),
      publishedAt: null,
      updatedAt: now(),
    }
    db.events.push(e)
    this.write(db)
    return this.publicEvent(e)
  }
  async updateEvent(id: string, patch: Partial<Pick<EventRecord, 'slug' | 'content' | 'status'>>) {
    const db = this.read()
    const e = this.ownedEvent(db, id)
    // Only these three columns are writable by organizers (as in the database grants).
    if (patch.slug !== undefined) {
      if (db.events.some((x) => x.slug === patch.slug && x.id !== id)) throw new BackendError('Cette adresse d’invitation est déjà prise. Choisissez-en une autre.', 'conflict')
      e.slug = patch.slug
    }
    if (patch.content !== undefined) e.content = normalizeContent(patch.content)
    if (patch.status !== undefined) {
      if (patch.status === 'published' && e.status !== 'published') e.publishedAt = now()
      e.status = patch.status
    }
    e.updatedAt = now()
    this.write(db)
    return this.publicEvent(e)
  }
  async listGuests(eventId: string) {
    const db = this.read()
    this.ownedEvent(db, eventId)
    return db.guests.filter((g) => g.eventId === eventId)
  }
  private cleanGuest(input: GuestInput) {
    const name = input.name.trim()
    if (name.length < 1 || name.length > 120) throw new BackendError('Indiquez le nom de l’invité (120 caractères au plus).', 'invalid')
    if (!Number.isInteger(input.maxCompanions) || input.maxCompanions < 0 || input.maxCompanions > 10)
      throw new BackendError('Le nombre d’accompagnants doit être compris entre 0 et 10.', 'invalid')
    const email = input.email?.trim() || null
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new BackendError('Adresse e-mail invalide.', 'invalid')
    return { name, email, maxCompanions: input.maxCompanions, note: input.note?.trim() || null }
  }
  async addGuest(eventId: string, input: GuestInput) {
    const db = this.read()
    const e = this.ownedEvent(db, eventId)
    if (db.guests.filter((g) => g.eventId === eventId).length >= e.guestLimit)
      throw new BackendError('Vous avez atteint le nombre d’invitations de votre offre.', 'guest_limit')
    const g: GuestRecord = { id: uuid(), eventId, ...this.cleanGuest(input), token: generateToken(), createdAt: now() }
    db.guests.push(g)
    this.write(db)
    return g
  }
  async updateGuest(id: string, input: GuestInput) {
    const db = this.read()
    const g = this.ownedGuest(db, id)
    Object.assign(g, this.cleanGuest(input))
    this.write(db)
    return g
  }
  async deleteGuest(id: string) {
    const db = this.read()
    this.ownedGuest(db, id)
    db.guests = db.guests.filter((g) => g.id !== id)
    db.rsvps = db.rsvps.filter((r) => r.guestId !== id)
    this.write(db)
  }
  async regenerateGuestToken(id: string) {
    const db = this.read()
    const g = this.ownedGuest(db, id)
    g.token = generateToken()
    this.write(db)
    return g.token
  }
  async listRsvps(eventId: string) {
    const db = this.read()
    this.ownedEvent(db, eventId)
    return db.rsvps.filter((r) => r.eventId === eventId).map(({ eventId: _e, ...r }) => (void _e, r))
  }
}
