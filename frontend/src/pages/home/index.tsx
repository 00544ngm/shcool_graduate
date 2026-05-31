import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Image, Video, Clock, MapPin, Users, Mail, MessageCircle, ArrowRight, Star, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

/* ─── Graduation Countdown ─── */
function getCountdown() {
  const grad = new Date('2026-06-30T00:00:00')
  const now = new Date()
  const diff = grad.getTime() - now.getTime()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: false,
  }
}

function Countdown() {
  const [cd, setCd] = useState(getCountdown)
  useEffect(() => {
    const timer = setInterval(() => setCd(getCountdown()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (cd.expired) {
    return <p className="text-2xl font-bold text-accent animate-glow">毕业快乐！🎉</p>
  }

  const items = [
    { label: '天', value: cd.days },
    { label: '时', value: cd.hours },
    { label: '分', value: cd.minutes },
    { label: '秒', value: cd.seconds },
  ]

  return (
    <div className="flex gap-3 sm:gap-6">
      {items.map(({ label, value }, idx) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + idx * 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl border border-accent/20 bg-accent/5 backdrop-blur-sm">
            <span className="text-2xl sm:text-3xl font-bold text-accent tabular-nums">
              {String(value).padStart(2, '0')}
            </span>
          </div>
          <span className="mt-1.5 text-xs text-text-muted">{label}</span>
        </motion.div>
      ))}
    </div>
  )
}

/* ─── Floating Stars ─── */
function Stars() {
  const stars = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
    })),
  [])

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* ─── Scrolling Message Bar ─── */
const scrollMessages = [
  '📸 上传了新照片 — 时光定格，青春不散',
  '🎬 发布了新视频 — 每一帧都是故事',
  '💬 发表了新动态 — 分享此刻心情',
  '🎓 距离毕业越来越近，珍惜每一天',
  '🌟 班级时光馆，珍藏我们的回忆',
]

function ScrollingBar() {
  return (
    <div className="mt-8 overflow-hidden rounded-lg border border-accent/10 bg-accent/5 px-4 py-2.5 backdrop-blur-sm">
      <div className="flex animate-marquee gap-8 whitespace-nowrap">
        {[...scrollMessages, ...scrollMessages].map((msg, idx) => (
          <span key={idx} className="flex items-center gap-2 text-xs text-accent/80">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent/60" />
            {msg}
          </span>
        ))}
      </div>
    </div>
  )
}
const memoryCards = [
  { icon: Image, label: '星空照片墙', desc: '浏览班级照片', color: 'from-amber-500/20 to-amber-600/10', path: '/photos' },
  { icon: Video, label: '视频记忆馆', desc: '重温珍贵影像', color: 'from-purple-500/20 to-purple-600/10', path: '/videos' },
  { icon: Clock, label: '时间轴', desc: '回顾精彩瞬间', color: 'from-blue-500/20 to-blue-600/10', path: '/timeline' },
  { icon: MessageCircle, label: '班级动态', desc: '分享此刻心情', color: 'from-green-500/20 to-green-600/10', path: '/moments' },
]

function FloatingCards() {
  return (
    <div className="relative mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 px-4 sm:gap-6 lg:grid-cols-4">
      {memoryCards.map((card, idx) => (
        <Link to={card.path} key={card.label}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + idx * 0.12, duration: 0.6 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className={`group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br ${card.color} bg-bg-card/60 p-5 backdrop-blur-sm transition-colors hover:border-accent/30`}
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <card.icon className="h-5 w-5 text-accent" />
            </div>
            <h3 className="mb-1 font-medium text-text-primary">{card.label}</h3>
            <p className="text-xs text-text-muted">{card.desc}</p>
          </motion.div>
        </Link>
      ))}
    </div>
  )
}

/* ─── Features ─── */
const features = [
  { icon: Image, title: '星空照片墙', desc: 'Three.js 粒子星空背景，照片如繁星般悬浮。点击聚焦，左右浏览，每一张都是一段故事。' },
  { icon: Video, title: '视频记忆馆', desc: '瀑布流视频展示，自动播放预览。支持弹幕、评论，让回忆更加生动。' },
  { icon: Clock, title: '时光轴', desc: '纵向时间线，从入学到毕业，自动聚合照片、视频、动态。' },
  { icon: MapPin, title: '班级地图', desc: '毕业后天各一方？在地图上看看同学们都去了哪里，点亮每一座城市。' },
  { icon: Users, title: '人物档案馆', desc: '每位同学的个人主页，头像、寄语、相册、留言，记录青春的模样。' },
  { icon: Mail, title: '未来信箱', desc: '写给未来的自己或同学。一年、三年、五年后开启，时光会赋予文字不一样的力量。' },
  { icon: MessageCircle, title: '班级动态', desc: '类似朋友圈的班级社交圈。图文、视频，记录日常点滴。' },
  { icon: Sparkles, title: 'AI 回忆助手', desc: '输入关键词，AI 自动检索相关照片、视频、留言，生成专属回忆总结。' },
]

function FeaturesSection() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        className="mb-16 text-center"
      >
        <h2 className="mb-3 text-2xl font-bold text-text-primary sm:text-3xl">时光馆功能</h2>
        <p className="text-sm text-text-secondary">每一个功能，都是为了让回忆更立体</p>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, idx) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -4 }}
            className="group rounded-xl border border-border bg-bg-card/50 p-5 transition-colors hover:border-accent/20"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <f.icon className="h-5 w-5 text-accent" />
            </div>
            <h3 className="mb-1.5 font-medium text-text-primary">{f.title}</h3>
            <p className="text-xs leading-relaxed text-text-muted">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ─── CTA ─── */
function CTASection() {
  return (
    <section className="relative z-10 border-t border-border px-4 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="mb-3 text-2xl font-bold text-text-primary sm:text-3xl">开始你的时光之旅</h2>
        <p className="mb-8 text-sm text-text-secondary">加入班级时光馆，与同学们一起珍藏每一刻</p>
        <Link to="/photos">
          <Button size="lg" className="px-8 text-base">
            <Sparkles className="mr-2 h-5 w-5" />
            进入时光馆
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </section>
  )
}

/* ─── Main Page ─── */
export default function Home() {
  return (
    <div className="relative">
      <Stars />

      {/* Hero */}
      <section className="relative z-10 flex min-h-[90vh] flex-col items-center justify-center px-4 pt-16 text-center">
        {/* Radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.1),transparent_70%)]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs text-accent">
            <Star className="h-3 w-3" />
            毕业季 · 珍藏青春
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="bg-gradient-to-r from-amber-200 via-accent to-amber-600 bg-clip-text text-transparent">
              班级时光馆
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-lg text-sm leading-relaxed text-text-secondary sm:text-base">
            每一张照片都是时间的切片，每一段视频都是青春的印记。
            <br />
            在这里，珍藏我们共同的记忆。
          </p>

          {/* Countdown */}
          <div className="mb-8">
            <p className="mb-3 text-xs text-text-muted">距离毕业还有</p>
            <Countdown />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center gap-4"
          >
            <Link to="/photos">
              <Button size="lg" className="px-8 text-base animate-glow">
                <Sparkles className="mr-2 h-5 w-5" />
                进入时光馆
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/members">
              <Button size="lg" variant="outline" className="px-8 text-base border-accent/30 text-accent hover:bg-accent/10">
                <Users className="mr-2 h-5 w-5" />
                关于我们
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scrolling Message Bar */}
        <ScrollingBar />

        {/* Floating Cards */}
        <FloatingCards />

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ delay: 2, y: { duration: 2, repeat: Infinity } }}
          className="mt-16"
        >
          <ChevronDown className="h-6 w-6 text-text-muted" />
        </motion.div>
      </section>

      <FeaturesSection />
      <CTASection />
    </div>
  )
}
