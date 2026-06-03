import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Image, Video, MessageCircle, Mail, Shield, Trash2, Crown, Star, Key, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageMeta } from '@/components/PageMeta'
import { adminApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

interface Stats {
  users: number; photos: number; videos: number; comments: number; letters: number; moments: number
}

interface AdminUser {
  id: string; username: string; nickname?: string; email: string; role: string; createdAt: string
}

interface ContentItem {
  id: string; title?: string; content?: string; imageUrl?: string; videoUrl?: string; createdAt: string
  user?: { id: string; username: string; nickname?: string }
}

type Tab = 'stats' | 'users' | 'photos' | 'videos'

export default function Admin() {
  const { user } = useAuthStore()
  const toast = useToastStore((s) => s.toast)
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('stats')

  // Password reset
  const [resetUserId, setResetUserId] = useState<string | null>(null)
  const [resetPassword, setResetPassword] = useState('')

  // Content moderation
  const [photos, setPhotos] = useState<ContentItem[]>([])
  const [videos, setVideos] = useState<ContentItem[]>([])
  const [photoPage, setPhotoPage] = useState(1)
  const [videoPage, setVideoPage] = useState(1)
  const [contentLoading, setContentLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      adminApi.stats(),
      adminApi.users(),
    ]).then(([s, u]) => {
      setStats(s.data)
      setUsers(u.data || [])
    }).catch(() => toast('加载失败', 'error'))
    .finally(() => setLoading(false))
  }, [toast])

  useEffect(() => {
    if (tab === 'photos') {
      setContentLoading(true)
      adminApi.photos(photoPage).then(({ data }) => setPhotos(data.items || [])).catch((e) => console.error('load photos failed', e)).finally(() => setContentLoading(false))
    }
  }, [tab, photoPage, toast])

  useEffect(() => {
    if (tab === 'videos') {
      setContentLoading(true)
      adminApi.videos(videoPage).then(({ data }) => setVideos(data.items || [])).catch((e) => console.error('load videos failed', e)).finally(() => setContentLoading(false))
    }
  }, [tab, videoPage, toast])

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`确定删除用户「${name}」？此操作不可撤销。`)) return
    try {
      await adminApi.deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      toast(`用户「${name}」已删除`, 'success')
    } catch (e: any) {
      toast(e?.response?.data?.message || e?.message || '删除失败', 'error')
    }
  }

  const handleRole = async (id: string, role: string) => {
    try {
      const { data } = await adminApi.updateRole(id, role)
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: data.role } : u))
      toast('角色已更新', 'success')
    } catch (e: any) {
      toast(e?.response?.data?.message || e?.message || '更新失败', 'error')
    }
  }

  const handleResetPassword = async (id: string) => {
    if (!resetPassword || resetPassword.length < 6) {
      toast('密码至少 6 位', 'error')
      return
    }
    try {
      await adminApi.resetPassword(id, resetPassword)
      toast('密码已重置', 'success')
      setResetUserId(null)
      setResetPassword('')
    } catch (e: any) {
      toast(e?.response?.data?.message || e?.message || '重置失败', 'error')
    }
  }

  const handleDeletePhoto = async (id: string) => {
    if (!window.confirm('确定删除此照片？')) return
    try {
      await adminApi.deletePhoto(id)
      setPhotos((prev) => prev.filter((p) => p.id !== id))
      toast('照片已删除', 'success')
    } catch (e: any) {
      toast(e?.response?.data?.message || '删除失败', 'error')
    }
  }

  const handleDeleteVideo = async (id: string) => {
    if (!window.confirm('确定删除此视频？')) return
    try {
      await adminApi.deleteVideo(id)
      setVideos((prev) => prev.filter((v) => v.id !== id))
      toast('视频已删除', 'success')
    } catch (e: any) {
      toast(e?.response?.data?.message || '删除失败', 'error')
    }
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-muted">
        <Shield className="mb-3 h-12 w-12" />
        <p>无权访问</p>
      </div>
    )
  }

  const statCards = stats ? [
    { icon: Users, label: '用户', value: stats.users, color: 'text-blue-500' },
    { icon: Image, label: '照片', value: stats.photos, color: 'text-amber-500' },
    { icon: Video, label: '视频', value: stats.videos, color: 'text-purple-500' },
    { icon: MessageCircle, label: '评论', value: stats.comments, color: 'text-green-500' },
    { icon: Mail, label: '信件', value: stats.letters, color: 'text-pink-500' },
    { icon: Star, label: '动态', value: stats.moments, color: 'text-accent' },
  ] : []

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      <PageMeta title="后台管理" description="班级时光馆管理后台" />
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary sm:text-2xl">后台管理</h1>
        <p className="mt-1 text-xs text-text-muted">管理用户和内容</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="mb-6 flex flex-wrap gap-2">
            {(['stats', 'users', 'photos', 'videos'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                  tab === t ? 'bg-accent text-white' : 'bg-bg-elevated text-text-muted hover:text-text-primary'
                }`}
              >{t === 'stats' ? '数据概览' : t === 'users' ? '用户管理' : t === 'photos' ? '照片管理' : '视频管理'}</button>
            ))}
          </div>

          {/* Stats Tab */}
          {tab === 'stats' && stats && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {statCards.map((card, idx) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl border border-border bg-bg-card p-5 text-center"
                >
                  <card.icon className={`mx-auto mb-2 h-6 w-6 ${card.color}`} />
                  <p className="text-2xl font-bold text-text-primary">{card.value}</p>
                  <p className="text-xs text-text-muted mt-1">{card.label}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Users Tab */}
          {tab === 'users' && (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-bg-elevated text-text-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">用户名</th>
                    <th className="px-4 py-3 text-left">昵称</th>
                    <th className="px-4 py-3 text-left">邮箱</th>
                    <th className="px-4 py-3 text-left">角色</th>
                    <th className="px-4 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-bg-elevated/50 transition-colors">
                      <td className="px-4 py-3 text-text-primary">{u.username}</td>
                      <td className="px-4 py-3 text-text-secondary">{u.nickname || '-'}</td>
                      <td className="px-4 py-3 text-text-secondary">{u.email}</td>
                      <td className="px-4 py-3">
                        {u.role === 'ADMIN' ? (
                          <Badge variant="default" className="text-[10px]">
                            <Crown className="mr-1 h-3 w-3" />管理员
                          </Badge>
                        ) : u.role === 'MODERATOR' ? (
                          <Badge variant="warning" className="text-[10px]">版主</Badge>
                        ) : (
                          <Badge variant="default" className="bg-bg-elevated text-text-muted text-[10px]">成员</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {u.role !== 'ADMIN' && (
                            <>
                              <select
                                value={u.role}
                                onChange={(e) => handleRole(u.id, e.target.value)}
                                className="rounded-lg border border-border bg-bg-elevated px-2 py-1 text-xs text-text-primary outline-none"
                              >
                                <option value="MEMBER">成员</option>
                                <option value="MODERATOR">版主</option>
                              </select>
                              {u.id !== user?.id && (
                                <>
                                  <button
                                    onClick={() => setResetUserId(resetUserId === u.id ? null : u.id)}
                                    className="rounded-lg p-1.5 text-text-muted hover:text-accent transition-colors"
                                    title="重置密码"
                                  >
                                    <Key className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(u.id, u.nickname || u.username)}
                                    className="rounded-lg p-1.5 text-text-muted hover:bg-error/10 hover:text-error transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                        {resetUserId === u.id && (
                          <div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Input
                              type="password"
                              value={resetPassword}
                              onChange={(e) => setResetPassword(e.target.value)}
                              placeholder="新密码（至少6位）"
                              className="h-8 text-xs"
                            />
                            <Button size="sm" className="h-8 text-xs" onClick={() => handleResetPassword(u.id)}>确认</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Photos Tab */}
          {tab === 'photos' && (
            <div>
              {contentLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                  ))}
                </div>
              ) : photos.length === 0 ? (
                <p className="text-center text-text-muted py-10">暂无照片</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                      <div key={photo.id} className="group relative overflow-hidden rounded-xl border border-border bg-bg-card">
                        <div className="aspect-square">
                          <img src={photo.imageUrl} alt={photo.title || ''} className="h-full w-full object-cover" loading="lazy" />
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="rounded-lg bg-error px-3 py-1.5 text-xs text-white"
                          >删除</button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60">
                          <p className="truncate text-xs text-white">{photo.title || '无标题'}</p>
                          <p className="text-[10px] text-white/60">{photo.user?.nickname || photo.user?.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    <Button size="sm" variant="ghost" disabled={photoPage <= 1} onClick={() => setPhotoPage((p) => p - 1)}>上一页</Button>
                    <span className="flex items-center text-xs text-text-muted">第 {photoPage} 页</span>
                    <Button size="sm" variant="ghost" disabled={photos.length < 20} onClick={() => setPhotoPage((p) => p + 1)}>下一页</Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Videos Tab */}
          {tab === 'videos' && (
            <div>
              {contentLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-video rounded-xl" />
                  ))}
                </div>
              ) : videos.length === 0 ? (
                <p className="text-center text-text-muted py-10">暂无视频</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {videos.map((video) => (
                      <div key={video.id} className="group relative overflow-hidden rounded-xl border border-border bg-bg-card">
                        <div className="aspect-video bg-black flex items-center justify-center">
                          <Video className="h-8 w-8 text-white/40" />
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => handleDeleteVideo(video.id)}
                            className="rounded-lg bg-error px-3 py-1.5 text-xs text-white"
                          >删除</button>
                        </div>
                        <div className="p-2">
                          <p className="truncate text-xs text-text-primary">{video.title || '无标题'}</p>
                          <p className="text-[10px] text-text-muted">{video.user?.nickname || video.user?.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    <Button size="sm" variant="ghost" disabled={videoPage <= 1} onClick={() => setVideoPage((p) => p - 1)}>上一页</Button>
                    <span className="flex items-center text-xs text-text-muted">第 {videoPage} 页</span>
                    <Button size="sm" variant="ghost" disabled={videos.length < 20} onClick={() => setVideoPage((p) => p + 1)}>下一页</Button>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
