/**
 * Generate shareable OG images for search results
 * Uses Vercel OG Image Generation or canvas-based approach
 */

import { SearchResults } from './algolia'

export interface ShareCardData {
  dateDisplay: string
  year: number
  topSong?: {
    title: string
    artist: string
    position: number
  }
  topMovie?: {
    title: string
    rating: number
  }
  gasPrice?: number
}

/**
 * Generate OG Image URL for a search result
 */
export function generateOGImageURL(data: ShareCardData): string {
  const params = new URLSearchParams({
    date: data.dateDisplay,
    year: data.year.toString(),
  })

  if (data.topSong) {
    params.set('song', `${data.topSong.title} - ${data.topSong.artist}`)
    params.set('position', data.topSong.position.toString())
  }

  if (data.topMovie) {
    params.set('movie', data.topMovie.title)
  }

  if (data.gasPrice) {
    params.set('gas', data.gasPrice.toFixed(2))
  }

  return `/api/og?${params.toString()}`
}

/**
 * Extract share card data from search results
 */
export function extractShareData(
  dateDisplay: string,
  year: number,
  results: SearchResults
): ShareCardData {
  const data: ShareCardData = { dateDisplay, year }

  if (results.songs.length > 0) {
    const topSong = results.songs[0]
    if (topSong) {
      data.topSong = {
        title: topSong.song_title,
        artist: topSong.artist,
        position: topSong.chart_position,
      }
    }
  }

  if (results.movies.length > 0) {
    const topMovie = results.movies[0]
    if (topMovie) {
      data.topMovie = {
        title: topMovie.title,
        rating: topMovie.vote_average,
      }
    }
  }

  if (results.prices.length > 0 && results.prices[0]) {
    data.gasPrice = results.prices[0].gas_price_gallon
  }

  return data
}

/**
 * Generate social share text
 */
export function generateShareText(data: ShareCardData): string {
  const parts = [`🎵 Discovered ${data.dateDisplay} on TimeSlipSearch!`]

  if (data.topSong) {
    parts.push(`\n#${data.topSong.position}: "${data.topSong.title}" by ${data.topSong.artist}`)
  }

  if (data.gasPrice) {
    parts.push(`\n⛽ Gas was $${data.gasPrice.toFixed(2)}/gallon`)
  }

  parts.push('\n\nExplore any date in history: ')

  return parts.join('')
}

/**
 * Copy share link to clipboard
 */
export async function copyShareLink(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch (error) {
    console.error('Failed to copy:', error)
    return false
  }
}

/**
 * Share via Web Share API if available
 */
export async function shareNative(data: ShareCardData, url: string): Promise<boolean> {
  if (!navigator.share) {
    return false
  }

  try {
    await navigator.share({
      title: `TimeSlipSearch: ${data.dateDisplay}`,
      text: generateShareText(data),
      url,
    })
    return true
  } catch (error) {
    // User cancelled or error
    return false
  }
}
