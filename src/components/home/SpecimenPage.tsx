/**
 * Ruled, empty front page shown before any search. It carries no facts: every
 * slot is a labelled placeholder that the searched date fills in.
 */
function Lines({ count, className = '' }: Readonly<{ count: number; className?: string }>) {
  return (
    <div className={`space-y-2.5 ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="ed-skeleton-line" style={{ width: i === count - 1 ? '62%' : '100%' }} />
      ))}
    </div>
  )
}

const PRICE_ROWS = ['Gas, per gallon', 'Minimum wage, per hour', 'Consumer price index'] as const

export function SpecimenPage() {
  return (
    <div className="border-t-[3px] border-ink">
      <div className="grid md:grid-cols-12">
        <section aria-labelledby="slot-song" className="px-5 py-6 md:col-span-8 md:border-r md:border-ink md:px-10 md:py-8">
          <h2 id="slot-song" className="ed-label text-faded">No. 1 song</h2>
          <div className="mt-4 space-y-3" aria-hidden="true">
            <div className="ed-skeleton-line !h-7 w-full" />
            <div className="ed-skeleton-line !h-7 w-4/5" />
          </div>
          <Lines count={4} className="mt-6" />
        </section>
        <section aria-labelledby="slot-prices" className="border-t border-ink px-5 py-6 md:col-span-4 md:border-t-0 md:px-8 md:py-8">
          <h2 id="slot-prices" className="ed-label text-faded">Cost of living</h2>
          <ul className="mt-4 space-y-3">
            {PRICE_ROWS.map((row) => (
              <li key={row} className="flex items-end font-display text-base">
                <span>{row}</span>
                <span className="ed-leader" aria-hidden="true" />
                <span aria-hidden="true" className="ed-label text-faded">$ ----</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="grid border-t border-ink md:grid-cols-2">
        <section aria-labelledby="slot-movies" className="px-5 py-6 md:border-r md:border-ink md:px-10">
          <h2 id="slot-movies" className="ed-label text-faded">At the movies</h2>
          <Lines count={3} className="mt-4" />
        </section>
        <section aria-labelledby="slot-events" className="border-t border-ink px-5 py-6 md:border-t-0 md:px-10">
          <h2 id="slot-events" className="ed-label text-faded">On this day</h2>
          <Lines count={3} className="mt-4" />
        </section>
      </div>
      <p className="border-t border-ink px-5 py-3 text-center font-display text-sm italic text-faded md:px-10">
        Specimen page. Pick a date above and it fills in.
      </p>
    </div>
  )
}
