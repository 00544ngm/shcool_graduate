import { PageMeta } from '@/components/PageMeta'
import { useState, useEffect, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Save, User, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth'
import { userApi } from '@/services/api'

export default function Settings() {
  const { user, loadProfile } = useAuthStore()
  const [form, setForm] = useState({ nickname: '', bio: '', city: '', dormitory: '' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setForm({
        nickname: user.nickname || '',
        bio: user.bio || '',
        city: user.city || '',
        dormitory: user.dormitory || '',
      })
    }
  }, [user])

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await userApi.updateProfile({
        nickname: form.nickname,
        bio: form.bio,
        city: form.city,
        dormitory: form.dormitory,
      })
      await loadProfile()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center py-20 text-text-muted">
        <p>请先登录</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-2xl px-4 py-6">
      <PageMeta title="个人设置" description="编辑个人资料" />
      <p className="mb-8 text-xs text-text-muted">完善你的个人资料</p>

      <div className="rounded-xl border border-border bg-bg-card p-6">
        {/* Avatar section */}
        <div className="mb-8 flex items-center gap-4">
          <div className="relative group">
            <Avatar src={user.avatar} fallback={form.nickname || user.username} size="xl" />
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h2 className="font-medium text-text-primary">{form.nickname || user.username}</h2>
            <p className="text-sm text-text-muted">@{user.username}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{error}</div>
        )}
        {success && (
          <div className="mb-4 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">保存成功</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">昵称</label>
            <Input value={form.nickname} onChange={update('nickname')} placeholder="输入你的昵称" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">个人简介</label>
            <Textarea value={form.bio} onChange={update('bio')} placeholder="写一段关于自己的介绍..." rows={3} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">所在城市</label>
              <Input value={form.city} onChange={update('city')} placeholder="毕业后所在城市" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">宿舍</label>
              <Input value={form.dormitory} onChange={update('dormitory')} placeholder="如：A302" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  保存中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  保存
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
