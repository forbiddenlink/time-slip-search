import Link from 'next/link'

/** Slim top strip shared by every public page. */
export function SiteHeader() {
  return (
    <header className="border-b border-newsprint/25">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          aria-label="TimeSlip Search home"
          className="font-nameplate text-2xl text-newsprint leading-none hover:text-white transition-colors"
        >
          TimeSlip Search
        </Link>
        <nav aria-label="Site" className="flex gap-6 ed-label text-newsprint">
          <Link href="/about" className="py-2 hover:underline underline-offset-4">About</Link>
          <Link href="/contact" className="py-2 hover:underline underline-offset-4">Contact</Link>
        </nav>
      </div>
    </header>
  )
}

/** Footer: giant cropped wordmark, one sign-off line, one row of links. */
export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-newsprint/25 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 pt-10">
        <p
          aria-hidden="true"
          className="font-nameplate text-newsprint/90 leading-[0.8] whitespace-nowrap select-none -mb-[0.12em] text-[clamp(4.5rem,21vw,17rem)]"
        >
          TimeSlip
        </p>
      </div>
      <div className="bg-newsprint text-ink">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display italic text-base">
            Pick a date. See what the world was reading.
          </p>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-1 ed-label">
            <Link href="/about" className="py-2 hover:underline underline-offset-4">About</Link>
            <Link href="/contact" className="py-2 hover:underline underline-offset-4">Contact</Link>
            <Link href="/privacy-policy" className="py-2 hover:underline underline-offset-4">Privacy</Link>
            <span className="py-2 text-faded normal-case tracking-normal">Search by Algolia</span>
          </nav>
        </div>
      </div>
    </footer>
  )
}
