import { describe, it, expect } from '@jest/globals'
import { clampToArchive, ARCHIVE_MIN_YEAR, ARCHIVE_MAX_YEAR } from '@/lib/archive'

describe('clampToArchive', () => {
  it('pulls a year past the end of the archive back to the last edition', () => {
    expect(clampToArchive(2026)).toBe(ARCHIVE_MAX_YEAR)
  })
  it('pulls a year before the archive up to the first edition', () => {
    expect(clampToArchive(1940)).toBe(ARCHIVE_MIN_YEAR)
  })
  it('leaves an in-range year alone', () => {
    expect(clampToArchive(1987)).toBe(1987)
  })
  it('honours custom bounds', () => {
    expect(clampToArchive(2026, 1958, 2010)).toBe(2010)
  })
})
