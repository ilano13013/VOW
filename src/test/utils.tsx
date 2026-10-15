import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactElement } from 'react'
import { AppRoutes } from '@/app/App'

export function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

export function withRouter(ui: ReactElement, path = '/') {
  return render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>)
}

/** Force prefers-reduced-motion for a test (animations become instant). */
export function mockReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) =>
    ({
      matches: reduce && query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList) as typeof window.matchMedia
}
