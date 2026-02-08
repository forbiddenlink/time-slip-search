/**
 * Root loading state for the application
 * Displayed during initial page load and route transitions
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-crt-black flex items-center justify-center">
      <div className="crt-screen p-8 max-w-md w-full mx-4">
        {/* CRT Boot Animation */}
        <div className="text-center space-y-6">
          {/* Power-on indicator */}
          <div className="flex justify-center">
            <div className="w-3 h-3 rounded-full bg-phosphor-green animate-pulse shadow-glow-green" />
          </div>

          {/* Loading text with scan effect */}
          <div className="space-y-2">
            <h1 className="led-text text-phosphor-teal text-2xl tracking-widest animate-pulse">
              LOADING
            </h1>
            <div className="flex justify-center gap-1">
              <span
                className="w-2 h-2 bg-phosphor-teal rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <span
                className="w-2 h-2 bg-phosphor-teal rounded-full animate-bounce"
                style={{ animationDelay: '100ms' }}
              />
              <span
                className="w-2 h-2 bg-phosphor-teal rounded-full animate-bounce"
                style={{ animationDelay: '200ms' }}
              />
            </div>
          </div>

          {/* Retro status line */}
          <div className="text-aged-cream/40 text-xs font-mono space-y-1">
            <p>INITIALIZING TIME CAPSULE...</p>
            <p className="text-phosphor-amber/60">STAND BY</p>
          </div>

          {/* Decorative scan line */}
          <div className="h-px bg-gradient-to-r from-transparent via-phosphor-teal/30 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  )
}
