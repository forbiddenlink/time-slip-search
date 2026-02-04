'use client'

export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton - VHS label style */}
      <div className="bg-gradient-to-r from-crt-medium via-crt-dark to-crt-medium border border-crt-light/40 rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-vhs-red animate-pulse" />
            <div className="h-3 w-16 bg-crt-light/20 rounded animate-pulse" />
          </div>
          <div className="h-3 w-10 bg-crt-light/20 rounded animate-pulse" />
        </div>
        <div className="h-10 w-48 bg-crt-light/10 rounded mx-auto animate-pulse" />
        <div className="h-4 w-32 bg-crt-light/5 rounded mx-auto mt-3 animate-pulse" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left column */}
        <div className="space-y-4">
          {/* Songs skeleton - vinyl style */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-2 border-b border-crt-light/20">
              <div className="w-8 h-8 rounded-full bg-crt-light/20 animate-pulse" />
              <div className="h-6 w-24 bg-crt-light/10 rounded animate-pulse" />
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 bg-crt-dark/50 border border-crt-light/20 rounded"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-full bg-crt-light/20 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 bg-crt-light/10 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-crt-light/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Prices skeleton - LED display style */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-2 border-b border-crt-light/20">
              <div className="w-8 h-8 bg-crt-light/20 rounded animate-pulse" />
              <div className="h-6 w-28 bg-crt-light/10 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-crt-black border-2 border-crt-light/20 rounded p-3 text-center"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="w-8 h-8 bg-crt-light/20 rounded-full mx-auto mb-2 animate-pulse" />
                  <div className="h-8 w-16 bg-crt-light/10 rounded mx-auto mb-2 animate-pulse" />
                  <div className="h-3 w-10 bg-crt-light/5 rounded mx-auto animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Movies skeleton - film strip style */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-2 border-b border-crt-light/20">
              <div className="w-8 h-8 bg-crt-light/20 rounded animate-pulse" />
              <div className="h-6 w-28 bg-crt-light/10 rounded animate-pulse" />
            </div>
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex gap-4 p-3 bg-crt-dark/50 border border-crt-light/20 rounded"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="w-16 h-24 bg-crt-light/20 rounded animate-pulse" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-5 w-3/4 bg-crt-light/10 rounded animate-pulse" />
                  <div className="h-3 w-12 bg-crt-light/5 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-crt-light/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Events skeleton - newspaper clipping style */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-2 border-b border-crt-light/20">
              <div className="w-8 h-8 bg-aged-paper/20 rounded animate-pulse" />
              <div className="h-6 w-28 bg-crt-light/10 rounded animate-pulse" />
            </div>
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-aged-paper/10 rounded p-3"
                style={{
                  marginLeft: `${i * 2}px`,
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <div className="h-4 w-full bg-crt-light/10 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-crt-light/5 rounded mt-2 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function MessageSkeleton() {
  return (
    <div className="flex justify-start">
      <div className="bg-crt-dark border border-crt-light/30 rounded px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="led-text text-phosphor-teal text-xs">OUTPUT</span>
        </div>
        <div className="flex items-center gap-2">
          {/* VHS tracking line style loading */}
          <div className="flex gap-1.5">
            <div
              className="w-2 h-2 bg-phosphor-teal rounded-full animate-pulse"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="w-2 h-2 bg-phosphor-teal rounded-full animate-pulse"
              style={{ animationDelay: '150ms' }}
            />
            <div
              className="w-2 h-2 bg-phosphor-teal rounded-full animate-pulse"
              style={{ animationDelay: '300ms' }}
            />
          </div>
          <span className="led-text text-phosphor-teal/50 text-sm">
            SEARCHING ARCHIVES
          </span>
        </div>
      </div>
    </div>
  )
}
