import { lazy, Suspense, useMemo } from 'react'
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { ScrollManager } from '@/components/layout/ScrollManager'
import { BackendProvider, createBackend } from '@/services/backend'
import type { Backend } from '@/services/types'
import { RouteFallback } from './RouteFallback'
import NotFoundPage from './NotFoundPage'

const LandingPage = lazy(() => import('@/features/landing/LandingPage'))
const DemoInvitationPage = lazy(() => import('@/features/invitation/DemoInvitationPage'))
const GuestInvitationPage = lazy(() => import('@/features/invitation/GuestInvitationPage'))
const OrderPage = lazy(() => import('@/features/order/OrderPage'))
const LoginPage = lazy(() => import('@/features/organizer/LoginPage'))
const OrganizerLayout = lazy(() => import('@/features/organizer/OrganizerLayout').then((m) => ({ default: m.OrganizerLayout })))
const DashboardPage = lazy(() => import('@/features/organizer/DashboardPage'))
const EventPage = lazy(() => import('@/features/organizer/EventPage'))
const OverviewPanel = lazy(() => import('@/features/organizer/OverviewPanel'))
const GuestsPanel = lazy(() => import('@/features/organizer/GuestsPanel'))
const ContentPanel = lazy(() => import('@/features/organizer/ContentPanel'))
const PreviewPage = lazy(() => import('@/features/organizer/PreviewPage'))
const PlateRenderPage = import.meta.env.DEV ? lazy(() => import('@/dev/PlateRenderPage')) : null

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="commander/:plan" element={<OrderPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        {/* Invitations are full-bleed experiences without the marketing chrome. */}
        <Route path="demo" element={<DemoInvitationPage />} />
        <Route path="i/:token" element={<GuestInvitationPage />} />
        <Route path="organizer/login" element={<LoginPage />} />
        <Route path="organizer/events/:id/preview" element={<PreviewPage />} />
        <Route path="organizer" element={<OrganizerLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="events/:id" element={<EventPage />}>
            <Route index element={<OverviewPanel />} />
            <Route path="guests" element={<GuestsPanel />} />
            <Route path="content" element={<ContentPanel />} />
          </Route>
        </Route>
        {PlateRenderPage && <Route path="__plates" element={<PlateRenderPage />} />}
      </Routes>
    </Suspense>
  )
}

// Embedded previews (sandboxed frames that cannot carry routes in their URL) build with
// VITE_ROUTER=memory; production uses real URLs.
const Router = import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : BrowserRouter

export default function App({ backend }: { backend?: Backend }) {
  const b = useMemo(() => backend ?? createBackend(), [backend])
  return (
    <BackendProvider backend={b}>
      <Router>
        <ScrollManager />
        <AppRoutes />
      </Router>
    </BackendProvider>
  )
}
