/**
 * Wikimedia / Wikipedia API integration for time-slip-search
 * Enriches historical search results with Wikipedia summaries,
 * on-this-day events, and historical images.
 *
 * Uses the public Wikimedia REST API — no API key required.
 * https://en.wikipedia.org/api/rest_v1/
 * https://api.wikimedia.org/wiki/Feed_API/Reference/On_this_day
 */

const WIKI_REST = "https://en.wikipedia.org/api/rest_v1";
const WIKI_FEED = "https://api.wikimedia.org/feed/v1/wikipedia/en";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WikiSummary {
  title: string;
  description: string | null;
  extract: string;
  thumbnail?: { source: string; width: number; height: number };
  content_urls: { desktop: { page: string } };
  timestamp: string;
}

export interface OnThisDayEvent {
  year: number;
  text: string;
  pages: WikiSummary[];
}

export interface OnThisDayResponse {
  births: OnThisDayEvent[];
  deaths: OnThisDayEvent[];
  events: OnThisDayEvent[];
  holidays: OnThisDayEvent[];
  selected: OnThisDayEvent[];
}

// ─── Wikipedia Summary ────────────────────────────────────────────────────────

/**
 * Get the Wikipedia summary for a page title.
 */
export async function getWikiSummary(
  title: string,
  signal?: AbortSignal,
): Promise<WikiSummary | null> {
  const encoded = encodeURIComponent(title.replace(/ /g, "_"));
  try {
    const res = await fetch(`${WIKI_REST}/page/summary/${encoded}`, {
      signal,
      headers: { Accept: "application/json; charset=utf-8" },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Search Wikipedia for pages matching a query.
 */
export async function searchWikipedia(
  query: string,
  limit = 5,
  signal?: AbortSignal,
): Promise<WikiSummary[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  try {
    const res = await fetch(`${WIKI_REST}/page/search/title?${params}`, {
      signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.pages ?? [];
  } catch {
    return [];
  }
}

// ─── On This Day ─────────────────────────────────────────────────────────────

/**
 * Get "On this day" events for a given month/day.
 * @param month - 1-12
 * @param day - 1-31
 * @param type - 'all' | 'selected' | 'births' | 'deaths' | 'events' | 'holidays'
 */
export async function getOnThisDay(
  month: number,
  day: number,
  type: keyof OnThisDayResponse | "all" = "all",
  signal?: AbortSignal,
): Promise<Partial<OnThisDayResponse>> {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const segment = type === "all" ? "all" : type;

  try {
    const res = await fetch(`${WIKI_FEED}/onthisday/${segment}/${mm}/${dd}`, {
      signal,
      headers: {
        Accept: "application/json",
        "Api-User-Agent":
          "TimeSlipSearch/1.0 (https://github.com/forbiddenlink)",
      },
    });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

/**
 * Get historical context for a specific year.
 * Returns a mix of key events from that year's Wikipedia "year" article.
 */
export async function getYearContext(
  year: number,
  signal?: AbortSignal,
): Promise<{ summary: WikiSummary | null }> {
  const summary = await getWikiSummary(String(year), signal);
  return { summary };
}

// ─── Enrichment ───────────────────────────────────────────────────────────────

/**
 * Enrich a time-slip search result with historical context.
 * Given a parsed date, returns on-this-day events and year context.
 */
export async function enrichWithHistoricalContext(
  date: Date,
  signal?: AbortSignal,
): Promise<{
  onThisDay: OnThisDayEvent[];
  births: OnThisDayEvent[];
  deaths: OnThisDayEvent[];
  yearSummary: WikiSummary | null;
}> {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  const [onThisDayData, yearContext] = await Promise.all([
    getOnThisDay(month, day, "all", signal),
    getYearContext(year, signal),
  ]);

  // Filter events to those from the specific year (or nearby years for context)
  const yearEvents = (onThisDayData.events ?? []).filter(
    (e) => Math.abs(e.year - year) <= 5,
  );

  return {
    onThisDay:
      yearEvents.length > 0
        ? yearEvents
        : (onThisDayData.selected ?? []).slice(0, 5),
    births: (onThisDayData.births ?? [])
      .filter((e) => Math.abs(e.year - year) <= 20)
      .slice(0, 3),
    deaths: (onThisDayData.deaths ?? [])
      .filter((e) => Math.abs(e.year - year) <= 20)
      .slice(0, 3),
    yearSummary: yearContext.summary,
  };
}
