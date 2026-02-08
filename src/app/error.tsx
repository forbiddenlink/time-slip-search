'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Root error boundary for the application
 * Catches errors in page components and displays a retro-styled error screen
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-crt-black flex items-center justify-center p-4">
      <div className="crt-screen p-8 max-w-lg w-full border-2 border-vhs-red/50">
        {/* Error Header */}
        <div className="text-center space-y-4">
          {/* VHS Error indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-vhs-red animate-pulse" />
            <span className="led-text text-vhs-red text-sm tracking-widest">
              TRACKING ERROR
            </span>
          </div>

          {/* Error icon */}
          <div className="text-6xl mb-4">
            <span className="animate-flicker inline-block">
              &#x26A0;
            </span>
          </div>

          {/* Error title */}
          <h1 className="font-display text-2xl text-aged-cream">
            Signal Lost
          </h1>

          {/* Error description */}
          <p className="text-aged-cream/70 text-sm max-w-sm mx-auto">
            The time machine encountered an unexpected temporal disturbance.
            Please adjust your tracking and try again.
          </p>

          {/* Technical details (in dev mode) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-crt-dark border border-crt-light/20 rounded text-left">
              <p className="text-phosphor-amber text-xs font-mono mb-1">ERROR DETAILS:</p>
              <p className="text-aged-cream/60 text-xs font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-aged-cream/40 text-xs font-mono mt-1">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="retro-btn px-6 py-3 bg-crt-medium border-2 border-phosphor-teal text-phosphor-teal
                       hover:bg-phosphor-teal hover:text-crt-black transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-phosphor-teal focus:ring-offset-2 focus:ring-offset-crt-black"
          >
            <span className="led-text text-sm tracking-wider">TRY AGAIN</span>
          </button>

          <a
            href="/"
            className="retro-btn px-6 py-3 bg-crt-dark border-2 border-crt-light/40 text-aged-cream
                       hover:border-aged-cream/60 transition-all duration-200 text-center
                       focus:outline-none focus:ring-2 focus:ring-aged-cream focus:ring-offset-2 focus:ring-offset-crt-black"
          >
            <span className="led-text text-sm tracking-wider">BACK TO START</span>
          </a>
        </div>

        {/* Decorative element */}
        <div className="mt-8 flex items-center gap-2 justify-center text-crt-light/40 text-xs">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-crt-light/20" />
          <span className="font-mono">ERR_TEMPORAL_FLUX</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-crt-light/20" />
        </div>
      </div>
    </div>
  )
}
