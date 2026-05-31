import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Users, Search, LayoutGrid, Map as MapIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { userApi } from '@/services/api'
import { ChinaMap } from '@/components/ChinaMap'

interface CityGroup {
  city: string
  count: number
  members: Array<{ id: string; nickname?: string; username: string; avatar?: string }>
}

export default function Map() {
  const [cities, setCities] = useState<CityGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')

  useEffect(() => {
    userApi.getCityMap()
      .then(({ data }) => {
        const raw = data.distribution || {}
        const list = Object.entries(raw).map(([city, info]: any) => ({
          city,
          count: info.count,
          members: (info.names || []).map((name: string, i: number) => ({
            id: `${city}-${i}`,
            nickname: name,
            username: name,
          })),
        }))
        setCities(list)
      })
      .catch(() => setCities([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = search
    ? cities.filter((c) => c.city.toLowerCase().includes(search.toLowerCase()))
    : cities

  const totalMembers = cities.reduce((sum, c) => sum + c.count, 0)

  return (
    <div className="px-4 py-6">
      <div className="mb-8 text-center">
        <h1 className="text-xl font-bold text-text-primary sm:text-2xl">班级地图</h1>
        <p className="mt-1 text-xs text-text-muted">毕业后，看看同学们都去了哪里</p>
        {!loading && (
          <p className="mt-2 text-sm text-text-secondary">
            覆盖 <span className="text-accent font-medium">{cities.length}</span> 座城市，
            <span className="text-accent font-medium">{totalMembers}</span> 位同学
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索城市..."
            className="pl-10"
          />
        </div>
        <div className="flex rounded-lg border border-border bg-bg-secondary p-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('map')}
            className={`rounded-md ${viewMode === 'map' ? 'bg-accent text-white hover:text-white' : ''}`}
          >
            <MapIcon className="h-4 w-4 mr-1" />地图
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('list')}
            className={`rounded-md ${viewMode === 'list' ? 'bg-accent text-white hover:text-white' : ''}`}
          >
            <LayoutGrid className="h-4 w-4 mr-1" />列表
          </Button>
        </div>
      </div>

      {loading ? (
        viewMode === 'map' ? (
          <Skeleton className="aspect-[4/3] w-full max-w-2xl mx-auto rounded-xl" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        )
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-text-muted">
          <MapPin className="mb-3 h-12 w-12" />
          <p>{search ? '没有找到匹配的城市' : '还没有同学更新位置信息'}</p>
        </div>
      ) : viewMode === 'map' ? (
        <>
          {/* Map Visualization */}
          <ChinaMap cities={filtered.map((c) => ({ city: c.city, count: c.count }))} />

          {/* Map Legend - show top cities below */}
          <div className="mt-8 max-w-2xl mx-auto">
            <h3 className="mb-3 text-sm font-medium text-text-secondary">城市分布</h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.slice(0, 12).map((city, idx) => (
                <motion.div
                  key={city.city}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-center gap-3 rounded-lg border border-border bg-bg-card p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                    <MapPin className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary">{city.city}</p>
                    <p className="text-xs text-text-muted">{city.count} 位同学</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((city, idx) => (
            <motion.div
              key={city.city}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="rounded-xl border border-border bg-bg-card p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  <h3 className="font-medium text-text-primary">{city.city}</h3>
                </div>
                <span className="flex items-center gap-1 text-sm text-text-muted">
                  <Users className="h-3.5 w-3.5" />
                  {city.count}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {city.members.map((m) => (
                  <div key={m.id} className="flex items-center gap-1.5 rounded-full bg-bg-elevated px-2.5 py-1">
                    <Avatar src={m.avatar} fallback={m.nickname || m.username} size="sm" className="h-5 w-5" />
                    <span className="text-xs text-text-secondary">{m.nickname || m.username}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
