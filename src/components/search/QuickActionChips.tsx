'use client'

import { useEffect, useMemo, useState } from 'react'

interface QuickActionChipsProps {
  onSelect: (query: string) => void
  visible: boolean
}

interface ChipConfig {
  label: string
  getQuery: () => string
}

const DECADES = ['60s', '70s', '80s', '90s', '2000s'] as const
const DECADE_START: Record<(typeof DECADES)[number], number> = {
  '60s': 1960,
  '70s': 1970,
  '80s': 1980,
  '90s': 1990,
  '2000s': 2000,
}

function dayOfYear(today: Date): number {
  return Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
}

export function QuickActionChips({ onSelect, visible }: Readonly<QuickActionChipsProps>) {
  // The decade label depends on the visitor's local date. The server renders in UTC, so
  // computing it during render made server and client disagree (React error #418) for
  // anyone whose local day differs from UTC. Render a stable label first and fill in
  // the decade after mount.
  const [decade, setDecade] = useState<(typeof DECADES)[number] | null>(null)

  useEffect(() => {
    setDecade(DECADES[dayOfYear(new Date()) % DECADES.length] ?? '80s')
  }, [])

  const chips = useMemo<ChipConfig[]>(() => {
    return [
      {
        label: 'This Day in History',
        getQuery: () => {
          const today = new Date()
          const month = today.toLocaleDateString('en-US', { month: 'long' })
          return `${month} ${today.getDate()}, ${1960 + (dayOfYear(today) % 50)}`
        },
      },
      {
        label: decade ? `Random ${decade}` : 'Random decade',
        getQuery: () => {
          const startYear = DECADE_START[decade ?? '80s']
          // Use Math.random only in click handler (not render)
          const year = startYear + Math.floor(Math.random() * 10)
          const month = Math.floor(Math.random() * 12) + 1
          return `${month}/${Math.floor(Math.random() * 28) + 1}/${year}`
        },
      },
      {
        label: 'Summer of Love',
        getQuery: () => 'Summer of 1967',
      },
      {
        label: 'MTV Era',
        getQuery: () => {
          const year = 1981 + Math.floor(Math.random() * 10)
          return `August ${year}`
        },
      },
    ]
  }, [decade])

  if (!visible) return null

  return (
    <div className="mb-6">
      <p className="ed-label text-muted">Quick jumps</p>
      <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1 border-y border-newsprint/40 py-1">
        {chips.map((chip) => (
          <li key={chip.label}>
            <button
              type="button"
              onClick={() => onSelect(chip.getQuery())}
              className="min-h-11 font-display text-lg underline-offset-4 hover:text-white hover:underline"
            >
              {chip.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
