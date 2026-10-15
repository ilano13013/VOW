import { PLANS, formatPrice, getPlan } from './plans'

describe('plans', () => {
  it('exposes the three commercial offers at their contractual prices', () => {
    expect(PLANS.map((p) => [p.id, p.priceEur])).toEqual([
      ['essential', 49],
      ['signature', 99],
      ['couture', 179],
    ])
  })

  it('resolves plans by id and rejects unknown ids', () => {
    expect(getPlan('couture')?.name).toBe('Couture')
    expect(getPlan('platinum')).toBeUndefined()
    expect(getPlan(undefined)).toBeUndefined()
  })

  it('formats prices in euros (fr-FR)', () => {
    expect(formatPrice(99).replace(/\s/g, ' ')).toBe('99 €')
  })
})
