import { validateRsvp, rsvpErrorMessage } from './validation'

const base = { attending: true, respondentName: '  Claire Martin ', companions: 1, dietary: ' Végétarienne ', message: '' }

describe('validateRsvp (mirror of the server rules)', () => {
  it('accepts and trims a valid answer', () => {
    expect(validateRsvp(base, 1)).toEqual({
      ok: true,
      value: { attending: true, respondentName: 'Claire Martin', companions: 1, dietary: 'Végétarienne', message: null },
    })
  })

  it('requires an attendance choice and a name', () => {
    const r = validateRsvp({ ...base, attending: null, respondentName: '   ' }, 1)
    expect(r).toEqual({ ok: false, errors: { attending: 'attending_required', respondentName: 'invalid_name' } })
  })

  it('caps companions to what the invitation allows', () => {
    expect(validateRsvp({ ...base, companions: 2 }, 1)).toMatchObject({ ok: false, errors: { companions: 'invalid_companions' } })
    expect(validateRsvp({ ...base, companions: -1 }, 1)).toMatchObject({ ok: false, errors: { companions: 'invalid_companions' } })
  })

  it('ignores companions when declining', () => {
    expect(validateRsvp({ ...base, attending: false, companions: 5 }, 0)).toMatchObject({ ok: true, value: { companions: 0 } })
  })

  it('enforces length limits', () => {
    expect(validateRsvp({ ...base, respondentName: 'a'.repeat(121) }, 1)).toMatchObject({ ok: false, errors: { respondentName: 'invalid_name' } })
    expect(validateRsvp({ ...base, dietary: 'a'.repeat(501) }, 1)).toMatchObject({ ok: false, errors: { dietary: 'invalid_dietary' } })
    expect(validateRsvp({ ...base, message: 'a'.repeat(1001) }, 1)).toMatchObject({ ok: false, errors: { message: 'invalid_message' } })
  })

  it('explains each error in plain French', () => {
    expect(rsvpErrorMessage('invalid_companions', 2)).toContain('2 accompagnants')
    expect(rsvpErrorMessage('invalid_companions', 0)).toContain('personnelle')
    expect(rsvpErrorMessage('network')).toContain('saisie est conservée')
  })
})
