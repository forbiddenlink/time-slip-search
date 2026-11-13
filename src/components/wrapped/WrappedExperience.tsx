'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { WrappedStats } from '@/lib/wrapped'
import { IntroCard } from './cards/IntroCard'
import { StatsCard } from './cards/StatsCard'
import { PersonalityCard } from './cards/PersonalityCard'
import { TopItemsCard } from './cards/TopItemsCard'
import { HeatMapCard } from './cards/HeatMapCard'
import { ShareCard } from './cards/ShareCard'

type CardState = 'intro' | 'stats' | 'personality' | 'topItems' | 'heatMap' | 'share'

const CARD_ORDER: CardState[] = ['intro', 'stats', 'personality', 'topItems', 'heatMap', 'share']

interface WrappedExperienceProps {
  stats: WrappedStats
  onClose: () => void
}

export function WrappedExperience({ stats, onClose }: Readonly<WrappedExperienceProps>) {
  const [currentCard, setCurrentCard] = useState<CardState>('intro')
  const [direction, setDirection] = useState(1) // 1 for forward, -1 for backward

  const currentIndex = CARD_ORDER.indexOf(currentCard)

  const goToNext = useCallback(() => {
    const nextIndex = currentIndex + 1
    if (nextIndex < CARD_ORDER.length) {
      setDirection(1)
      setCurrentCard(CARD_ORDER[nextIndex]!)
    }
  }, [currentIndex])

  const goToPrev = useCallback(() => {
    const prevIndex = currentIndex - 1
    if (prevIndex >= 0) {
      setDirection(-1)
      setCurrentCard(CARD_ORDER[prevIndex]!)
    }
  }, [currentIndex])

  const goToCard = useCallback((index: number) => {
    if (index >= 0 && index < CARD_ORDER.length) {
      setDirection(index > currentIndex ? 1 : -1)
      setCurrentCard(CARD_ORDER[index]!)
    }
  }, [currentIndex])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        goToNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPrev()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrev, onClose])

  // Touch/swipe handling
  useEffect(() => {
    let touchStartX = 0
    let touchEndX = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0]?.clientX ?? 0
    }

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0]?.clientX ?? 0
      const diff = touchStartX - touchEndX

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToNext() // Swipe left
        } else {
          goToPrev() // Swipe right
        }
      }
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [goToNext, goToPrev])

  const cardVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  }

  const renderCard = () => {
    switch (currentCard) {
      case 'intro':
        return <IntroCard onNext={goToNext} />
      case 'stats':
        return <StatsCard stats={stats} onNext={goToNext} />
      case 'personality':
        return <PersonalityCard stats={stats} onNext={goToNext} />
      case 'topItems':
        return <TopItemsCard stats={stats} onNext={goToNext} />
      case 'heatMap':
        return <HeatMapCard stats={stats} onNext={goToNext} />
      case 'share':
        return <ShareCard stats={stats} onClose={onClose} />
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Your Wrapped special edition"
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/95"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Card container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-2xl">
          {/* The sheet */}
          <div className="ed-sheet relative min-h-[600px] overflow-hidden text-ink">
            {/* Masthead strip */}
            <div className="px-5 pt-4 md:px-8">
              <div className="flex items-center justify-between gap-3 ed-label text-faded">
                <span>Special edition: Wrapped</span>
                <span>
                  Page {currentIndex + 1} of {CARD_ORDER.length}
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="ed-btn !min-h-11 !px-3 text-ink"
                  aria-label="Close"
                >
                  Close
                </button>
              </div>
              <div className="mt-3 h-[7px] border-b border-t-[3px] border-ink" aria-hidden="true" />
            </div>

            {/* Card content */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentCard}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'tween', duration: 0.3 }}
                className="min-h-[500px]"
              >
                {renderCard()}
              </motion.div>
            </AnimatePresence>

            {/* Page index */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
              {CARD_ORDER.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToCard(index)}
                  aria-current={index === currentIndex ? 'page' : undefined}
                  className="flex h-11 w-8 items-center justify-center"
                  aria-label={`Go to page ${index + 1}`}
                >
                  <span
                    className={`block h-[3px] w-full ${index === currentIndex ? 'bg-edition' : 'bg-ink/30'}`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation hints */}
      <p className="pb-6 text-center ed-label text-muted">Arrow keys or swipe to turn the page. Esc to close.</p>
    </motion.div>
  )
}
