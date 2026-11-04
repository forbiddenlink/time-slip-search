import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * Shared frame for the text pages (about, contact, privacy). Reuses the homepage's
 * VCR header strip, glowing wordmark and CRT console panel so these pages read as part
 * of the same product instead of a bare document.
 */
export function InfoPageHeader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-vhs-red opacity-80" aria-hidden="true" />
          <span className="led-text text-vhs-red text-sm tracking-widest">REC</span>
        </div>
      </div>
      <div className="text-center space-y-3">
        <p className="font-display text-5xl md:text-6xl tracking-tight leading-none">
          <Link href="/" aria-label="TimeSlip Search home" className="inline-block">
            <span className="title-glow-teal inline-block">Time</span>
            <span className="title-glow-amber inline-block ml-1">Slip</span>
          </Link>
        </p>
        <div className="flex items-center justify-center gap-4" aria-hidden="true">
          <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent via-phosphor-teal/40 to-transparent" />
          <span className="led-text text-phosphor-amber text-xl tracking-[0.4em] uppercase">Search</span>
          <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent via-phosphor-teal/40 to-transparent" />
        </div>
      </div>
    </div>
  )
}

export function InfoPanel({ children }: { children: ReactNode }) {
  return (
    <div className="crt-screen-enhanced screen-depth border-4 border-crt-medium relative phosphor-grid p-6 md:p-10 space-y-8">
      {children}
    </div>
  )
}
