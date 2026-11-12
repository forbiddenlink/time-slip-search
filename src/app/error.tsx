'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Root error boundary for the application.
 * Catches errors in page components and shows a correction notice on the same paper as the home page.
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Application error:', error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="ed-sheet w-full max-w-xl px-5 py-10 text-center md:px-10">
        <p className="ed-label text-edition">Correction</p>
        <h1 className="mt-3 font-display text-4xl italic text-balance md:text-5xl">This edition did not print</h1>
        <div className="mt-4 h-[7px] border-b border-t-[3px] border-ink" aria-hidden="true" />
        <p className="mt-4 font-body text-lg text-pretty">
          Something went wrong on our side. Try again, or go back to the start.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 border border-ink/40 p-3 text-left">
            <p className="ed-label text-faded">Error details</p>
            <p className="break-all font-mono text-xs">{error.message}</p>
            {error.digest && <p className="mt-1 font-mono text-xs text-faded">Digest: {error.digest}</p>}
          </div>
        )}

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="ed-btn">
            Try again
          </button>
          <a href="/" className="ed-btn inline-flex items-center justify-center">
            Back to start
          </a>
        </div>
      </div>
    </main>
  )
}
