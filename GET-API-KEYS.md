# Getting API Keys for TimeSlipSearch

This guide will help you get the free API keys needed for full data functionality.

## 🎬 TMDB API Key (Movies Data)

**Impact**: Adds thousands of movie records to search results

### Steps:
1. Go to https://www.themoviedb.org/signup
2. Create a free account (takes 2 minutes)
3. Verify your email
4. Go to https://www.themoviedb.org/settings/api
5. Click "Create" under API Key (v3 auth)
6. Choose "Developer" option
7. Fill out the application:
   - **Type**: Website
   - **Application Name**: TimeSlipSearch
   - **Application URL**: https://timeslipsearch.vercel.app
   - **Application Summary**: A time travel search engine that shows what was popular on any date in history
8. Accept terms and submit
9. Copy your API Key (v3 auth) - looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### Add to .env.local:
```bash
TMDB_API_KEY=your_actual_key_here
```

### Ingest Data:
```bash
npm run ingest:tmdb
```

Expected: ~10,000-50,000 movie records (1958-2020)

---

## 📅 Historical Events (Alternative Needed)

**Status**: Wikimedia API returning 404 errors

### Alternative Options:

#### Option 1: Wikipedia REST API (Recommended)
Use Wikipedia's REST API directly:
```
https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/{MM}/{DD}
```

No API key needed! Just needs User-Agent header.

#### Option 2: Historical Events JSON Dataset
Find a pre-compiled dataset on GitHub/Kaggle:
- Search: "historical events json dataset"
- Look for: births, deaths, events by date
- Format: Should have date + description + year

#### Option 3: Wikipedia Parsing
Scrape "On This Day" pages:
- https://en.wikipedia.org/wiki/Wikipedia:Selected_anniversaries/Month_Day
- Parse HTML structure
- More brittle but comprehensive

### Quick Fix: Update wikimedia.ts

Change the base URL from:
```typescript
const WIKIMEDIA_BASE_URL = 'https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday'
```

To:
```typescript
const WIKIMEDIA_BASE_URL = 'https://en.wikipedia.org/api/rest_v1/feed/onthisday'
```

Then run:
```bash
npm run ingest:wikimedia
```

---

## 💰 FRED API Key (Complete Economic Data)

**Current Status**: Fallback data working (924 records)
**Optional**: Real API provides more accuracy

### Steps:
1. Go to https://fred.stlouisfed.org/
2. Click "My Account" → "Create Account"
3. Go to https://fred.stlouisfed.org/docs/api/api_key.html
4. Request API Key
5. Copy your key (32 characters)

### Add to .env.local:
```bash
FRED_API_KEY=your_actual_key_here
```

### Ingest Data:
```bash
npm run ingest:fred
```

---

## ✅ Verification

After adding keys and ingesting:

```bash
npx tsx scripts/check-algolia.ts
```

Expected output:
```
📊 Checking Algolia indices...

✓ billboard_songs: 352,187 records
✓ tmdb_movies: ~25,000 records
✓ fred_prices: 924 records
✓ wikimedia_events: ~50,000 records

✅ All indices populated!
```

---

## 🚀 Priority

1. **TMDB** - Highest impact (adds entire movie catalog)
2. **Events** - Fix Wikipedia REST API URL (no key needed)
3. **FRED** - Optional (fallback data already working)

Total time: ~15-30 minutes to get all keys and ingest data.
