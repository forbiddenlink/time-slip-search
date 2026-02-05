export interface FamousDate {
  date: string       // "MM-DD" format
  year: number
  title: string
  description: string
  category: string   // "space" | "politics" | "music" | "technology" | "sports" | "disaster" | "culture"
}

const FAMOUS_DATES: FamousDate[] = [
  {
    date: '07-20',
    year: 1969,
    title: 'Moon Landing',
    description: 'Apollo 11 astronauts Neil Armstrong and Buzz Aldrin became the first humans to walk on the Moon.',
    category: 'space',
  },
  {
    date: '11-22',
    year: 1963,
    title: 'JFK Assassination',
    description: 'President John F. Kennedy was assassinated in Dallas, Texas, shocking the nation and the world.',
    category: 'politics',
  },
  {
    date: '11-09',
    year: 1989,
    title: 'Fall of the Berlin Wall',
    description: 'The Berlin Wall was opened after 28 years, marking the beginning of the end of the Cold War.',
    category: 'politics',
  },
  {
    date: '01-01',
    year: 2000,
    title: 'Y2K - The New Millennium',
    description: 'The world rang in the year 2000 as the feared Y2K computer bug turned out to be largely a non-event.',
    category: 'technology',
  },
  {
    date: '09-11',
    year: 2001,
    title: 'September 11th',
    description: 'A day of tragedy that changed the course of history. Nearly 3,000 lives were lost in terrorist attacks on American soil.',
    category: 'politics',
  },
  {
    date: '08-15',
    year: 1969,
    title: 'Woodstock Begins',
    description: 'The Woodstock Music & Art Fair opened in Bethel, New York, defining a generation with three days of peace and music.',
    category: 'music',
  },
  {
    date: '08-16',
    year: 1977,
    title: 'Elvis Presley Dies',
    description: 'The King of Rock and Roll, Elvis Presley, passed away at Graceland at the age of 42.',
    category: 'music',
  },
  {
    date: '12-08',
    year: 1980,
    title: 'John Lennon Shot',
    description: 'Former Beatle John Lennon was shot and killed outside his New York City apartment, ending an era.',
    category: 'music',
  },
  {
    date: '01-28',
    year: 1986,
    title: 'Challenger Disaster',
    description: 'Space Shuttle Challenger broke apart 73 seconds after launch, claiming the lives of all seven crew members.',
    category: 'space',
  },
  {
    date: '08-31',
    year: 1997,
    title: 'Princess Diana Dies',
    description: 'Diana, Princess of Wales, died in a car crash in Paris. The world mourned "the people\'s princess."',
    category: 'culture',
  },
  {
    date: '11-30',
    year: 1982,
    title: 'Michael Jackson\'s Thriller Released',
    description: 'Michael Jackson released Thriller, which would become the best-selling album of all time.',
    category: 'music',
  },
  {
    date: '01-09',
    year: 2007,
    title: 'First iPhone Announced',
    description: 'Steve Jobs unveiled the original iPhone at Macworld, forever changing how we interact with technology.',
    category: 'technology',
  },
  {
    date: '11-04',
    year: 2008,
    title: 'Obama Elected President',
    description: 'Barack Obama was elected the 44th President of the United States, becoming the first African American to hold the office.',
    category: 'politics',
  },
  {
    date: '07-13',
    year: 1985,
    title: 'Live Aid Concert',
    description: 'The historic Live Aid benefit concert was held simultaneously in London and Philadelphia, raising millions for famine relief in Ethiopia.',
    category: 'music',
  },
  {
    date: '04-26',
    year: 1986,
    title: 'Chernobyl Disaster',
    description: 'Reactor No. 4 at the Chernobyl Nuclear Power Plant in Ukraine exploded, causing the worst nuclear disaster in history.',
    category: 'disaster',
  },
  {
    date: '02-11',
    year: 1990,
    title: 'Nelson Mandela Freed',
    description: 'Nelson Mandela walked free after 27 years of imprisonment, heralding the end of apartheid in South Africa.',
    category: 'politics',
  },
  {
    date: '08-06',
    year: 1991,
    title: 'World Wide Web Announced',
    description: 'Tim Berners-Lee publicly announced the World Wide Web project, launching the information age.',
    category: 'technology',
  },
  {
    date: '07-04',
    year: 1997,
    title: 'Mars Pathfinder Lands',
    description: 'NASA\'s Mars Pathfinder spacecraft landed on Mars, deploying the Sojourner rover to explore the Red Planet.',
    category: 'space',
  },
  {
    date: '04-13',
    year: 1997,
    title: 'Tiger Woods Wins First Masters',
    description: 'At age 21, Tiger Woods won the Masters Tournament by 12 strokes, the largest margin of victory in tournament history.',
    category: 'sports',
  },
  {
    date: '08-29',
    year: 2005,
    title: 'Hurricane Katrina',
    description: 'Hurricane Katrina made landfall near New Orleans, becoming one of the deadliest and costliest natural disasters in U.S. history.',
    category: 'disaster',
  },
  {
    date: '04-04',
    year: 1968,
    title: 'Martin Luther King Jr. Assassinated',
    description: 'Civil rights leader Dr. Martin Luther King Jr. was assassinated in Memphis, Tennessee.',
    category: 'politics',
  },
  {
    date: '07-29',
    year: 1981,
    title: 'Royal Wedding: Charles & Diana',
    description: 'Prince Charles married Lady Diana Spencer at St Paul\'s Cathedral, watched by 750 million people worldwide.',
    category: 'culture',
  },
  {
    date: '10-29',
    year: 1969,
    title: 'First Internet Message Sent',
    description: 'The first message was sent over ARPANET from UCLA to Stanford, giving birth to the Internet.',
    category: 'technology',
  },
  {
    date: '02-09',
    year: 1964,
    title: 'The Beatles on Ed Sullivan',
    description: 'The Beatles made their legendary U.S. television debut on The Ed Sullivan Show, watched by 73 million viewers.',
    category: 'music',
  },
  {
    date: '04-12',
    year: 1961,
    title: 'First Human in Space',
    description: 'Soviet cosmonaut Yuri Gagarin became the first human to journey into outer space aboard Vostok 1.',
    category: 'space',
  },
]

/**
 * Check if a searched date matches a famous date.
 * Matches on month, day, AND year.
 */
export function getFamousDate(month: number, day: number, year: number): FamousDate | null {
  const dateKey = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return FAMOUS_DATES.find(fd => fd.date === dateKey && fd.year === year) ?? null
}

/**
 * Return all famous dates from a given year.
 */
export function getNearbyFamousDates(year: number): FamousDate[] {
  return FAMOUS_DATES.filter(fd => fd.year === year)
}
