'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="p-6 text-center border rounded bg-crt-dark border-vhs-red/50">
          <div className="mb-3 text-sm tracking-widest led-text text-vhs-red">
            ERROR
          </div>
          <p className="mb-4 text-aged-cream/80">
            Something went wrong displaying this content.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-4 py-2 text-sm transition-all border rounded bg-crt-dark border-phosphor-teal/30 hover:border-phosphor-teal hover:shadow-glow-teal text-aged-cream hover-lift led-text"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Specific error boundary for visualizations
export function VisualizationErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 text-center border rounded bg-crt-dark border-crt-light/30">
          <p className="text-sm text-aged-cream/60">Unable to load visualization</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
