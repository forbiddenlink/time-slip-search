'use client'

import { motion } from 'motion/react'

interface IntroCardProps {
  onNext: () => void
}

export function IntroCard({ onNext }: Readonly<IntroCardProps>) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-[500px] flex-col items-center justify-center px-6 pb-16 pt-8 text-center"
    >
      <p className="ed-label text-edition">Your personal edition</p>
      <h1 className="mt-3 font-nameplate text-6xl leading-none md:text-8xl">Your Year in Time</h1>
      <div className="mt-4 h-[7px] w-full max-w-md border-b border-t-[3px] border-ink" aria-hidden="true" />
      <p className="mt-4 max-w-md font-display text-xl italic text-balance">
        A look back at the dates you searched.
      </p>
      <button
        type="button"
        onClick={onNext}
        className="ed-label mt-10 min-h-12 bg-edition px-8 py-3 text-sm text-[#fff8ea] hover:bg-[#9e1f18]"
      >
        Turn the page
      </button>
    </motion.div>
  )
}
