const TZ = 'Europe/Paris'

export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ }).format(new Date(iso))
}

export function formatDotDate(iso: string): string {
  const d = new Date(iso)
  const parts = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TZ }).formatToParts(d)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return `${get('day')}.${get('month')}.${get('year')}`
}

export function formatShortDate(isoDate: string): string {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ }).format(new Date(`${isoDate}T12:00:00Z`))
}

export function mapsLinks(query: string) {
  const q = encodeURIComponent(query)
  return {
    apple: `https://maps.apple.com/?q=${q}`,
    google: `https://www.google.com/maps/search/?api=1&query=${q}`,
  }
}

/** "2027-07-18" + "16:00" (Paris wall-clock) → ISO string with the right offset (+01/+02). */
export function parisIso(date: string, time: string): string {
  const t = /^\d{2}:\d{2}$/.test(time) ? time : '16:00'
  for (const offset of ['+02:00', '+01:00']) {
    const iso = `${date}T${t}:00${offset}`
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    const local = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d)
    if (local === t) return iso
  }
  return `${date}T${t}:00+01:00`
}

/** ISO → { date: "YYYY-MM-DD", time: "HH:MM" } in Paris time ('' when invalid). */
export function splitParisIso(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  if (!iso || Number.isNaN(d.getTime())) return { date: '', time: '' }
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d)
  const time = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d)
  return { date, time }
}
