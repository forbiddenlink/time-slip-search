'use client'

import { useState, useEffect } from 'react'
import type { DatePreview } from '@/lib/date-parser'
import { HISTORICAL_ERAS, HISTORICAL_EVENTS } from '@/lib/historical-date-parser'
import { enrichTemporalQuery, getActiveEras, getNearbyEvents } from '@/lib/temporal-search'

interface DateSuggestionsProps {
  preview: DatePreview
  onSelect: (suggestion: string) => void
  onClose: () => void
}

interface SuggestionItem {
  text: string
  description: string
  type: 'parsed' | 'alternate' | 'era' | 'event' | 'nearby'
}

export function DateSuggestions({
  preview,
  onSelect,
  onClose,
}: Readonly<DateSuggestionsProps>) {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)

  useEffect(() => {
    const items: SuggestionItem[] = []

    // Add the parsed interpretation if available
    if (preview.parsed) {
      items.push({
        text: preview.parsed.display,
        description: preview.parsed.isHistorical
          ? 'Historical era'
          : preview.parsed.isRange
            ? 'Date range'
            : 'Interpreted date',
        type: 'parsed',
      })

      // Add enriched temporal suggestions
      const enriched = enrichTemporalQuery(preview.parsed)

      // Add related eras
      for (const era of enriched.relatedEras.slice(0, 2)) {
        items.push({
          text: era.display,
          description: `${era.startYear} - ${era.endYear}`,
          type: 'era',
        })
      }

      // Add suggested queries
      for (const suggestion of enriched.suggestedQueries.slice(0, 2)) {
        items.push({
          text: suggestion,
          description: 'Related time period',
          type: 'nearby',
        })
      }

      // Add active eras for the year
      const activeEras = getActiveEras(preview.parsed.year)
      for (const era of activeEras.slice(0, 2)) {
        if (!items.some((item) => item.text === era)) {
          items.push({
            text: era,
            description: 'Active during this time',
            type: 'era',
          })
        }
      }

      // Add nearby events
      const nearbyEvents = getNearbyEvents(preview.parsed.year, 3)
      for (const event of nearbyEvents.slice(0, 2)) {
        items.push({
          text: event.event,
          description: `${event.year}`,
          type: 'event',
        })
      }
    }

    // Add alternate interpretations
    for (const alt of preview.alternateInterpretations) {
      if (!items.some((item) => item.text === alt)) {
        items.push({
          text: alt,
          description: 'Alternative interpretation',
          type: 'alternate',
        })
      }
    }

    // Add quick era suggestions if no date parsed
    if (!preview.parsed && preview.original.length > 2) {
      const lowerInput = preview.original.toLowerCase()

      // Search for matching eras
      const eraEntries = Object.entries(HISTORICAL_ERAS) as Array<
        [string, { start: number; end: number; display: string }]
      >
      for (const [key, value] of eraEntries) {
        if (key.includes(lowerInput) || lowerInput.includes(key)) {
          items.push({
            text: value.display,
            description: `${value.start} - ${value.end}`,
            type: 'era',
          })
        }
      }

      // Search for matching events
      const eventEntries = Object.entries(HISTORICAL_EVENTS) as Array<
        [string, { start: number; end: number; display: string }]
      >
      for (const [key, value] of eventEntries) {
        if (key.includes(lowerInput) || lowerInput.includes(key)) {
          items.push({
            text: value.display,
            description: `${value.start}`,
            type: 'event',
          })
        }
      }
    }

    // Limit and deduplicate
    const uniqueItems = items.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.text === item.text)
    )

    setSuggestions(uniqueItems.slice(0, 8))
    setSelectedIndex(-1)
  }, [preview])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (suggestions.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
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
  }, [suggestions, selectedIndex, onSelect, onClose])

  if (suggestions.length === 0) {
    return null
  }

  const getTypeIcon = (type: SuggestionItem['type']): string => {
    switch (type) {
      case 'parsed':
        return '📅'
      case 'alternate':
        return '🔄'
      case 'era':
        return '🏛️'
      case 'event':
        return '⭐'
      case 'nearby':
        return '🔗'
    }
  }

  const getTypeColor = (type: SuggestionItem['type']): string => {
    switch (type) {
      case 'parsed':
        return 'text-phosphor-green'
      case 'alternate':
        return 'text-phosphor-amber'
      case 'era':
        return 'text-phosphor-teal'
      case 'event':
        return 'text-vinyl-label-bright'
      case 'nearby':
        return 'text-aged-cream/80'
    }
  }

  return (
    <div className="absolute z-50 w-full mt-2 bg-crt-black border-2 border-crt-light/40 rounded shadow-crt overflow-hidden animate-slide-in-down">
      <div className="max-h-[300px] overflow-y-auto retro-scroll">
        {suggestions.map((suggestion, index) => (
          <button
            key={`${suggestion.type}-${suggestion.text}-${index}`}
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
                {getTypeIcon(suggestion.type)}
              </span>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm led-text ${
                    index === selectedIndex
                      ? 'text-phosphor-teal'
                      : getTypeColor(suggestion.type)
                  }`}
                >
                  {suggestion.text}
                </div>
                <div className="text-xs text-aged-cream/60 mt-0.5 truncate">
                  {suggestion.description}
                </div>
              </div>
              {index === selectedIndex && (
                <span className="text-phosphor-teal text-xs led-text shrink-0">
                  ENTER
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="px-4 py-2 bg-crt-medium border-t border-crt-light/20 flex items-center justify-between">
        <span className="text-aged-cream/60 text-xs led-text tracking-wide">
          NAVIGATE · SELECT · ESC CLOSE
        </span>
        <span className="text-aged-cream/30 text-xs led-text">
          {suggestions.length} SUGGESTIONS
        </span>
      </div>
    </div>
  )
}
