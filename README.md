# TimeSlipSearch

**A conversational cultural time machine -- explore any moment in history.**

---

TimeSlipSearch lets you travel to any date between 1958 and 2020 through natural language. Type your birthday, a historical milestone, or just "Summer of '69" and instantly see the #1 song on the charts, the movies in theaters, what a gallon of gas cost, and the events that shaped the world -- all rendered in a retro CRT interface that feels like powering on a time machine.

Built by **Elizabeth Stein** for the **[Algolia Agent Studio Challenge 2026](https://dev.to/challenges/algolia)**.

**[Live Demo -- timeslipsearch.vercel.app](https://timeslipsearch.vercel.app)**

---

## Features

### Search and Discovery

- Algolia-powered instant search across 420,000+ records with parallel multi-index queries
- Natural language date parsing -- understands "March 15, 1987", "the 80s", "Christmas 1992", and date ranges
- Smart autocomplete with keyboard navigation
- Voice search via the Web Speech API
- Shareable URLs for every search result

### Content

- Billboard Hot 100 weekly charts (350,000+ entries from 1958 to present)
- Movie releases from TMDB (50,000+ films with ratings, genres, and posters)
- Historical prices from FRED (gas, minimum wage, movie tickets, CPI, inflation)
- Historical events from Wikimedia (20,000+ categorized by type and importance)
- AI-generated era insights and contextual follow-up suggestions

### Retro Interface

- CRT boot-up animation with phosphor glow and scanline overlays
- VHS tracking lines and toggleable tape distortion effects
- Era-adaptive particle system that shifts with the decade
- Vinyl record, film strip, and cassette tape design motifs
- VT323 LED readouts, Playfair Display headers, and Source Serif body text

### Engagement

- Time Capsule Wrapped -- a personalized year-in-review of your exploration history
- Achievement system with unlockable badges for decades explored, songs discovered, and search streaks
- Interactive Chart.js visualizations for price trends and chart statistics
- Timeline explorer for decade-hopping navigation
- Full keyboard shortcut suite (Cmd+K, Cmd+T, Cmd+W, Cmd+B, and more)

---

## Tech Stack

| Layer | Technology | Version |
| --- | --- | --- |
| Framework | [Next.js](https://nextjs.org/) (App Router) | 16 |
| Language | [TypeScript](https://www.typescriptlang.org/) | 5.9 |
| Search | [Algolia](https://www.algolia.com/) (algoliasearch) | 5 |
| Styling | [Tailwind CSS](https://tailwindcss.com/) | 3.4 |
| Animation | [Framer Motion](https://www.framer.com/motion/) | 12 |
| Charts | [Chart.js](https://www.chartjs.org/) + react-chartjs-2 | 4 |
| Date Parsing | [chrono-node](https://github.com/wanasit/chrono) | 2.9 |
| Voice Input | Web Speech API | Browser-native |
| Testing | Jest + React Testing Library | 29 |
| Deployment | [Vercel](https://vercel.com/) | -- |

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- An [Algolia](https://www.algolia.com/) account (free tier works)
- API keys for [TMDB](https://www.themoviedb.org/settings/api) and [FRED](https://fred.stlouisfed.org/docs/api/api_key.html) (for data ingestion only)

### Install

```bash
git clone https://github.com/your-username/timeslip-search.git
cd timeslip-search
npm install
```

### Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your keys:

```env
# Required -- Algolia
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
ALGOLIA_SEARCH_API_KEY=your_search_only_api_key
ALGOLIA_ADMIN_API_KEY=your_admin_api_key

# Required for data ingestion
TMDB_API_KEY=your_tmdb_api_key
FRED_API_KEY=your_fred_api_key

# Optional -- enhanced features
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
KV_REST_API_URL=your_vercel_kv_url
KV_REST_API_TOKEN=your_vercel_kv_token
```

### Populate the Indices

Run the ingestion scripts to load data into your Algolia indices:

```bash
npm run ingest:billboard    # Billboard Hot 100 (~350K records, ~2 min)
npm run ingest:fred         # FRED economic data (~900 records, ~1 min)
npm run ingest:tmdb         # TMDB movies (~50K records, ~30 min)
npm run ingest:wikimedia    # Wikimedia events (~20K records, ~40 min)
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Architecture

### Search Flow

```text
User input ("Summer of '69")
  -> chrono-node parses natural language to a date range (Jun 1 -- Aug 31, 1969)
  -> API route builds numeric range filters (date >= start AND date <= end)
  -> Four parallel Algolia queries execute against all indices
  -> Results are assembled into a structured TimeCapsule response
  -> UI renders with era-adaptive insights, suggestions, and visual effects
```

### Algolia Indices

| Index | Records | Source | Key Fields |
| --- | --- | --- | --- |
| `timeslip_songs` | ~350,000 | Billboard Hot 100 | chart_position, song_title, artist, weeks_on_chart |
| `timeslip_movies` | ~50,000 | TMDB | title, genres, vote_average, poster_url, popularity |
| `timeslip_prices` | ~800 | FRED | gas_price_gallon, minimum_wage, movie_ticket_price, cpi_index |
| `timeslip_events` | ~20,000 | Wikimedia | title, description, event_type, importance |

Every record shares a common schema: `date` (Unix timestamp), `date_string`, `year`, and `decade`. This uniform structure enables consistent cross-index filtering with a single set of numeric range parameters.

### Project Structure

```text
src/
  app/
    page.tsx                  Main conversational interface
    layout.tsx                Root layout, fonts, metadata
    globals.css               Retro design system (CRT, VHS, vinyl)
    api/chat/route.ts         Search API with rate limiting
    api/og/route.tsx          Dynamic Open Graph images
  components/
    results/                  TimeCapsule, SongCard, MovieCard, PriceCard, EventCard
    search/                   SearchAutocomplete
    input/                    VoiceInput
    animations/               VHSEffect, ParticleEffect
    achievements/             AchievementsPanel, AchievementToast
    wrapped/                  WrappedCard (Time Capsule Wrapped)
    memory/                   AgentMemoryPanel
    icons/                    Hand-crafted SVG icon components
  lib/
    algolia.ts                Algolia client, index queries, type definitions
    date-parser.ts            chrono-node wrapper with range/era support
    achievements.ts           Badge unlock logic
    wrapped.ts                Exploration tracking and stats
    agent-memory.ts           Search history persistence
    autocomplete-suggestions.ts
    rate-limit.ts
    url-state.ts
    share.ts
scripts/
  ingest/
    billboard.ts              Billboard Hot 100 ingestion
    tmdb.ts                   TMDB movie ingestion
    fred.ts                   FRED economic data ingestion
    wikimedia.ts              Wikimedia event ingestion
```

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run test suite |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run ingest:billboard` | Ingest Billboard Hot 100 data |
| `npm run ingest:tmdb` | Ingest TMDB movie data |
| `npm run ingest:fred` | Ingest FRED price data |
| `npm run ingest:wikimedia` | Ingest Wikimedia event data |

---

## Deployment

### Vercel

```bash
npx vercel
```

Or connect your GitHub repository at [vercel.com/new](https://vercel.com/new).

Add these environment variables in the Vercel dashboard:

- `NEXT_PUBLIC_ALGOLIA_APP_ID`
- `ALGOLIA_SEARCH_API_KEY`

Admin keys and external API keys are only needed locally for data ingestion -- they are not required in production.

---

## Example Queries

- `"What was #1 on March 15, 1987?"`
- `"Summer of '69"`
- `"December 1985"`
- `"The day the Berlin Wall fell"`
- `"How much did things cost in 1990?"`
- `"The 80s"`
- `"Christmas 1992"`

---

## Acknowledgments

- [Algolia](https://www.algolia.com/) -- Search infrastructure
- [chrono-node](https://github.com/wanasit/chrono) -- Natural language date parsing
- [TMDB](https://www.themoviedb.org/) -- The Movie Database API
- [FRED](https://fred.stlouisfed.org/) -- Federal Reserve Economic Data
- [Wikimedia](https://www.mediawiki.org/wiki/Wikimedia_REST_API) -- Historical events

---

## License

MIT

---

**Built for the [Algolia Agent Studio Challenge 2026](https://dev.to/challenges/algolia)**
