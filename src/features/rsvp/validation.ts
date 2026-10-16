import type { RsvpErrorCode, RsvpInput } from '@/services/types'

/** Mirrors the checks of the SQL function `submit_rsvp` (the server stays the authority). */
export const RSVP_LIMITS = { name: 120, dietary: 500, message: 1000 } as const

export type RsvpField = 'attending' | 'respondentName' | 'companions' | 'dietary' | 'message'

export interface CleanRsvp {
  attending: boolean
  respondentName: string
  companions: number
  dietary: string | null
  message: string | null
}

export type RsvpValidation = { ok: true; value: CleanRsvp } | { ok: false; errors: Partial<Record<RsvpField, RsvpErrorCode>> }

export function validateRsvp(input: RsvpInput, maxCompanions: number): RsvpValidation {
  const errors: Partial<Record<RsvpField, RsvpErrorCode>> = {}
  const name = input.respondentName.trim()
  const dietary = input.dietary.trim()
  const message = input.message.trim()
  const companions = input.attending ? input.companions : 0

  if (input.attending === null) errors.attending = 'attending_required'
  if (name.length < 1 || name.length > RSVP_LIMITS.name) errors.respondentName = 'invalid_name'
  if (!Number.isInteger(companions) || companions < 0 || companions > maxCompanions) errors.companions = 'invalid_companions'
  if (dietary.length > RSVP_LIMITS.dietary) errors.dietary = 'invalid_dietary'
  if (message.length > RSVP_LIMITS.message) errors.message = 'invalid_message'

  if (Object.keys(errors).length) return { ok: false, errors }
  return {
    ok: true,
    value: { attending: input.attending as boolean, respondentName: name, companions, dietary: dietary || null, message: message || null },
  }
}

export const RSVP_ERROR_FIELD: Partial<Record<RsvpErrorCode, RsvpField>> = {
  attending_required: 'attending',
  invalid_name: 'respondentName',
  invalid_companions: 'companions',
  invalid_dietary: 'dietary',
  invalid_message: 'message',
}

export function rsvpErrorMessage(code: RsvpErrorCode, maxCompanions = 0): string {
  switch (code) {
    case 'attending_required':
      return 'Indiquez si vous serez présent·e.'
    case 'invalid_name':
      return `Indiquez votre nom (${RSVP_LIMITS.name} caractères au plus).`
    case 'invalid_companions':
      return maxCompanions > 0
        ? `Votre invitation permet jusqu’à ${maxCompanions} accompagnant${maxCompanions > 1 ? 's' : ''}.`
        : 'Votre invitation est personnelle et ne prévoit pas d’accompagnant.'
    case 'invalid_dietary':
      return `Ce champ est limité à ${RSVP_LIMITS.dietary} caractères.`
    case 'invalid_message':
      return `Votre message est limité à ${RSVP_LIMITS.message} caractères.`
    case 'rsvp_closed':
      return 'La date limite de réponse est passée. Contactez directement les mariés.'
    case 'rate_limited':
      return 'Trop de tentatives en peu de temps. Réessayez dans quelques minutes.'
    case 'invalid_invitation':
      return 'Ce lien d’invitation n’est plus valide. Demandez un nouveau lien aux mariés.'
    case 'network':
      return 'Connexion impossible. Vérifiez votre réseau, puis réessayez : votre saisie est conservée.'
  }
}
