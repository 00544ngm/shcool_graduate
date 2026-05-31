import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Video, Play, Heart, MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { videoApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { Danmaku } from '@/components/Danmaku'

interface VideoItem {
  id: string
  title: string
  videoUrl: string
  coverUrl?: string
  createdAt: string
  user?: { id: string; nickname?: string; username: string }
  _count?: { likes: number; comments: number }
}

const MOCK_COMMENTS = [
  { id: 'd1', content: '青春不散场 🎓', createdAt: '' },
  { id: 'd2', content: '永远的同学！', createdAt: '' },
  { id: 'd3', content: '好怀念啊 😭', createdAt: '' },
  { id: 'd4', content: '太棒了！🔥', createdAt: '' },
  { id: 'd5', content: '时光不老，我们不散', createdAt: '' },
  { id: 'd6', content: '毕业快乐！🎉', createdAt: '' },
  { id: 'd7', content: '加油未来 💪', createdAt: '' },
  { id: 'd8', content: '这一届最棒 🌟', createdAt: '' },
]

export default function VideoGallery() {
  const { user } = useAuthStore()
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)

  // Player state
  const [playerOpen, setPlayerOpen] = useState(false)
  const [playerVideo, setPlayerVideo] = useState<VideoItem | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [danmakuEnabled, setDanmakuEnabled] = useState(true)

  const loaderRef = useRef<HTMLDivElement>(null)

  const fetchVideos = useCallback(async (p: number) => {
    try {
      const { data } = await videoApi.findAll(p)
      return data
    } catch {
      return { data: [], total: 0 }
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchVideos(1).then((data) => {
      setVideos(data.data || [])
      setHasMore((data.data?.length ?? 0) >= 20)
      setLoading(false)
    })
  }, [fetchVideos])

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
    fetchVideos(page).then((data) => {
      const items = data.data || []
      setVideos((prev) => [...prev, ...items])
      setHasMore(items.length >= 20)
      setLoadingMore(false)
    })
  }, [page, fetchVideos])

  const handleUpload = async () => {
    if (!file || !title.trim()) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('video', file)
      fd.append('title', title)
      await videoApi.create(fd)
      setUploadOpen(false)
      setTitle('')
      setFile(null)
      const { data } = await videoApi.findAll(1)
      setVideos(data.data || [])
    } catch {} finally {
      setUploading(false)
    }
  }

  const openPlayer = (video: VideoItem) => {
    setPlayerVideo(video)
    setPlayerOpen(true)
    setCurrentTime(0)
    setDuration(0)
    setPlaying(true)
  }

  const closePlayer = () => {
    setPlayerOpen(false)
    setPlaying(false)
    setPlayerVideo(null)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 100)
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary sm:text-2xl">视频记忆馆</h1>
          <p className="mt-1 text-xs text-text-muted">每一帧画面，都是时光的礼物</p>
        </div>
        {user && (
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />上传视频
          </Button>
        )}
      </div>

      {loading ? (
        <div className="columns-2 gap-4 sm:columns-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className={`mb-4 ${i % 2 === 0 ? 'h-48' : 'h-64'} rounded-xl`} />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-text-muted">
          <Video className="mb-3 h-12 w-12" />
          <p>还没有视频</p>
        </div>
      ) : (
        <>
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
            <AnimatePresence>
              {videos.map((video) => (
                <motion.div
                  key={video.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative mb-4 break-inside-avoid overflow-hidden rounded-xl border border-border bg-bg-card"
                >
                  <div className="relative aspect-video overflow-hidden bg-black">
                    {video.coverUrl ? (
                      <img src={video.coverUrl} alt={video.title} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Video className="h-8 w-8 text-text-muted" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => openPlayer(video)}>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/90 hover:bg-accent transition-colors">
                          <Play className="ml-0.5 h-5 w-5 text-white" />
                        </div>
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-medium text-text-primary">{video.title}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                      {video.user && <span>{video.user.nickname || video.user.username}</span>}
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{video._count?.likes ?? 0}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{video._count?.comments ?? 0}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div ref={loaderRef} className="flex justify-center py-8">
            {loadingMore && (
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                加载中...
              </div>
            )}
          </div>
        </>
      )}

      {/* Video Player Dialog */}
      {playerOpen && playerVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl mx-4">
            {/* Close button */}
            <button
              onClick={closePlayer}
              className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Video Container */}
            <div className="relative bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                src={playerVideo.videoUrl}
                className="w-full aspect-video"
                controls
                autoPlay
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />

              {/* Danmaku Overlay */}
              {danmakuEnabled && (
                <Danmaku
                  duration={duration || 100}
                  currentTime={currentTime}
                  comments={MOCK_COMMENTS}
                  playing={playing}
                />
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-3">
              <h3 className="text-white font-medium truncate">{playerVideo.title}</h3>
              <button
                onClick={() => setDanmakuEnabled(!danmakuEnabled)}
                className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                  danmakuEnabled
                    ? 'bg-accent text-white'
                    : 'bg-white/10 text-white/60 hover:text-white'
                }`}
              >
                {danmakuEnabled ? '弹幕 ON' : '弹幕 OFF'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)}>
        <DialogTitle>上传视频</DialogTitle>
        <div className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border py-8 text-text-muted hover:border-accent/50 transition-colors">
            <Upload className="h-8 w-8" />
            <span className="text-sm">点击选择视频</span>
            <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
          </label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="视频标题 *" />
          <Button onClick={handleUpload} className="w-full" disabled={!file || !title.trim() || uploading}>
            {uploading ? '上传中...' : '上传'}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
