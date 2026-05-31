import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Send, Image, MessageCircle, Loader2, Heart, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { PageMeta } from '@/components/PageMeta'
import { aiApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

/* ─── Types ─── */
interface AiPhoto {
  id: string; title?: string; imageUrl: string; thumbnailUrl?: string
}
interface AiMoment {
  id: string; content: string; user?: { nickname?: string }
}
interface SearchResult {
  summary: string
  photos: AiPhoto[]
  moments: AiMoment[]
}
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const suggestions = ['军训', '运动会', '毕业旅行', '元旦晚会', '我们的宿舍', '一起奋斗的日子']

/* ─── 回忆助手 Tab (搜索模式) ─── */
function MemorySearch() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (q?: string) => {
    const searchQuery = q || query
    if (!searchQuery.trim() || loading) return
    setLoading(true)
    setSearched(true)
    try {
      const { data } = await aiApi.search(searchQuery)
      setResult({
        summary: data.summary || `关于「${searchQuery}」的回忆：`,
        photos: (data.photos || []).map((p: any) => ({ id: p.id, title: p.title, imageUrl: p.thumbnailUrl || p.imageUrl })),
        moments: (data.moments || []).map((m: any) => ({ id: m.id, content: m.content, user: m.user })),
      })
    } catch {
      setResult({ summary: '搜索时出现了问题，请稍后再试。', photos: [], moments: [] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Search bar + suggestions */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="输入关键词搜索回忆..."
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            disabled={loading}
          />
          <Button onClick={() => handleSearch()} disabled={!query.trim() || loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => { setQuery(s); handleSearch(s) }} disabled={loading}
              className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : !searched ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-text-muted">输入关键词，找到那些年的回忆</p>
        </div>
      ) : result ? (
        <div className="flex-1 space-y-6 overflow-y-auto">
          {/* Summary */}
          {result.summary && (
            <div className="rounded-xl border border-border bg-bg-card p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{result.summary}</p>
            </div>
          )}

          {/* Photos */}
          {result.photos.length > 0 && (
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-xs text-text-muted">
                <Image className="h-3.5 w-3.5" />共找到 {result.photos.length} 张相关照片
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {result.photos.map((photo) => (
                  <a key={photo.id} href={`/photos/${photo.id}`}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-border"
                  >
                    <img src={photo.imageUrl} alt={photo.title} className="h-full w-full object-cover transition-transform group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="truncate text-xs text-white">{photo.title}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Moments */}
          {result.moments.length > 0 && (
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-xs text-text-muted">
                <MessageCircle className="h-3.5 w-3.5" />共找到 {result.moments.length} 条相关动态
              </p>
              <div className="space-y-2">
                {result.moments.map((moment) => (
                  <div key={moment.id} className="rounded-lg border border-border bg-bg-elevated/50 p-3 text-sm text-text-secondary">
                    <p className="line-clamp-2">{moment.content}</p>
                    {moment.user?.nickname && <p className="mt-1 text-xs text-text-muted">— {moment.user.nickname}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.photos.length === 0 && result.moments.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-text-muted">没有找到相关内容，试试其他关键词</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

/* ─── 树洞倾诉 Tab ─── */
const STORAGE_KEY = 'treehole_messages'

function TreeHoleChat() {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch { /* ignore */ }
    return [
      { role: 'assistant', content: '你好呀，我是你的树洞朋友 🤗 有什么想说的、想分享的，都可以跟我说～开心的、难过的、烦恼的，我都会认真听着。' },
    ]
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [totalQuota] = useState(5)
  const [banned, setBanned] = useState(false)
  const [banMessage, setBanMessage] = useState('')
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading || banned || !user) return
    const text = input.trim()
    setInput('')
    setError('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)
    try {
      const { data } = await aiApi.chat(text)
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
      setRemaining(data.remaining)
    } catch (err: any) {
      const msg = err?.response?.data?.message || ''
      if (msg.includes('已用尽') || msg.includes('封禁') || msg.includes('5 小时')) {
        setBanned(true)
        setBanMessage(msg)
      } else {
        setError(msg || '发送失败，请稍后再试')
        // Remove the user message on failure
        setMessages((prev) => prev.slice(0, -1))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Quota bar */}
      <div className="mb-3 flex items-center gap-2 text-xs text-text-muted">
        <Heart className="h-3.5 w-3.5 text-accent" />
        {banned ? (
          <span className="text-error">{banMessage}</span>
        ) : (
          <span>今日还可倾诉 <span className="font-semibold text-accent">{remaining ?? totalQuota}</span> 次</span>
        )}
        <div className="ml-auto flex gap-1">
          {Array.from({ length: totalQuota }).map((_, i) => (
            <div key={i} className={`h-1.5 w-4 rounded-full ${remaining !== null && i < totalQuota - remaining ? 'bg-accent/30' : 'bg-accent/70'}`} />
          ))}
        </div>
      </div>

      {error && <p className="mb-2 text-xs text-error">{error}</p>}

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.map((msg, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`shrink-0 ${msg.role === 'user' ? 'ml-3' : 'mr-3'}`}>
              {msg.role === 'assistant' ? (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                  <Heart className="h-4 w-4 text-accent" />
                </div>
              ) : (
                <Avatar src={user?.avatar} fallback={user?.nickname || user?.username || '我'} size="sm" />
              )}
            </div>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
              <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent text-white'
                  : 'border border-border bg-bg-card text-text-secondary'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10"><Heart className="h-4 w-4 text-accent" /></div>
            <div className="rounded-xl border border-border bg-bg-card px-4 py-3"><Loader2 className="h-4 w-4 animate-spin text-accent" /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="说说你的心事..." onKeyDown={(e) => e.key === 'Enter' && handleSend()} disabled={loading || banned} />
        <Button onClick={handleSend} disabled={!input.trim() || loading || banned}>
          {banned ? <Heart className="h-4 w-4" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

/* ─── Main Page ─── */
type Tab = 'memory' | 'treehole'

export default function AIAssistant() {
  const { user } = useAuthStore()
  const [tab, setTab] = useState<Tab>('memory')

  const tabs: { key: Tab; label: string; icon: typeof Sparkles }[] = [
    { key: 'memory', label: '回忆助手', icon: Sparkles },
    { key: 'treehole', label: '树洞倾诉', icon: Heart },
  ]

  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col px-4 py-6">
      <PageMeta title="AI 助手" description="AI 回忆助手 & 树洞倾诉" />
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-text-primary sm:text-2xl">AI 助手</h1>
        <p className="mt-1 text-xs text-text-muted">{tab === 'memory' ? '输入关键词，帮你找回那些年的记忆' : '一个温暖的同窗树洞，倾听你的每一句'}</p>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-lg bg-bg-elevated p-1">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm transition-colors ${
              tab === t.key ? 'bg-accent text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'memory' ? <MemorySearch /> : user ? <TreeHoleChat /> : (
        <div className="flex flex-1 items-center justify-center text-text-muted">
          <p className="text-sm">请先登录后使用树洞倾诉</p>
        </div>
      )}
    </div>
  )
}
