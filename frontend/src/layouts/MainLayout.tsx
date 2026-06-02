import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { useSocketStore } from '@/stores/socket'
import { notificationApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { LogOut, Bell, Menu, X, Home, Image, Video, Clock, MapPin, Users, Mail, MessageCircle, Sparkles, Building, Settings, Shield } from 'lucide-react'
import { Starfield } from '@/components/Starfield'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ToastContainer } from '@/components/ToastContainer'
import { useState, useEffect } from 'react'

interface NavItem { path: string; label: string; icon: React.ComponentType<{ className?: string }> }

const navItems: NavItem[] = [
  { path: '/', label: '首页', icon: Home },
  { path: '/photos', label: '星空照片墙', icon: Image },
  { path: '/videos', label: '视频记忆馆', icon: Video },
  { path: '/timeline', label: '时间轴', icon: Clock },
  { path: '/map', label: '班级地图', icon: MapPin },
  { path: '/members', label: '人物档案馆', icon: Users },
  { path: '/mailbox', label: '未来信箱', icon: Mail },
  { path: '/dormitory', label: '宿舍空间', icon: Building },
  { path: '/moments', label: '班级动态', icon: MessageCircle },
  { path: '/ai', label: 'AI回忆助手', icon: Sparkles },
]

export default function MainLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { unreadCount, connect: connectSocket, disconnect: disconnectSocket, setUnreadCount } = useSocketStore()

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token')
      if (token) connectSocket(token)
      notificationApi.unread().then(({ data }) => {
        setUnreadCount(data ?? 0)
      }).catch((e) => console.error('fetch unread count failed', e))
    }
    return () => { disconnectSocket() }
  }, [user])

  useEffect(() => {
    if (location.pathname === '/notifications') {
      setUnreadCount(0)
    }
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <Starfield />
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg-primary/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-accent">
            <Sparkles className="h-5 w-5" />
            班级时光馆
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  location.pathname === item.path
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/notifications" className="relative">
                  <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold leading-none text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <div className="hidden items-center gap-1 md:flex">
                  {user.role === 'ADMIN' && (
                    <Link to="/admin">
                      <Button variant="ghost" size="icon">
                        <Shield className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Link to="/settings">
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                  <span className="text-sm text-text-secondary">{user.nickname || user.username}</span>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
                  {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/login')}>登录</Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-bg-primary md:hidden">
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm ${
                  location.pathname === item.path
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:bg-bg-elevated'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
            {user && (
              <>
              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-text-secondary hover:bg-bg-elevated"
              >
                <Settings className="h-5 w-5" />
                个人设置
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-text-secondary hover:bg-bg-elevated"
                >
                  <Shield className="h-5 w-5" />
                  后台管理
                </Link>
              )}
              <button
                onClick={() => { handleLogout(); setMenuOpen(false) }}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-error"
              >
                <LogOut className="h-5 w-5" />
                退出登录
              </button>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col pt-16">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-text-muted">
        <p>Class Memories &copy; {new Date().getFullYear()} — 班级时光馆，珍藏每一刻</p>
      </footer>

      <ToastContainer />
    </div>
  )
}
