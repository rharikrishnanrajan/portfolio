import { Component, type ReactNode } from 'react'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback
      }
      return (
        <main className="min-h-screen bg-bg text-ink flex items-center justify-center p-6">
          <div className="card max-w-md w-full p-8 space-y-4" role="alert">
            <p className="eyebrow">System Notice</p>
            <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
            <p className="text-sm text-muted leading-relaxed">
              We ran into an unexpected display issue. Please reload the page to restore the
              portfolio view.
            </p>
            <button type="button" onClick={this.handleReload} className="btn-primary">
              Reload Page
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
