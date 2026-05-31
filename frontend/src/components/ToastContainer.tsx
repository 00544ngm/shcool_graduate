import { useToastStore } from '@/stores/toast'
import { X } from 'lucide-react'

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const remove = useToastStore((s) => s.remove)

  if (toasts.length === 0) return null

  const colors: Record<string, string> = {
    success: 'border-l-green-500 bg-green-500/10',
    error: 'border-l-red-500 bg-red-500/10',
    info: 'border-l-accent bg-accent/10',
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-2 rounded-lg border border-border border-l-4 px-4 py-3 shadow-lg backdrop-blur-md animate-slide-up ${colors[t.type]}`}
        >
          <p className="flex-1 text-sm text-text-primary">{t.message}</p>
          <button onClick={() => remove(t.id)} className="text-text-muted hover:text-text-primary">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
