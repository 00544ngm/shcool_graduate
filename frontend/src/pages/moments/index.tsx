import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Heart, Plus, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { momentApi, likeApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

interface Moment {
  id: string
  content: string
  images?: string[]
  createdAt: string
  user?: { id: string; nickname?: string; username: string; avatar?: string }
  _count?: { likes: number; comments: number }
}

export default function Moments() {
  const { user } = useAuthStore()
  const [moments, setMoments] = useState<Moment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [writeOpen, setWriteOpen] = useState(false)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set())
  const loaderRef = useRef<HTMLDivElement>(null)

  const fetchMoments = useCallback(async (p: number) => {
    try {
      const { data } = await momentApi.findAll(p)
      return data
    } catch {
      return { items: [], total: 0 }
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchMoments(1).then((data) => {
      setMoments(data.items || [])
      setHasMore((data.items?.length ?? 0) >= 20)
      setLoading(false)
    })
  }, [fetchMoments])

  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        setLoadingMore(true)
        setPage((p) => p + 1)
      }
    }, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadingMore])

  useEffect(() => {
    if (page <= 1) return
    fetchMoments(page).then((data) => {
      const items = data.items || []
      setMoments((prev) => [...prev, ...items])
      setHasMore(items.length >= 20)
      setLoadingMore(false)
    })
  }, [page, fetchMoments])

  const handlePost = async () => {
    if (!content.trim()) return
    setSubmitting(true)
    try {
      await momentApi.create({ content })
      setContent('')
      setWriteOpen(false)
      const { data } = await momentApi.findAll(1)
      setMoments(data.items || [])
    } catch {} finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (momentId: string) => {
    if (!user) return
    try {
      await likeApi.toggle({ targetType: 'moment', targetId: momentId })
      setLikedSet((prev) => {
        const next = new Set(prev)
        if (next.has(momentId)) next.delete(momentId)
        else next.add(momentId)
        return next
      })
      setMoments((prev) =>
        prev.map((m) =>
          m.id === momentId
            ? { ...m, _count: { ...m._count, likes: (m._count?.likes ?? 0) + (likedSet.has(momentId) ? -1 : 1) } as any }
            : m,
        ),
      )
    } catch {}
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary sm:text-2xl">班级动态</h1>
          <p className="mt-1 text-xs text-text-muted">分享此刻，让同窗看见</p>
        </div>
        {user && (
          <Button onClick={() => setWriteOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />发动态
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : moments.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-text-muted">
          <MessageCircle className="mb-3 h-12 w-12" />
          <p>还没有动态</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {moments.map((moment) => (
              <motion.div
                key={moment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-bg-card p-5"
              >
                <div className="flex gap-3">
                  <Avatar src={moment.user?.avatar} fallback={moment.user?.nickname || moment.user?.username} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">
                        {moment.user?.nickname || moment.user?.username}
                      </span>
                      <span className="text-xs text-text-muted">
                        {new Date(moment.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">
                      {moment.content}
                    </p>
                    {moment.images && moment.images.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {moment.images.map((img, idx) => (
                          <img key={idx} src={img} alt="" className="aspect-square rounded-lg object-cover" loading="lazy" />
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-4">
                      <button
                        onClick={() => handleLike(moment.id)}
                        className={`flex items-center gap-1 text-xs transition-colors ${likedSet.has(moment.id) ? 'text-error' : 'text-text-muted hover:text-error'}`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${likedSet.has(moment.id) ? 'fill-current' : ''}`} />
                        {moment._count?.likes ?? 0}
                      </button>
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {moment._count?.comments ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={loaderRef} className="flex justify-center py-4">
            {loadingMore && (
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                加载中...
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={writeOpen} onClose={() => setWriteOpen(false)}>
        <DialogTitle>发表动态</DialogTitle>
        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享此刻的心情..."
            rows={4}
          />
          <Button onClick={handlePost} className="w-full" disabled={!content.trim() || submitting}>
            {submitting ? '发布中...' : '发布'}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
