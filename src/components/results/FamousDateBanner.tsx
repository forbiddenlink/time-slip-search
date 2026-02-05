'use client'

import type { FamousDate } from '@/lib/famous-dates'

const CATEGORY_LABELS: Record<string, string> = {
  space: '[SPACE]',
  politics: '[POL]',
  music: '[MUSIC]',
  technology: '[TECH]',
  sports: '[SPORT]',
  disaster: '[ALERT]',
  culture: '[POP]',
}

export function FamousDateBanner({ famousDate }: { famousDate: FamousDate }) {
  const categoryLabel = CATEGORY_LABELS[famousDate.category] ?? '[HIST]'

  return (
    <div
      className="relative border border-phosphor-amber/60 rounded bg-crt-dark/90 p-4 mb-6 overflow-hidden animate-famous-date-pulse"
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,191,0,0.08)_2px,rgba(255,191,0,0.08)_4px)]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="led-text text-phosphor-amber text-xs tracking-[0.3em] glow-text-subtle">
            DID YOU KNOW?
          </span>
          <span className="led-text text-phosphor-amber/60 text-xs tracking-wider">
            {categoryLabel}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display text-xl text-phosphor-amber glow-text-subtle mb-1">
          {famousDate.title}
          <span className="ml-2 text-sm text-phosphor-amber/60 led-text">
            {famousDate.year}
          </span>
        </h3>

        {/* Description */}
        <p className="text-aged-cream/80 text-sm font-body leading-relaxed">
          {famousDate.description}
        </p>
      </div>

      {/* Inline keyframe for the pulsing border */}
      <style jsx>{`
        .animate-famous-date-pulse {
          animation: famous-date-border-pulse 3s ease-in-out infinite;
        }
        @keyframes famous-date-border-pulse {
          0%, 100% { border-color: rgba(255, 191, 0, 0.4); box-shadow: 0 0 6px rgba(255, 191, 0, 0.1); }
          50% { border-color: rgba(255, 191, 0, 0.7); box-shadow: 0 0 14px rgba(255, 191, 0, 0.2); }
        }
      `}</style>
    </div>
  )
}
