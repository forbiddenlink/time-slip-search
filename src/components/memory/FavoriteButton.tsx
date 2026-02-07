'use client'

import { useState, useEffect } from 'react'
import { Favorites, type FavoriteDate } from '@/lib/agent-memory'
import type { SearchResults } from '@/lib/algolia'

interface FavoriteButtonProps {
  dateDisplay: string
  year: number
  results: SearchResults
  query: string
}

export function FavoriteButton({ dateDisplay, year, results, query }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    setIsFavorited(Favorites.isFavorited(dateDisplay))
  }, [dateDisplay])

  const handleToggleFavorite = () => {
    const topSong = results.songs[0]
    const price = results.prices[0]

    const favorite: Omit<FavoriteDate, 'id' | 'savedAt'> = {
      query,
      dateDisplay,
      year,
      topSong: topSong?.song_title,
      topArtist: topSong?.artist,
      gasPrice: price?.gas_price_gallon,
    }

    const wasAdded = Favorites.toggle(favorite)
    setIsFavorited(wasAdded)

    // Show animation
    if (wasAdded) {
      setShowAnimation(true)
      setTimeout(() => setShowAnimation(false), 1000)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggleFavorite}
        className={`px-4 py-2 border rounded transition-all hover-lift led-text text-sm
          ${
            isFavorited
              ? 'bg-vinyl-label/20 border-vinyl-label text-vinyl-label hover:bg-vinyl-label/30'
              : 'bg-crt-dark border-crt-light/30 text-aged-cream/60 hover:border-vinyl-label/50 hover:text-vinyl-label'
          }`}
        title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        {isFavorited ? '❤️ SAVED' : '🤍 SAVE'}
      </button>

      {/* Animation overlay */}
      {showAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-vinyl-label text-3xl animate-scale-in">
            ❤️
          </div>
        </div>
      )}
    </div>
  )
}
