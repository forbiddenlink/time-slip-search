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
        <div role="alert" className="border-y-2 border-edition p-6 text-center text-ink">
          <p className="mb-3 ed-label text-edition">Correction</p>
          <p className="mb-4 font-body text-base">
            Something went wrong displaying this content.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="ed-btn"
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
        <div className="border-y border-ink/40 p-4 text-center">
          <p className="font-body text-sm text-faded">Unable to load visualization</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
