import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Users, Image, MessageCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { userApi } from '@/services/api'

interface DormitoryGroup {
  name: string
  count: number
  members: Array<{
    id: string
    nickname?: string
    username: string
    avatar?: string
    bio?: string
  }>
}

export default function Dormitory() {
  const [groups, setGroups] = useState<DormitoryGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userApi.getDormitoryGroups()
      .then(({ data }) => setGroups(data || []))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="px-4 py-6">
      <div className="mb-8 text-center">
        <h1 className="text-xl font-bold text-text-primary sm:text-2xl">宿舍空间</h1>
        <p className="mt-1 text-xs text-text-muted">每个宿舍都是一个温暖的小家</p>
        {!loading && (
          <p className="mt-2 text-sm text-text-secondary">
            共有 <span className="text-accent font-medium">{groups.length}</span> 个宿舍空间
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-text-muted">
          <Home className="mb-3 h-12 w-12" />
          <p>还没有宿舍数据，请先完善个人资料中的宿舍信息</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group, idx) => (
            <motion.div
              key={group.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="rounded-xl border border-border bg-bg-card overflow-hidden group hover:border-accent/20 transition-colors"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-accent/10 to-transparent p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-accent" />
                    <h3 className="font-medium text-text-primary">{group.name}</h3>
                  </div>
                  <Badge variant="outline">{group.count} 人</Badge>
                </div>
              </div>

              {/* Members */}
              <div className="p-4 space-y-3">
                {group.members.slice(0, 4).map((member) => (
                  <a
                    key={member.id}
                    href={`/members/${member.id}`}
                    className="flex items-center gap-3 rounded-lg p-2 -mx-2 transition-colors hover:bg-bg-elevated"
                  >
                    <Avatar src={member.avatar} fallback={member.nickname || member.username} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {member.nickname || member.username}
                      </p>
                      {member.bio && (
                        <p className="text-xs text-text-muted truncate">{member.bio}</p>
                      )}
                    </div>
                  </a>
                ))}
                {group.members.length > 4 && (
                  <p className="text-center text-xs text-text-muted pt-1">
                    还有 {group.members.length - 4} 位成员
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex border-t border-border divide-x divide-border">
                <Link to="/photos" className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-text-muted hover:text-accent transition-colors">
                  <Image className="h-3.5 w-3.5" />相册
                </Link>
                <Link to="/moments" className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-text-muted hover:text-accent transition-colors">
                  <MessageCircle className="h-3.5 w-3.5" />留言
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
