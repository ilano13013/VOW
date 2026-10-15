export function RouteFallback() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center" role="status" aria-live="polite">
      <span className="sr-only">Chargement…</span>
      <span className="h-px w-16 animate-breathe bg-chrome" aria-hidden="true" />
    </div>
  )
}
