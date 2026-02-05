import * as chrono from 'chrono-node'

export interface DateRange {
  start: number  // Unix timestamp
  end: number    // Unix timestamp
  display: string
  year: number
  isRange?: boolean  // Flag for date range queries
}

/**
 * Parse natural language date expressions into timestamp ranges
 * Handles: "March 1987", "Summer of '69", "July 4, 1985", date ranges, etc.
 */
export function parseDate(input: string): DateRange | null {
  // Handle special cases first
  const lowerInput = input.toLowerCase()

  // Date range patterns: "from X to Y", "between X and Y", "X to Y", "X - Y"
  const rangePatterns = [
    /from\s+(.+?)\s+to\s+(.+)/,
    /between\s+(.+?)\s+and\s+(.+)/,
    /(.+?)\s+to\s+(.+)/,
    /(.+?)\s*-\s*(.+)/,
  ]

  for (const pattern of rangePatterns) {
    const match = lowerInput.match(pattern)
    if (match && match[1] && match[2]) {
      const start = parseDate(match[1])
      const end = parseDate(match[2])
      
      if (start && end) {
        return {
          start: start.start,
          end: end.end,
          display: `${start.display} to ${end.display}`,
          year: start.year,
          isRange: true,
        }
      }
    }
  }

  // Summer of 'XX patterns
  const summerMatch = lowerInput.match(/summer\s+(?:of\s+)?['']?(\d{2,4})/)
  if (summerMatch && summerMatch[1]) {
    const year = normalizeYear(summerMatch[1])
    return {
      start: getTimestamp(year, 6, 1),
      end: getTimestamp(year, 8, 31),
      display: `Summer of ${year}`,
      year,
    }
  }

  // Winter of 'XX patterns
  const winterMatch = lowerInput.match(/winter\s+(?:of\s+)?['']?(\d{2,4})/)
  if (winterMatch && winterMatch[1]) {
    const year = normalizeYear(winterMatch[1])
    return {
      start: getTimestamp(year - 1, 12, 1),
      end: getTimestamp(year, 2, 28),
      display: `Winter of ${year}`,
      year,
    }
  }

  // The 80s, 90s, etc.
  const decadeMatch = lowerInput.match(/(?:the\s+)?['']?(\d{2})s/)
  if (decadeMatch && decadeMatch[1]) {
    const decade = parseInt(decadeMatch[1])
    const year = decade < 30 ? 2000 + decade : 1900 + decade
    return {
      start: getTimestamp(year, 1, 1),
      end: getTimestamp(year + 9, 12, 31),
      display: `the ${year}s`,
      year,
    }
  }

  // Plain year like "1980"
  const yearMatch = input.trim().match(/^(\d{4})$/)
  if (yearMatch && yearMatch[1]) {
    const year = parseInt(yearMatch[1])
    if (year >= 1958 && year <= 2020) {
      return {
        start: getTimestamp(year, 1, 1),
        end: getTimestamp(year, 12, 31),
        display: year.toString(),
        year,
      }
    }
  }

  // Try chrono-node for everything else
  const parsed = chrono.parse(input)

  if (parsed.length > 0 && parsed[0]) {
    const result = parsed[0]
    const startDate = result.start.date()
    const year = startDate.getFullYear()

    // If only month/year specified, expand to full month
    if (!result.start.isCertain('day')) {
      const month = startDate.getMonth() + 1
      const lastDay = new Date(year, month, 0).getDate()
      return {
        start: getTimestamp(year, month, 1),
        end: getTimestamp(year, month, lastDay),
        display: formatMonthYear(month, year),
        year,
      }
    }

    // Specific date: expand to +/- 3 days for better results
    const start = new Date(startDate)
    start.setDate(start.getDate() - 3)
    const end = new Date(startDate)
    end.setDate(end.getDate() + 3)

    return {
      start: Math.floor(start.getTime() / 1000),
      end: Math.floor(end.getTime() / 1000),
      display: formatDate(startDate),
      year,
    }
  }

  return null
}

function normalizeYear(yearStr: string): number {
  const year = parseInt(yearStr)
  if (year < 100) {
    return year < 30 ? 2000 + year : 1900 + year
  }
  return year
}

function getTimestamp(year: number, month: number, day: number): number {
  return Math.floor(new Date(year, month - 1, day).getTime() / 1000)
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatMonthYear(month: number, year: number): string {
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}
