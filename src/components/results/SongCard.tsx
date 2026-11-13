import { memo } from 'react'
import type { Song } from '@/lib/algolia'

interface SongCardProps {
  song: Song
  rank?: number
}

/** One ranked row of the chart, set like a printed chart listing. */
export const SongCard = memo(function SongCard({ song, rank }: SongCardProps) {
  const position = rank ?? song.chart_position

  return (
    <li className="flex items-baseline gap-4 border-t border-ink/25 py-3">
      <span className="ed-label w-6 shrink-0 text-faded" aria-label={`Number ${position}`}>
        {position}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg leading-snug text-balance">{song.song_title}</p>
        <p className="font-body text-sm italic text-faded">{song.artist}</p>
      </div>
      {song.weeks_on_chart ? (
        <span className="ed-label shrink-0 text-faded">{song.weeks_on_chart} wks</span>
      ) : null}
    </li>
  )
})

interface SongListProps {
  songs: Song[]
  title?: string
  /** date_string (YYYY-MM-DD) of the Billboard chart week these songs come from */
  chartWeek?: string
}

function formatChartWeek(dateString: string): string | null {
  const [year, month, day] = dateString.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function SongList({ songs, title = 'No. 1 song', chartWeek }: SongListProps) {
  const [lead, ...rest] = songs.slice(0, 5)
  if (!lead) return null

  const chartWeekLabel = chartWeek ? formatChartWeek(chartWeek) : null

  return (
    <section aria-labelledby="sec-song">
      <h3 id="sec-song" className="ed-label text-faded">{title}</h3>
      <p className="mt-4 font-display text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.05] text-balance">
        {lead.song_title}
      </p>
      <p className="mt-2 font-display text-xl italic md:text-2xl">{lead.artist}</p>
      <p className="mt-3 ed-label text-faded">
        Billboard Hot 100
        {chartWeekLabel ? ` / Chart week of ${chartWeekLabel}` : ''}
        {lead.weeks_on_chart ? ` / ${lead.weeks_on_chart} weeks on the chart` : ''}
      </p>

      {rest.length > 0 && (
        <div className="mt-6">
          <h4 className="ed-label border-b-2 border-ink pb-2">Also on the chart</h4>
          <ol>
            {rest.map((song, index) => (
              <SongCard key={song.objectID} song={song} rank={index + 2} />
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}
