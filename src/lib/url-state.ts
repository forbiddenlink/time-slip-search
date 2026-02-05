/**
 * URL State Management for shareable searches
 * Enables deep linking like: /search?date=1969-07-20
 */

import { DateRange } from './date-parser'
import { ReadonlyURLSearchParams } from 'next/navigation'

export interface URLSearchParams {
  query?: string
  date?: string
  compare?: string
  year?: number
}

/**
 * Encode search state into URL
 */
export function encodeSearchToURL(query: string, dateInfo?: DateRange): string {
  const params = new URLSearchParams()
  
  if (query) {
    params.set('q', query)
  }
  
  if (dateInfo) {
    // Store year for easier sharing
    params.set('year', dateInfo.year.toString())
    // Store display text for better UX
    params.set('date', dateInfo.display)
  }
  
  return params.toString() ? `?${params.toString()}` : ''
}

/**
 * Decode URL parameters to search state
 */
export function decodeURLToSearch(searchParams: ReadonlyURLSearchParams): {
  query: string | null
  year: number | null
  dateDisplay: string | null
} {
  return {
    query: searchParams.get('q'),
    year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : null,
    dateDisplay: searchParams.get('date'),
  }
}

/**
 * Add comparison parameter to URL
 */
export function addComparisonToURL(currentParams: string, compareYear: number): string {
  const params = new URLSearchParams(currentParams)
  params.set('compare', compareYear.toString())
  return `?${params.toString()}`
}

/**
 * Create shareable URL for a search
 */
export function createShareableURL(query: string, dateInfo?: DateRange): string {
  const baseURL = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://timeslipsearch.vercel.app'
  
  const params = encodeSearchToURL(query, dateInfo)
  return `${baseURL}${params}`
}
