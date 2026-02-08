# TimeSlipSearch - Vercel Deployment Guide

Quick guide to deploy TimeSlipSearch to production with all optimizations enabled.

---

## Prerequisites

- ✅ Vercel account (free tier works)
- ✅ GitHub repository with your code
- ✅ Algolia account with indices populated
- ✅ TMDB and FRED API keys

---

## Step 1: Initial Deployment

### Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel auto-detects Next.js settings ✅
5. Click "Deploy"

### Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Follow prompts:
# - Link to existing project or create new
# - Select production
```

---

## Step 2: Configure Environment Variables

### Required Variables

Go to Project Settings → Environment Variables and add:

```env
# Algolia (Required)
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
ALGOLIA_SEARCH_API_KEY=your_search_api_key
ALGOLIA_ADMIN_API_KEY=your_admin_api_key

# TMDB (Required for data ingestion)
TMDB_API_KEY=your_tmdb_key

# FRED (Required for price data)
FRED_API_KEY=your_fred_key
```

**Apply to:** Production, Preview, Development

---

## Step 3: Add Redis for Production Rate Limiting

### Option A: Via Vercel Marketplace (Recommended)

1. Go to your project dashboard
2. Click "Storage" tab
3. Click "Create Database"
4. Select "Upstash Redis"
5. Choose plan (free tier available)
6. Click "Create"
7. Vercel auto-configures these variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### Option B: Manual Upstash Setup

1. Go to [console.upstash.com](https://console.upstash.com)
2. Create a new Redis database
3. Choose closest region to your Vercel deployment
4. Copy REST URL and Token
5. Add to Vercel environment variables:

```env
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

**Apply to:** Production (and Preview if desired)

---

## Step 4: Verify Deployment

### Check Build

1. Go to Deployments tab
2. Click latest deployment
3. Check build logs for:
   ```
   ✓ Compiled successfully
   ✓ Running TypeScript
   ✓ Generating static pages (7/7)
   ```

### Test Production Site

1. Visit your deployment URL
2. Test search: "March 15, 1987"
3. Check achievements panel loads
4. Verify charts load (should lazy load)
5. Test voice search (if browser supports)

### Verify Redis Connection

Check deployment logs for:
```
[Rate Limit] Using Redis (production mode)
```

If you see:
```
[Rate Limit] Using in-memory store (development mode)
```

Redis is not configured (will fall back to in-memory).

---

## Step 5: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (~24 hours max)

---

## Performance Monitoring

### Enable Vercel Analytics

1. Go to Analytics tab
2. Click "Enable Analytics"
3. Free tier: 100k events/month

### Check Metrics

Monitor:
- Page load times
- Core Web Vitals
- API response times
- Error rates

---

## Troubleshooting

### Build Fails

**TypeScript Errors:**
```bash
# Locally verify build works
npm run build
npx tsc --noEmit
```

**Missing Dependencies:**
```bash
# Ensure package.json is committed
git add package.json package-lock.json
git commit -m "fix: update dependencies"
git push
```

### Runtime Errors

**Algolia Credentials:**
- Check environment variables are set
- Verify API keys are correct
- Ensure NEXT_PUBLIC_ prefix for client-side variables

**Redis Connection:**
- Verify UPSTASH variables are set
- Check Upstash dashboard for connection issues
- System falls back to in-memory if Redis fails

**Rate Limiting Issues:**
```
429 Too Many Requests
```
- Expected behavior (30 req/min limit)
- Increase limit in `src/lib/rate-limit.ts` if needed
- Redis required for distributed rate limiting

---

## Environment-Specific Configs

### Development
```env
# Local .env.local file
NEXT_PUBLIC_ALGOLIA_APP_ID=xxx
ALGOLIA_SEARCH_API_KEY=xxx
# No Redis needed - uses in-memory
```

### Preview (Staging)
```env
# Same as production
# + Optional separate Algolia indices for testing
```

### Production
```env
# All required variables
# + Redis for scalable rate limiting
# + Analytics enabled
```

---

## CLI Commands Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]

# Set environment variable
vercel env add UPSTASH_REDIS_REST_URL production

# Pull environment variables locally
vercel env pull .env.local
```

---

## Data Ingestion (One-Time Setup)

If your Algolia indices are empty, run locally:

```bash
# Install dependencies
npm install

# Configure .env.local with ALGOLIA_ADMIN_API_KEY

# Run ingestion scripts (in order)
npm run ingest:billboard  # ~2 min, 350K songs
npm run ingest:fred       # ~1 min, 900 prices
npm run ingest:tmdb       # ~30 min, 50K movies
npm run ingest:wikimedia  # ~40 min, 20K events
```

**Note:** Ingestion should be run locally, not on Vercel (would timeout).

---

## Deployment Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Algolia indices populated with data
- [ ] Redis connected (production rate limiting)
- [ ] Build succeeds without errors
- [ ] Manual testing on preview deployment:
  - [ ] Search works
  - [ ] Charts load
  - [ ] Achievements unlock
  - [ ] Wrapped feature works
  - [ ] Voice search (Chrome/Edge)
  - [ ] Mobile responsive
- [ ] Custom domain configured (if applicable)
- [ ] Analytics enabled
- [ ] OG images generate correctly

---

## Post-Deployment

### Monitor

1. **Vercel Dashboard**
   - Check deployment frequency
   - Monitor build times
   - Review error rates

2. **Upstash Dashboard**
   - Monitor Redis usage
   - Check connection count
   - Review rate limit hits

3. **Algolia Dashboard**
   - Monitor search volume
   - Check API usage
   - Review search analytics

### Scale

**Traffic Increases:**
- Vercel auto-scales (no action needed)
- Redis handles distributed rate limiting
- Algolia scales automatically

**Cost Optimization:**
- Algolia: Monitor requests/month
- Upstash: Check Redis usage
- Vercel: Review bandwidth usage

---

## Support Resources

### Vercel
- Docs: https://vercel.com/docs
- Status: https://vercel-status.com
- Community: https://github.com/vercel/next.js/discussions

### Upstash
- Docs: https://docs.upstash.com
- Console: https://console.upstash.com
- Support: support@upstash.com

### Project Specific
- Main README: `README.md`
- Setup Guide: `SETUP.md`
- Audit Report: `AUDIT-REPORT.md`
- Improvements: `IMPROVEMENTS-SUMMARY.md`

---

## Quick Deploy Script

Save as `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 TimeSlipSearch Deployment"
echo "=============================="

# Run tests
echo "Running tests..."
npm test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed"
    exit 1
fi

# Type check
echo "Type checking..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ TypeScript errors"
    exit 1
fi

# Build locally
echo "Building..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ All checks passed"
echo "Deploying to production..."

# Deploy
vercel --prod

echo "🎉 Deployment complete!"
```

Usage:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Security Checklist

- [x] Environment variables not committed to git
- [x] `.env.local` in `.gitignore`
- [x] API keys use minimum required permissions
- [x] Rate limiting enabled (30 req/min)
- [x] HTTPS enforced (Vercel automatic)
- [x] CSP headers configured (`src/proxy.ts`)
- [x] No secrets in client bundle
- [x] Error messages don't leak sensitive data

---

**Last Updated:** February 7, 2026
**Deployment Platform:** Vercel
**Framework:** Next.js 16.1.6
**Status:** ✅ Production Ready
