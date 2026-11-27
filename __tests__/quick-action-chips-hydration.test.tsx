import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { renderToString } from 'react-dom/server'
import { QuickActionChips } from '@/components/search/QuickActionChips'

// The server renders in UTC while the visitor's local day can differ. The first
// render must therefore not depend on the current date, or React reports
// hydration error #418.
describe('QuickActionChips hydration', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  function markupAt(iso: string): string {
    jest.useFakeTimers().setSystemTime(new Date(iso))
    return renderToString(<QuickActionChips visible onSelect={() => {}} />)
  }

  it('renders identical markup regardless of the current date', () => {
    const a = markupAt('2026-11-26T12:00:00Z')
    const b = markupAt('2026-11-27T12:00:00Z')
    const c = markupAt('2026-03-02T12:00:00Z')
    expect(b).toBe(a)
    expect(c).toBe(a)
  })
})
