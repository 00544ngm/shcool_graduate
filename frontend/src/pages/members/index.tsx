import { PageMeta } from '@/components/PageMeta'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Search, MapPin, Trash2 } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { userApi, adminApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

interface Member {
  id: string
  username: string
  nickname?: string
  avatar?: string
  bio?: string
  city?: string
  dormitory?: string
  role: string
}

export default function Members() {
  const { user } = useAuthStore()
  const toast = useToastStore((s) => s.toast)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    userApi.findAll(1, 100)
      .then(({ data }) => setMembers(data.items || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`确定要删除用户「${name}」吗？此操作不可撤销。`)) return
    try {
      await adminApi.deleteUser(id)
      setMembers((prev) => prev.filter((m) => m.id !== id))
    } catch (e: any) {
      toast(e?.response?.data?.message || e?.message || '删除失败', 'error')
    }
  }

  const filtered = search
    ? members.filter((m) =>
        (m.nickname || m.username).toLowerCase().includes(search.toLowerCase()) ||
        m.city?.toLowerCase().includes(search.toLowerCase()),
      )
    : members

  return (
    <div className="px-4 py-6">
      <PageMeta title="人物档案馆" description="每一位同学的个人主页，记录青春的模样" />
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary sm:text-2xl">人物档案馆</h1>
        <p className="mt-1 text-xs text-text-muted">每一位同学，都是时光里独一无二的主角</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索同学..."
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-text-muted">
          <Users className="mb-3 h-12 w-12" />
          <p className="mb-1">还没有同学入驻</p>
          <p className="text-xs">每位同学完善个人资料后，将在这里展示</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Link
                to={`/members/${member.id}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-bg-card p-4 transition-colors hover:border-accent/20"
              >
                <Avatar src={member.avatar} fallback={member.nickname || member.username} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-text-primary truncate">
                      {member.nickname || member.username}
                    </h3>
                    {member.role === 'ADMIN' && <Badge variant="default" className="text-[10px]">管理员</Badge>}
                    {member.role === 'MODERATOR' && <Badge variant="warning" className="text-[10px]">版主</Badge>}
                  </div>
                  {member.bio && <p className="mt-1 text-xs text-text-muted line-clamp-1">{member.bio}</p>}
                  {member.city && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
                      <MapPin className="h-3 w-3" />{member.city}
                    </p>
                  )}
                </div>
                {user?.role === 'ADMIN' && user.id !== member.id && (
                  <button
                    onClick={(e) => { e.preventDefault(); handleDelete(member.id, member.nickname || member.username) }}
                    className="shrink-0 rounded-lg p-2 text-text-muted opacity-0 transition-all hover:bg-error/10 hover:text-error group-hover:opacity-100"
                    title="删除用户"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
