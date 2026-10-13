import { describe, it, expect } from '@jest/globals'
import { parseDate } from '../src/lib/date-parser'

describe('Date Parser', () => {
  describe('Single date parsing', () => {
    it('should parse "March 15, 1987"', () => {
      const result = parseDate('March 15, 1987')
      expect(result).not.toBeNull()
      expect(result?.year).toBe(1987)
      expect(result?.display).toContain('March')
    })

    it('should parse "Summer of 69"', () => {
      const result = parseDate('Summer of 69')
      expect(result).not.toBeNull()
      expect(result?.year).toBe(1969)
      expect(result?.display).toBe('Summer of 1969')
    })

    it('should parse "the 80s"', () => {
      const result = parseDate('the 80s')
      expect(result).not.toBeNull()
      expect(result?.year).toBe(1980)
      expect(result?.display).toBe('the 1980s')
    })
  })

  describe('Year normalization', () => {
    it('should normalize 2-digit years correctly', () => {
      const result = parseDate('Summer of 69')
      expect(result?.year).toBe(1969)
    })

    it('should handle 4-digit years', () => {
      const result = parseDate('Summer of 1969')
      expect(result?.year).toBe(1969)
    })
  })

  describe('Invalid inputs', () => {
    it('should return null for gibberish', () => {
      const result = parseDate('asdfghjkl')
      expect(result).toBeNull()
    })

    it('should return null for empty string', () => {
      const result = parseDate('')
      expect(result).toBeNull()
    })
  })

  describe('Date ranges', () => {
    it('should parse "from 1980 to 1985"', () => {
      const result = parseDate('from 1980 to 1985')
      expect(result).not.toBeNull()
      expect(result?.isRange).toBe(true)
      expect(result?.display).toContain('to')
    })

    it('should parse "between Jan 1985 and Dec 1985"', () => {
      const result = parseDate('between Jan 1985 and Dec 1985')
      expect(result).not.toBeNull()
      expect(result?.isRange).toBe(true)
    })
  })

  describe('Requested month/day (not the +/- 3 day search window)', () => {
    it.each([
      ['July 20 1969', 1969, 7, 20],
      ['June 5 1985', 1985, 6, 5],
      ['March 3 2019', 2019, 3, 3],
      ['January 1, 2000', 2000, 1, 1],
    ])('%s keeps the day the user typed', (input, year, month, day) => {
      const result = parseDate(input)
      expect(result?.year).toBe(year)
      expect(result?.month).toBe(month)
      expect(result?.day).toBe(day)
      // the window itself still starts before the requested day
      expect(new Date((result?.start ?? 0) * 1000).getDate()).not.toBe(day)
    })

    it('anchors a specific day at that day, inside the window', () => {
      const result = parseDate('July 20 1969')
      const anchor = new Date((result?.anchor ?? 0) * 1000)
      expect([anchor.getFullYear(), anchor.getMonth() + 1, anchor.getDate()]).toEqual([1969, 7, 20])
    })

    it('has a month but no day for month-only queries', () => {
      const result = parseDate('March 1987')
      expect(result?.month).toBe(3)
      expect(result?.day).toBeUndefined()
    })

    it('has neither month nor day for year-only queries', () => {
      const result = parseDate('1977')
      expect(result?.month).toBeUndefined()
      expect(result?.day).toBeUndefined()
    })

    it('has no anchor for date ranges', () => {
      expect(parseDate('from 1980 to 1985')?.anchor).toBeUndefined()
    })
  })
})
