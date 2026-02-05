/**
 * Accessibility utilities and ARIA helpers
 */

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (typeof document === 'undefined') return

  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Generate accessible label for date search results
 */
export function getSearchResultLabel(count: number, dateDisplay: string): string {
  if (count === 0) {
    return `No results found for ${dateDisplay}`
  }
  if (count === 1) {
    return `1 result found for ${dateDisplay}`
  }
  return `${count} results found for ${dateDisplay}`
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get keyboard navigation hint text
 */
export function getKeyboardHint(action: string): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const modifier = isMac ? 'Cmd' : 'Ctrl'
  
  const hints: Record<string, string> = {
    search: `${modifier} + K to focus search`,
    timeline: `${modifier} + T for timeline`,
    help: `${modifier} + / for help`,
    escape: 'Esc to clear',
  }
  
  return hints[action] || ''
}

/**
 * Focus trap for modals and dialogs
 */
export class FocusTrap {
  private container: HTMLElement
  private previousFocus: HTMLElement | null = null
  private focusableElements: HTMLElement[] = []

  constructor(container: HTMLElement) {
    this.container = container
  }

  activate(): void {
    this.previousFocus = document.activeElement as HTMLElement
    this.updateFocusableElements()
    
    if (this.focusableElements.length > 0) {
      this.focusableElements[0]?.focus()
    }

    this.container.addEventListener('keydown', this.handleKeyDown)
  }

  deactivate(): void {
    this.container.removeEventListener('keydown', this.handleKeyDown)
    this.previousFocus?.focus()
  }

  private updateFocusableElements(): void {
    const selector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    this.focusableElements = Array.from(this.container.querySelectorAll(selector))
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== 'Tab') return

    const firstElement = this.focusableElements[0]
    const lastElement = this.focusableElements[this.focusableElements.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }
}

/**
 * Generate skip link targets
 */
export const SKIP_LINK_TARGETS = {
  mainContent: 'main-content',
  search: 'search-input',
  results: 'search-results',
  navigation: 'main-navigation',
} as const
