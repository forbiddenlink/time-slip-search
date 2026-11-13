'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useState } from 'react'
import { type Achievement, getRarityLabel } from '@/lib/achievements'
import { XIcon } from '@/components/icons/Icons'

interface AchievementToastProps {
  achievement: Achievement | null
  onDismiss: () => void
}

/** Bottom-right notice slip. Sits below the masthead so it never covers the header. */
export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (achievement) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onDismiss, 300)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [achievement, onDismiss])

  if (!achievement) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-3 right-3 z-50 w-[calc(100%-1.5rem)] max-w-sm border-2 border-ink bg-newsprint p-3 sm:bottom-4 sm:right-4 sm:p-4 text-ink shadow-[4px_4px_0_0_#17140F]"
        >
          <p className="ed-label text-edition">Badge earned / {getRarityLabel(achievement.rarity)}</p>
          <h3 className="mt-1 pr-8 font-display text-xl">{achievement.title}</h3>
          <p className="mt-1 hidden font-body text-sm sm:block">{achievement.description}</p>
          <p className="mt-2 hidden ed-label text-faded sm:block">+{achievement.points} points</p>
          <button
            type="button"
            onClick={() => {
              setIsVisible(false)
              setTimeout(onDismiss, 300)
            }}
            className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center hover:text-edition"
            aria-label="Dismiss"
          >
            <XIcon size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
