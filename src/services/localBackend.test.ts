import { LocalBackend, memoryStore, generateToken } from './localBackend'
import { starterContent } from '@/features/invitation/content'

const rsvp = { attending: true, respondentName: 'Claire', companions: 1, dietary: '', message: '' }

async function organizerWithEvent(b: LocalBackend, email = 'alice@example.test') {
  await b.signUp(email, 'motdepasse-solide')
  const e = await b.createEvent({ slug: `evt-${Math.random().toString(36).slice(2, 8)}`, content: { ...starterContent('Alice', 'Sam', '2099-06-01') } })
  return e
}

describe('LocalBackend (demo mode mirrors the database rules)', () => {
  it('generates 32-char URL-safe tokens', () => {
    const t = generateToken()
    expect(t).toMatch(/^[A-Za-z0-9_-]{32}$/)
    expect(generateToken()).not.toBe(t)
  })

  it('isolates organizers from each other', async () => {
    const store = memoryStore()
    const b = new LocalBackend(store)
    const e = await organizerWithEvent(b)
    const g = await b.addGuest(e.id, { name: 'Claire', maxCompanions: 1 })
    await b.signOut()
    await b.signUp('bruno@example.test', 'motdepasse-solide')
    expect(await b.listEvents()).toEqual([])
    expect(await b.getEvent(e.id)).toBeNull()
    await expect(b.listGuests(e.id)).rejects.toThrow('introuvable')
    await expect(b.updateEvent(e.id, { status: 'published' })).rejects.toThrow('introuvable')
    await expect(b.deleteGuest(g.id)).rejects.toThrow('introuvable')
    await expect(b.listRsvps(e.id)).rejects.toThrow('introuvable')
  })

  it('serves invitations only when published and only to the token holder', async () => {
    const b = new LocalBackend(memoryStore())
    const e = await organizerWithEvent(b)
    const claire = await b.addGuest(e.id, { name: 'Claire', maxCompanions: 1 })
    await b.addGuest(e.id, { name: 'Hugo', maxCompanions: 0 })
    expect(await b.getInvitation(claire.token)).toBeNull()
    expect(await b.submitRsvp(claire.token, rsvp)).toEqual({ ok: false, error: 'invalid_invitation' })
    await b.updateEvent(e.id, { status: 'published' })
    const inv = await b.getInvitation(claire.token)
    expect(inv?.guest).toEqual({ name: 'Claire', maxCompanions: 1 })
    expect(JSON.stringify(inv)).not.toContain('Hugo')
    expect(await b.getInvitation('A'.repeat(32))).toBeNull()
  })

  it('validates and stores RSVPs, then shows them to the organizer', async () => {
    const b = new LocalBackend(memoryStore())
    const e = await organizerWithEvent(b)
    const claire = await b.addGuest(e.id, { name: 'Claire', maxCompanions: 1 })
    await b.updateEvent(e.id, { status: 'published' })
    expect(await b.submitRsvp(claire.token, { ...rsvp, companions: 2 })).toEqual({ ok: false, error: 'invalid_companions' })
    expect(await b.submitRsvp(claire.token, rsvp)).toEqual({ ok: true })
    expect((await b.getInvitation(claire.token))?.rsvp).toMatchObject({ attending: true, companions: 1 })
    expect(await b.listRsvps(e.id)).toEqual([expect.objectContaining({ guestId: claire.id, respondentName: 'Claire' })])
  })

  it('closes RSVPs after the deadline and rate-limits repeated submissions', async () => {
    const b = new LocalBackend(memoryStore())
    const e = await organizerWithEvent(b)
    const g = await b.addGuest(e.id, { name: 'Claire', maxCompanions: 1 })
    await b.updateEvent(e.id, { status: 'published' })
    for (let i = 0; i < 10; i++) await b.submitRsvp(g.token, rsvp)
    expect(await b.submitRsvp(g.token, rsvp)).toEqual({ ok: false, error: 'rate_limited' })

    const e2 = await b.createEvent({ slug: 'closed-one', content: { ...starterContent('A', 'B', '2001-01-01'), rsvpDeadline: '2000-01-01' } })
    const g2 = await b.addGuest(e2.id, { name: 'Late', maxCompanions: 0 })
    await b.updateEvent(e2.id, { status: 'published' })
    expect(await b.submitRsvp(g2.token, rsvp)).toEqual({ ok: false, error: 'rsvp_closed' })
  })

  it('rotating a token invalidates the old link', async () => {
    const b = new LocalBackend(memoryStore())
    const e = await organizerWithEvent(b)
    const g = await b.addGuest(e.id, { name: 'Claire', maxCompanions: 0 })
    await b.updateEvent(e.id, { status: 'published' })
    const fresh = await b.regenerateGuestToken(g.id)
    expect(await b.getInvitation(g.token)).toBeNull()
    expect(await b.getInvitation(fresh)).not.toBeNull()
  })

  it('rejects wrong passwords and duplicate accounts', async () => {
    const b = new LocalBackend(memoryStore())
    await b.signUp('alice@example.test', 'motdepasse-solide')
    await b.signOut()
    expect(await b.signIn('alice@example.test', 'mauvais')).toMatchObject({ ok: false })
    expect(await b.signUp('ALICE@example.test', 'motdepasse-solide')).toMatchObject({ ok: false })
    expect(await b.signIn('alice@example.test', 'motdepasse-solide')).toMatchObject({ ok: true })
  })
})
