import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Upload, Image as ImageIcon, Heart, MessageCircle, ArrowUpDown, MapPin, Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { photoApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useFavorites } from '@/hooks/useFavorites'
import { Starfield } from '@/components/Starfield'

interface Photo {
  id: string
  title: string
  description?: string
  imageUrl: string
  thumbnailUrl?: string
  takenAt?: string
  location?: string
  user?: { id: string; nickname?: string; username: string; avatar?: string }
  _count?: { likes: number; comments: number }
}

type SortOrder = 'newest' | 'oldest'

export default function PhotoWall() {
  const { user } = useAuthStore()
  const { favorites, isFavorite } = useFavorites()
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [locationFilter, setLocationFilter] = useState<string>('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', takenAt: '', location: '' })
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const loaderRef = useRef<HTMLDivElement>(null)

  /* ─── All unique locations for filtering ─── */
  const allLocations = useMemo(() => {
    const locs = new Set<string>()
    photos.forEach((p) => { if (p.location) locs.add(p.location) })
    return Array.from(locs).sort()
  }, [photos])

  /* ─── Fetch ─── */
  const fetchPhotos = useCallback(async (p: number, q?: string) => {
    try {
      const { data } = q ? await photoApi.search(q, p) : await photoApi.findAll(p)
      return data
    } catch {
      return { data: [], total: 0 }
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchPhotos(1, search || undefined).then((data) => {
      let items = data.data || []
      setPhotos(items)
      setPage(1)
      setHasMore(items.length >= 20)
      setLoading(false)
    })
  }, [fetchPhotos, search])

  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true)
          setPage((prev) => prev + 1)
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadingMore])

  useEffect(() => {
    if (page <= 1) return
    fetchPhotos(page, search || undefined).then((data) => {
      const items = data.data || []
      setPhotos((prev) => [...prev, ...items])
      setHasMore(items.length >= 20)
      setLoadingMore(false)
    })
  }, [page, fetchPhotos, search])

  /* ─── Sort & Filter ─── */
  const displayedPhotos = useMemo(() => {
    let items = [...photos]
    // Filter by location
    if (locationFilter) {
      items = items.filter((p) => p.location === locationFilter)
    }
    // Filter by favorites
    if (showFavoritesOnly) {
      items = items.filter((p) => isFavorite(p.id))
    }
    // Sort by date
    items.sort((a, b) => {
      const da = a.takenAt || a.id
      const db = b.takenAt || b.id
      return sortOrder === 'newest'
        ? new Date(db).getTime() - new Date(da).getTime()
        : new Date(da).getTime() - new Date(db).getTime()
    })
    return items
  }, [photos, locationFilter, sortOrder])

  /* ─── Upload ─── */
  const handleUpload = async () => {
    if (!file || !uploadForm.title.trim()) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('title', uploadForm.title)
      if (uploadForm.description) formData.append('description', uploadForm.description)
      if (uploadForm.takenAt) formData.append('takenAt', uploadForm.takenAt)
      if (uploadForm.location) formData.append('location', uploadForm.location)
      await photoApi.create(formData)
      setUploadOpen(false)
      setUploadForm({ title: '', description: '', takenAt: '', location: '' })
      setFile(null)
      setPreview('')
      const { data } = await photoApi.findAll(1)
      setPhotos(data.data || [])
    } catch {} finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(f)
  }

  return (
    <div className="px-4 py-6 relative z-10">
      <Starfield />
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary sm:text-2xl">星空照片墙</h1>
          <p className="mt-1 text-xs text-text-muted">每一张照片，都是夜空中最亮的星</p>
        </div>
        {user && (
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />上传照片
          </Button>
        )}
      </div>

      {/* Filters bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索照片..."
            className="pl-10"
          />
        </div>

        {/* Sort toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSortOrder((o) => (o === 'newest' ? 'oldest' : 'newest'))}
          className="gap-1.5"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortOrder === 'newest' ? '最新' : '最早'}
        </Button>

        {/* Favorites filter */}
        {user && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`gap-1.5 ${showFavoritesOnly ? 'text-accent' : ''}`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            收藏 ({favorites.length})
          </Button>
        )}
      </div>

      {/* Location tags */}
      {allLocations.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-text-muted" />
          <button
            onClick={() => setLocationFilter('')}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              !locationFilter ? 'bg-accent text-white' : 'bg-bg-elevated text-text-muted hover:text-text-primary'
            }`}
          >
            全部
          </button>
          {allLocations.map((loc) => (
            <button
              key={loc}
              onClick={() => setLocationFilter(loc === locationFilter ? '' : loc)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                locationFilter === loc ? 'bg-accent text-white' : 'bg-bg-elevated text-text-muted hover:text-text-primary'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : displayedPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <ImageIcon className="mb-3 h-12 w-12" />
          <p>{search || locationFilter ? '没有找到匹配的照片' : '还没有照片，快来上传第一张吧'}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <AnimatePresence>
              {displayedPhotos.map((photo, idx) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Link
                    to={`/photos/${photo.id}`}
                    className="group relative block overflow-hidden rounded-xl border border-border bg-bg-card"
                  >
                    <div className="aspect-square">
                      <img
                        src={photo.thumbnailUrl || photo.imageUrl}
                        alt={photo.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="truncate text-sm font-medium text-white">{photo.title}</p>
                      {photo.location && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-white/70">
                          <MapPin className="h-3 w-3" />{photo.location}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-3 text-xs text-white/70">
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{photo._count?.likes ?? 0}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{photo._count?.comments ?? 0}</span>
                      </div>
                    </div>
                  </Link>
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

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)}>
        <DialogTitle>上传照片</DialogTitle>
        <div className="space-y-4">
          {preview ? (
            <div className="relative aspect-video overflow-hidden rounded-lg border border-border">
              <img src={preview} alt="Preview" className="h-full w-full object-cover" />
              <button
                onClick={() => { setFile(null); setPreview('') }}
                className="absolute right-2 top-2 rounded-lg bg-black/60 px-2 py-1 text-xs text-white"
              >
                重新选择
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border py-8 text-text-muted hover:border-accent/50 transition-colors">
              <Upload className="h-8 w-8" />
              <span className="text-sm">点击选择照片</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          )}
          <Input value={uploadForm.title} onChange={(e) => setUploadForm((f) => ({ ...f, title: e.target.value }))} placeholder="照片标题 *" />
          <Input value={uploadForm.description} onChange={(e) => setUploadForm((f) => ({ ...f, description: e.target.value }))} placeholder="照片描述（可选）" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-text-muted">拍摄时间</label>
              <Input type="date" value={uploadForm.takenAt} onChange={(e) => setUploadForm((f) => ({ ...f, takenAt: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-text-muted">拍摄地点</label>
              <Input value={uploadForm.location} onChange={(e) => setUploadForm((f) => ({ ...f, location: e.target.value }))} placeholder="如：教室" />
            </div>
          </div>
          <Button onClick={handleUpload} className="w-full" disabled={!file || !uploadForm.title.trim() || uploading}>
            {uploading ? '上传中...' : '上传'}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
