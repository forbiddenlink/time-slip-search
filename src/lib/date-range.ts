/**
 * Enhanced date range query support
 * Examples: "all of 1985", "the entire 80s", "Jan to Dec 1990"
 */

import { DateRange } from './date-parser'

export interface ExpandedDateRange extends DateRange {
  totalMonths?: number
  totalYears?: number
  queryType: 'single' | 'month' | 'year' | 'decade' | 'custom-range'
}

/**
 * Detect if a query is asking for a broad time period
 */
export function isLongRangeQuery(query: string): boolean {
  const patterns = [
    /all\s+of\s+\d{4}/i,
    /entire\s+\d{4}/i,
    /whole\s+\d{4}/i,
    /throughout\s+\d{4}/i,
    /the\s+\d{2}s/i, // decades
    /from\s+.+\s+to\s+.+/i,
    /between\s+.+\s+and\s+.+/i,
  ]
  
  return patterns.some(pattern => pattern.test(query))
}

/**
 * Expand a date range query into manageable chunks
 * Algolia performs better with smaller time windows
 */
export function expandDateRange(dateRange: DateRange): ExpandedDateRange {
  const timeDiff = dateRange.end - dateRange.start
  const days = timeDiff / (24 * 60 * 60)
  const months = days / 30
  const years = days / 365

  let queryType: ExpandedDateRange['queryType'] = 'single'
  
  if (years >= 5) {
    queryType = 'decade'
  } else if (years >= 1) {
    queryType = 'year'
  } else if (months >= 1) {
    queryType = 'month'
  } else if (dateRange.isRange) {
    queryType = 'custom-range'
  }

  return {
    ...dateRange,
    totalMonths: Math.ceil(months),
    totalYears: Math.ceil(years),
    queryType,
  }
}

/**
 * Split a long date range into smaller chunks for efficient querying
 */
export function splitDateRange(
  dateRange: ExpandedDateRange,
  chunkSize: 'month' | 'year' = 'month'
): DateRange[] {
  const chunks: DateRange[] = []
  const startDate = new Date(dateRange.start * 1000)
  const endDate = new Date(dateRange.end * 1000)

  let current = new Date(startDate)
  
  while (current <= endDate) {
    const chunkStart = new Date(current)
    let chunkEnd: Date
    
    if (chunkSize === 'year') {
      chunkEnd = new Date(current.getFullYear() + 1, 0, 1)
    } else {
      chunkEnd = new Date(current.getFullYear(), current.getMonth() + 1, 1)
    }
    
    if (chunkEnd > endDate) {
      chunkEnd = endDate
    }

    chunks.push({
      start: Math.floor(chunkStart.getTime() / 1000),
      end: Math.floor(chunkEnd.getTime() / 1000),
      display: formatChunkDisplay(chunkStart, chunkEnd),
      year: chunkStart.getFullYear(),
    })

    current = chunkEnd
  }

  return chunks
}

function formatChunkDisplay(start: Date, end: Date): string {
  const startMonth = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  const endMonth = end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  
  if (startMonth === endMonth) {
    return startMonth
  }
  
  return `${startMonth} - ${endMonth}`
}

/**
 * Suggest optimal pagination for large date ranges
 */
export function getOptimalPagination(dateRange: ExpandedDateRange): {
  recommended: boolean
  chunkSize: 'month' | 'year'
  estimatedChunks: number
  warning?: string
} {
  if (!dateRange.totalYears) {
    return { recommended: false, chunkSize: 'month', estimatedChunks: 1 }
  }

  if (dateRange.totalYears > 10) {
    return {
      recommended: true,
      chunkSize: 'year',
      estimatedChunks: Math.ceil(dateRange.totalYears),
      warning: 'Very broad query - results may be paginated'
    }
  }

  if (dateRange.totalYears > 2) {
    return {
      recommended: true,
      chunkSize: 'year',
      estimatedChunks: Math.ceil(dateRange.totalYears),
    }
  }

  if (dateRange.totalMonths && dateRange.totalMonths > 3) {
    return {
      recommended: true,
      chunkSize: 'month',
      estimatedChunks: Math.ceil(dateRange.totalMonths),
    }
  }

  return { recommended: false, chunkSize: 'month', estimatedChunks: 1 }
}
