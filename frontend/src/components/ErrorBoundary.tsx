import { Component, type ReactNode } from 'react'
import { Sparkles } from 'lucide-react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary px-4 text-center">
        <Sparkles className="mb-4 h-12 w-12 text-accent" />
        <h1 className="mb-2 text-xl font-bold text-text-primary">页面出了一点小问题</h1>
        <p className="mb-6 text-sm text-text-muted">请刷新页面或稍后再试</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-accent px-6 py-2 text-sm text-white transition-colors hover:bg-accent/90"
        >
          刷新页面
        </button>
        {this.state.error && (
          <details className="mt-6 max-w-md text-left">
            <summary className="cursor-pointer text-xs text-text-muted">错误详情</summary>
            <pre className="mt-2 whitespace-pre-wrap text-xs text-text-muted">{this.state.error.stack}</pre>
          </details>
        )}
      </div>
    )
  }
}
