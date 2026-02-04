/**
 * Autocomplete suggestions for TimeSlipSearch
 * Provides historical dates, decades, and famous events
 */

export interface AutocompleteSuggestion {
  text: string
  category: 'date' | 'decade' | 'event' | 'year'
  description?: string
}

// Famous historical dates and events
export const FAMOUS_EVENTS: AutocompleteSuggestion[] = [
  { text: 'July 20, 1969', category: 'event', description: 'Moon landing' },
  { text: 'November 9, 1989', category: 'event', description: 'Berlin Wall falls' },
  { text: 'August 15, 1969', category: 'event', description: 'Woodstock begins' },
  { text: 'July 4, 1976', category: 'event', description: 'US Bicentennial' },
  { text: 'January 28, 1986', category: 'event', description: 'Challenger disaster' },
  { text: 'December 25, 1991', category: 'event', description: 'Soviet Union dissolves' },
  { text: 'February 9, 1964', category: 'event', description: 'Beatles on Ed Sullivan' },
  { text: 'November 22, 1963', category: 'event', description: 'JFK assassination' },
  { text: 'August 8, 1974', category: 'event', description: 'Nixon resigns' },
  { text: 'June 17, 1972', category: 'event', description: 'Watergate break-in' },
]

// Decade shortcuts
export const DECADES: AutocompleteSuggestion[] = [
  { text: 'the 1950s', category: 'decade', description: 'Rock & Roll era' },
  { text: 'the 1960s', category: 'decade', description: 'British Invasion' },
  { text: 'the 1970s', category: 'decade', description: 'Disco & Funk' },
  { text: 'the 1980s', category: 'decade', description: 'MTV generation' },
  { text: 'the 1990s', category: 'decade', description: 'Grunge & Hip-Hop' },
  { text: 'the 2000s', category: 'decade', description: 'Digital age' },
  { text: 'the 2010s', category: 'decade', description: 'Streaming era' },
]

// Notable years
export const NOTABLE_YEARS: AutocompleteSuggestion[] = [
  { text: '1969', category: 'year', description: 'Woodstock & Moon landing' },
  { text: '1984', category: 'year', description: 'Olympic Games in LA' },
  { text: '1989', category: 'year', description: 'Berlin Wall falls' },
  { text: '1991', category: 'year', description: 'Soviet Union ends' },
  { text: '2000', category: 'year', description: 'Y2K & new millennium' },
]

// Common date patterns
export const DATE_PATTERNS: AutocompleteSuggestion[] = [
  { text: 'Christmas 1985', category: 'date', description: 'Holiday season' },
  { text: 'Summer of 69', category: 'date', description: 'Classic summer' },
  { text: 'New Years Eve 1999', category: 'date', description: 'Millennium celebration' },
  { text: 'Halloween 1978', category: 'date', description: 'Spooky season' },
  { text: 'Valentines Day 1990', category: 'date', description: 'Romance' },
]

/**
 * Get autocomplete suggestions based on user input
 */
export function getAutocompleteSuggestions(
  query: string,
  recentSearches: string[] = [],
  maxResults: number = 8
): AutocompleteSuggestion[] {
  const normalizedQuery = query.toLowerCase().trim()
  
  if (!normalizedQuery) {
    // Return recent searches and popular suggestions when input is empty
    const suggestions: AutocompleteSuggestion[] = []
    
    // Add recent searches (up to 3)
    recentSearches.slice(0, 3).forEach(search => {
      suggestions.push({ text: search, category: 'date', description: 'Recent search' })
    })
    
    // Add some popular suggestions
    suggestions.push(...DECADES.slice(0, 3))
    suggestions.push(...FAMOUS_EVENTS.slice(0, 2))
    
    return suggestions.slice(0, maxResults)
  }
  
  const allSuggestions = [
    ...FAMOUS_EVENTS,
    ...DECADES,
    ...NOTABLE_YEARS,
    ...DATE_PATTERNS,
  ]
  
  // Filter suggestions based on query
  const filtered = allSuggestions.filter(suggestion => {
    const textMatch = suggestion.text.toLowerCase().includes(normalizedQuery)
    const descMatch = suggestion.description?.toLowerCase().includes(normalizedQuery)
    return textMatch || descMatch
  })
  
  // Add recent searches that match
  const matchingRecent = recentSearches
    .filter(search => search.toLowerCase().includes(normalizedQuery))
    .map(search => ({ text: search, category: 'date' as const, description: 'Recent search' }))
  
  // Combine and deduplicate
  const combined = [...matchingRecent.slice(0, 2), ...filtered]
  const unique = Array.from(new Map(combined.map(s => [s.text, s])).values())
  
  return unique.slice(0, maxResults)
}

/**
 * Get suggestion icon based on category
 */
export function getSuggestionIcon(category: AutocompleteSuggestion['category']): string {
  switch (category) {
    case 'event':
      return '📅'
    case 'decade':
      return '🎵'
    case 'year':
      return '📆'
    case 'date':
      return '🔍'
    default:
      return '•'
  }
}
