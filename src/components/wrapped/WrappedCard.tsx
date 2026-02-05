'use client'

import { motion } from 'framer-motion'
import { getPersonalityDescription, type WrappedStats } from '@/lib/wrapped'
import { ShareIcon, CopyIcon, XIcon } from '@/components/icons/Icons'

interface WrappedCardProps {
  stats: WrappedStats
  onClose?: () => void
}

export function WrappedCard({ stats, onClose }: WrappedCardProps) {
  const personality = getPersonalityDescription(stats.personality)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Card */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl p-8 text-white">
          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              aria-label="Close"
            >
              <XIcon size={20} />
            </button>
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-bold mb-2">Your Time Capsule</h1>
            <p className="text-xl text-white/80">A Journey Through Time</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
            >
              <div className="text-4xl font-bold mb-1">{stats.totalSearches}</div>
              <div className="text-sm text-white/70">Time Travels</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
            >
              <div className="text-4xl font-bold mb-1">{stats.yearsExplored.length}</div>
              <div className="text-sm text-white/70">Years Explored</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
            >
              <div className="text-4xl font-bold mb-1">{stats.discoveries.totalSongs}</div>
              <div className="text-sm text-white/70">Songs Discovered</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
            >
              <div className="text-4xl font-bold mb-1">{stats.discoveries.totalMovies}</div>
              <div className="text-sm text-white/70">Movies Found</div>
            </motion.div>
          </div>

          {/* Top Decade */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6"
          >
            <div className="text-center">
              <div className="text-lg text-white/70 mb-2">Your Favorite Era</div>
              <div className="text-5xl font-bold mb-2">{stats.topDecade}</div>
              {stats.discoveries.rarestYear && (
                <div className="text-sm text-white/60">
                  Rarest Find: {stats.discoveries.rarestYear}
                </div>
              )}
            </div>
          </motion.div>

          {/* Personality */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-2xl p-8 mb-6 text-center"
          >
            <div className="text-6xl mb-4">{personality.emoji}</div>
            <h3 className="text-2xl font-bold mb-2">{personality.title}</h3>
            <p className="text-white/80 leading-relaxed">{personality.description}</p>
          </motion.div>

          {/* Favorite Items */}
          {(stats.discoveries.favoriteSong || stats.discoveries.favoriteMovie) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="space-y-4 mb-6"
            >
              {stats.discoveries.favoriteSong && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="text-sm text-white/70 mb-1">Top Song</div>
                  <div className="font-semibold">{stats.discoveries.favoriteSong.song_title}</div>
                  <div className="text-sm text-white/60">{stats.discoveries.favoriteSong.artist}</div>
                </div>
              )}

              {stats.discoveries.favoriteMovie && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="text-sm text-white/70 mb-1">Top Movie</div>
                  <div className="font-semibold">{stats.discoveries.favoriteMovie.title}</div>
                  <div className="text-sm text-white/60">
                    {stats.discoveries.favoriteMovie.year}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Share Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex justify-center gap-3"
          >
            <button
              onClick={() => {
                const text = `Check out my Time Capsule! 🚀 I've explored ${stats.yearsExplored.length} years and discovered ${stats.discoveries.totalSongs} songs from the ${stats.topDecade}!`
                if (navigator.share) {
                  navigator.share({
                    title: 'My Time Capsule',
                    text: text,
                    url: typeof window !== 'undefined' ? window.location.href : '',
                  }).catch(() => {})
                } else {
                  navigator.clipboard.writeText(text)
                  alert('Copied to clipboard!')
                }
              }}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-all flex items-center gap-2 hover:scale-105"
            >
              <ShareIcon size={18} />
              Share
            </button>
            <button
              onClick={() => {
                // Simple copy stats to clipboard
                const text = `🎁 My Time Capsule\n\n🔍 ${stats.totalSearches} searches\n📅 ${stats.yearsExplored.length} years explored\n🎵 ${stats.discoveries.totalSongs} songs discovered\n🎬 ${stats.discoveries.totalMovies} movies found\n⭐ Favorite Era: ${stats.topDecade}\n👤 Personality: ${getPersonalityDescription(stats.personality).title}`
                navigator.clipboard.writeText(text)
                alert('Stats copied to clipboard!')
              }}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-all flex items-center gap-2 hover:scale-105"
            >
              <CopyIcon size={18} />
              Copy Stats
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
