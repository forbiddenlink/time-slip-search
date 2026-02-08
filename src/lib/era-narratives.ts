/**
 * Era Narratives - Rich cultural context for each decade
 * Used to generate emotional, era-specific insights
 */

export const ERA_NARRATIVES: Record<string, string[]> = {
  '1950s': [
    'Rock & Roll burst onto the scene, shaking up a post-war America...',
    'Elvis was swiveling his hips, scandalizing parents everywhere...',
    'The golden age of diners, drive-ins, and jukeboxes...',
    'America was building suburbs and dreaming of a nuclear future...',
    'The beats were rebelling against conformity in coffee houses...',
  ],
  '1960s': [
    'The Summer of Love was in the air, and change was coming...',
    'Beatlemania swept the nation as the Fab Four conquered America...',
    'The counterculture was rising—peace, love, and revolution...',
    'JFK inspired a generation to ask what they could do for their country...',
    'Psychedelia painted the world in Day-Glo colors...',
    'Woodstock defined a generation with three days of peace and music...',
  ],
  '1970s': [
    'Disco balls spun as everyone hit the dance floor...',
    'Punk rock was screaming against the establishment in dingy clubs...',
    'Bell-bottoms and platform shoes ruled the streets...',
    'The Watergate scandal shook America\'s faith in its leaders...',
    'Star Wars transported audiences to a galaxy far, far away...',
    'Stayin\' Alive wasn\'t just a song—it was a way of life...',
  ],
  '1980s': [
    'MTV changed everything—now we wanted our music with visuals...',
    'Big hair, bigger shoulder pads, and the biggest dreams...',
    'Michael Jackson moonwalked into our hearts and never left...',
    'The Cold War was thawing as the Berlin Wall crumbled...',
    'Pac-Man fever and Rubik\'s Cube obsession gripped the nation...',
    'Reagan was in the White House and synthesizers were everywhere...',
    'The Breakfast Club asked us: who are we, really?',
  ],
  '1990s': [
    'Grunge arrived from Seattle, flannel-clad and angst-filled...',
    'The internet was about to change everything (you\'ve got mail!)...',
    'Hip-hop went mainstream, and the East Coast battled the West...',
    'Rachel\'s haircut was everywhere. Could we BE any more 90s?',
    'Y2K was coming—would computers survive the millennium?',
    'The Macarena. Everyone did it. No one admits it now...',
    'Nirvana made it okay to not be okay...',
  ],
  '2000s': [
    'The new millennium arrived with flip phones and frosted tips...',
    'MySpace Top 8 drama and choosing the perfect profile song...',
    'The iPod put 1,000 songs in your pocket...',
    '9/11 changed everything—the world would never feel the same...',
    'Reality TV took over—everyone wanted their 15 minutes...',
    'Emo kids were writing poetry in their away messages...',
    'The iPhone arrived, and suddenly the future was in our hands...',
  ],
  '2010s': [
    'Selfies, hashtags, and Instagram filters became our reality...',
    'Streaming killed the video star (and the DVD section)...',
    'The world went viral, one meme at a time...',
    'Smartphones became extensions of ourselves...',
    'We binge-watched entire seasons in a single weekend...',
    'Social media connected us—and divided us too...',
  ],
}

export const SEASON_CONTEXT: Record<string, string[]> = {
  spring: [
    'As spring blossomed...',
    'The world was thawing into new possibilities...',
    'With flowers blooming...',
  ],
  summer: [
    'That summer...',
    'In the heat of summer...',
    'During those long summer days...',
    'The summer air was electric with...',
  ],
  fall: [
    'As the leaves changed...',
    'That autumn...',
    'With fall in the air...',
    'As summer faded into fall...',
  ],
  winter: [
    'That winter...',
    'As the cold set in...',
    'During the holiday season...',
    'In the depths of winter...',
  ],
}

export const YEAR_HIGHLIGHTS: Record<number, string> = {
  1958: 'The year the Billboard Hot 100 was born',
  1963: 'The year of Beatlemania and a nation\'s loss',
  1967: 'The Summer of Love',
  1969: 'The year we walked on the moon',
  1970: 'The year the Beatles broke up',
  1973: 'The year of the oil crisis',
  1977: 'The year Elvis left the building—forever',
  1980: 'The year John Lennon was taken from us',
  1981: 'The year MTV launched and music was never the same',
  1982: 'The year Thriller changed pop music forever',
  1984: 'Orwell\'s future arrived (not quite as predicted)',
  1985: 'The year the world came together for Live Aid',
  1989: 'The year the Wall came down',
  1991: 'The year grunge broke through',
  1994: 'The year Kurt Cobain left too soon',
  1997: 'The year we lost Princess Diana',
  1999: 'The year we partied like it was... well, 1999',
  2000: 'Y2K—the bug that didn\'t bite',
  2001: 'The year that changed everything',
  2007: 'The year the iPhone changed our lives',
  2008: 'The year America made history',
  2009: 'The year we lost the King of Pop',
  2016: 'The year we lost Bowie, Prince, and our innocence',
  2020: 'The year the world stood still',
}

/**
 * Get the season from a month number (1-12)
 */
function getSeason(month: number): 'spring' | 'summer' | 'fall' | 'winter' {
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'fall'
  return 'winter'
}

/**
 * Get the decade string from a year
 */
function getDecade(year: number): string {
  const decadeStart = Math.floor(year / 10) * 10
  return `${decadeStart}s`
}

/**
 * Get a random element from an array
 */
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

/**
 * Get era-specific context for a given year and optional month
 */
export function getEraContext(year: number, month?: number): string {
  const decade = getDecade(year)
  const narratives = ERA_NARRATIVES[decade]

  // Start with year highlight if available
  const yearHighlight = YEAR_HIGHLIGHTS[year]
  if (yearHighlight) {
    return yearHighlight
  }

  // Add season context if month is provided
  if (month && narratives) {
    const season = getSeason(month)
    const seasonContext = randomElement(SEASON_CONTEXT[season] ?? [])
    const eraNarrative = randomElement(narratives)
    return `${seasonContext} ${eraNarrative.toLowerCase()}`
  }

  // Just return era narrative
  if (narratives) {
    return randomElement(narratives)
  }

  return `A moment from ${year}...`
}

/**
 * Get multiple era narratives for variety
 */
export function getEraInsights(year: number, count: number = 3): string[] {
  const decade = getDecade(year)
  const narratives = ERA_NARRATIVES[decade] ?? []

  const shuffled = [...narratives].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

/**
 * Get cultural movement context for a decade
 */
export function getCulturalMovement(year: number): string | null {
  const movements: Record<string, string> = {
    '1950s': 'The birth of rock & roll',
    '1960s': 'The counterculture revolution',
    '1970s': 'Disco fever and punk rebellion',
    '1980s': 'The MTV generation',
    '1990s': 'The grunge era and digital dawn',
    '2000s': 'The social media awakening',
    '2010s': 'The streaming age',
  }

  return movements[getDecade(year)] ?? null
}

/**
 * Get price comparison narrative
 */
export function getPriceComparisonNarrative(
  item: string,
  thenPrice: number,
  nowPrice: number,
  year: number
): string {
  const multiplier = (nowPrice / thenPrice).toFixed(1)
  const inflation = ((nowPrice - thenPrice) / thenPrice * 100).toFixed(0)

  return `In ${year}, ${item} cost $${thenPrice.toFixed(2)}. ` +
    `Today that same ${item} would cost $${nowPrice.toFixed(2)} — ` +
    `that's ${multiplier}x more (+${inflation}% inflation).`
}
