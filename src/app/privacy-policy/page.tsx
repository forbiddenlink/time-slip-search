import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Review the TimeSlipSearch privacy policy, including data collection, analytics usage, retention, legal rights, and how to request deletion.',
}

export default function PrivacyPolicyPage() {
  const effectiveDate = 'February 7, 2026'
  const publishedDate = '2026-01-15'
  const modifiedDate = '2026-02-07'

  return (
    <main className="min-h-screen bg-crt-black text-aged-cream">
      <div className="container mx-auto max-w-3xl px-4 py-12 space-y-8">
        <header className="space-y-3">
          <h1 className="font-display text-5xl tracking-tight">Privacy Policy</h1>
          <p className="text-aged-cream/75">Effective date: {effectiveDate}</p>
          <p className="text-sm text-aged-cream/60 led-text tracking-wide">
            By TimeSlipSearch Editorial Team · Published <time dateTime={publishedDate}>January 15, 2026</time> · Updated <time dateTime={modifiedDate}>February 7, 2026</time>
          </p>
        </header>

        <section className="space-y-4 text-aged-cream/80 leading-relaxed">
          <p>
            TimeSlipSearch is designed to let you explore historical dates and cultural context. We collect minimal information needed to operate the service, improve relevance, and keep the product stable.
          </p>
          <p>
            We may process technical data such as IP address, browser type, device information, pages visited, and interaction events. This helps us monitor performance, diagnose errors, and understand which features are useful. We do not sell personal data.
          </p>
          <p>
            Search queries may be logged to improve quality and reliability. Avoid entering sensitive personal information in free-text search fields. If analytics providers are used, they process data under their own policies and security practices.
          </p>
          <p>
            We use collected information for core service operations, abuse prevention, uptime monitoring, and feature analytics. Access is limited to people and systems that require it for legitimate product or security needs. We apply standard safeguards such as encrypted transport, access controls, and logging where appropriate.
          </p>
          <p>
            Depending on your region, you may have rights to access, correct, delete, or restrict certain processing. Where applicable, you can also object to processing or request portability. We process and respond to verified requests in line with legal obligations and practical service constraints.
          </p>
          <p>
            You can request deletion of data associated with your messages by contacting{' '}
            <a className="underline hover:text-phosphor-teal" href="mailto:hello@timeslipsearch.com">
              hello@timeslipsearch.com
            </a>
            . We will review and handle valid requests in line with applicable law, including CCPA and GDPR requirements where relevant.
          </p>
          <p>
            For additional background on privacy rights and legal standards, refer to public regulatory resources such as the{' '}
            <a className="underline hover:text-phosphor-teal" href="https://oag.ca.gov/privacy/ccpa" target="_blank" rel="noopener noreferrer">
              California CCPA guidance
            </a>{' '}
            and the{' '}
            <a className="underline hover:text-phosphor-teal" href="https://commission.europa.eu/law/law-topic/data-protection_en" target="_blank" rel="noopener noreferrer">
              European Commission GDPR overview
            </a>
            .
          </p>
          <p>
            We may update this policy as product features evolve. Material changes will be reflected by updating the effective date on this page.
          </p>
          <p>
            If you have questions about this policy, contact us before using features that involve personal or account-specific details. We want policy language to be understandable and practical, and we update this document when legal requirements, providers, or internal handling practices materially change.
          </p>
        </section>

        <footer className="flex gap-5 text-sm led-text tracking-wider">
          <Link href="/" className="hover:text-phosphor-teal transition-colors">HOME</Link>
          <Link href="/about" className="hover:text-phosphor-teal transition-colors">ABOUT</Link>
          <Link href="/contact" className="hover:text-phosphor-teal transition-colors">CONTACT</Link>
          <Link href="/privacy-policy" className="hover:text-phosphor-teal transition-colors">PRIVACY POLICY</Link>
        </footer>
      </div>
    </main>
  )
}
