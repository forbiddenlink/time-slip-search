'use client'

import { motion } from 'motion/react'
import type { WrappedStats } from '@/lib/wrapped'

interface TopItemsCardProps {
  stats: WrappedStats
  onNext: () => void
}

export function TopItemsCard({ stats, onNext }: Readonly<TopItemsCardProps>) {
  const { discoveries } = stats

  const rows: Array<{ label: string; main: string; sub: string }> = []
  if (discoveries.favoriteSong) {
    rows.push({ label: 'Top song', main: discoveries.favoriteSong.song_title, sub: discoveries.favoriteSong.artist })
  }
  if (discoveries.favoriteMovie) {
    rows.push({ label: 'Top movie', main: discoveries.favoriteMovie.title, sub: String(discoveries.favoriteMovie.year) })
  }
  if (discoveries.rarestYear) {
    rows.push({ label: 'Rarest find', main: String(discoveries.rarestYear), sub: 'Few readers look up this year' })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-[500px] flex-col items-center justify-center px-6 pb-16 pt-8"
    >
      <h2 className="text-center font-display text-4xl italic md:text-5xl">Your favorites</h2>
      <p className="mt-1 ed-label text-faded">Editor&apos;s picks</p>

      <div className="mt-8 w-full max-w-md border-y-2 border-ink">
        {rows.map((row, i) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.2 }}
            className={`py-4 ${i > 0 ? 'border-t border-ink/40' : ''}`}
          >
            <div className="ed-label text-edition">{row.label}</div>
            <div className="mt-1 truncate font-display text-2xl">{row.main}</div>
            <div className="truncate font-body text-sm italic text-faded">{row.sub}</div>
          </motion.div>
        ))}
        {rows.length === 0 && (
          <p className="py-8 text-center font-body italic text-faded">
            Search a few more dates and your favorites will print here.
          </p>
        )}
      </div>

      <button type="button" onClick={onNext} className="ed-btn mt-8">
        Next page
      </button>
    </motion.div>
  )
}
