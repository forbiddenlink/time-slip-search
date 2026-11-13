'use client'

/** Printing-press placeholder: ruled lines on paper, no VHS chrome. */
export function LoadingSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Setting the edition">
      <div className="border-y-[3px] border-newsprint py-4 text-center">
        <p className="ed-label text-muted">Setting type</p>
        <div className="ed-skeleton-line mx-auto mt-3 h-10 w-64 max-w-full" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[0, 1].map((col) => (
          <div key={col} className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-t border-newsprint/30 pt-3">
                <div className="ed-skeleton-line h-5 w-3/4" />
                <div className="ed-skeleton-line mt-2 h-3 w-1/2" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function MessageSkeleton() {
  return (
    <div role="status" aria-live="polite" className="border-y border-newsprint/40 py-4">
      <p className="ed-label text-muted">Searching the archives</p>
      <div className="ed-skeleton-line mt-3 h-4 w-2/3" />
    </div>
  )
}
