import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-crt-black text-aged-cream">
      <div className="container mx-auto max-w-2xl px-4 py-20 text-center space-y-6">
        <p className="led-text text-phosphor-amber text-sm tracking-[0.2em]">404</p>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight">Tape Not Found</h1>
        <p className="text-aged-cream/80">
          The page you requested is missing or may have moved.
        </p>
        <div className="flex justify-center gap-4 text-sm led-text tracking-wider">
          <Link href="/" className="hover:text-phosphor-teal transition-colors">
            HOME
          </Link>
          <Link href="/about" className="hover:text-phosphor-teal transition-colors">
            ABOUT
          </Link>
          <Link href="/contact" className="hover:text-phosphor-teal transition-colors">
            CONTACT
          </Link>
        </div>
      </div>
    </main>
  )
}
