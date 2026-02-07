import Image from 'next/image'
import type { Movie } from '@/lib/algolia'

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="flex gap-4 p-3 bg-crt-dark/50 border border-crt-light/20 rounded hover:border-phosphor-amber/50 transition-all group">
      {/* Movie poster with film strip aesthetic */}
      <div className="relative flex-shrink-0">
        <div className="film-strip">
          {movie.poster_url ? (
            <div className="w-16 h-24 relative mx-3 overflow-hidden border-2 border-crt-light/30">
              <Image
                src={movie.poster_url}
                alt={movie.title}
                fill
                className="object-cover grayscale-[20%] group-hover:grayscale-0 transition-all"
                sizes="64px"
              />
              {/* Vintage overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-aged-sepia/20 to-transparent mix-blend-multiply" />
            </div>
          ) : (
            <div className="w-16 h-24 mx-3 bg-crt-medium border-2 border-crt-light/30 flex items-center justify-center">
              <span className="text-2xl text-phosphor-amber">▶</span>
            </div>
          )}
        </div>
      </div>

      {/* Movie info */}
      <div className="flex-1 min-w-0 py-1">
        <h4 className="font-display text-lg text-aged-cream truncate group-hover:text-phosphor-amber transition-colors">
          {movie.title}
        </h4>
        <p className="led-text text-phosphor-teal text-sm">{movie.year}</p>
        {movie.genres && movie.genres.length > 0 && (
          <p className="text-xs text-aged-cream/50 truncate mt-1 font-body">
            {movie.genres.slice(0, 2).join(' / ')}
          </p>
        )}
        {/* Rating as LED display */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-phosphor-amber text-sm">★</span>
          <div className="led-display px-2 py-0.5 inline-flex">
            <span className="led-text text-phosphor-amber text-xs">
              {movie.vote_average.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MovieListProps {
  movies: Movie[]
  title?: string
}

export function MovieList({ movies, title = 'At the Movies' }: MovieListProps) {
  if (movies.length === 0) return null

  return (
    <div className="space-y-3">
      {/* Section header - cinema marquee style */}
      <div className="flex items-center gap-3 pb-2 border-b border-crt-light/20">
        <div className="led-display px-2 py-1">
          <span className="text-phosphor-amber text-lg">▶</span>
        </div>
        <div>
          <h3 className="font-display text-xl text-aged-cream">
            {title}
          </h3>
          <p className="led-text text-phosphor-amber text-xs tracking-widest">
            NOW PLAYING
          </p>
        </div>
      </div>

      {/* Movie list */}
      <div className="space-y-2">
        {movies.slice(0, 3).map((movie, index) => (
          <div key={movie.objectID} className="cascade-in" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </div>
  )
}
