'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getUserAchievements, type UserAchievements } from '@/lib/achievements'
import { AchievementBadge } from './AchievementBadge'
import { XIcon } from '@/components/icons/Icons'

interface AchievementsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function AchievementsPanel({ isOpen, onClose }: AchievementsPanelProps) {
  const [achievements, setAchievements] = useState<UserAchievements | null>(null)
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')

  useEffect(() => {
    if (isOpen) {
      setAchievements(getUserAchievements())
    }
  }, [isOpen])

  if (!achievements) return null

  const filteredAchievements = achievements.achievements.filter((achievement) => {
    if (filter === 'unlocked') return achievement.unlocked
    if (filter === 'locked') return !achievement.unlocked
    return true
  })

  const categories = Array.from(
    new Set(achievements.achievements.map((a) => a.category))
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative max-w-6xl w-full max-h-[90vh] overflow-hidden bg-gray-900 rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                aria-label="Close"
              >
                <XIcon size={20} />
              </button>

              <h2 className="text-3xl font-bold text-white mb-4">Achievements</h2>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">
                    {achievements.unlockedCount}/{achievements.achievements.length}
                  </div>
                  <div className="text-sm text-white/70">Unlocked</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-amber-400">
                    {achievements.totalPoints}
                  </div>
                  <div className="text-sm text-white/70">Total Points</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-orange-400">
                    {achievements.streak.current}🔥
                  </div>
                  <div className="text-sm text-white/70">Day Streak</div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 mt-4">
                {(['all', 'unlocked', 'locked'] as const).map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => setFilter(filterOption)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all
                      ${
                        filter === filterOption
                          ? 'bg-white text-indigo-600'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }
                    `}
                  >
                    {filterOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Achievement Grid */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
              {categories.map((category) => {
                const categoryAchievements = filteredAchievements.filter(
                  (a) => a.category === category
                )

                if (categoryAchievements.length === 0) return null

                return (
                  <div key={category} className="mb-8">
                    <h3 className="text-xl font-bold text-white mb-4 capitalize flex items-center gap-2">
                      <span className="bg-gradient-to-r from-indigo-500 to-purple-500 w-1 h-6 rounded-full" />
                      {category}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {categoryAchievements.map((achievement) => (
                        <AchievementBadge
                          key={achievement.id}
                          achievement={achievement}
                          size="medium"
                        />
                      ))}
                    </div>
                  </div>
                )
              })}

              {filteredAchievements.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔒</div>
                  <p className="text-gray-400">
                    No {filter === 'all' ? '' : filter} achievements yet
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
