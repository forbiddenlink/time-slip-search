import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * Shared frame for the text pages (about, contact, privacy). Same nameplate and
 * ruled sheet as the homepage so the public pages read as one publication.
 */
export function InfoPageHeader() {
  return (
    <div className="space-y-3 text-center">
      <p className="font-nameplate text-5xl md:text-7xl leading-none text-newsprint">
        <Link href="/" aria-label="TimeSlip Search home">TimeSlip Search</Link>
      </p>
      <div className="border-t-[3px] border-b border-newsprint h-[7px]" aria-hidden="true" />
    </div>
  )
}

export function InfoPanel({ children }: { children: ReactNode }) {
  return (
    <div className="ed-sheet p-6 md:p-10 space-y-8">
      {children}
    </div>
  )
}
