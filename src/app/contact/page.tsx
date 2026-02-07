import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact Support',
  description: 'Contact TimeSlipSearch for support, bug reports, partnership requests, and historical data corrections, including response expectations and security reporting.',
}

export default function ContactPage() {
  const publishedDate = '2026-01-15'
  const modifiedDate = '2026-02-07'

  return (
    <main className="min-h-screen bg-crt-black text-aged-cream">
      <div className="container mx-auto max-w-3xl px-4 py-12 space-y-8">
        <header className="space-y-3">
          <h1 className="font-display text-5xl tracking-tight">Contact</h1>
          <p className="text-aged-cream/75">
            Questions, bug reports, and partnership inquiries are welcome.
          </p>
          <p className="text-sm text-aged-cream/60 led-text tracking-wide">
            By TimeSlipSearch Editorial Team · Published <time dateTime={publishedDate}>January 15, 2026</time> · Updated <time dateTime={modifiedDate}>February 7, 2026</time>
          </p>
        </header>

        <section className="space-y-4 text-aged-cream/80 leading-relaxed">
          <p>
            For support, feedback, or corrections to historical data, email us at{' '}
            <a className="underline hover:text-phosphor-teal" href="mailto:hello@timeslipsearch.com">
              hello@timeslipsearch.com
            </a>
            . Please include the date you searched and a short description of what you expected to see.
          </p>
          <p>
            You can also follow project updates and open issues through the public repository at{' '}
            <a className="underline hover:text-phosphor-teal" href="https://github.com/forbiddenlink/TimeSlipSearch" target="_blank" rel="noopener noreferrer">
              github.com/forbiddenlink/TimeSlipSearch
            </a>
            .
          </p>
          <p>
            We review messages on business days and usually respond within 2 to 3 days. For urgent security concerns, include the subject line “Security” so we can prioritize triage.
          </p>
          <p>
            To help us investigate quickly, include the date you searched, the expected result, and the actual output you saw. If the issue is reproducible, include your browser and device details. For data quality reports, adding a source link or citation significantly speeds up review and correction.
          </p>
          <p>
            Collaboration requests are also welcome. If you are interested in educational, historical, or media partnerships, send a short overview of your use case and timeline. We can usually evaluate partner requests within one week.
          </p>
          <p>
            Security disclosures can be sent by email and should include a clear reproduction path, impacted endpoint or page, and potential severity. We follow a coordinated disclosure approach and appreciate responsible reporting. You can also review standard disclosure guidance from{' '}
            <a className="underline hover:text-phosphor-teal" href="https://cheatsheetseries.owasp.org/cheatsheets/Vulnerability_Disclosure_Cheat_Sheet.html" target="_blank" rel="noopener noreferrer">
              OWASP
            </a>{' '}
            before submitting.
          </p>
          <p>
            If you are a teacher, researcher, or journalist using TimeSlipSearch in a project, include your publication or classroom context and deadline so we can help prioritize the right materials. We can provide guidance on source interpretation, citation best practices, and limitations of historical coverage for specific years.
          </p>
          <p>
            Product feedback is most useful when it includes your goal, what you tried, and where the flow broke down. We track recurring usability themes and use them to shape roadmap priorities across search relevance, accessibility, and quality-of-life improvements in the interface.
          </p>
          <p>
            If you prefer, you can send quick feedback in bullet form and we will follow up with any missing details needed to investigate.
          </p>
        </section>

        <footer className="flex gap-5 text-sm led-text tracking-wider">
          <Link href="/" className="hover:text-phosphor-teal transition-colors">HOME</Link>
          <Link href="/about" className="hover:text-phosphor-teal transition-colors">ABOUT</Link>
          <Link href="/privacy-policy" className="hover:text-phosphor-teal transition-colors">PRIVACY POLICY</Link>
        </footer>
      </div>
    </main>
  )
}
