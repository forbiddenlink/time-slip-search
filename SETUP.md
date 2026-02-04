# TimeSlipSearch Setup Guide

Complete setup instructions for the TimeSlipSearch project.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.local.example .env.local

# 3. Add your API keys to .env.local (see below)

# 4. Run data ingestion scripts (after adding keys)
npm run ingest:billboard
npm run ingest:fred
npm run ingest:tmdb
npm run ingest:wikimedia

# 5. Start development server
npm run dev

# 6. Open http://localhost:3000
```

---

## Account Setup

### 1. Algolia (Required)

Algolia provides the search infrastructure. The Free Build Plan is sufficient.

**Steps:**
1. Go to https://www.algolia.com/users/sign_up
2. Create a free account (no credit card required)
3. After signup, go to **Settings > API Keys**
4. Copy these values to `.env.local`:
   - **Application ID** → `NEXT_PUBLIC_ALGOLIA_APP_ID` and `ALGOLIA_APP_ID`
   - **Search-Only API Key** → `ALGOLIA_SEARCH_API_KEY`
   - **Admin API Key** → `ALGOLIA_ADMIN_API_KEY`

**Note:** The Admin API Key is only used for data ingestion scripts. Never expose it to the client.

### 2. TMDB (Required for Movies)

The Movie Database provides movie metadata and poster images.

**Steps:**
1. Go to https://www.themoviedb.org/signup
2. Create a free account
3. Go to **Settings > API** (left sidebar)
4. Click "Create" under "Request an API Key"
5. Select "Developer" and fill out the form
6. Copy **API Key (v3 auth)** → `TMDB_API_KEY`

### 3. FRED (Required for Prices)

Federal Reserve Economic Data provides historical price data.

**Steps:**
1. Go to https://fred.stlouisfed.org/docs/api/api_key.html
2. Click "Request API Key"
3. Create an account or sign in
4. Copy your API key → `FRED_API_KEY`

### 4. Vercel (For Deployment)

**Steps:**
1. Go to https://vercel.com/signup
2. Sign up with GitHub (recommended)
3. The Hobby plan (free) is sufficient for this project

---

## Environment Variables

Your `.env.local` should look like this:

```env
# Algolia Configuration
NEXT_PUBLIC_ALGOLIA_APP_ID=YOUR_APP_ID
ALGOLIA_APP_ID=YOUR_APP_ID
ALGOLIA_SEARCH_API_KEY=YOUR_SEARCH_KEY
ALGOLIA_ADMIN_API_KEY=YOUR_ADMIN_KEY

# TMDB API
TMDB_API_KEY=YOUR_TMDB_KEY

# FRED API
FRED_API_KEY=YOUR_FRED_KEY
```

---

## Data Ingestion

Run these scripts to populate your Algolia indices with data.

### Billboard Hot 100 (Music Charts)
```bash
npm run ingest:billboard
```
- **Source:** GitHub JSON dataset
- **Coverage:** 1958-present
- **Time:** ~2 minutes
- **Records:** ~350,000

### FRED Prices
```bash
npm run ingest:fred
```
- **Source:** Federal Reserve API
- **Coverage:** 1950-present (gas from 1976)
- **Time:** ~1 minute
- **Records:** ~900

### TMDB Movies
```bash
npm run ingest:tmdb
```
- **Source:** TMDB API
- **Coverage:** 1950-present
- **Time:** ~30 minutes (rate limited)
- **Records:** ~50,000

### Wikimedia Events
```bash
npm run ingest:wikimedia
```
- **Source:** Wikimedia Feed API
- **Coverage:** All historical dates (filtered to 1900+)
- **Time:** ~40 minutes (366 API calls)
- **Records:** ~20,000

**Recommended order:** Billboard → FRED → TMDB → Wikimedia

---

## Deployment to Vercel

### Option 1: CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to link to your Vercel account
# Set environment variables when prompted
```

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Add environment variables in the Vercel dashboard
5. Deploy

### Environment Variables in Vercel

In the Vercel dashboard, add these environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_ALGOLIA_APP_ID` | Your Algolia App ID |
| `ALGOLIA_SEARCH_API_KEY` | Your Algolia Search Key |

**Note:** You don't need `ALGOLIA_ADMIN_API_KEY`, `TMDB_API_KEY`, or `FRED_API_KEY` in Vercel - those are only for local data ingestion.

---

## Development

### Run locally
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Test the build
```bash
npm run start
```

### Lint code
```bash
npm run lint
```

---

## Troubleshooting

### "Algolia credentials not configured"
- Ensure `.env.local` exists with valid keys
- Restart the dev server after adding keys

### "TMDB rate limit exceeded"
- Wait 10 seconds and retry
- The ingestion script has built-in delays

### "FRED API error"
- Verify your FRED API key is valid
- Check https://fred.stlouisfed.org status

### Build fails with type errors
```bash
npx tsc --noEmit
```
This shows TypeScript errors to fix.

### Ingestion seems stuck
- Billboard: Large file download, be patient
- Wikimedia: 366 API calls with rate limiting
- Check console for progress updates

---

## Project Structure

```
TimeSlipSearch/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main chat interface
│   │   ├── layout.tsx        # Root layout with metadata
│   │   ├── globals.css       # Tailwind styles
│   │   └── api/chat/route.ts # Chat API endpoint
│   ├── components/
│   │   ├── results/          # Result card components
│   │   ├── chat/             # Chat UI components
│   │   └── share/            # Shareable card components
│   └── lib/
│       ├── algolia.ts        # Algolia client & types
│       └── date-parser.ts    # Natural language date parsing
├── scripts/ingest/           # Data ingestion scripts
├── .env.local.example        # Environment template
├── vercel.json              # Vercel deployment config
└── package.json             # Dependencies & scripts
```

---

## Contest Submission

For the Algolia Agent Studio Challenge:

1. Deploy to Vercel
2. Test all features work
3. Create a demo video/GIF
4. Write your DEV.to submission post
5. Include these tags: `devchallenge`, `algoliachallenge`, `ai`, `agents`

**Deadline:** February 8, 2026, 11:59 PM PT

Good luck!
