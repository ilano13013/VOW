import { Outlet } from 'react-router-dom'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'

export function SiteLayout() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  )
}
