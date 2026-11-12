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

  const tabClass = (active: boolean) =>
    `ed-label min-h-11 border-b-2 px-1 ${active ? 'border-newsprint text-newsprint' : 'border-transparent text-muted hover:text-white'}`

  return (
    <section aria-label="Your reading file" className="mb-12 border-t-[3px] border-newsprint pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-newsprint">
        <div className="flex gap-6" role="tablist" aria-label="Reading file">
          <button
            type="button"
            role="tab"
            aria-selected={showHistory}
            onClick={() => setShowHistory(true)}
            className={tabClass(showHistory)}
          >
            Recent ({recentSearches.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!showHistory}
            onClick={() => setShowHistory(false)}
            className={tabClass(!showHistory)}
          >
            Saved ({favorites.length})
          </button>
        </div>

        {showHistory && recentSearches.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            className="ed-label min-h-11 text-muted underline-offset-4 hover:text-white hover:underline"
          >
            Clear history
          </button>
        )}
      </div>

      <div className="min-h-[120px]" role="tabpanel">
        {showHistory ? (
          <ul>
            {recentSearches.map((search) => (
              <li key={search.id} className="border-b border-newsprint/30">
                <button
                  type="button"
                  onClick={() => onSelectSearch(search.query)}
                  className="group flex min-h-11 w-full items-baseline justify-between gap-4 py-3 text-left"
                >
                  <span className="font-display text-xl group-hover:text-white">{search.dateDisplay}</span>
                  <span className="ed-label text-muted">
                    {new Date(search.timestamp).toLocaleDateString()} / {search.resultCount} findings
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : favorites.length === 0 ? (
          <p className="py-8 font-body text-base italic text-muted">
            Nothing saved yet. Use Save on any edition to keep it here.
          </p>
        ) : (
          <ul>
            {favorites.map((fav) => (
              <li key={fav.id} className="flex items-start justify-between gap-4 border-b border-newsprint/30 py-3">
                <div className="min-w-0">
                  <p className="font-display text-xl">{fav.dateDisplay}</p>
                  <p className="mt-1 font-body text-sm text-muted">
                    {fav.topSong ? `No. 1: ${fav.topSong}` : ''}
                    {fav.topSong && fav.gasPrice ? ' / ' : ''}
                    {fav.gasPrice ? `Gas $${fav.gasPrice.toFixed(2)}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    Favorites.remove(fav.id)
                    loadMemory()
                  }}
                  className="ed-label min-h-11 min-w-11 text-muted hover:text-white"
                  aria-label={`Remove ${fav.dateDisplay} from saved`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
