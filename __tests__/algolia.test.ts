/** @jest-environment node */
import { describe, it, expect, jest, beforeEach } from '@jest/globals'

const mockSearch = jest.fn<(args: { requests: Array<Record<string, unknown>> }) => Promise<unknown>>()
jest.mock('algoliasearch', () => ({ algoliasearch: () => ({ search: mockSearch }) }))

import { searchAllIndices, dedupeSongs, pickNearestChartWeek, getMovieWindow } from '../src/lib/algolia'

const DAY = 86400
const ts = (y: number, m: number, d: number) => Math.floor(new Date(y, m - 1, d).getTime() / 1000)
const song = (title: string, pos: number, week: string) =>
  ({ objectID: `${title}-${week}`, song_title: title, artist: 'A', chart_position: pos, date_string: week, date: 0 })

describe('searchAllIndices songs', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID = 'app'
    process.env.ALGOLIA_SEARCH_API_KEY = 'key'
    mockSearch.mockReset()
  })

  it('filters chart position numerically, since chart_position is not a facet in the songs index', async () => {
    mockSearch
      .mockResolvedValueOnce({ results: [{ hits: [{ date: ts(1987, 3, 14), date_string: '1987-03-14' }], nbHits: 1 }, { hits: [] }, { hits: [] }, { hits: [] }] })
      .mockResolvedValueOnce({ results: [{ hits: [song('S', 1, '1987-03-14')] }] })
    await searchAllIndices(ts(1987, 3, 1), ts(1987, 3, 31), undefined, ts(1987, 3, 15))
    const discovery = mockSearch.mock.calls[0]![0].requests[0]!.filters as string
    expect(discovery).toContain('chart_position = 1')
    expect(discovery).not.toMatch(/chart_position:/)
  })

  it('uses numeric syntax for the #1-only filter too', async () => {
    mockSearch.mockResolvedValueOnce({ results: [{ hits: [] }, { hits: [] }, { hits: [] }, { hits: [] }] })
    await searchAllIndices(ts(1987, 1, 1), ts(1987, 12, 31), { showOnlyNumber1: true })
    expect(mockSearch.mock.calls[0]![0].requests[0]!.filters).toContain('chart_position = 1')
  })

  it('falls back to de-duplicated songs when no chart week is found, so songs never silently vanish', async () => {
    const hits = [song('A', 1, 'w1'), song('A', 1, 'w2'), song('B', 2, 'w1')]
    mockSearch
      .mockResolvedValueOnce({ results: [{ hits: [], nbHits: 0 }, { hits: [] }, { hits: [] }, { hits: [] }] })
      .mockResolvedValueOnce({ results: [{ hits }] })
    const out = await searchAllIndices(ts(1987, 3, 1), ts(1987, 3, 31), undefined, ts(1987, 3, 15))
    expect(out.songs.map((s) => s.song_title)).toEqual(['A', 'B'])
    expect(out.chartWeek).toBeUndefined()
  })

  it('returns one chart week (no repeated #1) and reports which week', async () => {
    const weeks = [
      { date: ts(1987, 3, 7), date_string: '1987-03-07' },
      { date: ts(1987, 3, 14), date_string: '1987-03-14' },
      { date: ts(1987, 3, 21), date_string: '1987-03-21' },
      { date: ts(1987, 3, 28), date_string: '1987-03-28' },
    ]
    const week = [1, 2, 3, 4, 5].map((p) => song(`Song ${p}`, p, '1987-03-14'))
    mockSearch
      .mockResolvedValueOnce({ results: [{ hits: weeks, nbHits: 4 }, { hits: [] }, { hits: [] }, { hits: [] }] })
      .mockResolvedValueOnce({ results: [{ hits: week }] })

    const out = await searchAllIndices(ts(1987, 3, 1), ts(1987, 3, 31), undefined, ts(1987, 3, 15))

    expect(out.chartWeek).toBe('1987-03-14')
    expect(out.songs.map((s) => s.song_title)).toEqual(['Song 1', 'Song 2', 'Song 3', 'Song 4', 'Song 5'])
    expect(new Set(out.songs.map((s) => s.song_title)).size).toBe(5)
    // second request is restricted to the single chosen week
    expect(mockSearch.mock.calls[1]![0].requests[0]!.filters).toContain(`date = ${weeks[1]!.date}`)
  })

  it('dedupes by song across weeks when there is no anchor (date ranges)', async () => {
    const hits = [
      song('Same', 1, '1983-02-19'), song('Same', 1, '1983-02-26'), song('Same', 1, '1983-03-05'),
      song('Other', 2, '1983-02-19'), song('Third', 3, '1983-02-19'),
    ]
    mockSearch.mockResolvedValueOnce({ results: [{ hits, nbHits: 5 }, { hits: [] }, { hits: [] }, { hits: [] }] })
    const out = await searchAllIndices(ts(1980, 1, 1), ts(1985, 12, 31))
    expect(out.songs.map((s) => s.song_title)).toEqual(['Same', 'Other', 'Third'])
    expect(out.chartWeek).toBeUndefined()
  })
})

describe('chart helpers', () => {
  it('pickNearestChartWeek picks the closest week', () => {
    const weeks = [
      { date: 100 * DAY, date_string: 'a' },
      { date: 107 * DAY, date_string: 'b' },
    ]
    expect(pickNearestChartWeek(weeks, 105 * DAY)?.date_string).toBe('b')
    expect(pickNearestChartWeek([], 1)).toBeUndefined()
  })

  it('dedupeSongs keeps the best position per song', () => {
    const out = dedupeSongs([song('X', 4, 'w1'), song('X', 1, 'w2'), song('Y', 2, 'w1')] as never)
    expect(out.map((s) => [s.song_title, s.chart_position])).toEqual([['X', 1], ['Y', 2]])
  })
})

describe('movie release window', () => {
  it('looks 4 weeks back and 1 week forward from a single day', () => {
    const anchor = ts(1977, 5, 25)
    expect(getMovieWindow(anchor - 3 * DAY, anchor + 3 * DAY, anchor, true)).toEqual({
      start: anchor - 28 * DAY,
      end: anchor + 7 * DAY,
    })
  })

  it('uses the given window for months and years', () => {
    expect(getMovieWindow(10, 20, 15, false)).toEqual({ start: 10, end: 20 })
  })

  it('queries the movies index with the release window, not the +/-3 day window', async () => {
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID = 'app'
    process.env.ALGOLIA_SEARCH_API_KEY = 'key'
    mockSearch.mockReset()
    const anchor = ts(1977, 5, 25)
    mockSearch
      .mockResolvedValueOnce({ results: [{ hits: [{ date: anchor, date_string: '1977-05-28' }] }, { hits: [] }, { hits: [] }, { hits: [] }] })
      .mockResolvedValueOnce({ results: [{ hits: [] }] })
    await searchAllIndices(anchor - 3 * DAY, anchor + 3 * DAY, undefined, anchor, true)
    const movies = mockSearch.mock.calls[0]![0].requests.find((r) => r.indexName === 'timeslip_movies')!
    expect(movies.filters).toBe(`date >= ${anchor - 28 * DAY} AND date <= ${anchor + 7 * DAY}`)
  })
})
