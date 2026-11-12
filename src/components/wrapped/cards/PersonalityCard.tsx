'use client'

import { motion } from 'motion/react'
import { getPersonalityDescription, determineEraAffinity, type WrappedStats } from '@/lib/wrapped'

interface PersonalityCardProps {
  stats: WrappedStats
  onNext: () => void
}

export function PersonalityCard({ stats, onNext }: Readonly<PersonalityCardProps>) {
  const personality = getPersonalityDescription(stats.personality)
  const eraAffinityData = determineEraAffinity(stats)

  // Determine era affinity based on analysis
  const eraAffinity = eraAffinityData.decade

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-[500px] flex-col items-center justify-center px-6 pb-16 pt-8 text-center"
    >
      <p className="ed-label text-edition">Profile of the reader</p>
      <h2 className="mt-3 font-display text-4xl italic text-balance md:text-5xl">{personality.title}</h2>
      <p className="mt-4 max-w-md font-body text-lg text-pretty">{personality.description}</p>

      <div className="mt-8 w-full max-w-xs border-y-2 border-ink py-5">
        <div className="ed-label text-faded">Your era</div>
        <div className="mt-1 font-display text-5xl">{eraAffinity}</div>
        <div className="mx-auto mt-2 max-w-xs font-body text-sm italic text-faded">
          {eraAffinityData.reason}
        </div>
      </div>

      <button type="button" onClick={onNext} className="ed-btn mt-8">
        Next page
      </button>
    </motion.div>
  )
}
