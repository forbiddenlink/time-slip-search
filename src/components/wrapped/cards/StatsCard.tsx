'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import type { WrappedStats } from '@/lib/wrapped'

interface StatsCardProps {
  stats: WrappedStats
  onNext: () => void
}

interface AnimatedCounterProps {
  value: number
  duration?: number
  suffix?: string
}

function AnimatedCounter({ value, duration = 2000, suffix = '' }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) {
      setDisplayValue(value)
      return
    }

    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(startValue + (value - startValue) * eased)

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration, reduceMotion])

  return (
    <span>
      {displayValue.toLocaleString()}{suffix}
    </span>
  )
}

export function StatsCard({ stats, onNext }: Readonly<StatsCardProps>) {
  const statItems = [
    {
      label: 'Time Travels',
      value: stats.totalSearches,
      delay: 0.2,
    },
    {
      label: 'Years Explored',
      value: stats.yearsExplored.length,
      delay: 0.4,
    },
    {
      label: 'Songs Discovered',
      value: stats.discoveries.totalSongs,
      delay: 0.6,
    },
    {
      label: 'Movies Found',
      value: stats.discoveries.totalMovies,
      delay: 0.8,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-[500px] flex-col items-center justify-center px-6 pb-16 pt-8"
    >
      <h2 className="text-center font-display text-4xl italic md:text-5xl">Your numbers</h2>
      <p className="mt-1 ed-label text-faded">By the figures</p>

      <dl className="mt-8 grid w-full max-w-md grid-cols-2 border-y-2 border-ink">
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay, duration: 0.4 }}
            className={`px-4 py-5 text-center ${index % 2 === 0 ? 'border-r border-ink' : ''} ${index > 1 ? 'border-t border-ink' : ''}`}
          >
            <dd className="font-display text-4xl">
              <AnimatedCounter value={stat.value} duration={2000 + index * 300} />
            </dd>
            <dt className="mt-1 ed-label text-faded">{stat.label}</dt>
          </motion.div>
        ))}
      </dl>

      <button type="button" onClick={onNext} className="ed-btn mt-8">
        Next page
      </button>
    </motion.div>
  )
}
