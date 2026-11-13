'use client'

import { useEffect, useState } from 'react'
import { getSeasonalPicks, type FamousDate } from '@/lib/famous-dates'

interface IndexExample {
  readonly text: string
  readonly query: string
}

interface EditionIndexProps {
  examples: readonly IndexExample[]
  onSelect: (query: string) => void
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

function famousQuery(pick: FamousDate): string {
  const [month, day] = pick.date.split('-')
  const name = MONTHS[Number.parseInt(month ?? '1', 10) - 1] ?? 'January'
  return `${name} ${Number.parseInt(day ?? '1', 10)}, ${pick.year}`
}

function IndexRow({ label, value, onClick }: Readonly<{ label: string; value: string; onClick: () => void }>) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full min-h-11 items-end gap-0 py-2 text-left text-newsprint hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-newsprint"
      >
        <span className="font-display text-lg leading-snug group-hover:underline underline-offset-4">{label}</span>
        <span className="ed-leader" aria-hidden="true" />
        <span className="ed-label whitespace-nowrap text-muted group-hover:text-newsprint">{value}</span>
      </button>
    </li>
  )
}

/** Printed index of editions: example phrases and this season's famous dates, with dotted leaders. */
export function EditionIndex({ examples, onSelect }: Readonly<EditionIndexProps>) {
  const [picks, setPicks] = useState<FamousDate[]>([])

  useEffect(() => {
    setPicks(getSeasonalPicks().slice(0, 6))
  }, [])

  return (
    <section aria-labelledby="index-heading" className="grid gap-10 md:grid-cols-2">
      <div>
        <h2 id="index-heading" className="ed-label text-newsprint border-b-2 border-newsprint pb-2">
          Index of editions
        </h2>
        <ul className="divide-y divide-newsprint/15">
          {examples.map((example) => (
            <IndexRow
              key={example.query}
              label={example.text}
              value={example.query}
              onClick={() => onSelect(example.query)}
            />
          ))}
        </ul>
      </div>
      {picks.length > 0 && (
        <div>
          <h2 className="ed-label text-newsprint border-b-2 border-newsprint pb-2">
            Famous dates this season
          </h2>
          <ul className="divide-y divide-newsprint/15">
            {picks.map((pick) => (
              <IndexRow
                key={`${pick.date}-${pick.year}`}
                label={pick.title}
                value={String(pick.year)}
                onClick={() => onSelect(famousQuery(pick))}
              />
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
