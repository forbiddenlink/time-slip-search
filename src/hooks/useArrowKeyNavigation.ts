'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseArrowKeyNavigationOptions {
  /** Total number of items that can be navigated */
  itemCount: number
  /** Whether navigation is currently enabled */
  enabled?: boolean
  /** Callback when an item is selected (Enter key) */
  onSelect?: (index: number) => void
  /** Callback when focus changes */
  onFocusChange?: (index: number) => void
  /** Whether to wrap around at boundaries */
  wrap?: boolean
  /** Container element ref for scoping keyboard events */
  containerRef?: React.RefObject<HTMLElement>
}

interface UseArrowKeyNavigationResult {
  /** Currently focused item index (-1 if none) */
  focusedIndex: number
  /** Set the focused index manually */
  setFocusedIndex: (index: number) => void
  /** Reset focus to none */
  resetFocus: () => void
  /** Props to spread on each navigable item */
  getItemProps: (index: number) => {
    'data-nav-index': number
    'aria-selected': boolean
    tabIndex: number
    onMouseEnter: () => void
    onFocus: () => void
  }
}

/**
 * Hook for keyboard navigation through a list of items
 * Supports arrow keys, Home/End, and Enter for selection
 */
export function useArrowKeyNavigation({
  itemCount,
  enabled = true,
  onSelect,
  onFocusChange,
  wrap = true,
  containerRef,
}: UseArrowKeyNavigationOptions): UseArrowKeyNavigationResult {
  const [focusedIndex, setFocusedIndexState] = useState(-1)
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map())

  const setFocusedIndex = useCallback((index: number) => {
    setFocusedIndexState(index)
    onFocusChange?.(index)

    // Scroll item into view
    const element = itemRefs.current.get(index)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [onFocusChange])

  const resetFocus = useCallback(() => {
    setFocusedIndexState(-1)
  }, [])

  const moveFocus = useCallback((direction: 'up' | 'down' | 'first' | 'last') => {
    if (itemCount === 0) return

    setFocusedIndexState(current => {
      let next: number

      switch (direction) {
        case 'up':
          if (current <= 0) {
            next = wrap ? itemCount - 1 : 0
          } else {
            next = current - 1
          }
          break
        case 'down':
          if (current >= itemCount - 1) {
            next = wrap ? 0 : itemCount - 1
          } else {
            next = current + 1
          }
          break
        case 'first':
          next = 0
          break
        case 'last':
          next = itemCount - 1
          break
        default:
          next = current
      }

      onFocusChange?.(next)

      // Scroll into view
      const element = itemRefs.current.get(next)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }

      return next
    })
  }, [itemCount, wrap, onFocusChange])

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if we're in the container or no container specified
      if (containerRef?.current && !containerRef.current.contains(e.target as Node)) {
        return
      }

      switch (e.key) {
        case 'ArrowDown':
        case 'j': // vim-style
          e.preventDefault()
          moveFocus('down')
          break
        case 'ArrowUp':
        case 'k': // vim-style
          e.preventDefault()
          moveFocus('up')
          break
        case 'Home':
          e.preventDefault()
          moveFocus('first')
          break
        case 'End':
          e.preventDefault()
          moveFocus('last')
          break
        case 'Enter':
          if (focusedIndex >= 0) {
            e.preventDefault()
            onSelect?.(focusedIndex)
          }
          break
        case 'Escape':
          resetFocus()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, focusedIndex, moveFocus, onSelect, resetFocus, containerRef])

  // Reset focus when item count changes
  useEffect(() => {
    if (focusedIndex >= itemCount) {
      setFocusedIndexState(itemCount > 0 ? itemCount - 1 : -1)
    }
  }, [itemCount, focusedIndex])

  const getItemProps = useCallback((index: number) => ({
    'data-nav-index': index,
    'aria-selected': focusedIndex === index,
    tabIndex: focusedIndex === index ? 0 : -1,
    onMouseEnter: () => setFocusedIndex(index),
    onFocus: () => setFocusedIndex(index),
    ref: (el: HTMLElement | null) => {
      if (el) {
        itemRefs.current.set(index, el)
      } else {
        itemRefs.current.delete(index)
      }
    },
  }), [focusedIndex, setFocusedIndex])

  return {
    focusedIndex,
    setFocusedIndex,
    resetFocus,
    getItemProps,
  }
}
