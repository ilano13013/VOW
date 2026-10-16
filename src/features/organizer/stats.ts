import type { GuestRecord, RsvpRecord } from '@/services/types'

export type GuestStatus = 'pending' | 'attending' | 'declined'

export interface RsvpStats {
  invitations: number
  responded: number
  pending: number
  attendingGuests: number
  declinedGuests: number
  /** People expected: attending guests plus their companions. */
  expectedPeople: number
  responseRate: number
  dietary: { guest: string; text: string }[]
  messages: { guest: string; text: string; at?: string }[]
}

export function guestStatus(guestId: string, rsvps: RsvpRecord[]): GuestStatus {
  const r = rsvps.find((x) => x.guestId === guestId)
  return !r ? 'pending' : r.attending ? 'attending' : 'declined'
}

export function computeStats(guests: GuestRecord[], rsvps: RsvpRecord[]): RsvpStats {
  const ids = new Set(guests.map((g) => g.id))
  const answers = rsvps.filter((r) => ids.has(r.guestId))
  const attending = answers.filter((r) => r.attending)
  const name = (id: string) => guests.find((g) => g.id === id)?.name ?? ''
  return {
    invitations: guests.length,
    responded: answers.length,
    pending: guests.length - answers.length,
    attendingGuests: attending.length,
    declinedGuests: answers.length - attending.length,
    expectedPeople: attending.reduce((n, r) => n + 1 + r.companions, 0),
    responseRate: guests.length ? Math.round((answers.length / guests.length) * 100) : 0,
    dietary: attending.filter((r) => r.dietary).map((r) => ({ guest: name(r.guestId), text: r.dietary! })),
    messages: answers
      .filter((r) => r.message)
      .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
      .map((r) => ({ guest: name(r.guestId), text: r.message!, at: r.updatedAt })),
  }
}

export function guestLink(token: string): string {
  const base = (import.meta.env.VITE_SITE_URL as string | undefined) || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base.replace(/\/$/, '')}/i/${token}`
}

/** CSV export (semicolon-separated, UTF-8 BOM for Excel FR). Cells are escaped. */
export function toCsv(guests: GuestRecord[], rsvps: RsvpRecord[]): string {
  const esc = (v: string | number) => {
    let s = String(v)
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}` // neutralise spreadsheet formulas
    return `"${s.replace(/"/g, '""')}"`
  }
  const head = ['Invité', 'Accompagnants autorisés', 'Réponse', 'Nom indiqué', 'Accompagnants', 'Régime', 'Message']
  const rows = guests.map((g) => {
    const r = rsvps.find((x) => x.guestId === g.id)
    const status = !r ? 'En attente' : r.attending ? 'Présent·e' : 'Absent·e'
    return [g.name, g.maxCompanions, status, r?.respondentName ?? '', r?.companions ?? '', r?.dietary ?? '', r?.message ?? '']
  })
  return '﻿' + [head, ...rows].map((row) => row.map(esc).join(';')).join('\r\n')
}
