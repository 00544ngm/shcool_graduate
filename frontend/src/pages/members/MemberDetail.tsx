import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Home, Mail, Calendar } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { userApi } from '@/services/api'

interface MemberProfile {
  id: string
  username: string
  nickname?: string
  avatar?: string
  email?: string
  bio?: string
  dormitory?: string
  city?: string
  role: string
  createdAt?: string
}

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    userApi.getUserById(id)
      .then(({ data }) => {
        if (data) {
          setProfile(data)
        } else {
          setError('该同学尚未完善个人资料')
        }
      })
      .catch(() => setError('加载失败'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="flex flex-col items-center py-10">
          <Skeleton className="mb-4 h-24 w-24 rounded-full" />
          <Skeleton className="mb-2 h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center py-20 text-text-muted">
        <p>{error || '用户不存在'}</p>
        <Link to="/members" className="mt-4 text-sm text-accent hover:text-accent-hover">
          返回人物档案馆
        </Link>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-2xl px-4 py-6">
      <Link to="/members" className="mb-6 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" />返回人物档案馆
      </Link>

      <div className="rounded-xl border border-border bg-bg-card p-6 text-center">
        <Avatar src={profile.avatar} fallback={profile.nickname || profile.username} size="xl" className="mx-auto mb-4" />
        <h1 className="text-xl font-bold text-text-primary">{profile.nickname || profile.username}</h1>
        <p className="text-sm text-text-muted">@{profile.username}</p>

        <div className="mt-2 flex justify-center gap-2">
          {profile.role === 'ADMIN' && <Badge>管理员</Badge>}
          {profile.role === 'MODERATOR' && <Badge variant="warning">版主</Badge>}
          <Badge variant="outline">班级成员</Badge>
        </div>

        {profile.bio && (
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-text-secondary">{profile.bio}</p>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-text-muted">
          {profile.city && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-accent" />
              {profile.city}
            </span>
          )}
          {profile.dormitory && (
            <span className="flex items-center gap-1.5">
              <Home className="h-4 w-4 text-accent" />
              {profile.dormitory}
            </span>
          )}
          {profile.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-accent" />
              {profile.email}
            </span>
          )}
          {profile.createdAt && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-accent" />
              {new Date(profile.createdAt).toLocaleDateString('zh-CN')} 加入
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
