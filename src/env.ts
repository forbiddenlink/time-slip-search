import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    ALGOLIA_ADMIN_API_KEY: z.string().min(1),
    ALGOLIA_APP_ID: z.string().optional(),
    ALGOLIA_SEARCH_API_KEY: z.string().min(1),
    AXIOM_TOKEN: z.string().min(1).optional(),
    FRED_API_KEY: z.string().min(1),
    GROQ_API_KEY: z.string().min(1),
    MINIMAX_API_KEY: z.string().min(1),
    MINIMAX_GROUP_ID: z.string().optional(),
    TMDB_API_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_ALGOLIA_APP_ID: z.string().optional(),
    NEXT_PUBLIC_AXIOM_DATASET: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1),
  },
  runtimeEnv: {
    ALGOLIA_ADMIN_API_KEY: process.env.ALGOLIA_ADMIN_API_KEY,
    ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
    ALGOLIA_SEARCH_API_KEY: process.env.ALGOLIA_SEARCH_API_KEY,
    AXIOM_TOKEN: process.env.AXIOM_TOKEN,
    FRED_API_KEY: process.env.FRED_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    MINIMAX_API_KEY: process.env.MINIMAX_API_KEY,
    MINIMAX_GROUP_ID: process.env.MINIMAX_GROUP_ID,
    NEXT_PUBLIC_ALGOLIA_APP_ID: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    NEXT_PUBLIC_AXIOM_DATASET: process.env.NEXT_PUBLIC_AXIOM_DATASET,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    TMDB_API_KEY: process.env.TMDB_API_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
