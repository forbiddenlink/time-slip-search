# TimeSlipSearch

**Your cultural time machine.** Explore any moment in history through natural language conversation.

Ask about any date—"Summer of '69", "my birthday March 15, 1987", or "the 80s"—and discover what songs topped the charts, which movies were playing, how much gas cost, and what events made headlines.

Built for the [Algolia Agent Studio Challenge 2026](https://dev.to/challenges/algolia).

---

## Features

- **Natural Language Date Parsing** — Understands "December 1985", "Summer of '69", "the 80s", and more
- **Multi-Source Search** — Queries 4 Algolia indices in parallel for comprehensive results
- **Billboard Hot 100** — Chart data from 1958 to present (~350,000 records)
- **Movie Database** — Popular films with posters, ratings, and genres via TMDB
- **Historical Prices** — Gas prices, minimum wage, and movie tickets via FRED
- **Historical Events** — Births, deaths, and major events via Wikimedia

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Search** | Algolia |
| **Date Parsing** | chrono-node |
| **Deployment** | Vercel |

### Design

The interface uses a **retro-analog aesthetic** inspired by VHS tapes, CRT monitors, and vinyl records:

- CRT screen effects with scan lines and phosphor glow
- VHS cassette-style cards with tape window effects
- Vinyl record indicators for chart rankings
- Film strip borders on movie posters
- Aged paper texture for historical events
- LED segment displays for prices
- VT323 monospace font for data, Playfair Display for headers

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/TimeSlipSearch.git
cd TimeSlipSearch

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Add your API keys to .env.local (see Setup below)

# Run data ingestion (after adding keys)
npm run ingest:billboard
npm run ingest:fred
npm run ingest:tmdb
npm run ingest:wikimedia

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Setup

### Required API Keys

| Service | Purpose | Get Key |
|---------|---------|---------|
| **Algolia** | Search infrastructure | [algolia.com/account/api-keys](https://www.algolia.com/account/api-keys) |
| **TMDB** | Movie data & posters | [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) |
| **FRED** | Historical price data | [fred.stlouisfed.org/docs/api](https://fred.stlouisfed.org/docs/api/api_key.html) |

### Environment Variables

Create `.env.local` with:

```env
# Algolia (Required)
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
ALGOLIA_SEARCH_API_KEY=your_search_key
ALGOLIA_ADMIN_API_KEY=your_admin_key

# External APIs (Required for data ingestion)
TMDB_API_KEY=your_tmdb_key
FRED_API_KEY=your_fred_key
```

For detailed setup instructions, see **[SETUP.md](./SETUP.md)**.

---

## Data Ingestion

Populate your Algolia indices with historical data:

| Script | Source | Records | Time |
|--------|--------|---------|------|
| `npm run ingest:billboard` | GitHub dataset | ~350,000 | ~2 min |
| `npm run ingest:fred` | Federal Reserve API | ~900 | ~1 min |
| `npm run ingest:tmdb` | TMDB API | ~50,000 | ~30 min |
| `npm run ingest:wikimedia` | Wikimedia Feed API | ~20,000 | ~40 min |

**Recommended order:** Billboard → FRED → TMDB → Wikimedia

---

## Project Structure

```
TimeSlipSearch/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main chat interface
│   │   ├── layout.tsx            # Root layout & fonts
│   │   ├── globals.css           # Retro design system
│   │   └── api/chat/route.ts     # Search API endpoint
│   ├── components/
│   │   ├── results/
│   │   │   ├── TimeCapsule.tsx   # Main result container
│   │   │   ├── SongCard.tsx      # Vinyl record style music cards
│   │   │   ├── MovieCard.tsx     # Film strip style movie cards
│   │   │   ├── PriceCard.tsx     # LED display style prices
│   │   │   └── EventCard.tsx     # Newspaper clipping events
│   │   └── chat/
│   │       └── LoadingSkeleton.tsx
│   └── lib/
│       ├── algolia.ts            # Algolia client & search
│       └── date-parser.ts        # Natural language → timestamps
├── scripts/ingest/               # Data ingestion scripts
├── .env.local.example            # Environment template
├── SETUP.md                      # Detailed setup guide
├── tailwind.config.js            # Custom design tokens
└── vercel.json                   # Deployment config
```

---

## Algolia Indices

The app uses 4 separate indices:

| Index | Schema |
|-------|--------|
| `timeslip_songs` | `song_title`, `artist`, `chart_position`, `weeks_on_chart`, `chart_date_timestamp` |
| `timeslip_movies` | `title`, `year`, `genres`, `poster_url`, `vote_average`, `release_timestamp` |
| `timeslip_prices` | `year`, `gas_price_gallon`, `minimum_wage`, `movie_ticket_price`, `timestamp` |
| `timeslip_events` | `title`, `description`, `year`, `event_type`, `importance`, `timestamp` |

All indices use numeric filters on timestamp fields for date range queries.

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository at [vercel.com/new](https://vercel.com/new).

**Production environment variables** (add in Vercel dashboard):
- `NEXT_PUBLIC_ALGOLIA_APP_ID`
- `ALGOLIA_SEARCH_API_KEY`

Note: Admin keys and external API keys are only needed locally for data ingestion.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run ingest:billboard` | Ingest Billboard Hot 100 data |
| `npm run ingest:fred` | Ingest FRED price data |
| `npm run ingest:tmdb` | Ingest TMDB movie data |
| `npm run ingest:wikimedia` | Ingest Wikimedia events |

---

## Example Queries

Try these natural language inputs:

- `"What was #1 on March 15, 1987?"`
- `"Summer of '69"`
- `"December 1985"`
- `"How much did things cost in 1990?"`
- `"The day I was born - April 3, 1975"`
- `"The 80s"`

---

## License

MIT

---

## Acknowledgments

- [Algolia](https://www.algolia.com/) — Search infrastructure
- [chrono-node](https://github.com/wanasit/chrono) — Natural language date parsing
- [TMDB](https://www.themoviedb.org/) — Movie database API
- [FRED](https://fred.stlouisfed.org/) — Federal Reserve Economic Data
- [Wikimedia](https://www.mediawiki.org/wiki/Wikimedia_REST_API) — Historical events

---

**Built for the [Algolia Agent Studio Challenge 2026](https://dev.to/challenges/algolia)**
