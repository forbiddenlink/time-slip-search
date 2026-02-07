'use client'

import { useRef } from 'react'
import type { SearchResults } from '@/lib/algolia'

interface ShareableCardProps {
  results: SearchResults
  dateDisplay: string
}

export function ShareableCard({ results, dateDisplay }: ShareableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const topSong = results.songs[0]
  const topMovie = results.movies[0]
  const price = results.prices[0]

  const handleShare = async () => {
    const shareText = generateShareText(results, dateDisplay)

    if (navigator.share) {
      try {
        await navigator.share({
          title: `TimeSlipSearch - ${dateDisplay}`,
          text: shareText,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled or error
        copyToClipboard(shareText)
      }
    } else {
      copyToClipboard(shareText)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  return (
    <div className="space-y-4">
      {/* Preview Card */}
      <div
        ref={cardRef}
        className="p-6 bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 rounded-xl border border-white/20 shadow-2xl"
      >
        <div className="text-center mb-4">
          <p className="text-purple-300 text-sm uppercase tracking-wide">Time Capsule</p>
          <h3 className="text-2xl font-bold text-white">{dateDisplay}</h3>
        </div>

        <div className="space-y-3 text-white">
          {topSong && (
            <div className="flex items-center gap-3 p-2 bg-white/10 rounded-lg">
              <span className="text-xl">🎵</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-purple-300">#1 Song</p>
                <p className="font-medium truncate">&ldquo;{topSong.song_title}&rdquo;</p>
                <p className="text-sm text-purple-300 truncate">{topSong.artist}</p>
              </div>
            </div>
          )}

          {topMovie && (
            <div className="flex items-center gap-3 p-2 bg-white/10 rounded-lg">
              <span className="text-xl">🎬</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-purple-300">Popular Movie</p>
                <p className="font-medium truncate">{topMovie.title}</p>
                <p className="text-sm text-purple-300">★ {topMovie.vote_average}/10</p>
              </div>
            </div>
          )}

          {price && price.gas_price_gallon && (
            <div className="flex items-center gap-3 p-2 bg-white/10 rounded-lg">
              <span className="text-xl">⛽</span>
              <div>
                <p className="text-xs text-purple-300">Gas Price</p>
                <p className="font-medium">${price.gas_price_gallon.toFixed(2)}/gallon</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-white/20 text-center">
          <p className="text-xs text-purple-400">timeslipsearch.vercel.app</p>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleShare}
          className="flex-1 px-4 py-2 bg-timeslip-500 hover:bg-timeslip-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
        <button
          onClick={() => copyToClipboard(generateShareText(results, dateDisplay))}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
        >
          Copy
        </button>
      </div>
    </div>
  )
}

function generateShareText(results: SearchResults, dateDisplay: string): string {
  const lines = [`🕰️ Time Capsule: ${dateDisplay}\n`]

  const topSong = results.songs[0]
  if (topSong) {
    lines.push(`🎵 #1 Song: "${topSong.song_title}" by ${topSong.artist}`)
  }

  const topMovie = results.movies[0]
  if (topMovie) {
    lines.push(`🎬 Popular Movie: ${topMovie.title}`)
  }

  const price = results.prices[0]
  if (price?.gas_price_gallon) {
    lines.push(`⛽ Gas: $${price.gas_price_gallon.toFixed(2)}/gallon`)
  }

  lines.push(`\nExplore more at timeslipsearch.vercel.app`)

  return lines.join('\n')
}
