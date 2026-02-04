'use client'

import { DataVisualization } from './DataVisualization'
import { SearchResults } from '@/lib/algolia'

interface ChartInsightsProps {
  results: SearchResults
  year: number
}

/**
 * Generates chart visualizations from search results
 */
export function ChartInsights({ results, year }: Readonly<ChartInsightsProps>) {
  // Don't show if no chart data
  if (results.songs.length === 0) {
    return null
  }

  // Top 10 songs by weeks on chart
  const topSongsByWeeks = results.songs
    .filter(song => song.weeks_on_chart && song.weeks_on_chart > 0)
    .sort((a, b) => (b.weeks_on_chart || 0) - (a.weeks_on_chart || 0))
    .slice(0, 10)

  const weeksChartData = {
    labels: topSongsByWeeks.map(song => {
      const title = song.song_title || 'Unknown'
      return title.length > 20 ? title.substring(0, 20) + '...' : title
    }),
    values: topSongsByWeeks.map(song => song.weeks_on_chart || 0),
    label: 'Weeks on Chart',
    color: '#00d9ff', // phosphor-teal
  }

  // Chart positions distribution (only if we have position data)
  const songsWithPositions = results.songs.filter(song => song.chart_position && song.chart_position > 0)
  
  let positionDistribution = null
  if (songsWithPositions.length >= 5) {
    // Group by position ranges
    const ranges = [
      { label: '#1', min: 1, max: 1 },
      { label: 'Top 5', min: 2, max: 5 },
      { label: 'Top 10', min: 6, max: 10 },
      { label: 'Top 20', min: 11, max: 20 },
      { label: 'Top 40', min: 21, max: 40 },
    ]
    
    const distribution = ranges.map(range => ({
      label: range.label,
      count: songsWithPositions.filter(
        song => song.chart_position >= range.min && song.chart_position <= range.max
      ).length,
    }))
    
    positionDistribution = {
      labels: distribution.map(d => d.label),
      values: distribution.map(d => d.count),
      label: 'Songs',
      color: '#ffa500', // phosphor-amber
    }
  }

  // Gas price trend removed - Price type doesn't have gas_price field
  // Can be added later if gas price data is available in a different format

  // If no visualizable data, don't render
  if (!weeksChartData.values.length && !positionDistribution) {
    return null
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-crt-light/20" />
        <h2 className="text-phosphor-amber text-xl led-text tracking-widest">DATA INSIGHTS</h2>
        <div className="h-px flex-1 bg-crt-light/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weeks on Chart */}
        {weeksChartData.values.length > 0 && (
          <DataVisualization
            data={weeksChartData}
            type="bar"
            title={`Longest Charting Songs (${year})`}
          />
        )}

        {/* Chart Position Distribution */}
        {positionDistribution && positionDistribution.values.some(v => v > 0) && (
          <DataVisualization
            data={positionDistribution}
            type="bar"
            title={`Chart Position Distribution (${year})`}
          />
        )}
      </div>

      <div className="text-center text-aged-cream/40 text-xs led-text mt-4">
        📈 VISUALIZATIONS POWERED BY BILLBOARD CHART DATA
      </div>
    </div>
  )
}
