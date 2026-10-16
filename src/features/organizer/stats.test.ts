import { computeStats, guestStatus, toCsv } from './stats'
import type { GuestRecord, RsvpRecord } from '@/services/types'

const g = (id: string, name: string, max = 1): GuestRecord => ({ id, eventId: 'e', name, email: null, maxCompanions: max, note: null, token: 't'.repeat(32), createdAt: '' })
const guests = [g('1', 'Claire'), g('2', 'Hugo', 0), g('3', 'Inès', 2), g('4', 'Paul')]
const rsvps: RsvpRecord[] = [
  { guestId: '1', attending: true, respondentName: 'Claire', companions: 1, dietary: 'Végétarienne', message: 'Hâte !', updatedAt: '2027-05-02' },
  { guestId: '2', attending: false, respondentName: 'Hugo', companions: 0, dietary: null, message: 'Désolé', updatedAt: '2027-05-03' },
  { guestId: '3', attending: true, respondentName: 'Inès', companions: 2, dietary: null, message: null },
]

describe('RSVP statistics', () => {
  it('counts answers, attendance and expected people', () => {
    const s = computeStats(guests, rsvps)
    expect(s).toMatchObject({ invitations: 4, responded: 3, pending: 1, attendingGuests: 2, declinedGuests: 1, expectedPeople: 5, responseRate: 75 })
    expect(s.dietary).toEqual([{ guest: 'Claire', text: 'Végétarienne' }])
    expect(s.messages.map((m) => m.guest)).toEqual(['Hugo', 'Claire'])
  })

  it('handles an empty guest list', () => {
    expect(computeStats([], [])).toMatchObject({ invitations: 0, responseRate: 0, expectedPeople: 0 })
  })

  it('gives each guest a status', () => {
    expect(['1', '2', '4'].map((id) => guestStatus(id, rsvps))).toEqual(['attending', 'declined', 'pending'])
  })

  it('exports CSV with escaping and formula neutralisation', () => {
    const csv = toCsv([g('9', '=HYPERLINK("x")')], [{ guestId: '9', attending: true, respondentName: 'A "B"', companions: 0, dietary: null, message: null }])
    expect(csv.startsWith('﻿')).toBe(true)
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`)
    expect(csv).toContain('"A ""B"""')
  })
})
