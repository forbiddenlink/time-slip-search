/** @jest-environment node */
import { describe, it, expect } from '@jest/globals'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const config = require('../next-sitemap.config.js')

describe('next-sitemap config', () => {
  it('excludes API routes and the manifest', () => {
    expect(config.exclude).toEqual(
      expect.arrayContaining(['/api/*', '/manifest.webmanifest'])
    )
  })

  it('lists every real public page', async () => {
    const stub = {
      transform: async (_c: unknown, loc: string) => ({ loc: `https://example.com${loc}` }),
    }
    const extra = await config.additionalPaths(stub)
    const locs = extra.map((e: { loc: string }) => new URL(e.loc).pathname)
    expect(locs).toEqual(
      expect.arrayContaining(['/', '/about', '/contact', '/privacy-policy'])
    )
  })
})
