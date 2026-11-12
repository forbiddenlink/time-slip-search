import Link from 'next/link'
import { SiteHeader, SiteFooter } from '@/components/layout/SiteChrome'

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <div className="ed-sheet px-5 py-10 text-center md:px-10">
          <p className="ed-label text-edition">Error 404</p>
          <h1 className="mt-3 font-display text-5xl italic text-balance md:text-6xl">Page not found</h1>
          <div className="mx-auto mt-4 h-[7px] max-w-md border-b border-t-[3px] border-ink" aria-hidden="true" />
          <p className="mt-4 font-body text-lg text-pretty">
            This page is not in the archive. It may have moved, or the address may have a typo.
          </p>
          <nav aria-label="Other pages" className="mt-6 flex flex-wrap justify-center gap-x-6">
            <Link href="/" className="ed-label inline-flex min-h-11 items-center underline underline-offset-4 hover:text-edition">
              Home
            </Link>
            <Link href="/about" className="ed-label inline-flex min-h-11 items-center underline underline-offset-4 hover:text-edition">
              About
            </Link>
            <Link href="/contact" className="ed-label inline-flex min-h-11 items-center underline underline-offset-4 hover:text-edition">
              Contact
            </Link>
          </nav>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
