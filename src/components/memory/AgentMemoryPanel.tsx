'use client'

import { useEffect, useState } from 'react'
import { SearchHistory, Favorites, type SearchHistoryItem, type FavoriteDate } from '@/lib/agent-memory'

interface AgentMemoryPanelProps {
  onSelectSearch: (query: string) => void
}

export function AgentMemoryPanel({ onSelectSearch }: AgentMemoryPanelProps) {
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([])
  const [favorites, setFavorites] = useState<FavoriteDate[]>([])
  const [showHistory, setShowHistory] = useState(true)

  useEffect(() => {
    // Load on mount
    loadMemory()
  }, [])

  const loadMemory = () => {
    setRecentSearches(SearchHistory.getRecent(5))
    setFavorites(Favorites.getAll().slice(0, 5))
  }

  const clearHistory = () => {
    SearchHistory.clear()
    loadMemory()
  }

  if (recentSearches.length === 0 && favorites.length === 0) {
    return null // Don't show if no memory yet
  }

  return (
    <div className="mb-8 glass-card p-6 border border-phosphor-teal/20 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4">
          <button
            onClick={() => setShowHistory(true)}
            className={`led-text text-sm tracking-widest transition-colors ${
              showHistory ? 'text-phosphor-teal' : 'text-aged-cream/60 hover:text-aged-cream/70'
            }`}
          >
            🕐 RECENT ({recentSearches.length})
          </button>
          <button
            onClick={() => setShowHistory(false)}
            className={`led-text text-sm tracking-widest transition-colors ${
              !showHistory ? 'text-phosphor-amber' : 'text-aged-cream/60 hover:text-aged-cream/70'
            }`}
          >
            ❤️ FAVORITES ({favorites.length})
          </button>
        </div>

        {showHistory && recentSearches.length > 0 && (
          <button
            onClick={clearHistory}
            className="led-text text-xs text-aged-cream/60 hover:text-vhs-red transition-colors"
          >
            CLEAR
          </button>
        )}
      </div>

      {showHistory ? (
        <div className="space-y-2">
          {recentSearches.map((search, index) => (
            <button
              key={search.id}
              onClick={() => onSelectSearch(search.query)}
              className="w-full text-left px-4 py-3 bg-crt-dark border border-crt-light/20 
                       rounded hover:border-phosphor-teal/50 transition-all hover-lift
                       group animate-slide-in-right"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-aged-cream group-hover:text-phosphor-teal transition-colors">
                    {search.dateDisplay}
                  </div>
                  <div className="text-xs text-aged-cream/60 mt-1 led-text">
                    {new Date(search.timestamp).toLocaleDateString()} • {search.resultCount} results
                  </div>
                </div>
                <div className="text-phosphor-teal opacity-0 group-hover:opacity-100 transition-opacity">
                  ▶
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {favorites.length === 0 ? (
            <div className="text-center py-8 text-aged-cream/60 text-sm led-text">
              NO FAVORITES YET
              <div className="text-xs mt-2">Click ❤️ on any result to save it</div>
            </div>
          ) : (
            favorites.map((fav, index) => (
              <div
                key={fav.id}
                className="px-4 py-3 bg-crt-dark border border-vinyl-label/30 rounded
                         animate-slide-in-right"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-aged-cream font-medium">
                      {fav.dateDisplay}
                    </div>
                    {fav.topSong && (
                      <div className="text-sm text-phosphor-teal mt-1">
                        🎵 {fav.topSong} - {fav.topArtist}
                      </div>
                    )}
                    {fav.gasPrice && (
                      <div className="text-xs text-aged-cream/60 mt-1 led-text">
                        ⛽ Gas: ${fav.gasPrice.toFixed(2)}/gal
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      Favorites.remove(fav.id)
                      loadMemory()
                    }}
                    className="text-vhs-red hover:text-vhs-red/70 transition-colors ml-4"
                    title="Remove from favorites"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
