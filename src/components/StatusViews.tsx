import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react'

export function LoadingView() {
  return (
    <main
      className="min-h-screen bg-bg text-ink flex items-center justify-center p-6"
      aria-busy="true"
    >
      <div className="card max-w-lg w-full p-8 space-y-6" role="status" aria-live="polite">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Initializing</span>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Syncing
          </span>
        </div>
        <div className="space-y-3" aria-hidden="true">
          <div className="h-8 w-2/3 skeleton" />
          <div className="h-4 w-full skeleton" />
          <div className="h-4 w-5/6 skeleton" />
        </div>
        <p className="text-sm text-muted">Loading portfolio content...</p>
      </div>
    </main>
  )
}

export interface UnavailableViewProps {
  onRetry: () => void
  isRetrying?: boolean
}

export function UnavailableView({ onRetry, isRetrying = false }: UnavailableViewProps) {
  return (
    <main className="min-h-screen bg-bg text-ink flex items-center justify-center p-6">
      <div className="card max-w-md w-full p-8 space-y-5" role="alert">
        <div className="flex items-center gap-3 text-accent">
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="eyebrow text-accent">Service Status</p>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Temporarily unavailable</h1>
        <p className="text-sm text-muted leading-relaxed">
          Portfolio data could not be loaded right now and no local copy is cached yet. Please try
          again in a moment.
        </p>
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="btn-primary"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          {isRetrying ? 'Retrying...' : 'Try Again'}
        </button>
      </div>
    </main>
  )
}

export interface EmptyViewProps {
  brandName: string
  onRefresh: () => void
  isRefreshing?: boolean
}

export function EmptyView({ brandName, onRefresh, isRefreshing = false }: EmptyViewProps) {
  return (
    <main className="min-h-screen bg-bg text-ink flex items-center justify-center p-6">
      <div className="card max-w-md w-full p-8 space-y-5">
        <div className="flex items-center gap-3 text-muted">
          <Inbox className="h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="eyebrow">Portfolio</p>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{brandName}</h1>
        <p className="text-sm text-muted leading-relaxed">
          No public sections are published yet. Updates made by the owner will appear here
          automatically.
        </p>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="btn-secondary"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </main>
  )
}
