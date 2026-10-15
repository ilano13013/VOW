/** Authored line icons — one stroke weight (1.2) across the system. */
export function ArrowIcon({ dir = 'right', className }: { dir?: 'left' | 'right'; className?: string }) {
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true" className={className} style={dir === 'left' ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}
