import { createRoutesFromElements, Route } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import Home from '@/pages/home'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import PhotoWall from '@/pages/photos/PhotoWall'
import PhotoDetail from '@/pages/photos/PhotoDetail'
import VideoGallery from '@/pages/videos/VideoGallery'
import Timeline from '@/pages/timeline'
import Map from '@/pages/map'
import Members from '@/pages/members'
import MemberDetail from '@/pages/members/MemberDetail'
import Mailbox from '@/pages/mailbox'
import Dormitory from '@/pages/dormitory'
import Moments from '@/pages/moments'
import AIAssistant from '@/pages/ai'
import Notifications from '@/pages/notifications'
import Settings from '@/pages/settings'

export const routes = createRoutesFromElements(
  <>
    {/* Auth routes — no layout */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* Main app routes */}
    <Route element={<MainLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/photos" element={<PhotoWall />} />
      <Route path="/photos/:id" element={<PhotoDetail />} />
      <Route path="/videos" element={<VideoGallery />} />
      <Route path="/timeline" element={<Timeline />} />
      <Route path="/map" element={<Map />} />
      <Route path="/members" element={<Members />} />
      <Route path="/members/:id" element={<MemberDetail />} />
      <Route path="/mailbox" element={<Mailbox />} />
      <Route path="/dormitory" element={<Dormitory />} />
      <Route path="/moments" element={<Moments />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/ai" element={<AIAssistant />} />
      <Route path="/notifications" element={<Notifications />} />
    </Route>
  </>,
)
