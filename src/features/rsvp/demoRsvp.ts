import { browserStore, type KeyValueStore } from '@/services/localBackend'
import type { RsvpAnswer, RsvpInput, RsvpResult } from '@/services/types'
import { validateRsvp } from './validation'

/** The demo invitation's fictional guest. Answers stay in this browser only. */
export const DEMO_GUEST = { name: 'Invité·e de démonstration', maxCompanions: 2 }
const KEY = 'vow.demo.rsvp'

export function loadDemoRsvp(store: KeyValueStore = browserStore): RsvpAnswer | null {
  try {
    const raw = store.get(KEY)
    return raw ? (JSON.parse(raw) as RsvpAnswer) : null
  } catch {
    return null
  }
}

export async function submitDemoRsvp(input: RsvpInput, store: KeyValueStore = browserStore): Promise<RsvpResult> {
  const v = validateRsvp(input, DEMO_GUEST.maxCompanions)
  if (!v.ok) return { ok: false, error: Object.values(v.errors)[0]! }
  store.set(KEY, JSON.stringify({ ...v.value, updatedAt: new Date().toISOString() }))
  return { ok: true }
}
