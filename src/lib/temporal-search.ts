/**
 * Temporal Search Utilities
 * Provides advanced date-based search capabilities for historical queries
 */

import { DateRange } from './date-parser'
import {
  HISTORICAL_ERAS,
  HISTORICAL_EVENTS,
  TemporalRange,
  getErasForPeriod,
  getHistoricalContext,
} from './historical-date-parser'

export interface TemporalSearchOptions {
  /** Include overlapping eras in results */
  includeOverlappingEras?: boolean
  /** Maximum number of results per era chunk */
  maxResultsPerChunk?: number
  /** Sort order for time-based results */
  sortOrder?: 'chronological' | 'reverse-chronological' | 'relevance'
}

export interface TemporalSearchResult {
  query: DateRange
  relatedEras: TemporalRange[]
  suggestedQueries: string[]
  timelinePosition: {
    percentageThrough: number
    nearestMilestone: string | null
  }
}

/**
 * Enhance a date query with temporal context
 */
export function enrichTemporalQuery(dateRange: DateRange): TemporalSearchResult {
  const year = dateRange.year
  const startYear = new Date(dateRange.start * 1000).getFullYear()
  const endYear = new Date(dateRange.end * 1000).getFullYear()

  // Find related eras
  const relatedEras = getErasForPeriod(startYear, endYear)

  // Generate suggested queries based on the time period
  const suggestedQueries = generateSuggestedQueries(startYear, endYear)

  // Calculate timeline position (relative to recorded music history 1900-present)
  const timelinePosition = calculateTimelinePosition(year)

  return {
    query: dateRange,
    relatedEras,
    suggestedQueries,
    timelinePosition,
  }
}

/**
 * Generate suggested queries for a time period
 */
function generateSuggestedQueries(startYear: number, endYear: number): string[] {
  const suggestions: string[] = []
  const midYear = Math.floor((startYear + endYear) / 2)

  // Add era-based suggestions
  const eras = getErasForPeriod(startYear, endYear)
  for (const era of eras.slice(0, 3)) {
    suggestions.push(`during ${era.display}`)
  }

  // Add decade suggestions if within range
  if (midYear >= 1950 && midYear <= 2020) {
    const decadeStart = Math.floor(midYear / 10) * 10
    suggestions.push(`the ${decadeStart}s`)
  }

  // Add before/after suggestions for notable events
  for (const [key, event] of Object.entries(HISTORICAL_EVENTS)) {
    if (Math.abs(event.start - midYear) <= 10) {
      if (event.start > midYear) {
        suggestions.push(`before ${key}`)
      } else {
        suggestions.push(`after ${key}`)
      }
    }
  }

  return [...new Set(suggestions)].slice(0, 5)
}

/**
 * Calculate position on timeline of recorded music history
 */
function calculateTimelinePosition(year: number): {
  percentageThrough: number
  nearestMilestone: string | null
} {
  // Timeline: 1900 (early recordings) to present
  const timelineStart = 1900
  const timelineEnd = new Date().getFullYear()
  const timelineLength = timelineEnd - timelineStart

  const percentageThrough = Math.max(
    0,
    Math.min(100, ((year - timelineStart) / timelineLength) * 100)
  )

  // Find nearest milestone
  const milestones: Record<number, string> = {
    1920: 'the birth of radio broadcasting',
    1948: 'the introduction of the LP record',
    1954: 'the birth of rock and roll',
    1963: 'the British Invasion begins',
    1969: 'Woodstock',
    1981: 'MTV launches',
    1982: 'the CD era begins',
    1999: 'Napster changes everything',
    2003: 'iTunes Store opens',
    2008: 'Spotify launches',
  }

  let nearestMilestone: string | null = null
  let nearestDistance = Infinity

  for (const [milestoneYear, description] of Object.entries(milestones)) {
    const distance = Math.abs(year - parseInt(milestoneYear))
    if (distance < nearestDistance && distance <= 5) {
      nearestDistance = distance
      nearestMilestone = description
    }
  }

  return { percentageThrough, nearestMilestone }
}

/**
 * Parse relative temporal expressions
 * Examples: "5 years before WWI", "a decade after the moon landing"
 */
export function parseRelativeTemporalExpression(input: string): DateRange | null {
  const lowerInput = input.toLowerCase().trim()

  // Pattern: "[number] [unit] before/after [event/era]"
  const relativePattern =
    /(\d+|a|an|one|two|three|four|five|ten)?\s*(years?|decades?|centuries?|months?)?\s*(before|after|prior to|following)\s+(?:the\s+)?(.+)/i

  const match = lowerInput.match(relativePattern)
  if (!match) return null

  const [, numStr, unitStr, direction, reference] = match

  // Parse the number
  let num = 1
  if (numStr) {
    const wordToNum: Record<string, number> = {
      a: 1,
      an: 1,
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      ten: 10,
    }
    num = wordToNum[numStr.toLowerCase()] || parseInt(numStr, 10) || 1
  }

  // Parse the unit (default to years)
  let yearsOffset = num
  if (unitStr) {
    const unit = unitStr.toLowerCase()
    if (unit.startsWith('decade')) {
      yearsOffset = num * 10
    } else if (unit.startsWith('centur')) {
      yearsOffset = num * 100
    } else if (unit.startsWith('month')) {
      yearsOffset = num / 12
    }
  }

  // Find the reference event/era
  const refKey = reference?.toLowerCase().replace(/\s+era|\s+period|\s+age/g, '').trim()
  const era = HISTORICAL_ERAS[refKey ?? ''] || HISTORICAL_EVENTS[refKey ?? '']

  if (!era || !refKey) return null

  const isBefore = direction === 'before' || direction === 'prior to'
  let targetYear: number

  if (isBefore) {
    targetYear = era.start - yearsOffset
  } else {
    targetYear = era.end + yearsOffset
  }

  // Create a 1-year range around the target
  return {
    start: Math.floor(new Date(targetYear, 0, 1).getTime() / 1000),
    end: Math.floor(new Date(targetYear, 11, 31).getTime() / 1000),
    display: `${num} ${unitStr || 'year'}${num > 1 ? 's' : ''} ${direction} ${era.display}`,
    year: targetYear,
    isRange: false,
    isHistorical: true,
    historicalContext: getHistoricalContext(targetYear),
  }
}

/**
 * Get all eras active during a specific year
 */
export function getActiveEras(year: number): string[] {
  const active: string[] = []

  for (const [, value] of Object.entries(HISTORICAL_ERAS)) {
    if (year >= value.start && year <= value.end) {
      active.push(value.display)
    }
  }

  return active
}

/**
 * Find events near a given year
 */
export function getNearbyEvents(
  year: number,
  radiusYears: number = 5
): Array<{ year: number; event: string }> {
  const nearby: Array<{ year: number; event: string }> = []

  for (const [, value] of Object.entries(HISTORICAL_EVENTS)) {
    if (Math.abs(value.start - year) <= radiusYears) {
      nearby.push({ year: value.start, event: value.display })
    }
  }

  return nearby.sort((a, b) => a.year - b.year)
}

/**
 * Determine if a query spans multiple distinct eras
 */
export function isMultiEraQuery(dateRange: DateRange): boolean {
  const startYear = new Date(dateRange.start * 1000).getFullYear()
  const endYear = new Date(dateRange.end * 1000).getFullYear()

  const startEras = new Set(getActiveEras(startYear))
  const endEras = new Set(getActiveEras(endYear))

  // Check if there are eras in end that weren't in start
  for (const era of endEras) {
    if (!startEras.has(era)) {
      return true
    }
  }

  return false
}

/**
 * Split a long historical range into meaningful chunks
 */
export function splitHistoricalRange(dateRange: DateRange): DateRange[] {
  const startYear = new Date(dateRange.start * 1000).getFullYear()
  const endYear = new Date(dateRange.end * 1000).getFullYear()
  const span = endYear - startYear

  // If span is less than 20 years, don't split
  if (span < 20) {
    return [dateRange]
  }

  // Find era boundaries within the range
  const eraBoundaries: number[] = [startYear]

  for (const [, value] of Object.entries(HISTORICAL_ERAS)) {
    if (value.start > startYear && value.start < endYear) {
      eraBoundaries.push(value.start)
    }
    if (value.end > startYear && value.end < endYear) {
      eraBoundaries.push(value.end + 1)
    }
  }

  eraBoundaries.push(endYear)

  // Remove duplicates and sort
  const uniqueBoundaries = [...new Set(eraBoundaries)].sort((a, b) => a - b)

  // Create chunks from boundaries
  const chunks: DateRange[] = []
  for (let i = 0; i < uniqueBoundaries.length - 1; i++) {
    const chunkStart = uniqueBoundaries[i]!
    const chunkEnd = uniqueBoundaries[i + 1]! - 1

    if (chunkEnd > chunkStart) {
      const midYear = Math.floor((chunkStart + chunkEnd) / 2)
      chunks.push({
        start: Math.floor(new Date(chunkStart, 0, 1).getTime() / 1000),
        end: Math.floor(new Date(chunkEnd, 11, 31).getTime() / 1000),
        display: `${chunkStart} - ${chunkEnd}`,
        year: midYear,
        isRange: true,
        isHistorical: true,
        historicalContext: getHistoricalContext(midYear),
      })
    }
  }

  return chunks.length > 0 ? chunks : [dateRange]
}
