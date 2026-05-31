import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Plus, Clock, Lock, Unlock, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { mailboxApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

interface Letter {
  id: string
  title: string
  content: string
  unlockType: string
  unlockDate?: string
  status: 'LOCKED' | 'OPENED'
  createdAt: string
  sender?: { nickname?: string; username: string }
}

const unlockLabels: Record<string, string> = {
  '1Y': '1年后开启',
  '3Y': '3年后开启',
  '5Y': '5年后开启',
  'CUSTOM': '自定义时间',
}

export default function Mailbox() {
  const { user } = useAuthStore()
  const [letters, setLetters] = useState<Letter[]>([])
  const [openedLetters, setOpenedLetters] = useState<Letter[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'my' | 'opened'>('my')
  const [writeOpen, setWriteOpen] = useState(false)
  const [viewLetter, setViewLetter] = useState<Letter | null>(null)
  const [form, setForm] = useState({ title: '', content: '', unlockType: '1Y', unlockDate: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      mailboxApi.findMy().then(({ data }) => setLetters(data.data || data || [])).catch(() => {}),
      mailboxApi.findOpened().then(({ data }) => setOpenedLetters(data.data || data || [])).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const handleWrite = async () => {
    if (!form.title.trim() || !form.content.trim()) return
    setSubmitting(true)
    try {
      await mailboxApi.create({
        title: form.title,
        content: form.content,
        unlockType: form.unlockType,
        unlockDate: form.unlockType === 'CUSTOM' ? form.unlockDate : undefined,
      })
      setWriteOpen(false)
      setForm({ title: '', content: '', unlockType: '1Y', unlockDate: '' })
      const { data } = await mailboxApi.findMy()
      setLetters(data.data || data || [])
    } catch {} finally {
      setSubmitting(false)
    }
  }

  const handleOpen = async (letter: Letter) => {
    try {
      await mailboxApi.openLetter(letter.id)
      setViewLetter({ ...letter, status: 'OPENED' })
      // Refresh
      const [my, opened] = await Promise.all([
        mailboxApi.findMy(),
        mailboxApi.findOpened(),
      ])
      setLetters(my.data.data || my.data || [])
      setOpenedLetters(opened.data.data || opened.data || [])
    } catch {}
  }

  const activeLetters = tab === 'my' ? letters : openedLetters

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary sm:text-2xl">未来信箱</h1>
          <p className="mt-1 text-xs text-text-muted">写给未来的自己，让时光赋予文字力量</p>
        </div>
        {user && (
          <Button onClick={() => setWriteOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />写信
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-bg-secondary p-1">
        <button
          onClick={() => setTab('my')}
          className={`flex-1 rounded-md px-4 py-2 text-sm transition-colors ${tab === 'my' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}
        >
          我的信箱 ({letters.length})
        </button>
        <button
          onClick={() => setTab('opened')}
          className={`flex-1 rounded-md px-4 py-2 text-sm transition-colors ${tab === 'opened' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}
        >
          收到的信 ({openedLetters.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : activeLetters.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-text-muted">
          <Mail className="mb-3 h-12 w-12" />
          <p>{tab === 'my' ? '还没有写信' : '还没有收到来信'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {activeLetters.map((letter) => (
              <motion.div
                key={letter.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-bg-card p-5 transition-colors hover:border-accent/20 cursor-pointer"
                onClick={() => {
                  if (letter.status === 'LOCKED') {
                    // Check if unlock time has come
                    handleOpen(letter)
                  } else {
                    setViewLetter(letter)
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-text-primary">{letter.title}</h3>
                    <p className="mt-1 text-xs text-text-muted line-clamp-2">{letter.content}</p>
                  </div>
                  <div className="ml-4 shrink-0">
                    {letter.status === 'LOCKED' ? (
                      <div className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">
                        <Lock className="h-3 w-3" />
                        {unlockLabels[letter.unlockType] || letter.unlockType}
                      </div>
                    ) : (
                      <Badge variant="success">
                        <Unlock className="mr-1 h-3 w-3" />
                        已开启
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(letter.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                  {letter.sender && (
                    <span>{letter.sender.nickname || letter.sender.username}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Write Dialog */}
      <Dialog open={writeOpen} onClose={() => setWriteOpen(false)}>
        <DialogTitle>写给未来</DialogTitle>
        <div className="space-y-4">
          <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="信件标题 *" />
          <Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="写下你想对未来的自己或同学说的话..." rows={6} />
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">开启时间</label>
            <div className="grid grid-cols-4 gap-2">
              {['1Y', '3Y', '5Y', 'CUSTOM'].map((type) => (
                <button
                  key={type}
                  onClick={() => setForm((f) => ({ ...f, unlockType: type }))}
                  className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                    form.unlockType === type
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-text-muted hover:border-accent/30'
                  }`}
                >
                  {unlockLabels[type] || type}
                </button>
              ))}
            </div>
          </div>
          {form.unlockType === 'CUSTOM' && (
            <Input type="date" value={form.unlockDate} onChange={(e) => setForm((f) => ({ ...f, unlockDate: e.target.value }))} />
          )}
          <Button onClick={handleWrite} className="w-full" disabled={!form.title.trim() || !form.content.trim() || submitting}>
            {submitting ? '寄出中...' : '寄出信件'}
          </Button>
        </div>
      </Dialog>

      {/* View Letter Dialog */}
      <Dialog open={!!viewLetter} onClose={() => setViewLetter(null)} className="max-w-lg">
        {viewLetter && (
          <>
            <DialogTitle>{viewLetter.title}</DialogTitle>
            <div className="space-y-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                {viewLetter.content}
              </p>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>{viewLetter.sender?.nickname || viewLetter.sender?.username}</span>
                <span>{new Date(viewLetter.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
          </>
        )}
      </Dialog>
    </div>
  )
}
