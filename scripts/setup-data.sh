#!/bin/bash
# Setup script to initialize TimeSlipSearch data

echo "🚀 TimeSlipSearch Data Setup"
echo "============================="
echo ""

# Check environment variables
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found. Please create it first."
    exit 1
fi

echo "✅ Found .env.local"
echo ""

# Billboard data (no API key needed)
echo "📊 Step 1/4: Ingesting Billboard Hot 100 data..."
echo "This will download ~60 years of chart data and may take a few minutes..."
npm run ingest:billboard

if [ $? -ne 0 ]; then
    echo "❌ Billboard ingestion failed"
    exit 1
fi

echo ""
echo "✅ Billboard data indexed!"
echo ""

# TMDB data (requires API key)
echo "🎬 Step 2/4: Ingesting movie data from TMDB..."
echo "This requires a TMDB API key in .env.local"
npm run ingest:tmdb

if [ $? -ne 0 ]; then
    echo "⚠️  TMDB ingestion failed - check your TMDB_API_KEY in .env.local"
fi

echo ""

# FRED data (requires API key)
echo "💵 Step 3/4: Ingesting economic data from FRED..."
echo "This requires a FRED API key in .env.local"
npm run ingest:fred

if [ $? -ne 0 ]; then
    echo "⚠️  FRED ingestion failed - check your FRED_API_KEY in .env.local"
fi

echo ""

# Wikimedia data
echo "📰 Step 4/4: Ingesting historical events from Wikimedia..."
npm run ingest:wikimedia

if [ $? -ne 0 ]; then
    echo "⚠️  Wikimedia ingestion failed"
fi

echo ""
echo "================================"
echo "✨ Setup Complete!"
echo "================================"
echo ""
echo "Run the diagnostic check:"
echo "  npx tsx scripts/check-algolia.ts"
echo ""
echo "Start the dev server:"
echo "  npm run dev"
echo ""
