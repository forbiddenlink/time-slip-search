'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getSeasonalPicks, getCategoryIcon, type FamousDate } from '@/lib/famous-dates'

interface StaffPicksCarouselProps {
  onSelect: (query: string) => void
}

export function StaffPicksCarousel({ onSelect }: Readonly<StaffPicksCarouselProps>) {
  const [picks, setPicks] = useState<FamousDate[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load seasonal picks on mount
  useEffect(() => {
    setPicks(getSeasonalPicks())
  }, [])

  // Auto-rotate every 8 seconds (pause on hover)
  useEffect(() => {
    if (isPaused || picks.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % picks.length)
    }, 8000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPaused, picks.length])

  const handleClick = useCallback((pick: FamousDate) => {
    // Format as "Month Day, Year"
    const [month, day] = pick.date.split('-')
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
    const monthName = monthNames[parseInt(month ?? '1', 10) - 1]
    const query = `${monthName} ${parseInt(day ?? '1', 10)}, ${pick.year}`
    onSelect(query)
  }, [onSelect])

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  if (picks.length === 0) return null

  return (
    <div
      className="mb-8 animate-fade-in"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section header with VHS tape label aesthetic */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent via-phosphor-amber/40 to-phosphor-amber/60" />
        <span className="led-text text-phosphor-amber text-sm tracking-widest uppercase">
          Staff Picks
        </span>
        <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent via-phosphor-amber/40 to-phosphor-amber/60" />
      </div>

      {/* Carousel container */}
      <div className="relative overflow-hidden">
        <div className="flex gap-4 justify-center">
          <AnimatePresence mode="wait">
            {picks.map((pick, index) => (
              <motion.button
                key={`${pick.date}-${pick.year}`}
                onClick={() => handleClick(pick)}
                className={`
                  relative flex-shrink-0 w-64 p-4 rounded-lg
                  bg-crt-dark border transition-all duration-300
                  ${index === currentIndex
                    ? 'border-phosphor-amber shadow-glow-amber scale-105 z-10'
                    : 'border-crt-light/30 opacity-60 hover:opacity-90 hover:border-phosphor-teal/50'
                  }
                `}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: index === currentIndex ? 1 : 0.6,
                  y: 0,
                  scale: index === currentIndex ? 1.05 : 1,
                }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                aria-label={`Explore ${pick.title}`}
              >
                {/* VHS tape label decoration */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-phosphor-amber/60 via-vhs-red/40 to-phosphor-amber/60 rounded-t-lg" />

                <div className="flex items-start gap-3 text-left pt-2">
                  <span className="text-2xl flex-shrink-0">{getCategoryIcon(pick.category)}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-aged-cream font-medium text-sm leading-tight truncate">
                      {pick.title}
                    </h3>
                    <p className="text-phosphor-teal text-xs led-text mt-1">
                      {pick.year}
                    </p>
                    <p className="text-aged-cream/60 text-xs mt-2 line-clamp-2">
                      {pick.description.length > 80
                        ? `${pick.description.slice(0, 80)}...`
                        : pick.description}
                    </p>
                  </div>
                </div>

                {/* Play indicator */}
                <div className="absolute bottom-2 right-2 text-phosphor-teal/60 text-xs led-text">
                  ▶ PLAY
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center gap-2 mt-4">
        {picks.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${index === currentIndex
                ? 'bg-phosphor-amber w-6'
                : 'bg-crt-light/40 hover:bg-phosphor-teal/60'
              }
            `}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
