import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Heart, Plus, Image, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { PageMeta } from '@/components/PageMeta'
import { momentApi, likeApi, commentApi, uploadApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

interface Moment {
  id: string
  content: string
  images?: string[]
  createdAt: string
  user?: { id: string; nickname?: string; username: string; avatar?: string }
  _count?: { likes: number; comments: number }
}

interface CommentItem {
  id: string
  content: string
  createdAt: string
  user?: { id: string; nickname?: string; username?: string; avatar?: string }
  replies?: CommentItem[]
}

export default function Moments() {
  const { user } = useAuthStore()
  const toast = useToastStore((s) => s.toast)
  const [moments, setMoments] = useState<Moment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [writeOpen, setWriteOpen] = useState(false)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set())
  const loaderRef = useRef<HTMLDivElement>(null)

  /* ─── Comment Dialog ─── */
  const [commentTarget, setCommentTarget] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, CommentItem[]>>({})
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentInput, setCommentInput] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)

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
      let images: string[] | undefined
      if (imageFiles.length > 0) {
        const { data } = await uploadApi.images(imageFiles)
        images = data.urls
      }
      await momentApi.create({ content, images })
      setContent('')
      setImageFiles([])
      setImagePreviews([])
      setWriteOpen(false)
      const { data } = await momentApi.findAll(1)
      setMoments(data.items || [])
    } catch (e: any) {
      toast(e?.response?.data?.message || e?.message || '发布失败', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (momentId: string) => {
    if (!user) return
    try {
      const { data } = await likeApi.toggle({ targetType: 'moment', targetId: momentId })
      setLikedSet((prev) => {
        const next = new Set(prev)
        if (data.liked) next.add(momentId)
        else next.delete(momentId)
        return next
      })
      setMoments((prev) =>
        prev.map((m) =>
          m.id === momentId
            ? { ...m, _count: { ...m._count, likes: data.count } as any }
            : m,
        ),
      )
    } catch (e: any) {
      toast(e?.response?.data?.message || e?.message || '操作失败', 'error')
    }
  }

  const openComments = async (momentId: string) => {
    setCommentTarget(momentId)
    if (!comments[momentId]) {
      setCommentsLoading(true)
      try {
        const { data } = await commentApi.findByTarget('moment', momentId)
        setComments((prev) => ({ ...prev, [momentId]: data }))
      } catch (e) { console.error('moment action failed', e) } finally {
        setCommentsLoading(false)
      }
    }
  }

  const postComment = async () => {
    if (!commentTarget || !commentInput.trim() || !user) return
    setCommentSubmitting(true)
    try {
      await commentApi.create({ targetType: 'moment', targetId: commentTarget, content: commentInput.trim() })
      setCommentInput('')
      const { data } = await commentApi.findByTarget('moment', commentTarget)
      setComments((prev) => ({ ...prev, [commentTarget]: data }))
      setMoments((prev) =>
        prev.map((m) =>
          m.id === commentTarget
            ? { ...m, _count: { ...m._count, comments: (m._count?.comments ?? 0) + 1 } as any }
            : m,
        ),
      )
    } catch (e) { console.error('post comment failed', e) } finally {
      setCommentSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <PageMeta title="班级动态" description="分享此刻，让同窗看见" />
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
                      <button onClick={() => openComments(moment.id)} className="flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-accent">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {moment._count?.comments ?? 0}
                      </button>
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

      <Dialog open={writeOpen} onClose={() => { setWriteOpen(false); setImageFiles([]); setImagePreviews([]) }}>
        <DialogTitle>发表动态</DialogTitle>
        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享此刻的心情..."
            rows={4}
          />
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {imagePreviews.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => {
                      setImageFiles((prev) => prev.filter((_, i) => i !== idx))
                      setImagePreviews((prev) => prev.filter((_, i) => i !== idx))
                    }}
                    className="absolute top-1 right-1 rounded-full bg-black/50 p-0.5 text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors">
              <Image className="h-4 w-4" />
              <span>添加图片</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  if (files.length === 0) return
                  setImageFiles((prev) => [...prev, ...files])
                  files.forEach((f) => {
                    const reader = new FileReader()
                    reader.onload = (ev) => {
                      if (ev.target?.result) setImagePreviews((prev) => [...prev, ev.target!.result as string])
                    }
                    reader.readAsDataURL(f)
                  })
                  e.target.value = ''
                }}
              />
            </label>
            <span className="text-xs text-text-muted">最多 9 张</span>
          </div>
          <Button onClick={handlePost} className="w-full" disabled={!content.trim() || submitting}>
            {submitting ? '发布中...' : '发布'}
          </Button>
        </div>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog open={!!commentTarget} onClose={() => setCommentTarget(null)}>
        <DialogTitle>评论</DialogTitle>
        {commentsLoading ? (
          <div className="flex justify-center py-8"><Skeleton className="h-20 w-full" /></div>
        ) : (
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {commentTarget && (comments[commentTarget]?.length ?? 0) === 0 ? (
              <p className="py-4 text-center text-sm text-text-muted">还没有评论</p>
            ) : (
              commentTarget && comments[commentTarget]?.map((c: CommentItem) => (
                <div key={c.id} className="flex gap-2 rounded-lg bg-bg-elevated/50 p-3">
                  <span className="shrink-0 text-sm font-medium text-text-primary">
                    {c.user?.nickname || c.user?.username}
                  </span>
                  <p className="text-sm text-text-secondary">{c.content}</p>
                </div>
              ))
            )}
          </div>
        )}
        {user && (
          <div className="mt-4 flex gap-2">
            <input
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="写评论..."
              onKeyDown={(e) => e.key === 'Enter' && postComment()}
              className="flex-1 rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
            <Button size="sm" onClick={postComment} disabled={!commentInput.trim() || commentSubmitting}>
              {commentSubmitting ? '...' : '发表'}
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  )
}
