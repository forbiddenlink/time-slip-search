'use client'

import { useState, useEffect, useRef } from 'react'
import { getAutocompleteSuggestions, AutocompleteSuggestion } from '@/lib/autocomplete-suggestions'
import { SearchHistory } from '@/lib/agent-memory'

interface SearchAutocompleteProps {
  query: string
  onSelect: (suggestion: string) => void
  isVisible: boolean
  onClose: () => void
}

export function SearchAutocomplete({ query, onSelect, isVisible, onClose }: Readonly<SearchAutocompleteProps>) {
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isVisible) {
      setSuggestions([])
      setSelectedIndex(-1)
      return
    }

    // Get recent searches from memory
    const recentSearches = SearchHistory.getRecent(5).map(item => item.query)
    
    // Get suggestions
    const results = getAutocompleteSuggestions(query, recentSearches, 8)
    setSuggestions(results)
    setSelectedIndex(-1)
  }, [query, isVisible])

  useEffect(() => {
    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible || suggestions.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
          break
        case 'Enter':
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            e.preventDefault()
            onSelect(suggestions[selectedIndex].text)
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, suggestions, selectedIndex, onSelect, onClose])

  if (!isVisible || suggestions.length === 0) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="absolute z-50 mt-2 w-full overflow-hidden border-2 border-ink bg-newsprint text-ink"
    >
      <div className="max-h-[400px] overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <button
            key={`${suggestion.category}-${suggestion.text}-${index}`}
            onClick={() => onSelect(suggestion.text)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={`w-full border-b border-ink/25 px-4 py-3 text-left last:border-b-0
              ${
                index === selectedIndex
                  ? 'border-l-4 border-l-edition bg-ink/10'
                  : 'hover:bg-ink/5'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className={`font-display text-base`}>
                  {suggestion.text}
                </div>
                {suggestion.description && (
                  <div className="mt-0.5 truncate font-body text-xs text-faded">
                    {suggestion.description}
                  </div>
                )}
              </div>
              {index === selectedIndex && (
                <span className="ed-label shrink-0 text-edition">
                  Enter
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
      
      <div className="flex items-center justify-between border-t border-ink bg-ink/5 px-4 py-2">
        <span className="ed-label text-faded">
          Arrows to move, Enter to pick, Esc to close
        </span>
        <span className="ed-label text-faded">
          {suggestions.length} suggestions
        </span>
      </div>
    </div>
  )
}
