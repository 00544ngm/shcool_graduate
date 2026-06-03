import { lazy, Suspense, useEffect } from 'react'
import { createRoutesFromElements, Route, useNavigate, Outlet } from 'react-router-dom'
import { setNavigate } from '@/services/navigate'
import { Loader2 } from 'lucide-react'
import MainLayout from '@/layouts/MainLayout'

const Home = lazy(() => import('@/pages/home'))
const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const PhotoWall = lazy(() => import('@/pages/photos/PhotoWall'))
const PhotoDetail = lazy(() => import('@/pages/photos/PhotoDetail'))
const VideoGallery = lazy(() => import('@/pages/videos/VideoGallery'))
const Timeline = lazy(() => import('@/pages/timeline'))
const Map = lazy(() => import('@/pages/map'))
const Members = lazy(() => import('@/pages/members'))
const MemberDetail = lazy(() => import('@/pages/members/MemberDetail'))
const Mailbox = lazy(() => import('@/pages/mailbox'))
const Dormitory = lazy(() => import('@/pages/dormitory'))
const Moments = lazy(() => import('@/pages/moments'))
const AIAssistant = lazy(() => import('@/pages/ai'))
const Notifications = lazy(() => import('@/pages/notifications'))
const Settings = lazy(() => import('@/pages/settings'))
const Admin = lazy(() => import('@/pages/admin'))
const NotFound = lazy(() => import('@/pages/notFound'))

function PageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-accent" />
    </div>
  )
}

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

function NavigateInitializer() {
  const navigate = useNavigate()
  useEffect(() => { setNavigate(navigate) }, [navigate])
  return <Outlet />
}

export const routes = createRoutesFromElements(
  <Route element={<NavigateInitializer />}>
    <Route path="/login" element={<Lazy><Login /></Lazy>} />
    <Route path="/register" element={<Lazy><Register /></Lazy>} />
    <Route element={<MainLayout />}>
      <Route path="/" element={<Lazy><Home /></Lazy>} />
      <Route path="/photos" element={<Lazy><PhotoWall /></Lazy>} />
      <Route path="/photos/:id" element={<Lazy><PhotoDetail /></Lazy>} />
      <Route path="/videos" element={<Lazy><VideoGallery /></Lazy>} />
      <Route path="/timeline" element={<Lazy><Timeline /></Lazy>} />
      <Route path="/map" element={<Lazy><Map /></Lazy>} />
      <Route path="/members" element={<Lazy><Members /></Lazy>} />
      <Route path="/members/:id" element={<Lazy><MemberDetail /></Lazy>} />
      <Route path="/mailbox" element={<Lazy><Mailbox /></Lazy>} />
      <Route path="/dormitory" element={<Lazy><Dormitory /></Lazy>} />
      <Route path="/moments" element={<Lazy><Moments /></Lazy>} />
      <Route path="/settings" element={<Lazy><Settings /></Lazy>} />
      <Route path="/ai" element={<Lazy><AIAssistant /></Lazy>} />
      <Route path="/notifications" element={<Lazy><Notifications /></Lazy>} />
      <Route path="/admin" element={<Lazy><Admin /></Lazy>} />
      <Route path="*" element={<Lazy><NotFound /></Lazy>} />
    </Route>
  </Route>,
)
