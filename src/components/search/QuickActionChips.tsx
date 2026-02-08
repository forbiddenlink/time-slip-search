'use client'

import { useMemo } from 'react'
import { SparklesIcon } from '@/components/icons/Icons'

interface QuickActionChipsProps {
  onSelect: (query: string) => void
  visible: boolean
}

interface ChipConfig {
  label: string
  getQuery: () => string
  icon: string
}

export function QuickActionChips({ onSelect, visible }: Readonly<QuickActionChipsProps>) {
  const chips = useMemo<ChipConfig[]>(() => {
    const today = new Date()
    const currentMonth = today.toLocaleDateString('en-US', { month: 'long' })
    const currentDay = today.getDate()

    // Random decade for variety
    const decades = ['60s', '70s', '80s', '90s', '2000s']
    const randomDecade = decades[Math.floor(Math.random() * decades.length)]

    return [
      {
        label: 'This Day in History',
        getQuery: () => `${currentMonth} ${currentDay}, ${1960 + Math.floor(Math.random() * 50)}`,
        icon: '📅',
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
          const year = startYear + Math.floor(Math.random() * 10)
          const month = Math.floor(Math.random() * 12) + 1
          return `${month}/${Math.floor(Math.random() * 28) + 1}/${year}`
        },
        icon: '🎲',
      },
      {
        label: 'Summer of Love',
        getQuery: () => 'Summer of 1967',
        icon: '☮️',
      },
      {
        label: 'MTV Era',
        getQuery: () => {
          const year = 1981 + Math.floor(Math.random() * 10)
          return `August ${year}`
        },
        icon: '📺',
      },
    ]
  }, [])

  if (!visible) return null

  return (
    <div className="flex flex-wrap gap-2 justify-center mb-6 animate-fade-in">
      <div className="w-full text-center mb-2">
        <span className="text-aged-cream/50 text-xs led-text tracking-wider flex items-center justify-center gap-2">
          <SparklesIcon size={12} className="text-phosphor-teal" />
          QUICK JUMPS
          <SparklesIcon size={12} className="text-phosphor-teal" />
        </span>
      </div>
      {chips.map((chip, index) => (
        <button
          key={chip.label}
          onClick={() => onSelect(chip.getQuery())}
          className={`
            px-4 py-2 bg-crt-dark border border-crt-light/30 rounded-full
            text-aged-cream/80 text-sm led-text tracking-wider
            hover:border-phosphor-teal hover:text-phosphor-teal hover:shadow-glow-teal
            transition-all duration-300 hover:scale-105
            cascade-in stagger-${index + 1}
            flex items-center gap-2
          `}
        >
          <span>{chip.icon}</span>
          <span>{chip.label}</span>
        </button>
      ))}
    </div>
  )
}
