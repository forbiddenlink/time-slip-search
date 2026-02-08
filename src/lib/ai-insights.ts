/**
 * AI Insights - Generate emotional, era-specific narratives
 * Uses template-based generation for rich storytelling
 */

import { getEraContext, YEAR_HIGHLIGHTS, ERA_NARRATIVES, SEASON_CONTEXT } from './era-narratives'
import type { SearchResults } from './algolia'

/**
 * Get the season from a month number (1-12)
 */
function getSeason(month: number): 'spring' | 'summer' | 'fall' | 'winter' {
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'fall'
  return 'winter'
}

/**
 * Get a random element from an array
 */
function randomElement<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Generate an emotional narrative for a specific date
 */
export function generateEmotionalNarrative(
  year: number,
  month?: number,
  results?: SearchResults
): string {
  const parts: string[] = []
  const decade = `${Math.floor(year / 10) * 10}s`

  // Check for year-specific highlight
  const yearHighlight = YEAR_HIGHLIGHTS[year]
  if (yearHighlight) {
    parts.push(yearHighlight + '.')
  }

  // Add season context if month is provided
  if (month) {
    const season = getSeason(month)
    const seasonOpener = randomElement(SEASON_CONTEXT[season] ?? [])
    if (seasonOpener) {
      parts.push(seasonOpener)
    }
  }

  // Add era narrative
  const eraNarratives = ERA_NARRATIVES[decade]
  if (eraNarratives) {
    const narrative = randomElement(eraNarratives)
    if (narrative) {
      // Remove trailing ellipsis if present and add proper punctuation
      const cleanNarrative = narrative.replace(/\.{3}$/, '.')
      parts.push(cleanNarrative)
    }
  }

  // Add context from results if available
  if (results) {
    // Top song context
    if (results.songs.length > 0) {
      const topSong = results.songs[0]
      if (topSong) {
        const songPhrases = [
          `"${topSong.song_title}" by ${topSong.artist} was ruling the airwaves.`,
          `The sound of "${topSong.song_title}" filled every radio.`,
          `${topSong.artist}'s "${topSong.song_title}" captured the moment perfectly.`,
        ]
        const songPhrase = randomElement(songPhrases)
        if (songPhrase) {
          parts.push(songPhrase)
        }
      }
    }

    // Movie context
    if (results.movies.length > 0) {
      const topMovie = results.movies[0]
      if (topMovie) {
        const moviePhrases = [
          `At the movies, "${topMovie.title}" had audiences captivated.`,
          `People were lining up to see "${topMovie.title}".`,
          `"${topMovie.title}" was the film everyone was talking about.`,
        ]
        const moviePhrase = randomElement(moviePhrases)
        if (moviePhrase) {
          parts.push(moviePhrase)
        }
      }
    }

    // Price context for relatability
    if (results.prices.length > 0) {
      const price = results.prices[0]
      if (price?.gas_price_gallon) {
        const gasPhrases = [
          `A gallon of gas cost just $${price.gas_price_gallon.toFixed(2)}.`,
          `You could fill your tank for $${(price.gas_price_gallon * 15).toFixed(2)}.`,
        ]
        const gasPhrase = randomElement(gasPhrases)
        if (gasPhrase) {
          parts.push(gasPhrase)
        }
      }
    }
  }

  // Combine parts into flowing narrative
  if (parts.length === 0) {
    return `Step back into ${year}, a moment frozen in time.`
  }

  return parts.join(' ')
}

/**
 * Generate a short teaser narrative for previews
 */
export function generateTeaserNarrative(year: number, month?: number): string {
  const decade = `${Math.floor(year / 10) * 10}s`

  // Year highlight if available
  if (YEAR_HIGHLIGHTS[year]) {
    return YEAR_HIGHLIGHTS[year]
  }

  // Season + era combo
  if (month) {
    const season = getSeason(month)
    const seasonWord = season === 'summer' ? 'summer' :
                       season === 'winter' ? 'winter' :
                       season === 'fall' ? 'autumn' : 'spring'
    return `${seasonWord.charAt(0).toUpperCase() + seasonWord.slice(1)} ${year}. The ${decade} in full swing.`
  }

  // Just the era
  return getEraContext(year, month)
}

/**
 * Generate personalized follow-up suggestions based on context
 */
export function generatePersonalizedSuggestions(
  year: number,
  month: number | undefined,
  previousYears: number[]
): string[] {
  const suggestions: string[] = []
  const decade = Math.floor(year / 10) * 10

  // Same month, different year
  if (month) {
    const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long' })
    suggestions.push(`${monthName} ${year - 10}`)
    suggestions.push(`${monthName} ${year + 10}`)
  }

  // Decade exploration if not deeply explored
  const decadeYears = previousYears.filter(y => Math.floor(y / 10) * 10 === decade)
  if (decadeYears.length < 5) {
    suggestions.push(`Random ${decade}s date`)
  }

  // Adjacent decades
  suggestions.push(`The ${decade - 10}s`)
  suggestions.push(`The ${decade + 10}s`)

  // Famous years nearby
  const famousYears = [1969, 1977, 1980, 1984, 1989, 1991, 1999, 2000, 2001, 2007]
  const nearbyFamous = famousYears.filter(y => Math.abs(y - year) < 10 && y !== year)
  if (nearbyFamous.length > 0) {
    const famous = randomElement(nearbyFamous)
    if (famous) {
      suggestions.push(`${famous}`)
    }
  }

  return suggestions.slice(0, 5)
}

/**
 * Get a "Did you know?" fact for a year
 */
export function getDidYouKnow(year: number): string | null {
  const facts: Record<number, string> = {
    1958: 'The Billboard Hot 100 chart was born this year!',
    1963: 'The Beatles released their debut album in the US.',
    1967: 'The Summer of Love brought 100,000 people to San Francisco.',
    1969: '500 million people watched the Moon landing live on TV.',
    1977: 'The first Star Wars film grossed $775 million worldwide.',
    1980: 'Pac-Man became the first game to have a pop culture mascot.',
    1981: 'MTV launched with "Video Killed the Radio Star".',
    1982: 'Thriller became the best-selling album of all time.',
    1984: 'Apple aired its famous "1984" Super Bowl commercial.',
    1989: 'The Berlin Wall fell after 28 years.',
    1991: 'The World Wide Web was made available to the public.',
    1994: 'Amazon was founded in Jeff Bezos\'s garage.',
    1997: 'The first Harry Potter book was published.',
    1999: 'Napster changed how we discover music forever.',
    2001: 'Wikipedia launched, forever changing how we find information.',
    2004: 'Facebook launched from a Harvard dorm room.',
    2007: 'The iPhone was unveiled, changing mobile computing forever.',
    2008: 'Barack Obama became the first Black US President.',
    2010: 'Instagram launched and changed photography culture.',
  }

  return facts[year] ?? null
}
