'use client'

import { useState } from 'react'
import type { SearchResults } from '@/lib/algolia'

interface ShareButtonsProps {
  dateDisplay: string
  year: number
  results: SearchResults
  onCompare?: (year: number) => void
  onRandom?: () => void
}

export function ShareButtons({ dateDisplay, year, results, onCompare, onRandom }: ShareButtonsProps) {
  const [showShareCard, setShowShareCard] = useState(false)

  const handleCompare = (yearsOffset: number) => {
    if (onCompare) {
      onCompare(year + yearsOffset)
    }
  }

  const handleDownloadCard = () => {
    setShowShareCard(true)
    // Wait for next frame to ensure card is rendered
    setTimeout(() => {
      const card = document.getElementById('shareable-card')
      if (!card) return

      // Use html2canvas or similar library in production
      // For now, we'll show a modal with the card
      alert('Share card feature coming soon! You can screenshot this for now.')
    }, 100)
  }

  const topSong = results.songs[0]
  
  return (
    <div className="space-y-4">
      {/* Quick Action Suggestions */}
      <div className="flex gap-2 flex-wrap">
        {year < 2020 && (
          <>
            <button
              onClick={() => handleCompare(10)}
              className="px-4 py-2 bg-crt-dark border border-phosphor-teal/30 
                       rounded hover:border-phosphor-teal hover:shadow-glow-teal
                       text-aged-cream text-sm transition-all hover-lift
                       led-text"
            >
              🔄 Compare with {year + 10}
            </button>
            <button
              onClick={() => handleCompare(-10)}
              className="px-4 py-2 bg-crt-dark border border-phosphor-amber/30 
                       rounded hover:border-phosphor-amber hover:shadow-glow-amber
                       text-aged-cream text-sm transition-all hover-lift
                       led-text"
            >
              ⏮️ See {year - 10}
            </button>
          </>
        )}
        
        {onRandom && (
          <button
            onClick={onRandom}
            className="px-4 py-2 bg-crt-dark border border-phosphor-green/30 
                     rounded hover:border-phosphor-green hover:shadow-glow-green
                     text-aged-cream text-sm transition-all hover-lift
                     led-text"
          >
            🎲 Random Date
          </button>
        )}

        {topSong && (
          <button
            onClick={handleDownloadCard}
            className="px-4 py-2 bg-crt-dark border border-vinyl-label/50 
                     rounded hover:border-vinyl-label hover:shadow-glow-amber
                     text-aged-cream text-sm transition-all hover-lift
                     led-text"
          >
            📸 Share Card
          </button>
        )}
      </div>

      {/* Shareable Card Preview (hidden by default) */}
      {showShareCard && topSong && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative">
            <button
              onClick={() => setShowShareCard(false)}
              className="absolute -top-10 right-0 text-aged-cream hover:text-phosphor-teal text-sm led-text"
            >
              ✕ CLOSE
            </button>
            <div
              id="shareable-card"
              className="w-[600px] h-[600px] bg-gradient-to-br from-crt-dark via-crt-black to-crt-dark 
                       p-12 text-center border-8 border-crt-light/20 rounded-lg
                       flex flex-col items-center justify-center gap-6"
            >
              {/* VHS effect overlay */}
              <div className="absolute inset-0 vhs-tracking opacity-30 pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                <div className="text-phosphor-teal text-7xl font-display tracking-tight glow-text">
                  {dateDisplay}
                </div>
                
                <div className="space-y-2">
                  <div className="text-aged-cream/60 text-xl led-text tracking-widest">
                    #1 SONG
                  </div>
                  <div className="text-aged-cream text-3xl font-medium leading-tight">
                    "{topSong.song_title}"
                  </div>
                  
                  <div className="text-aged-cream/80 text-2xl mt-4">
                    {topSong.artist}
                  </div>
                </div>

                {results.prices[0]?.gas_price_gallon && (
                  <div className="text-aged-cream/60 text-lg led-text">
                    ⛽ Gas: ${results.prices[0].gas_price_gallon.toFixed(2)}/gallon
                  </div>
                )}

                <div className="absolute bottom-8 left-0 right-0">
                  <div className="text-aged-cream/60 text-sm led-text tracking-wider">
                    Discover your musical time capsule at
                  </div>
                  <div className="text-phosphor-teal text-lg font-display mt-1">
                    TimeSlipSearch.com
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  // In production, use html2canvas here
                  alert('Screenshot this card to share! Full download feature coming soon.')
                }}
                className="retro-btn px-6 py-3 text-phosphor-teal led-text"
              >
                📥 DOWNLOAD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
