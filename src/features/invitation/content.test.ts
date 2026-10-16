import { normalizeContent, slugify, starterContent, SLUG_PATTERN } from './content'
import { demoInvitation } from '@/data/demoInvitation'

describe('invitation content', () => {
  it('normalizes partial or hostile JSON without throwing', () => {
    const c = normalizeContent({ partnerOne: 'Léa', story: [{ title: 'Rencontre' }, null, 'x'], memories: 'nope', ceremony: 3 })
    expect(c.partnerOne).toBe('Léa')
    expect(c.partnerTwo).toBe('')
    expect(c.story).toEqual([{ year: '', title: 'Rencontre', text: '', art: 3 }])
    expect(c.memories).toEqual([])
    expect(c.ceremony.label).toBe('Cérémonie')
    expect(normalizeContent(null).openingLine).toBe('Some moments deserve another dimension.')
  })

  it('round-trips the demo content unchanged', () => {
    expect(normalizeContent(demoInvitation)).toEqual({ ...demoInvitation, schedule: demoInvitation.schedule.map((s) => ({ ...s, detail: s.detail || undefined })) })
  })

  it('builds a starter invitation with a deadline six weeks before the date', () => {
    const c = starterContent('Léa', 'Noé', '2027-09-04')
    expect(c.dateIso).toBe('2027-09-04T16:00:00+02:00')
    expect(c.rsvpDeadline).toBe('2027-07-24')
    expect(c.isDemo).toBeUndefined()
  })

  it('makes URL-safe slugs that satisfy the database constraint', () => {
    const s = slugify('Léa & Noé — 2027 !')
    expect(s).toBe('lea-et-noe-2027')
    expect(SLUG_PATTERN.test(s)).toBe(true)
  })
})
