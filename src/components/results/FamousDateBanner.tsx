'use client'

import type { FamousDate } from '@/lib/famous-dates'

const CATEGORY_LABELS: Record<string, string> = {
  space: 'Space',
  politics: 'Politics',
  music: 'Music',
  technology: 'Technology',
  sports: 'Sports',
  disaster: 'Alert',
  culture: 'Culture',
}

export function FamousDateBanner({ famousDate }: { famousDate: FamousDate }) {
  const categoryLabel = CATEGORY_LABELS[famousDate.category] ?? 'History'

  return (
    <aside aria-label="Did you know" className="border-y-2 border-edition py-4">
      <p className="ed-label text-edition">Did you know / {categoryLabel}</p>
      <h3 className="mt-2 font-display text-2xl leading-snug text-balance">
        {famousDate.title}
        <span className="ed-label ml-3 text-faded">{famousDate.year}</span>
      </h3>
      <p className="mt-2 font-body text-base text-pretty">{famousDate.description}</p>
    </aside>
  )
}
