# TimeSlipSearch

A conversational cultural time machine. Type a date, birthday, or loose phrase ("summer of 69")
and it assembles a cultural snapshot: Billboard #1 song, movies in theaters, historical prices
(gas, CPI, minimum wage), and notable events. Live: https://timeslipsearch.vercel.app

## Stack

- Next.js 16 (App Router), React 19, TypeScript 6, `next build --webpack` (not the default
  Turbopack build)
- Tailwind CSS 4
- Search: Algolia (`algoliasearch`), all historical data indexed there
- Caching / rate limiting: Upstash Redis, falls back to in-memory when unconfigured
- Background jobs: Trigger.dev
- Observability: Sentry, Axiom (`next-axiom`), Langfuse
- Analytics: Vercel Analytics + Speed Insights
- Testing: Jest (jsdom) + Testing Library + MSW; Vitest and vite are devDependencies but no
  vitest config or `*.vitest.*` script exists, so they are unused in practice
- Package manager: pnpm (`packageManager: pnpm@10.32.1` in package.json)
- Deploy: Vercel (`vercel.json` pins region `iad1`, framework `nextjs`)

## Commands

```bash
pnpm dev              # dev server
pnpm build            # production build (webpack), then next-sitemap via postbuild
pnpm start            # run production build
pnpm lint             # next lint (ESLint, not Biome - see Gotchas)
pnpm test             # jest
pnpm test:watch
pnpm test:coverage
pnpm analyze          # ANALYZE=true next build, bundle analyzer

pnpm ingest:billboard # populate Algolia from Billboard Hot 100 dataset
pnpm ingest:tmdb      # populate Algolia from TMDB
pnpm ingest:fred      # populate Algolia from FRED (gas/CPI/minimum wage)
pnpm ingest:wikimedia # populate Algolia from Wikimedia "on this day"
```

CI (`.github/workflows/ci.yml`) runs lint, `tsc --noEmit`, and build on push/PR to `main`, but
lint and type-check steps are `continue-on-error: true` and jest is not run in CI at all.

## Layout

- `src/app/` - routes (App Router). `src/app/api/chat`, `src/app/api/og`, `src/app/api/og/wrapped`,
  `src/app/api/timeline/density`. Also `about`, `contact`, `privacy-policy` pages.
- `src/components/` - grouped by feature: `achievements/`, `animations/`, `chat/`, `filters/`,
  `home/`, `icons/`, `input/`, `layout/`, `memory/`, `results/`, `search/`, `share/`, `ui/`,
  `visualizations/`, `wrapped/`
- `src/lib/` - core logic: `date-parser.ts` / `historical-date-parser.ts` (chrono-node),
  `algolia.ts`, `temporal-search.ts`, `upstash.ts`, `rate-limit.ts`, `cache.ts`, `logger.ts`,
  `achievements.ts`, `wrapped.ts`, `agent-memory.ts`, `era-narratives.ts`, `ai-insights.ts`,
  `safe-action.ts` (next-safe-action), `spotify.ts`, `share.ts`, `url-state.ts`
- `src/hooks/`, `src/mocks/` (MSW), `src/trigger/` (Trigger.dev tasks)
- `scripts/ingest/` - standalone data-ingest scripts run with `npx tsx`, not part of the app build
- `__tests__/` - jest specs (`__tests__/api/chat.test.ts`, `date-parser.test.ts`,
  `rate-limit.test.ts`, `achievements.test.ts`); `__mocks__/` has jest style/file mocks
- `@/*` path alias maps to `src/*` (tsconfig + jest moduleNameMapper)
- `lib/wikimedia.ts` at repo root is a separate, unreferenced Wikimedia API wrapper - see Gotchas

## Conventions

- Server Components by default; `"use client"` only where needed
- TypeScript strict mode (`strict: true`, `noUncheckedIndexedAccess: true`)
- Env vars validated via `@t3-oss/env-nextjs` in `src/env.ts` (zod schema) - this is the source of
  truth for required/optional vars, not the README
- ESLint via `eslint-config-next` (`next/core-web-vitals`); no Prettier config found

## Env vars (names only, see `src/env.ts`)

Server: `ALGOLIA_ADMIN_API_KEY`, `ALGOLIA_SEARCH_API_KEY` (required), `ALGOLIA_APP_ID`,
`AXIOM_TOKEN` (optional), `FRED_API_KEY`, `TMDB_API_KEY`, `GROQ_API_KEY`, `MINIMAX_API_KEY`
(required), `MINIMAX_GROUP_ID` (optional).
Client: `NEXT_PUBLIC_ALGOLIA_APP_ID`, `NEXT_PUBLIC_AXIOM_DATASET` (optional),
`NEXT_PUBLIC_POSTHOG_HOST` (optional), `NEXT_PUBLIC_POSTHOG_KEY` (required).
`SKIP_ENV_VALIDATION=true` bypasses the schema (used in CI's build step).

## Gotchas

- `biome.json` exists at repo root but Biome is not a dependency, not in the lockfile, and
  nothing runs it - `pnpm lint` uses ESLint/`next lint`. Treat the Biome config as dead.
- `src/env.ts` requires `GROQ_API_KEY`, `MINIMAX_API_KEY`, and `NEXT_PUBLIC_POSTHOG_KEY`, but
  none of the three appear anywhere else in `src/` or `scripts/`, and the README's "required
  environment variables" list omits all three. Validation will fail without them unless
  `SKIP_ENV_VALIDATION` is set.
- Root-level `lib/wikimedia.ts` duplicates the Wikimedia integration but is not imported by
  anything in `src/` or `scripts/`; the live path is `scripts/ingest/wikimedia.ts`.
- `pnpm build` uses `next build --webpack` explicitly, not Next 16's default Turbopack build.
