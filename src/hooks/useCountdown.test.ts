import { computeCountdown } from './useCountdown'

describe('computeCountdown', () => {
  it('splits the remaining time into days/hours/minutes/seconds', () => {
    const target = new Date('2027-07-18T16:00:00+02:00')
    const now = new Date('2027-07-16T13:58:30+02:00')
    expect(computeCountdown(target, now)).toEqual({ days: 2, hours: 2, minutes: 1, seconds: 30, done: false })
  })

  it('clamps to zero and reports done once the date has passed', () => {
    const target = new Date('2027-07-18T16:00:00+02:00')
    expect(computeCountdown(target, new Date('2028-01-01'))).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true })
  })
})
