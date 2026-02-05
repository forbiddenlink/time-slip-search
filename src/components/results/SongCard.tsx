import { Song } from '@/lib/algolia'

interface SongCardProps {
  song: Song
  rank?: number
}

export function SongCard({ song, rank }: SongCardProps) {
  const position = rank ?? song.chart_position

  return (
    <div className="flex items-center gap-4 p-3 bg-crt-dark/50 border border-crt-light/20 rounded hover:border-vinyl-label/50 transition-all group">
      {/* Vinyl record style rank indicator */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 vinyl-record flex items-center justify-center group-hover:animate-vinyl-spin">
          <span className="led-text text-aged-cream text-lg font-bold relative z-10">
            {position}
          </span>
        </div>
      </div>

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-display text-lg text-aged-cream truncate group-hover:text-phosphor-teal transition-colors">
          {song.song_title}
        </h4>
        <p className="text-sm text-aged-cream/60 truncate font-body italic">
          {song.artist}
        </p>
      </div>

      {/* Weeks on chart */}
      {song.weeks_on_chart && (
        <div className="flex-shrink-0 led-display px-2 py-1">
          <span className="led-text text-phosphor-amber text-sm">
            {song.weeks_on_chart}w
          </span>
        </div>
      )}
    </div>
  )
}

interface SongListProps {
  songs: Song[]
  title?: string
}

export function SongList({ songs, title = 'Top Music' }: SongListProps) {
  if (songs.length === 0) return null

  return (
    <div className="space-y-3">
      {/* Section header - vinyl/jukebox style */}
      <div className="flex items-center gap-3 pb-2 border-b border-crt-light/20">
        <div className="w-10 h-10 vinyl-record flex-shrink-0 animate-vinyl-spin" style={{ animationDuration: '8s' }} />
        <div>
          <h3 className="font-display text-xl text-aged-cream">
            {title}
          </h3>
          <p className="led-text text-phosphor-teal text-xs tracking-widest">
            BILLBOARD HOT 100
          </p>
        </div>
      </div>

      {/* Song list */}
      <div className="space-y-2">
        {songs.slice(0, 5).map((song, index) => (
          <div
            key={song.objectID}
            className={`cascade-in ${index === 0 ? 'number-one-song rounded' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <SongCard song={song} rank={index + 1} />
          </div>
        ))}
      </div>
    </div>
  )
}
