import { useState, useEffect, useCallback, useRef } from 'react'

interface DanmakuItem {
  id: string
  text: string
  top: number
  time: number
  color?: string
}

interface DanmakuProps {
  duration: number // video duration in seconds
  currentTime: number
  comments: Array<{ id: string; content: string; createdAt: string; user?: { nickname?: string; username?: string } }>
  playing: boolean
}

const COLORS = ['#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#a855f7', '#ec4899', '#fff']

export function Danmaku({ duration, currentTime, comments, playing }: DanmakuProps) {
  const [items, setItems] = useState<DanmakuItem[]>([])
  const sentRef = useRef<Set<string>>(new Set())

  const sendDanmaku = useCallback(() => {
    if (!playing) return
    const newItems: DanmakuItem[] = []
    for (const c of comments) {
      if (sentRef.current.has(c.id)) continue
      // Stagger danmaku across the video duration
      const idx = comments.indexOf(c)
      const targetTime = duration > 0 ? (idx / Math.max(comments.length, 1)) * duration : 0
      if (currentTime >= targetTime && currentTime < targetTime + 5) {
        sentRef.current.add(c.id)
        const name = c.user?.nickname || c.user?.username || ''
        newItems.push({
          id: c.id,
          text: name ? `${name}: ${c.content}` : c.content,
          top: Math.random() * 60 + 10, // 10%-70% from top
          time: currentTime,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        })
      }
    }
    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems])
    }
  }, [comments, currentTime, duration, playing])

  useEffect(() => {
    sendDanmaku()
  }, [sendDanmaku])

  // Clean up old items
  useEffect(() => {
    const timer = setInterval(() => {
      setItems((prev) => prev.filter((item) => currentTime - item.time < 8))
    }, 1000)
    return () => clearInterval(timer)
  }, [currentTime])

  // Reset when comments change
  useEffect(() => {
    sentRef.current.clear()
    setItems([])
  }, [comments])

  if (!playing || items.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((item) => (
        <div
          key={item.id + item.time}
          className="absolute whitespace-nowrap text-sm font-medium drop-shadow-lg animate-danmaku"
          style={{
            top: `${item.top}%`,
            color: item.color,
            animationDuration: `${6 + Math.random() * 4}s`,
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  )
}
