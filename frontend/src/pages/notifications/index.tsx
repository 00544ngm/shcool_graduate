import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Heart, MessageCircle, UserPlus, Sparkles, CheckCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { notificationApi } from '@/services/api'
import { useNavigate } from 'react-router-dom'

interface Notification {
  id: string
  type: string
  content: string
  read: boolean
  relatedId?: string
  createdAt: string
}

const typeIcons: Record<string, React.ReactNode> = {
  LIKE: <Heart className="h-4 w-4 text-error" />,
  COMMENT: <MessageCircle className="h-4 w-4 text-accent" />,
  FOLLOW: <UserPlus className="h-4 w-4 text-success" />,
  SYSTEM: <Sparkles className="h-4 w-4 text-accent" />,
}

const typeLabels: Record<string, string> = {
  LIKE: '赞',
  COMMENT: '评论',
  FOLLOW: '关注',
  SYSTEM: '系统消息',
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    notificationApi.findMy(1)
      .then(({ data }) => {
        setNotifications(data.items || [])
        setHasMore((data.items?.length ?? 0) >= 20)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {}
  }

  const handleMarkRead = async (notification: Notification) => {
    if (notification.read) return
    try {
      await notificationApi.markRead(notification.id)
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
    } catch {}
  }

  const loadMore = async () => {
    setLoadingMore(true)
    const p = page + 1
    try {
      const { data } = await notificationApi.findMy(p)
      const items = data.items || []
      setNotifications((prev) => [...prev, ...items])
      setPage(p)
      setHasMore(items.length >= 20)
    } catch {} finally {
      setLoadingMore(false)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary sm:text-2xl">消息通知</h1>
          <p className="mt-1 text-xs text-text-muted">
            {unreadCount > 0 ? `你有 ${unreadCount} 条未读消息` : '没有未读消息'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="mr-1.5 h-4 w-4" />
            全部已读
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-text-muted">
          <Bell className="mb-3 h-12 w-12" />
          <p>还没有通知</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                    notification.read
                      ? 'border-border bg-bg-card'
                      : 'border-accent/20 bg-accent/5'
                  }`}
                  onClick={() => handleMarkRead(notification)}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-elevated">
                    {typeIcons[notification.type] || <Bell className="h-4 w-4 text-text-muted" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary">{notification.content}</p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {typeLabels[notification.type] || notification.type}
                      {' · '}
                      {new Date(notification.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-accent shrink-0" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {hasMore && (
            <div className="flex justify-center py-6">
              <Button variant="ghost" size="sm" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  '加载更多'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
