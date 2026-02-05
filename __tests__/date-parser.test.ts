import { describe, it, expect } from '@jest/globals'
import { parseDate, DateRange } from '../src/lib/date-parser'

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
})
