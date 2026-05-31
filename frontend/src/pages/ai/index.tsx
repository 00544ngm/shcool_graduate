import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Send, Image, MessageCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { aiApi } from '@/services/api'

interface AiPhoto {
  id: string; title?: string; imageUrl: string; thumbnailUrl?: string
}

interface AiMoment {
  id: string; content: string; user?: { nickname?: string }
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  results?: {
    photos?: AiPhoto[]
    moments?: AiMoment[]
  }
}

const suggestions = [
  '军训',
  '运动会',
  '毕业旅行',
  '元旦晚会',
  '我们的宿舍',
  '一起奋斗的日子',
]

export default function AIAssistant() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好！我是 AI 回忆助手。告诉我一个关键词，我可以帮你找到相关的照片、视频和留言，一起重温美好时光。\n\n试试点击下方的建议关键词：',
    },
  ])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (q?: string) => {
    const searchQuery = q || query
    if (!searchQuery.trim() || loading) return

    const userMsg: Message = { role: 'user', content: searchQuery }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    setQuery('')

    try {
      const { data } = await aiApi.search(searchQuery)

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.summary || `关于「${searchQuery}」的回忆：`,
        results: {
          photos: (data.photos || []).map((p: any) => ({
            id: p.id,
            title: p.title,
            imageUrl: p.thumbnailUrl || p.imageUrl,
          })),
          moments: (data.moments || []).map((m: any) => ({
            id: m.id,
            content: m.content,
            user: m.user,
          })),
        },
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '抱歉，搜索时出现了问题，请稍后再试。' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-4 py-6">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-text-primary sm:text-2xl">AI 回忆助手</h1>
        <p className="mt-1 text-xs text-text-muted">输入关键词，帮你找回那些年的记忆</p>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`shrink-0 ${msg.role === 'user' ? 'ml-3' : 'mr-3'}`}>
              {msg.role === 'assistant' ? (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                  <Sparkles className="h-4 w-4 text-accent" />
                </div>
              ) : (
                <Avatar fallback="我" size="sm" />
              )}
            </div>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
              <div
                className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-accent text-white'
                    : 'border border-border bg-bg-card text-text-secondary'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {/* Results — Photos */}
              {msg.results?.photos && msg.results.photos.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 flex items-center gap-1.5 text-xs text-text-muted">
                    <Image className="h-3.5 w-3.5" />相关照片
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {msg.results.photos.map((photo) => (
                      <a
                        key={photo.id}
                        href={`/photos/${photo.id}`}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-border"
                      >
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="truncate text-xs text-white">{photo.title}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {/* Results — Moments */}
              {msg.results?.moments && msg.results.moments.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 flex items-center gap-1.5 text-xs text-text-muted">
                    <MessageCircle className="h-3.5 w-3.5" />相关动态
                  </p>
                  <div className="space-y-2">
                    {msg.results.moments.map((moment) => (
                      <div key={moment.id} className="rounded-lg border border-border bg-bg-elevated/50 p-2.5 text-xs text-text-secondary">
                        <p className="line-clamp-2">{moment.content}</p>
                        {moment.user?.nickname && (
                          <p className="mt-1 text-text-muted">— {moment.user.nickname}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <div className="rounded-xl border border-border bg-bg-card px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="mb-4 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => handleSearch(s)}
            disabled={loading}
            className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入关键词搜索回忆..."
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          disabled={loading}
        />
        <Button onClick={() => handleSearch()} disabled={!query.trim() || loading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
