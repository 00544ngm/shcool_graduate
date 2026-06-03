import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { PageMeta } from '@/components/PageMeta'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary px-4 text-center">
      <PageMeta title="404 - 页面未找到" description="你访问的页面不存在" />
      <Sparkles className="mb-4 h-16 w-16 text-accent" />
      <h1 className="mb-2 text-4xl font-bold text-text-primary">404</h1>
      <p className="mb-8 text-text-muted">你访问的页面不存在或已被移除</p>
      <Link
        to="/"
        className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90"
      >
        返回首页
      </Link>
    </div>
  )
}
