import { useCallback, useEffect, useState } from 'react'
import { useBackend } from '@/services/backend'
import type { EventRecord, GuestRecord, RsvpRecord } from '@/services/types'

export interface EventData {
  event: EventRecord
  guests: GuestRecord[]
  rsvps: RsvpRecord[]
}

export function useEventData(id: string) {
  const backend = useBackend()
  const [data, setData] = useState<EventData | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading')

  const reload = useCallback(async () => {
    try {
      const event = await backend.getEvent(id)
      if (!event) return setState('missing')
      const [guests, rsvps] = await Promise.all([backend.listGuests(id), backend.listRsvps(id)])
      setData({ event, guests, rsvps })
      setState('ready')
    } catch {
      setState('error')
    }
  }, [backend, id])

  useEffect(() => {
    setState('loading')
    reload()
  }, [reload])

  return { data, state, reload, setData }
}
