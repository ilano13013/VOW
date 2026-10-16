import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactElement } from 'react'
import { AppRoutes } from '@/app/App'
import { BackendProvider } from '@/services/backend'
import { LocalBackend, memoryStore } from '@/services/localBackend'
import type { Backend } from '@/services/types'

export function renderAt(path: string, backend: Backend = new LocalBackend(memoryStore())) {
  const utils = render(
    <BackendProvider backend={backend}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </BackendProvider>,
  )
  return { ...utils, backend }
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
