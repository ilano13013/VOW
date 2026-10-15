import { lazy, Suspense } from 'react'
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { ScrollManager } from '@/components/layout/ScrollManager'
import { RouteFallback } from './RouteFallback'
import NotFoundPage from './NotFoundPage'

const LandingPage = lazy(() => import('@/features/landing/LandingPage'))
const DemoInvitationPage = lazy(() => import('@/features/invitation/DemoInvitationPage'))
const OrderPage = lazy(() => import('@/features/order/OrderPage'))
const OrganizerPlaceholder = lazy(() => import('@/features/organizer/OrganizerPlaceholder'))
const PlateRenderPage = import.meta.env.DEV ? lazy(() => import('@/dev/PlateRenderPage')) : null

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="commander/:plan" element={<OrderPage />} />
          <Route path="organizer/*" element={<OrganizerPlaceholder />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        {/* Invitations are full-bleed experiences without the marketing chrome. */}
        <Route path="demo" element={<DemoInvitationPage />} />
        {PlateRenderPage && <Route path="__plates" element={<PlateRenderPage />} />}
      </Routes>
    </Suspense>
  )
}

// Embedded previews (sandboxed frames that cannot carry routes in their URL) build with
// VITE_ROUTER=memory; production uses real URLs.
const Router = import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : BrowserRouter

export default function App() {
  return (
    <Router>
      <ScrollManager />
      <AppRoutes />
    </Router>
  )
}
