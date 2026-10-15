import { demoInvitation } from './demoInvitation'

describe('demo invitation content', () => {
  it('is flagged as fictional demonstration content', () => {
    expect(demoInvitation.isDemo).toBe(true)
    expect(demoInvitation.partnerOne).toBe('Camille')
    expect(demoInvitation.partnerTwo).toBe('Gabriel')
    expect(demoInvitation.dateIso.startsWith('2027-07-18')).toBe(true)
    expect(demoInvitation.locationLabel).toBe('Provence, France')
  })

  it('never carries a street address for venues', () => {
    for (const v of [demoInvitation.ceremony, demoInvitation.reception]) {
      expect(v.mapsQuery).not.toMatch(/\d/) // no street numbers / postcodes
    }
  })
})
