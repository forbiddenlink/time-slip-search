'use client'

import { motion } from 'motion/react'
import type { WrappedStats } from '@/lib/wrapped'

interface HeatMapCardProps {
  stats: WrappedStats
  onNext: () => void
}

const DECADES = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s']

export function HeatMapCard({ stats, onNext }: Readonly<HeatMapCardProps>) {
  const { decadeHeatMap } = stats

  // Calculate max for color intensity
  const values = Object.values(decadeHeatMap)
  const maxCount = Math.max(...values, 1)

  // Get intensity level (0-4) for color
  const getIntensity = (count: number): number => {
    if (count === 0) return 0
    const ratio = count / maxCount
    if (ratio > 0.75) return 4
    if (ratio > 0.5) return 3
    if (ratio > 0.25) return 2
    return 1
  }

  // Ink density by intensity: paper to solid ink
  const getColorClass = (intensity: number): string => {
    switch (intensity) {
      case 1:
        return 'bg-ink/10 text-ink'
      case 2:
        return 'bg-ink/25 text-ink'
      case 3:
        return 'bg-ink/60 text-newsprint'
      case 4:
        return 'bg-ink text-newsprint'
      default:
        return 'bg-transparent text-faded'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-[500px] flex-col items-center justify-center px-6 pb-16 pt-8"
    >
      <h2 className="text-center font-display text-4xl italic md:text-5xl">Your time map</h2>
      <p className="mt-1 ed-label text-faded">Where you looked, by decade</p>

      <div className="mt-6 grid w-full max-w-md grid-cols-4 gap-2">
        {DECADES.map((decade, index) => {
          const count = decadeHeatMap[decade] || 0
          const intensity = getIntensity(count)
          const isTop = stats.topDecade === decade && count > 0

          return (
            <motion.div
              key={decade}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.06 }}
              className={`border border-ink p-3 text-center ${getColorClass(intensity)} ${isTop ? 'outline outline-2 outline-offset-2 outline-edition' : ''}`}
            >
              <div className="font-display text-base">{decade.replace('s', "'s")}</div>
              <div className="font-display text-2xl">{count}</div>
              <div className="ed-label !text-[0.65rem]">{count === 1 ? 'visit' : 'visits'}</div>
            </motion.div>
          )
        })}
      </div>

      <p className="mt-4 flex items-center gap-2 ed-label text-faded">
        Less
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className={`inline-block h-4 w-4 border border-ink ${getColorClass(level)}`} />
        ))}
        More
      </p>
      {stats.topDecade && (
        <p className="mt-2 ed-label text-edition">Red outline marks your most visited decade</p>
      )}

      {stats.longestSession && (
        <p className="mt-6 border-y border-ink py-3 text-center font-body">
          <span className="ed-label text-faded">Longest session </span>
          <span className="font-display text-xl">{stats.longestSession.searches} searches</span>
          <span className="text-faded">, {stats.longestSession.date}</span>
        </p>
      )}

      <button type="button" onClick={onNext} className="ed-btn mt-8">
        Next page
      </button>
    </motion.div>
  )
}
