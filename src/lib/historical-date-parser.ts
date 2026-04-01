/**
 * Custom chrono-node parsers for historical date expressions
 * Handles: "during the Renaissance", "before WWI", "the Victorian era", etc.
 */

import * as chrono from 'chrono-node'

/**
 * Historical era definitions with date ranges
 */
export const HISTORICAL_ERAS: Record<string, { start: number; end: number; display: string }> = {
  // Ancient History
  'bronze age': { start: -3000, end: -1200, display: 'the Bronze Age' },
  'iron age': { start: -1200, end: 500, display: 'the Iron Age' },
  'classical antiquity': { start: -800, end: 500, display: 'Classical Antiquity' },
  'roman empire': { start: -27, end: 476, display: 'the Roman Empire' },
  'roman': { start: -27, end: 476, display: 'the Roman era' },

  // Medieval Period
  'medieval': { start: 500, end: 1500, display: 'the Medieval period' },
  'middle ages': { start: 500, end: 1500, display: 'the Middle Ages' },
  'dark ages': { start: 500, end: 1000, display: 'the Dark Ages' },
  'crusades': { start: 1095, end: 1291, display: 'the Crusades' },
  'black death': { start: 1346, end: 1353, display: 'the Black Death' },

  // Early Modern Period
  'renaissance': { start: 1400, end: 1600, display: 'the Renaissance' },
  'reformation': { start: 1517, end: 1648, display: 'the Reformation' },
  'age of exploration': { start: 1400, end: 1600, display: 'the Age of Exploration' },
  'age of discovery': { start: 1400, end: 1600, display: 'the Age of Discovery' },
  'elizabethan': { start: 1558, end: 1603, display: 'the Elizabethan era' },
  'tudor': { start: 1485, end: 1603, display: 'the Tudor period' },

  // 17th-18th Century
  'enlightenment': { start: 1685, end: 1815, display: 'the Enlightenment' },
  'age of reason': { start: 1685, end: 1815, display: 'the Age of Reason' },
  'baroque': { start: 1600, end: 1750, display: 'the Baroque period' },
  'colonial america': { start: 1607, end: 1776, display: 'Colonial America' },
  'american revolution': { start: 1765, end: 1783, display: 'the American Revolution' },
  'french revolution': { start: 1789, end: 1799, display: 'the French Revolution' },

  // 19th Century
  'napoleonic': { start: 1799, end: 1815, display: 'the Napoleonic era' },
  'victorian': { start: 1837, end: 1901, display: 'the Victorian era' },
  'industrial revolution': { start: 1760, end: 1840, display: 'the Industrial Revolution' },
  'american civil war': { start: 1861, end: 1865, display: 'the American Civil War' },
  'civil war': { start: 1861, end: 1865, display: 'the Civil War' },
  'gilded age': { start: 1870, end: 1900, display: 'the Gilded Age' },
  'belle epoque': { start: 1871, end: 1914, display: 'the Belle Epoque' },
  'belle époque': { start: 1871, end: 1914, display: 'the Belle Époque' },
  'antebellum': { start: 1812, end: 1861, display: 'the Antebellum period' },

  // Early 20th Century
  'edwardian': { start: 1901, end: 1910, display: 'the Edwardian era' },
  'world war 1': { start: 1914, end: 1918, display: 'World War I' },
  'world war i': { start: 1914, end: 1918, display: 'World War I' },
  'wwi': { start: 1914, end: 1918, display: 'World War I' },
  'ww1': { start: 1914, end: 1918, display: 'World War I' },
  'great war': { start: 1914, end: 1918, display: 'the Great War' },
  'roaring twenties': { start: 1920, end: 1929, display: 'the Roaring Twenties' },
  'roaring 20s': { start: 1920, end: 1929, display: 'the Roaring Twenties' },
  'jazz age': { start: 1920, end: 1929, display: 'the Jazz Age' },
  'prohibition': { start: 1920, end: 1933, display: 'Prohibition' },
  'great depression': { start: 1929, end: 1939, display: 'the Great Depression' },
  'dust bowl': { start: 1930, end: 1936, display: 'the Dust Bowl' },

  // Mid 20th Century
  'world war 2': { start: 1939, end: 1945, display: 'World War II' },
  'world war ii': { start: 1939, end: 1945, display: 'World War II' },
  'wwii': { start: 1939, end: 1945, display: 'World War II' },
  'ww2': { start: 1939, end: 1945, display: 'World War II' },
  'second world war': { start: 1939, end: 1945, display: 'World War II' },
  'holocaust': { start: 1941, end: 1945, display: 'the Holocaust' },
  'cold war': { start: 1947, end: 1991, display: 'the Cold War' },
  'korean war': { start: 1950, end: 1953, display: 'the Korean War' },
  'mccarthyism': { start: 1950, end: 1956, display: 'the McCarthy era' },
  'civil rights movement': { start: 1954, end: 1968, display: 'the Civil Rights Movement' },
  'civil rights era': { start: 1954, end: 1968, display: 'the Civil Rights era' },
  'vietnam war': { start: 1955, end: 1975, display: 'the Vietnam War' },
  'space race': { start: 1957, end: 1975, display: 'the Space Race' },
  'british invasion': { start: 1964, end: 1967, display: 'the British Invasion' },
  'summer of love': { start: 1967, end: 1967, display: 'the Summer of Love' },

  // Late 20th Century
  'disco era': { start: 1974, end: 1980, display: 'the Disco era' },
  'punk era': { start: 1974, end: 1980, display: 'the Punk era' },
  'reagan era': { start: 1981, end: 1989, display: 'the Reagan era' },
  'mtv era': { start: 1981, end: 1995, display: 'the MTV era' },
  'grunge era': { start: 1989, end: 1996, display: 'the Grunge era' },
  'dot com bubble': { start: 1995, end: 2001, display: 'the Dot-com bubble' },
  'dot-com bubble': { start: 1995, end: 2001, display: 'the Dot-com bubble' },

  // 21st Century
  'war on terror': { start: 2001, end: 2021, display: 'the War on Terror' },
  'great recession': { start: 2007, end: 2009, display: 'the Great Recession' },
  'covid pandemic': { start: 2020, end: 2023, display: 'the COVID-19 pandemic' },
  'covid': { start: 2020, end: 2023, display: 'the COVID-19 pandemic' },
  'pandemic': { start: 2020, end: 2023, display: 'the COVID-19 pandemic' },
}

/**
 * Historical events with specific date ranges
 */
export const HISTORICAL_EVENTS: Record<string, { start: number; end: number; display: string }> = {
  'moon landing': { start: 1969, end: 1969, display: 'the Moon Landing' },
  'apollo 11': { start: 1969, end: 1969, display: 'Apollo 11' },
  'fall of the berlin wall': { start: 1989, end: 1989, display: 'the Fall of the Berlin Wall' },
  'berlin wall fell': { start: 1989, end: 1989, display: 'when the Berlin Wall fell' },
  '9/11': { start: 2001, end: 2001, display: '9/11' },
  'september 11': { start: 2001, end: 2001, display: 'September 11th' },
  'woodstock': { start: 1969, end: 1969, display: 'Woodstock' },
  'live aid': { start: 1985, end: 1985, display: 'Live Aid' },
}

export interface TemporalRange {
  startYear: number
  endYear: number
  display: string
  type: 'era' | 'event' | 'relative'
}

/**
 * Parse historical era expressions
 */
export function parseHistoricalEra(input: string): TemporalRange | null {
  const lowerInput = input.toLowerCase().trim()

  // Check for era matches
  for (const [key, value] of Object.entries(HISTORICAL_ERAS)) {
    if (lowerInput.includes(key)) {
      return {
        startYear: value.start,
        endYear: value.end,
        display: value.display,
        type: 'era',
      }
    }
  }

  // Check for event matches
  for (const [key, value] of Object.entries(HISTORICAL_EVENTS)) {
    if (lowerInput.includes(key)) {
      return {
        startYear: value.start,
        endYear: value.end,
        display: value.display,
        type: 'event',
      }
    }
  }

  return null
}

/**
 * Custom chrono parser for "during the [era]" expressions
 */
export const duringEraParser: chrono.Parser = {
  pattern: () => /during\s+(?:the\s+)?(.+?)(?:\s+era|\s+period|\s+age)?$/i,
  extract: (context, match) => {
    const eraText = match[1]?.toLowerCase()
    if (!eraText) return null

    const era = HISTORICAL_ERAS[eraText]
    if (!era) return null

    // Return a component for the middle of the era
    const midYear = Math.floor((era.start + era.end) / 2)
    return context.createParsingResult(match.index!, match[0]!, {
      year: midYear,
      month: 6,
      day: 1,
    })
  },
}

/**
 * Custom chrono parser for "before [era/event]" expressions
 */
export const beforeEraParser: chrono.Parser = {
  pattern: () => /before\s+(?:the\s+)?(.+?)(?:\s+era|\s+period|\s+age)?$/i,
  extract: (context, match) => {
    const text = match[1]?.toLowerCase()
    if (!text) return null

    const era = HISTORICAL_ERAS[text] || HISTORICAL_EVENTS[text]
    if (!era) return null

    // Return the year before the era started
    return context.createParsingResult(match.index!, match[0]!, {
      year: era.start - 1,
      month: 12,
      day: 31,
    })
  },
}

/**
 * Custom chrono parser for "after [era/event]" expressions
 */
export const afterEraParser: chrono.Parser = {
  pattern: () => /after\s+(?:the\s+)?(.+?)(?:\s+era|\s+period|\s+age)?$/i,
  extract: (context, match) => {
    const text = match[1]?.toLowerCase()
    if (!text) return null

    const era = HISTORICAL_ERAS[text] || HISTORICAL_EVENTS[text]
    if (!era) return null

    // Return the year after the era ended
    return context.createParsingResult(match.index!, match[0]!, {
      year: era.end + 1,
      month: 1,
      day: 1,
    })
  },
}

/**
 * Custom chrono parser for century expressions like "19th century" or "1800s"
 */
export const centuryParser: chrono.Parser = {
  pattern: () => /(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)\s+century/i,
  extract: (context, match) => {
    const centuryNum = parseInt(match[1] ?? '0', 10)
    if (centuryNum < 1 || centuryNum > 21) return null

    // 19th century = 1800-1899
    const startYear = (centuryNum - 1) * 100
    return context.createParsingResult(match.index!, match[0]!, {
      year: startYear + 50, // Middle of century
      month: 6,
      day: 1,
    })
  },
}

/**
 * Custom chrono parser for millennium expressions like "turn of the millennium"
 */
export const millenniumParser: chrono.Parser = {
  pattern: () => /(?:turn\s+of\s+the\s+)?millennium|y2k|new\s+millennium/i,
  extract: (context, match) => {
    return context.createParsingResult(match.index!, match[0]!, {
      year: 2000,
      month: 1,
      day: 1,
    })
  },
}

/**
 * Custom chrono parser for "early/mid/late [decade/century]" expressions
 */
export const periodModifierParser: chrono.Parser = {
  pattern: () => /(early|mid|late|beginning\s+of|end\s+of)\s+(?:the\s+)?(\d{4}s|\d{1,2}(?:st|nd|rd|th)\s+century)/i,
  extract: (context, match) => {
    const modifier = match[1]?.toLowerCase()
    const period = match[2]?.toLowerCase()
    if (!modifier || !period) return null

    let startYear: number
    let endYear: number

    // Handle decades like "1980s"
    const decadeMatch = period.match(/(\d{4})s/)
    if (decadeMatch && decadeMatch[1]) {
      startYear = parseInt(decadeMatch[1], 10)
      endYear = startYear + 9
    } else {
      // Handle centuries
      const centuryMatch = period.match(/(\d{1,2})(?:st|nd|rd|th)\s+century/)
      if (centuryMatch && centuryMatch[1]) {
        const centuryNum = parseInt(centuryMatch[1], 10)
        startYear = (centuryNum - 1) * 100
        endYear = startYear + 99
      } else {
        return null
      }
    }

    let targetYear: number
    if (modifier === 'early' || modifier === 'beginning of') {
      targetYear = startYear + Math.floor((endYear - startYear) * 0.15)
    } else if (modifier === 'mid') {
      targetYear = startYear + Math.floor((endYear - startYear) * 0.5)
    } else {
      targetYear = startYear + Math.floor((endYear - startYear) * 0.85)
    }

    return context.createParsingResult(match.index!, match[0]!, {
      year: targetYear,
      month: 6,
      day: 1,
    })
  },
}

/**
 * Create a custom chrono instance with historical parsers
 */
export function createHistoricalChrono(): chrono.Chrono {
  const custom = chrono.casual.clone()

  custom.parsers.unshift(duringEraParser)
  custom.parsers.unshift(beforeEraParser)
  custom.parsers.unshift(afterEraParser)
  custom.parsers.unshift(centuryParser)
  custom.parsers.unshift(millenniumParser)
  custom.parsers.unshift(periodModifierParser)

  return custom
}

/**
 * Get all matching eras for a time period
 */
export function getErasForPeriod(startYear: number, endYear: number): TemporalRange[] {
  const matches: TemporalRange[] = []

  for (const [, value] of Object.entries(HISTORICAL_ERAS)) {
    // Check if the eras overlap
    if (value.start <= endYear && value.end >= startYear) {
      matches.push({
        startYear: value.start,
        endYear: value.end,
        display: value.display,
        type: 'era',
      })
    }
  }

  return matches.sort((a, b) => a.startYear - b.startYear)
}

/**
 * Get historical context for a year
 */
export function getHistoricalContext(year: number): string[] {
  const contexts: string[] = []

  for (const [, value] of Object.entries(HISTORICAL_ERAS)) {
    if (year >= value.start && year <= value.end) {
      contexts.push(value.display)
    }
  }

  for (const [, value] of Object.entries(HISTORICAL_EVENTS)) {
    if (year === value.start) {
      contexts.push(value.display)
    }
  }

  return contexts
}

// Pre-created instance for use in date-parser
export const historicalChrono = createHistoricalChrono()
