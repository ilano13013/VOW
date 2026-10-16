import { formatDotDate, formatLongDate, formatShortDate, mapsLinks } from './format'

describe('invitation formatting', () => {
  it('formats the wedding date in Paris time', () => {
    expect(formatDotDate('2027-07-18T16:00:00+02:00')).toBe('18.07.2027')
    expect(formatLongDate('2027-07-18T16:00:00+02:00')).toBe('dimanche 18 juillet 2027')
    expect(formatShortDate('2027-05-31')).toBe('31 mai 2027')
  })

  it('builds encoded map search links (no fabricated addresses)', () => {
    const l = mapsLinks('Luberon, Provence, France')
    expect(l.apple).toBe('https://maps.apple.com/?q=Luberon%2C%20Provence%2C%20France')
    expect(l.google).toContain('query=Luberon%2C%20Provence%2C%20France')
  })
})

import { parisIso, splitParisIso } from './format'

describe('Paris wall-clock dates', () => {
  it('uses +02:00 in summer and +01:00 in winter', () => {
    expect(parisIso('2027-07-18', '16:00')).toBe('2027-07-18T16:00:00+02:00')
    expect(parisIso('2027-12-04', '15:30')).toBe('2027-12-04T15:30:00+01:00')
  })
  it('round-trips through splitParisIso', () => {
    expect(splitParisIso('2027-07-18T16:00:00+02:00')).toEqual({ date: '2027-07-18', time: '16:00' })
    expect(splitParisIso('')).toEqual({ date: '', time: '' })
  })
})
