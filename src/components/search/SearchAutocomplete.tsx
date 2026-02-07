'use client'

import { useState, useEffect, useRef } from 'react'
import { getAutocompleteSuggestions, getSuggestionIcon, AutocompleteSuggestion } from '@/lib/autocomplete-suggestions'
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
      className="absolute z-50 w-full mt-2 bg-crt-black border-2 border-crt-light/40 rounded shadow-crt overflow-hidden animate-slide-in-down"
    >
      <div className="max-h-[400px] overflow-y-auto retro-scroll">
        {suggestions.map((suggestion, index) => (
          <button
            key={`${suggestion.category}-${suggestion.text}-${index}`}
            onClick={() => onSelect(suggestion.text)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={`w-full text-left px-4 py-3 border-b border-crt-light/20 last:border-b-0 transition-all
              ${
                index === selectedIndex
                  ? 'bg-phosphor-teal/20 border-l-4 border-l-phosphor-teal'
                  : 'bg-crt-dark hover:bg-crt-medium'
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg shrink-0">
                {getSuggestionIcon(suggestion.category)}
              </span>
              <div className="flex-1 min-w-0">
                <div className={`text-sm led-text ${index === selectedIndex ? 'text-phosphor-teal' : 'text-aged-cream'}`}>
                  {suggestion.text}
                </div>
                {suggestion.description && (
                  <div className="text-xs text-aged-cream/60 mt-0.5 truncate">
                    {suggestion.description}
                  </div>
                )}
              </div>
              {index === selectedIndex && (
                <span className="text-phosphor-teal text-xs led-text shrink-0">
                  ↵ ENTER
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
      
      <div className="px-4 py-2 bg-crt-medium border-t border-crt-light/20 flex items-center justify-between">
        <span className="text-aged-cream/60 text-xs led-text tracking-wide">
          ↑↓ NAVIGATE · ↵ SELECT · ESC CLOSE
        </span>
        <span className="text-aged-cream/30 text-xs led-text">
          {suggestions.length} SUGGESTIONS
        </span>
      </div>
    </div>
  )
}
