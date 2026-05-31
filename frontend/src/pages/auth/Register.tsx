import { PageMeta } from '@/components/PageMeta'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, UserPlus, Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', nickname: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuthStore()
  const navigate = useNavigate()

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setError('请填写所有必填项')
      return
    }
    if (form.password.length < 8) {
      setError('密码至少需要8个字符')
      return
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      setError('密码必须包含大小写字母和数字')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('请输入有效的邮箱地址')
      return
    }

    setLoading(true)
    try {
      await register({
        username: form.username,
        email: form.email,
        nickname: form.nickname || form.username,
        password: form.password,
      })
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || '注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <PageMeta title="注册" description="加入班级时光馆" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.08),transparent_60%)]" />

      <div className="relative w-full max-w-md animate-fade-in">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 text-2xl font-bold text-accent">
          <Sparkles className="h-6 w-6" />
          班级时光馆
        </Link>

        <div className="rounded-xl border border-border bg-bg-card p-8 shadow-xl">
          <h1 className="mb-1 text-xl font-semibold text-text-primary">创建账号</h1>
          <p className="mb-6 text-sm text-text-secondary">加入班级时光馆，珍藏每一刻</p>

          {error && (
            <div className="mb-4 rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">用户名 *</label>
              <Input value={form.username} onChange={update('username')} placeholder="输入用户名" disabled={loading} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">邮箱 *</label>
              <Input type="email" value={form.email} onChange={update('email')} placeholder="输入邮箱" disabled={loading} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">昵称</label>
              <Input value={form.nickname} onChange={update('nickname')} placeholder="输入昵称（默认为用户名）" disabled={loading} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">密码 *</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="至少8位，含大小写字母和数字"
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">确认密码 *</label>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={update('confirmPassword')}
                placeholder="再次输入密码"
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  注册中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  注册
                </span>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            已有账号？
            <Link to="/login" className="ml-1 font-medium text-accent hover:text-accent-hover transition-colors">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
