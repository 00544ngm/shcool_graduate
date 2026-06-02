import { PageMeta } from '@/components/PageMeta'
import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, Bookmark, MessageCircle, Trash2, Clock, MapPin, User, Reply, SmilePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { photoApi, commentApi, likeApi, type PhotoItem } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useFavorites } from '@/hooks/useFavorites'
import { useToastStore } from '@/stores/toast'

interface Comment {
  id: string
  content: string
  parentId?: string | null
  createdAt: string
  user: { id: string; nickname?: string; username: string; avatar?: string }
}

const EMOJIS = ['😀', '😂', '🥰', '😢', '😡', '👍', '👎', '🎉', '💪', '🔥', '🌟', '💯', '❤️', '🙏', '😭', '🤣', '😍', '😊', '😅', '😱', '😎', '🥳', '😴', '🤔', '👏', '💪', '✨', '🎓']

export default function PhotoDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [photo, setPhoto] = useState<PhotoItem & { userId?: string } | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replySubmitting, setReplySubmitting] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [emojiTarget, setEmojiTarget] = useState<'comment' | 'reply'>('comment')
  const [error, setError] = useState('')
  const toast = useToastStore((s) => s.toast)
  const { isFavorite, toggleFavorite } = useFavorites()

  useEffect(() => {
    if (!id) return
    Promise.all([
      photoApi.findOne(id).then(({ data }) => {
        setPhoto(data)
        setLikeCount(data._count?.likes ?? 0)
      }),
      commentApi.findByTarget('photo', id).then(({ data }) => setComments(data.data || data)),
      likeApi.getLikes('photo', id).then(({ data }) => {
        if (data.userLiked) setLiked(true)
      }),
    ]).catch(() => setError('加载失败')).finally(() => setLoading(false))
  }, [id])

  const handleLike = async () => {
    if (!user || !id) return
    try {
      const { data } = await likeApi.toggle({ targetType: 'photo', targetId: id })
      setLiked(data.liked)
      setLikeCount(data.count)
    } catch { toast('点赞失败', 'error') }
  }

  const handleComment = async () => {
    if (!commentText.trim() || !id || !user) return
    setSubmitting(true)
    try {
      const { data } = await commentApi.create({ targetType: 'photo', targetId: id, content: commentText })
      setComments((prev) => [...prev, data])
      setCommentText('')
    } catch { toast('评论失败', 'error') } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async (parentId: string) => {
    if (!replyText.trim() || !id || !user) return
    setReplySubmitting(true)
    try {
      const { data } = await commentApi.create({ targetType: 'photo', targetId: id, content: replyText, parentId })
      setComments((prev) => [...prev, data])
      setReplyText('')
      setReplyingTo(null)
    } catch { toast('回复失败', 'error') } finally {
      setReplySubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    try {
      await photoApi.delete(id)
      navigate('/photos')
    } catch { toast('删除失败', 'error') }
  }

  const insertEmoji = (emoji: string, target: 'comment' | 'reply') => {
    if (target === 'comment') {
      setCommentText((prev) => prev + emoji)
    } else {
      setReplyText((prev) => prev + emoji)
    }
    setShowEmoji(false)
  }

  /* ─── Organize comments: top-level vs replies ─── */
  const { topComments, replyMap } = useMemo(() => {
    const top: Comment[] = []
    const map = new Map<string, Comment[]>()
    for (const c of comments) {
      if (!c.parentId) {
        top.push(c)
      } else {
        if (!map.has(c.parentId)) map.set(c.parentId, [])
        map.get(c.parentId)!.push(c)
      }
    }
    return { topComments: top, replyMap: map }
  }, [comments])

  if (loading) {
    return (
      <div className="px-4 py-6">
        <Skeleton className="mb-4 h-8 w-32" />
        <Skeleton className="aspect-video w-full rounded-xl" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
    )
  }

  if (error || !photo) {
    return (
      <div className="flex flex-col items-center py-20 text-text-muted">
        <p>{error || '照片不存在'}</p>
        <Button variant="ghost" onClick={() => navigate('/photos')} className="mt-4">返回照片墙</Button>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-4xl px-4 py-6">
      <PageMeta title={photo?.title || '照片详情'} description={photo?.description || '浏览班级照片'} />
      <Link to="/photos" className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" />返回照片墙
      </Link>

      {/* Image */}
      <div className="overflow-hidden rounded-xl border border-border bg-bg-card">
        <img src={photo.imageUrl} alt={photo.title} className="w-full object-contain max-h-[70vh]" />

        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-text-primary">{photo.title}</h1>
              {photo.description && (
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{photo.description}</p>
              )}
            </div>
            {user && (user.id === photo.userId || user.role === 'ADMIN') && (
              <Button variant="ghost" size="icon" onClick={handleDelete} className="text-error shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-text-muted">
            {photo.user && (
              <Link to={`/members/${photo.user.id}`} className="flex items-center gap-1.5 hover:text-accent transition-colors">
                <User className="h-3.5 w-3.5" />
                {photo.user.nickname || photo.user.username}
              </Link>
            )}
            {photo.takenAt && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {new Date(photo.takenAt).toLocaleDateString('zh-CN')}
              </span>
            )}
            {photo.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {photo.location}
              </span>
            )}
            {photo.tags && photo.tags.length > 0 && (
              <span className="flex items-center gap-1.5">
                {photo.tags.map((tag: string) => (
                  <span key={tag} className="rounded-full bg-bg-elevated px-2 py-0.5 text-xs text-text-muted">
                    #{tag}
                  </span>
                ))}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-error' : 'text-text-muted hover:text-error'}`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              {likeCount}
            </button>
            <button
              onClick={() => id && toggleFavorite(id)}
              className={`flex items-center gap-1.5 text-sm transition-colors ${id && isFavorite(id) ? 'text-accent' : 'text-text-muted hover:text-accent'}`}
            >
              <Bookmark className={`h-4 w-4 ${id && isFavorite(id) ? 'fill-current' : ''}`} />
              收藏
            </button>
            <span className="flex items-center gap-1.5 text-sm text-text-muted">
              <MessageCircle className="h-4 w-4" />
              {comments.length}
            </span>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="mt-6">
        <h2 className="mb-4 font-semibold text-text-primary">评论 ({comments.length})</h2>

        {/* New comment */}
        {user && (
          <div className="mb-6 flex gap-3">
            <Avatar src={user.avatar} fallback={user.nickname || user.username} size="md" />
            <div className="flex-1">
              <div className="relative">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="写下你的评论..."
                  rows={3}
                />
                <button
                  onClick={() => { setShowEmoji(!showEmoji); setEmojiTarget('comment') }}
                  className="absolute right-2 bottom-2 text-text-muted hover:text-accent transition-colors"
                >
                  <SmilePlus className="h-4 w-4" />
                </button>
              </div>
              {/* Emoji picker for comment */}
              {showEmoji && emojiTarget === 'comment' && (
                <div className="mt-2 flex flex-wrap gap-1.5 rounded-lg border border-border bg-bg-elevated p-2">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => insertEmoji(emoji, 'comment')}
                      className="hover:scale-125 transition-transform text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={handleComment} disabled={!commentText.trim() || submitting}>
                  {submitting ? '发送中...' : '发表评论'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {topComments.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">还没有评论</p>
        ) : (
          <div className="space-y-4">
            {topComments.map((comment) => {
              const replies = replyMap.get(comment.id) || []
              return (
                <div key={comment.id}>
                  {/* Top-level comment */}
                  <div className="flex gap-3">
                    <Avatar src={comment.user?.avatar} fallback={comment.user?.nickname || comment.user?.username} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">
                          {comment.user?.nickname || comment.user?.username}
                        </span>
                        <span className="text-xs text-text-muted">
                          {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-text-secondary">{comment.content}</p>
                      {user && (
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="mt-1 flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors"
                        >
                          <Reply className="h-3 w-3" />回复
                        </button>
                      )}

                      {/* Reply input */}
                      {replyingTo === comment.id && (
                        <div className="mt-3">
                          <div className="relative">
                            <Textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`回复 ${comment.user?.nickname || comment.user?.username}...`}
                              rows={2}
                              className="text-sm"
                            />
                            <button
                              onClick={() => { setShowEmoji(!showEmoji); setEmojiTarget('reply') }}
                              className="absolute right-2 bottom-2 text-text-muted hover:text-accent transition-colors"
                            >
                              <SmilePlus className="h-4 w-4" />
                            </button>
                          </div>
                          {/* Emoji picker for reply */}
                          {showEmoji && emojiTarget === 'reply' && (
                            <div className="mt-2 flex flex-wrap gap-1.5 rounded-lg border border-border bg-bg-elevated p-2">
                              {EMOJIS.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => insertEmoji(emoji, 'reply')}
                                  className="hover:scale-125 transition-transform text-lg"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                          <div className="mt-2 flex gap-2">
                            <Button size="sm" onClick={() => handleReply(comment.id)} disabled={!replyText.trim() || replySubmitting}>
                              {replySubmitting ? '发送中...' : '回复'}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyText('') }}>
                              取消
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nested replies */}
                  {replies.length > 0 && (
                    <div className="ml-11 mt-3 space-y-3 border-l-2 border-border pl-4">
                      {replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3">
                          <Avatar src={reply.user?.avatar} fallback={reply.user?.nickname || reply.user?.username} size="sm" className="h-6 w-6 text-xs" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-text-primary">
                                {reply.user?.nickname || reply.user?.username}
                              </span>
                              <span className="text-xs text-text-muted">
                                {new Date(reply.createdAt).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-text-secondary">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}
