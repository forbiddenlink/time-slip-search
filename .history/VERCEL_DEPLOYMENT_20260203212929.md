# Vercel Deployment Setup

## Prerequisites
✅ Algolia account with indices populated
✅ Vercel account connected to your GitHub repository

## Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables for **Production, Preview, and Development**:

```
NEXT_PUBLIC_ALGOLIA_APP_ID=K28U89VT5M
ALGOLIA_SEARCH_API_KEY=f78cd5274e7defdfca1e3000656ca6df
```

⚠️ **Security Note**: Never add `ALGOLIA_ADMIN_API_KEY` to Vercel - it's only needed for data ingestion scripts run locally.

## Deployment Steps

### Method 1: Automatic (Recommended)
1. Push your code to GitHub
2. Vercel will automatically deploy
3. Verify environment variables are set
4. Test your deployment

### Method 2: Manual via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables (if not done via dashboard)
vercel env add NEXT_PUBLIC_ALGOLIA_APP_ID
vercel env add ALGOLIA_SEARCH_API_KEY
```

## Verification Checklist

After deployment, verify:

- [ ] Environment variables are set in Vercel dashboard
- [ ] App builds successfully  
- [ ] Search queries return results from Algolia
- [ ] All indices (songs, movies, prices, events) are accessible
- [ ] No console errors in browser dev tools

## Troubleshooting

### "No data returned"
- Check environment variables are set in Vercel
- Verify Algolia indices exist and have data
- Check Algolia dashboard for API usage/errors

### "Algolia credentials not configured"
- Environment variables not set or named incorrectly
- Must be `NEXT_PUBLIC_ALGOLIA_APP_ID` (note the prefix)
- Redeploy after adding variables

### Search returns empty results
- Verify indices are populated locally first:
  ```bash
  npx tsx scripts/check-algolia.ts
  ```
- Check date filtering logic in query
- Review Algolia dashboard insights

## Current Index Status

✅ **timeslip_songs**: 352,187 records (1958-2026)
⚠️ **timeslip_movies**: Empty (optional - requires TMDB API key)
⚠️ **timeslip_prices**: Empty (optional - requires FRED API key)  
⚠️ **timeslip_events**: Empty (optional - uses Wikimedia API)

The app will work with just songs data. To populate other indices:

```bash
# Set API keys in .env.local
TMDB_API_KEY=your_key
FRED_API_KEY=your_key

# Run ingestion scripts
npm run ingest:tmdb
npm run ingest:fred
npm run ingest:wikimedia
```
