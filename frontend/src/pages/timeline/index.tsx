import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Image, Video, MessageCircle, MapPin, Users, Sparkles } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { timelineApi } from '@/services/api'
import { Avatar } from '@/components/ui/avatar'

interface TimelineItem {
  id: string
  type: 'PHOTO' | 'VIDEO' | 'MOMENT'
  title?: string
  content?: string
  imageUrl?: string
  videoUrl?: string
  coverUrl?: string
  createdAt: string
  user?: { id: string; nickname?: string; username: string; avatar?: string }
}

const typeIcons = {
  PHOTO: Image,
  VIDEO: Video,
  MOMENT: MessageCircle,
} as const

const typeLabels = {
  PHOTO: '上传了照片',
  VIDEO: '上传了视频',
  MOMENT: '发表了动态',
} as const

export default function Timeline() {
  const [items, setItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    timelineApi.get()
      .then(({ data }) => setItems(data.data || data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const grouped = items.reduce<Record<string, TimelineItem[]>>((acc, item) => {
    const key = new Date(item.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-8 text-center">
        <h1 className="text-xl font-bold text-text-primary sm:text-2xl">时间轴</h1>
        <p className="mt-1 text-xs text-text-muted">从入学到毕业，每一刻都值得纪念</p>
      </div>

      {loading ? (
        <div className="space-y-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-text-muted">
          <Clock className="mb-3 h-12 w-12" />
          <p>时间轴还是空的，快来创造回忆吧</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          {Object.entries(grouped).map(([date, entries]) => (
            <div key={date} className="mb-10">
              {/* Date header */}
              <div className="relative z-10 mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-card">
                  <Clock className="h-4 w-4 text-accent" />
                </div>
                <span className="text-sm font-medium text-text-primary">{date}</span>
              </div>

              <div className="ml-14 space-y-4">
                {entries.map((item, idx) => {
                  const Icon = typeIcons[item.type]
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        to={item.type === 'PHOTO' ? `/photos/${item.id}` : item.type === 'VIDEO' ? '/videos' : '/moments'}
                        className="group flex gap-4 rounded-xl border border-border bg-bg-card/60 p-4 transition-colors hover:border-accent/20"
                      >
                        <Avatar
                          src={item.user?.avatar}
                          fallback={item.user?.nickname || item.user?.username}
                          size="md"
                          className="shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-text-primary">
                              {item.user?.nickname || item.user?.username}
                            </span>
                            <Icon className="h-3.5 w-3.5 text-accent" />
                            <span className="text-text-muted">{typeLabels[item.type]}</span>
                          </div>

                          {(item.title || item.content) && (
                            <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                              {item.title || item.content}
                            </p>
                          )}

                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="mt-2 h-40 w-full rounded-lg object-cover sm:h-52"
                              loading="lazy"
                            />
                          )}
                          {item.coverUrl && (
                            <img
                              src={item.coverUrl}
                              alt=""
                              className="mt-2 h-40 w-full rounded-lg object-cover sm:h-52"
                              loading="lazy"
                            />
                          )}

                          <p className="mt-1.5 text-xs text-text-muted">
                            {new Date(item.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
