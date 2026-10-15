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
