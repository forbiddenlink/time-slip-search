'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { getEra, clampToArchive, DECADE_CHAPTERS, ARCHIVE_MIN_YEAR, ARCHIVE_MAX_YEAR } from '@/lib/archive'
import type { TimelineDensityResponse } from '@/app/api/timeline/density/route'

interface TimelineProps {
  currentYear: number
  onYearSelect: (year: number) => void
  minYear?: number
  maxYear?: number
}

/** Synthetic archive-growth curve used until (or if) live facet counts load. */
function syntheticDensity(year: number, minYear: number, maxYear: number): number {
  const t = (year - minYear) / (maxYear - minYear)
  // Gentle hump: catalog fills out through the 70s-2000s.
  return 0.3 + 0.7 * Math.sin(Math.max(0, Math.min(1, t)) * Math.PI)
}

export function Timeline({
  currentYear: selectedYear,
  onYearSelect,
  minYear = ARCHIVE_MIN_YEAR,
  maxYear = ARCHIVE_MAX_YEAR,
}: TimelineProps) {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null)
  const [density, setDensity] = useState<Record<number, number> | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  const currentYear = clampToArchive(selectedYear, minYear, maxYear)
  const yearRange = maxYear - minYear
  const currentPosition = ((currentYear - minYear) / yearRange) * 100

  // Era follows the cursor while scrubbing, otherwise the selected year.
  const activeYear = hoveredYear ?? currentYear
  const era = getEra(activeYear)

  // Fetch real records-per-year density from Algolia facets (read-only, cached).
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/timeline/density', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: TimelineDensityResponse | null) => {
        if (data && Object.keys(data.density ?? {}).length > 0) {
          setDensity(data.density)
        }
      })
      .catch(() => {
        /* fall back to the synthetic curve */
      })
    return () => controller.abort()
  }, [])

  // Normalized bar heights (12%..100%) per year, from live data or the fallback curve.
  const bars = useMemo(() => {
    const years = Array.from({ length: yearRange + 1 }, (_, i) => minYear + i)
    const raw = years.map((y) =>
      density ? density[y] ?? 0 : syntheticDensity(y, minYear, maxYear)
    )
    const max = Math.max(...raw, 1)
    return years.map((year, i) => ({
      year,
      height: 12 + 88 * (raw[i]! / max),
      count: density ? density[year] ?? 0 : null,
    }))
  }, [density, minYear, maxYear, yearRange])

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const year = Math.round(minYear + percentage * yearRange)

    if (year >= minYear && year <= maxYear) {
      onYearSelect(year)
    }
  }

  const handleTimelineHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const year = Math.round(minYear + percentage * yearRange)

    if (year >= minYear && year <= maxYear) {
      setHoveredYear(year)
    }
  }

  // Notable events markers
  const notableYears = [
    { year: 1969, label: 'Moon landing' },
    { year: 1984, label: 'Gaming era' },
    { year: 1989, label: 'Berlin Wall' },
    { year: 2000, label: 'Y2K' },
  ]

  const activeDecade = Math.floor(currentYear / 10) * 10

  return (
    <section aria-label="Timeline" className="ed-sheet px-5 py-6 md:px-10">
      <div className="border-b-[3px] border-ink pb-3">
        <p className="ed-label text-edition">Index of editions</p>
        <h2 className="font-display text-3xl italic">{minYear} to {maxYear}</h2>
        <p className="ed-label text-faded">{era.medium}</p>
      </div>

      {/* Decade index */}
      <div className="mt-4 grid grid-cols-4 border-y border-ink sm:grid-cols-8">
        {DECADE_CHAPTERS.map((chapter) => {
          const isActive = Math.floor(chapter.start / 10) * 10 === activeDecade
          return (
            <button
              key={chapter.start}
              type="button"
              onClick={() => onYearSelect(chapter.start)}
              aria-pressed={isActive}
              aria-label={`Jump to the ${chapter.label}, ${chapter.medium} era`}
              title={`${chapter.label} · ${chapter.medium}`}
              className={`min-h-11 min-w-0 border-r border-ink/30 px-1 py-2 text-center last:border-r-0 ${
                isActive ? 'bg-ink text-newsprint' : 'hover:bg-ink/10'
              }`}
            >
              <span className="block font-display text-lg">{chapter.label}</span>
              <span className="hidden truncate ed-label !text-[0.6rem] sm:block">{chapter.medium}</span>
            </button>
          )
        })}
      </div>

      <div
        ref={timelineRef}
        className="relative mt-6 h-24 cursor-pointer border-b-2 border-ink"
        onClick={handleTimelineClick}
        onMouseMove={handleTimelineHover}
        onMouseLeave={() => setHoveredYear(null)}
        role="presentation"
      >
        {/* Density-weighted bars (records-per-year) */}
        <div className="absolute inset-0 flex items-end gap-px overflow-hidden" aria-hidden="true">
          {bars.map((bar) => (
            <div key={bar.year} className="flex-1 bg-ink/45" style={{ height: `${bar.height}%` }} />
          ))}
        </div>

        {/* Notable events */}
        {notableYears.map(({ year, label }) => {
          const position = ((year - minYear) / yearRange) * 100
          return (
            <div key={year} className="group/marker absolute bottom-0 top-0" style={{ left: `${position}%` }}>
              <div className="h-full w-px bg-ink/50" />
              <span className="absolute hidden lg:block -top-5 left-0 -translate-x-1/2 whitespace-nowrap ed-label !text-[0.6rem] text-faded">
                {label}
              </span>
            </div>
          )
        })}

        {/* Current year indicator */}
        <div
          className="absolute -top-1 bottom-0 w-[3px] bg-edition transition-all duration-300"
          style={{ left: `${currentPosition}%` }}
        />

        {/* Hover indicator */}
        {hoveredYear && hoveredYear !== currentYear && (
          <div
            className="pointer-events-none absolute bottom-0 top-0 w-px bg-ink"
            style={{ left: `${((hoveredYear - minYear) / yearRange) * 100}%` }}
          >
            <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-ink px-2 py-0.5 ed-label text-newsprint">
              {hoveredYear}
              {(() => {
                const c = density?.[hoveredYear]
                return c ? `, ${c.toLocaleString()} records` : ''
              })()}
            </span>
          </div>
        )}
      </div>

      {/* Axis */}
      <div className="relative mt-1 h-5">
        {Array.from({ length: Math.floor(yearRange / 10) + 1 }, (_, i) => {
          const year = minYear + i * 10
          const position = ((year - minYear) / yearRange) * 100
          return (
            <span
              key={year}
              className={`absolute font-display text-xs text-faded ${i === 0 ? '' : '-translate-x-1/2'}`}
              style={{ left: `${position}%` }}
            >
              {year}
            </span>
          )
        })}
      </div>

      <p className="mt-6 flex items-baseline justify-between gap-4 ed-label text-faded">
        <span>
          {density
            ? 'Bar height shows records on file per year. Click to open that year.'
            : 'Click anywhere on the timeline to open that year.'}
        </span>
        <span className="text-ink">Selected: {currentYear}</span>
      </p>
    </section>
  )
}
