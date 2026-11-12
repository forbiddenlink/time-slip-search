'use client'

import { useMemo } from 'react'

interface QuickActionChipsProps {
  onSelect: (query: string) => void
  visible: boolean
}

interface ChipConfig {
  label: string
  getQuery: () => string
}

export function QuickActionChips({ onSelect, visible }: Readonly<QuickActionChipsProps>) {
  const chips = useMemo<ChipConfig[]>(() => {
    const today = new Date()
    const currentMonth = today.toLocaleDateString('en-US', { month: 'long' })
    const currentDay = today.getDate()

    // Use day of year as deterministic seed to avoid hydration mismatch
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
    const decades = ['60s', '70s', '80s', '90s', '2000s']
    const randomDecade = decades[dayOfYear % decades.length]

    return [
      {
        label: 'This Day in History',
        getQuery: () => `${currentMonth} ${currentDay}, ${1960 + (dayOfYear % 50)}`,
      },
      {
        label: `Random ${randomDecade}`,
        getQuery: () => {
          const decadeMap: Record<string, number> = {
            '60s': 1960,
            '70s': 1970,
            '80s': 1980,
            '90s': 1990,
            '2000s': 2000,
          }
          const startYear = decadeMap[randomDecade ?? '80s'] ?? 1980
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
  }, [])

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
