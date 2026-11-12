import { memo } from 'react'
import type { HistoricalEvent } from '@/lib/algolia'

interface EventCardProps {
  event: HistoricalEvent
}

function getEventKind(eventType?: string): string | null {
  switch (eventType) {
    case 'birth':
      return 'Born'
    case 'death':
      return 'Died'
    default:
      return null
  }
}

export const EventCard = memo(function EventCard({ event }: EventCardProps) {
  const kind = getEventKind(event.event_type)

  return (
    <li className="flex gap-4 border-t border-ink/25 py-4">
      <span className="ed-label w-12 shrink-0 pt-1 text-faded">{event.year}</span>
      <div className="min-w-0 flex-1">
        {kind && <p className="ed-label text-edition">{kind}</p>}
        <p className="font-display text-lg leading-snug text-balance">{event.title}</p>
        {event.description && event.description !== event.title && (
          <p className="mt-1 line-clamp-2 font-body text-sm italic text-faded">{event.description}</p>
        )}
      </div>
    </li>
  )
})

interface EventListProps {
  events: HistoricalEvent[]
  title?: string
}

export function EventList({ events, title = 'On this day' }: EventListProps) {
  if (events.length === 0) return null

  // Prioritize "selected" events
  const sortedEvents = [...events].sort((a, b) => {
    if (a.importance === 'major' && b.importance !== 'major') return -1
    if (b.importance === 'major' && a.importance !== 'major') return 1
    return 0
  })

  return (
    <section aria-labelledby="sec-events">
      <h3 id="sec-events" className="ed-label border-b-2 border-ink pb-2">{title}</h3>
      <ul>
        {sortedEvents.slice(0, 4).map((event) => (
          <EventCard key={event.objectID} event={event} />
        ))}
      </ul>
    </section>
  )
}
