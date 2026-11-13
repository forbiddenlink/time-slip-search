import { memo } from 'react'
import Image from 'next/image'
import type { Movie } from '@/lib/algolia'

interface MovieCardProps {
  movie: Movie
}

export const MovieCard = memo(function MovieCard({ movie }: MovieCardProps) {
  return (
    <li className="flex gap-4 border-t border-ink/25 py-4">
      {movie.poster_url ? (
        <div className="relative h-24 w-16 shrink-0 overflow-hidden border border-ink">
          <Image
            src={movie.poster_url}
            alt={`Poster for ${movie.title}`}
            fill
            className="object-cover grayscale"
            sizes="64px"
          />
        </div>
      ) : (
        <div className="h-24 w-16 shrink-0 border border-ink/40" aria-hidden="true" />
      )}

      <div className="min-w-0 flex-1">
        <p className="font-display text-xl leading-snug text-balance">{movie.title}</p>
        <p className="mt-1 ed-label text-faded">
          {movie.year}
          {movie.genres && movie.genres.length > 0 ? ` / ${movie.genres.slice(0, 2).join(', ')}` : ''}
        </p>
        <p className="mt-2 font-body text-sm italic text-faded">
          Rated {movie.vote_average.toFixed(1)} out of 10
        </p>
      </div>
    </li>
  )
})

interface MovieListProps {
  movies: Movie[]
  title?: string
}

export function MovieList({ movies, title = 'At the movies' }: MovieListProps) {
  if (movies.length === 0) return null

  return (
    <section aria-labelledby="sec-movies">
      <h3 id="sec-movies" className="ed-label border-b-2 border-ink pb-2">{title}</h3>
      <ul>
        {movies.slice(0, 3).map((movie) => (
          <MovieCard key={movie.objectID} movie={movie} />
        ))}
      </ul>
    </section>
  )
}
